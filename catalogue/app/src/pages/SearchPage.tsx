import { useSearchParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { filterProducts } from '@/data/products';
import { SEO } from '@/components/SEO';
import { ShoppingCart, Search } from 'lucide-react';
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

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const { addToCart, isInCart } = useCart();

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const priceRange = searchParams.get('priceRange') || '';

  const results = filterProducts(query, category, priceRange);
  const totalPages = Math.ceil(results.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = results.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const hasFilters = query || category || priceRange;

  return (
    <div className="py-8 px-4">
      <SEO
        title="搜尋產品 - CS Kite 志成風箏"
        description="搜尋香港風箏產品"
      />

      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-white/70 mb-6">
          <Link to="/" className="hover:text-white">首頁</Link>
          <span className="mx-2">/</span>
          <span className="text-white">搜尋結果</span>
        </nav>

        {/* Filter Bar */}
        <div className="mb-8">
          <ProductFilterBar defaultCategory={category} />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Search className="w-6 h-6" />
              搜尋結果
            </h1>
            <p className="text-white/70 mt-1">
              找到 <span className="text-yellow-300 font-semibold">{results.length}</span> 件產品
              {query && <span>（關鍵字：<span className="text-yellow-300">"{query}"</span>）</span>}
              {category && <span>（分類：<span className="text-yellow-300">{category}</span>）</span>}
            </p>
          </div>
          {hasFilters && (
            <Link
              to="/search"
              className="text-white/60 hover:text-white text-sm underline"
            >
              清除篩選
            </Link>
          )}
        </div>

        {/* Empty State */}
        {results.length === 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-16 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-white mb-2">找不到相關產品</h2>
            <p className="text-white/60 mb-6">請嘗試不同的關鍵字或篩選條件</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-yellow-400 text-gray-900 rounded-full font-semibold hover:bg-yellow-300 transition-all"
            >
              瀏覽所有產品
            </Link>
          </div>
        )}

        {/* Products Grid */}
        {results.length > 0 && (
          <>
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
                    <p className="text-white/60 text-xs mt-1">{product.category}</p>
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

            <div className="text-center text-white/60 mt-4">
              第 {currentPage} 頁，共 {totalPages} 頁 (顯示 {startIndex + 1}-{Math.min(startIndex + PRODUCTS_PER_PAGE, results.length)} 件產品)
            </div>
          </>
        )}
      </div>
    </div>
  );
}
