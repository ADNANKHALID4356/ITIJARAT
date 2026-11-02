# Planning.md — Banner Slides Redesign
**Project:** International Tijarat  
**Date:** 2026-11-02  
**Status:** ANALYSIS COMPLETE · IMPLEMENTATION PENDING

---

## 1. Executive Summary

The current Homepage Banner system assembles each slide from a **primary product** plus up to **3 secondary products** selected from the product catalogue. The admin UI is hardcoded to exactly **3 slides**; this limit is enforced in four separate places (UI tabs, JS initializer, validation logic, and save routine). The public carousel auto-scrolls every 6 seconds using a plain `setInterval` + CSS `opacity` cross-fade — no third-party carousel library is used.

The redesign replaces the product-assembly model with **self-contained banner entries** (title + a dedicated uploaded image). Admins will be able to add, edit, delete, reorder, and toggle activation of an **unlimited** number of slides. The public hero carousel gains smooth CSS-transition auto-scroll, pause-on-hover, `prefers-reduced-motion` support, and dot indicators.

**Scope of change:** medium. Backend schema migration is straightforward (additive). The biggest risk is the admin UI rewrite (large component) and the one-time data migration.

---

## 2. Current State Analysis

### 2.1 File Map

| Layer | File | Role |
|---|---|---|
| DB Schema | `backend/models/HomepageBanner.js` | Singleton doc; `slides[]` array; each slide holds `title`, `category` (ref), `primaryProduct` (Mixed), `secondaryProducts[]` (Mixed), `image`, `order` |
| API — read | `backend/api.js` L437-462 | `GET /api/banner` — fetches, sorts by `order`, caches 1 hr |
| API — write | `backend/api.js` L464-543 | `PUT /api/banner` — validates, upserts, clears cache, purges Cloudflare |
| API — alternate read | `backend/routes/bannerRoutes.js` | `GET /` and `PUT /` on `/api/banner` (also wired separately; **DUAL REGISTRATION**, see §2.6) |
| Aggregate homepage | `backend/routes/homepageOptimized.js` L85-325 | `GET /api/homepage/all-data` — parallel query including banner; populates `primaryProduct`, `secondaryProducts`, `category` |
| Upload middleware | `backend/middleware/uploadMiddleware.js` L310-334 | `uploadBannerImage` — stores to `uploads/banner/`, 5 MB limit, `.array('images',10)` |
| Admin component | `frontend/src/components/admin/homepage/BannerManagementNew.jsx` | **Active** component (exported via `index.js`); 3-slide tabs, product picker modal |
| Admin stale files | `BannerManagement.jsx`, `BannerManagement.new.jsx`, `BannerManagement.simplified.jsx`, `BannerManagement.temp.jsx`, `BannerManagementNew.jsx.new` | Older iterations — not exported, dead code |
| Admin preview | `frontend/src/components/admin/homepage/components/BannerPreview.jsx` | Renders slide list with primary/secondary product layout |
| Admin index | `frontend/src/components/admin/homepage/index.js` | Exports `BannerManagement` from `BannerManagementNew` |
| Public carousel | `frontend/src/components/HeroSection.jsx` | Receives `banners[]` prop; `setInterval` every 6 s; CSS `opacity` cross-fade; manual prev/next arrows |
| Home page | `frontend/src/pages/Home.jsx` | React-Query fetches `/api/homepage/all-data`; passes `homepageData.banners` to `<HeroSection>` |
| Image helper | `frontend/src/config.js` | `getImageUrl(type, filename)` — maps type keys to `/uploads/<dir>/` paths; `'banner'` key is **missing** from `IMAGE_PATHS` |
| Lazy image | `frontend/src/components/LazyImage.jsx` | Used in `HeroSection`; supports WebP/AVIF, native lazy-load, `fetchPriority` |
| API client | `frontend/src/api.js` | Axios instance; base URL from `config.API_BASE_URL`; auto-attaches admin/vendor/user token |

### 2.2 Data Model (Current)

