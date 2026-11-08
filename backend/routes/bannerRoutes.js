const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const HomepageBanner = require('../models/HomepageBanner');
const { authenticateAdmin } = require('../middleware/auth');
const { uploadBannerImage, uploadBannerSlide } = require('../middleware/uploadMiddleware');
const cacheService = require('../services/cacheService');
const { purgeCloudflareUrls } = require('../services/cloudflarePurge');

// Configuration constants
const BANNER_CACHE = 3600; // 1 hour
const MAX_BANNER_SLIDES = parseInt(process.env.MAX_BANNER_SLIDES, 10) || 20;
const BANNER_UPLOADS_DIR = path.join(__dirname, '../uploads/banner-slides');

// Helper to clear all banner-related server and edge caches
const clearBannerCaches = async () => {
    try {
        await cacheService.clearPattern('*banner*');
        await cacheService.clearPattern('cache:*banner*');
        await cacheService.del('cache:/api/banner');
        await cacheService.del('cache:/api/banner?all=true');
        await cacheService.del('cache:/api/homepage/banners');
        await cacheService.del('cache:/api/homepage/banners?all=true');
        await cacheService.del('homepage_banner');
        await cacheService.del('cache:/api/homepage/all-data');

        const siteUrl = process.env.SITE_URL || 'https://internationaltijarat.com';
        purgeCloudflareUrls([
            `${siteUrl}/api/homepage/all-data`,
            `${siteUrl}/api/banner`,
            `${siteUrl}/`
        ]);
    } catch (err) {
        console.warn('⚠️ Warning clearing banner caches:', err.message);
    }
};

// Helper to format slide for API response (normalizes imageFilename and image)
const formatSlide = (slide) => {
    const s = slide.toObject ? slide.toObject() : { ...slide };
    const filename = s.imageFilename || s.image || '';
    return {
        ...s,
        imageFilename: filename,
        image: filename,
        isActive: s.isActive !== false,
        order: typeof s.order === 'number' ? s.order : 0
    };
};

/**
 * GET /api/banner
 * Public & Admin: Fetch all slides (sorted by order)
 * Query: ?all=true returns both active and inactive slides (used by admin UI)
 * NOTE: Admin requests (?all=true or with auth) bypass cache to ensure real-time CRUD visibility.
 */
