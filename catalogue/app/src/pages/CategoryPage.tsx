import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { categories, getProductsByCategory } from '@/data/products';
import { SEO } from '@/components/SEO';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import ProductFilterBar from '@/components/ProductFilterBar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const PRODUCTS_PER_PAGE = 16;

export default function CategoryPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const decodedCategory = decodeURIComponent(categoryName || '');
  const [currentPage, setCurrentPage] = useState(1);
  const { addToCart, isInCart } = useCart();

  // Validate category
  if (!categories.includes(decodedCategory as any)) {
    return (
      <div className="py-20 px-4 text-center">
        <h1 className="text-2xl text-white mb-4">分類不存在</h1>
        <Link to="/" className="text-yellow-300 hover:underline">
          返回首頁
        </Link>
      </div>
    );
  }

  const products = getProductsByCategory(decodedCategory);
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = products.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const categoryIcons: Record<string, string> = {
    '飛鳥風箏': '🦅',
    '海洋生物風箏': '🐠',
    '蝴蝶風箏': '🦋',
    '神龍風箏': '🐉',
    '可愛動物風箏': '🐕',
    '昆蟲蝙蝠風箏': '🦇',
    '飛機火箭風箏': '✈️',
    '傳統造型風箏': '🌈',
    '長蛇風箏': '🐍',
    '迷你手掌風箏': '👋',
    '特技風箏': '🎯',
    '卡通人物風箏': '🤖',
    '風箏配件與工具': '🧰',
  };

  return (
    <div className="py-8 px-4">
      <SEO 
        title={`${decodedCategory} - 香港風箏零售批發`}
        description={`${decodedCategory}系列，提供${products.length}款精選風箏，適合戶外活動及親子同樂。歡迎批發查詢。`}
      />

      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-white/70 mb-6">
          <Link to="/" className="hover:text-white">首頁</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{decodedCategory}</span>
        </nav>

        {/* Category Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl md:text-6xl">{categoryIcons[decodedCategory] || '🪁'}</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{decodedCategory}</h1>
              <p className="text-white/70 mt-1">共 {products.length} 件產品</p>
            </div>
          </div>
        </div>

        {/* Filter Search Bar */}
        <div className="mb-8">
          <ProductFilterBar defaultCategory={decodedCategory} />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {paginatedProducts.map(product => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <Link to={`/product/${product.id}`}>
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
                  <div className="absolute top-2 left-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {product.id}
                    </span>
                  </div>
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-gray-800 line-clamp-2 min-h-[3rem]">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-red-500 font-bold text-lg mt-2">{product.price}</p>
                <Button
                  onClick={() => addToCart(product)}
                  variant={isInCart(product.id) ? "secondary" : "default"}
                  className={`w-full mt-3 ${isInCart(product.id) ? 'bg-green-100 text-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isInCart(product.id) ? '已加入查詢車' : '加入查詢車'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Page Info */}
        <div className="text-center text-white/60 mt-4">
          第 {currentPage} 頁，共 {totalPages} 頁 (顯示 {startIndex + 1}-{Math.min(startIndex + PRODUCTS_PER_PAGE, products.length)} 件產品)
        </div>
      </div>
    </div>
  );
}
