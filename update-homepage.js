#!/usr/bin/env node
/**
 * update-homepage.js
 *
 * Regenerates the dynamic sections of the homepage (index.html):
 *   1. 最新風箏 carousel  — shows the 8 most recently added product pages
 *   2. 最新文章 carousel  — shows all blog posts found in /blog/
 *
 * HOW TO USE:
 *   node update-homepage.js
 *
 * WHEN TO RUN:
 *   - After adding a new product page under /products/
 *   - After adding a new blog post under /blog/
 *
 * HOW IT WORKS:
 *   - Scans /products/ directories for product info (name, price, category, image)
 *   - Scans /blog/ directories for post info (title, hero image)
 *   - Replaces the <!-- Latest Kites Section --> block in index.html
 *   - Replaces the <!-- Latest Blog Posts Section --> block in index.html
 *   - If blocks don't exist yet, inserts them at the correct positions
 */

const fs = require('fs');
const path = require('path');

const HOMEPAGE = path.join(__dirname, 'index.html');
const PRODUCTS_DIR = path.join(__dirname, 'products');
const BLOG_DIR = path.join(__dirname, 'blog');
const IMAGE_BASE = __dirname;
const MAX_PRODUCTS = 8;
const MAX_POSTS = 6;

// ─── helpers ────────────────────────────────────────────────────────────────

function getActualImagePath(pageId) {
  const exts = ['jpg', 'png', 'jpeg', 'webp'];
  for (const ext of exts) {
    const rel = `/image/products/${pageId}.${ext}`;
    if (fs.existsSync(path.join(IMAGE_BASE, rel))) return rel;
  }
  const dir01 = path.join(IMAGE_BASE, 'image', 'products01');
  if (fs.existsSync(dir01)) {
    const files = fs.readdirSync(dir01).filter(f => f.startsWith(pageId));
    if (files.length) return `/image/products01/${files.sort()[0]}`;
  }
  const dirP = path.join(IMAGE_BASE, 'image', 'products');
  if (fs.existsSync(dirP)) {
    const files = fs.readdirSync(dirP).filter(f => f.startsWith(pageId));
    if (files.length) return `/image/products/${files.sort()[0]}`;
  }
  return null;
}

function scanProducts() {
  if (!fs.existsSync(PRODUCTS_DIR)) return [];
  return fs.readdirSync(PRODUCTS_DIR)
    .filter(d => {
      const fp = path.join(PRODUCTS_DIR, d, 'index.html');
      return fs.statSync(path.join(PRODUCTS_DIR, d)).isDirectory() && fs.existsSync(fp);
    })
    .map(d => {
      const html = fs.readFileSync(path.join(PRODUCTS_DIR, d, 'index.html'), 'utf8');
      const catM = html.match(/rounded-full text-sm font-semibold[^>]*>\s*([^<]+?)\s*<\/span>/);
      const category = catM ? catM[1].trim() : null;
      if (!category) return null;
      const nameM = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
      const name = nameM ? nameM[1].trim() : d;
      const priceM = html.match(/HK\$(\d+)/);
      const price = priceM ? `HK$${priceM[1]}` : '';
      const image = getActualImagePath(d) || `/image/products/${d}.jpg`;
      return { id: d, name, price, category, image, url: `/products/${d}/` };
    })
    .filter(Boolean);
}

function scanBlogs() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR)
    .filter(d => {
      const fp = path.join(BLOG_DIR, d, 'index.html');
      return fs.statSync(path.join(BLOG_DIR, d)).isDirectory() && fs.existsSync(fp);
    })
    .map(d => {
      const html = fs.readFileSync(path.join(BLOG_DIR, d, 'index.html'), 'utf8');
      const titleM = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
      const title = titleM ? titleM[1].trim() : d;
      const imgM = html.match(/<img[^>]+src="(\/image\/[^"]+)"/);
      const image = imgM ? imgM[1] : null;
      return { slug: d, title, image, url: `/blog/${d}/` };
    });
}

// ─── HTML builders ────────────────────────────────────────────────────────────

