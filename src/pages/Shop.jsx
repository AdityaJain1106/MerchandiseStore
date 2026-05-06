import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import productsData from '../data/products.json';
import Button from '../components/Button';

const categories = ['All', 'Hoodies', 'Shirts', 'Accessories', 'Caps', 'Mugs', 'Posters'];

// Find the maximum price in the data to set the slider range
const maxProductPrice = Math.max(...productsData.map(p => Number(p.price) || 0));

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(maxProductPrice);

  const handleCategoryChange = (cat) => {
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchQuery('');
    handleCategoryChange('All');
    setMaxPrice(maxProductPrice);
  };

  const filteredProducts = useMemo(() => {
    return productsData.filter((product) => {
      let matchesCategory = false;
      if (activeCategory === 'All') {
        matchesCategory = true;
      } else if (activeCategory === 'Accessories') {
        matchesCategory = ['Caps', 'Mugs', 'Posters'].includes(product.category);
      } else {
        matchesCategory = product.category === activeCategory;
      }

      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = Number(product.price) <= maxPrice;
      return matchesCategory && matchesSearch && matchesPrice;
    });
  }, [activeCategory, searchQuery, maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8 relative">
      
      {/* Mobile Filter Overlay */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Filter Sidebar */}
      <AnimatePresence>
        {(isFilterOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className={`fixed md:sticky top-0 md:top-24 left-0 h-full md:h-auto w-[280px] md:w-1/4 bg-brand-primary md:bg-transparent z-50 md:z-10 p-6 md:p-0 overflow-y-auto border-r border-white/10 md:border-none shadow-2xl md:shadow-none transition-transform`}
          >
            <div className="flex justify-between items-center mb-8 md:hidden">
              <h2 className="text-2xl font-bold text-white">Filters</h2>
              <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Category Filter */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
                <div className="flex flex-col gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`text-left px-4 py-2 rounded-lg transition-all ${
                        activeCategory === category
                          ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Max Price</h3>
                  <span className="text-orange-400 font-bold">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxProductPrice}
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-500 bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>₹0</span>
                  <span>₹{maxProductPrice}</span>
                </div>
              </div>

              {/* Clear Filters */}
              <Button variant="secondary" className="w-full" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="w-full md:w-3/4 flex flex-col">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Shop Collection</h1>
            <p className="text-gray-400">Discover all official merchandise.</p>
          </div>

          <div className="w-full sm:w-auto flex gap-4">
            <div className="relative w-full sm:w-64 flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="md:hidden flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors border border-white/10"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20 glass rounded-3xl mt-8">
            <p className="text-2xl text-gray-400 mb-4">No products found matching your criteria.</p>
            <button 
              onClick={clearFilters}
              className="text-blue-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
