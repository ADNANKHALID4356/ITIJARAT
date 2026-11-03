# Antigravity.md — International Tijarat Context File
**Last Updated:** 2026-11-02  
**Status:** Feature implementation completed on branch `feature/banner-slides-v2`. Ready for database migration apply and browser QA.

---

## Project Overview

**International Tijarat** is a full-stack e-commerce platform (B2B/B2C marketplace) built with React + Vite (frontend) and Node.js/Express + MongoDB (backend). It includes a customer-facing storefront, a vendor portal, and an admin panel.

**Tech Stack:**
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6, Tailwind CSS 4, MUI (Material-UI) v7, React Router v6, React Query v5, Axios |
| Backend | Node.js 22, Express 4, Mongoose 8 (MongoDB) |
| Image processing | `sharp`, `multer` (upload), watermark service |
| Caching | In-memory cache (no Redis configured locally); Cloudflare CDN |
| Auth | JWT (`jsonwebtoken`), stored in `localStorage` (`adminToken`, `vendorToken`, `token`) |
| Drag-and-drop | `react-dnd` + `react-dnd-html5-backend` (already installed) |
| Notifications | `react-toastify`, `react-hot-toast` |
| Email | `nodemailer` (dev: simulated) |

---

## Architecture & Folder Structure

```
/IT (project root)
├── backend/
│   ├── api.js                    ← Express app entry (routes & uploads static middleware wired here)
│   ├── models/
│   │   └── HomepageBanner.js     ← Mongoose schema for banner slides
│   ├── routes/
│   │   ├── bannerRoutes.js       ← Granular CRUD & reorder routes (/api/banner)
│   │   └── homepageOptimized.js  ← Parallel aggregate endpoint (/api/homepage/all-data)
│   ├── middleware/
│   │   ├── auth.js               ← authenticateToken, authenticateAdmin
│   │   └── uploadMiddleware.js   ← multer configs (uploadBannerSlide -> uploads/banner-slides/)
│   ├── services/
│   │   ├── cacheService.js       ← in-memory cache
│   │   └── cloudflarePurge.js    ← purgeCloudflareUrls()
│   ├── uploads/
│   │   └── banner-slides/        ← Dedicated banner creative image uploads
│   └── scripts/
│       └── migrateBannerSlides.js← Idempotent migration script with automatic pre-write backup
└── frontend/
    └── src/
        ├── api.js                ← Axios instance (baseURL = config.API_BASE_URL)
        ├── config.js             ← config object, getImageUrl() with 'banner-slides' mapping
        ├── pages/
        │   └── Home.jsx          ← fetches /api/homepage/all-data via React-Query
        └── components/
            ├── HeroSection.jsx   ← Public hero carousel (smooth translateX slide, seamless infinite loop)
            ├── LazyImage.jsx     ← Optimized img with WebP/AVIF, lazy-load
            └── admin/homepage/   ← Admin panel components
                ├── index.js      ← Exports BannerManagement
                ├── BannerManagement.jsx  ← Admin banner list (drag-and-drop, up/down arrows, toggle)
                ├── BannerSlideForm.jsx   ← Add/edit modal with client image preview & validation
                └── BannerPreviewModal.jsx← Live homepage-fidelity preview modal
```

---

## Banner Module — File Map (Current State)

| File | Status | Purpose |
|---|---|---|
| `backend/models/HomepageBanner.js` | Active | DB schema — singleton doc with `slides[]` (`imageFilename`, `title`, `subtitle`, `buttonText`, `linkUrl`, `isActive`, `order`) |
| `backend/routes/bannerRoutes.js` | Active | Granular REST API mounted at `/api/banner` and `/api/homepage/banners` |
| `backend/api.js` | Active | Consolidates routes, adds `bannerSlides` to `UPLOAD_DIRS` & static CORS |
| `backend/routes/homepageOptimized.js` | Active | `GET /api/homepage/all-data` — feeds public `HeroSection` with active slides |
| `backend/middleware/uploadMiddleware.js` | Active | `uploadBannerSlide` (5 MB, JPEG/PNG/WebP/AVIF/GIF) saving to `uploads/banner-slides/` |
| `backend/scripts/migrateBannerSlides.js` | Active | Dry-run & apply migration with automated JSON rollback |
| `frontend/src/components/admin/homepage/BannerManagement.jsx` | Active | Rewritten admin UI with drag/drop, order arrows, active toggle, add/edit/delete |
| `frontend/src/components/admin/homepage/BannerSlideForm.jsx` | Active | Modal dialog for creating/editing slide with live preview and validation |
| `frontend/src/components/admin/homepage/BannerPreviewModal.jsx` | Active | Modal preview embedding `HeroSection` with `hideCards={true}` |
| `frontend/src/components/admin/homepage/index.js` | Active | Exports rewritten `BannerManagement` |
| `frontend/src/components/HeroSection.jsx` | Active | Public hero carousel with continuous CSS slide, seamless infinite loop, pause on hover/touch |
| `frontend/src/pages/Home.jsx` | Active | Fetches homepage data; passes active banners to `HeroSection` |
| `frontend/src/config.js` | Active | `IMAGE_PATHS` includes `'banner-slides'` and `'banner'` aliases |

