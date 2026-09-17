# WordPress Architecture Analysis: DoctorCheck.vn

Audited from public HTTP responses, rendered DOM, source scripts, stylesheets, and public REST API endpoints (`https://doctorcheck.vn/wp-json/`).

Classification Standards:
- **`CONFIRMED`**: Directly verified via explicit public endpoints, exact code strings, or HTTP headers.
- **`DETECTED`**: Observable from script URLs, stylesheet signatures, query parameters, or DOM tags.
- **`INFERRED`**: Logical conclusion based on architectural combinations, conventions, or plugin footprints.
- **`UNKNOWN`**: Private/backend details that cannot be inspected without server-side / admin credentials.

---

## 1. Core Platform & CMS

| Dimension | Finding | Classification | Verification Detail / Source |
| :--- | :--- | :--- | :--- |
| **CMS Platform** | WordPress | **`CONFIRMED`** | Present in `/wp-includes/`, `/wp-content/`, `/wp-json/wp/v2/`. |
| **WordPress Core Version** | ~6.6.x – 6.7.x | **`INFERRED`** | Generator meta replaced by WP Rocket; block-library styles and REST API schema indicate modern WP 6.6+. |
| **Optimization / Caching** | WP Rocket v3.20.3 | **`CONFIRMED`** | `<meta name="generator" content="WP Rocket 3.20.3" />`. |
| **Secondary Asset Cache** | Perfmatters v2.5.2 | **`CONFIRMED`** | Minified script URL `/wp-content/cache/perfmatters/.../index.min.js?ver=2.5.2`. |
| **Web Server / Proxy** | Cloudflare / Nginx | **`CONFIRMED`** | Cloudflare HTTP response headers, Cloudflare Images CDN, and proxy headers. |
| **PHP Environment** | PHP 8.1+ | **`INFERRED`** | Compatibility requirements of Flatsome 3.19.8 and modern WooCommerce. Exact version **`UNKNOWN`**. |
| **Database Architecture** | MySQL / MariaDB | **`INFERRED`** | Standard WordPress relational database engine. Exact version **`UNKNOWN`**. |

---

## 2. Active Themes

| Component | Finding | Classification | Verification Detail / Source |
| :--- | :--- | :--- | :--- |
| **Parent Theme** | Flatsome v3.19.8 | **`CONFIRMED`** | `/wp-content/themes/flatsome/assets/css/flatsome.css?ver=3.19.8`, `flatsome.js`, UX Builder blocks. |
| **Child Theme** | `doctorcheck` v3.0 | **`CONFIRMED`** | `/wp-content/themes/doctorcheck/style.css?ver=3.0`, custom CSS modules (`doctor-boxes.css`, `header-ldp.css`, `kdn.css`, `appv3.css`). |
| **Page Builder** | Flatsome UX Builder | **`CONFIRMED`** | Heavy usage of UX shortcodes, `[block id="..."]`, `blocks-sitemap.xml` with 21 reusable blocks. |

---

## 3. Detected Plugins

| Plugin Name | Detected Version | Classification | Function / Purpose on Live Site |
| :--- | :--- | :--- | :--- |
| **Rank Math PRO** | Pro version | **`CONFIRMED`** | `class="rank-math-schema-pro"`, generates XML sitemaps, JSON-LD Schema.org graphs. |
| **Contact Form 7** | v6.0.3 | **`CONFIRMED`** | `/wp-content/plugins/contact-form-7/`, powers consultation booking forms. |
| **WooCommerce** | Modern store API | **`CONFIRMED`** | Custom Post Type `product` for medical packages, `/wp-json/wc/store/v1/`, `woocommerce.js`. |
| **WP Rocket** | v3.20.3 | **`CONFIRMED`** | Page caching, preloading fonts, script delay (`type="pmdelayedscript"`). |
| **Perfmatters** | v2.5.2 | **`CONFIRMED`** | Asset minification and selective script unloading. |
| **Widget Google Reviews** | v5.5 | **`CONFIRMED`** | `/wp-content/plugins/widget-google-reviews/assets/css/public-main.css?ver=5.5`. |
| **WP Statistics** | v14.12.1 | **`CONFIRMED`** | Server-side visitor statistics and page hit counter. |
| **Jetpack** | Modern API | **`DETECTED`** | Endpoint `/wp-json/jetpack/v4/` registered in REST namespaces. |

