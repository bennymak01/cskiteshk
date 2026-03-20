#!/usr/bin/env node
/**
 * update-related-products.js
 *
 * Automatically populates the "相關產品" (Related Products) section
 * in every product page under /products/{id}/index.html
 *
 * HOW TO USE:
 *   node update-related-products.js
 *
 * WHEN TO RUN:
 *   Run this script whenever you add a new product page.
 *   It will scan all product directories, extract category info,
 *   and inject related-product cards into every page.
 *
 * HOW IT WORKS:
 *   1. Scans /products/ for subdirectories containing index.html
 *   2. Extracts product name, price, category, image from each page
 *   3. Groups products by category
 *   4. For each page:
 *      - If it already has <!-- Related Products --> placeholder → replaces the grid
 *      - If it doesn't → inserts a new section before </main>
 *   5. Skips pages with no other products in the same category
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.join(__dirname, 'products');
const IMAGE_BASE = __dirname;
const MAX_RELATED = 4;

// ─── helpers ────────────────────────────────────────────────────────────────

function getActualImagePath(pageId) {
  const exts = ['jpg', 'png', 'jpeg', 'webp'];
  for (const ext of exts) {
    const rel = `/image/products/${pageId}.${ext}`;
    if (fs.existsSync(path.join(IMAGE_BASE, rel))) return rel;
  }
  // products01 directory
  const dir01 = path.join(IMAGE_BASE, 'image', 'products01');
  if (fs.existsSync(dir01)) {
    const files = fs.readdirSync(dir01).filter(f => f.startsWith(pageId));
    if (files.length) return `/image/products01/${files.sort()[0]}`;
  }
  // any file starting with pageId in /image/products/
  const dirP = path.join(IMAGE_BASE, 'image', 'products');
  if (fs.existsSync(dirP)) {
    const files = fs.readdirSync(dirP).filter(f => f.startsWith(pageId));
    if (files.length) return `/image/products/${files.sort()[0]}`;
  }
  return null;
}

function extractProductInfo(pageId) {
  const filepath = path.join(PRODUCTS_DIR, pageId, 'index.html');
  if (!fs.existsSync(filepath)) return null;

  const html = fs.readFileSync(filepath, 'utf8');

  // category badge
  const catM = html.match(/rounded-full text-sm font-semibold[^>]*>\s*([^<]+?)\s*<\/span>/);
  const category = catM ? catM[1].trim() : null;

  // product name from <h1>
  const nameM = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const name = nameM ? nameM[1].trim() : pageId;

  // price
  const priceM = html.match(/HK\$(\d+)/);
  const price = priceM ? `HK$${priceM[1]}` : '';

  // image
  const image = getActualImagePath(pageId) || `/image/products/${pageId}.jpg`;

  return { id: pageId, name, price, category, image, url: `/products/${pageId}/` };
}

function scanAllProducts() {
  if (!fs.existsSync(PRODUCTS_DIR)) return [];
  return fs.readdirSync(PRODUCTS_DIR)
    .filter(d => {
      const fp = path.join(PRODUCTS_DIR, d, 'index.html');
      return fs.statSync(path.join(PRODUCTS_DIR, d)).isDirectory() && fs.existsSync(fp);
    })
    .map(d => extractProductInfo(d))
    .filter(Boolean);
}

function productCardHtml(p) {
  const onerror = `this.onerror=null;this.parentElement.innerHTML='<div class=\\"w-full h-full flex items-center justify-center text-4xl bg-gray-100\\">🪁</div>'`;
  return `<a href="${p.url}" class="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:scale-105 border border-gray-100">
              <div class="aspect-square bg-gray-100 relative overflow-hidden">
                <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" onerror="${onerror}">
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 mb-2">${p.name}</h3>
                <p class="text-blue-600 font-bold text-base">${p.price}</p>
              </div>
            </a>`;
}

function buildRelatedSection(relatedProducts) {
  const cards = relatedProducts.map(productCardHtml).join('\n            ');
  return `<!-- Related Products -->
      <div class="mt-12 mb-4">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">相關產品</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${cards}
        </div>
      </div>`;
}

function updatePage(pageId, allProducts) {
  const filepath = path.join(PRODUCTS_DIR, pageId, 'index.html');
  let html = fs.readFileSync(filepath, 'utf8');

  const current = allProducts.find(p => p.id === pageId);
  if (!current || !current.category) {
    console.log(`  [${pageId}] Skipped: no category`);
    return false;
  }

  const related = allProducts
    .filter(p => p.category === current.category && p.id !== pageId)
    .slice(0, MAX_RELATED);

  if (!related.length) {
    console.log(`  [${pageId}] Skipped: no related products in category "${current.category}"`);
    return false;
  }

  const sectionHtml = buildRelatedSection(related);

  // Case 1: existing placeholder
  if (html.includes('<!-- Related Products -->')) {
    const pattern = /<!-- Related Products -->[\s\S]*?<div class="grid[^"]*">([\s\S]*?)<\/div>\s*<\/div>/;
    const newHtml = html.replace(pattern, sectionHtml);
    if (newHtml === html) {
      // fallback: replace just the grid content
      const gridPattern = /(<div class="grid[^"]*grid-cols-4[^"]*">)([\s\S]*?)(<\/div>)/;
      const cards = related.map(productCardHtml).join('\n            ');
      const replaced = html.replace(gridPattern, `$1\n            ${cards}\n          $3`);
      if (replaced === html) {
        console.log(`  [${pageId}] WARNING: could not replace grid`);
        return false;
      }
      fs.writeFileSync(filepath, replaced, 'utf8');
    } else {
      fs.writeFileSync(filepath, newHtml, 'utf8');
    }
  } else {
    // Case 2: insert before </main>
    const mainIdx = html.lastIndexOf('</main>');
    if (mainIdx < 0) {
      console.log(`  [${pageId}] WARNING: no </main> found`);
      return false;
    }
    const newHtml = html.slice(0, mainIdx) + '\n      ' + sectionHtml + '\n    ' + html.slice(mainIdx);
    fs.writeFileSync(filepath, newHtml, 'utf8');
  }

  console.log(`  [${pageId}] ✓ Updated with ${related.length} related products:`);
  related.forEach(p => console.log(`    - ${p.name} (${p.price})`));
  return true;
}

// ─── main ────────────────────────────────────────────────────────────────────

console.log('=== Scanning product pages ===');
const allProducts = scanAllProducts();
console.log(`Found ${allProducts.length} products\n`);

// Print categories
const cats = {};
allProducts.forEach(p => {
  const c = p.category || 'Unknown';
  (cats[c] = cats[c] || []).push(p.id);
});
console.log('Categories:');
Object.entries(cats).forEach(([c, ids]) => console.log(`  ${c}: [${ids.join(', ')}]`));

console.log('\n=== Updating pages ===');
let updated = 0;
allProducts.forEach(p => {
  process.stdout.write(`\nProcessing ${p.id}...\n`);
  if (updatePage(p.id, allProducts)) updated++;
});

console.log(`\n=== Done: ${updated}/${allProducts.length} pages updated ===`);
console.log('\nTip: Run this script again whenever you add a new product page.');
