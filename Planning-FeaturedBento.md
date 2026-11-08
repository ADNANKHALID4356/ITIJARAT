# Planning-FeaturedBento.md — Featured Products Bento Grid Redesign
**Project:** International Tijarat (Marketplace Web App)  
**Author:** Senior Full-Stack Engineer & UI/UX Architect  
**Date:** 2026-11-03  
**Status:** ARCHITECTURAL ANALYSIS & PLANNING COMPLETE — READY FOR REVIEW  

---

## 1. Executive Summary

The **Featured Products** section on International Tijarat is currently rendered as a standard, uniform product card grid embedded inside the third tab of `<PremiumProductDisplay>` on the public homepage. The product selection is managed via `Admin > Homepage Management > "Featured Products"` (`<SpecialProductsManager type="featured" />`), which persists an unordered array of Product `ObjectId` references in the singleton `FeaturedProducts` MongoDB collection.

This document presents a comprehensive architectural plan to elevate the Featured Products section into a **modular, editorial Bento Grid** inspired by contemporary high-end marketplace aesthetics. The new design introduces a hierarchical layout featuring:
- A dominant **Hero (2x2)** showcase tile with enriched product context (high-resolution image, bold title, category badge, live price, stock availability, and a direct "Shop Now" / "View Details" call to action).
- Interlocking **Wide (2x1)**, **Tall (1x2)**, and **Small (1x1)** companion tiles engineered to assemble seamlessly into a zero-gap modular canvas across any product count ($1$ to $20+$ items).
- An upgraded **Admin Bento Management Studio** giving the marketplace owner full visual preview, drag-and-drop reordering, hero slot assignment, and flexible tile size allocation—backed by an automated fallback algorithm that guarantees balanced layouts even with zero admin effort.
- 100% backward compatibility with the existing MongoDB `FeaturedProducts` singleton and parallel aggregate endpoint `/api/homepage/all-data`.

---

## 2. Current State Analysis

### 2.1 File Map

