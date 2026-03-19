import { Link } from 'react-router-dom';
import { categories, products, getCategoryProductCount } from '@/data/products';
import { SEO } from '@/components/SEO';
import { MessageCircle, Wind, Package, Truck } from 'lucide-react';
import ProductFilterBar from '@/components/ProductFilterBar';

export default function HomePage() {
  // Get featured products (one from each category)
  const featuredProducts = categories.slice(0, 4).map(cat => 
    products.find(p => p.category === cat)
  ).filter(Boolean);

  return (
    <div>
      <SEO 
        title="CS Kite 志成風箏 - 香港專業風箏零售批發"
        description="全港最大風箏零售批發商，提供超過100款風箏，包括飛鳥風箏、海洋生物風箏、蝴蝶風箏、神龍風箏等。歡迎批發查詢。"
      />

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6">
            <span className="text-6xl md:text-8xl">🪁</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            CS Kite 志成風箏
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4">
            全港最大風箏零售批發商
          </p>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            超過100款精選風箏，適合戶外活動、親子同樂、學校活動及批發訂購
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/category/飛鳥風箏"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-yellow-300 hover:text-blue-800 transition-all transform hover:scale-105"
            >
              <Wind className="w-5 h-5 mr-2" />
              瀏覽產品
            </Link>
            <a
              href="https://wa.me/85261741284"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-all transform hover:scale-105"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp 查詢
            </a>
          </div>

          {/* Filter Search Bar */}
          <div className="mt-12 max-w-5xl mx-auto">
            <ProductFilterBar />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-white mb-2">100+</div>
              <div className="text-white/80">款風箏</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-white mb-2">13</div>
              <div className="text-white/80">個分類</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-white mb-2">30+</div>
              <div className="text-white/80">年經驗</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-white mb-2">批發</div>
              <div className="text-white/80">優惠價</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            產品分類
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, index) => {
              const count = getCategoryProductCount(cat);
              const icons = ['🦅', '🐠', '🦋', '🐉', '🐕', '🦇', '✈️', '🌈', '🐍', '👋', '🎯', '🤖', '🧰'];
              return (
                <Link
                  key={cat}
                  to={`/category/${encodeURIComponent(cat)}`}
                  className="group bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-all transform hover:scale-105"
                >
                  <div className="text-4xl mb-3">{icons[index] || '🪁'}</div>
                  <h3 className="text-white font-semibold mb-1">{cat}</h3>
                  <p className="text-white/60 text-sm">{count} 件產品</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            精選產品
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => product && (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect fill="%23f0f0f0" width="300" height="300"/><text fill="%23999" x="50%" y="50%" text-anchor="middle" font-size="60">🪁</text></svg>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">🪁</div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs text-blue-600 font-medium">{product.category}</span>
                  <h3 className="font-semibold text-gray-800 mt-1 line-clamp-2">{product.name}</h3>
                  <p className="text-red-500 font-bold mt-2">{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            為什麼選擇我們
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
              <Package className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">品質保證</h3>
              <p className="text-white/70">精選優質材料，每款風箏都經過嚴格測試</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
              <Truck className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">批發優惠</h3>
              <p className="text-white/70">大量訂購享有特別優惠價格，適合學校及活動</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
              <MessageCircle className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">專業諮詢</h3>
              <p className="text-white/70">30年風箏經驗，為您推薦最適合的產品</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            批量訂購查詢
          </h2>
          <p className="text-white/80 mb-8">
            歡迎學校、機構、批發商查詢大量訂購優惠。我們提供專業建議及最佳價格。
          </p>
          <a
            href="https://wa.me/85261741284"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-all transform hover:scale-105"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            WhatsApp 查詢: 6174 1284
          </a>
        </div>
      </section>
    </div>
  );
}
