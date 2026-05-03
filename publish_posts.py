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
    "viewBox=%220 0 400 225%22%3E%3Crect fill=%22%23e0e7ff%22 width=%22400%22 "
    "height=%22225%22/%3E%3Ctext x=%22200%22 y=%22120%22 font-size=%2248%22 "
    "text-anchor=%22middle%22%3E🪁%3C/text%3E%3C/svg%3E"
)


def parse_frontmatter(content):
    """Strip YAML frontmatter and extract fields. Returns (fields_dict, body)."""
    if not content.startswith('---'):
        return {}, content
    end = content.find('\n---', 3)
    if end == -1:
        return {}, content
    fm_text = content[3:end]
    body = content[end + 4:].lstrip('\n')
    fm = {}

    m = re.search(r'^title:\s*["\']?(.+?)["\']?\s*$', fm_text, re.MULTILINE)
    if m:
        fm['title'] = m.group(1).strip()

    # Explicit blog_category field takes priority
    m = re.search(r'^blog_category:\s*(.+?)\s*$', fm_text, re.MULTILINE)
    if m:
        fm['blog_category'] = m.group(1).strip()

    # Auto-detect from categories list
    m = re.search(r'^categories:\s*\[(.+?)\]', fm_text, re.MULTILINE | re.DOTALL)
    if m:
        cats = [c.strip().strip('"\'') for c in m.group(1).split(',')]
        for cat in cats:
            if cat in BLOG_CATEGORIES:
                fm.setdefault('blog_category', cat)
                break

    # Image path (nested under image:)
    m = re.search(r'^\s+path:\s*(.+?)\s*$', fm_text, re.MULTILINE)
    if m:
        fm['image'] = m.group(1).strip()

    return fm, body


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
                 class="w-full h-full object-cover"
                 onerror="this.src='{FALLBACK_SVG}'">
            {cat_badge}
          </div>
          <div class="p-5">
            <h2 class="font-semibold text-gray-800 text-base line-clamp-2 group-hover:text-blue-600 transition-colors">
              {title}
            </h2>
            <p class="text-gray-400 text-xs mt-2">{date_str}</p>
          </div>
        </a>"""


def inject_card_into_index(blog_dir, slug, title, date, category, image):
    """Insert a new card at the top of the blog grid in blog/index.html.
    Skips if the card already exists. Never overwrites the full page."""
    index_file = os.path.join(blog_dir, 'index.html')
    if not os.path.exists(index_file):
        print(f"Warning: {index_file} not found — skipping card injection")
        return

    with open(index_file, 'r', encoding='utf-8') as f:
        content = f.read()

    if f'href="/blog/{slug}"' in content:
        print(f"Card for /blog/{slug} already in blog/index.html — skipping")
        return

    grid_pos = content.find('<div id="blog-grid"')
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
            m = re.match(r'(\d{4}-\d{2}-\d{2})-(.*)\.md', filename)
            if m:
                post_date = datetime.datetime.strptime(m.group(1), '%Y-%m-%d').date()
                all_posts.append({
                    'filename': filename,
                    'date': post_date,
                    'slug': m.group(2),
                    'path': os.path.join(posts_dir, filename),
                })

    to_publish = [p for p in all_posts if p['date'] <= today]

    if not to_publish:
        print("No posts due for publishing today.")
        return

    for post in sorted(to_publish, key=lambda p: p['date']):
        print(f"Publishing: {post['filename']}...")

        with open(post['path'], 'r', encoding='utf-8') as f:
            content = f.read()

        fm, body = parse_frontmatter(content)

        title_match = re.search(r'^# (.*)', body, re.MULTILINE)
        title = fm.get('title') or (title_match.group(1) if title_match else post['slug'].replace('-', ' ').title())
        category = fm.get('blog_category', '')
        image = fm.get('image', '')

        html_body = markdown.markdown(body, extensions=['extra', 'tables', 'toc'])

        # Generate individual post page
        post_dir = os.path.join(blog_dir, post['slug'])
        os.makedirs(post_dir, exist_ok=True)

        full_html = f"""<!DOCTYPE html>
<html lang="zh-HK">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | CS Kites 志成香港風箏店</title>
    <link rel="stylesheet" href="/_astro/index.css">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 2rem; }}
        img {{ max-width: 100%; height: auto; border-radius: 8px; margin: 1.5rem 0; }}
        h1 {{ color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }}
        .post-meta {{ color: #7f8c8d; margin-bottom: 2rem; font-size: 0.9rem; }}
        .back-link {{ display: inline-block; margin-bottom: 2rem; text-decoration: none; color: #3498db; }}
        table {{ border-collapse: collapse; width: 100%; margin: 1.5rem 0; }}
        th, td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
        th {{ background-color: #f8f9fa; }}
    </style>
</head>
<body>
    <a href="/blog" class="back-link">← 返回博客列表</a>
    <article>
        <div class="post-meta">發佈日期：{post['date'].strftime('%Y年%m月%d日')}</div>
        {html_body}
    </article>
    <footer style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #eee; text-align: center; color: #999;">
        © {datetime.date.today().year} CS Kites 志成香港風箏店. 保留所有權利。
    </footer>
</body>
</html>"""

        with open(os.path.join(post_dir, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(full_html)
        print(f"Published to {post_dir}/index.html")

        # Inject card into blog/index.html — never overwrites the full page
        inject_card_into_index(blog_dir, post['slug'], title, post['date'], category, image)


if __name__ == "__main__":
    publish_posts()
