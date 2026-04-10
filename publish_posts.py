import os
import re
import datetime
import markdown

def publish_posts():
    """
    優化後的發布腳本：
    1. 檢查 _posts 資料夾中的排程文章。
    2. 轉換 Markdown 為美觀的 HTML。
    3. 自動更新 blog/index.html 索引頁。
    """
    posts_dir = '_posts'
    blog_dir = 'blog'
    index_file = os.path.join(blog_dir, 'index.html')
    today = datetime.date.today()
    
    print(f"[{datetime.datetime.now()}] 開始檢查排程文章...")

    if not os.path.exists(posts_dir):
        print(f"錯誤：找不到 {posts_dir} 資料夾。")
        return

    os.makedirs(blog_dir, exist_ok=True)

    # 獲取所有文章並按日期排序
    all_posts = []
    for filename in os.listdir(posts_dir):
        if filename.endswith('.md'):
            match = re.match(r'(\d{4}-\d{2}-\d{2})-(.*)\.md', filename)
            if match:
                post_date_str, post_slug = match.groups()
                post_date = datetime.datetime.strptime(post_date_str, '%Y-%m-%d').date()
                all_posts.append({
                    'filename': filename,
                    'date': post_date,
                    'slug': post_slug,
                    'path': os.path.join(posts_dir, filename)
                })

    # 篩選出今天或之前需要發布的文章
    to_publish = [p for p in all_posts if p['date'] <= today]
    
    if not to_publish:
        print("沒有需要發布的新文章。")
        return

    for post in to_publish:
        print(f"正在發布：{post['filename']}...")
        
        with open(post['path'], 'r', encoding='utf-8') as f:
            content = f.read()

        # 提取標題
        title_match = re.search(r'^# (.*)', content, re.MULTILINE)
        title = title_match.group(1) if title_match else post['slug'].replace('-', ' ').title()
        
        # 轉換 Markdown (包含表格與目錄支援)
        html_content = markdown.markdown(content, extensions=['extra', 'tables', 'toc'])

        # 建立文章目錄
        post_output_dir = os.path.join(blog_dir, post['slug'])
        os.makedirs(post_output_dir, exist_ok=True)

        # HTML 模板 (加入簡單 CSS 美化)
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
        {html_content}
    </article>
    <footer style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #eee; text-align: center; color: #999;">
        © {datetime.date.today().year} CS Kites 志成香港風箏店. 保留所有權利。
    </footer>
</body>
</html>"""

        with open(os.path.join(post_output_dir, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(full_html)
        
        print(f"成功發布至 {post_output_dir}/index.html")

    # 更新索引頁 (blog/index.html)
    update_index_page(blog_dir, all_posts, today)

def update_index_page(blog_dir, all_posts, today):
    index_file = os.path.join(blog_dir, 'index.html')
    # 只顯示已發布的文章，按日期倒序排列
    published_posts = sorted([p for p in all_posts if p['date'] <= today], key=lambda x: x['date'], reverse=True)
    
    list_items = ""
    for p in published_posts:
        # 再次讀取標題以確保準確
        with open(p['path'], 'r', encoding='utf-8') as f:
            first_line = f.readline().strip()
            title = first_line.replace('# ', '') if first_line.startswith('# ') else p['slug'].replace('-', ' ').title()
        
        list_items += f"""
        <li style="margin-bottom: 1.5rem; list-style: none; border-bottom: 1px solid #f0f0f0; padding-bottom: 1rem;">
            <span style="color: #999; font-size: 0.9rem;">{p['date'].strftime('%Y-%m-%d')}</span><br>
            <a href="/blog/{p['slug']}" style="text-decoration: none; color: #2c3e50; font-size: 1.2rem; font-weight: bold;">{title}</a>
        </li>"""

    index_html = f"""<!DOCTYPE html>
<html lang="zh-HK">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>風箏博客文章 | CS Kites 志成香港風箏店</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 2rem; }}
        h1 {{ color: #2c3e50; text-align: center; margin-bottom: 3rem; }}
        ul {{ padding: 0; }}
    </style>
</head>
<body>
    <h1>風箏博客文章</h1>
    <ul>
        {list_items}
    </ul>
</body>
</html>"""

    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(index_html)
    print(f"已更新索引頁：{index_file}")

if __name__ == "__main__":
    publish_posts()