---

## New Data Model

```
HomepageBanner (singleton document)
└── slides[]: {
      title: String (optional, trimmed),
      subtitle: String (optional, trimmed),
      buttonText: String (optional, trimmed, e.g. "Shop now"),
      imageFilename: String (required, e.g. "banner-174100-abc.jpg"),
      linkUrl: String (optional, internal /path or external https://),
      isActive: Boolean (default true),
      order: Number (default 0),
      // Backwards-compatibility fields retained for safe rollback:
      image: String,
      category: ObjectId,
      primaryProduct: Mixed,
      secondaryProducts: [Mixed]
    }
```

**API Endpoints:**
- `GET /api/banner` — Public returns active slides; `?all=true` returns all slides (for admin).
- `POST /api/banner/slides` — `[authenticateAdmin, uploadBannerSlide]` creates a slide.
- `PUT /api/banner/slides/:id` — `[authenticateAdmin, uploadBannerSlide]` updates a slide.
- `DELETE /api/banner/slides/:id` — `authenticateAdmin` deletes slide and cleans up disk image.
- `POST /api/banner/slides/reorder` — `authenticateAdmin` updates slide ordering from an array of IDs.
- `GET /api/homepage/all-data` — Aggregates active banner slides for `Home.jsx`.

---

## Code Conventions Found in the Codebase

| Convention | Detail |
|---|---|
| API base URL | `config.API_BASE_URL` = `${BASE_URL}/api` |
| Image URL helper | `getImageUrl('banner-slides', filename)` — maps to `/uploads/banner-slides/filename` |
| Admin auth | `localStorage.getItem('adminToken')` — attached by Axios interceptor |
| Cache invalidation | `cacheService.del()` + `cacheService.clearPattern()` + `purgeCloudflareUrls()` called on every banner mutation |
| Styling | Tailwind CSS for public components; MUI (`sx` prop) for admin components |
| Notifications | `react-toastify` (`toast.success()`, `toast.error()`, `toast.info()`) in admin |
| Drag-and-drop | `react-dnd` (`HTML5Backend`) with tactile Up/Down arrow buttons for mobile accessibility |

---

## Decisions Made

1. **Slide link** = manually typed URL in admin. Internal `/path` → React Router `<Link>`. External `http…` → `<a target="_blank" rel="noopener noreferrer">`.
2. **Image storage** = local disk in dev (`uploads/banner-slides/`); cloud directory mount in production. Zero new infrastructure needed.
3. **Data migration** = fresh start. Old composite product slides are wiped by `migrateBannerSlides.js` after automated backup.
4. **Slide count cap** = 20 by default (configurable via `MAX_BANNER_SLIDES` env var).
5. **No third-party carousel library** = pure React + CSS `translateX` with boundary-teleporting infinite loop.
6. **Accessibility** = `role="region"`, `aria-roledescription="carousel"`, `aria-live`, pause on hover/touch, and `prefers-reduced-motion` compliance.

---

## Commands

```powershell
# Start backend (from project root)
cd backend; npm start   # → http://localhost:3001

# Start frontend dev server (separate terminal)
cd frontend; npm run dev  # → http://localhost:5173

# Build frontend for production
cd frontend; npm run build

# Run migration script dry-run
cd backend; node scripts/migrateBannerSlides.js

# Apply migration (creates backup automatically)
cd backend; node scripts/migrateBannerSlides.js --apply

# Rollback migration if needed
cd backend; node scripts/migrateBannerSlides.js --rollback "backend/scripts/backups/<backup-file>.json"
```

---

## Known Gotchas

1. **`backend/.env` file required** — Copy from `.env.template` and provide `MONGODB_URI` and `JWT_SECRET` before starting the backend.
2. **Cache invalidation** — When testing in production, Cloudflare cache is automatically purged on mutation. In development, browser hard refresh (`Ctrl + Shift + R`) clears any local asset cache.
3. **Multer field name** — The slide creation/update endpoint expects the single image file to be uploaded under field name `image`.

---

## Featured Products Bento Grid — Architecture & Implementation