---

## 4. Public REST API Endpoints (`/wp-json/`)

All queried endpoints are publicly accessible without authentication:

| Endpoint | Record Count | Classification | Payload / Purpose |
| :--- | :--- | :--- | :--- |
| `/wp-json/wp/v2/pages` | 55 pages | **`CONFIRMED`** | Static marketing pages, landing page sub-templates. |
| `/wp-json/wp/v2/posts` | 108 posts | **`CONFIRMED`** | Blog articles, patient educational guides, news releases. |
| `/wp-json/wp/v2/doctor` | 7 doctors | **`CONFIRMED`** | Doctor profiles with titles, bios, hospitals, and specialty taxonomies. |
| `/wp-json/wp/v2/categories` | 30 categories | **`CONFIRMED`** | Category tax terms for blogs and guides. |
| `/wp-json/wp/v2/product` | 9 products | **`CONFIRMED`** | Medical examination packages managed as WooCommerce products. |
| `/wp-json/wp/v2/faq` | 4 FAQs | **`CONFIRMED`** | Dedicated FAQ custom post type entries. |
| `/wp-json/wp/v2/blocks` | 21 UX blocks | **`CONFIRMED`** | Flatsome UX builder reusable layout components. |
| `/wp-json/contact-form-7/v1/contact-forms` | Forbidden (403) | **`CONFIRMED`** | List is private; `/contact-forms/<id>/feedback` accepts public POST submissions. |

---

## 5. Media & Image Delivery Strategy

| Dimension | Finding | Classification | Verification Detail / Source |
| :--- | :--- | :--- | :--- |
| **Primary Media CDN** | Cloudflare Images | **`CONFIRMED`** | Over 95% of live images served via `https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/`. |
| **Dynamic Resizing** | Supported | **`CONFIRMED`** | URL path modifiers (`/w=399,h=396`, `/w=281,h=281,fit=crop`, `/w=2560`, uncompressed `/w=9999`). |
| **Local Uploads** | `/wp-content/uploads/` | **`CONFIRMED`** | Certain SVG icons and PDF documents are hosted directly on domain. |
| **Next-Gen Image Formats** | WebP / SVG | **`CONFIRMED`** | Images are predominantly WebP and vector SVGs. |

---

## 6. Typography & Font Hosting

| Font Family | Format | Classification | Hosting Path / Evidence |
| :--- | :--- | :--- | :--- |
| **SVN-SofiaPro** (5 weights) | WOFF2 | **`CONFIRMED`** | `/wp-content/themes/doctorcheck/assets/fonts/SVN-SofiaPro-*.woff2`. |
| **fl-icons** | WOFF2, TTF | **`CONFIRMED`** | `/wp-content/themes/flatsome/assets/css/icons/fl-icons.woff2`. |
| **dc-icons** (Tabler) | WOFF2, CSS | **`CONFIRMED`** | `/wp-content/themes/doctorcheck/assets/fonts/dc-icons.min.css?ver=7.1`. |
| **Inter / Cardo** | WOFF2 | **`DETECTED`** | WooCommerce fallback font assets. |

---

## 7. Third-Party Services & Integrations

| Service | Identifier / Script URL | Classification | Functional Role |
| :--- | :--- | :--- | :--- |
| **Microsoft Clarity** | Project `iaa767fkfn` | **`CONFIRMED`** | Heatmaps and session video recording. |
| **TikTok Pixel** | ID `CJSOI6BC77UDO397GB30` | **`CONFIRMED`** | Advertising conversion and retargeting tracking. |
| **Google Tag Manager** | Standard container | **`CONFIRMED`** | Tag orchestration (Google Ads, GA4). |
| **Admicro Network** | `static.amcdn.vn` | **`CONFIRMED`** | Vietnamese local ad network tracking. |
| **Zalo Official Account** | OA ID `309834292180920772` | **`CONFIRMED`** | Direct medical advisory chat widget. |
| **Google Reviews** | `widget-google-reviews` | **`CONFIRMED`** | Live clinic rating badges. |
| **CRM / Lead Receiver** | Server-side script / webhook | **`UNKNOWN`** | CF7 target destination beyond local WP mailer is private. |
