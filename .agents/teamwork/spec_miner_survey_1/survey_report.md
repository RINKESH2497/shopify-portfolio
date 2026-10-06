# Specification Mining & Requirements Survey Report
**Project**: Shopify-Focused Portfolio Engine & Multi-Store Showcase  
**Author**: Spec Miner Survey 1 (`teamwork_preview_spec_miner`)  
**Workspace**: `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio`  
**Authoritative Source**: `ORIGINAL_REQUEST.md` (Dated 2026-10-05T08:52:10Z)  
**Status**: Complete  

---

## Executive Summary

The project requires the development of a production-grade, highly performant, accessible Shopify-focused portfolio application in React. It features:
1. **A Shared Reusable E-Commerce Engine** powering state, persistence, browsing, filtering, search, cart, wishlist, checkout simulation, and demo accounts.
2. **A Reusable Theme & Section Library** consisting of at least 14 modular sections and a theme configuration architecture.
3. **Four Visually Distinct Demo Stores** (Coffee, Fashion, Jewelry, Electronics) with distinct palettes, typography pairings, border radii, animation personalities, and 15–20 realistic demo products each.
4. **Strict Responsive Design** across 6 explicit breakpoints: 320px, 375px, 390px, 1024px, 1280px, 1440px with mobile drawers, sticky mobile Add-to-Cart bar, and desktop hover/grid states.
5. **Zero-Code-Change Extensibility** allowing at least 6 additional stores to be added solely by supplying a theme configuration, product dataset, and route entry.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Engine: Browsing | **PDP Gallery & Media** (`FEAT-PDP-01`) | Product detail page featuring multi-image gallery with thumbnail selection or swipe carousel and zoom/fullscreen preview. | Product ID, image array, selected image index. | Active image display, thumbnails, responsive sizing. | Missing image falls back to placeholder SVG with descriptive alt text. | ORIGINAL_REQUEST.md §R1, AC-EC-10 |
| 2 | Engine: Browsing | **Variant Selection** (`FEAT-PDP-02`) | Interactive selection of product options (size, color, grind/material/specs) updating active SKU and pricing. | User click/tap on option pill/swatch (e.g. Size "L", Color "Gold"). | Updated selected variant state, updated active price display. | Unavailable combination displays "Out of Stock" / disabled state. | ORIGINAL_REQUEST.md §R1, AC-EC-10, AC-EC-11 |
| 3 | Engine: Browsing | **Quantity Selector** (`FEAT-PDP-03`) | Increment/decrement and direct number entry for product quantity before adding to cart. | Plus/minus button clicks, manual integer input. | Numeric quantity value (>= 1). | Enforces minimum of 1; non-numeric inputs clamp to 1. | ORIGINAL_REQUEST.md §R1, AC-EC-10 |
| 4 | Engine: Browsing | **Ratings & Reviews Display** (`FEAT-PDP-04`) | Visual star ratings (0–5), average score, and total review count displayed on PDP and product cards. | Product rating metadata (score: float, count: integer). | Rendered star icons, rating badge, review summary. | Default to 0 reviews / unrated badge if rating data missing. | ORIGINAL_REQUEST.md §R1, AC-EC-10 |
| 5 | Engine: Browsing | **Related Products** (`FEAT-PDP-05`) | Algorithmically/tag-filtered carousel or grid of related items from the same store collection. | Current product ID, category/tags, collection dataset. | Grid or carousel of 3–4 relevant product cards. | If no related items match, fallback to top-rated store items. | ORIGINAL_REQUEST.md §R1, AC-EC-10 |
| 6 | Engine: Browsing | **Sticky Mobile ATC Bar** (`FEAT-PDP-06`) | Persistent bottom bar on mobile viewports (<768px/375px) with product title, price, and "Add to Cart" button. | Scroll position passing main Add-to-Cart button. | Fixed bottom banner with CTA and price. | Respects safe-area-inset-bottom; hidden on desktop. | ORIGINAL_REQUEST.md §R4, AC-RD-04 |
| 7 | Engine: Collections | **Multi-Facet Filtering** (`FEAT-PLP-01`) | Filter collection products simultaneously by category, price range, color, size, and rating. | Filter selections (active categories, price bounds, attributes). | Filtered product array matching ALL active facets (AND logic). | 0 matches renders dedicated "No products found" + Clear Filters CTA. | ORIGINAL_REQUEST.md §R1, AC-EC-08 |
| 8 | Engine: Collections | **Multi-Attribute Sorting** (`FEAT-PLP-02`) | Reorder products by Price (Low→High, High→Low), Newest, Highest Rated, and Bestselling. | Sort option dropdown selection. | Re-sorted product array. | Deterministic fallback to product ID if sort keys are identical. | ORIGINAL_REQUEST.md §R1, AC-EC-09 |
| 9 | Engine: Collections | **Pagination / Load More** (`FEAT-PLP-03`) | Chunked display of products (e.g. 8–12 per page) with page buttons or "Load More" button. | Page number or load-more trigger. | Appended or sliced product list view. | Reaches end of catalog: disables "Load More" or caps page index. | ORIGINAL_REQUEST.md §R1 |
| 10 | Engine: Collections | **Mobile Filter Drawer** (`FEAT-PLP-04`) | Slide-over drawer on mobile viewports displaying filter facets and count badge. | Tap on "Filters" button on mobile viewports. | Slide-over drawer with backdrop overlay, facet accordions, "Apply" CTA. | Traps focus; closes cleanly on backdrop tap or ESC key. | ORIGINAL_REQUEST.md §R4 |
| 11 | Engine: Cart | **Cart Drawer & Page** (`FEAT-CRT-01`) | Dual-view cart: Slide-out drawer accessible from header and standalone `/cart` full page. | Open drawer trigger (header icon / ATC action), route `/cart`. | Rendered drawer with overlay OR full dedicated cart view. | Empty cart state when 0 items present; links to collection. | ORIGINAL_REQUEST.md §R1, AC-EC-01, AC-RD-03 |
| 12 | Engine: Cart | **Variant-Aware Item Add** (`FEAT-CRT-02`) | Adding items with specific variant options; items with distinct variants create distinct line items. | Product ID, variant ID, selected options, unit price, quantity. | Line item added or quantity incremented in cart state. | If variant required but unselected, alerts user / selects default. | ORIGINAL_REQUEST.md §R1, AC-EC-01 |
| 13 | Engine: Cart | **Quantity & Removal** (`FEAT-CRT-03`) | In-cart quantity adjustment and item removal with live price recomputation. | Increment (+), decrement (-), remove button click. | Updated line item quantity, updated subtotal/total. | Decrementing below 1 removes item or prompts; empty cart shown if 0. | ORIGINAL_REQUEST.md §R1, AC-EC-02, AC-EC-03 |
| 14 | Engine: Cart | **Price Calculations** (`FEAT-CRT-04`) | Accurate subtotal, discount, shipping, and total calculations with 2-decimal precision. | Line items array, active discount code, shipping rules. | Formatted monetary values ($XX.XX) for subtotal, discount, tax, total. | Avoid floating point errors via integer cent math or rounded math. | ORIGINAL_REQUEST.md §R1, AC-EC-02 |
| 15 | Engine: Cart | **Free Shipping Bar** (`FEAT-CRT-05`) | Dynamic progress bar indicating dollar amount remaining to unlock free shipping. | Subtotal, store-configured free shipping threshold (e.g. $75). | Progress percentage bar (0–100%) and message ("Add $X for free shipping"). | Subtotal >= threshold displays celebratory "You qualified for free shipping!". | ORIGINAL_REQUEST.md §R1 |
| 16 | Engine: Cart | **Header Cart Badge** (`FEAT-CRT-06`) | Header icon displaying total item count with real-time update animation. | Global cart state change. | Badge displaying sum of all item quantities. | Hidden or displays 0 when cart is empty. | ORIGINAL_REQUEST.md §R1, AC-EC-01 |
| 17 | Engine: Wishlist | **Wishlist Toggle & Save** (`FEAT-WSH-01`) | Toggle heart icon on product cards and PDP to add/remove item from wishlist. | Product ID click. | Updated wishlist array; heart icon active state filled/colored. | Idempotent toggle; no duplicate entries. | ORIGINAL_REQUEST.md §R1, AC-EC-05 |
| 18 | Engine: Wishlist | **Move to Cart** (`FEAT-WSH-02`) | Button to transfer item from wishlist into cart; removes item from wishlist. | "Move to Cart" button click on wishlist item. | Item added to cart; item removed from wishlist; counts updated. | If product has variants, selects first variant; notifies user. | ORIGINAL_REQUEST.md §R1, AC-EC-06 |
| 19 | Engine: Wishlist | **Dedicated Wishlist View** (`FEAT-WSH-03`) | Dedicated drawer or page view listing all saved items with quick-add actions. | Navigation to wishlist route or modal. | Grid/list of wishlisted items with thumbnail, price, "Move to Cart". | Empty wishlist shows bookmark icon and "No items saved" CTA. | ORIGINAL_REQUEST.md §R1, AC-EC-05 |
| 20 | Engine: Search | **Instant Search Overlay** (`FEAT-SCH-01`) | Search overlay/modal triggering instant predictive search as user types. | Keystrokes in search input field. | Real-time dropdown/grid of matching product results. | Debounced input; closes on ESC or overlay click. | ORIGINAL_REQUEST.md §R1, AC-EC-07 |
| 21 | Engine: Search | **Multi-Field Query Match** (`FEAT-SCH-02`) | Matches search terms across product title, description, category, and tags. | Search query string. | Ranked array of matching products. | Case-insensitive; trims leading/trailing whitespace. | ORIGINAL_REQUEST.md §R1, AC-EC-07 |
| 22 | Engine: Search | **Recent Searches History** (`FEAT-SCH-03`) | Displays chips/list of recent user search terms when input is focused. | User submitted search queries. | List of recent search strings with "Clear History" action. | Capped at 5–8 items; deduplicated. | ORIGINAL_REQUEST.md §R1 |
| 23 | Engine: Search | **No-Results State** (`FEAT-SCH-04`) | Clear visual state when search yields zero matches, offering suggested products/searches. | Query with 0 matches (e.g. gibberish `xyz123`). | "No results found for 'xyz'" message + suggested keywords/products. | Graceful rendering without blank screen or uncaught errors. | ORIGINAL_REQUEST.md §R1, AC-EC-07 |
| 24 | Engine: Checkout | **Simulated Multi-Step Checkout** (`FEAT-CHK-01`) | 4-step demo checkout: 1. Information -> 2. Shipping -> 3. Payment UI -> 4. Confirmation. | Step navigation triggers, mock form inputs. | Sequential step progression with active step indicator. | Clearly marked with prominent "DEMO ONLY - NO REAL PAYMENT" badge. | ORIGINAL_REQUEST.md §R1 |
| 25 | Engine: Checkout | **Step Form Validation** (`FEAT-CHK-02`) | Client-side validation of customer name, email format, address fields, mock card. | User submission on each step. | Transition to next step or field validation error indicators. | Blocks step progression if required fields are blank/invalid. | ORIGINAL_REQUEST.md §R1 |
| 26 | Engine: Checkout | **Order Confirmation & Cart Reset** (`FEAT-CHK-03`) | Final confirmation screen with generated order number, summary, and cart clearance. | Successful completion of Step 3 (Payment). | Confirmation view with order details; cart emptied in localStorage. | Prevents duplicate submissions with button disable during mock processing. | ORIGINAL_REQUEST.md §R1 |
| 27 | Engine: Account | **Demo Account Portal** (`FEAT-ACC-01`) | Account UI with Profile, Orders History, Saved Addresses, and Wishlist tabs. | Tab selection clicks. | Rendered active tab view with realistic demo mock data. | Clearly marked as demo; no real server authentication required. | ORIGINAL_REQUEST.md §R1 |
| 28 | Engine: Storage | **LocalStorage Persistence Engine** (`FEAT-STO-01`) | Automatic serialization and deserialization of cart, wishlist, and recently viewed. | State transitions in cart, wishlist, viewed items. | Persistent browser localStorage records. | Safe JSON parse with try/catch; resets to defaults on corrupted JSON. | ORIGINAL_REQUEST.md §R1, AC-EC-04, AC-EC-05 |
| 29 | Theme: Config | **Theme Configuration Schema** (`FEAT-THM-01`) | Typed JSON/TS theme configuration controlling colors, fonts, radii, spacing, buttons, headers. | Store theme config object. | Injected CSS variables or styled theme provider. | Missing config values fallback to sane engine defaults. | ORIGINAL_REQUEST.md §R2, AC-EX-02 |
| 30 | Section: Hero | **Standard Hero** (`FEAT-SEC-01`) | High-impact banner with headline, subhead, CTA buttons, background image/overlay. | Section config (heading, subtitle, ctaText, ctaLink, bgImage, alignment). | Rendered hero banner with theme typography and button styles. | Image load failure uses fallback gradient/pattern. | ORIGINAL_REQUEST.md §R2, AC-VD-04 |
| 31 | Section: Hero | **Split Hero** (`FEAT-SEC-02`) | 50/50 split layout featuring editorial copy on one side and high-res lifestyle image on the other. | Section config (copy side, image side, badge, link). | Two-column desktop / stacked mobile split hero section. | Clean stacking order on mobile (image top or text top per config). | ORIGINAL_REQUEST.md §R2, AC-VD-04 |
| 32 | Section: Hero | **Fullscreen / Video Hero** (`FEAT-SEC-03`) | Immersive 100vh hero with video background / cinematic image and centered minimal branding. | Section config (videoUrl/poster, overlayOpacity, text content). | Fullscreen viewport banner with smooth scroll cue. | Video autoplay failure falls back gracefully to poster image. | ORIGINAL_REQUEST.md §R2, AC-VD-04 |
| 33 | Section: Product | **Featured Products Section** (`FEAT-SEC-04`) | Curated grid of highlight products with quick-add actions and badges ("New", "Sale"). | Store product dataset, product IDs list, columns count. | Responsive product grid (2–4 cols). | Gracefully renders available products if IDs count < expected. | ORIGINAL_REQUEST.md §R2 |
| 34 | Section: Product | **Product Carousel** (`FEAT-SEC-05`) | Swipeable/scrollable carousel with arrow controls and pagination dots. | Product array, itemsPerView, autoplay setting. | Interactive horizontal slider/carousel. | Supports touch gestures on mobile; keyboard navigation on arrows. | ORIGINAL_REQUEST.md §R2, §R4 |
| 35 | Section: Media | **Collection Cards / Banners** (`FEAT-SEC-06`) | Visual category navigation cards with hover zoom and collection links. | Collections metadata array (title, image, link, productCount). | Responsive grid of image cards with overlaid labels. | Accessible link wrapping; alt tags present. | ORIGINAL_REQUEST.md §R2 |
| 36 | Section: Story | **Image + Text Section** (`FEAT-SEC-07`) | Asymmetric editorial section pairing lifestyle photography with brand narrative. | Section config (headline, narrative text, image, layout orientation). | Content block with configurable left/right image orientation. | Flips cleanly to stacked layout on viewports <1024px. | ORIGINAL_REQUEST.md §R2 |
| 37 | Section: Social | **Testimonials & Reviews** (`FEAT-SEC-08`) | Customer quote cards with avatars, verified buyer badges, and star ratings. | Reviews array (author, rating, text, location/title). | Grid or carousel of stylized testimonial cards. | Handles varying text lengths without card height clipping. | ORIGINAL_REQUEST.md §R2 |
| 38 | Section: Brand | **Logo Cloud** (`FEAT-SEC-09`) | Press / partner / certification logo showcase (e.g. "As seen in Vogue, Wired, Sprudge"). | Logo items array (name, svg/image, url). | Greyscale or theme-accented logo row with responsive wrapping. | Crisp vector/image rendering without distortion. | ORIGINAL_REQUEST.md §R2 |
| 39 | Section: Brand | **Marquee Banner** (`FEAT-SEC-10`) | Continuously scrolling text/icon ticker for announcements or brand slogans. | Text phrases array, speed, direction. | Smooth infinite CSS marquee animation. | Pauses on hover/focus for accessibility (prefers-reduced-motion respected). | ORIGINAL_REQUEST.md §R2 |
| 40 | Section: Lead | **Newsletter Signup** (`FEAT-SEC-11`) | Email subscription form with incentive copy and instant simulated success feedback. | Section config (headline, perk text, placeholder). | Form with input, submit button, simulated success toast. | Validates email syntax; shows immediate feedback without reload. | ORIGINAL_REQUEST.md §R2 |
| 41 | Section: Info | **FAQ Accordion** (`FEAT-SEC-12`) | Expandable question & answer accordions with animated chevron indicators. | Q&A items array (question, answer). | Interactive accessible accordions with ARIA expand/collapse. | Multiple or single open item mode; smooth height transition. | ORIGINAL_REQUEST.md §R2 |
| 42 | Section: Story | **Editorial Grid** (`FEAT-SEC-13`) | Magazine-style asymmetric grid combining varying aspect ratios, quotes, and products. | Grid items array (type: image/text/product, span: col/row). | Dynamic CSS grid matching store art direction. | Re-flows into single/double column on tablet and mobile. | ORIGINAL_REQUEST.md §R2 |
| 43 | Store: Coffee | **Coffee Demo Store** (`FEAT-STR-01`) | Warm earthy artisan coffee brand: rounded shapes, organic layout, warm serif typography. | Theme config `coffee.theme.ts`, products `coffee.products.ts`. | Complete store at `/coffee` with unique section ordering and feel. | Completely distinct from Fashion, Jewelry, Electronics. | ORIGINAL_REQUEST.md §R3, AC-BN-03, AC-VD-01-05 |
| 44 | Store: Fashion | **Fashion Demo Store** (`FEAT-STR-02`) | Minimal monochrome editorial fashion brand: large grotesque fonts, fullscreen hero, whitespace. | Theme config `fashion.theme.ts`, products `fashion.products.ts`. | Complete store at `/fashion` with unique section ordering and feel. | Completely distinct from Coffee, Jewelry, Electronics. | ORIGINAL_REQUEST.md §R3, AC-BN-03, AC-VD-01-05 |
| 45 | Store: Jewelry | **Jewelry Demo Store** (`FEAT-STR-03`) | Luxury fine jewelry brand: dark/cream/gold palette, elegant serif, split hero, slow transitions. | Theme config `jewelry.theme.ts`, products `jewelry.products.ts`. | Complete store at `/jewelry` with unique section ordering and feel. | Completely distinct from Coffee, Fashion, Electronics. | ORIGINAL_REQUEST.md §R3, AC-BN-03, AC-VD-01-05 |
| 46 | Store: Tech | **Electronics Demo Store** (`FEAT-STR-04`) | Modern tech brand: sharp 0px radii, cyber contrast, technical typography, specs comparison. | Theme config `electronics.theme.ts`, products `electronics.products.ts`. | Complete store at `/electronics` with specs table and sharp UI. | Completely distinct from Coffee, Fashion, Jewelry. | ORIGINAL_REQUEST.md §R3, AC-BN-03, AC-VD-01-05 |
| 47 | Responsive | **Multi-Breakpoint Engine** (`FEAT-RSP-01`) | Certified layout rendering across 320px, 375px, 390px, 1024px, 1280px, 1440px. | Viewport width resize triggers. | Adaptive UI layout matching responsive rules per device class. | Zero horizontal scrollbars or element clipping at all widths. | ORIGINAL_REQUEST.md §R4, AC-RD-01-06 |
| 48 | Responsive | **Mobile Hamburger & Drawer** (`FEAT-RSP-02`) | Hamburger menu button opening slide-out mobile navigation drawer on viewports <1024px. | Tap on hamburger icon. | Slide-over drawer with store navigation links, currency/store switcher. | Traps focus; body scroll locked while open; closes on tap outside. | ORIGINAL_REQUEST.md §R4, AC-RD-02 |
| 49 | Extensibility | **Pluggable Architecture** (`FEAT-EXT-01`) | Adding a store requires only 1 theme config, 1 product data file, and 1 route entry. | New theme config + new product array + route entry. | Functional new store with zero modifications to engine components. | Errors isolated to new store if bad config; does not break existing stores. | ORIGINAL_REQUEST.md §R5, AC-EX-01-03 |
| 50 | Extensibility | **Architecture Documentation** (`FEAT-EXT-02`) | Explicit developer guide in README.md or ARCHITECTURE.md detailing new store addition. | Documentation file. | Step-by-step instructions with code examples and schema interfaces. | N/A (Static technical documentation). | ORIGINAL_REQUEST.md §R5, AC-EX-01 |