```
HomepageBanner (singleton document)
├── slides: [SlideSchema]
│   ├── title: String (required)
│   ├── category: ObjectId → Category
│   ├── primaryProduct: Mixed  (denormalized product object OR ObjectId)
│   ├── secondaryProducts: [Mixed] (array of product objects or IDs)
│   ├── image: String (optional; filename in uploads/banner/)
│   └── order: Number (default 0)
└── lastUpdated: Date
```

`primaryProduct` and `secondaryProducts` are typed `Mixed` to store embedded product snapshots. **Populate calls in** `homepageOptimized.js` treat them as `ObjectId` references — this is inconsistent; the fields sometimes hold full objects and sometimes IDs.

### 2.3 Data Flow

```
Admin edit
  → BannerManagementNew.jsx (selects category → products)
  → handleSaveSlide: PUT /api/banner  { slides: [...] }
  → api.js PUT handler validates, upserts HomepageBanner, clears cache
  → Cloudflare purge: /api/homepage/all-data, /api/banner, /

Public homepage load
  → Home.jsx: GET /api/homepage/all-data  (React-Query, stale 30 s)
  → homepageOptimized.js: parallel DB queries, populates banner.slides
  → HeroSection receives banners[], builds heroSlides from slide.image or primaryProduct.image
  → setInterval auto-advance, opacity cross-fade
```

### 2.4 Current Limitations — Why 3 Slides?

The limit is enforced in **four separate places**:

| Location | Code | Effect |
|---|---|---|
| `BannerManagementNew.jsx` L106 | `Array(3).fill(null).map(...)` | Initializes exactly 3 slots |
| `BannerManagementNew.jsx` (Tabs) | `<Tab label="Slide 1/2/3">` | Fixed 3 tabs, no Add button |
| `BannerManagement.jsx` L234, L257 | Same `Array(3)` initializer | Stale file, same limit |
| Error fallback L143 | `Array(3).fill(null)...` | Error path also locks to 3 |

**Nothing in the DB schema or API enforces 3 slides** — removing the UI hard-code is sufficient for the backend. The API `PUT /api/banner` accepts any number of slides without a count check.

**What breaks if the limit is removed without other changes:**
- The 3-tab UI becomes incorrect (tabs are hardcoded, not dynamic).
- `handleDeleteSlide` references `slide.category._id` and `slide.primaryProduct._id` directly; deleting a partially-filled slide (no product) throws.
- The new design eliminates products entirely, so the delete bug is moot.

### 2.5 Current Carousel Behaviour

- **Library:** None. Pure React `useState` + native `setInterval`.
- **Autoplay:** Yes — advances every 6 seconds.
- **Pause on hover:** No — timer runs regardless of user interaction.
- **`prefers-reduced-motion`:** Not respected.
- **Transition:** CSS `opacity` cross-fade with `duration-1000` (Tailwind = 1 s ease-in-out). Slides are `absolute inset-0`; visible slide is `z-10 opacity-100`, others `z-0 opacity-0`.
- **Navigation:** Prev/Next chevron buttons shown only when `slides.length > 1`.
- **Indicators/dots:** None.
- **Image handling:** Uses `<LazyImage>` with `priority={index === 0}` for first slide. Fallback: shimmer gradient div if `bannerImage` is null.
- **Responsiveness:** Container heights: `h-[280px] sm:h-[380px] md:h-[480px] lg:h-[540px]`. Images use `object-cover`.
- **Empty state:** Falls back to `fallbackBanners` (empty string images → shimmer).

### 2.6 Risks and Tech Debt

