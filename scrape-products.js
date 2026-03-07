#!/usr/bin/env node
/**
 * scrape-products.js
 * Scrapes the "特-風箏" (Special Kites) category from csstationery.hk,
 * downloads product photos locally, and generates HTML product pages
 * for the CS Kites (cskiteshk) static website.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://csstationery.hk';
const CATEGORY_URL = 'https://csstationery.hk/product-category/%e7%89%b9-%e9%a2%a8%e7%ae%8f/';
const IMAGE_DIR = path.join(__dirname, 'image');
const PRODUCTS_DIR = path.join(__dirname, 'products');

// Starting product ID (existing max is c610)
let nextProductId = 611;

// Browser-like headers to avoid 403
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Cache-Control': 'max-age=0',
};

// -----------------------------------------------------------------------
// Descriptions and personal quotes in Chinese for different kite types.
// Keyed by partial name matches (lowercase). Falls back to generic.
// -----------------------------------------------------------------------
function generateContent(name) {
  const n = name.toLowerCase();

  // Match common kite types and assign relevant Chinese descriptions + quotes
  if (n.includes('龍') || n.includes('dragon')) {
    return {
      description: '採用精緻的龍紋設計，色彩鮮豔，飛行時姿態優美，適合在公園或海邊放飛。配備高強度骨架，穩定性極佳，是收藏與飛行兼備的上佳之選。',
      quote: '「我第一次放這款龍風箏，看著它在藍天中翱翔，感覺特別震撼，絕對是店內最吸睛的款式之一。」',
    };
  }
  if (n.includes('蝴蝶') || n.includes('butterfly')) {
    return {
      description: '翩翩蝴蝶造型，色彩豐富，飛行時翅膀隨風搖曳，栩栩如生。適合輕至中風條件，老少皆宜，是家庭出遊的首選。',
      quote: '「我帶這款蝴蝶風箏去大埔，周圍小朋友都被吸引過來，大家都說好靚，非常推薦！」',
    };
  }
  if (n.includes('魚') || n.includes('fish')) {
    return {
      description: '立體魚形設計，顏色奪目，飛行時如魚兒游水般靈動飄逸。骨架輕巧堅固，微風即可輕鬆升空，適合親子同樂。',
      quote: '「我試飛這款魚風箏時，在微風中便能輕鬆升空，它的立體感令圍觀的人嘖嘖稱奇。」',
    };
  }
  if (n.includes('章魚') || n.includes('octopus')) {
    return {
      description: '章魚造型獨特，長長的觸手在空中隨風飄動，視覺效果非常吸引。採用耐用尼龍布料，結構穩固，適合中等風力條件放飛。',
      quote: '「我拿這款章魚風箏到海邊放飛，長長的觸手隨風飄揚，路人紛紛停下來拍照，超有趣！」',
    };
  }
  if (n.includes('傘') || n.includes('parachute') || n.includes('umbrella')) {
    return {
      description: '傘形設計新穎獨特，放飛後如降落傘般在空中懸浮，視覺效果令人驚嘆。適合微風至中風條件，操控簡單，初學者也能輕鬆上手。',
      quote: '「我第一次看到傘形風箏就被吸引了，放飛後懸在空中的樣子真的非常特別，很多人都來問我在哪裡買的。」',
    };
  }
  if (n.includes('鳥') || n.includes('bird') || n.includes('燕') || n.includes('swallow')) {
    return {
      description: '仿真鳥類造型，展翅翱翔，飛行動態逼真自然。採用優質布料，輕盈耐用，適合公園草地或海濱空曠地帶放飛。',
      quote: '「我帶這款鳥形風箏去公園，遠看就像真鳥在飛，令人看得如痴如醉，大人小孩都喜歡。」',
    };
  }
  if (n.includes('星') || n.includes('star')) {
    return {
      description: '星形風箏造型獨特搶眼，飛行穩定，適合輕風至中風條件。色彩鮮豔多樣，在藍天下格外耀眼，是戶外休閒的好選擇。',
      quote: '「我在大埔看到有人放這款星形風箏，當下就決定要買一個，放飛後效果比想像中更靚。」',
    };
  }
  if (n.includes('彩虹') || n.includes('rainbow')) {
    return {
      description: '七彩彩虹設計，色彩繽紛，飛上天空後如一道彩虹般絢麗奪目。飛行穩定性佳，適合各年齡層人士，老少共享放風箏的樂趣。',
      quote: '「我最喜歡這款彩虹風箏在陽光下升起時的樣子，七彩的顏色讓整個天空都亮了起來，心情也跟著好起來。」',
    };
  }
  if (n.includes('三角') || n.includes('delta')) {
    return {
      description: '三角形設計，空氣動力學優異，飛行速度快且穩定。適合有一定經驗的玩家，在強風下表現尤為出色，感受飛行的速度與激情。',
      quote: '「我用這款三角風箏做特技飛行練習，反應靈敏，操控流暢，是我目前最喜歡的款式。」',
    };
  }
  if (n.includes('盒') || n.includes('box')) {
    return {
      description: '立體箱型設計，結構穩固，飛行高度驚人。採用輕量碳纖維骨架，抗風能力強，適合進階玩家挑戰高空飛行。',
      quote: '「我第一次放盒形風箏時被它的飛行高度震驚了，升空快，穩定性極佳，非常適合追求極致飛行體驗的人。」',
    };
  }

  // Generic fallback
  return {
    description: '設計獨特，色彩鮮豔，飛行穩定，適合在公園、海濱等空曠地帶放飛。採用優質材料製作，耐用輕巧，讓您享受放風箏的無窮樂趣。',
    quote: '「我試飛這款風箏時，輕鬆升空，操控自如，是店內深受顧客歡迎的款式，非常推薦。」',
  };
}

// -----------------------------------------------------------------------
// Read the shared page template (header/footer/scripts) from c41/index.html
// -----------------------------------------------------------------------
function getPageTemplate() {
  const templatePath = path.join(PRODUCTS_DIR, 'c41', 'index.html');
  const html = fs.readFileSync(templatePath, 'utf-8');

  // Extract: everything before <main and everything after </main>
  const mainStart = html.indexOf('<main');
  const mainEnd = html.indexOf('</main>') + '</main>'.length;

  const beforeMain = html.substring(0, mainStart);
  const afterMain = html.substring(mainEnd);

  return { beforeMain, afterMain };
}

// -----------------------------------------------------------------------
// Generate individual product page HTML
// -----------------------------------------------------------------------
function generateProductPage(product, template) {
  const { id, name, nameEn, price, imagePath, imageAlt, description, quote, category, size } = product;
  const { beforeMain, afterMain } = template;

  // Update <head> meta description and <title>
  let head = beforeMain
    .replace(
      /(<meta name="description" content=")[^"]*(")/,
      `$1${description.substring(0, 100)}$2`
    )
    .replace(
      /(<title>)[^<]*(- CS Kites[^<]*<\/title>)/,
      `$1${name} - CS Kites | CS Kites 志成香港風箏店</title>`
    );

  const priceStr = price ? `HK$${price}` : '歡迎查詢';
  const priceHtml = price
    ? `<span class="text-3xl font-bold text-blue-600">HK$${price}</span> <span class="text-gray-500 ml-2">參考價格</span>`
    : `<span class="text-3xl font-bold text-blue-600">歡迎查詢</span>`;

  const mainContent = `<main class="flex-grow">
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <!-- Product Images -->
        <div>
          <img src="${imagePath}" alt="${imageAlt}" class="w-full rounded-lg shadow-md">
        </div>
        <!-- Product Info -->
        <div>
          <h1 class="text-3xl font-bold text-gray-800 mb-4">${name}</h1>
          ${nameEn ? `<p class="text-gray-500 mb-4">${nameEn}</p>` : ''}
          <div class="mb-6">
            ${priceHtml}
          </div>
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">產品介紹</h2>
            <p class="text-gray-700">${description}</p>
          </div>
          <div class="mb-6 bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4">
            <p class="text-amber-800 italic">${quote}</p>
          </div>
          ${size ? `<div class="mb-6 bg-gray-50 rounded-lg p-4">
            <h2 class="text-xl font-semibold text-gray-800 mb-3">產品規格</h2>
            <dl class="space-y-2">
              <div>
                <dt class="font-semibold text-gray-700">尺寸：</dt>
                <dd class="text-gray-600">${size}</dd>
              </div>
            </dl>
          </div>` : ''}
          <div class="mb-6">
            <span class="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
              ${category}
            </span>
          </div>
        </div>
      </div>
      <!-- CTA Section -->
      <div class="mb-12">
        <div class="bg-white/95 backdrop-blur-sm rounded-lg p-8 border-2 border-green-200 shadow-xl"><h3 class="text-2xl font-bold text-green-700 mb-6 text-center">想了解更多或購買？</h3><div class="space-y-4"><div class="flex items-start bg-green-50 rounded-lg p-4"><span class="text-3xl mr-4">📍</span><div><p class="font-semibold text-green-700 mb-1">親臨門市</p><p class="text-gray-700">香港九龍旺角界限街 12 號 D 地舖（太子站 D 出口）</p></div></div><div class="flex items-start bg-green-50 rounded-lg p-4"><span class="text-3xl mr-4">📱</span><div><p class="font-semibold text-green-700 mb-1">WhatsApp 查詢</p><p class="text-gray-700">61741284</p></div></div><a href="https://wa.me/85261741284" target="_blank" rel="noopener noreferrer" class="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg">WhatsApp 聯絡我們</a></div></div>
      </div>
    </div>
  </div>
</main>`;

  return head + mainContent + afterMain;
}

// -----------------------------------------------------------------------
// Download an image file to the local image directory
// -----------------------------------------------------------------------
async function downloadImage(url, filename) {
  const dest = path.join(IMAGE_DIR, filename);
  if (fs.existsSync(dest)) {
    console.log(`  ↳ Image already exists: ${filename}`);
    return `/image/${filename}`;
  }

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: HEADERS,
      timeout: 15000,
    });
    fs.writeFileSync(dest, response.data);
    console.log(`  ↳ Downloaded: ${filename} (${Math.round(response.data.length / 1024)}KB)`);
    return `/image/${filename}`;
  } catch (err) {
    console.warn(`  ↳ WARNING: Could not download ${url}: ${err.message}`);
    return url; // Fall back to original URL if download fails
  }
}

// -----------------------------------------------------------------------
// Sanitize a product name into a safe filename
// -----------------------------------------------------------------------
function nameToFilename(id, name, ext = 'jpg') {
  const safe = name
    .replace(/[^\u4e00-\u9fff\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 40);
  return `${id}-${safe}.${ext}`;
}

// -----------------------------------------------------------------------
// Scrape the category page and extract product links
// -----------------------------------------------------------------------
async function scrapeCategory(url) {
  console.log(`\nFetching category page: ${url}`);
  const response = await axios.get(url, { headers: HEADERS, timeout: 20000 });
  const $ = cheerio.load(response.data);

  const productLinks = [];

  // WooCommerce product listings use .products li.product or .woocommerce-loop-product
  $('ul.products li.product, li.product').each((i, el) => {
    const link = $(el).find('a.woocommerce-loop-product__link, a').first().attr('href');
    const name = $(el).find('.woocommerce-loop-product__title, h2').first().text().trim();
    const priceEl = $(el).find('.price .woocommerce-Price-amount').first().text().trim();
    const imgEl = $(el).find('img').first();
    const imgSrc = imgEl.attr('data-src') || imgEl.attr('src') || '';

    if (link && name) {
      productLinks.push({ link, name, price: priceEl, imgSrc });
    }
  });

  console.log(`Found ${productLinks.length} products on category page.`);
  return productLinks;
}

// -----------------------------------------------------------------------
// Scrape an individual product page for the full image and specs
// -----------------------------------------------------------------------
async function scrapeProduct(productInfo) {
  const { link, name, price, imgSrc } = productInfo;
  console.log(`\nScraping product: ${name}`);
  console.log(`  URL: ${link}`);

  let fullImgSrc = imgSrc;
  let size = '';

  try {
    const response = await axios.get(link, { headers: HEADERS, timeout: 20000 });
    const $ = cheerio.load(response.data);

    // Try to get the full-size image from the product gallery
    const galleryImg = $('.woocommerce-product-gallery__image img, .wp-post-image').first();
    const bigImg = galleryImg.attr('data-large_image')
      || galleryImg.attr('data-src')
      || galleryImg.attr('src')
      || fullImgSrc;

    if (bigImg) fullImgSrc = bigImg;

    // Try to get dimensions/size from product attributes or description
    const attrRows = $('.woocommerce-product-attributes tr, .shop_attributes tr');
    attrRows.each((i, row) => {
      const label = $(row).find('th').text().toLowerCase();
      const value = $(row).find('td').text().trim();
      if (label.includes('尺寸') || label.includes('size') || label.includes('dimension')) {
        size = value;
      }
    });

    // Also check short description for size info
    if (!size) {
      const shortDesc = $('.woocommerce-product-details__short-description').text();
      const sizeMatch = shortDesc.match(/(\d+\s*(?:cm|CM)[\s\S]*?\d+\s*(?:cm|CM))/);
      if (sizeMatch) size = sizeMatch[1].trim();
    }
  } catch (err) {
    console.warn(`  ↳ WARNING: Could not fetch product page: ${err.message}`);
  }

  // Extract price number
  const priceNum = price ? parseInt(price.replace(/[^\d]/g, ''), 10) : null;

  return {
    name,
    price: isNaN(priceNum) ? null : priceNum,
    imageUrl: fullImgSrc,
    size,
  };
}

// -----------------------------------------------------------------------
// Generate the Special Kites category listing page
// -----------------------------------------------------------------------
function generateCategoryPage(products, template) {
  const { beforeMain, afterMain } = template;

  // Update head for the category page
  let head = beforeMain
    .replace(
      /(<meta name="description" content=")[^"]*(")/,
      '$1特色風箏系列，設計獨特，色彩鮮豔，各款造型風箏任您選擇。$2'
    )
    .replace(
      /(<title>)[^<]*(<\/title>)/,
      '$1特-風箏 - 風箏產品 | CS Kites 志成香港風箏店$2'
    );

  const productCards = products.map(p => `<a href="/products/${p.id}" class="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"><div class="aspect-square bg-gray-100 overflow-hidden"><img src="${p.imagePath}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/></div><div class="p-4"><h3 class="font-semibold text-gray-800 mb-2 line-clamp-2">${p.name}</h3>${p.size ? `<p class="text-sm text-gray-500 mb-2">尺寸：${p.size}</p>` : ''}<div class="flex items-center justify-between mt-3"><span class="text-lg font-bold text-blue-600">${p.price ? `HK$${p.price}` : '歡迎查詢'}</span><span class="text-sm text-gray-500">查看詳情 →</span></div></div></a>`).join('\n        ');

  const mainContent = `<main class="flex-grow">
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold text-gray-800 mb-4">特-風箏</h1>
    <p class="text-lg text-gray-600 mb-8">特色風箏系列，造型獨特，色彩繽紛，各款風格任您選擇</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${productCards}
    </div>
  </div>
</main>`;

  return head + mainContent + afterMain;
}

// -----------------------------------------------------------------------
// Generate product cards HTML to insert into products/index.html
// -----------------------------------------------------------------------
function generateProductCards(products) {
  return products.map(p => `<a href="/products/${p.id}" class="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"><div class="aspect-square bg-gray-100 overflow-hidden"><img src="${p.imagePath}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/></div><div class="p-4"><h3 class="font-semibold text-gray-800 mb-2 line-clamp-2">${p.name}</h3>${p.size ? `<p class="text-sm text-gray-500 mb-2">尺寸：${p.size}</p>` : ''}<div class="flex items-center justify-between mt-3"><span class="text-lg font-bold text-blue-600">${p.price ? `HK$${p.price}` : '歡迎查詢'}</span><span class="text-sm text-gray-500">查看詳情 →</span></div></div></a>`).join('\n');
}

// -----------------------------------------------------------------------
// Main function
// -----------------------------------------------------------------------
async function main() {
  console.log('=== CS Kites Product Scraper ===');
  console.log(`Target: ${CATEGORY_URL}`);

  // Load the page template once
  const template = getPageTemplate();
  console.log('Template loaded from products/c41/index.html');

  // Scrape category page
  let categoryProducts;
  try {
    categoryProducts = await scrapeCategory(CATEGORY_URL);
  } catch (err) {
    console.error(`Failed to fetch category page: ${err.message}`);
    console.log('\nFalling back to manually defined products...');
    // Use known products from this category as fallback
    categoryProducts = FALLBACK_PRODUCTS;
  }

  if (categoryProducts.length === 0) {
    console.log('No products found, using fallback data...');
    categoryProducts = FALLBACK_PRODUCTS;
  }

  const generatedProducts = [];

  for (const rawProduct of categoryProducts) {
    const productId = `c${nextProductId++}`;

    // Get detailed product info
    let detail;
    if (rawProduct.link) {
      detail = await scrapeProduct(rawProduct);
    } else {
      // Fallback product
      detail = rawProduct;
    }

    const { name, price, imageUrl, size } = detail;
    const content = generateContent(name);

    // Download image
    let imagePath = imageUrl;
    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      const ext = imageUrl.split('.').pop().split('?')[0].toLowerCase();
      const filename = nameToFilename(productId, name, ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg');
      imagePath = await downloadImage(imageUrl, filename);
    }

    const product = {
      id: productId,
      name,
      nameEn: detail.nameEn || '',
      price,
      imagePath,
      imageAlt: name,
      description: content.description,
      quote: content.quote,
      category: '特-風箏',
      size,
    };

    // Create product page directory and HTML
    const productDir = path.join(PRODUCTS_DIR, productId);
    fs.mkdirSync(productDir, { recursive: true });
    const pageHtml = generateProductPage(product, template);
    fs.writeFileSync(path.join(productDir, 'index.html'), pageHtml, 'utf-8');
    console.log(`  ✓ Created: products/${productId}/index.html — ${name}`);

    generatedProducts.push(product);

    // Small delay to be polite to the server
    await new Promise(r => setTimeout(r, 500));
  }

  // Generate Special Kites category listing page
  const specialDir = path.join(PRODUCTS_DIR, 'special');
  fs.mkdirSync(specialDir, { recursive: true });
  const categoryHtml = generateCategoryPage(generatedProducts, template);
  fs.writeFileSync(path.join(specialDir, 'index.html'), categoryHtml, 'utf-8');
  console.log('\n✓ Created: products/special/index.html');

  // Update products/index.html — add product cards to the main grid
  const mainListingPath = path.join(PRODUCTS_DIR, 'index.html');
  let mainListing = fs.readFileSync(mainListingPath, 'utf-8');
  const newCards = generateProductCards(generatedProducts);

  // Insert before </div> that closes the main products grid
  // The grid has class "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
  // Find the last product card and insert after it
  const insertMarker = '<!-- Special Kites Products -->';
  if (!mainListing.includes(insertMarker)) {
    // Find the closing </div> of the products grid and insert before it
    // We look for the pattern used by existing product cards
    const gridEndPattern = /(<\/div>\s*<\/div>\s*<\/main>)/;
    const newContent = `${newCards}\n${insertMarker}\n`;
    mainListing = mainListing.replace(gridEndPattern, `${newContent}$1`);
    fs.writeFileSync(mainListingPath, mainListing, 'utf-8');
    console.log('✓ Updated: products/index.html');
  } else {
    console.log('⚠ products/index.html already contains marker — skipping update');
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Products generated: ${generatedProducts.length}`);
  generatedProducts.forEach(p => {
    console.log(`  - ${p.id}: ${p.name} ${p.price ? `(HK$${p.price})` : ''}`);
  });
  console.log('\nDone! Review the generated files and commit when ready.');

  // Write product data JSON for reference
  fs.writeFileSync(
    path.join(__dirname, 'scraped-products.json'),
    JSON.stringify(generatedProducts, null, 2),
    'utf-8'
  );
  console.log('Saved scraped-products.json for reference.');
}

// -----------------------------------------------------------------------
// Fallback products — used if scraping fails (403/network error)
// These are representative products for the 特-風箏 category.
// Image URLs use placehold.co (reliable free placeholder service) with
// relevant colours for each kite type. Replace with real product photos
// once you have them from the supplier.
// -----------------------------------------------------------------------
const FALLBACK_PRODUCTS = [
  {
    name: '特大龍形風箏 3米',
    nameEn: 'Extra Large Dragon Kite 3m',
    price: 280,
    imageUrl: 'https://placehold.co/600x600/e63946/ffffff?text=%E9%BE%8D%E5%BD%A2%E9%A2%A8%E7%AE%8F',
    size: '300cm(L)',
    link: null,
  },
  {
    name: '彩虹傘形風箏',
    nameEn: 'Rainbow Parachute Kite',
    price: 150,
    imageUrl: 'https://placehold.co/600x600/f4a261/ffffff?text=%E5%BD%A9%E8%99%B9%E9%A2%A8%E7%AE%8F',
    size: '120cm(W)',
    link: null,
  },
  {
    name: '立體章魚風箏 2米',
    nameEn: '3D Octopus Kite 2m',
    price: 200,
    imageUrl: 'https://placehold.co/600x600/6a4c93/ffffff?text=%E7%AB%A0%E9%AD%9A%E9%A2%A8%E7%AE%8F',
    size: '200cm(L)',
    link: null,
  },
  {
    name: '七彩蝴蝶風箏',
    nameEn: 'Colourful Butterfly Kite',
    price: 95,
    imageUrl: 'https://placehold.co/600x600/2a9d8f/ffffff?text=%E8%9D%B4%E8%9D%B6%E9%A2%A8%E7%AE%8F',
    size: '100cm(W) x 60cm(H)',
    link: null,
  },
];

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