---

## Complete Acceptance Criteria Matrix

| Criterion ID | Category | Specific Requirement | Verification Condition & Test Vector | Success Indicator |
|--------------|----------|----------------------|---------------------------------------|-------------------|
| **AC-BN-01** | Build & Nav | `npm install && npm run build` completes without errors | Execute `npm run build` in root workspace | Exit code 0, 0 build errors, production bundle emitted |
| **AC-BN-02** | Build & Nav | `npm run dev` starts development server | Execute `npm run dev` in root workspace | Dev server spins up on localhost, HTTP 200 on initial fetch |
| **AC-BN-03** | Build & Nav | Store route isolation | Navigate to `/coffee`, `/fashion`, `/jewelry`, `/electronics` | Each route loads corresponding store theme and catalog |
| **AC-BN-04** | Build & Nav | Internal store navigation | Traverse Homepage -> Collection -> Product -> Cart -> Search -> Account | Zero runtime exceptions, zero blank screens, URL updates |
| **AC-BN-05** | Build & Nav | Browser history navigation | Perform navigation actions, then click Browser Back & Forward | Views reflect correct historical states without page desync |
| **AC-EC-01** | E-Commerce | Cart item addition & header update | Click "Add to Cart" on PDP | Header cart badge increments by 1; cart drawer opens displaying item |
| **AC-EC-02** | E-Commerce | Cart quantity modification | Click `+` or `-` button in cart item row | Item quantity updates; subtotal and total recompute immediately |
| **AC-EC-03** | E-Commerce | Empty cart state rendering | Remove all items from cart | Drawer/page renders empty cart illustration + "Continue Shopping" CTA |
| **AC-EC-04** | E-Commerce | Cart persistence | Add items to cart, refresh page (F5) | Cart badge and drawer retain all items and exact quantities |
| **AC-EC-05** | E-Commerce | Wishlist persistence | Click heart on product, refresh page (F5) | Heart icon remains active; item persists in wishlist view |
| **AC-EC-06** | E-Commerce | Wishlist move-to-cart | Click "Move to Cart" on wishlisted item | Item appears in cart; item is removed from wishlist; counts sync |
| **AC-EC-07** | E-Commerce | Search accuracy & no-results | Query known term (e.g. "Espresso"); query gibberish (e.g. "xyz789") | Valid query shows matching items; gibberish displays friendly empty state |
| **AC-EC-08** | E-Commerce | Collection filtering | Select filter checkbox (e.g. Category = "Rings") | Displayed product list narrows strictly to items matching criterion |
| **AC-EC-09** | E-Commerce | Collection sorting | Select sort "Price: Low to High" | Products reorder such that `price[i] <= price[i+1]` for all items |
| **AC-EC-10** | E-Commerce | PDP component completeness | Navigate to any PDP | Page contains Gallery, Variant Selectors, Qty Selector, Rating, Related |
| **AC-EC-11** | E-Commerce | Variant price updating | Change variant option having distinct price | Displayed price dynamically updates to match the selected variant price |
| **AC-VD-01** | Visual Distinction | Distinct color palettes | Inspect computed primary colors across all 4 stores | No two stores share the same primary hex/color token |
| **AC-VD-02** | Visual Distinction | Distinct font pairings | Inspect computed heading and body font families | Each store has a unique heading + body font combination |
| **AC-VD-03** | Visual Distinction | Distinct homepage section orders | Compare array of section types rendered on each store homepage | All 4 stores feature a different, unique sequence of sections |
| **AC-VD-04** | Visual Distinction | Distinct hero variants | Inspect hero section on each store homepage | Coffee, Fashion, Jewelry, Electronics use different hero types |
| **AC-VD-05** | Visual Distinction | Distinct header styles | Inspect header layouts (logo alignment, background, search style) | Distinct header layout/visual treatments across stores |
| **AC-RD-01** | Responsive | 375px mobile horizontal overflow | Render all 4 homepages at viewport width 375px | `document.documentElement.scrollWidth === window.innerWidth` (no overflow) |
| **AC-RD-02** | Responsive | 375px hamburger navigation | Click hamburger button at 375px width | Mobile navigation drawer opens smoothly, displaying store links |
| **AC-RD-03** | Responsive | 375px cart drawer usability | Open cart drawer at 375px width | Cart drawer fills viewport appropriately; buttons are clickable; no clipping |
| **AC-RD-04** | Responsive | 375px sticky mobile ATC bar | Scroll down PDP past fold at 375px width | Fixed bottom bar appears with product title, price, and "Add to Cart" CTA |
| **AC-RD-05** | Responsive | 1440px desktop grid & menu | Render collection page and header at 1440px width | Products render in 3–4 column grid; desktop expanded menu visible |
| **AC-RD-06** | Responsive | 1024px tablet layout transition | Resize viewport through 1024px boundary | UI transitions smoothly between mobile drawer and desktop expanded patterns |
| **AC-EX-01** | Extensibility | Architecture guide availability | Inspect root directory for README.md or ARCHITECTURE.md | File exists containing clear instructions for adding a new store |
| **AC-EX-02** | Extensibility | Self-contained theme configs | Inspect theme files in code structure | Themes are isolated objects/files; modifying one does not affect others |
| **AC-EX-03** | Extensibility | Isolated product datasets | Inspect product files in code structure | Each store has its own independent data file (15–20 products each) |

