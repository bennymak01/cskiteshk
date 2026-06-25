import os
import re
import datetime
import markdown

CATEGORY_COLORS = {
    '放風箏技巧': 'blue',
    '風箏故事': 'purple',
    '邊度放風箏': 'green',
    '風箏推介': 'orange',
}
BLOG_CATEGORIES = list(CATEGORY_COLORS.keys())

FALLBACK_SVG = (
    "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 "
    "viewBox=%220 0 400 225%22%3E%3Crect fill=%22%23f0fdf4%22 width=%22400%22 "
    "height=%22225%22/%3E%3Ctext x=%22200%22 y=%22120%22 font-size=%2248%22 "
    "text-anchor=%22middle%22%3E🪁%3C/text%3E%3C/svg%3E"
)


def parse_frontmatter(content):
    """Parse YAML frontmatter and return (fields_dict, body_text)."""
    if not content.startswith('---'):
        return {}, content
    end = content.find('\n---', 3)
    if end == -1:
        return {}, content
    fm_text = content[3:end]
    body = content[end + 4:].lstrip('\n')
    fm = {}

    def scalar(pattern):
        m = re.search(pattern, fm_text, re.MULTILINE)
        return m.group(1).strip().strip('"\'') if m else ''

    fm['title'] = scalar(r'^title:\s*["\']?(.+?)["\']?\s*$')
    fm['description'] = scalar(r'^description:\s*["\']?(.+?)["\']?\s*$')
    fm['subtitle'] = scalar(r'^subtitle:\s*["\']?(.+?)["\']?\s*$')
    fm['featured_snippet_title'] = scalar(r'^featured_snippet_title:\s*["\']?(.+?)["\']?\s*$')

    # blog_category (explicit or auto-detected from categories list)
    m = re.search(r'^blog_category:\s*(.+?)\s*$', fm_text, re.MULTILINE)
    if m:
        fm['blog_category'] = m.group(1).strip().strip('"\'')
    else:
        m = re.search(r'^categories:\s*\[(.+?)\]', fm_text, re.MULTILINE | re.DOTALL)
        if m:
            for cat in [c.strip().strip('"\'') for c in m.group(1).split(',')]:
                if cat in BLOG_CATEGORIES:
                    fm['blog_category'] = cat
                    break

    # Image path
    m = re.search(r'^\s+path:\s*(.+?)\s*$', fm_text, re.MULTILINE)
    if m:
        fm['image'] = m.group(1).strip()
    else:
        fm['image'] = scalar(r'^image:\s*["\']?(.+?)["\']?\s*$')

    # featured_snippet bullet list (lines starting with "  - ")
    m = re.search(r'^featured_snippet:\s*\n((?:\s{2,4}-\s*.+\n?)+)', fm_text, re.MULTILINE)
    if m:
        items = re.findall(r'^\s{2,4}-\s*(.+)', m.group(1), re.MULTILINE)
        fm['featured_snippet'] = [i.strip().strip('"\'') for i in items]
    else:
        fm['featured_snippet'] = []

    # product links
    product_blocks = re.findall(
        r'^\s{2,4}-\s*url:\s*(.+?)\n\s{4,6}label:\s*(.+?)\n\s{4,6}type:\s*(.+)',
        fm_text, re.MULTILINE
    )
    fm['products'] = [
        {'url': u.strip().strip('"\''),
         'label': l.strip().strip('"\''),
         'type': t.strip().strip('"\'') }
        for u, l, t in product_blocks
    ]

    return fm, body


def render_featured_snippet(title, items):
    if not title and not items:
        return ''
    items_html = ''.join(
        f'<li>{_md_inline(item)}</li>\n          ' for item in items
    )
    return f"""
      <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-8">
        <h2 class="text-lg font-bold text-green-800 mb-2">{title}</h2>
        <ul class="list-disc pl-5 space-y-1 text-gray-700">
          {items_html}
        </ul>
      </div>"""


def render_product_links(products):
    if not products:
        return ''
    badges = []
    primary = []
    for p in products:
        if p['type'] == 'primary':
            primary.append(
                f'<a href="{p["url"]}" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">{p["label"]}</a>'
            )
        else:
            badges.append(
                f'<a href="{p["url"]}" class="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-lg transition-colors font-medium">{p["label"]}</a>'
            )
    all_links = badges + primary
    return f"""
        <section class="text-center py-4">
          <p class="text-gray-600 mb-3">為下次活動備好你的風箏：</p>
          <div class="flex flex-wrap justify-center gap-3">
            {''.join(all_links)}
          </div>
        </section>"""


