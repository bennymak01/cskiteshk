# CLAUDE.md - 專案指南

## 1. 專案簡介

`cskiteshk` 專案是一個靜態網站，主要用於展示和銷售風箏產品。它包含豐富的產品頁面、部落格文章、關於我們、聯絡方式、隱私政策和條款等資訊頁面。專案利用 Python 和 Node.js 腳本進行內容的自動化管理，例如產品資料抓取、部落格文章發佈和首頁更新，以確保網站內容的即時性和一致性。網站的目標是為用戶提供一個全面的風箏產品資訊平台，並促進產品銷售。

## 2. 資料夾結構說明

以下是 `cskiteshk` 專案的主要資料夾結構及其說明：

```
cskiteshk/
├── _context/               # 品牌相關資料，如品牌指南、語氣、關鍵字等 (建議新增)
├── _sop/                   # 標準操作流程文件 (建議新增)
├── assets/                 # 網站通用資源，如字體、圖示等
├── blog/                   # 部落格文章相關檔案
│   ├── drafts/             # 部落格文章草稿
│   └── posts/              # 已發佈的部落格文章
├── css/                    # 網站樣式表 (CSS 檔案)
├── images/                 # 網站圖片資源
│   ├── blog/               # 部落格文章圖片
│   ├── logos/              # 品牌標誌
│   └── products/           # 產品圖片
├── js/                     # 網站前端 JavaScript 檔案
├── products/               # 產品頁面相關檔案
│   ├── excel/              # 產品資料 Excel 檔案 (e.g., kite_product_list_english_filenames.csv)
│   ├── [product_id]/       # 各別產品的資料夾，內含 index.html
│   └── index.html          # 產品列表頁面
├── search/                 # 搜尋頁面相關檔案
├── social/                 # 社交媒體相關頁面或設定
├── testimonials/           # 客戶評價頁面相關檔案
├── .gitignore              # Git 忽略檔案設定
├── index.html              # 網站首頁
├── about/index.html        # 關於我們頁面
├── contact/index.html      # 聯絡我們頁面
├── privacy/index.html      # 隱私政策頁面
├── terms/index.html        # 服務條款頁面
├── publish_drafts.py       # 發佈草稿的 Python 腳本
├── publish_posts.py        # 發佈部落格文章的 Python 腳本
├── robots.txt              # 搜尋引擎爬蟲協定檔案
├── scrape-products.js      # 產品資料抓取 JavaScript 腳本
├── scraped-products.json   # 抓取到的產品資料 JSON 檔案
├── sitemap.xml             # 網站地圖 XML 檔案
├── update-homepage.js      # 更新首頁的 JavaScript 腳本
└── update-related-products.js # 更新相關產品的 JavaScript 腳本
```

## 3. 工作規則

*   **品牌資料讀取：** 所有生成或輸出的內容，必須優先讀取 `_context/` 資料夾中的品牌相關資料（例如品牌指南、語氣、關鍵字等），以確保內容符合品牌調性。
*   **流程遵循：** 在撰寫任何內容或執行任務前，請務必查閱 `_sop/` 資料夾中的標準操作流程文件，以確保工作流程的規範性與一致性。
*   **Skills 品牌中立：** 所使用的 Skills 必須保持品牌中立性。所有品牌相關的特定資料應從 `_context/` 資料夾動態載入，而非硬編碼於 Skills 內部。

## 4. 輸出檔案放置規則

*   **新內容與修改：** 任何新增的頁面、文章或修改後的檔案，應放置於其邏輯所屬的資料夾內。例如，新的部落格文章草稿應放置於 `blog/drafts/`，新的產品頁面應在 `products/` 下建立對應的產品 ID 資料夾並放置 `index.html`。
*   **自動化腳本輸出：** 腳本生成的資料（如 `scraped-products.json`）應放置於專案根目錄或專門的 `data/` 資料夾（如果未來有需求可新增）。
*   **圖片資源：** 所有圖片應根據其用途（部落格、產品、標誌等）放置於 `images/` 下對應的子資料夾中。
*   **CLAUDE.md：** 本文件 `CLAUDE.md` 應放置於專案的根目錄下，作為專案的入口指南。

---

## Product Images Convention
Images are stored in `/images/` (or `/assets/images/`).
### Naming Format
`{item-code}-{description}-{n}.jpg`
### Examples
- `kite-020-four-winged-goldfish-red-1.jpg`
- `kite-020-four-winged-goldfish-red-2.jpg`
- `kite-094-magic-octopus-8m-1.jpg`
### Rules
- Item code matches `Item Code` column in product Excel/data file
- `-1`, `-2` suffix for multiple photos per product
- First image (`-1`) is always the main/cover photo
- All lowercase, hyphens only, no spaces
### How to load images for a product
Filter all images where filename starts with `item.code`:
`kite-020-*` → returns all photos for that product

