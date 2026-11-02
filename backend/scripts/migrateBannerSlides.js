/**
 * Migration Script: Clear obsolete composite banner slides for a fresh start.
 * 
 * Usage:
 *   Dry run (default, no writes):
 *     node backend/scripts/migrateBannerSlides.js
 *     node backend/scripts/migrateBannerSlides.js --dry-run
 * 
 *   Apply migration (creates automatic JSON backup before write):
 *     node backend/scripts/migrateBannerSlides.js --apply
 * 
 * Rollback:
 *   node backend/scripts/migrateBannerSlides.js --rollback <path-to-backup-json>
 */

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const HomepageBanner = require('../models/HomepageBanner');
const cacheService = require('../services/cacheService');

const isApply = process.argv.includes('--apply');
const rollbackArgIndex = process.argv.indexOf('--rollback');
const isRollback = rollbackArgIndex !== -1 && process.argv[rollbackArgIndex + 1];

const BACKUP_DIR = path.join(__dirname, 'backups');

const run = async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/internationaltijarat';
    console.log('🔗 Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    try {
        if (isRollback) {
            const backupFile = process.argv[rollbackArgIndex + 1];
            console.log(`\n🔄 ROLLBACK MODE: Restoring from ${backupFile}...`);
            if (!fs.existsSync(backupFile)) {
                throw new Error(`Backup file not found: ${backupFile}`);
            }
            const rawData = fs.readFileSync(backupFile, 'utf8');
            const backupDoc = JSON.parse(rawData);

            await HomepageBanner.findOneAndUpdate(
                {},
                { $set: { slides: backupDoc.slides || [], lastUpdated: new Date() } },
                { upsert: true, new: true }
            );

            await cacheService.clearPattern('cache:*/banner*');
            await cacheService.del('homepage_banner');
            await cacheService.del('cache:/api/homepage/all-data');

            console.log(`✅ Rollback successful. Restored ${(backupDoc.slides || []).length} slides.`);
            return;
        }

        const bannerDoc = await HomepageBanner.findOne().lean();
        const currentSlides = bannerDoc?.slides || [];

        console.log('\n================ BANNER MIGRATION DIAGNOSTIC ================');
        console.log(`Current HomepageBanner document found: ${bannerDoc ? 'YES' : 'NO'}`);
        console.log(`Total existing slides: ${currentSlides.length}`);
        currentSlides.forEach((s, idx) => {
            console.log(`  [Slide ${idx + 1}] ID: ${s._id} | Title: "${s.title || ''}" | Has PrimaryProduct: ${!!s.primaryProduct} | Has Image: ${!!(s.imageFilename || s.image)}`);
        });
        console.log('=============================================================\n');

        if (!isApply) {
            console.log('🔍 [DRY RUN MODE] No database writes will be executed.');
            console.log(`  - Would back up original document to ${BACKUP_DIR}/banner_backup_<timestamp>.json`);
            console.log(`  - Would clear all ${currentSlides.length} obsolete composite slide(s) to allow a fresh start.`);
            console.log('  - Would clear banner caches (homepage_banner, /api/homepage/all-data).');
            console.log('\nℹ️ To execute this migration, re-run with:');
            console.log('   node backend/scripts/migrateBannerSlides.js --apply\n');
            return;
        }

        // Apply mode: Create backup first
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(BACKUP_DIR, `banner_backup_${timestamp}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(bannerDoc || {}, null, 2), 'utf8');
        console.log(`📦 Backup written to: ${backupPath}`);

        // Perform clean slate reset
        await HomepageBanner.findOneAndUpdate(
            {},
            { $set: { slides: [], lastUpdated: new Date() } },
            { upsert: true, new: true }
        );

        // Clear caches
        await cacheService.clearPattern('cache:*/banner*');
        await cacheService.del('homepage_banner');
        await cacheService.del('cache:/api/homepage/all-data');

        console.log('✅ Migration applied successfully.');
        console.log('   - Obsolete composite slides removed.');
        console.log('   - Database is clean and ready for fresh slide creation via admin panel.');
        console.log(`   - To rollback at any time: node backend/scripts/migrateBannerSlides.js --rollback "${backupPath}"\n`);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
    }
};

run().catch((err) => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
});
