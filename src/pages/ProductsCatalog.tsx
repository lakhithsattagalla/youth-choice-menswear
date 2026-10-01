import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, RefreshCcw } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { apiRequest } from '../services/api';

export const ProductsCatalog: React.FC<{ defaultGender?: string }> = ({ defaultGender }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [selectedGender, setSelectedGender] = useState<string>(searchParams.get('gender') || defaultGender || 'ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get('brand') || '');
  const [selectedSize, setSelectedSize] = useState<string>(searchParams.get('size') || '');
  const [selectedColor, setSelectedColor] = useState<string>(searchParams.get('color') || '');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  const sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const colorsList = ['Black', 'White', 'Navy Blue', 'Olive', 'Beige', 'Charcoal', 'Red', 'Gray'];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedGender && selectedGender !== 'ALL') params.append('gender', selectedGender);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedBrand) params.append('brand', selectedBrand);
      if (selectedSize) params.append('size', selectedSize);
      if (selectedColor) params.append('color', selectedColor);
      if (maxPrice) params.append('maxPrice', maxPrice.toString());
      if (sortBy) params.append('sort', sortBy);
      if (inStockOnly) params.append('inStock', 'true');

      const q = searchParams.get('q');
      if (q) params.append('search', q);

      const res = await apiRequest(`/products?${params.toString()}`);
      setProducts(res.products || []);
    } catch (err) {
      console.error('Error fetching products catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      apiRequest('/brands'),
      apiRequest('/categories')
    ]).then(([bRes, cRes]) => {
      setBrands(bRes.brands || []);
      setCategories(cRes.categories || []);
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedGender, selectedCategory, selectedBrand, selectedSize, selectedColor, maxPrice, sortBy, inStockOnly, searchParams]);

  const resetFilters = () => {
    setSelectedGender('ALL');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedSize('');
    setSelectedColor('');
    setMaxPrice(5000);
    setSortBy('recommended');
    setInStockOnly(false);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">CATALOG</span>
          <h1 className="text-3xl font-display font-extrabold text-white uppercase tracking-wide">
            {selectedGender !== 'ALL' ? `${selectedGender}'S COLLECTION` : "EXPLORE ALL CLOTHING"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Showing {products.length} premium style items</p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-2 bg-neutral-900 border border-neutral-800 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold"
          >
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Filters</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="recommended">Recommended</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="highest-rated">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filter Options */}
        <div className="hidden lg:block space-y-6 bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl h-fit">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Filters</span>
            </h3>
            <button 
              onClick={resetFilters}
              className="text-[11px] text-amber-400 hover:underline font-medium flex items-center space-x-1"
            >
              <RefreshCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Gender Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {['ALL', 'MEN', 'WOMEN'].map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedGender === g 
                      ? 'bg-amber-500 text-black shadow' 
                      : 'bg-neutral-800 text-slate-300 hover:bg-neutral-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 text-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.gender})</option>
              ))}
            </select>
          </div>

          {/* Brands Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 text-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="">All Brands</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Size Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Size</label>
            <div className="flex flex-wrap gap-2">
              {sizesList.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    selectedSize === s 
                      ? 'bg-amber-500 text-black border-amber-500' 
                      : 'bg-neutral-800 text-slate-300 border-neutral-700 hover:border-amber-500/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Color</label>
            <div className="flex flex-wrap gap-2">
              {colorsList.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(selectedColor === c ? '' : c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedColor === c 
                      ? 'bg-amber-500 text-black font-bold border-amber-500' 
                      : 'bg-neutral-800 text-slate-300 border-neutral-700 hover:border-amber-500/50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Range */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-400">Max Price</span>
              <span className="font-bold text-amber-400">₹{maxPrice.toLocaleString()}</span>
            </div>
            <input 
              type="range"
              min="500"
              max="10000"
              step="250"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-500 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* In Stock Toggle */}
          <label className="flex items-center space-x-3 cursor-pointer pt-2">
            <input 
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs text-slate-300 font-medium">In Stock Only</span>
          </label>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 rounded-2xl animate-shimmer border border-neutral-800" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
              <p className="text-base text-slate-300 font-semibold">No products match your criteria</p>
              <button 
                onClick={resetFilters}
                className="bg-amber-500 text-black font-bold text-xs px-6 py-2.5 rounded-xl uppercase tracking-wider"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