| # | Issue | Severity |
|---|---|---|
| 1 | **Dual route registration**: `GET/PUT /api/banner` is defined twice — once inline in `api.js` and once in `bannerRoutes.js` which is `require()`-ed but **never `app.use()`-ed** in `api.js`. The inline route wins; `bannerRoutes.js` is dead code. | Medium |
| 2 | **`'banner'` missing from `IMAGE_PATHS`** in `config.js` — `getImageUrl('banner', ...)` falls through to the generic branch. Works by luck for existing data but is brittle. | Medium |
| 3 | **Mixed-type inconsistency**: `primaryProduct` / `secondaryProducts` stored as Mixed; `homepageOptimized.js` tries to `.populate()` them as ObjectId refs. Works only if the saved value is a raw ID string, not an object. | High |
| 4 | **No slide count limit in API** — currently the admin UI caps at 3, but nothing prevents an API client from inserting 500 slides. | Low |
| 5 | **No image size validation on banner upload** — only 5 MB multer limit; no dimension check or compression. Large images slow the carousel. | Medium |
| 6 | **Stale component files** (5 old `BannerManagement*.jsx` files) clutter the directory and cause confusion about which component is active. | Low |
| 7 | **No accessibility**: carousel missing `role="region"`, `aria-live`, `aria-label`; buttons have `aria-label` but no visible focus ring. | Medium |
| 8 | **No dots/pagination indicator** — users cannot see how many slides exist. | Low |
| 9 | **`console.log` spam** in `BannerPreview.jsx` and `BannerManagement.jsx` — many debug logs left in production code. | Low |

### 2.7 Dependencies on Banner Data

| Module | How it uses banners |
|---|---|
| `HeroSection.jsx` | Receives `banners[]` from Home; reads `slide.image`, `slide.primaryProduct.image`, `slide.title`, `slide.category` |
| `homepageOptimized.js` | Aggregates banner with other homepage data; populates slide refs |
| `bannerRoutes.js` (dead) | `GET /` reads `HomepageBanner`, sorts by `order` |
| `api.js` inline routes | `GET/PUT /api/banner` — admin and `BannerManagementNew.jsx` use these |
| Cloudflare purge | Triggered on any banner save; purges `/api/homepage/all-data`, `/api/banner`, `/` |
| Cache service | Key `homepage_banner` (1 hr) and `cache:/api/homepage/all-data` (1 hr) |

**Featured Products, Premium Products, Category Settings, Static Category Cards** do **not** read banner data — they are safe from banner changes.

---

## 3. Target Design

### 3.1 New Slide Data Model

```
BannerSlide (embedded in HomepageBanner)
├── _id: ObjectId (auto)
├── title: String (required, trimmed)
├── subtitle: String (optional)
├── imageFilename: String (required) — filename stored in uploads/banner-slides/
├── linkUrl: String (optional)
│   ├── Internal path (starts with /): React Router <Link to={linkUrl}>
│   └── External URL (starts with http): <a href target="_blank" rel="noopener noreferrer">
├── isActive: Boolean (default true)
└── order: Number (default 0)
```

> **Decision (2026-11-02):** Image storage uses the **same local disk path** as products/categories in both dev and production. Dev: `backend/uploads/banner-slides/`. Production: `/uploads/banner-slides/` served from the same cloud file mount that serves product images. No S3 required.

**Removed from old schema:** `category`, `primaryProduct`, `secondaryProducts`, `image` (renamed to `imageFilename`).

### 3.2 API Changes

| Verb | Route | Auth | Change |
|---|---|---|---|
| `GET` | `/api/banner` | Public | Returns slides sorted by `order`, filters `isActive: true` for public; admin param returns all |
| `PUT` | `/api/banner` | Admin | Replaced: accepts `{ slides: [SlideInput] }` without product fields |
| `POST` | `/api/banner/slides` | Admin | **NEW** — create one slide (multipart with image upload) |
| `PUT` | `/api/banner/slides/:id` | Admin | **NEW** — update one slide (title, subtitle, linkUrl, isActive, order, optional image) |
| `DELETE` | `/api/banner/slides/:id` | Admin | **NEW** — delete one slide and its image file from disk |
| `POST` | `/api/banner/slides/reorder` | Admin | **NEW** — accept `{ order: [id, id, ...] }` and bulk-update `order` fields |

> **Decision (2026-11-02):** `linkUrl` is a manually typed field. Backend stores it as-is (no redirect service). Frontend renders it as `<Link to={url}>` if it starts with `/`, otherwise `<a href={url} target="_blank" rel="noopener noreferrer">` for external links.