**Feature Status:** Implementation & QA Complete on branch `feature/featured-bento`.  
**Branch:** `feature/featured-bento`  
**Target:** Transformed the Homepage "Featured Products" section into an editorial, interlocking **Bento Grid** with Hero (2x2), Wide (2x1), Tall (1x2), and Small (1x1) tiles adhering strictly to image-only presentation.

### 1. Active File Map

| Layer | File Path | Status / Role |
|---|---|---|
| **Admin Route View** | `frontend/src/pages/Admin/homepage/index.jsx` | Renders `tabs` including `'featured'`; instantiates `<FeaturedProductsManager />` |
| **Admin Wrapper** | `frontend/src/components/admin/homepage/FeaturedProductsManager.jsx` | Returns `<SpecialProductsManager type="featured" />` |
| **Admin Studio** | `frontend/src/components/admin/homepage/SpecialProductsManager.jsx` | Product search, thumbnail cards, tactile up/down reordering, tile size selector, and live image-only WYSIWYG Bento preview |
| **Public Host** | `frontend/src/pages/Home.jsx` | Mounts `<FeaturedBentoGrid>` directly beneath `<CategoryCarousel />` and above `<PremiumProductDisplay />` |
| **Public Bento Grid**| `frontend/src/components/FeaturedBentoGrid.jsx` | 4-column responsive CSS grid engine with per-count zero-gap presets and responsive collapse |
| **Image-Only Tile** | `frontend/src/components/BentoImageTile.jsx` | Pure image presentation (no visible text), accessible link, out-of-stock visual cue, and missing image fallback |
| **Design Tokens** | `frontend/src/config/bentoConfig.js` | Gutters, radii, per-count span presets ($1, 2, 3, 4, 5, 6, 7, 8, 12, 20+$) |
| **Aggregate Route** | `backend/routes/homepageOptimized.js` | Feeds `/api/homepage/all-data` with ordered products, `stock`, and `layoutConfig` |
| **REST Admin API** | `backend/api.js` (L408–570) | `GET /api/special/featured`, `PUT /api/special/featured` with dual-field persistence and validation |
| **DB Model (Active)** | `backend/models/FeaturedProducts.js` | Mongoose schema with `products: [ObjectId]` and optional `layoutConfig: [{ productId, slotSize, order }]` |

### 2. Key Architecture Decisions

1. **Standalone Public Section vs Tabbed Container:**
   - `<FeaturedBentoGrid>` will be extracted into a dedicated, visually prominent homepage section placed directly beneath the Category Carousel and above `<PremiumProductDisplay>`, giving featured items true editorial presence.
2. **Pure CSS Grid Engine (Zero Bundle Bloat):**
   - Utilizes Tailwind CSS Grid (`grid-cols-4 auto-rows-[220px] gap-4 md:gap-6`) with mathematical interlocking presets ($1, 3, 5, 7, 9+$ items) rather than heavy JavaScript packing libraries (no Packery, Masonry, or Muuri). Guarantees zero Cumulative Layout Shift (CLS < 0.05).
3. **100% Backward-Compatible Schema Evolution:**
   - Preserves `products: [ObjectId]` in `FeaturedProducts` for standard operation.
   - Adds an optional `layoutConfig` array (`{ productId: ObjectId, slotSize: 'hero' | 'wide' | 'tall' | 'small', order: Number }`). If `layoutConfig` is absent or unconfigured, an automated layout algorithm maps the first product to Hero (2x2) and subsequent products to Wide/Tall/Small tiles seamlessly.
4. **Enhanced Projection in Aggregate Endpoint:**
   - `backend/routes/homepageOptimized.js` currently restricts projection to `title price image discount rating slug`. Plan expands projection to include `description originalPrice category stock` for rich Hero tile display.
5. **Admin Bento Studio:**
   - Upgrades `<SpecialProductsManager>` to include interactive slot assignment, tactile drag-and-drop reordering (`react-dnd`), and live WYSIWYG preview matching public bento geometry.

### 3. Known Gotchas & Constraints

1. **Query Reversal in `homepageOptimized.js`:**
   - Line 296 currently performs `[...featuredProducts.products].reverse()`. Admin reorder persistence must either align with this or update the endpoint to honor explicit `order` index.
2. **Missing Product Schema Fields:**
   - `rating` and `reviewsCount` do not exist on the Mongoose `Product` schema. The Bento tiles must gracefully omit star ratings or render fallbacks when these fields are null.
3. **Style Guide Compliance:**
   - Strict typography rule: prices must remain non-bold (`font-sans font-normal`) per project `.product-price` styling standards. Primary headings use `font-serif font-bold`.

