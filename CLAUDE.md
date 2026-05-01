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
