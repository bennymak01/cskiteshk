// generate-sitemap.js
// Scans the repo for all public HTML pages and writes sitemap.xml
// Run: node generate-sitemap.js
// Also runs automatically via .github/workflows/update-sitemap.yml on the 1st of each month

const fs   = require('fs');
const path = require('path');

const DOMAIN = 'https://www.cskiteshk.com';
const ROOT   = __dirname;

// Directories to skip entirely (relative to ROOT, using OS path separators)
const EXCLUDE_DIR_PREFIXES = [
  'node_modules',
  'image',
  '.git',
  '_astro',
  path.join('catalogue', 'app'), // Vite/React dev app, not a public page
  'sitemap',                     // internal sitemap tool page
];

function shouldExcludeDir(relDir) {
  return EXCLUDE_DIR_PREFIXES.some(
    prefix => relDir === prefix || relDir.startsWith(prefix + path.sep)
  );
}

function collectIndexDirs(dir, relBase) {
  if (relBase === undefined) relBase = '';
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relPath = relBase ? path.join(relBase, entry.name) : entry.name;
    if (entry.isDirectory()) {
      if (!shouldExcludeDir(relPath)) {
        results.push(...collectIndexDirs(path.join(dir, entry.name), relPath));
      }
    } else if (entry.name === 'index.html') {
      results.push(relBase); // the directory that contains this index.html
    }
  }
  return results;
}

function toUrl(relDir) {
  // relDir is '' for root, 'products/c41' for sub-pages
  const urlPath = relDir === '' ? '/' : '/' + relDir.split(path.sep).join('/') + '/';
  return DOMAIN + urlPath;
}

function getMetadata(urlPath) {
  const rules = [
    [p => p === '/',                        { priority: '1.0', changefreq: 'weekly'  }],
    [p => p === '/en/',                     { priority: '0.9', changefreq: 'weekly'  }],
    [p => p === '/products/',               { priority: '0.9', changefreq: 'weekly'  }],
    [p => p === '/en/products/',            { priority: '0.8', changefreq: 'weekly'  }],
    [p => p === '/blog/',                   { priority: '0.8', changefreq: 'weekly'  }],
    [p => p === '/en/blog/',               { priority: '0.8', changefreq: 'weekly'  }],
    [p => ['/about/', '/en/about/', '/contact/', '/en/contact/',
            '/games/', '/en/games/', '/catalogue/'].includes(p),
                                            { priority: '0.7', changefreq: 'monthly' }],
    [p => p.startsWith('/blog/') || p.startsWith('/en/blog/'),
                                            { priority: '0.7', changefreq: 'monthly' }],
    [p => p.startsWith('/guides/') || p.startsWith('/en/guides/'),
                                            { priority: '0.7', changefreq: 'monthly' }],
    [p => p.startsWith('/products/') && !/^\/products\/c\d/.test(p) && p !== '/products/',
                                            { priority: '0.7', changefreq: 'monthly' }],
    [p => p.startsWith('/products/'),       { priority: '0.6', changefreq: 'monthly' }],
    [() => true,                            { priority: '0.5', changefreq: 'monthly' }],
  ];
  for (const [test, meta] of rules) {
    if (test(urlPath)) return meta;
  }
}

function buildXml(urls) {
  const today = new Date().toISOString().split('T')[0];
  const entries = urls.map(({ loc, priority, changefreq }) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n${entries}\n\n</urlset>\n`;
}

// Collect all index.html directories
const relDirs = collectIndexDirs(ROOT);

// Build URL objects
const urls = relDirs.map(relDir => {
  const loc     = toUrl(relDir);
  const urlPath = loc.replace(DOMAIN, '');
  const meta    = getMetadata(urlPath);
  return { loc, ...meta };
});

// Sort: root first, /en/ second, Chinese pages alpha, English pages alpha
urls.sort((a, b) => {
  const pa = a.loc.replace(DOMAIN, '');
  const pb = b.loc.replace(DOMAIN, '');
  if (pa === '/') return -1;
  if (pb === '/') return  1;
  if (pa === '/en/') return -1;
  if (pb === '/en/') return  1;
  const aIsEn = pa.startsWith('/en/');
  const bIsEn = pb.startsWith('/en/');
  if (!aIsEn && bIsEn) return -1;
  if (aIsEn && !bIsEn) return  1;
  return pa.localeCompare(pb);
});

// Write sitemap.xml
const xml = buildXml(urls);
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
console.log(`Sitemap written with ${urls.length} URLs.`);
