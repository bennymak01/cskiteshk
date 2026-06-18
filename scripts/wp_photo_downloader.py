"""
WP Product Photo Downloader
Downloads WooCommerce product gallery images from csstationery.hk
and saves them to images/products/ + catalogue/images/.

Usage:
  python scripts/wp_photo_downloader.py
  python scripts/wp_photo_downloader.py --item-code 104
"""

import argparse
import os
import re
import sys
import time

import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO

BASE_URL = "https://csstationery.hk/product-category/%e7%89%b9-%e9%a2%a8%e7%ae%8f/"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
IMAGES_DIR = os.path.join(REPO_ROOT, "images", "products")
CATALOGUE_DIR = os.path.join(REPO_ROOT, "catalogue", "images")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://csstationery.hk/",
    "Connection": "keep-alive",
}

# Map substrings of WooCommerce product name → our item code + slug + legacy filename prefix
PRODUCT_MAP = {
    "大彩虹":    {"code": "3",        "slug": "large-rainbow",          "legacy": "3_Large_Rainbow"},
    "中彩虹":    {"code": "4",        "slug": "medium-rainbow",         "legacy": "4_Medium_Rainbow"},
    "小彩虹":    {"code": "5",        "slug": "small-rainbow",          "legacy": "5_Small_Rainbow"},
    "小白熊貓":  {"code": "104",      "slug": "little-white-panda",     "legacy": "104_Little_white_panda"},
    "小白熊":    {"code": "105",      "slug": "little-white-bear",      "legacy": "105_Little_white_bear"},
    "卡皮巴拉":  {"code": "106",      "slug": "little-capybara",        "legacy": "106_Little_Capibara"},
    "滑翔卡皮":  {"code": "107",      "slug": "gliding-capybara",       "legacy": "107_Gliding_Capibara"},
    "魚杆":      {"code": "kite-set", "slug": "small-kite-fishing-rod", "legacy": "Small_Kite_and_Fishing_Rod_Set"},
    "DIY":       {"code": "diy-l",   "slug": "diy-kite-material-large","legacy": "DIY_Kite_Material_Pack_Large"},
}


def match_product(name: str):
    """Return PRODUCT_MAP entry whose key appears in name, else None."""
    for key, info in PRODUCT_MAP.items():
        if key in name:
            return info
    return None


def get_soup(url: str, session: requests.Session) -> BeautifulSoup:
    resp = session.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def collect_product_links(session: requests.Session) -> list[dict]:
    """Scrape the category page (and paginated pages) for product links + names."""
    products = []
    url = BASE_URL
    while url:
        print(f"  Scanning category page: {url}")
        soup = get_soup(url, session)
        for li in soup.select("ul.products li.product"):
            a = li.select_one("a.woocommerce-loop-product__link")
            name_el = li.select_one(".woocommerce-loop-product__title")
            if a and name_el:
                products.append({"url": a["href"], "name": name_el.get_text(strip=True)})
        # Follow next page if present
        next_link = soup.select_one("a.next.page-numbers")
        url = next_link["href"] if next_link else None
        if url:
            time.sleep(1)
    return products


def extract_gallery_urls(soup: BeautifulSoup) -> list[str]:
    """Extract full-size gallery image URLs from a WooCommerce product page."""
    urls = []
    for img in soup.select(".woocommerce-product-gallery__image img"):
        src = img.get("data-large_image") or img.get("data-src") or img.get("src", "")
        if src and src not in urls:
            urls.append(src)
    # Fallback: main product image
    if not urls:
        img = soup.select_one("img.wp-post-image")
        if img:
            src = img.get("data-large_image") or img.get("src", "")
            if src:
                urls.append(src)
    return urls


def download_image(url: str, dest_path: str, session: requests.Session) -> bool:
    try:
        resp = session.get(url, headers={**HEADERS, "Referer": BASE_URL}, timeout=30, stream=True)
        resp.raise_for_status()
        img = Image.open(BytesIO(resp.content))
        img = img.convert("RGB")
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        img.save(dest_path, "JPEG", quality=92)
        print(f"    Saved: {dest_path}")
        return True
    except Exception as exc:
        print(f"    ERROR downloading {url}: {exc}", file=sys.stderr)
        return False


def process_product(prod: dict, session: requests.Session, item_code_filter: str | None):
    info = match_product(prod["name"])
    if not info:
        print(f"  Skip (no mapping): {prod['name']}")
        return
    if item_code_filter and info["code"] != item_code_filter:
        return

    print(f"\nProcessing: {prod['name']} → code={info['code']}")
    time.sleep(1)
    soup = get_soup(prod["url"], session)
    gallery_urls = extract_gallery_urls(soup)
    if not gallery_urls:
        print("  No gallery images found.")
        return

    for idx, img_url in enumerate(gallery_urls, start=1):
        # Primary naming: {item-code}-{slug}-{n}.jpg  → images/products/
        fname = f"{info['code']}-{info['slug']}-{idx}.jpg"
        download_image(img_url, os.path.join(IMAGES_DIR, fname), session)

        # For first image, also write legacy filename → catalogue/images/ (what HTML <img> tags expect)
        if idx == 1:
            legacy_path = os.path.join(CATALOGUE_DIR, f"{info['legacy']}.jpg")
            download_image(img_url, legacy_path, session)


def main():
    parser = argparse.ArgumentParser(description="Download product photos from csstationery.hk")
    parser.add_argument("--item-code", help="Only download for this item code (e.g. 104)")
    args = parser.parse_args()

    os.makedirs(IMAGES_DIR, exist_ok=True)
    os.makedirs(CATALOGUE_DIR, exist_ok=True)

    session = requests.Session()
    # Warm up session with a visit to the homepage (sets cookies, avoids bot detection)
    try:
        session.get("https://csstationery.hk/", headers=HEADERS, timeout=15)
        time.sleep(1)
    except Exception:
        pass

    print("Collecting product links...")
    products = collect_product_links(session)
    print(f"Found {len(products)} products on category page.")

    for prod in products:
        process_product(prod, session, args.item_code)

    print("\nDone.")


if __name__ == "__main__":
    main()
