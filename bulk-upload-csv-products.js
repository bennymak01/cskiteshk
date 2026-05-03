#!/usr/bin/env node
/**
 * bulk-upload-csv-products.js
 * Generates static HTML product pages for new kite products from:
 *   - CS_Kites_Bulk_Upload_Updated1.xlsx  (29 new products, excl. k024 which exists)
 *   - kite_product_list_english_filenames.csv (9 additional: animal, rainbow, set, DIY)
 *
 * Images: eagle kites in /catalogue/images/; others should be placed there when ready.
 * Usage: node bulk-upload-csv-products.js
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.join(__dirname, 'products');
const SITE_BASE = 'https://www.cskites.hk';

// -----------------------------------------------------------------------
// Product data (38 unique new products)
// -----------------------------------------------------------------------
const PRODUCTS = [

  // ── Group A: Cute animal kites (from CSV) ─────────────────────────────
  {
    id: '104',
    name: '小白熊貓風箏',
    nameEn: 'Little White Panda Kite',
    price: 45,
    category: '可愛動物風箏',
    size: '120cm (W) x 80cm (H)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: '104_Little_white_panda.jpg',
    description: '小白熊貓風箏以其獨特的三角形設計和可愛的熊貓造型，為您的戶外活動增添無限樂趣。這款風箏不僅外觀討喜，更採用輕巧耐用的材質製成，確保在微風中也能輕鬆起飛，讓您和家人在藍天白雲下享受放飛的喜悅。其鮮明的色彩和生動的表情，無論在公園、海灘或任何開闊場地，都能成為眾人矚目的焦點，為您的休閒時光帶來歡聲笑語。\n\n這款小白熊貓風箏非常適合初學者和兒童，操作簡單，易於上手。它不僅能幫助孩子們培養手眼協調能力，更能激發他們對大自然的熱愛與探索精神。與家人朋友一同放飛這隻可愛的熊貓，感受風的律動與自由的飛翔，創造屬於你們的珍貴回憶。',
    quote: '「第一次帶小朋友放這款熊貓風箏，他們開心得不得了，一直喊著要再來一次！真的非常推薦親子同樂。」',
  },
  {
    id: '105',
    name: '小白熊風箏',
    nameEn: 'Little White Bear Kite',
    price: 45,
    category: '可愛動物風箏',
    size: '125cm (W) x 80cm (H)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: '105_Little_white_bear.jpg',
    description: '小白熊風箏以其圓潤可愛的造型和純潔的白色，為您的天空帶來一抹溫馨的色彩。這款風箏設計獨特，彷彿一隻胖嘟嘟的小白熊在空中自由翱翔，憨態可掬的模樣令人愛不釋手。採用高品質輕量材料製作，即使是輕柔的微風也能將它輕鬆托起，讓您無需費力即可享受放飛風箏的樂趣，感受與大自然親密接觸的美好時光。\n\n這款小白熊風箏是親子活動的絕佳選擇，簡單的組裝和放飛過程，讓大人小孩都能輕鬆參與。在戶外放飛小白熊風箏，不僅能增進家庭成員間的互動，還能讓孩子們在追逐嬉戲中鍛鍊身體，享受陽光與新鮮空氣。',
    quote: '「白熊風箏放上天空的樣子超可愛，旁邊的小朋友都圍過來問哪裡買的，在公園真的很搶眼！」',
  },
  {
    id: '106',
    name: '小卡皮巴拉風箏',
    nameEn: 'Little Capybara Kite',
    price: 68,
    category: '可愛動物風箏',
    size: '100cm (W) x 120cm (H)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: '106_Little_Capibara.jpg',
    description: '小卡皮巴拉風箏以其獨特的扁平造型和呆萌的表情，為您的戶外活動帶來一絲幽默與趣味。這款風箏完美捕捉了水豚慵懶可愛的特點，在空中緩緩飄動時，彷彿一隻放大版的水豚在天空漫步，絕對能吸引所有人的目光。其堅固的骨架和耐撕裂的布料，確保了在各種風力條件下都能穩定飛行，讓您盡情享受放飛的樂趣。\n\n這款小卡皮巴拉風箏不僅是孩子們的最愛，也是大人們放鬆心情的好夥伴。在廣闊的草地或海邊，與家人朋友一同放飛這隻獨特的水豚風箏，感受風的輕撫與自由的氛圍。讓小卡皮巴拉風箏陪伴您，創造一個個充滿笑聲與驚喜的戶外冒險。',
    quote: '「水豚風箏放上天後，整個公園的人都笑了出來，這款真的是店內最獨特的設計之一，笑點滿分！」',
  },
  {
    id: '107',
    name: '滑翔卡皮巴拉風箏',
    nameEn: 'Gliding Capybara Kite',
    price: 45,
    category: '可愛動物風箏',
    size: '120cm (W) x 61cm (H)，尾長 168cm',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: '107_Gliding_Capibara.jpg',
    description: '滑翔卡皮巴拉風箏將可愛的水豚與滑翔傘的設計巧妙結合，為您帶來前所未有的放飛體驗。這款風箏以其獨特的造型和鮮明的色彩，在空中展現出水豚悠然自得的滑翔姿態，充滿了童趣與創意。採用輕盈而堅韌的材質製成，確保其在空中穩定飛行，即使是初學者也能輕鬆駕馭，享受操控風箏的樂趣。\n\n這款滑翔卡皮巴拉風箏是戶外活動的理想選擇，無論是家庭野餐、朋友聚會還是個人休閒，都能為您帶來歡樂。看著可愛的水豚在藍天中自由滑翔，不僅能讓您心情愉悅，更能吸引眾人的目光。',
    quote: '「這款水豚滑翔風箏長長的尾巴在風中飄揚，看起來真的好像在滑翔！超有趣的造型，大家都很喜歡。」',
  },

  // ── Group B: Sets & DIY (from CSV) ────────────────────────────────────
  {
    id: 'kite-set',
    name: '小風箏 + 魚杆套裝',
    nameEn: 'Small Kite + Fishing Rod Set',
    price: 48,
    category: '兒童風箏',
    size: '金龜/老鷹/喜鵲/燕子/鸚鵡: 30cm(W)×20cm(H)；卡皮巴拉: 35cm(W)×15cm(H)',
    windLevel: '微風即可',
    audience: '所有年齡',
    imageFile: 'Small_Kite_and_Fishing_Rod_Set.jpg',
    description: '這款小風箏 + 魚杆套裝是專為初學者和兒童設計的完美入門組合，讓您輕鬆體驗放飛風箏的樂趣。套裝內含多款造型可愛的小風箏，如金龜、老鷹、喜鵲、燕子、鸚鵡和獨特的卡皮巴拉，每一款都色彩鮮豔、生動活潑，讓孩子們愛不釋手。搭配專用魚杆，操作簡單，即使是第一次放風箏也能快速上手。\n\n套裝還附贈彩色防倒轉風箏魚杆和50米風箏線，確保放飛過程順暢無憂。這款套裝不僅能培養孩子們的手眼協調能力和對大自然的興趣，更是親子互動的絕佳工具。在週末或假日，與家人一同前往公園或海邊，放飛這些可愛的小風箏，創造屬於你們的歡樂時光。',
    quote: '「買了這個套裝送給侄子，他一玩就愛上了！小風箏款式多樣，魚杆操控輕鬆，非常適合初學者。」',
  },
  {
    id: 'diy-large',
    name: 'DIY 風箏材料包 (大)',
    nameEn: 'DIY Kite Material Pack (Large)',
    price: 70,
    category: 'DIY 風箏材料',
    size: '白布紙: 120cm x 90cm',
    windLevel: '視乎製作效果',
    audience: '所有年齡',
    imageFile: 'DIY_Kite_Material_Pack_Large.jpg',
    description: 'DIY 風箏材料包 (大) 為您提供一個親手製作獨特風箏的絕佳機會，讓創意在藍天中飛翔。這個材料包內含所有必需的優質材料，包括大尺寸白布紙 (120cm x 90cm)、竹條、彩尾、顏料、畫筆、調色盤、雙面膠、針線等，讓您無需額外準備，即可開始您的風箏創作之旅。無論是個人創作還是親子同樂，都能在製作過程中體驗到無窮的樂趣與成就感。\n\n透過親手繪製和組裝，您不僅能設計出獨一無二的風箏，還能學習到風箏的基本結構和飛行原理。這是一個培養創造力、專注力和動手能力的絕佳活動，特別適合家庭、學校或團體工作坊。完成後的風箏不僅是您勞動的結晶，更是可以在戶外盡情放飛的藝術品。',
    quote: '「帶小朋友一起做了這個DIY風箏，他畫了一隻龍在上面，之後放上天空的時候他開心得大叫，那份成就感真的很珍貴！」',
  },

  // ── Group C: Rainbow kites (from CSV) ─────────────────────────────────
  {
    id: '3',
    name: '大彩虹風箏',
    nameEn: 'Large Rainbow Kite',
    price: 78,
    category: '彩虹風箏',
    size: '170cm (W) x 375cm (H)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: '3_Large_Rainbow.jpg',
    description: '大彩虹風箏以其壯觀的尺寸和絢麗的七彩設計，為您的天空帶來一道亮麗的彩虹。這款風箏擁有1.7米寬、3.75米高的巨大身軀，在空中展開時，如同真實的彩虹般橫跨天際，無論在哪裡都能成為最引人注目的焦點。其堅固的骨架和高品質的抗撕裂布料，確保了在強風中也能穩定飛行，為您帶來無與倫比的放飛體驗。\n\n放飛大彩虹風箏不僅是一項戶外活動，更是一場視覺盛宴。它能激發孩子們對色彩和天空的無限想像，同時也讓大人們重拾童年的樂趣。在廣闊的草地或海邊，與家人朋友一同操控這隻巨型彩虹，感受風的強勁與自由的飛翔。',
    quote: '「大彩虹風箏放上天的一刻真的很震撼，七彩的顏色在陽光下閃亮奪目，是我見過最漂亮的風箏之一。」',
  },
  {
    id: '4',
    name: '中彩虹風箏',
    nameEn: 'Medium Rainbow Kite',
    price: 65,
    category: '彩虹風箏',
    size: '125cm (W) x 225cm (H)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: '4_Medium_Rainbow.jpg',
    description: '中彩虹風箏以其適中的尺寸和經典的彩虹條紋，為您帶來輕鬆愉快的放飛體驗。這款風箏擁有1.25米寬、2.25米高的優雅身形，在空中飄揚時，宛如一道迷你彩虹在藍天中舞動，既不過於龐大，又能展現出足夠的視覺效果。採用輕巧耐用的材質製成，確保了良好的飛行性能，即使是微風也能輕鬆起飛。\n\n這款中彩虹風箏非常適合家庭出遊和朋友聚會，簡單的操控方式讓各年齡層的玩家都能輕鬆上手。在公園、海灘或任何開闊的場地，與親友一同放飛這隻美麗的彩虹風箏，感受風的輕撫與自由的氛圍，創造充滿歡聲笑語的珍貴回憶。',
    quote: '「中彩虹風箏大小剛好，方便攜帶，放飛效果也很好。帶去海邊，整個海灘的人都讚嘆這道彩虹！」',
  },
  {
    id: '5',
    name: '小彩虹風箏',
    nameEn: 'Small Rainbow Kite',
    price: 45,
    category: '彩虹風箏',
    size: '95cm (W) x 160cm (H)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: '5_Small_Rainbow.jpg',
    description: '小彩虹風箏以其精巧的尺寸和活潑的彩虹設計，是孩子們和初學者入門風箏世界的理想選擇。這款風箏擁有0.95米寬、1.6米高的輕巧身形，易於攜帶和操控，讓小朋友也能輕鬆掌握放飛技巧。其鮮豔的七彩條紋在空中劃過一道亮麗的弧線，為天空增添一抹童趣與活力。\n\n這款小彩虹風箏不僅是孩子們的戶外玩伴，更是培養他們動手能力和觀察力的好工具。在戶外放飛風箏，能讓孩子們遠離電子產品，親近大自然，感受風的魔力。與家人一同放飛這隻可愛的小彩虹，享受親子時光，創造歡樂的共同回憶。',
    quote: '「第一次買風箏就選了這款小彩虹，簡單易上手，小朋友自己就能放飛，七彩的顏色讓他們愛不釋手！」',
  },

  // ── Group D: Eagle kite variants (CSV items 201-205 / Excel rows 27-31) ─
  {
    id: '201',
    name: '1.2米 鷹風箏 (紅)',
    nameEn: 'Eagle Kite 120cm (Red)',
    price: 45,
    category: '飛鳥風箏',
    size: '120cm (W) x 50cm (H)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'eagle-kite-120cm-50cm-seo-alt-text-eagle-kite-for-kids-red-main.webp',
    description: '這款 1.2米 鷹風箏採用鮮豔的紅色設計，展翅寬達 120cm，飛行姿態雄偉壯觀。採用輕量化骨架和高強度尼龍布料，即使在微風條件下也能穩定升空，非常適合兒童與初學者使用。鮮明的紅色在藍天中格外搶眼，讓每一次放飛都成為一道亮麗的風景線。\n\n操作簡單，組裝方便，無需複雜的技巧即可享受放風箏的樂趣。這款鷹風箏不僅是戶外休閒的好夥伴，更是培養孩子們觀察力和耐心的好工具。帶著它去公園或海邊，感受雄鷹翱翔的自由感，是家庭週末活動的理想選擇。',
    quote: '「孩子第一次放老鷹風箏就選了這款紅色的，紅鷹在空中非常好看，操控也很順手，一試就愛上了！」',
  },
  {
    id: '202',
    name: '1.65米 鷹風箏 (棕)',
    nameEn: 'Eagle Kite 165cm (Brown)',
    price: 55,
    category: '飛鳥風箏',
    size: '165cm (W) x 75cm (H)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'eagle-kite-165cm-75cm-seo-alt-text-eagle-kite-for-kids-brown.webp',
    description: '1.65米棕色鷹風箏是我們鷹系列中的經典款式，165cm的展翅寬度讓它在空中更具氣勢。棕色仿真羽毛圖案設計，使飛行中的風箏看起來宛如真實的老鷹在天空翱翔，極具視覺震撼力。採用優質輕量骨架，飛行穩定，適合在公園或海邊的開闊地帶放飛。\n\n這款鷹風箏非常適合家庭親子活動，一起感受操控雄鷹的成就感。無論是初學者還是有經驗的玩家，都能輕鬆駕馭。其耐用的布料和堅固的骨架，確保長期使用也不易損壞，是值得收藏的好風箏。',
    quote: '「這款棕色鷹風箏飛上天的樣子真的很像真老鷹，飛行非常穩定，放了一整個下午也不累，太享受了！」',
  },
  {
    id: '203',
    name: '1.7米 白頭鷹風箏 (藍天)',
    nameEn: 'Bald Eagle Kite 170cm (Blue Sky)',
    price: 65,
    category: '飛鳥風箏',
    size: '170cm (W) x 120cm (H)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'eagle-kite-170cm-120cm-seo-alt-text-bald-eagle-kite-for-kids-blue-sky.webp',
    description: '1.7米白頭鷹風箏以其藍天背景的獨特設計，完美展現出美洲白頭鷹的雄姿。170cm的寬大展翅配合120cm的高度，在空中飛行時氣勢非凡，猶如真正的白頭鷹在藍天中翱翔。精細的羽毛紋路印刷和逼真的眼神設計，使這款風箏成為鷹系列中最具藝術感的一款。\n\n高品質的尼龍布料和碳纖維骨架組合，確保了出色的飛行性能和耐用性。適合有一定放飛經驗的玩家，亦適合想要嘗試更大尺寸風箏的家庭。無論在任何開闊場地，這隻白頭鷹都能成為眾人矚目的焦點。',
    quote: '「白頭鷹風箏放上天後，幾乎所有人都以為是真鳥，這種逼真感真的令人驚嘆，每次放飛都有很多人圍觀！」',
  },
  {
    id: '204',
    name: '1.8米 金鷹風箏 (棕黃)',
    nameEn: 'Golden Eagle Kite 180cm (Brown/Yellow)',
    price: 75,
    category: '飛鳥風箏',
    size: '180cm (W) x 80cm (H)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'eagle-kite-180cm-80cm-seo-alt-text-golden-eagle-kite-for-kids-brown-yellow.webp',
    description: '1.8米金鷹風箏以其棕黃色的華麗設計，完美重現了金鷹的尊貴氣質。180cm的展翅寬度使它成為中型鷹風箏中最具震撼力的款式之一，色彩逼真，羽毛圖案細緻精美，在公園或海邊放飛時絕對讓人眼前一亮。採用高強度輕量骨架，飛行穩定流暢，是追求質感體驗的玩家的首選。\n\n這款金鷹風箏適合各年齡層的玩家，操控難度適中，即使是初學者也能在短時間內掌握技巧。它不僅是一款優質的戶外玩具，更是一件值得珍藏的工藝品，為您的風箏收藏增添一抹金色光芒。',
    quote: '「金鷹風箏的顏色和圖案都非常精緻，放上天空的時候金光閃閃，整個公園的人都在欣賞，非常值得！」',
  },
  {
    id: '205',
    name: '2.4米 黑鷹風箏 (深灰)',
    nameEn: 'Black Eagle Kite 240cm (Dark Grey)',
    price: 95,
    category: '大型飛鳥風箏',
    size: '240cm (W) x 110cm (H)',
    windLevel: '2-5級',
    audience: '家庭/進階玩家',
    imageFile: 'eagle-kite-240cm-110cm-seo-alt-text-black-eagle-kite-for-kids-dark-grey.webp',
    description: '2.4米黑鷹風箏是我們鷹系列中的巔峰之作，240cm的超大展翅寬度配合深灰色的神秘外觀，在空中展現出黑鷹翱翔的磅礡氣勢。高強度碳纖維骨架和特製抗撕裂尼龍布料，確保在各種風力條件下都能穩定飛行，是進階玩家的理想選擇。\n\n這款黑鷹風箏適合有一定放飛經驗的玩家，也非常適合家庭共同放飛。超大尺寸帶來的飛行體驗是中小型風箏無法比擬的，那種駕馭巨型風箏的成就感令人難忘。在廣闊的草地或海邊，讓這隻黑鷹在空中展翅高飛，感受真正的放飛樂趣。',
    quote: '「2.4米的黑鷹放上天後簡直震撼全場，那種氣勢真的像真老鷹一樣！這是我放過最大的風箏，太過癮了！」',
  },

  // ── Group E: CS-1000 series (from Excel, excl. k024 which already exists) ─

  // CS-1000: 釣魚竿風箏 – 天使 (similar to c41, kept as separate listing)
  {
    id: 'cs-1000',
    name: '釣魚竿風箏 – 天使',
    nameEn: 'Fishing Rod Kite – Angel',
    price: 75,
    category: '兒童風箏',
    size: '30cm (W) x 20cm (H)',
    windLevel: '微風即可',
    audience: '兒童/初學者',
    imageFile: 'c41.png', imageDir: '/image/products/',
    description: '釣魚竿風箏 – 天使以輕巧的魚竿設計，讓放飛風箏變得像釣魚一樣輕鬆有趣。可愛的天使造型配上輕量化設計，微風即可輕鬆升空，非常適合初學者和兒童。整套附帶魚竿線轆，單手操控，另一手可以做其他事，是最方便的入門款式之一。\n\n這款風箏特別適合城市人在公園或海邊放飛，不需要大空間，輕輕一擺魚竿就能讓天使在空中翱翔。是送給孩子或初學者的理想禮物，讓他們愛上放風箏的樂趣。',
    quote: '「買了這款天使魚竿風箏，第一次放就成功升空，孩子開心地說天使在飛，真的非常推薦入門！」',
  },
  {
    id: 'cs-1001',
    name: '釣魚竿風箏 – 燕子',
    nameEn: 'Fishing Rod Kite – Swallow',
    price: 75,
    category: '兒童風箏',
    size: '30cm (W) x 20cm (H)',
    windLevel: '微風即可',
    audience: '兒童/初學者',
    imageFile: 'c42.png', imageDir: '/image/products/',
    description: '釣魚竿風箏 – 燕子以仿真燕子造型結合便捷的魚竿設計，讓放飛風箏輕鬆又有趣。燕子展翅飛翔的造型設計，飛行時栩栩如生，彷彿真實的燕子在空中穿梭。輕量化設計確保微風即可升空，附帶專用魚竿線轆，操作方便，適合所有年齡層。\n\n這款風箏特別受小朋友喜愛，仿真的燕子造型能引起孩子們對鳥類和大自然的興趣。在公園或海邊放飛，看著燕子在空中靈活飛翔，是最簡單愉快的戶外活動之一。',
    quote: '「燕子魚竿風箏飛起來真的好像真燕子！小孩玩得不亦樂乎，說要帶燕子去旅行，太可愛了！」',
  },
  {
    id: 'cs-1002',
    name: '小火箭風箏',
    nameEn: 'Small Rocket Kite',
    price: 75,
    category: '飛機火箭風箏',
    size: '見詳情頁',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k075.jpg', imageDir: '/image/products/',
    description: '小火箭風箏採用精緻的火箭造型設計，外形科技感十足，色彩鮮明奪目。飛行穩定，適合在公園或海邊開闊地帶放飛。輕量化骨架設計，微風即可升空，是孩子們最喜歡的科技主題風箏之一。\n\n這款火箭風箏讓孩子們對太空和科技充滿幻想，放飛時彷彿看著小火箭飛向宇宙。配合父母的解說，還能成為寓教於樂的親子活動，讓孩子們在玩樂中了解航天知識。',
    quote: '「小朋友一看到這款火箭風箏就愛上了，說像真的太空飛船在天上飛，整個下午都不肯收回來！」',
  },
  {
    id: 'cs-1003',
    name: '彩虹立體船風箏',
    nameEn: 'Rainbow 3D Boat Kite',
    price: 75,
    category: '彩虹風箏',
    size: '見詳情頁',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k082.jpg', imageDir: '/image/products/',
    description: '彩虹立體船風箏以獨特的立體船艦造型結合七彩彩虹配色，在空中飛行時如一艘彩虹飛船翱翔天際。結構穩固，飛行平穩，是兒童和初學者的理想選擇。七彩配色鮮豔奪目，在藍天下格外亮眼，讓每一次放飛都成為視覺盛宴。\n\n這款風箏融合了彩虹的色彩魅力和船艦的立體造型，是市面上少見的創意設計。無論在公園還是海邊，都能吸引眾多目光，是孩子們炫酷的戶外玩伴。',
    quote: '「彩虹立體船風箏放上天後又立體又鮮豔，大家都驚訝說怎麼看起來這麼真實，超吸引眼球！」',
  },
  {
    id: 'cs-1004',
    name: '火箭飛機風箏',
    nameEn: 'Rocket Plane Kite',
    price: 75,
    category: '飛機火箭風箏',
    size: '見詳情頁',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k088.jpg', imageDir: '/image/products/',
    description: '火箭飛機風箏結合了火箭和飛機的雙重設計元素，造型獨特，充滿科技感。在空中飛行時速度感十足，穩定性極佳，適合各年齡層放飛愛好者。精緻的機身設計和鮮豔的色彩，讓它成為航空主題風箏中最受歡迎的款式之一。\n\n這款風箏特別適合對飛行器感興趣的孩子，放飛時能激發他們對航空和工程的興趣。在廣闊的草地或海邊放飛，感受火箭飛機在空中翱翔的速度感，是一次難忘的飛行體驗。',
    quote: '「這款火箭飛機風箏飛上天後像真正的戰機一樣，速度感和姿態都很帥，孩子們超興奮！」',
  },
  {
    id: 'cs-1005',
    name: '戰斗機風箏 (紅/藍/陸地)',
    nameEn: 'Fighter Jet Kite (Red/Blue/Camo)',
    price: 75,
    category: '飛機火箭風箏',
    size: '見詳情頁',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k089.jpg', imageDir: '/image/products/',
    description: '戰斗機系列風箏提供紅色、藍色及陸地迷彩三款款式，完美重現現代戰鬥機的雄姿。採用耐用尼龍材料，飛行穩定，適合在開闊場地放飛，是航空迷和軍事愛好者的最佳選擇。精細的機身細節和鮮明的配色，讓每一款戰斗機風箏都充滿個性。\n\n無論您喜歡紅色的熱情、藍色的冷靜還是迷彩的神秘，這個系列都能滿足您的需求。在公園或海邊放飛，感受駕馭戰機翱翔天際的快感，讓每一次放飛都成為一場空中表演。',
    quote: '「買了紅戰斗機款式，放上天後真的超帥！飛行非常穩定，引來很多人圍觀，非常推薦！」',
  },
  {
    id: 'cs-1006',
    name: '1.45米 細紅飛機風箏',
    nameEn: '1.45m Slim Red Airplane Kite',
    price: 75,
    category: '飛機火箭風箏',
    size: '145cm (W)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k090.jpg', imageDir: '/image/products/',
    description: '1.45米細紅飛機風箏以修長的機身設計展現飛機的速度感與優雅。鮮豔的紅色在藍天中格外搶眼，145cm的展翼讓它在空中飛行時氣勢十足。輕量化設計確保飛行穩定，適合有一定放飛經驗的玩家，也適合想要嘗試大型飛機風箏的初學者。\n\n紅色飛機風箏在天空中劃過一道紅線，充滿速度感和動感。這款風箏特別適合喜歡飛機和航空的孩子，讓他們的夢想在天空中飛翔。在週末帶著它到公園，絕對是一個令人難忘的戶外體驗。',
    quote: '「紅色飛機風箏放上天的樣子真的很帥，細長的機身飛行時很優雅，非常適合拍照留念！」',
  },
  {
    id: 'cs-1007',
    name: '1.5米 藍/紅戰機風箏 (第2代)',
    nameEn: '1.5m Blue/Red Fighter Jet Kite (Gen 2)',
    price: 75,
    category: '飛機火箭風箏',
    size: '150cm (W)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k091.jpg', imageDir: '/image/products/',
    description: '1.5米藍/紅戰機風箏（第2代）在第一代基礎上全面升級，擁有更大的展翼、更精細的細節設計和更優異的飛行性能。提供藍色和紅色兩款選擇，150cm的展翼讓它在空中盡顯戰機風範，是飛行風箏愛好者的升級之選。\n\n第2代戰機風箏採用改良的骨架結構，飛行更加穩定，在各種風力條件下都能保持最佳姿態。無論您是第一代的忠實用戶還是第一次接觸這款設計，都能感受到它帶來的卓越飛行體驗。',
    quote: '「第二代戰機風箏比第一代更穩更大，放上天後整個人都被那種氣勢震撼了，完全物超所值！」',
  },
  {
    id: 'cs-1008',
    name: '戰鬥機風箏',
    nameEn: 'Fighter Jet Kite',
    price: 75,
    category: '飛機火箭風箏',
    size: '見詳情頁',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k092.jpg', imageDir: '/image/products/',
    description: '戰鬥機風箏以精準的軍事飛機造型為藍本，還原戰機的霸氣姿態。採用優質材料製作，飛行性能出色，在公園或海邊放飛時能吸引眾多目光。適合各年齡層的航空迷和風箏愛好者，帶來真實戰機翱翔的視覺震撼。\n\n這款風箏設計精細，每個細節都力求還原真實戰機的外觀。在藍天中放飛時，彷彿看著一架真正的戰鬥機在空中巡弋，充滿力量感。是軍事迷和飛機愛好者的理想收藏。',
    quote: '「戰鬥機風箏放上天那一刻，旁邊的大人小孩都停下來欣賞，那種氣勢真的很震撼！」',
  },
  {
    id: 'cs-1009',
    name: '特技風箏～火熖雙線 1.2米',
    nameEn: 'Stunt Kite – Fire Flame Double Line 1.2m',
    price: 85,
    category: '特技風箏',
    size: '120cm (W)',
    windLevel: '2-5級',
    audience: '進階玩家',
    imageFile: 'k093.jpg', imageDir: '/image/products/',
    description: '火熖雙線特技風箏採用專業雙線設計，讓您可以精確控制風箏的飛行方向和動作。1.2米的展翼配合火焰圖案設計，在空中表演各種特技動作時如火焰飛舞般壯觀。適合喜歡挑戰和追求技術的進階玩家，感受操控雙線特技風箏的獨特樂趣。\n\n雙線操控系統讓您可以做出橫飛、俯衝、環形飛行等各種特技動作。掌握雙線技術後，每次放飛都像是一場空中表演，吸引觀眾讚嘆。如果您想從普通放飛進階到特技飛行，這款就是最佳起點。',
    quote: '「雙線特技風箏真的改變了我對放風箏的看法，可以做各種特技動作，每次表演都引來觀眾喝彩！」',
  },
  {
    id: 'cs-1010',
    name: '特技風箏～飛魚雙線 1.2米',
    nameEn: 'Stunt Kite – Flying Fish Double Line 1.2m',
    price: 85,
    category: '特技風箏',
    size: '120cm (W)',
    windLevel: '2-5級',
    audience: '進階玩家',
    imageFile: 'k093.jpg', imageDir: '/image/products/',
    description: '飛魚雙線特技風箏結合了精緻的飛魚圖案和專業雙線特技設計，為您帶來獨一無二的放飛體驗。1.2米的展翼讓它在空中靈活飛行，雙線操控系統使您能做出各種驚人的特技動作。無論是橫飛、俯衝還是環形飛行，都能輕鬆掌握，是風箏運動愛好者的進階選擇。\n\n飛魚的圖案設計讓這款特技風箏在眾多款式中脫穎而出，飛行時如一條飛魚在天空中躍動。與火熖款相比，飛魚款更顯優雅靈動，是對美觀和技術都有追求的玩家的不二之選。',
    quote: '「飛魚特技風箏圖案美觀，雙線操控靈敏，練習了幾次就能做出很多花式動作，成就感十足！」',
  },
  {
    id: 'cs-1011',
    name: '1.9米 金麟王蛇風箏',
    nameEn: '1.9m Golden Scale King Snake Kite',
    price: 75,
    category: '長蛇風箏',
    size: '190cm (L)',
    windLevel: '2-4級',
    audience: '初學者/家庭/進階玩家',
    imageFile: 'k073.jpg', imageDir: '/image/products/',
    description: '1.9米金麟王蛇風箏以傳統蛇形設計結合金色鱗片圖案，飛行時在空中蜿蜒盤旋，氣勢磅礴。190cm的長度讓它在空中展現出壯觀的視覺效果，金色鱗片在陽光下閃閃發光。採用高強度骨架和抗撕裂布料，確保即使在強風中也能穩定飛行。\n\n金麟王蛇風箏的設計融合了傳統文化與現代風箏技術，既有傳統蛇形風箏的靈動，又有現代材料帶來的耐用性。放飛時那條金色長蛇在空中蜿蜒翱翔的景象，一定能吸引所有旁觀者的目光。',
    quote: '「金麟王蛇風箏放上天後真的很震撼，那條金色長蛇在空中蜿蜒翱翔，引來無數人拍照打卡！」',
  },
  {
    id: 'cs-1012',
    name: '15米 曼巴蛇風箏',
    nameEn: '15m Mamba Snake Kite',
    price: 75,
    category: '長蛇風箏',
    size: '1500cm (L)',
    windLevel: '3-5級',
    audience: '進階玩家/多人協力',
    imageFile: 'k074.jpg', imageDir: '/image/products/',
    description: '15米曼巴蛇風箏是我們蛇形系列中的極致之作，超長的15米蛇形設計在空中展現出令人嘆為觀止的壯觀景象。仿照非洲黑曼巴蛇的造型設計，色彩對比強烈，在藍天中格外醒目。這款超大型風箏需要一定的放飛空間和技術，適合有經驗的玩家或多人協力放飛。\n\n放飛這隻15米巨蛇是一次真正的挑戰，也是一次令人難忘的體驗。當它在空中完全展開時，那種磅礡的氣勢絕非一般風箏可以比擬。這是收藏家和風箏愛好者必不可少的珍藏款式。',
    quote: '「15米的曼巴蛇風箏放上天後，整個海灘的人都震驚了！那條巨型蛇在空中飄蕩的樣子真是壯觀，非常難忘的體驗！」',
  },
  {
    id: 'cs-1013',
    name: '會跳舞的乳牛風箏',
    nameEn: 'Dancing Cow Kite',
    price: 75,
    category: '可愛動物風箏',
    size: '見詳情頁',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k041.jpg', imageDir: '/image/products/',
    description: '會跳舞的乳牛風箏以其生動活潑的乳牛造型和獨特的舞動設計，為您的天空帶來一份輕鬆愉快的驚喜。在微風中，乳牛的身體和四肢隨風搖擺，彷彿真的在跳舞一般，萌趣十足。這款風箏適合家庭親子活動，無論大人小孩都能被這隻跳舞的乳牛所逗樂。\n\n乳牛風箏的設計充滿創意，將農場動物與風箏完美結合。放飛時看著乳牛在天空中隨風舞動，不僅能帶給孩子們歡笑，也能讓大人們感受到童心未泯的快樂。是一款老少咸宜的戶外趣味風箏。',
    quote: '「乳牛風箏放上天後真的像在跳舞，孩子們開心得哈哈大笑，說牛牛在跳肚皮舞！太有趣了！」',
  },
  {
    id: 'cs-1014',
    name: '1.5米 小海龜風箏',
    nameEn: '1.5m Little Sea Turtle Kite',
    price: 75,
    category: '海洋生物風箏',
    size: '150cm (W)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k038.jpg', imageDir: '/image/products/',
    description: '1.5米小海龜風箏以海龜可愛的造型和鮮豔的色彩，將大海的生機帶到天空。細緻的龜甲圖案和溫和的表情，讓它成為最受孩子們歡迎的海洋主題風箏之一。飛行穩定，150cm的尺寸適中，在公園或海邊放飛時特別應景。\n\n海龜風箏的設計精緻，每一塊龜甲都清晰可見，配上鮮豔的顏色，在空中飛行時如同一隻悠游的大海龜。帶著孩子去海邊放飛這隻小海龜，讓他們認識這種珍貴的海洋生物，是一次寓教於樂的戶外活動。',
    quote: '「帶孩子去海邊放海龜風箏，孩子說要讓小海龜回家，真的太可愛了！飛行非常穩定，效果很好！」',
  },
  {
    id: 'cs-1015',
    name: '海龜風箏',
    nameEn: 'Sea Turtle Kite',
    price: 75,
    category: '海洋生物風箏',
    size: '見詳情頁',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k039.jpg', imageDir: '/image/products/',
    description: '海龜風箏以精緻的海龜圖案設計，展現出海洋生物的優雅與神秘。鮮豔的綠色和棕色搭配，在空中飛行時如同一隻悠游的海龜，充滿生命力。適合家庭出遊和親子活動，讓孩子們在放飛風箏的同時了解保護海洋生物的重要性。\n\n海龜是大海的使者，這款風箏讓每個人都能感受到海洋的魅力。在海邊放飛時尤其應景，看著海龜風箏在海風中飛翔，彷彿它真的要回歸大海一樣，充滿詩意。',
    quote: '「海龜風箏的設計非常漂亮，圖案很精緻，放上天後很多小朋友都被吸引過來，都說想摸摸那隻海龜！」',
  },
  {
    id: 'cs-1016',
    name: '小柴犬風箏',
    nameEn: 'Shiba Inu Kite',
    price: 75,
    category: '可愛動物風箏',
    size: '見詳情頁',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k040.jpg', imageDir: '/image/products/',
    description: '小柴犬風箏以超受歡迎的柴犬為主題，憨態可掬的外型和圓滾滾的身形，讓人一見就愛上。這款風箏捕捉了柴犬那份獨特的自我滿足神情，在空中飛行時萌態十足。適合柴犬愛好者和寵物主題風箏收藏者，也是送給寵物愛好者的絕佳禮物。\n\n柴犬是近年最受歡迎的犬種之一，這款風箏將柴犬的萌態完美呈現。放飛時看著柴犬在空中隨風飄動，那種可愛感令人心情大好。是送給朋友的獨特禮物，也是自用收藏的趣味之選。',
    quote: '「我是柴犬迷，一看到這款風箏就立刻買了！放上天後那個傲嬌的表情超搞笑，朋友們都哈哈大笑！」',
  },
  {
    id: 'cs-1017',
    name: '招財貓風箏',
    nameEn: 'Lucky Cat Kite',
    price: 75,
    category: '傳統造型風箏',
    size: '見詳情頁',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k044.jpg', imageDir: '/image/products/',
    description: '招財貓風箏融合了傳統吉祥文化與現代風箏設計，以家喻戶曉的招財貓為主題，在天空中揮舞著幸運的小手。鮮豔的色彩和可愛的造型，讓它成為最受歡迎的文化主題風箏之一。放飛招財貓風箏，不僅能享受戶外樂趣，更寓意招財納福，為您的生活帶來好運。\n\n招財貓是中日文化中的吉祥物，這款風箏將這份吉祥的祝福帶上天空。無論是自用還是送禮，招財貓風箏都是一個充滿心意的選擇，讓每一次放飛都帶著美好的祝願。',
    quote: '「招財貓風箏放上天的時候，小手隨風揮動，感覺真的在招財！朋友說我每次去公園放風箏運氣都很好！」',
  },
  {
    id: 'cs-1018',
    name: '1.8米 小蜜蜂風箏',
    nameEn: '1.8m Bee Kite',
    price: 90,
    category: '昆蟲蝙蝠風箏',
    size: '180cm (W)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k049.jpg', imageDir: '/image/products/',
    description: '1.8米小蜜蜂風箏以活潑可愛的蜜蜂造型和鮮豔的黃黑配色，為您的天空增添一份自然的活力。180cm的展翼讓它在空中非常顯眼，黃黑相間的條紋圖案配合精緻的翅膀設計，飛行時如真實的大型蜜蜂在空中翱翔。飛行穩定，適合家庭戶外活動。\n\n蜜蜂是自然界中勤勞的使者，這款風箏以蜜蜂為主題，讓孩子們了解蜜蜂對自然的重要性。放飛時看著大蜜蜂在空中飛舞，生動有趣，是一款集趣味性與教育性於一身的優質風箏。',
    quote: '「這隻大蜜蜂風箏放上天後太搶眼了，黃黑條紋在陽光下特別好看，旁邊的小朋友都說蜜蜂快把花粉帶回去了！」',
  },
  {
    id: 'cs-1019',
    name: '1.6米 蝙蝠風箏',
    nameEn: '1.6m Bat Kite',
    price: 75,
    category: '昆蟲蝙蝠風箏',
    size: '160cm (W)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k050.jpg', imageDir: '/image/products/',
    description: '1.6米蝙蝠風箏以神秘的蝙蝠造型為設計靈感，展翅飛翔時如暗夜中的蝙蝠翱翔天際。深色的翅膀配合精緻的眼睛設計，充滿神秘感。飛行穩定性極佳，適合在公園或開闊草地放飛，是個性化風箏收藏的理想選擇。\n\n蝙蝠風箏在傍晚放飛特別應景，在橙紅色的天空背景下，這隻蝙蝠看起來格外神秘美麗。無論是萬聖節主題活動還是日常放飛，都能成為眾人矚目的焦點。',
    quote: '「蝙蝠風箏在傍晚放飛特別應景，看著它在橙紅色天空中翱翔，感覺像在拍電影！真的非常好看！」',
  },
  {
    id: 'cs-1020',
    name: '2.4米 蝙蝠風箏',
    nameEn: '2.4m Large Bat Kite',
    price: 75,
    category: '昆蟲蝙蝠風箏',
    size: '240cm (W)',
    windLevel: '2-5級',
    audience: '家庭/進階玩家',
    imageFile: 'k053.jpg', imageDir: '/image/products/',
    description: '2.4米超大蝙蝠風箏是我們蝙蝠系列中的旗艦款式，240cm的巨大展翼在空中展開時，如同一隻真實的大蝙蝠在天空翱翔，氣勢非凡。採用高強度材料製作，適合在較強風力條件下放飛，是進階玩家和收藏家的首選。\n\n在萬聖節等特殊場合放飛這隻巨型蝙蝠，定能成為最令人矚目的焦點。超大尺寸帶來的視覺衝擊是一般風箏無法比擬的，每一次放飛都是一次令人驚嘆的視覺體驗。',
    quote: '「2.4米的大蝙蝠放上天後真的嚇到很多人，有些小朋友第一眼以為是真的蝙蝠！效果超出預期，非常壯觀！」',
  },
  {
    id: 'cs-1021',
    name: '1.65米 雄鷹風箏',
    nameEn: '1.65m Eagle Kite',
    price: 75,
    category: '飛鳥風箏',
    size: '165cm (W) x 75cm (H)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k025.jpg', imageDir: '/image/products/',
    description: '1.65米雄鷹風箏以逼真的老鷹造型展現雄鷹翱翔的氣勢。精細的羽毛紋路印刷和銳利的眼神設計，讓這款風箏在空中飛行時宛如真實的雄鷹在空中巡弋。165cm的展翼帶來出色的飛行性能，穩定性佳，適合各種開闊場地放飛。\n\n雄鷹是力量與自由的象徵，這款風箏讓您在放飛的同時感受那份雄偉的氣魄。無論是家庭放飛還是個人休閒，1.65米的雄鷹都能帶給您難忘的飛行體驗。',
    quote: '「1.65米雄鷹風箏飛上天的樣子非常逼真，遠遠看去真的以為是一隻真老鷹，飛行非常穩定，是我最喜歡的款式之一！」',
  },
  {
    id: 'cs-1022',
    name: '1.7米 白頭鷹風箏',
    nameEn: '1.7m Bald Eagle Kite',
    price: 75,
    category: '飛鳥風箏',
    size: '170cm (W) x 120cm (H)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k026.jpg', imageDir: '/image/products/',
    description: '1.7米白頭鷹風箏以美洲白頭鷹的經典形象為設計靈感，白色頭部與深色羽毛的對比設計讓它在空中格外醒目。170cm的展翼配合精緻的細節處理，無論近看還是遠觀，都能展現出白頭鷹的雄偉氣質。高品質材料確保了優異的飛行性能和耐用性。\n\n白頭鷹是自由和尊嚴的象徵，這款風箏讓您感受到那份莊嚴的氣度。飛行時白色的頭部在空中特別醒目，搭配深色的翅膀，形成強烈的視覺對比，是一款讓人印象深刻的精品風箏。',
    quote: '「白頭鷹風箏白黑配色非常好看，放上天後非常有氣勢，很多人問我哪裡買的，真的是質感之選！」',
  },
  {
    id: 'cs-1023',
    name: '1.8米 金鷹風箏',
    nameEn: '1.8m Golden Eagle Kite',
    price: 90,
    category: '飛鳥風箏',
    size: '180cm (W) x 80cm (H)',
    windLevel: '2-4級',
    audience: '兒童/初學者/家庭',
    imageFile: 'k027.jpg', imageDir: '/image/products/',
    description: '1.8米金鷹風箏以金色老鷹的尊貴形象呈現，180cm的展翼讓它在空中展現出最完美的飛行姿態。棕金色的羽毛配色在陽光下閃耀著金色光芒，宛如天空中的金色王者。採用優質骨架和高強度布料，確保在各種風力條件下都能穩定飛行。\n\n金鷹是力量與財富的象徵，這款風箏以金色為主調，彰顯非凡氣質。在陽光下放飛時，金色羽毛閃閃發光的景象令人嘆為觀止，是鷹系列中最具視覺衝擊力的一款。',
    quote: '「金鷹風箏放上天後金光閃閃，遠看就像真的金色老鷹在翱翔！飛行非常穩定，每次放飛都引來大量圍觀，太帥了！」',
  },
];

// -----------------------------------------------------------------------
// Read the shared page template from c41/index.html
// -----------------------------------------------------------------------
function getPageTemplate() {
  const templatePath = path.join(PRODUCTS_DIR, 'c41', 'index.html');
  const html = fs.readFileSync(templatePath, 'utf-8');
  const mainStart = html.indexOf('<main');
  const mainEnd = html.indexOf('</main>') + '</main>'.length;
  return {
    beforeMain: html.substring(0, mainStart),
    afterMain: html.substring(mainEnd),
  };
}

// -----------------------------------------------------------------------
// Build the Schema.org JSON-LD block for a product
// -----------------------------------------------------------------------
function buildSchemaOrgBlock(product) {
  const imageSrc = product.imageFile
    ? `${SITE_BASE}/catalogue/images/${product.imageFile}`
    : `${SITE_BASE}/image/products/placeholder.jpg`;
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    alternateName: product.nameEn,
    image: imageSrc,
    description: product.description.substring(0, 200).replace(/\n/g, ' '),
    brand: { '@type': 'Brand', name: 'CS Kites 志成香港風箏店' },
    offers: {
      '@type': 'Offer',
      url: `${SITE_BASE}/products/${product.id}/`,
      priceCurrency: 'HKD',
      price: String(product.price),
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'CS Kites 志成香港風箏店' },
    },
  };
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

// -----------------------------------------------------------------------
// Generate individual product page HTML
// -----------------------------------------------------------------------
function generateProductPage(product, template) {
  const { beforeMain, afterMain } = template;
  const productUrl = `${SITE_BASE}/products/${product.id}/`;
  const imgDir = product.imageDir || '/catalogue/images/';
  const imagePath = product.imageFile
    ? `${imgDir}${product.imageFile}`
    : null;
  const metaDesc = product.description.substring(0, 150).replace(/\n/g, ' ');

  let head = beforeMain
    .replace(/(<meta name="description" content=")[^"]*(")/,
      `$1${metaDesc}$2`)
    .replace(/(<title>)[^<]*(- CS Kites[^<]*<\/title>)/,
      `$1${product.name} | CS Kites 志成香港風箏店</title>`)
    .replace(/<link rel="canonical" href="[^"]*">/,
      `<link rel="canonical" href="${productUrl}">`)
    .replace(/<link rel="alternate" hreflang="zh-HK" href="[^"]*">/,
      `<link rel="alternate" hreflang="zh-HK" href="${productUrl}">`)
    .replace(/<link rel="alternate" hreflang="x-default" href="[^"]*">/,
      `<link rel="alternate" hreflang="x-default" href="${productUrl}">`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      buildSchemaOrgBlock(product));

  const descParagraphs = product.description
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p class="text-gray-700 mb-3">${p.trim()}</p>`)
    .join('\n            ');

  const imageHtml = imagePath
    ? `<img src="${imagePath}" alt="${product.name}" class="w-full rounded-lg shadow-md" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\"w-full aspect-square flex items-center justify-center text-8xl bg-gray-100 rounded-lg\\">🪁</div>'">`
    : `<div class="w-full aspect-square flex items-center justify-center text-8xl bg-gray-100 rounded-lg">🪁</div>`;

  const mainContent = `<main class="flex-grow">
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-6xl mx-auto">
      <nav class="text-sm text-gray-500 mb-6">
        <a href="/products" class="hover:text-green-600">所有風箏產品</a>
        <span class="mx-2">›</span>
        <span class="text-gray-800 font-medium">${product.name}</span>
      </nav>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>${imageHtml}</div>

        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">${product.name}</h1>
          <p class="text-gray-500 mb-4">${product.nameEn}</p>

          <div class="mb-6">
            <span class="text-3xl font-bold text-blue-600">HK$${product.price}</span>
            <span class="text-gray-500 ml-2">參考價格</span>
          </div>

          <div class="mb-6 bg-gray-50 rounded-lg p-4">
            <h2 class="text-xl font-semibold text-gray-800 mb-3">產品規格</h2>
            <dl class="space-y-2">
              <div class="flex">
                <dt class="font-semibold text-gray-700 w-24 shrink-0">尺寸：</dt>
                <dd class="text-gray-600">${product.size}</dd>
              </div>
              <div class="flex">
                <dt class="font-semibold text-gray-700 w-24 shrink-0">適用風力：</dt>
                <dd class="text-gray-600">${product.windLevel}</dd>
              </div>
              <div class="flex">
                <dt class="font-semibold text-gray-700 w-24 shrink-0">適合對象：</dt>
                <dd class="text-gray-600">${product.audience}</dd>
              </div>
            </dl>
          </div>

          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">產品介紹</h2>
            ${descParagraphs}
          </div>

          <div class="mb-6 bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4">
            <p class="text-amber-800 italic">${product.quote}</p>
          </div>

          <div class="mb-6">
            <span class="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
              ${product.category}
            </span>
          </div>
        </div>
      </div>

      <div class="mb-12">
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
</main>`;

  return head + mainContent + afterMain;
}

// -----------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------
function main() {
  console.log('=== CS Kites Bulk Product Upload ===');
  console.log(`Generating ${PRODUCTS.length} product pages...\n`);

  const template = getPageTemplate();

  for (const product of PRODUCTS) {
    const productDir = path.join(PRODUCTS_DIR, String(product.id));
    fs.mkdirSync(productDir, { recursive: true });
    const html = generateProductPage(product, template);
    fs.writeFileSync(path.join(productDir, 'index.html'), html, 'utf-8');
    const imgNote = product.imageFile ? '🖼' : '⚠ no image';
    console.log(`  ✓ products/${product.id}/  ${imgNote}  ${product.name}  (HK$${product.price})`);
  }

  console.log(`\n✅ Done — ${PRODUCTS.length} pages created.`);
  console.log('\nImages with files ready:');
  PRODUCTS.filter(p => p.imageFile).forEach(p =>
    console.log(`  /catalogue/images/${p.imageFile}`)
  );
  console.log('\nProducts needing images (⚠):');
  PRODUCTS.filter(p => !p.imageFile).forEach(p =>
    console.log(`  products/${p.id}/  — ${p.name}`)
  );
  console.log('\nNext: node update-related-products.js && node update-homepage.js');
}

main();