function productCardHtml(p) {
  const onerror = `this.onerror=null;this.parentElement.innerHTML='<div class=\\"w-full h-full flex items-center justify-center text-4xl\\">🪁</div>'`;
  return `<div class="kite-carousel-item flex-shrink-0 w-64 sm:w-72">
              <a href="${p.url}" class="group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 border border-gray-100">
                <div class="aspect-square bg-gray-50 overflow-hidden">
                  <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" onerror="${onerror}">
                </div>
                <div class="p-4">
                  <span class="text-xs text-green-600 font-semibold uppercase tracking-wide">${p.category}</span>
                  <h3 class="font-bold text-gray-800 mt-1 mb-2 line-clamp-2 text-sm leading-snug">${p.name}</h3>
                  <p class="text-blue-600 font-bold text-lg">${p.price}</p>
                </div>
              </a>
            </div>`;
}

function blogCardHtml(p) {
  const imgHtml = p.image
    ? `<img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" onerror="this.onerror=null;this.style.display='none'">`
    : `<div class="w-full h-full flex items-center justify-center text-5xl bg-green-50">🪁</div>`;
  return `<div class="blog-carousel-item flex-shrink-0 w-64 sm:w-72">
              <a href="${p.url}" class="group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 border border-gray-100">
                <div class="aspect-square bg-gray-100 overflow-hidden">
                  ${imgHtml}
                </div>
                <div class="p-4">
                  <h3 class="font-bold text-gray-800 text-sm leading-snug line-clamp-3">${p.title}</h3>
                  <span class="inline-flex items-center gap-1 mt-3 text-green-600 text-xs font-semibold">閱讀文章 <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></span>
                </div>
              </a>
            </div>`;
}

function buildKitesSection(products) {
  const latest = [...products].reverse().slice(0, MAX_PRODUCTS);
  const cards = latest.map(productCardHtml).join('\n            ');
  const id = 'kite-latest-carousel';
  return `<!-- Latest Kites Section -->
  <section class="py-16 bg-gradient-to-b from-white to-green-50 overflow-hidden">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between mb-8">
        <div>
          <p class="text-xs font-bold tracking-widest uppercase text-green-600 mb-1">NEW ARRIVALS</p>
          <h2 class="text-4xl font-bold text-green-700">最新風箏</h2>
        </div>
        <div class="flex gap-3">
          <button id="${id}-prev" aria-label="上一個" class="w-11 h-11 rounded-full bg-white border-2 border-green-200 text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all shadow-md flex items-center justify-center text-xl font-bold">&#8249;</button>
          <button id="${id}-next" aria-label="下一個" class="w-11 h-11 rounded-full bg-white border-2 border-green-200 text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all shadow-md flex items-center justify-center text-xl font-bold">&#8250;</button>
        </div>
      </div>
      <div class="relative">
        <div id="${id}" class="flex gap-5 overflow-x-auto scroll-smooth pb-4" style="scrollbar-width:none;-ms-overflow-style:none;">
          <style>#${id}::-webkit-scrollbar{display:none}</style>
            ${cards}
        </div>
      </div>
      <div class="text-center mt-8">
        <a href="/products/" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
          查看全部風箏
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
        </a>
      </div>
    </div>
    <script>
    (function(){
      var track = document.getElementById('${id}');
      var prevBtn = document.getElementById('${id}-prev');
      var nextBtn = document.getElementById('${id}-next');
      if (!track || !prevBtn || !nextBtn) return;
      var cardW = track.querySelector('.kite-carousel-item') ? track.querySelector('.kite-carousel-item').offsetWidth + 20 : 292;
      prevBtn.addEventListener('click', function(){ track.scrollBy({left: -cardW * 2, behavior: 'smooth'}); });
      nextBtn.addEventListener('click', function(){ track.scrollBy({left: cardW * 2, behavior: 'smooth'}); });
    })();
    </script>
  </section>
  <!-- /Latest Kites Section -->`;
}

