#!/usr/bin/env node
/**
 * add-canonical-tags.js
 *
 * Adds/fixes <link rel="canonical"> and <link rel="alternate" hreflang="...">
 * tags across all HTML pages on cskites.hk.
 *
 * HOW TO USE:
 *   node add-canonical-tags.js
 *
 * WHAT IT DOES:
 *   - English pages (/en/**): self-referencing canonical + bidirectional hreflang
 *   - Chinese pages: self-referencing canonical + hreflang (with en link if equivalent exists)
 *   - Chinese product detail pages: hreflang en → /en/products/ (no per-product English page)
 *   - Overwrites existing canonical/hreflang to fix any incorrect values
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.cskites.hk';
const ROOT = __dirname;

// Root-level directories that are not web pages
const SKIP_DIRS = new Set(['_astro', '_drafts', '_posts', 'image', 'sitemap', 'node_modules']);

// Subdirectory names under /products/ that are category listing pages
const PRODUCT_CATEGORIES = new Set(['aircraft', 'animal', 'children', 'delta', 'diy', 'eagle', 'large', 'special']);

// Subdirectory names under /products/ that are neither categories nor product detail pages
const PRODUCTS_SKIP = new Set(['excel', 'tools']);

let processed = 0;

/**
 * Converts an absolute index.html file path to a URL path.
 * e.g. /home/user/cskiteshk/en/products/children/index.html → /en/products/children/
 */
function getUrlPath(filePath) {
  const rel = path.relative(ROOT, filePath);
  const dir = path.dirname(rel);
  return dir === '.' ? '/' : '/' + dir.replace(/\\/g, '/') + '/';
}

/**
 * Removes existing canonical/hreflang tags and inserts new ones after
 * <meta name="generator">, or at end of <head> if that meta is absent.
 */
function setTags($, canonical, hreflangEntries) {
  $('link[rel="canonical"]').remove();
  $('link[rel="alternate"][hreflang]').remove();

  const tags = [
    `<link rel="canonical" href="${canonical}">`,
    ...hreflangEntries.map(({ lang, href }) =>
      `<link rel="alternate" hreflang="${lang}" href="${href}">`
    ),
  ].join('\n');

  const generator = $('meta[name="generator"]');
  if (generator.length) {
    generator.after(tags);
  } else {
    $('head').append(tags);
  }
}

function processFile(filePath) {
  const urlPath = getUrlPath(filePath);
  const isEnglish = urlPath.startsWith('/en/');

  let canonical, hreflang;

  if (isEnglish) {
    // English page — canonical is self, hreflang points to both en and zh-HK
    const zhPath = urlPath === '/en/' ? '/' : urlPath.replace(/^\/en/, '');
    canonical = `${BASE_URL}${urlPath}`;
    hreflang = [
      { lang: 'en',        href: `${BASE_URL}${urlPath}` },
      { lang: 'zh-HK',     href: `${BASE_URL}${zhPath}` },
      { lang: 'x-default', href: `${BASE_URL}${zhPath}` },
    ];
  } else {
    // Chinese page — canonical is self
    canonical = `${BASE_URL}${urlPath}`;

    const parts = urlPath.split('/').filter(Boolean);
    const isProductDetail =
      parts[0] === 'products' &&
      parts.length === 2 &&
      !PRODUCT_CATEGORIES.has(parts[1]) &&
      !PRODUCTS_SKIP.has(parts[1]);

    if (isProductDetail) {
      // Product detail pages have no individual English equivalent;
      // hreflang en points to the English product listing.
      hreflang = [
        { lang: 'zh-HK',     href: `${BASE_URL}${urlPath}` },
        { lang: 'en',        href: `${BASE_URL}/en/products/` },
        { lang: 'x-default', href: `${BASE_URL}${urlPath}` },
      ];
    } else {
      // All other Chinese pages — add en hreflang only if the English page exists
      const enPath = urlPath === '/' ? '/en/' : '/en' + urlPath;
      const enFilePath =
        urlPath === '/'
          ? path.join(ROOT, 'en', 'index.html')
          : path.join(ROOT, 'en' + urlPath, 'index.html');
      const enExists = fs.existsSync(enFilePath);

      hreflang = [
        { lang: 'zh-HK', href: `${BASE_URL}${urlPath}` },
        ...(enExists ? [{ lang: 'en', href: `${BASE_URL}${enPath}` }] : []),
        { lang: 'x-default', href: `${BASE_URL}${urlPath}` },
      ];
    }
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });
  setTags($, canonical, hreflang);
  fs.writeFileSync(filePath, $.html(), 'utf8');
  console.log(`✓ ${urlPath}`);
  processed++;
}

/**
 * Recursively walks a directory and processes every index.html found.
 */
function walk(dir) {
  if (!fs.existsSync(dir)) return;

  const indexFile = path.join(dir, 'index.html');
  if (fs.existsSync(indexFile)) {
    const urlPath = getUrlPath(indexFile);
    const parts = urlPath.split('/').filter(Boolean);
    // Skip non-page product subdirs (excel, tools)
    const skip =
      parts[0] === 'products' &&
      parts.length === 2 &&
      PRODUCTS_SKIP.has(parts[1]);
    if (!skip) processFile(indexFile);
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    walk(path.join(dir, entry.name));
  }
}

console.log('Adding canonical and hreflang tags...\n');
walk(ROOT);
console.log(`\nDone! Processed ${processed} pages.`);