def _md_inline(text):
    """Convert **bold** and _italic_ markers to HTML inline."""
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'_(.+?)_', r'<em>\1</em>', text)
    return text


def generate_post_html(slug, fm, body_html, date):
    title = fm.get('title', slug.replace('-', ' ').title())
    description = fm.get('description', title)
    subtitle = fm.get('subtitle', '')
    category = fm.get('blog_category', '')
    image = fm.get('image', FALLBACK_SVG)
    color = CATEGORY_COLORS.get(category, 'blue')
    date_display = f"{date.year}年{date.month}月{date.day}日"
    year = date.year

    snippet_html = render_featured_snippet(
        fm.get('featured_snippet_title', ''),
        fm.get('featured_snippet', [])
    )
    products_html = render_product_links(fm.get('products', []))

    subtitle_block = (
        f'<p class="text-xl text-gray-500 mb-6 italic">{subtitle}</p>'
        if subtitle else ''
    )

    return f"""<!DOCTYPE html>
<html lang="zh-HK">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-4DL8JDF561"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-4DL8JDF561');</script>
<meta charset="UTF-8">
<meta name="description" content="{description}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:image" content="{image}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://www.cskites.hk/blog/{slug}/">
<link rel="canonical" href="https://www.cskites.hk/blog/{slug}/">
<link rel="alternate" hreflang="zh-HK" href="https://www.cskites.hk/blog/{slug}/">
<link rel="alternate" hreflang="en" href="https://www.cskites.hk/en/blog/{slug}/">
<link rel="alternate" hreflang="x-default" href="https://www.cskites.hk/blog/{slug}/">
<title>{title} | CS Kites 志成香港風箏店</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {{
    theme: {{
      extend: {{
        fontFamily: {{ sans: ['"Noto Sans TC"', '"Microsoft JhengHei"', 'sans-serif'] }}
      }}
    }}
  }};
</script>
<style>
  body {{ font-family: "Noto Sans TC", "Microsoft JhengHei", sans-serif; }}
  .prose h2 {{ font-size:1.5rem; font-weight:700; color:#1f2937; margin-top:0; margin-bottom:1rem; }}
  .prose h3 {{ font-size:1.125rem; font-weight:600; color:#374151; margin-top:0; margin-bottom:0.75rem; }}
  .prose p  {{ color:#374151; line-height:1.75; margin-bottom:1rem; }}
  .prose ul {{ padding-left:1.5rem; margin-bottom:1rem; }}
  .prose li {{ color:#374151; margin-bottom:0.5rem; }}
  .prose ol {{ padding-left:1.5rem; margin-bottom:1rem; }}
  .prose strong {{ color:#111827; }}
  .prose table {{ width:100%; border-collapse:collapse; font-size:0.875rem; }}
  .prose th {{ background:#dbeafe; border:1px solid #d1d5db; padding:0.5rem 1rem; text-align:left; }}
  .prose td {{ border:1px solid #d1d5db; padding:0.5rem 1rem; }}
  .prose tr:nth-child(even) td {{ background:#f9fafb; }}
  .prose blockquote {{ border-left:4px solid #16a34a; background:#fff; padding:1.5rem; border-radius:0 0.5rem 0.5rem 0; box-shadow:0 1px 3px rgba(0,0,0,0.1); font-style:italic; }}
  .prose figure img {{ width:100%; height:16rem; object-fit:cover; border-radius:0.5rem; }}
  .prose figcaption {{ text-align:center; font-size:0.875rem; color:#6b7280; padding:0.5rem; background:#f9fafb; }}
  .benny-quote {{ background:#fffbeb; border-left:4px solid #fbbf24; padding:1.25rem; border-radius:0 0.5rem 0.5rem 0; }}
</style>
</head>
<body class="min-h-screen flex flex-col bg-gray-50">

<!-- Header -->
<header class="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b-2 border-green-200">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <a href="/" class="text-xl font-bold text-green-700 hover:text-green-600 transition-colors">CS Kites 志成香港風箏店</a>
      <nav class="hidden md:flex space-x-6">
        <a href="/" class="text-gray-700 hover:text-green-600 transition-colors font-medium">首頁</a>
        <a href="/products" class="text-gray-700 hover:text-green-600 transition-colors font-medium">風箏產品</a>
        <a href="/blog" class="text-gray-700 hover:text-green-600 transition-colors font-medium">博客文章</a>
        <a href="/about" class="text-gray-700 hover:text-green-600 transition-colors font-medium">關於我們</a>
        <a href="/contact" class="text-gray-700 hover:text-green-600 transition-colors font-medium">聯絡我們</a>
      </nav>
      <div class="flex items-center gap-3">
        <div class="hidden md:flex items-center rounded-lg overflow-hidden border border-green-300 text-sm font-semibold">
          <span class="px-2 py-1 bg-green-600 text-white">中</span>
          <span class="text-green-300 px-0.5">|</span>
          <a href="/en/blog/{slug}" class="px-2 py-1 text-gray-500 hover:text-green-700 transition-colors">EN</a>
        </div>
        <a href="https://wa.me/85261741284" target="_blank" rel="noopener noreferrer"
           class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md">WhatsApp</a>
      </div>
    </div>
  </div>
</header>

<main class="flex-grow">
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto">

      <div class="mb-4 text-sm text-gray-500">
        <span>發佈日期：{date_display}</span>
        <span class="mx-2">·</span>
        <span>{category}</span>
      </div>

      <h1 class="text-4xl font-bold text-gray-800 mb-3">{title}</h1>
      {subtitle_block}

      {snippet_html}

      <div class="prose prose-lg max-w-none space-y-8">
        {body_html}
        {products_html}

        <!-- Related links -->
        <section class="bg-gray-50 rounded-lg p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-3">延伸閱讀</h2>
          <ul class="space-y-2 text-gray-700">
            <li>→ <a href="/blog" class="text-green-600 hover:text-green-700 underline">更多放風箏資訊 → 博客文章列表</a></li>
            <li>→ <a href="/products" class="text-green-600 hover:text-green-700 underline">CS Kites 風箏產品系列（50+ 款現貨）</a></li>
          </ul>
        </section>

        <!-- Contact card -->
        <div class="mt-12">
          <div class="bg-white/95 backdrop-blur-sm rounded-lg p-8 border-2 border-green-200 shadow-xl">
            <h3 class="text-2xl font-bold text-green-700 mb-6 text-center">想了解更多或購買？</h3>
            <div class="space-y-4">
              <div class="flex items-start bg-green-50 rounded-lg p-4">
                <span class="text-3xl mr-4">📍</span>
                <div>
                  <p class="font-semibold text-green-700 mb-1">親臨門市</p>
                  <p class="text-gray-700">香港九龍旺角界限街 12 號 D 地舖（太子站 D 出口）</p>
                </div>
              </div>
              <div class="flex items-start bg-green-50 rounded-lg p-4">
                <span class="text-3xl mr-4">📱</span>
                <div>
                  <p class="font-semibold text-green-700 mb-1">WhatsApp 查詢</p>
                  <p class="text-gray-700">61741284</p>
                </div>
              </div>
              <a href="https://wa.me/85261741284" target="_blank" rel="noopener noreferrer"
                 class="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                WhatsApp 聯絡我們
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<!-- Footer -->
<footer class="bg-gray-800 text-white mt-auto">
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 class="text-xl font-bold mb-4">CS Kites 志成香港風箏店</h3>
        <p class="text-gray-300">香港旺角風箏專門店，由麥氏家族經營逾10年。提供超過50款風箏，適合初學者到進階玩家。</p>
      </div>
      <div>
        <h4 class="font-semibold mb-4">聯絡資訊</h4>
        <ul class="space-y-2 text-gray-300">
          <li>📍 香港九龍旺角界限街 12 號 D 地舖（太子站 D 出口）</li>
          <li>📞 27783809</li>
          <li>📱 WhatsApp: 61741284</li>
          <li>📧 <a href="mailto:cskites1@gmail.com" class="hover:text-white transition-colors">cskites1@gmail.com</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold mb-4">快速連結</h4>
        <ul class="space-y-2 text-gray-300">
          <li><a href="/products" class="hover:text-white transition-colors">風箏產品</a></li>
          <li><a href="/blog" class="hover:text-white transition-colors">博客文章</a></li>
          <li><a href="/about" class="hover:text-white transition-colors">關於我們</a></li>
          <li><a href="/contact" class="hover:text-white transition-colors">聯絡我們</a></li>
          <li><a href="/privacy/" class="hover:text-white transition-colors">隱私政策</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
      <p>© {year} CS Kites 志成香港風箏店. All rights reserved.</p>
    </div>
  </div>
</footer>

</body>
</html>"""


