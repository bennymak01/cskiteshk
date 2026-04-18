import os
import shutil
import datetime

def publish_drafts():
    drafts_dir = '_drafts'
    posts_dir = '_posts'
    today = datetime.date.today()
    
    print(f"[{datetime.datetime.now()}] 檢查是否有排程發佈的草稿...")
    
    if not os.path.exists(drafts_dir):
        print("找不到 _drafts 資料夾。")
        return

    os.makedirs(posts_dir, exist_ok=True)

    for filename in os.listdir(drafts_dir):
        if filename.endswith('.md'):
            # 檢查檔名是否以日期開頭 (YYYY-MM-DD)
            if filename[:10].replace('-', '').isdigit():
                post_date = datetime.datetime.strptime(filename[:10], '%Y-%m-%d').date()
                if post_date <= today:
                    src = os.path.join(drafts_dir, filename)
                    dst = os.path.join(posts_dir, filename)
                    print(f"正在將 {filename} 從草稿移至發佈目錄...")
                    shutil.move(src, dst)
                else:
                    print(f"跳過 {filename} (預定發佈日期為 {post_date})")

if __name__ == "__main__":
    publish_drafts()
