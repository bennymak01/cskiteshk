import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { SEO } from '@/components/SEO';
import { Trash2, ShoppingCart, MessageCircle, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { items, removeFromCart, clearCart, totalItems, getWhatsAppLink, addToCart } = useCart();

  return (
    <div className="py-8 px-4">
      <SEO 
        title="查詢車 - 產品查詢"
        description="選擇您想查詢的風箏產品，透過 WhatsApp 向我們查詢價格及庫存。"
      />

      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-white/70 mb-6">
          <Link to="/" className="hover:text-white">首頁</Link>
          <span className="mx-2">/</span>
          <span className="text-white">查詢車</span>
        </nav>

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">查詢車</h1>
              <p className="text-white/70 mt-1">
                {totalItems === 0 ? '尚未選擇產品' : `已選擇 ${totalItems} 件產品`}
              </p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">查詢車是空的</h2>
            <p className="text-gray-500 mb-6">請瀏覽產品並加入查詢車</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              瀏覽產品
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-6">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-gray-700">已選產品</h2>
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-600 text-sm flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    清空
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map(item => (
                  <div key={item.id} className="p-4 flex items-center gap-4">
                    <Link to={`/product/${item.id}`} className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23f0f0f0" width="80" height="80"/><text fill="%23999" x="50%" y="50%" text-anchor="middle" font-size="30">🪁</text></svg>';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🪁</div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.id}`}>
                        <span className="text-xs text-blue-600 font-medium">{item.id}</span>
                        <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                      </Link>
                      <p className="text-red-500 font-bold mt-1">{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">
                  已選擇 <span className="font-bold text-blue-600">{totalItems}</span> 件產品
                </p>
                <p className="text-sm text-gray-500">
                  點擊下方按鈕透過 WhatsApp 向我們查詢
                </p>
              </div>
              
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors text-lg"
              >
                <MessageCircle className="w-6 h-6 mr-2" />
                透過 WhatsApp 查詢 ({totalItems} 件產品)
              </a>
              
              <div className="mt-4 text-center">
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  繼續選購
                </Link>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 bg-yellow-100 rounded-xl p-4">
              <p className="text-yellow-800 text-sm">
                <strong>💡 提示：</strong>您可以同時選擇多件產品一起查詢，我們會為您提供批量優惠價格。
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