def make_card_html(slug, title, date, category, image):
    color = CATEGORY_COLORS.get(category, 'blue')
    img_src = image if image else FALLBACK_SVG
    date_str = f"{date.year}年{date.month}月{date.day}日"
    cat_badge = (
        f'<span class="absolute top-3 left-3 bg-{color}-500 text-white '
        f'text-xs font-semibold px-2.5 py-1 rounded-full">{category}</span>'
    ) if category else ''

    return f"""
        <!-- {category or '風箏文章'} -->
        <a href="/blog/{slug}"
           class="blog-card group bg-white rounded-2xl overflow-hidden shadow-lg"
           data-category="{category or ''}">
          <div class="card-img-zoom relative overflow-hidden aspect-video bg-gray-100">
            <img src="{img_src}" alt="{title}"
                 class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                 onerror="this.src='{FALLBACK_SVG}'">
            {cat_badge}
          </div>
          <div class="p-5">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold px-3 py-1 rounded-full bg-{color}-100 text-{color}-800">{category}</span>
              <span class="text-xs text-gray-500">{date_str}</span>
            </div>
            <h3 class="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
              {title}
            </h3>
          </div>
        </a>"""


def inject_card_into_index(blog_dir, slug, title, date, category, image):
    """Insert a new card at the top of the blog grid. Never overwrites existing cards."""
    index_file = os.path.join(blog_dir, 'index.html')
    if not os.path.exists(index_file):
        print(f"Warning: {index_file} not found — skipping card injection")
        return

    with open(index_file, 'r', encoding='utf-8') as f:
        content = f.read()

    if f'href="/blog/{slug}"' in content:
        print(f"Card for /blog/{slug} already in blog/index.html — skipping")
        return

    grid_pos = content.find('id="blog-grid"')
    if grid_pos == -1:
        print("Warning: blog-grid div not found in blog/index.html — skipping injection")
        return

    insert_pos = content.find('>', grid_pos) + 1
    card = make_card_html(slug, title, date, category, image)
    updated = content[:insert_pos] + card + content[insert_pos:]

    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(updated)
    print(f"Injected card for '{title}' at top of blog/index.html")