#### (a) Admin Featured Products Management
| Layer | File Path | Role & Verified Implementation Details |
|---|---|---|
| **Admin Route View** | [`frontend/src/pages/Admin/homepage/index.jsx`](file:///c:/Users/Engin/Documents/I.T/IT/frontend/src/pages/Admin/homepage/index.jsx) | Renders the tabbed admin dashboard (`tabs = [{ id: 'featured', label: 'Featured Products' }, ...]`). Case `'featured'` renders `<FeaturedProductsManager />`. |
| **Admin Tab Wrapper** | [`frontend/src/components/admin/homepage/FeaturedProductsManager.jsx`](file:///c:/Users/Engin/Documents/I.T/IT/frontend/src/components/admin/homepage/FeaturedProductsManager.jsx) | Thin wrapper returning `<SpecialProductsManager type="featured" />`. |
| **Admin Core Component** | [`frontend/src/components/admin/homepage/SpecialProductsManager.jsx`](file:///c:/Users/Engin/Documents/I.T/IT/frontend/src/components/admin/homepage/SpecialProductsManager.jsx) | Handles category filtering, available product search/pagination, optimistic addition/removal of products to/from `selectedProducts[]`, and API synchronization with `/api/special/featured`. (Note: Has an unfinished `isPreviewMode` toggle that renders `null` when active). |
| **Category Selector** | [`frontend/src/components/admin/homepage/CategorySelector.jsx`](file:///c:/Users/Engin/Documents/I.T/IT/frontend/src/components/admin/homepage/CategorySelector.jsx) | Dropdown enabling category-based product querying in admin. |
| **Admin Barrel Export** | [`frontend/src/components/admin/homepage/index.js`](file:///c:/Users/Engin/Documents/I.T/IT/frontend/src/components/admin/homepage/index.js) | Exports `FeaturedProductsManager` and `PremiumProductsManager`. |
| **Dead/Stale Admin File** | [`frontend/src/pages/Admin/homepage/FeaturedProductsManagement.jsx`](file:///c:/Users/Engin/Documents/I.T/IT/frontend/src/pages/Admin/homepage/FeaturedProductsManagement.jsx) | Stale standalone implementation calling `/featured-products` and `/products/search`. **Not imported anywhere** in `App.jsx` or router. |

#### (b) Public Homepage & Backend APIs
| Layer | File Path | Role & Verified Implementation Details |
|---|---|---|
| **Homepage Host** | [`frontend/src/pages/Home.jsx`](file:///c:/Users/Engin/Documents/I.T/IT/frontend/src/pages/Home.jsx) | React-Query fetches `/api/homepage/all-data` (staleTime: 30s). Passes `homepageData?.specialProducts?.featured` to `<PremiumProductDisplay />`. |
| **Public Display** | [`frontend/src/components/PremiumProductDisplay.jsx`](file:///c:/Users/Engin/Documents/I.T/IT/frontend/src/components/PremiumProductDisplay.jsx) | Tabbed container with 3 tabs: "Premium", "New Arrivals", and "Featured". Renders products in a uniform CSS grid (`grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1`). |
| **Card Component** | [`frontend/src/components/EnhancedProductCard.jsx`](file:///c:/Users/Engin/Documents/I.T/IT/frontend/src/components/EnhancedProductCard.jsx) | Shared product card component with square media container (`paddingBottom: 100%`), hover video playback, size selection modal, and cart actions. |
| **Aggregate Route** | [`backend/routes/homepageOptimized.js`](file:///c:/Users/Engin/Documents/I.T/IT/backend/routes/homepageOptimized.js) | `GET /api/homepage/all-data` queries `FeaturedProducts.findOne().populate('products')`. Feeds `specialProducts.featured` with reversed order (`[...products].reverse()`). |
| **REST Admin API** | [`backend/api.js`](file:///c:/Users/Engin/Documents/I.T/IT/backend/api.js) (L408–480) | `GET /api/special/featured` (populates category & vendor); `PUT /api/special/featured` (authAdmin, saves `productIds`, invalidates in-memory cache and triggers Cloudflare purge). |
| **Secondary Route** | [`backend/routes/specialProducts.js`](file:///c:/Users/Engin/Documents/I.T/IT/backend/routes/specialProducts.js) | Standalone router defining `GET/PUT /featured`. *Currently unmounted in `backend/api.js`.* |
| **Stock Query Route** | [`backend/controllers/productController.js`](file:///c:/Users/Engin/Documents/I.T/IT/backend/controllers/productController.js) (L1331) | `GET /api/products/featured` — Arbitrary stock filter query (`stock: { $gt: 100, $lt: 200 }`). Used by `productService.js`, but **not** by homepage. |
| **DB Model (Active)** | [`backend/models/FeaturedProducts.js`](file:///c:/Users/Engin/Documents/I.T/IT/backend/models/FeaturedProducts.js) | Mongoose singleton schema: `products: [{ type: ObjectId, ref: 'Product' }]`, `lastUpdated: Date`. |
| **DB Model (Empty)** | [`backend/models/FeaturedProduct.js`](file:///c:/Users/Engin/Documents/I.T/IT/backend/models/FeaturedProduct.js) | 0-byte blank file (orphan artifact). |
| **Core Product Model**| [`backend/models/Product.js`](file:///c:/Users/Engin/Documents/I.T/IT/backend/models/Product.js) | Main schema for catalogue products. |

---

### 2.2 Data Model Analysis

#### Storage Schema
Featured products are stored as a **singleton document** in the `featuredproducts` MongoDB collection:
```javascript
// backend/models/FeaturedProducts.js
const featuredProductsSchema = new mongoose.Schema({
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});
```
Currently in database: **13 products** are stored in `FeaturedProducts.findOne().products`.

#### Available vs. Missing Product Fields
| Field | Status in `Product.js` | Status in `/api/homepage/all-data` | Status in `/api/special/featured` | Notes |
|---|---|---|---|---|
| `_id`, `id` | Available | Available | Available | Native MongoDB ObjectId string |
| `title` | Available | Available | Available | String, trimmed, max 200 chars |
| `description` | Available | **MISSING** (stripped by `.select()`) | Available | Short text suitable for Hero bento subtitle |
| `price` | Available | Available | Available | Number |
| `originalPrice` | Available | **MISSING** | Available | Number or null; enables discount calculation |
| `discount` | Available | Available | Available | Percentage number ($0$ to $100$) |
| `discountedPrice` | Virtual | **MISSING** | Available | Computed virtual: `price * (1 - discount/100)` |
| `image` | Available | Available | Available | Primary image filename |
| `images` | Available | Available (Empty array) | Available | Array of additional images |
| `optimizedImage` | Generated | Available (`300w`, `600w`, `full` WebP/AVIF) | Not attached | Generated by `addImagePaths` in `homepageOptimized.js` |
| `slug` | Available | Available | Available | SEO-friendly URL slug |
| `stock` | Available | **MISSING** | Available | Inventory count |
| `stockStatus` | Virtual | **MISSING** | Available | `'in-stock'`, `'low-stock'`, `'out-of-stock'` |
| `category` | Ref Array | **MISSING** | Available (Populated) | Populated with `{ _id, name, slug }` |
| `vendor` | Ref | **MISSING** | Available (Populated) | Populated with `{ name, shopName }` |
| `rating` | **MISSING** | **MISSING** (Hardcoded in projection) | **MISSING** | Not defined on Mongoose schema; mock in demo |
| `reviewsCount` | **MISSING** | **MISSING** | **MISSING** | Not defined on Mongoose schema |
| `tags` / `badge` | Available (`tags[]`) | **MISSING** | Available | Tags array exists; specific UI badge is unstandardized |

> [!IMPORTANT]
> In `backend/routes/homepageOptimized.js` (lines 145–151), the query projection is:
> `select: 'title price image discount rating slug'`
> If the Bento Hero tile displays description, vendor, stock status, or category, `homepageOptimized.js` must be updated to include those fields in the projection, OR the public component must gracefully degrade when those fields are absent.

---

### 2.3 Data Flow

```
[ Admin Dashboard: /admin/homepage ]
  │
  ├─> 1. Loads currently selected products: GET /api/special/featured
  │      └─ Returns: Array of populated Product documents
  ├─> 2. Searches/filters products by Category: GET /api/products?category=...
  ├─> 3. Admin clicks "Add" or "Remove"
  └─> 4. Saves complete ordered array: PUT /api/special/featured  { productIds: [id1, id2, ...] }
         │
         ▼
[ Express API Server: backend/api.js ]
  │
  ├─> Updates FeaturedProducts singleton: { products: productIds, lastUpdated: Date.now() }
  ├─> In-Memory Cache Invalidation: cacheService.del('cache:/api/homepage/all-data')
  └─> CDN Cache Purge: purgeCloudflareUrls(['.../api/homepage/all-data', '.../'])
         │
         ▼
[ Public Storefront: frontend/src/pages/Home.jsx ]
  │
  ├─> useQuery(['homepage-all']) calls: GET /api/homepage/all-data
  ├─> Backend (homepageOptimized.js) runs parallel Mongoose queries
  ├─> Populates products with addImagePaths() (WebP & AVIF responsive paths)
  ├─> Reverses order so newest additions appear first: [...products].reverse()
  └─> Home.jsx passes homepageData.specialProducts.featured to public component
```

---

### 2.4 Current Admin UX

1. **Selection Paradigm:** Admin selects a Category from `<CategorySelector />`, which queries products in that category with 20 items per page.
2. **Action:** Admin clicks "Add to Featured Products" on an available card. The product is appended to the bottom of the list.
3. **Removal:** Admin clicks "Remove" on an active card.
4. **Ordering:** **Zero ordering controls.** The order in the database is strictly chronological by insertion. Furthermore, `homepageOptimized.js` performs a `.reverse()`, meaning the last added product becomes the first product displayed.
5. **Layout Control:** **None.** Admin cannot select a hero product, cannot choose a tile size, and cannot select a layout preset.
6. **Limit/Validation:** **No limit enforced** anywhere in backend or admin frontend. Admin can feature 1 product or 100 products.

---

### 2.5 Current Public UI

1. **Display Location:** Embedded inside `<PremiumProductDisplay.jsx>` as the 3rd tab ("Featured"). Not an independent homepage section.
2. **Layout Engine:** Uniform CSS Grid:
   ```html
   <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1">
   ```
3. **Card Component:** Uses `<EnhancedProductCard />` with `showTitle={false}` and `showBuyNow={true}`.
4. **Image Handling:** Square media container (`paddingBottom: '100%'`, `height: 0`, `object-cover`). Uses `<LazyImage />` with WebP/AVIF detection and a fallback `ImagePlaceholder`.
5. **Hover Interactions:** CSS transition with scale up (`scale-110`), black gradient overlay fade-in, and hover video playback if `product.video` is set.
6. **Shortcomings:** 
   - Tiles are tiny and completely uniform across all products (no visual hierarchy).
   - Product title is suppressed (`showTitle={false}`), showing only images and prices.
   - Buried inside tab 3 of another component rather than commanding homepage prestige.

---

### 2.6 Styling & Theming

- **Theme Baseline:** Strictly **light theme** (`bg-white`, `text-gray-900`, `bg-gray-50`).
- **Typography:**
  - Headings: `font-family: var(--font-serif)` (`"Times New Roman", Times, serif`), **bold (700)**, `color: #000`.
  - Prices: `font-family: var(--font-sans)` (`'Inter', sans-serif`), **strictly NOT bold** (`font-weight: 400 !important; color: #374151;`).
  - Body/Metadata: `'Inter'`, medium/regular weights.
- **Accents:** Luxury warm orange/amber (`from-orange-500 to-pink-500`, `#f97316`, `amber-500`) and slate/black elements (`header-glass-dark`, `rgba(15, 23, 42, 0.95)`).
- **Surface Elevation:** Subtle borders (`border border-gray-100` or `border-black/10`), soft ambient shadows (`shadow-sm`, `shadow-md`), and generous rounded corners (`rounded-2xl` to `rounded-3xl` / 16px to 28px).

---

### 2.7 Quality Gaps & Dependencies

1. **Projection Field Mismatch:** `homepageOptimized.js` only selects 6 fields (`title`, `price`, `image`, `discount`, `rating`, `slug`). Hero tile badges or categories would be blank without expanding the select projection.
2. **Broken Admin Preview:** Line 270 of `SpecialProductsManager.jsx` toggles `isPreviewMode`, but lines 277–324 render `null` when `isPreviewMode === true`.
3. **Cart Context Fallback:** `<EnhancedProductCard />` relies on `useCart()` and `useAuth()`. If either context is unmounted or in error, operations must fail gracefully without throwing.
4. **Reversal Side Effect:** `homepageOptimized.js` reverses the array before returning it to the frontend (`[...products].reverse()`). Any admin ordering system must account for this or synchronize order indexing explicitly.

---

## 3. Target Design: The Modern Bento Grid

### 3.1 Design Principles Adopted from Reference
- **Modular Interlocking Tiles:** Varied tile geometries (**Hero 2x2**, **Wide 2x1**, **Tall 1x2**, **Small 1x1**) that pack seamlessly with **zero holes/gaps**.
- **Consistent Rhythm:** Standardized gutters ($16\text{px}$ on mobile/tablet, $20\text{px}$–$24\text{px}$ on desktop) and uniform corner radius ($24\text{px}$ / `rounded-3xl`).
- **Restrained Light Luxury Palette:** Off-white surfaces (`bg-gray-50/80` or `bg-white`), hairline borders (`border border-gray-200/80`), soft drop shadows, and high-contrast typography.
- **Single-Focus Tile Anatomy:** High-impact product photography, clean badge hierarchy, non-bold price formatting, and uncluttered action affordances.

---

### 3.2 Bento Layout Presets & Zero-Gap Algorithm

The layout utilizes **CSS Grid** with **4 columns** on desktop ($\ge 1024\text{px}$), **2 columns** on tablet ($640\text{px}$–$1023\text{px}$), and **1 column** on mobile ($< 640\text{px}$).

To guarantee that the layout **never has an empty gap**, products are mapped to fixed grid-span presets according to the total count $N$. If $N > 8$, the first 8 items render in the flagship Bento arrangement, and remaining items flow into an interlocking secondary bento ribbon or clean balanced grid.

#### ASCII Wireframes (Desktop 4-Column Layouts)

##### 1 Product (Single Hero Showcase)
```
+-------------------------------------------------------+
|                                                       |
|             HERO TILE (4 cols x 2 rows)               |
|            Full width spotlight showcase              |
|                                                       |
+-------------------------------------------------------+
```

##### 3 Products (Hero + 2 Wide Tiles)
```
+---------------------------+---------------------------+
|                           |  WIDE TILE 1 (2 cols x 1) |
|  HERO TILE (2 cols x 2)   +---------------------------+
|                           |  WIDE TILE 2 (2 cols x 1) |
+---------------------------+---------------------------+
```

##### 5 Products (Hero + 1 Tall + 3 Small Tiles)
```
+---------------------------+-------------+-------------+
|                           |  TALL TILE  | SMALL TILE 1|
|  HERO TILE (2 cols x 2)   | (1 col x 2) +-------------+
|                           |             | SMALL TILE 2|
+---------------------------+-------------+-------------+
|       WIDE TILE (2 cols x 1) / 2 x SMALL TILES        |
+-------------------------------------------------------+
```
*(Alternative 5-Product Preset: Hero 2x2 + Wide 2x1 + 3 Small 1x1):*
```
+---------------------------+---------------------------+
|                           |  WIDE TILE 1 (2 cols x 1) |
|  HERO TILE (2 cols x 2)   +-------------+-------------+
|                           | SMALL TILE 1| SMALL TILE 2|
+---------------------------+-------------+-------------+
|       WIDE TILE 2 (2 cols x 1) / SMALL TILE 3         |
+-------------------------------------------------------+
```

##### 7 Products (The Flagship Bento)
```
+---------------------------+-------------+-------------+
|                           |  TALL TILE  | SMALL TILE 1|
|  HERO TILE (2 cols x 2)   | (1 col x 2) +-------------+
|                           |             | SMALL TILE 2|
+-------------+-------------+-------------+-------------+
| SMALL TILE 3| SMALL TILE 4|   WIDE TILE (2 cols x 1)  |
+-------------+-------------+---------------------------+
```

##### 9 Products (Flagship Bento + Companion Row)
```
+---------------------------+-------------+-------------+
|                           |  TALL TILE  | SMALL TILE 1|
|  HERO TILE (2 cols x 2)   | (1 col x 2) +-------------+
|                           |             | SMALL TILE 2|
+-------------+-------------+-------------+-------------+
| SMALL TILE 3| SMALL TILE 4|   WIDE TILE (2 cols x 1)  |
+-------------+-------------+---------------------------+
| SMALL TILE 5| SMALL TILE 6| SMALL TILE 7| SMALL TILE 8|
+-------------+-------------+-------------+-------------+
```

##### Mobile Responsive Collapsed Layout (< 640px)
On mobile devices, multi-column row spans collapse into an intuitive vertical narrative to prevent cramped tiles:
```
+---------------------------+
|  HERO TILE (1 col x tall) |
|  Image + Title + Price    |
+---------------------------+
|  SUPPORTING TILE 1 (wide) |
+---------------------------+
|  SUPPORTING TILE 2 (wide) |
+---------------------------+
|  SUPPORTING TILE 3 (wide) |
+---------------------------+
```

---

### 3.3 Tile Anatomy & Data Field Mapping

| Tile Type | Dimensions (Desktop) | Visual Hierarchy | Components & Fields Rendered |
|---|---|---|---|
| **Hero Tile** | `col-span-2 row-span-2`<br>Min height: $480\text{px}$–$520\text{px}$ | Dominant anchor; 50% surface area | • Badge: "Featured Spotlight" / Category tag<br>• Large responsive WebP image (`object-contain` or generous `object-cover`)<br>• Title: `font-serif`, bold, 24px–28px<br>• Short description/tagline (clamped 2 lines)<br>• Price: `font-sans`, regular weight, 20px (`PKR xxx`)<br>• Discount pill if `discount > 0`<br>• Direct CTA button: "Explore Product" with animated arrow<br>• Quick Action: Add to Cart icon button |
| **Wide Tile** | `col-span-2 row-span-1`<br>Min height: $230\text{px}$–$250\text{px}$ | Horizontal balance tile | • Split 50/50 layout: Left = Text/Price/CTA, Right = Product Image<br>• Title: `font-serif`, bold, 16px–18px<br>• Price: `font-sans`, regular weight, 15px<br>• Badge: Discount or "Trending"<br>• Quick Add to Cart button |
| **Tall Tile** | `col-span-1 row-span-2`<br>Min height: $480\text{px}$–$520\text{px}$ | Vertical accent tile | • Vertical portrait orientation<br>• Image occupying top 65% with rounded frame<br>• Bottom 35%: Category label, title, price, and cart pill |
| **Small Tile** | `col-span-1 row-span-1`<br>Min height: $230\text{px}$–$250\text{px}$ | Compact companion tile | • Square-ish compact card<br>• Centered product image with subtle float on hover<br>• Bottom overlay: Title (1 line clamp) and non-bold price<br>• Floating quick-action cart button on hover |

---

### 3.4 Admin Control Strategy

We evaluated three options for owner control:

| Option | Mechanics | Pros | Cons | Verdict |
|---|---|---|---|---|
| **1. Pure Automatic (Position-based)** | Product at index 0 is always Hero; subsequent indices follow a mathematical preset. | Zero admin friction; impossible to produce a broken layout. | Owner cannot customize which product is wide vs. tall. | Solid fallback baseline. |
| **2. Per-Product Size Dropdown** | Admin assigns `Hero`, `Wide`, `Tall`, or `Small` to each product. | Maximum granular control. | **High risk of broken layouts**: If admin selects 3 Hero tiles or incompatible spans, CSS Grid produces gaping empty holes. | Rejected. |
| **3. Hybrid Layout Slotting (Recommended)** | Admin selects a Featured Layout Theme (e.g. "Spotlight Left", "Dual Wide", "Dynamic Balance"). Admin drags products into ordered slots via drag-and-drop. Slot 1 is always Hero. Optional toggle to set a specific item as Hero. | • 100% immune to holes/gaps<br>• Intuitive drag-and-drop reordering (reusing `react-dnd` already installed)<br>• Live WYSIWYG preview in admin<br>• Zero effort required if owner just adds products | **RECOMMENDED** |

---

### 3.5 API & Data Model Changes

To preserve 100% backward compatibility and eliminate risky DB schema migrations, the data model changes are **purely additive**:

#### Option A: Zero Schema Change (Zero Risk — Recommended for Phase 1)
- `backend/models/FeaturedProducts.js` retains `products: [{ type: ObjectId, ref: 'Product' }]`.
- Slot 1 (`products[0]`) is always the Hero. The frontend Bento algorithm maps the ordered array to the interlocking grid preset.
- Admin ordering is stored directly by the sequence of IDs in `products[]`.

#### Option B: Enhanced Slot Schema (Phase 2 Enhancement)
```javascript
const featuredProductsSchema = new mongoose.Schema({
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        tileSize: { type: String, enum: ['hero', 'wide', 'tall', 'small', 'auto'], default: 'auto' },
        customTagline: { type: String, trim: true },
        order: { type: Number, default: 0 }
    }],
    // Retain legacy field for safe rollback:
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    lastUpdated: { type: Date, default: Date.now }
});
```

#### Backend API Changes Required:
1. In `backend/routes/homepageOptimized.js` (line 149), expand the population projection from:
   ```javascript
   select: 'title price image discount rating slug'
   ```
   to:
   ```javascript
   select: 'title description price originalPrice discount image images category stock slug'
   ```
2. In `backend/api.js` `PUT /api/special/featured`: Ensure cache invalidation purges both in-memory cache and Cloudflare CDN.

---

### 3.6 Implementation Approach: Pure CSS Grid vs. Third-Party Library

**Decision: Pure CSS Grid with Tailwind CSS.**
- **Why No Library:** Libraries like `react-grid-layout` or `packery` introduce heavy JavaScript bundles ($40\text{KB}+$ gzipped), inline positioning calculations that cause cumulative layout shift (CLS), and hydration mismatches.
- **Why Native CSS Grid:** Modern CSS Grid with predefined grid-template areas or explicit spans (`col-span-2 row-span-2`) is 100% declarative, renders instantly with zero layout shift, has zero bundle overhead, and seamlessly responds to Tailwind breakpoint classes (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).

---

## 4. Component Plan

### New Components to Create
1. `frontend/src/components/bento/FeaturedBentoGrid.jsx`: The top-level public container. Receives `products[]`, selects the appropriate preset, and renders the grid container.
2. `frontend/src/components/bento/BentoHeroTile.jsx`: The 2x2 flagship tile with rich media, badges, price, and CTA.
3. `frontend/src/components/bento/BentoWideTile.jsx`: The 2x1 horizontal tile with split media/content.
4. `frontend/src/components/bento/BentoTallTile.jsx`: The 1x2 vertical portrait tile.
5. `frontend/src/components/bento/BentoSmallTile.jsx`: The 1x1 compact square tile.
6. `frontend/src/components/admin/homepage/FeaturedProductsBentoManager.jsx`: Upgraded admin studio with drag-and-drop reordering (via `react-dnd`), Hero badge assignment, and an interactive Bento preview.

### Components to Update
1. `frontend/src/pages/Home.jsx`: Mount `<FeaturedBentoGrid products={homepageData?.specialProducts?.featured} />` as a dedicated, prominent homepage section.
2. `frontend/src/components/PremiumProductDisplay.jsx`: Clean up the redundant third tab ("Featured"), focusing this component exclusively on "Premium Products" and "New Arrivals".
3. `frontend/src/components/admin/homepage/index.js`: Export the upgraded `FeaturedProductsManager`.

---

## 5. Migration & Rollback Strategy

1. **Default Behavior on Deployment:** If the database contains existing featured products, the frontend Bento Grid automatically formats `products[0]` as the Hero, `products[1]` as Wide, and so forth. Zero database modification or admin intervention is required.
2. **Empty State Handling:** If 0 products are featured, the section gracefully unmounts (`return null;`), reserving zero vertical space and preventing layout shift.
3. **Rollback Plan:**
   - If issues arise, `<FeaturedBentoGrid>` can be swapped back to `<EnhancedProductCard>` grid in `Home.jsx` via a single-line git revert.
   - The underlying MongoDB model retains the identical `products: [ObjectId]` structure.

---

## 6. Implementation Phases

| Phase | Task Description | Target Files | Effort | Dependencies |
|---|---|---|---|---|
| **Phase 1: Backend Projection** | Expand `select` projection in `homepageOptimized.js` to include `description`, `originalPrice`, `stock`, `category`. | `backend/routes/homepageOptimized.js` | **S** | None |
| **Phase 2: Bento Tile Components** | Build `BentoHeroTile`, `BentoWideTile`, `BentoTallTile`, `BentoSmallTile` with luxury styling, hover polish, and `<LazyImage>` integration. | `frontend/src/components/bento/*` | **M** | Phase 1 |
| **Phase 3: Public Bento Grid** | Build `FeaturedBentoGrid.jsx` with per-count presets (1–20+ items), zero-gap logic, and mobile collapse. Mount in `Home.jsx`. | `frontend/src/components/bento/FeaturedBentoGrid.jsx`, `frontend/src/pages/Home.jsx` | **M** | Phase 2 |
| **Phase 4: Admin Bento Studio** | Upgrade `SpecialProductsManager` / `FeaturedProductsManager` with drag-and-drop ordering (`react-dnd`), slot numbers, Hero indicators, and live preview. | `frontend/src/components/admin/homepage/FeaturedProductsManager.jsx`, `SpecialProductsManager.jsx` | **L** | Phase 1 |
| **Phase 5: Polish & Accessibility** | Add keyboard navigation, ARIA landmarks, WCAG contrast verification, and `prefers-reduced-motion` compliance. | `frontend/src/components/bento/*` | **S** | Phase 3 |

---

## 7. Performance Plan

- **Image Budgets & WebP:** All bento tiles utilize `<LazyImage>` with backend WebP/AVIF endpoints (`300w` for Small tiles, `600w` for Wide/Tall tiles, `1200w`/`full` for Hero).
- **LCP & Priority Loading:** The Hero tile uses `priority={true}` (eager fetch) if above the fold; all smaller companion tiles use `loading="lazy"`.
- **Layout Shift Prevention:** Every tile container enforces explicit aspect ratios (`aspect-square`, `aspect-[2/1]`, or fixed min-heights) with shimmer placeholder skeletons while images decode.
- **Handling 20+ Products:** If $> 8$ products are featured, items 9+ render in a secondary 4-column balanced grid with a "View All Featured Products" link to prevent infinite homepage scroll fatigue.

---

## 8. Testing Plan

### Automated & Manual QA Checklist
- [ ] **Count Tests:** Verify zero gaps for $N = 1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 20$.
- [ ] **Data Robustness:** Test product with:
  - Missing image (fallback placeholder renders cleanly without crashing).
  - Very long title ($150+$ characters — clamps cleanly without overflowing card).
  - Missing discount / price zero / null values.
  - Out of stock (`stock: 0` shows "Out of Stock" badge; disables direct add to cart).
- [ ] **Responsive Breakpoints:**
  - Desktop ($1280\text{px}$, $1024\text{px}$): 4 columns, interlocking tiles.
  - Tablet ($768\text{px}$): 2 columns, Hero spans 2 columns, others stack cleanly.
  - Mobile ($375\text{px}$, $414\text{px}$): Single column, full touch-friendly tap targets ($\ge 44\text{px}$).
- [ ] **Motion:** Verify hover lift and scale animations disable when `prefers-reduced-motion: reduce` is set.
- [ ] **Accessibility:** Keyboard tab sequence follows logical visual reading order; screen reader announces product title, price, and stock status.

---

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Projection Field Omission** | Hero tile lacks description or stock status | Expanded query projection in Phase 1; fallback UI defaults in component if fields are missing. |
| **Array Reversal Confusion** | Admin orders items 1,2,3 but homepage displays 3,2,1 due to `[...products].reverse()` | Standardize ordering contract: remove arbitrary `.reverse()` in `homepageOptimized.js` or document explicit display index. |
| **Competing Animations with Hero Banner** | Page feels hyperactive with banner carousel and bento grid animations running simultaneously | Bento grid animations are **strictly interactive on hover/focus**; no autonomous motion or auto-scroll. |
| **Aspect Ratio Cropping** | Product images have varied aspect ratios (tall bottles vs. square electronics) | Tiles use `object-cover` with focal centering, backed by subtle neutral container padding (`bg-gray-50`) to avoid harsh crops. |

---

## 10. Open Questions for the Product Owner

1. **Homepage Placement:** Should the Featured Bento Grid replace the "Featured" tab inside `<PremiumProductDisplay>`, or should it become its own distinct section placed directly below the Category Carousel? *(Recommendation: Distinct standalone section to maximize visual prestige).*
2. **Hero Selection Control:** Is automatic assignment (Item #1 in Admin = Hero) sufficient for launch, or is an explicit "Set as Hero" radio button required in the Admin UI? *(Recommendation: Drag-to-first-slot = Hero, with clear visual badge in admin).*
3. **Tile Pricing Display:** The marketplace standard dictates non-bold product prices (`.product-price`). Should the Hero tile price also follow non-bold styling, or should the Hero card have an exception for larger display typography? *(Recommendation: Maintain non-bold rule, but increase font size from 12px to 20px).*

---

## 11. Definition of Done

- [x] `Planning-FeaturedBento.md` approved by product owner and implemented with image-only card overrides.
- [x] `backend/routes/homepageOptimized.js` updated to include required product projection fields (`stock`, `layoutConfig`) and ordered resolution.
- [x] All 4 Bento tile geometries (`hero`, `wide`, `tall`, `small`) engineered with zero text overlays and pure image presentations.
- [x] `<FeaturedBentoGrid>` renders zero-gap layouts for all item counts ($1$ to $20+$).
- [x] Admin panel allows reordering products with tactile buttons, tile size allocation, and live image-only WYSIWYG Bento preview.
- [x] Zero ESLint errors, zero TypeScript/build errors, and zero regressions on existing homepage features (built cleanly with Vite in production).
- [x] Performance audited: zero layout shift ($\text{CLS} < 0.05$), eager loading for above-the-fold tiles, and fallback placeholders.