## Brand Colors
Primary palette used across all pages and components.

### Primary — Green
| Token | Hex | Usage |
|---|---|---|
| `green-600` | `#16a34a` | Primary buttons, links, accents |
| `green-700` | `#15803d` | Hover states, headings |
| `green-50`  | `#f0fdf4` | Subtle section backgrounds |
| `green-100` | `#dcf2e1` | Card borders, dividers |

### Accent — Amber / Gold
| Token | Hex | Usage |
|---|---|---|
| `amber-400` | `#fbbf24` | Gradient endpoint, highlight accents |
| `amber-600` | `#ca8a04` | CTA button gradient endpoint |

### Gradients
- **Brand name / hero text:** `linear-gradient(90deg, #4ade80 0%, #fbbf24 100%)`
- **CTA buttons:** `linear-gradient(90deg, #16a34a, #ca8a04)`
- **Hero background:** `linear-gradient(160deg, #071a0c, #0d3520, #16603a, #0f4a2b, #6b2d0a, #3d1505)`

### Text & Neutral
- Body text: `text-gray-600` / `text-gray-700`
- Headings: `text-gray-800` or `text-green-700`
- Muted / meta: `text-gray-500`
- Price display: `text-blue-600`

### Typography
- Primary font: `Noto Sans TC` (Traditional Chinese, weights 300–700)
- Accent font: `Dancing Script` (logo / decorative headers, weight 700)
- Fallback stack: `Microsoft JhengHei, sans-serif`

## Brand Voice

CS Kites (志成風箏) is a 40-year-old family kite shop based in Mong Kok, Hong Kong.

### Tone
- **Warm and personal** — write as Benny Mak, the founder, speaking directly to customers
- **Expert but approachable** — share knowledge without jargon; trust is built through experience
- **Heritage-proud** — lean into the 40-year legacy and traditional Chinese craftsmanship
- **Solution-focused** — always connect product features to real customer needs (e.g. portability for travellers)

### Language
- **Primary:** Traditional Chinese (繁體中文)
- **Secondary:** English (for international visitors and product specs)
- Bilingual pages mirror each other; neither is a direct machine translation
- Use natural, conversational Cantonese-flavoured Mandarin — avoid overly formal or simplified Chinese

### Key Messages
1. Nearly 40 years of kite expertise (「近 40 年風箏經驗」)
2. 50+ product varieties, most in stock — no pre-order needed
3. Personal recommendations by Benny Mak himself
4. Physical store in Mong Kok (旺角實體門市)
5. Kites connect people across cultures and generations

### Copy Patterns
- Testimonials: first-person customer stories, then founder reflection ending with an emotional scene
- Product descriptions: feature → benefit → sensory detail (e.g. "魚鰭隨風搖曳" — fins sway in the wind)
- CTAs: action-oriented, warm — avoid hard-sell phrases; prefer "了解更多" / "立即選購" over aggressive discounting language

### Example Voice (from testimonial-draft.md)
> 「這次與三藩市夫婦的交流，讓我再次感受到風箏的魅力是無國界的。」
> — Benny Mak

## Page Templates

The site is built with **Astro v4** (static generation) + **Tailwind CSS**. The catalogue app is a separate **React + TypeScript + Vite** app at `/catalogue/app/`.

### Standard Page Structure
Every page shares: `Header → [Page Content] → Footer`

| Component | File | Notes |
|---|---|---|
| Header | `Header.B_xxzU5-.js` | Sticky, white/95% opacity, bilingual nav |
| Footer | `Footer.DDzQZV7u.js` | Store address, WhatsApp, social links |

### Homepage Sections (in order)
1. **Hero Parallax** — full-screen, background image + CTA buttons
2. **Why Choose Us** — 4 feature cards (40yr, expert advice, 50+ options, local service)
3. **Video** — embedded YouTube with overlay
4. **Benefits** — 6 cards (stress relief, family, eye health, coordination, nature, fitness)
5. **Latest Kites** — 4-column product grid using `ProductCard` component
6. **Guides** — links to blog/guides
7. **Contact** — physical address + WhatsApp CTA

### Product Page Template
- File pattern: `/products/{item-code}/index.html`
- Includes: Schema.org `Product` markup, image gallery, specs table, WhatsApp CTA, related products
- Example: `/products/c610/index.html`

### Blog / Guide Page Template
- File pattern: `/blog/{slug}/index.html`
- Includes: article header, body, FAQ section, author bio (Benny Mak)
- Tone reference: `testimonial-draft.md`

### Catalogue App (React)
- Entry: `/catalogue/app/src/`
- Pages: `HomePage`, `CategoryPage`, `ProductPage`, `CartPage`, `SearchPage`
- UI components: `/catalogue/app/src/components/ui/` (55+ shadcn-style components)
- Product data: `/catalogue/app/src/data/` + `kite_catalogue.json` (106 products)
