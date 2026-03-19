import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { categories } from '@/data/products';

interface ProductFilterBarProps {
  defaultCategory?: string;
}

export default function ProductFilterBar({ defaultCategory = '' }: ProductFilterBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [priceRange, setPriceRange] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (priceRange) params.set('priceRange', priceRange);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
      <p className="text-white/70 text-sm mb-4 font-medium">搜尋您喜歡的風箏</p>
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Category Dropdown */}
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none cursor-pointer"
          >
            <option value="" className="bg-gray-800">- 選擇分類 -</option>
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-gray-800">{cat}</option>
            ))}
          </select>

          {/* Price Range Dropdown */}
          <select
            value={priceRange}
            onChange={e => setPriceRange(e.target.value)}
            className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none cursor-pointer"
          >
            <option value="" className="bg-gray-800">- 價格範圍 -</option>
            <option value="under50" className="bg-gray-800">HK$50 以下</option>
            <option value="50-100" className="bg-gray-800">HK$50 – $100</option>
            <option value="100-200" className="bg-gray-800">HK$100 – $200</option>
            <option value="over200" className="bg-gray-800">HK$200 以上</option>
          </select>

          {/* Keyword Input */}
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜尋關鍵字..."
            className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          {/* Search Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold rounded-lg px-6 py-3 transition-all transform hover:scale-105"
          >
            <Search className="w-4 h-4" />
            搜尋產品
          </button>
        </div>
      </form>
    </div>
  );
}