router.get('/', (req, res, next) => {
    const isAdminRequest = req.query.all === 'true' || req.query.admin === 'true' || !!req.headers.authorization;
    if (isAdminRequest) {
        res.set({
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        return next();
    }
    return cacheService.middleware(BANNER_CACHE)(req, res, next);
}, async (req, res) => {
    try {
        const showAll = req.query.all === 'true' || req.query.admin === 'true';
        const banner = await HomepageBanner.findOne().populate('slides.category');
        
        if (!banner || !banner.slides) {
            return res.json([]);
        }

        let slides = banner.slides.sort((a, b) => (a.order || 0) - (b.order || 0));

        if (!showAll) {
            slides = slides.filter(slide => slide.isActive !== false);
        }

        res.json(slides.map(formatSlide));
    } catch (error) {
        console.error('❌ Error fetching banners:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/banner/slides
 * Admin only: Create a single slide (with image upload)
 */
router.post('/slides', [authenticateAdmin, uploadBannerSlide], async (req, res) => {
    try {
        let banner = await HomepageBanner.findOne();
        if (!banner) {
            banner = new HomepageBanner({ slides: [] });
        }

        if (banner.slides.length >= MAX_BANNER_SLIDES) {
            return res.status(400).json({
                message: `Maximum slide limit of ${MAX_BANNER_SLIDES} reached. Delete or deactivate existing slides first.`
            });
        }

        // Image must come from file upload or imageFilename body field
        const uploadedFilename = req.file ? req.file.filename : req.body.imageFilename;
        if (!uploadedFilename) {
            return res.status(400).json({ message: 'Banner slide image is required.' });
        }

        const maxOrder = banner.slides.reduce((max, s) => Math.max(max, s.order || 0), -1);
        const order = req.body.order !== undefined ? Number(req.body.order) : maxOrder + 1;

        const newSlide = {
            title: req.body.title ? String(req.body.title).trim() : '',
            subtitle: req.body.subtitle ? String(req.body.subtitle).trim() : '',
            buttonText: req.body.buttonText ? String(req.body.buttonText).trim() : '',
            linkUrl: req.body.linkUrl ? String(req.body.linkUrl).trim() : '',
            imageFilename: uploadedFilename,
            image: uploadedFilename, // backward compatibility
            isActive: req.body.isActive === undefined ? true : (req.body.isActive === true || req.body.isActive === 'true'),
            order: isNaN(order) ? 0 : order
        };

        banner.slides.push(newSlide);
        banner.lastUpdated = new Date();
        await banner.save();

        await clearBannerCaches();

        const createdSlide = banner.slides[banner.slides.length - 1];
        res.status(201).json(formatSlide(createdSlide));
    } catch (error) {
        console.error('❌ Error creating banner slide:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * PUT /api/banner/slides/:id
 * Admin only: Update a single slide by id (with optional new image)
 */
router.put('/slides/:id', [authenticateAdmin, uploadBannerSlide], async (req, res) => {
    try {
        const banner = await HomepageBanner.findOne();
        if (!banner) {
            return res.status(404).json({ message: 'Banner document not found.' });
        }

        const slide = banner.slides.id(req.params.id);
        if (!slide) {
            return res.status(404).json({ message: 'Slide not found.' });
        }

        // If new image uploaded, replace filename and remove old file if exists
        if (req.file) {
            const oldFilename = slide.imageFilename || slide.image;
            if (oldFilename && oldFilename !== req.file.filename) {
                const oldPath = path.join(BANNER_UPLOADS_DIR, oldFilename);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch (e) { /* ignore deletion error */ }
                }
            }
            slide.imageFilename = req.file.filename;
            slide.image = req.file.filename;
        } else if (req.body.imageFilename) {
            slide.imageFilename = req.body.imageFilename;
            slide.image = req.body.imageFilename;
        }

        if (req.body.title !== undefined) slide.title = String(req.body.title).trim();
        if (req.body.subtitle !== undefined) slide.subtitle = String(req.body.subtitle).trim();
        if (req.body.buttonText !== undefined) slide.buttonText = String(req.body.buttonText).trim();
        if (req.body.linkUrl !== undefined) slide.linkUrl = String(req.body.linkUrl).trim();
        if (req.body.isActive !== undefined) {
            slide.isActive = req.body.isActive === true || req.body.isActive === 'true';
        }
        if (req.body.order !== undefined) {
            const orderNum = Number(req.body.order);
            if (!isNaN(orderNum)) slide.order = orderNum;
        }

        banner.lastUpdated = new Date();
        await banner.save();

        await clearBannerCaches();

        res.json(formatSlide(slide));
    } catch (error) {
        console.error('❌ Error updating banner slide:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * DELETE /api/banner/slides/:id
 * Admin only: Delete a slide by ID and remove image file
 */
router.delete('/slides/:id', authenticateAdmin, async (req, res) => {
    try {
        const banner = await HomepageBanner.findOne();
        if (!banner) {
            return res.status(404).json({ message: 'Banner document not found.' });
        }

        const slide = banner.slides.id(req.params.id);
        if (!slide) {
            return res.status(404).json({ message: 'Slide not found.' });
        }

        // Remove image file from disk if present
        const filename = slide.imageFilename || slide.image;
        if (filename) {
            const filePath = path.join(BANNER_UPLOADS_DIR, filename);
            if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
            }
        }

        banner.slides.pull({ _id: req.params.id });
        banner.lastUpdated = new Date();
        await banner.save();

        await clearBannerCaches();

        res.json({ success: true, message: 'Slide deleted successfully.' });
    } catch (error) {
        console.error('❌ Error deleting banner slide:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/banner/slides/reorder
 * Admin only: Bulk update slide order
 * Body: { order: [slideId1, slideId2, ...] }
 */
router.post('/slides/reorder', authenticateAdmin, async (req, res) => {
    try {
        const { order } = req.body;
        if (!Array.isArray(order)) {
            return res.status(400).json({ message: 'order must be an array of slide IDs.' });
        }

        const banner = await HomepageBanner.findOne();
        if (!banner) {
            return res.status(404).json({ message: 'Banner document not found.' });
        }

        // Apply new order based on array position
        order.forEach((id, index) => {
            const slide = banner.slides.id(id);
            if (slide) {
                slide.order = index;
            }
        });

        banner.lastUpdated = new Date();
        await banner.save();

        await clearBannerCaches();

        const sorted = banner.slides.sort((a, b) => (a.order || 0) - (b.order || 0));
        res.json(sorted.map(formatSlide));
    } catch (error) {
        console.error('❌ Error reordering slides:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * PUT /api/banner
 * Legacy bulk update: Updates all slides array at once (preserves backward compatibility)
 */
router.put('/', [authenticateAdmin, uploadBannerImage], async (req, res) => {
    try {
        const { slides } = req.body;
        if (!slides || !Array.isArray(slides)) {
            return res.status(400).json({ message: 'Slides array is required' });
        }

        // Process uploaded files if any
        if (req.files) {
            for (const slide of slides) {
                if (req.files[slide.image]) {
                    slide.image = req.files[slide.image].filename;
                    slide.imageFilename = req.files[slide.image].filename;
                }
            }
        }

        const processedSlides = slides.map((slide, index) => ({
            ...slide,
            imageFilename: slide.imageFilename || slide.image || '',
            image: slide.image || slide.imageFilename || '',
            order: typeof slide.order === 'number' ? slide.order : index
        }));

        const updatedBanner = await HomepageBanner.findOneAndUpdate(
            {},
            { $set: { slides: processedSlides, lastUpdated: new Date() } },
            { upsert: true, new: true }
        );

        await clearBannerCaches();

        res.json((updatedBanner.slides || []).map(formatSlide));
    } catch (error) {
        console.error('❌ Error updating banner slides (legacy PUT):', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
