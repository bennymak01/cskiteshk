# CS Kites 博客文章模板

參考來源：`/blog/hong-kong-kite-festivals/index.html`

---

## 文件命名與路徑規則

- 路徑格式：`/blog/{slug}/index.html`
- Slug 命名：全小寫英文，以連字符分隔，描述主題（例如 `hong-kong-kite-festivals`）
- 圖片存放：`/image/blog-{slug}-{n}.jpg`（SEO 友好命名，全小寫，連字符）

---

## HTML 頭部結構（`<head>`）

```html
<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-4DL8JDF561"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-4DL8JDF561');</script>

  <meta charset="UTF-8">
  <!-- 120–160 字元描述，包含主要關鍵字 -->
  <meta name="description" content="[描述]">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="generator" content="Astro v4.16.19">

  <!-- 標準化 URL -->
  <link rel="canonical" href="https://www.cskites.hk/blog/{slug}/">

  <!-- 多語言 hreflang -->
  <link rel="alternate" hreflang="zh-HK" href="https://www.cskites.hk/blog/{slug}/">
  <link rel="alternate" hreflang="en"    href="https://www.cskites.hk/en/blog/{slug}/">
  <link rel="alternate" hreflang="x-default" href="https://www.cskites.hk/blog/{slug}/">

  <title>[文章標題] | CS Kites 志成香港風箏店</title>

  <!-- 字型：Noto Sans TC -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet">

  <!-- Astro 生成的 CSS -->
  <link rel="stylesheet" href="/_astro/about.M08Rrvby.css">
</head>
```

---

## Body 整體結構

```html
<body class="min-h-screen flex flex-col bg-wood-50">

  <!-- 1. Header（Astro 組件，sticky） -->
  [Astro Header Component]

  <!-- 2. 主要內容 -->
  <main class="flex-grow">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-4xl mx-auto">

        <!-- a. 文章元資訊 -->
        <!-- b. 標題 + 副標題 -->
        <!-- c. Featured Snippet -->
        <!-- d. 正文內容（prose） -->
        <!-- e. 聯絡卡片 -->

      </div>
    </div>
  </main>

  <!-- 3. Footer（Astro 組件） -->
  [Astro Footer Component]

</body>
```

---

## 各區塊詳細說明

### a. 文章元資訊

```html
<div class="mb-4 text-sm text-gray-500">
  <span>發佈日期：[YYYY年MM月DD日]</span>
  <span class="mx-2">·</span>
  <span>[分類名稱]</span>
</div>
```

---

### b. 標題與副標題

```html
<h1 class="text-4xl font-bold text-gray-800 mb-3">[主標題]</h1>
<p class="text-xl text-gray-500 mb-6 italic">[副標題，簡短描述文章重點]</p>
```

---

### c. Featured Snippet（精選摘要）

放在文章開頭，提供快速解答，有助 SEO 在 Google 摘要框顯示。

```html
<div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-8">
  <h2 class="text-lg font-bold text-green-800 mb-2">快速解答：[問題]</h2>
  <ul class="list-disc pl-5 space-y-1 text-gray-700">
    <li><strong>[關鍵字]：</strong>[答案]</li>
    <li><strong>[關鍵字]：</strong>[答案]</li>
    <!-- 建議 3–5 點 -->
  </ul>
</div>
```

---

### d. 正文內容

```html
<div class="prose prose-lg max-w-none space-y-8">
```

---

#### 段落（引言）

```html
<section>
  <p class="text-gray-700 text-lg">
    [文章引言，以第一人稱個人經歷帶入主題]
  </p>
</section>
```

---

#### 圖片（帶說明）

```html
<figure class="rounded-lg overflow-hidden shadow-md">
  <img src="/image/[filename].jpg"
       alt="[圖片描述，包含關鍵字]"
       class="w-full h-64 object-cover"
       loading="lazy">
  <figcaption class="text-center text-sm text-gray-500 py-2 bg-gray-50">
    [圖片說明文字]
  </figcaption>
</figure>
```

---

#### 資料表格區塊（藍色背景）

```html
<section class="bg-blue-50 rounded-lg p-6">
  <h2 class="text-2xl font-bold text-gray-800 mb-4">[標題]</h2>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr class="bg-blue-100">
          <th class="border border-gray-300 px-4 py-2 text-left">[欄位]</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border border-gray-300 px-4 py-2">[內容]</td>
        </tr>
        <tr class="bg-gray-50">
          <td class="border border-gray-300 px-4 py-2">[內容]</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p class="text-gray-500 text-xs mt-2">[表格說明]</p>
</section>
```

---

#### 列表區塊（白色卡片）

```html
<section class="bg-white rounded-lg shadow-md p-6">
  <h2 class="text-2xl font-bold text-gray-800 mb-4">[標題]</h2>
  <p class="text-gray-700 mb-4">[段落說明]</p>
  <ul class="list-disc pl-6 space-y-3 text-gray-700">
    <li><strong>[要點]：</strong>[說明]</li>
  </ul>
  <p class="text-gray-600 mt-4 text-sm italic">[補充備注]</p>
</section>
```

---

#### 個人經歷引述框（琥珀色背景）

