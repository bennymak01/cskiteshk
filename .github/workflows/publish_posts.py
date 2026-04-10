import os
import markdown
import datetime
import re

def publish_posts():
    """
    自動檢查 _drafts 資料夾中的文章，如果日期已到，則將其發布到 index.html。
    """
    print(f"[{datetime.datetime.now()}] 正在檢查是否有排程文章需要發布...")
    
    drafts_dir = '_drafts'
    posts_dir = 'posts'
    index_file = 'index.html'
    
    if not os.path.exists(drafts_dir):
        os.makedirs(drafts_dir)
        return

    if not os.path.exists(posts_dir):
        os.makedirs(posts_dir)

    today = datetime.date.today()
    # 為了測試，我們也可以手動設定一個日期，但正式環境使用 today
    # today = datetime.date(2026, 7, 1) 

    draft_files = [f for f in os.listdir(drafts_dir) if f.endswith('.md')]
    
    for draft_file in draft_files:
        draft_path = os.path.join(drafts_dir, draft_file)
        with open(draft_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 尋找日期標記，例如：發表日期：2026年7月1日
        date_match = re.search(r'發表日期：(\d{4})年(\d{1,2})月(\d{1,2})日', content)
        if date_match:
            year, month, day = map(int, date_match.groups())
            publish_date = datetime.date(year, month, day)
            
            if today >= publish_date:
                print(f"發現到期文章: {draft_file} (預定日期: {publish_date})，正在發布...")
                
                # 1. 轉換 Markdown 為 HTML
                html_body = markdown.markdown(content)
                
                # 2. 提取標題 (假設第一行是 # Title)
                title_match = re.search(r'^# (.*)', content)
                title = title_match.group(1) if title_match else "新文章"
                
                # 3. 更新 index.html (簡單的插入邏輯，插入到文章列表頂部)
                if os.path.exists(index_file):
                    with open(index_file, 'r', encoding='utf-8') as f:
                        index_content = f.read()
                    
                    # 尋找插入點，例如 <main> 標籤後或特定的文章容器
                    # 這裡假設我們插入到 <article> 之前或作為新的 <section>
                    new_section = f"""
                <section id="new-post-{publish_date.strftime('%Y%m%d')}">
                    <h2>{title}</h2>
                    <p><em>發佈日期：{publish_date.strftime('%Y年%m月%d日')}</em></p>
                    {html_body}
                </section>
                <hr>
"""
                    # 尋找第一個 <section> 並在其前插入
                    if '<section' in index_content:
                        updated_index = index_content.replace('<section', new_section + '                <section', 1)
                    else:
                        # 如果沒找到 section，插入到 main 標籤內
                        updated_index = index_content.replace('</main>', new_section + '            </main>')
                    
                    with open(index_file, 'w', encoding='utf-8') as f:
                        f.write(updated_index)
                
                # 4. 將文章移至已發布目錄
                os.rename(draft_path, os.path.join(posts_dir, draft_file))
                print(f"文章 {draft_file} 已成功發布並移至 {posts_dir}。")
            else:
                print(f"文章 {draft_file} 尚未到期 (預定日期: {publish_date})，跳過。")

    print("發布流程檢查完成。")

if __name__ == "__main__":
    publish_posts()