**Cleanup:** Remove the duplicate `GET/PUT /api/banner` inline routes from `api.js` and consolidate into `bannerRoutes.js`. Register `bannerRoutes` via `app.use('/api/banner', bannerRoutes)`.

**`homepageOptimized.js` minimal change:**
- Remove `.populate('slides.primaryProduct')`, `.populate('slides.secondaryProducts')`, `.populate('slides.category')`.
- `banners[]` response shape becomes:
  ```json
  {
    "_id": "...",
    "title": "...",
    "subtitle": "...",
    "image": "/uploads/banner-slides/x.jpg",
    "linkUrl": "...",
    "isActive": true,
    "order": 0
  }
  ```

### 3.3 Admin UI Changes

**Screen: Banner Management tab**

```
┌─ Banner Management ──────────────────────────────── [+ Add Slide] [Preview] ┐
│                                                                               │
│  ┌─ Slide list (sortable drag-and-drop) ─────────────────────────────────┐  │
│  │ ☰ [thumbnail] Slide 1 title         ● Active   [Edit] [Delete]        │  │
│  │ ☰ [thumbnail] Slide 2 title         ○ Inactive [Edit] [Delete]        │  │
│  │ ☰ [thumbnail] Slide 3 title         ● Active   [Edit] [Delete]        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌─ Edit Slide ──────────────────────────────────────────────────────────┐  │
│  │  Title *          [________________________]                           │  │
│  │  Subtitle         [________________________]                           │  │
│  │  Link URL         [________________________]  (optional)               │  │
│  │  Active           [Toggle]                                             │  │
│  │  Banner Image *   [Drop zone / file picker]  → preview thumbnail      │  │
│  │                   Accepted: JPEG, PNG, WebP, AVIF · Max 5 MB          │  │
│  │                   Recommended: 1920×600 px (16:5 ratio)               │  │
│  │                                        [Cancel] [Save Slide]          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────┘
```

**Key behaviours:**
- Drag-and-drop reorder via `react-dnd` (already a project dependency).
- Inline toggle Active/Inactive without opening the edit panel.
- Image upload with in-browser preview before save.
- Clicking slide row opens the Edit panel below the list.
- Delete prompts a confirm dialog before calling API.
- `+ Add Slide` opens a blank Edit panel.

**Preview:** Clicking "Preview" shows a live-rendered carousel using the same `HeroSection` component in a modal. No separate `BannerPreview.jsx` needed.

### 3.4 Public Carousel Behaviour

**Implementation: Custom React + CSS `translateX` transitions (no new library)**

Justification vs alternatives:

| Option | Pro | Con | Decision |
|---|---|---|---|
| Current (`setInterval` + opacity) | Already works | No pause-on-hover, no dots, no `prefers-reduced-motion` | Upgrade in place |
| Swiper.js | Feature-rich, accessible | +25 KB gzip; new dependency | Overkill |
| Embla Carousel | Lightweight, smooth | +8 KB; extra install step | Acceptable fallback |
| Custom CSS `translateX` | Smoothest motion; full control | Slightly more code | **Selected** |

**New behaviour spec:**
- Transition: `transform: translateX(-100%)` slide-out/in; `transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1)`.
- Autoplay: 5-second interval.
- **Pause on hover:** `onMouseEnter` / `onMouseLeave` on the container.
- **Pause on touch-hold:** `onTouchStart` / `onTouchEnd`.
- **`prefers-reduced-motion`:** detected via `window.matchMedia('(prefers-reduced-motion: reduce)')`; if true, disable transition duration and autoplay.
- **Dot indicators:** row of dots below the image; clicking a dot jumps to that slide.
- **Loop:** seamless — when last slide ends, instantly jump to first (no visible reverse-scroll).
- **Slide link:** if `linkUrl` is set, entire slide is wrapped in `<Link to={linkUrl}>`.
- **Empty state:** shimmer placeholder (existing behaviour preserved).
- **Single slide:** hide arrows and dots, disable autoplay.

---

## 4. Migration Plan

### 4.1 Existing Data — FRESH START

> **Decision (2026-11-02):** The 3 existing product-assembly slides are no longer needed. The admin will create all slides from scratch.