```html
<section>
  <h2 class="text-2xl font-bold text-gray-800 mb-4">[標題]</h2>
  <div class="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-lg">
    <p class="text-gray-700 italic mb-3">
      [以第一人稱（我）敘述個人親身經歷]
    </p>
    <p class="text-gray-600 text-sm font-medium">——Benny Mak，CS Kites 志成風箏店創辦人</p>
  </div>
</section>
```

---

#### 重點介紹區塊（綠色背景）

```html
<section class="bg-green-50 rounded-lg p-6">
  <h2 class="text-2xl font-bold text-gray-800 mb-4">[標題]</h2>
  <p class="text-gray-700 mb-4">[說明]</p>
  <ul class="list-disc pl-6 space-y-2 text-gray-700 mb-4">
    <li>[要點]</li>
  </ul>
  <!-- 可選：內嵌白色子卡片 -->
  <div class="bg-white rounded-lg p-4 border border-green-200">
    <h3 class="font-semibold text-gray-800 mb-2">[子標題]</h3>
    <ul class="list-disc pl-5 space-y-1 text-gray-700 text-sm">
      <li>[要點]</li>
    </ul>
  </div>
</section>
```

---

#### 引言（Blockquote）

```html
<section>
  <blockquote class="bg-white border-l-4 border-green-500 p-6 shadow-md rounded-r-lg">
    <p class="text-gray-700 italic text-lg mb-3">
      「[引言內容]」
    </p>
    <footer class="text-gray-600 text-sm font-semibold">— Benny Mak，CS Kites 志成風箏店創辦人</footer>
  </blockquote>
</section>
```

---

#### FAQ 區塊

```html
<section class="bg-white rounded-lg shadow-md p-6">
  <h2 class="text-2xl font-bold text-gray-800 mb-4">常見問題</h2>
  <div class="space-y-6">
    <div>
      <h3 class="font-bold text-gray-800 mb-2">Q：[問題]？</h3>
      <p class="text-gray-700">[解答]</p>
    </div>
    <div>
      <h3 class="font-bold text-gray-800 mb-2">Q：[問題]？</h3>
      <p class="text-gray-700">[解答]</p>
    </div>
  </div>
</section>
```

---

#### 延伸閱讀 CTA

```html
<section class="bg-gray-50 rounded-lg p-6">
  <h2 class="text-xl font-bold text-gray-800 mb-3">延伸閱讀</h2>
  <ul class="space-y-2 text-gray-700">
    <li>→ <a href="[url]" class="text-green-600 hover:text-green-700 underline">[文章標題]</a></li>
  </ul>
</section>
```

---

#### 產品連結按鈕

```html
<section class="text-center py-4">
  <p class="text-gray-600 mb-3">[行動呼籲文字]</p>
  <div class="flex flex-wrap justify-center gap-3">
    <a href="/products/[category]"
       class="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-lg transition-colors font-medium">
      [類別名稱]
    </a>
    <a href="/products"
       class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
      查看全部產品
    </a>
  </div>
</section>
```

---

### e. 聯絡卡片（固定結尾）

```html
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
```

---

## 博客列表卡片格式（`/blog/index.html`）

新增文章需在 `#blog-grid` 的**最前面**加入以下卡片：

```html
<a href="/blog/{slug}"
   class="blog-card group bg-white rounded-2xl overflow-hidden shadow-lg"
   data-category="[分類]">
  <div class="card-img-zoom relative overflow-hidden aspect-video bg-gray-100">
    <img src="/image/[thumbnail].jpg"
         alt="[圖片描述]"
         class="w-full h-full object-cover"
         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 225%22%3E%3Crect fill=%22%23e0e7ff%22 width=%22400%22 height=%22225%22/%3E%3Ctext x=%22200%22 y=%22120%22 font-size=%2248%22 text-anchor=%22middle%22%3E🪁%3C/text%3E%3C/svg%3E'">
    <!-- 分類標籤色：風箏故事=purple-500, 邊度放風箏=green-500, 放風箏技巧=blue-500, 風箏推介=orange-500 -->
    <span class="absolute top-3 left-3 bg-[color]-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">[分類]</span>
  </div>
  <div class="p-5">
    <h2 class="font-semibold text-gray-800 text-base line-clamp-2 group-hover:text-blue-600 transition-colors">
      [文章標題]
    </h2>
    <p class="text-gray-400 text-xs mt-2">[YYYY年MM月DD日]</p>
  </div>
</a>
```

### 分類標籤顏色對照

| 分類 | CSS 色 |
|------|--------|
| 風箏故事 | `bg-purple-500` |
| 邊度放風箏 | `bg-green-500` |
| 放風箏技巧 | `bg-blue-500` |
| 風箏推介 | `bg-orange-500` |

---

## 品牌色彩速查

| 用途 | Tailwind Token | Hex |
|------|---------------|-----|
| 主要按鈕、連結 | `green-600` | `#16a34a` |
| Hover 狀態 | `green-700` | `#15803d` |
| 淺色背景 | `green-50` | `#f0fdf4` |
| 邊框 | `green-100` / `green-200` | — |
| 強調（琥珀） | `amber-400` | `#fbbf24` |
| 個人經歷框 | `amber-50` + `amber-400` border | — |
| 正文 | `text-gray-700` | — |
| 標題 | `text-gray-800` / `text-green-700` | — |
| 輔助說明 | `text-gray-500` | — |
