#!/usr/bin/env python3
"""
Process UUID-named kite images:
1. Resize to max 900px longest side (upscale small images to min 600px)
2. Convert to JPEG quality 85
3. Rename with product-based names per CLAUDE.md convention
4. Update products.ts and HTML pages with new paths
"""

import os
import re
import shutil
from PIL import Image

IMG_DIR = '/home/user/cskiteshk/catalogue/images/'
PRODUCTS_TS = '/home/user/cskiteshk/catalogue/app/src/data/products.ts'
PRODUCTS_DIR = '/home/user/cskiteshk/products/'

# Map: UUID prefix -> (new_filename, product_id, description)
# product_id is used for updating products.ts and HTML pages
MAPPINGS = [
    # Bee kite
    ('da2507f0', 'cs-1018-bee-kite-1.jpg',              'cs-1018'),
    # Lucky cat kite (2 photos)
    ('da547c60', 'cs-1017-lucky-cat-kite-1.jpg',         'cs-1017'),
    ('9a705370', 'cs-1017-lucky-cat-kite-2.jpg',         'cs-1017'),
    # Bat kite
    ('0297cc40', 'cs-1020-bat-kite-1.jpg',               'cs-1020'),
    # Eagle kites
    ('40e496e0', 'cs-1021-eagle-kite-2.jpg',             'cs-1021'),  # brown hawk, secondary photo
    ('40e50c10', 'k024-eagle-kite-1.jpg',                'k024'),     # red eagle product photo
    ('40e66ba0', 'cs-1022-bald-eagle-kite-1.jpg',        'cs-1022'),
    ('456b0960', 'cs-1023-golden-eagle-kite-1.jpg',      'cs-1023'),
    ('471de980', 'cs-1021-eagle-kite-1.jpg',             'cs-1021'),  # grey eagle, primary photo
    # Fishing rod kites
    ('80ca29f0', 'cs-1000-angel-fishing-rod-kite-1.jpg', 'cs-1000'),
    ('80cbb090', 'cs-1001-swallow-fishing-rod-kite-1.jpg','cs-1001'),
    # Aircraft / rocket kites
    ('80c93f90', 'cs-1002-small-rocket-kite-1.jpg',      'cs-1002'),
    ('8533c5a0', 'cs-1003-rainbow-ship-kite-1.jpg',      'cs-1003'),
    ('88eef8e0', 'cs-1004-rocket-plane-kite-1.jpg',      'cs-1004'),
    ('8d12b1f0', 'cs-1005-fighter-jet-kite-1.jpg',       'cs-1005'),
    ('9eb06e20', 'cs-1005-fighter-jet-kite-2.jpg',       'cs-1005'),
    ('8e6fd0f0', 'cs-1007-blue-fighter-kite-1.jpg',      'cs-1007'),
    ('9d0f8f60', 'cs-1008-fighter-kite-1.jpg',           'cs-1008'),
    # Stunt kites
    ('8f541670', 'cs-1009-flame-stunt-kite-1.jpg',       'cs-1009'),
    ('90cab0e0', 'cs-1010-flying-fish-stunt-kite-1.jpg', 'cs-1010'),
    # Snake kites
    ('92133670', 'cs-1011-golden-snake-kite-1.jpg',      'cs-1011'),
    ('93b26780', 'cs-1012-mamba-snake-kite-1.jpg',       'cs-1012'),
    # Animal kites
    ('95115b40', 'cs-1013-dancing-cow-kite-1.jpg',       'cs-1013'),
    ('963a23d0', 'cs-1014-small-turtle-kite-1.jpg',      'cs-1014'),
    ('97b0e550', 'cs-1015-sea-turtle-kite-1.jpg',        'cs-1015'),
    ('991ef440', 'cs-1016-shiba-inu-kite-1.jpg',         'cs-1016'),
]

# Product ID -> primary image filename (for products.ts and HTML updates)
# Only the -1 (primary) image is used as the main product image
PRODUCT_PRIMARY = {}
for uuid_prefix, new_name, product_id in MAPPINGS:
    if new_name.endswith('-1.jpg') and product_id not in PRODUCT_PRIMARY:
        PRODUCT_PRIMARY[product_id] = new_name

TARGET_LONG = 900   # max pixels on longest side
TARGET_MIN  = 600   # upscale if longest side < this