---

## Technical Constraints & Non-Functional Requirements

### 1. Viewport Breakpoints & Device Certification
Every page, drawer, modal, and component must be responsive and tested against:
- **320px**: Ultra-compact mobile (iPhone SE 1st Gen). Requires tight padding, flex wrapping, text wrapping, and zero horizontal scroll.
- **375px**: Standard compact mobile (iPhone SE 2nd/3rd Gen, iPhone 8). Explicit acceptance target for hamburger, cart drawer, and sticky ATC.
- **390px**: Modern mobile standard (iPhone 12/13/14/15, Galaxy S series). High DPI, safe-area inset compatibility.
- **1024px**: Tablet landscape & compact desktop (iPad Pro 11", small laptops). Transition threshold from mobile drawer to desktop navigation; 2-3 column grids.
- **1280px**: Standard desktop / laptop. 3-4 column grids, max container constraints, hover states active.
- **1440px**: Large desktop displays. Full 4-column product grids, expanded mega-menus, generous whitespace.

### 2. LocalStorage Architecture & Keys
To prevent cross-store data contamination while enabling persistence across page refreshes:
- **Store-Scoped Cart**: `shopify_portfolio_cart_${storeId}` (JSON array of `CartItem` objects).
- **Store-Scoped Wishlist**: `shopify_portfolio_wishlist_${storeId}` (JSON array of product IDs or objects).
- **Store-Scoped Recently Viewed**: `shopify_portfolio_recent_${storeId}` (JSON array of product IDs, max 10).
- **Global Search History**: `shopify_portfolio_search_history` or store-scoped `shopify_portfolio_search_${storeId}` (JSON array of strings, max 8).
- **Demo User Session**: `shopify_portfolio_demo_user` (JSON object with profile, addresses, orders).
- **Error Handling**: All reads and writes must be wrapped in `try { ... } catch (e) { ... }` to gracefully handle `QuotaExceededError`, private browsing restrictions, or malformed JSON.

### 3. Routing Paths & Navigation Structure
- Root Landing / Store Hub: `/` (Directory index showcasing the 4 stores and quick switcher)
- Store Base: `/:storeId` (e.g. `/coffee`, `/fashion`, `/jewelry`, `/electronics`)
- Store Collections / Catalog: `/:storeId/collections` and `/:storeId/collections/:collectionId`
- Store Product Detail Page: `/:storeId/products/:productId`
- Store Standalone Cart: `/:storeId/cart`
- Store Checkout Flow: `/:storeId/checkout`
- Store User Account: `/:storeId/account` (Tabs: Profile, Orders, Addresses, Wishlist)
- Store Wishlist: `/:storeId/wishlist` (Dedicated page or drawer)
- Store Search: Modal overlay across all pages, optional fallback route `/:storeId/search`

### 4. Demo Data Specifications
- **Product Count**: Exactly 15–20 realistic products per store (total 60–80 products across the 4 stores).
- **Product Schema**:
  - `id`: Unique string (e.g. `coffee-01`, `fashion-03`).
  - `storeId`: String matching store identifier.
  - `title`: Realistic product title (e.g. "Ethiopian Yirgacheffe Single Origin").
  - `handle` / `slug`: URL-friendly identifier.
  - `description`: Rich narrative product copy (2–3 paragraphs or features list).
  - `price`: Numeric base price (e.g. `22.00`).
  - `compareAtPrice`: Optional original price for sale items (e.g. `28.00`).
  - `category`: String (e.g. "Whole Bean", "Brewers", "Outerwear", "Earrings", "Audio").
  - `tags`: Array of strings (e.g. `["light-roast", "organic", "fair-trade"]`).
  - `rating`: Float (e.g. `4.8`).
  - `reviewCount`: Integer (e.g. `124`).
  - `images`: Array of 2–4 high-resolution Unsplash/Pexels URLs with descriptive alt text.
  - `variants`: Array of variant objects:
    - `id`: Unique variant string.
    - `name`: Variant title (e.g. "250g / Whole Bean", "Gold / Size 7", "Matte Black").
    - `price`: Numeric price for this variant (supports variant-specific price override).
    - `available`: Boolean in-stock flag.
    - `options`: Key-value pairs (e.g. `{ size: "250g", grind: "Whole Bean" }`).
  - `specs` / `details`: Key-value specifications (especially critical for Electronics and Coffee).
  - `isFeatured`: Boolean flag for homepage showcases.
  - `isNew`: Boolean flag for badges.

### 5. Architectural Non-Functional Requirements
- **Framework**: Modern React (Vite-based SPA recommended for instant builds and fast HMR).
- **Styling**: Tailwind CSS with CSS custom properties (variables) or dynamic theme providers to allow runtime store theme swapping without bundle bloat.
- **Type Safety**: TypeScript definitions for all themes, sections, products, and engine state.
- **Accessibility (a11y)**:
  - Accessible dialog/drawer primitives with keyboard focus traps, backdrop blur/overlay, and ESC key dismissal.
  - Touch target sizing >= 44x44px for all mobile interactive controls.
  - Semantic HTML (`<main>`, `<header>`, `<nav>`, `<aside>`, `<footer>`, `<article>`).
  - Color contrast ratio >= 4.5:1 for standard body text against background.
- **Performance**:
  - Image lazy loading (`loading="lazy"`).
  - Code splitting by store or route where beneficial.

---

## Edge Cases, Error Handling & Boundary Conditions

| # | Feature | Input / Boundary Condition | Observed & Required Behavior |
|---|---------|----------------------------|------------------------------|
| 1 | Cart: Quantity Floor | User clicks decrement (`-`) button when item quantity is 1 | Prompts removal confirmation or smoothly removes the item from the cart; quantity never drops to 0 or negative. |
| 2 | Cart: Zero Quantity Input | User types `0` or negative number in manual quantity input | Automatically resets to 1 or removes item; never allows `< 1` in state calculations. |
| 3 | Cart: Non-Numeric Input | User types letters, symbols, or whitespace in quantity input | Sanitizes input; falls back to current valid quantity or 1 without throwing NaN in pricing. |
| 4 | Cart: Extreme Quantity | User sets quantity to an excessively large number (e.g. 9999) | Clamps to maximum stock limit (e.g. 99) and informs user with subtle message. |
| 5 | Cart: Precision Rounding | Items with prices like `$19.99` and quantity `3` with `$5.00` discount | Subtotal `$59.97`, total `$54.97`; no IEEE-754 floating point artifacts like `$54.970000000000006`. |
| 6 | Cart: Free Shipping Boundary | Free shipping threshold is `$75.00`; cart subtotal is `$74.99` vs `$75.00` | At `$74.99`, displays "Add $0.01 for free shipping!" and adds standard shipping. At `$75.00`, displays "You unlocked free shipping!" and sets shipping fee to `$0.00`. |
| 7 | Cart: Empty State Action | User navigates directly to `/cart` or empties drawer | Renders friendly empty cart graphic, "Your cart is currently empty" text, and prominent "Explore Products" button routing to store collections. |
| 8 | Cart: Corrupted Storage | `localStorage` contains invalid/corrupted JSON string | Catches `JSON.parse` error, logs warning, initializes clean empty cart `[]`, and overwrites corrupted key. |
| 9 | Cart: Storage Quota Exceeded | Browser throws `QuotaExceededError` on `localStorage.setItem` | Catches error safely; keeps in-memory state active; notifies user that storage is full without crashing app. |
| 10 | Wishlist: Duplicate Toggle | User clicks wishlist heart icon twice in rapid succession | State cleanly toggles (add on first click, remove on second click); no duplicate IDs ever inserted into wishlist array. |
| 11 | Wishlist: Move to Cart with Variant | User clicks "Move to Cart" on a wishlist item with multiple variants | Defaults to the first available variant, transfers item into cart line items, and deletes the item from wishlist in a single atomic action. |
| 12 | Wishlist: Move Existing Cart Item | User moves wishlist item to cart, but that exact item/variant already exists in cart | Increments the existing cart line item quantity by 1, removes the item from wishlist, and highlights cart drawer. |
| 13 | Search: Whitespace Only | User inputs `   ` (spaces only) into search bar | Trims input; treats as empty search; displays recent searches or prompt rather than executing blank search. |
| 14 | Search: Special Regex Characters | User inputs `(test)`, `[foo]`, `*`, `+`, `?`, `^`, `$` in search query | Escapes special regex characters or uses `String.prototype.includes`; prevents `SyntaxError: Invalid regular expression`. |
| 15 | Search: Accented / Diacritic Characters | User searches "café" or "cafe" in Coffee store | Normalized search (`normalize('NFD')`) matches both "Café Roast" and "Cafe Roast". |
| 16 | Search: No-Results State | User inputs non-matching query e.g. `qwerty999` | Renders "No products found for 'qwerty999'", suggestions list ("Check spelling", "Try general keywords"), and popular recommendations. |
| 17 | Search: Rapid Typing / Debounce | User types 10 characters rapidly | Debounces search computation by 150–250ms to prevent UI stutter and unnecessary re-renders. |
| 18 | PLP: Contradictory Filters | User filters Category "Whole Bean" AND Size "XL" (which yields 0 matches) | Displays "No products match the selected filters" along with an active "Clear All Filters" button. |
| 19 | PLP: Equal Value Sort Stability | Two products have identical prices (e.g. `$25.00`) during "Price: Low to High" sort | Secondary sort key (e.g. product ID or title) ensures deterministic, non-jittery ordering across re-renders. |
| 20 | PDP: Multi-Option Combination | User selects Color "Rose Gold" and Size "12" where that combination is unavailable | Displays "Unavailable / Out of Stock" on Add to Cart button and prevents adding to cart. |
| 21 | PDP: Variant Price Shift | Base price `$120.00`, but variant "1TB SSD" has price `$220.00` | Price display updates smoothly to `$220.00`; Add to Cart payload sends `$220.00` variant. |
| 22 | Checkout: Direct Access with Empty Cart | User navigates directly to `/:storeId/checkout` when cart has 0 items | Redirects user to `/:storeId/cart` or `/:storeId` with notification "Your cart is empty". |
| 23 | Checkout: Step 1 Missing Fields | User clicks "Continue to Shipping" with blank email or address fields | Highlights invalid inputs in red with accessible error messages; blocks progression to Step 2. |
| 24 | Checkout: Invalid Email Format | User inputs `test@` or `invalid-email` | Displays "Please enter a valid email address"; blocks progression. |
| 25 | Checkout: Duplicate Payment Submit | User double-clicks "Complete Order" button in Payment step | Button disables immediately during simulated processing (1–2s delay); prevents generating duplicate orders. |
| 26 | Checkout: Post-Order State | Simulated order completes successfully | Empties cart in state and `localStorage`; generates realistic Order ID (e.g. `#SHPF-84920`); displays complete order receipt. |
| 27 | Responsive: 320px Micro Viewport | Screen resized to 320px width on PDP | Price, title, and buttons wrap cleanly without truncating or overflowing past 320px boundary. |
| 28 | Responsive: Scroll Lock on Open Drawers | Mobile nav drawer, filter drawer, or cart drawer opens | Adds `overflow: hidden` to `document.body` so background page cannot scroll behind open drawer; restores scroll on close. |
| 29 | Media: Broken Image URL Fallback | Placeholder image URL from Unsplash/Pexels fails to load (404/network error) | Image `onError` handler swaps `src` to an inline SVG styled placeholder matching store palette; keeps layout intact. |
| 30 | Extensibility: Missing Config Property | A new theme config omits optional styling token (e.g. `cardShadow`) | Theme engine applies fallback default token without breaking component rendering. |

---

## Thematic Differentiation Matrix (The 4 Stores)

To satisfy **R3** and **AC-VD-01 through AC-VD-05**, the four stores must be strictly distinguished across 10 architectural parameters:

| Parameter | Coffee Store (`/coffee`) | Fashion Store (`/fashion`) | Jewelry Store (`/jewelry`) | Electronics Store (`/electronics`) |
|-----------|--------------------------|----------------------------|----------------------------|-----------------------------------|
| **Industry / Theme** | Artisan Roastery & Coffee | Minimal Editorial Apparel | Luxury Fine Jewelry | Modern Tech & Gadgets |
| **Primary Color** | Warm Terracotta / Amber (`#C05621` / `#9C411E`) | Deep Noir / Ink (`#111111` / `#18181B`) | Royal Champagne Gold (`#D4AF37` / `#B8860B`) | Electric Cyan / Cyber Blue (`#0284C7` / `#2563EB`) |
| **Secondary & Surface** | Warm Cream / Beige (`#FDFBF7`, `#F5EBE1`) | Stark Pure White & Off-White (`#FFFFFF`, `#F4F4F5`) | Deep Midnight / Ivory (`#0F172A`, `#FAF9F6`) | Dark Slate / Graphite (`#0F172A`, `#1E293B`, `#F8FAFC`) |
| **Heading Font** | Editorial Warm Serif (*Fraunces* or *Playfair Display*) | Bold Condensed Grotesque (*Syne* or *Oswald* or *Montserrat*) | Classical High-Contrast Serif (*Cormorant Garamond* or *Cinzel*) | Technical Monospace/Sans (*Space Grotesk* or *JetBrains Mono*) |
| **Body Font** | Warm Humanist Sans (*Plus Jakarta Sans* or *Outfit*) | Clean Neutral Sans (*Inter* or *DM Sans*) | Elegant Light Sans (*Cinzel Decorative* or *Montserrat Light*) | High-Legibility Tech Sans (*Inter* or *Space Grotesk*) |
| **Border Radius** | Organic / Rounded (`12px` - `16px`, pill buttons) | Minimalist Crisp (`2px` - `4px`, sharp buttons) | Subtle Sophisticated (`4px` - `6px`, soft edges) | Sharp Geometric (`0px`, hard technical corners) |
| **Hero Variant** | **Split Hero** (Roast story copy + warm bean photography) | **Fullscreen / Video Hero** (100vh high-fashion model video/photo) | **Standard Hero** (Centered luxury jewelry focus, gold accents) | **Technical Split / Feature Hero** (Cyber gadget preview + specs) |
| **Homepage Section Sequence** | Hero -> Marquee -> Featured Beans -> Story (Image+Text) -> Brewing Carousel -> Reviews -> Newsletter | Hero -> Editorial Grid -> Featured Looks -> Marquee -> Collection Banners -> Testimonials -> Newsletter | Hero -> Collections Banner -> Featured Jewels -> Story Craft -> Reviews -> FAQ -> Newsletter | Hero -> Logo Cloud -> Featured Devices -> Specs Comparison -> Carousel -> FAQ -> Newsletter |
| **Header Style** | Left logo, warm cream background, rounded search pill | Minimal centered logo, transparent sticky header, stark icons | Centered elegant wordmark, dark luxury bar, gold accents | Left logo, tech utility bar with specs tag, sharp search bar |
| **Card Style** | Warm rounded cards with subtle drop shadows | Framed stark cards with heavy aspect ratio (3:4) and zoom | Framed delicate border cards with gold hover glow | Bordered cards with spec tags, badges, and sharp edges |
| **Animation Personality** | Smooth, organic, gentle fade & drift transitions | Cinematic, rapid reveal, bold scroll parallax | Slow, graceful, high-elegance fade transitions | Fast, sharp, snappy micro-interactions (100ms) |