def publish_posts():
    posts_dir = '_posts'
    blog_dir = 'blog'
    today = datetime.date.today()

    print(f"[{datetime.datetime.now()}] Checking for posts to publish...")

    if not os.path.exists(posts_dir):
        print(f"Error: {posts_dir} directory not found")
        return

    os.makedirs(blog_dir, exist_ok=True)

    all_posts = []
    for filename in os.listdir(posts_dir):
        if filename.endswith('.md'):
            m = re.match(r'(\d{4}-\d{2}-\d{2})-(.+)\.md', filename)
            if m:
                post_date = datetime.datetime.strptime(m.group(1), '%Y-%m-%d').date()
                all_posts.append({
                    'filename': filename,
                    'date': post_date,
                    'slug': m.group(2),
                    'path': os.path.join(posts_dir, filename),
                })

    # Publish all posts whose date is today or in the past
    to_publish = [p for p in all_posts if p['date'] <= today]

    if not to_publish:
        print("No posts due for publishing today.")
        return

    for post in sorted(to_publish, key=lambda p: p['date']):
        post_dir = os.path.join(blog_dir, post['slug'])
        index_path = os.path.join(post_dir, 'index.html')

        if os.path.exists(index_path):
            print(f"Already published: {post['slug']} — skipping")
            continue

        print(f"Publishing: {post['filename']}...")

        with open(post['path'], 'r', encoding='utf-8') as f:
            content = f.read()

        fm, body = parse_frontmatter(content)

        title_match = re.search(r'^# (.+)', body, re.MULTILINE)
        if not fm.get('title') and title_match:
            fm['title'] = title_match.group(1)
        if not fm.get('title'):
            fm['title'] = post['slug'].replace('-', ' ').title()

        body_html = markdown.markdown(body, extensions=['extra', 'tables', 'toc'])

        os.makedirs(post_dir, exist_ok=True)
        full_html = generate_post_html(post['slug'], fm, body_html, post['date'])

        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(full_html)
        print(f"Published → {index_path}")

        inject_card_into_index(
            blog_dir,
            post['slug'],
            fm.get('title', ''),
            post['date'],
            fm.get('blog_category', ''),
            fm.get('image', ''),
        )


if __name__ == "__main__":
    publish_posts()