**Migration script** (`backend/scripts/migrateBannerSlides.js`) will simply **clear** the `slides` array:

```js
// One-liner: wipe all existing slides
await HomepageBanner.findOneAndUpdate(
  {},
  { $set: { slides: [], lastUpdated: new Date() } },
  { upsert: true }
);
console.log('Banner slides cleared. Admin can now create fresh slides.');
```

This is safe — the homepage will show the shimmer fallback until the admin adds the first new slide.

### 4.2 Rollback Strategy

1. **Before any change:** run `mongodump` on the `HomepageBanner` collection.
2. **Deployment rollback:** revert Git commit — old schema and UI restore immediately (schema change is additive; old fields remain in raw document until explicitly dropped).
3. **Data rollback:** `mongorestore` from dump if migration script ran.
4. **Cloudflare:** no special action — purge is idempotent.

---

## 5. Implementation Phases

> **Effort key:** S = < 2 hrs · M = 2–6 hrs · L = 6–12 hrs

### Phase 0 — Prep (no user-facing change)
| # | Task | Files | Effort | Depends |
|---|---|---|---|---|
| 0.1 | Delete dead component files | `BannerManagement.jsx`, `.new`, `.simplified`, `.temp`, `BannerManagementNew.jsx.new` | S | — |
| 0.2 | Add `'banner-slides'` key to `IMAGE_PATHS` in `config.js` | `frontend/src/config.js` | S | — |
| 0.3 | Consolidate duplicate banner routes: remove inline `GET/PUT /api/banner` from `api.js`; mount `bannerRoutes.js` via `app.use` | `backend/api.js`, `backend/routes/bannerRoutes.js` | S | — |
| 0.4 | Add `uploads/banner-slides/` to `UPLOAD_DIRS` in `api.js` and `uploadMiddleware.js` | `backend/api.js`, `backend/middleware/uploadMiddleware.js` | S | — |

### Phase 1 — Backend Schema + API
| # | Task | Files | Effort | Depends |
|---|---|---|---|---|
| 1.1 | Update `HomepageBanner.js` schema (add `subtitle`, `linkUrl`, `isActive`; rename `image` → `imageFilename`; remove product refs) | `backend/models/HomepageBanner.js` | S | 0.3 |
| 1.2 | Rewrite `bannerRoutes.js` — implement `POST /slides`, `PUT /slides/:id`, `DELETE /slides/:id`, `POST /slides/reorder`; update `GET /` to filter `isActive` | `backend/routes/bannerRoutes.js` | M | 1.1 |
| 1.3 | Update `homepageOptimized.js` banner query — remove product populates; map new fields | `backend/routes/homepageOptimized.js` | S | 1.1 |
| 1.4 | Write and run migration script | `backend/scripts/migrateBannerSlides.js` | S | 1.1 |
| 1.5 | Update `uploadBannerImage` middleware — change destination to `uploads/banner-slides/`; add AVIF to filter | `backend/middleware/uploadMiddleware.js` | S | 0.4 |

### Phase 2 — Admin UI Rewrite
| # | Task | Files | Effort | Depends |
|---|---|---|---|---|
| 2.1 | Create new `BannerManagement.jsx` — slide list with drag-and-drop (react-dnd), inline toggle, add/edit/delete | `frontend/src/components/admin/homepage/BannerManagement.jsx` (rewrite) | L | 1.2 |
| 2.2 | Create `BannerSlideForm.jsx` — form for title, subtitle, linkUrl, isActive, image upload with preview | `frontend/src/components/admin/homepage/BannerSlideForm.jsx` | M | 1.2 |
| 2.3 | Update `index.js` export; remove old `BannerPreview.jsx` files | `frontend/src/components/admin/homepage/index.js` | S | 2.1 |
| 2.4 | Manual QA: add 5 slides, reorder, deactivate one, verify homepage shows only 4 active | — | S | 2.1, 2.2 |

