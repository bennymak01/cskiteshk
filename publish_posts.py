import os
import re
import datetime
import markdown

def publish_posts():
    posts_dir = '_posts'
    blog_dir = 'blog'
    today = datetime.date.today()

    if not os.path.exists(posts_dir):
        print(f"Directory {posts_dir} does not exist.")
        return

    for filename in os.listdir(posts_dir):
        if filename.endswith('.md'):
            # Jekyll naming convention: YYYY-MM-DD-title.md
            match = re.match(r'(\d{4}-\d{2}-\d{2})-(.*)\.md', filename)
            if match:
                post_date_str = match.group(1)
                post_slug = match.group(2)
                post_date = datetime.datetime.strptime(post_date_str, '%Y-%m-%d').date()

                if post_date <= today:
                    print(f"Publishing {filename}...")
                    with open(os.path.join(posts_dir, filename), 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Simple Markdown to HTML conversion
                    html_content = markdown.markdown(content, extensions=['extra', 'tables', 'toc'])

                    # Create directory for the post
                    post_output_dir = os.path.join(blog_dir, post_slug)
                    os.makedirs(post_output_dir, exist_ok=True)

                    # Wrap in a basic HTML template (simplified for this example)
                    full_html = f"""<!DOCTYPE html>
<html lang="zh-HK">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{post_slug.replace('-', ' ').title()}</title>
    <link rel="stylesheet" href="/_astro/index.css"> <!-- Assuming common CSS -->
</head>
<body>
    <main class="container mx-auto px-4 py-12">
        <article class="prose lg:prose-xl mx-auto">
            {html_content}
        </article>
    </main>
</body>
</html>"""
                    with open(os.path.join(post_output_dir, 'index.html'), 'w', encoding='utf-8') as f:
                        f.write(full_html)
                    
                    # Optionally move the published post to an archive or keep it in _posts
                    print(f"Successfully published {post_slug} to {post_output_dir}/index.html")

if __name__ == "__main__":
    publish_posts()