def process_image(src_path: str, dst_path: str):
    img = Image.open(src_path)
    # Flatten RGBA -> RGB with white background
    if img.mode in ('RGBA', 'LA', 'P'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    w, h = img.size
    longest = max(w, h)

    if longest > TARGET_LONG:
        scale = TARGET_LONG / longest
    elif longest < TARGET_MIN:
        scale = TARGET_MIN / longest
    else:
        scale = 1.0

    if scale != 1.0:
        new_w = round(w * scale)
        new_h = round(h * scale)
        img = img.resize((new_w, new_h), Image.LANCZOS)

    img.save(dst_path, 'JPEG', quality=85, optimize=True)
    return img.size


def find_source_file(uuid_prefix: str) -> str | None:
    """Find the actual filename in IMG_DIR matching the UUID prefix."""
    for fname in os.listdir(IMG_DIR):
        if fname.startswith(uuid_prefix):
            return os.path.join(IMG_DIR, fname)
    return None


# ── 1. Process all images ──────────────────────────────────────────────────
print('=== Processing images ===')
processed = []
for uuid_prefix, new_name, product_id in MAPPINGS:
    src = find_source_file(uuid_prefix)
    if not src:
        print(f'  MISSING: {uuid_prefix}')
        continue
    dst = os.path.join(IMG_DIR, new_name)
    size = process_image(src, dst)
    processed.append((uuid_prefix, new_name, product_id))
    print(f'  {os.path.basename(src)[:45]:48} -> {new_name} {size}')

# ── 2. Delete old UUID-named files ────────────────────────────────────────
print('\n=== Removing old UUID files ===')
uuid_prefixes = {m[0] for m in MAPPINGS}
removed = []
for fname in os.listdir(IMG_DIR):
    # Match UUIDs: 8hex-4hex-... pattern
    if re.match(r'^[0-9a-f]{8}-', fname):
        fpath = os.path.join(IMG_DIR, fname)
        os.remove(fpath)
        removed.append(fname)
        print(f'  removed: {fname}')
print(f'  Total removed: {len(removed)}')

# ── 3. Update products.ts ─────────────────────────────────────────────────
print('\n=== Updating products.ts ===')
with open(PRODUCTS_TS, 'r') as f:
    ts_content = f.read()

original_ts = ts_content
for product_id, img_name in PRODUCT_PRIMARY.items():
    new_url = f'/catalogue/images/{img_name}'
    # Match any image_url for this product_id
    # Pattern: look for id block then image_url within same product entry
    pattern = rf'("id":\s*"{re.escape(product_id)}".*?"image_url":\s*)"[^"]*"'
    replacement = rf'\1"{new_url}"'
    new_content = re.sub(pattern, replacement, ts_content, flags=re.DOTALL)
    if new_content != ts_content:
        print(f'  updated {product_id}: {new_url}')
        ts_content = new_content
    else:
        print(f'  WARN: no match for {product_id}')

if ts_content != original_ts:
    with open(PRODUCTS_TS, 'w') as f:
        f.write(ts_content)
    print('  products.ts saved.')
else:
    print('  No changes to products.ts.')

# ── 4. Update product HTML pages ──────────────────────────────────────────
print('\n=== Updating product HTML pages ===')

def update_html_page(product_dir_id: str, img_name: str):
    page_path = os.path.join(PRODUCTS_DIR, product_dir_id, 'index.html')
    if not os.path.exists(page_path):
        print(f'  MISSING page: products/{product_dir_id}/')
        return False
    with open(page_path, 'r') as f:
        html = f.read()

    new_img_path = f'/catalogue/images/{img_name}'
    new_schema_url = f'https://www.cskites.hk/catalogue/images/{img_name}'

    changed = False

    # Update <img src="..."> (any path)
    new_html = re.sub(
        r'(<img\s[^>]*src=")[^"]*(")',
        lambda m: m.group(1) + new_img_path + m.group(2),
        html
    )
    if new_html != html:
        changed = True
        html = new_html

    # Update Schema.org "image": "..."
    new_html = re.sub(
        r'("image":\s*"https://www\.cskites\.hk)[^"]*(")',
        lambda m: m.group(1).rsplit('/', 1)[0] + '/' + new_schema_url.split('cskites.hk/')[-1] + m.group(2),
        html
    )
    # Simpler: just replace the full schema image URL
    new_html = re.sub(
        r'"image":\s*"https://www\.cskites\.hk[^"]*"',
        f'"image": "{new_schema_url}"',
        html
    )
    if new_html != html:
        changed = True
        html = new_html

    if changed:
        with open(page_path, 'w') as f:
            f.write(html)
        print(f'  updated products/{product_dir_id}/')
        return True
    else:
        print(f'  no change: products/{product_dir_id}/')
        return False

# Map product_id to directory name (some differ: k024 has no page, cs-series uses cs-1000 etc)
PROD_ID_TO_DIR = {
    'cs-1000': 'cs-1000', 'cs-1001': 'cs-1001', 'cs-1002': 'cs-1002',
    'cs-1003': 'cs-1003', 'cs-1004': 'cs-1004', 'cs-1005': 'cs-1005',
    'cs-1007': 'cs-1007', 'cs-1008': 'cs-1008', 'cs-1009': 'cs-1009',
    'cs-1010': 'cs-1010', 'cs-1011': 'cs-1011', 'cs-1012': 'cs-1012',
    'cs-1013': 'cs-1013', 'cs-1014': 'cs-1014', 'cs-1015': 'cs-1015',
    'cs-1016': 'cs-1016', 'cs-1017': 'cs-1017', 'cs-1018': 'cs-1018',
    'cs-1020': 'cs-1020', 'cs-1021': 'cs-1021', 'cs-1022': 'cs-1022',
    'cs-1023': 'cs-1023',
    # k024 doesn't have its own product page in this site
}

for product_id, img_name in PRODUCT_PRIMARY.items():
    dir_id = PROD_ID_TO_DIR.get(product_id)
    if dir_id:
        update_html_page(dir_id, img_name)
    else:
        print(f'  skip {product_id} (no page directory mapping)')

print('\n=== Done ===')
print(f'Images processed: {len(processed)}')
print(f'Products updated: {len(PRODUCT_PRIMARY)}')