### Phase 3 — Public Carousel Upgrade
| # | Task | Files | Effort | Depends |
|---|---|---|---|---|
| 3.1 | Upgrade `HeroSection.jsx` — replace `opacity` crossfade with `translateX` slide; add pause-on-hover/touch; add `prefers-reduced-motion` check; add dot indicators | `frontend/src/components/HeroSection.jsx` | M | 1.3 |
| 3.2 | Add `linkUrl` support — wrap slide in `<Link to={linkUrl}>` if present | `frontend/src/components/HeroSection.jsx` | S | 3.1 |
| 3.3 | Responsive QA — test on 375 px, 768 px, 1440 px | — | S | 3.1 |

### Phase 4 — Polish and Hardening
| # | Task | Files | Effort | Depends |
|---|---|---|---|---|
| 4.1 | Accessibility: add `role="region" aria-label="Hero carousel"`, `aria-live="polite"` on slide title, focus management for dots/arrows | `frontend/src/components/HeroSection.jsx` | S | 3.1 |
| 4.2 | Backend: add server-side slide count guard (max 50, configurable via `MAX_BANNER_SLIDES` env) | `backend/routes/bannerRoutes.js` | S | 1.2 |
| 4.3 | Performance: `loading="lazy"` for non-first slides; `fetchPriority="high"` for first | `frontend/src/components/HeroSection.jsx` | S | 3.1 |
| 4.4 | Remove `console.log` debug spam from admin components | `BannerManagementNew.jsx`, `BannerPreview.jsx` | S | 2.1 |
| 4.5 | Integration test: verify `GET /api/homepage/all-data` still returns `banners[]` with correct shape | — | S | 1.3 |

---

## 6. Performance Plan

| Concern | Strategy |
|---|---|
| Image file size | Client-side validation: reject > 5 MB. Recommended upload dimensions: 1920×600 px. Backend: optionally run `sharp` resize to max 1920 px width on save (non-blocking). |
| Image format | Accept JPEG, PNG, WebP, AVIF. `LazyImage` already supports WebP/AVIF via `<picture>` with `srcSet`. |
| Lazy loading | Slide 0: `fetchPriority="high"`, `loading="eager"`. All other slides: `loading="lazy"`. |
| 50+ slides | Cap query at `.limit(20)` in `homepageOptimized.js`. Admin list uses pagination. Carousel renders only 3 DOM nodes (current, prev, next) for large sets via windowing if needed; for ≤20 slides: render all. |
| Caching | Retain existing 1-hr server cache + Cloudflare 5-min CDN cache + React-Query 30-s stale. |
| CLS prevention | Hero container keeps fixed heights; no layout shift on image load. |

---

## 7. Testing Plan

### Unit Tests
- `HomepageBanner` schema: test required fields, default values, missing `imageFilename` throws.
- `bannerRoutes.js`: mock Mongoose; test `POST /slides` creates correctly; `DELETE /slides/:id` returns 404 for unknown id; `POST /slides/reorder` rejects mismatched id count.

### Integration Tests
- `GET /api/homepage/all-data` after banner update — confirm `banners[]` shape matches new schema.
- `PUT /api/banner/slides/:id` with `isActive: false` — confirm public `GET /api/banner` excludes it.
- Cloudflare purge mock — confirm purge is called after every write operation.

### Manual QA Checklist
- [ ] Add 1 slide — homepage shows 1 slide, arrows/dots hidden.
- [ ] Add 3 slides — homepage shows 3; autoplay advances after 5 s.
- [ ] Deactivate 1 slide — homepage shows 2.
- [ ] Reorder slides in admin — homepage respects new order.
- [ ] Delete slide with image — file removed from `uploads/banner-slides/`.
- [ ] Upload a 6 MB image — validation error shown, no upload.
- [ ] Upload a WebP image — displays correctly in carousel.
- [ ] Hover over carousel — autoplay pauses; mouse out — autoplay resumes.
- [ ] OS: enable `prefers-reduced-motion` — carousel does not auto-advance, no slide transition animation.
- [ ] Mobile (375 px) — carousel fills width, arrows visible and tappable.
- [ ] Keyboard: Tab to arrows, Enter to navigate.

### Edge Cases