function buildBlogSection(posts) {
  const latest = posts.slice(0, MAX_POSTS);
  const cards = latest.map(blogCardHtml).join('\n            ');
  const id = 'blog-latest-carousel';
  return `<!-- Latest Blog Posts Section -->
  <section class="py-16 bg-white overflow-hidden">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between mb-8">
        <div>
          <p class="text-xs font-bold tracking-widest uppercase text-green-600 mb-1">BLOG · 風箏知識</p>
          <h2 class="text-4xl font-bold text-green-700">最新文章</h2>
        </div>
        <div class="flex gap-3">
          <button id="${id}-prev" aria-label="上一個" class="w-11 h-11 rounded-full bg-white border-2 border-green-200 text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all shadow-md flex items-center justify-center text-xl font-bold">&#8249;</button>
          <button id="${id}-next" aria-label="下一個" class="w-11 h-11 rounded-full bg-white border-2 border-green-200 text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all shadow-md flex items-center justify-center text-xl font-bold">&#8250;</button>
        </div>
      </div>
      <div class="relative">
        <div id="${id}" class="flex gap-5 overflow-x-auto scroll-smooth pb-4" style="scrollbar-width:none;-ms-overflow-style:none;">
          <style>#${id}::-webkit-scrollbar{display:none}</style>
            ${cards}
        </div>
      </div>
      <div class="text-center mt-8">
        <a href="/blog/" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
          查看全部文章
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
        </a>
      </div>
    </div>
    <script>
    (function(){
      var track = document.getElementById('${id}');
      var prevBtn = document.getElementById('${id}-prev');
      var nextBtn = document.getElementById('${id}-next');
      if (!track || !prevBtn || !nextBtn) return;
      var cardW = track.querySelector('.blog-carousel-item') ? track.querySelector('.blog-carousel-item').offsetWidth + 20 : 292;
      prevBtn.addEventListener('click', function(){ track.scrollBy({left: -cardW * 2, behavior: 'smooth'}); });
      nextBtn.addEventListener('click', function(){ track.scrollBy({left: cardW * 2, behavior: 'smooth'}); });
    })();
    </script>
  </section>
  <!-- /Latest Blog Posts Section -->`;
}

// ─── main ────────────────────────────────────────────────────────────────────

console.log('=== Scanning products ===');
const products = scanProducts();
console.log(`Found ${products.length} products with categories`);

console.log('\n=== Scanning blog posts ===');
const posts = scanBlogs();
console.log(`Found ${posts.length} blog posts`);

let html = fs.readFileSync(HOMEPAGE, 'utf8');

// ── Update / insert 最新風箏 section ─────────────────────────────────────────
const kitesStart = '<!-- Latest Kites Section -->';
const kitesEnd = '<!-- /Latest Kites Section -->';
const kitesSection = buildKitesSection(products);

if (html.includes(kitesStart) && html.includes(kitesEnd)) {
  const s = html.indexOf(kitesStart);
  const e = html.indexOf(kitesEnd) + kitesEnd.length;
  html = html.slice(0, s) + kitesSection + html.slice(e);
  console.log('\n✓ Replaced existing 最新風箏 section');
} else {
  // Insert where 精選風箏 was (after the CTA section, before benefits)
  const benefitsIdx = html.indexOf('<section id="benefits-stacked"');
  if (benefitsIdx >= 0) {
    html = html.slice(0, benefitsIdx) + kitesSection + '\n  ' + html.slice(benefitsIdx);
    console.log('\n✓ Inserted new 最新風箏 section before benefits');
  } else {
    console.log('\n⚠ Could not find insertion point for 最新風箏 section');
  }
}

// ── Update / insert 最新文章 section ─────────────────────────────────────────
const blogStart = '<!-- Latest Blog Posts Section -->';
const blogEnd = '<!-- /Latest Blog Posts Section -->';
const blogSection = buildBlogSection(posts);

if (html.includes(blogStart) && html.includes(blogEnd)) {
  const s = html.indexOf(blogStart);
  const e = html.indexOf(blogEnd) + blogEnd.length;
  html = html.slice(0, s) + blogSection + html.slice(e);
  console.log('✓ Replaced existing 最新文章 section');
} else {
  // Insert after 專家知識 section
  const expertIdx = html.indexOf('專家知識，帶你飛得更高') || html.indexOf('專家知識');
  if (expertIdx >= 0) {
    const closeSection = html.indexOf('</section>', expertIdx);
    if (closeSection >= 0) {
      const insertPos = closeSection + '</section>'.length;
      html = html.slice(0, insertPos) + '\n  ' + blogSection + '\n  ' + html.slice(insertPos);
      console.log('✓ Inserted new 最新文章 section after 專家知識');
    }
  } else {
    console.log('⚠ Could not find insertion point for 最新文章 section');
  }
}

fs.writeFileSync(HOMEPAGE, html, 'utf8');
console.log('\n=== Done! Homepage updated ===');
console.log('Tip: Run this script again whenever you add a new product or blog post.');
