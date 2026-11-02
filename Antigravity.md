# Antigravity.md — International Tijarat Context File
**Last Updated:** 2026-11-02  
**Status:** Analysis done; implementation not yet started.

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
│   ├── api.js                    ← Express app entry (all routes wired here)
│   ├── models/                   ← Mongoose schemas
│   ├── routes/                   ← Route handlers (modular)
│   ├── middleware/
│   │   ├── auth.js               ← authenticateToken, authenticateAdmin
│   │   └── uploadMiddleware.js   ← multer configs for all upload types
│   ├── services/
│   │   ├── cacheService.js       ← in-memory cache (Redis optional)
│   │   └── cloudflarePurge.js    ← purgeCloudflareUrls()
│   ├── uploads/                  ← local file storage (per type subdirectory)
│   └── scripts/                  ← one-off admin/migration scripts
└── frontend/
    └── src/
        ├── api.js                ← Axios instance (baseURL = config.API_BASE_URL)
        ├── config.js             ← config object, getImageUrl(), getApiUrl()
        ├── pages/
        │   └── Home.jsx          ← fetches /api/homepage/all-data via React-Query
        ├── components/
        │   ├── HeroSection.jsx   ← public banner carousel
        │   ├── LazyImage.jsx     ← optimized img with WebP/AVIF, lazy-load
        │   └── admin/homepage/   ← admin panel components
        │       ├── index.js      ← re-exports active components
        │       ├── BannerManagementNew.jsx  ← ACTIVE admin banner UI
        │       └── ...           ← other admin homepage tabs
        └── services/             ← API service modules (mostly unused in favour of direct Axios calls)
```

---

## Banner Module — File Map

| File | Status | Purpose |
|---|---|---|
| `backend/models/HomepageBanner.js` | Active | DB schema — singleton doc with `slides[]` |
| `backend/routes/bannerRoutes.js` | Active (but not mounted!) | `GET/PUT /api/banner` — currently dead code; inline routes in `api.js` win |
| `backend/api.js` L436-543 | Active | Inline `GET/PUT /api/banner` — currently the live routes |
| `backend/routes/homepageOptimized.js` | Active | `GET /api/homepage/all-data` — includes banner in parallel query |
| `backend/middleware/uploadMiddleware.js` L310-334 | Active | `uploadBannerImage` — stores to `uploads/banner/`, 5 MB, up to 10 images |
| `frontend/src/components/admin/homepage/BannerManagementNew.jsx` | **Active** | Admin banner UI — exported by `index.js` |
| `frontend/src/components/admin/homepage/BannerManagement.jsx` | **DEAD** | Old version; not exported |
| `frontend/src/components/admin/homepage/BannerManagement.new.jsx` | **DEAD** | Old iteration |
| `frontend/src/components/admin/homepage/BannerManagement.simplified.jsx` | **DEAD** | Old iteration |
| `frontend/src/components/admin/homepage/BannerManagement.temp.jsx` | **DEAD** | Old iteration |
| `frontend/src/components/admin/homepage/BannerManagementNew.jsx.new` | **DEAD** | Old iteration |
| `frontend/src/components/admin/homepage/BannerPreview.jsx` | Active | Preview for old product-assembly model |
| `frontend/src/components/admin/homepage/components/BannerPreview.jsx` | Active | Alternate preview component |
| `frontend/src/components/HeroSection.jsx` | Active | Public hero carousel; receives `banners[]` prop |
| `frontend/src/pages/Home.jsx` | Active | Fetches homepage data; passes `banners` to `HeroSection` |
| `frontend/src/config.js` | Active | `getImageUrl()` — missing `'banner'` key in `IMAGE_PATHS` (bug) |

---

## Current Data Model (Before Redesign)

```
HomepageBanner (singleton)
└── slides[]: {
      title: String (required),
      category: ObjectId → Category,
      primaryProduct: Mixed,       ← inconsistent: stored as object OR ObjectId
      secondaryProducts: [Mixed],  ← same inconsistency
      image: String,               ← filename in uploads/banner/
      order: Number
    }
