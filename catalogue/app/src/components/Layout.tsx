import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { categories } from '@/data/products';
import { SEO } from './SEO';

export default function Layout() {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-purple-600">
      <SEO 
        title="CS Kite 志成風箏 - 香港專業風箏零售批發"
        description="全港最大風箏零售批發商，提供超過100款風箏，包括飛鳥風箏、海洋生物風箏、蝴蝶風箏、神龍風箏等。歡迎批發查詢。"
      />
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-3xl">🪁</span>
              <div>
                <h1 className="text-xl font-bold text-white">CS Kite</h1>
                <p className="text-xs text-white/80">志成風箏</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-white hover:text-yellow-300 transition-colors">
                首頁
              </Link>
              <div className="relative group">
                <button className="text-white hover:text-yellow-300 transition-colors flex items-center">
                  產品分類
                </button>
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    {categories.map(cat => (
                      <Link
                        key={cat}
                        to={`/category/${encodeURIComponent(cat)}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              {/* Desktop Search */}
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜尋風箏..."
                  className="w-36 lg:w-48 bg-white/15 border border-white/30 text-white placeholder-white/60 rounded-l-full px-3 py-1.5 text-sm focus:outline-none focus:bg-white/25 focus:border-white/50"
                />
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-r-full px-3 py-1.5 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              <Link to="/cart" className="relative text-white hover:text-yellow-300 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex items-center mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜尋風箏..."
                  className="flex-1 bg-gray-100 border border-gray-300 text-gray-800 placeholder-gray-400 rounded-l-full px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-r-full px-4 py-2 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              <Link
                to="/"
                className="block py-2 text-gray-800 hover:text-blue-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                首頁
              </Link>
              <p className="font-semibold text-gray-600 py-2">產品分類</p>
              {categories.map(cat => (
                <Link
                  key={cat}
                  to={`/category/${encodeURIComponent(cat)}`}
                  className="block pl-4 py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat}
                </Link>
              ))}
              <Link
                to="/cart"
                className="flex items-center py-2 text-gray-800 hover:text-blue-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                查詢車 ({totalItems})
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-3xl">🪁</span>
                <div>
                  <h3 className="text-lg font-bold">CS Kite</h3>
                  <p className="text-sm text-white/80">志成風箏</p>
                </div>
              </div>
              <p className="text-white/70 text-sm">
                全港最大風箏零售批發商，提供各類優質風箏產品。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">聯絡我們</h4>
              <p className="text-white/70 text-sm mb-2">九龍界限街12號D地下</p>
              <p className="text-white/70 text-sm mb-2">電話: 2778 3809</p>
              <a 
                href="https://wa.me/85261741284" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-green-400 hover:text-green-300"
              >
                WhatsApp: 6174 1284
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-4">產品分類</h4>
              <div className="grid grid-cols-2 gap-2">
                {categories.slice(0, 6).map(cat => (
                  <Link
                    key={cat}
                    to={`/category/${encodeURIComponent(cat)}`}
                    className="text-white/70 text-sm hover:text-white"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60 text-sm">
            <p>© 2024 CS Kite 志成風箏. All rights reserved. | <a href="/terms" className="hover:text-white underline">條款與細則</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