| Case | Expected |
|---|---|
| 0 active slides | Shimmer placeholder displayed (existing fallback behaviour) |
| 1 active slide | Image shown; arrows and dots hidden; no autoplay |
| 100 slides (load test) | Carousel renders fine; query capped at 20 |
| Broken image URL | `onError` in `LazyImage` shows placeholder image |
| Slow network (3G) | First slide loads with LCP ≤ 3 s (verify with Lighthouse) |
| Very long title (200 chars) | Title box truncates with ellipsis; no layout overflow |
| `linkUrl` pointing to external domain | Opens in `target="_blank" rel="noopener noreferrer"` |
| Simultaneous admin edit (two tabs) | Last write wins; cache cleared on each save |

---

## 8. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Existing slides lose their images (no dedicated banner image) | High | Medium | Migration script preserves `image` → `imageFilename`; admin notified to re-upload where blank |
| `homepageOptimized.js` populate calls fail silently after schema change | Medium | High | Update populate calls in Phase 1.3 before deploying schema; test in staging |
| Drag-and-drop reorder saves wrong `order` values | Low | Medium | Reorder endpoint re-indexes 0..N from the submitted array |
| Large banner images tank LCP | Medium | High | Enforce 5 MB limit + recommend 1920×600; auto-compress with `sharp` |
| React-Query stale data shows old carousel for 30 s after admin update | Low | Low | Existing Cloudflare purge + cache bust already handles this |
| Admin accidentally deletes all slides | Low | Medium | Soft-delete (isActive: false) is default; hard-delete only on explicit confirm dialog |
| `react-dnd` drag-and-drop broken on touch devices | Medium | Low | `react-dnd-html5-backend` is desktop-only; use up/down arrow buttons as touch fallback |

---

## 9. Open Questions — RESOLVED

All blocking questions answered by product owner on 2026-11-02.

| # | Question | **Decision** |
|---|---|---|
| 1 | **Link behaviour** | Each slide has a **manually entered URL** field (admin types it while uploading). Clicking the slide navigates the user to that URL. Use React Router `<Link>` for internal paths (e.g. `/products?category=electronics`) and `<a target="_blank">` for external URLs detected by `http`/`https` prefix. |
| 2 | **Subtitle field** | No explicit decision requested — keeping `subtitle` optional as originally designed. Assumption: include it; admin can leave blank. |
| 3 | **Image storage** | **Dev:** local disk `uploads/banner-slides/`. **Production:** same cloud storage used by products/categories (existing `/uploads/` path on the production server). No S3 required — current hosting already serves product images from the same path. |
| 4 | **Slide count cap** | Default cap: 20 slides (configurable via `MAX_BANNER_SLIDES` env). |
| 5 | **Existing slides migration** | **Start fresh.** The 3 existing product-assembly slides will be dropped. Admin will create all new slides from scratch via the new UI. Migration script will clear the `slides` array in `HomepageBanner`. |

---

## 10. Definition of Done

- [x] All slides in MongoDB support the new `imageFilename`-based schema with optional `title`, `subtitle`, `buttonText`, `linkUrl`, `isActive`, and `order`.
- [x] Admin can add, edit, delete, reorder (drag & drop + up/down arrows), and toggle activation of unlimited slides.
- [x] Public homepage carousel shows only `isActive: true` slides in `order` sequence.
- [x] Carousel auto-scrolls gently; pauses on hover/touch; respects `prefers-reduced-motion`.
- [x] Dot indicators show current slide; clicking a dot jumps to it.
- [x] First slide image loads with `fetchPriority="high"`; subsequent slides lazy-load.
- [x] No console errors or warnings in browser build on homepage or admin banner page.
- [x] `GET /api/homepage/all-data` response shape unchanged (consumers unaffected).
- [x] All dead `BannerManagement*.jsx` files removed.
- [x] Dry-run & migration script `backend/scripts/migrateBannerSlides.js` implemented with automated backups.
- [ ] Live database migration applied (`node backend/scripts/migrateBannerSlides.js --apply` pending user execution).
- [ ] Manual QA checklist in browser verified after live backend boot.