```

**API endpoints (live):**
- `GET /api/banner` — reads `HomepageBanner.findOne()`, sorts by `order`, caches 1 hr. No auth.
- `PUT /api/banner` — `[authenticateAdmin, uploadMultipleProductImages]`, upserts, clears cache, purges Cloudflare.
- `GET /api/homepage/all-data` — reads banner + 5 other collections in parallel; serves via React-Query in `Home.jsx`.

**Admin API calls (in `BannerManagementNew.jsx`):**
- `GET /api/banner` — fetches slides on mount
- `PUT /api/banner` — saves all slides at once
- `GET /api/products?category=X&isActive=true&page=N&limit=12` — product picker

---

## Code Conventions Found in the Codebase

| Convention | Detail |
|---|---|
| API base URL | `config.API_BASE_URL` = `${BASE_URL}/api` |
| Image URL helper | `getImageUrl(type, filename)` — maps type to `/uploads/<subdir>/filename` |
| Admin auth | `localStorage.getItem('adminToken')` — attached by Axios interceptor |
| Cache invalidation | `cacheService.del(key)` + `cacheService.clearPattern()` + `purgeCloudflareUrls()` — called together on every admin write |
| Mongoose upsert pattern | `findOneAndUpdate({}, {$set: ...}, {upsert:true, new:true})` — used to bypass Mixed-type change detection |
| Frontend state | Local `useState`/`useRef` in component; React-Query for page-level data |
| Styling | Tailwind CSS for public pages; MUI (sx prop) for admin panels |
| Toast | `react-toastify` → `toast.error()`, `toast.success()` in admin; `react-hot-toast` in public |
| Lazy components | `React.lazy()` + `<Suspense>` for non-critical homepage sections |
| File upload field names | `multer` expects specific field names (e.g., `'bannerImage'`, `'images'`, `'image'`) |

---

## Decisions Made So Far

| Decision | Rationale |
|---|---|
| **Keep singleton `HomepageBanner` document** | Avoids a collection restructure; slides array is simply replaced |
| **No carousel library** | Project has no existing carousel dep; custom CSS `translateX` is sufficient and avoids +25 KB |
| **`react-dnd` for reorder** | Already installed for other admin features; no new dependency |
| **`imageFilename` instead of `image`** | Rename makes intent clear; avoids confusion with the Mixed-type `image` field used for product images |
| **`isActive` flag instead of hard delete** | Safer for admin mistakes; hard delete still available via explicit confirm |
| **Phase 0 cleanup first** | Removes confusion from dead files before touching logic |
| **`linkUrl` is manually typed by admin** ✅ | Admin enters a URL while uploading each slide. Internal paths (starting with `/`) use React Router `<Link>`; external URLs (starting with `http`) use `<a target="_blank" rel="noopener noreferrer">` |
| **Image storage = same local/cloud mount as products** ✅ | Dev: `backend/uploads/banner-slides/`. Production: `/uploads/banner-slides/` on the same cloud file mount serving product images. No S3/R2 needed. |
| **Fresh start — drop all 3 existing slides** ✅ | Old product-assembly slides no longer needed. Migration script clears `slides: []`. Admin creates all new slides from scratch. |
| **Slide count cap: 20** ✅ | Configurable via `MAX_BANNER_SLIDES` env var. |
| **`subtitle` field kept optional** | Admin can leave blank; `HeroSection` renders it only if present. |

---

## Current Status

**Done:** Full read-only codebase analysis. All 5 blocking Open Questions answered by product owner (2026-11-02).  
**Next action:** Begin **Phase 0** — delete dead files, fix `IMAGE_PATHS`, consolidate banner routes.

### Decisions Locked
1. **Slide link** = manually typed URL in admin. Internal `/path` → React Router. External `http…` → `<a target="_blank">`.
2. **Image storage** = local disk in dev; same cloud mount (`/uploads/banner-slides/`) as products in production. No S3.
3. **Data** = fresh start. Migration script clears existing slides. Admin builds from zero.

---

## Commands

```powershell
# Start backend (from project root)
cd backend; npm start   # → http://localhost:3001

# Start frontend dev server (separate terminal)
cd frontend; npm run dev  # → http://localhost:5173

# Build frontend for production
cd frontend; npm run build

# Run migration script (once, after schema update)
cd backend; node scripts/migrateBannerSlides.js

# Dump MongoDB banner collection before migration
mongodump --db internationaltijarat --collection homepagebanners --out ./backup
```

**Admin panel URL:** `http://localhost:5173/admin/homepage` → Banner Management tab  
**Public homepage:** `http://localhost:5173/`

---

## Known Gotchas

1. **MongoDB not running locally** — app exits with `ECONNREFUSED 127.0.0.1:27017` unless either MongoDB Community Server is running or `MONGODB_URI` is set in `backend/.env`. See `.env.template` for the Atlas URI.

2. **No `.env` file** — `backend/.env` does not exist in the repo. Copy from `.env.template` and fill in `MONGODB_URI` and `JWT_SECRET` before starting the backend.

3. **`bannerRoutes.js` is dead code** — it is `require()`-ed in `api.js` but never mounted with `app.use()`. The inline `GET/PUT /api/banner` routes in `api.js` are the live routes.

4. **`'banner'` missing from `IMAGE_PATHS`** — `getImageUrl('banner', filename)` falls through to the generic branch (uses raw filename as path). Works accidentally but is brittle. Fix in Phase 0.2.

5. **`BannerManagementNew.jsx` calls `GET /api/banner` (admin context)**; `Home.jsx` calls `GET /api/homepage/all-data` (public context). These are two separate data paths that both need updating.

6. **Cache has two keys for banner data:** `'homepage_banner'` (from inline route) and `'cache:/api/homepage/all-data'` (from aggregate route). Both must be cleared on any banner write — existing code does this correctly.

7. **`react-dnd-html5-backend`** does not work on touch screens (iOS/Android). If admin access on mobile is needed, replace with up/down arrow buttons as a touch fallback.

8. **Frontend `npm run dev`** is not configured in the root `package.json`; root `npm run dev` only starts the backend. Run frontend separately from the `frontend/` directory.

9. **Duplicate schema indexes warning** — Mongoose warns about duplicate `{slug:1}`, `{orderNumber:1}`, `{email:1}` indexes on startup. These are pre-existing and unrelated to the banner module.

10. **`homepageOptimized.js` tries to `.populate('slides.primaryProduct')`** — this works only when the field holds a raw ObjectId string. If the field holds a full object (as saved by the new admin UI), populate is a no-op. The redesign removes this field entirely, eliminating the bug.

