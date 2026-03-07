import { useParams, Link } from 'react-router-dom';
import { getProductById, getRelatedProducts } from '@/data/products';
import { SEO } from '@/components/SEO';
import { ShoppingCart, ChevronLeft, Check, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const { addToCart, removeFromCart, isInCart } = useCart();

  const product = getProductById(productId || '');

  if (!product) {
    return (
      <div className="py-20 px-4 text-center">
        <h1 className="text-2xl text-white mb-4">產品不存在</h1>
        <Link to="/" className="text-yellow-300 hover:underline">
          返回首頁
        </Link>
      </div>
    );
  }

  const relatedProducts = getRelatedProducts(product, 3);
  const inCart = isInCart(product.id);

  return (
    <div className="py-8 px-4">
      <SEO 
        title={`${product.name} - ${product.id}`}
        description={product.description}
      />

      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-white/70 mb-6">
          <Link to="/" className="hover:text-white">首頁</Link>
          <span className="mx-2">/</span>
          <Link to={`/category/${encodeURIComponent(product.category)}`} className="hover:text-white">
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image */}
            <div className="aspect-square bg-gray-100 relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect fill="%23f0f0f0" width="600" height="600"/><text fill="%23999" x="50%" y="50%" text-anchor="middle" font-size="100">🪁</text></svg>';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🪁</div>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {product.id}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-6 md:p-10 flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>
              
              <div className="text-3xl md:text-4xl font-bold text-red-500 mb-6">
                {product.price}
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h2 className="font-semibold text-gray-700 mb-2">產品描述</h2>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="space-y-4">
                {inCart ? (
                  <Button
                    onClick={() => removeFromCart(product.id)}
                    variant="outline"
                    className="w-full py-6 text-lg border-green-500 text-green-600 hover:bg-green-50"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    已加入查詢車
                  </Button>
                ) : (
                  <Button
                    onClick={() => addToCart(product)}
                    className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    加入查詢車
                  </Button>
                )}

                <a
                  href={`https://wa.me/85261741284?text=${encodeURIComponent(`你好，我想查詢產品 ${product.id} - ${product.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full py-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  直接 WhatsApp 查詢
                </a>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  to={`/category/${encodeURIComponent(product.category)}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  返回 {product.category}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              相關推薦
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map(related => (
                <Link
                  key={related.id}
                  to={`/product/${related.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {related.image_url ? (
                      <img
                        src={related.image_url}
                        alt={related.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225"><rect fill="%23f0f0f0" width="400" height="225"/><text fill="%23999" x="50%" y="50%" text-anchor="middle" font-size="50">🪁</text></svg>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🪁</div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-blue-600 font-medium">{related.id}</span>
                    <h3 className="font-semibold text-gray-800 mt-1 line-clamp-2">{related.name}</h3>
                    <p className="text-red-500 font-bold mt-2">{related.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
