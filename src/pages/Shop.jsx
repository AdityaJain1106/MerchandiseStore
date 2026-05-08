import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import productsData from '../data/products.json';
import Button from '../components/Button';

const categories = ['All', 'Hoodies', 'Shirts', 'Accessories', 'Caps', 'Mugs', 'Posters'];

// Find the maximum price in the data to set the slider range
const maxProductPrice = Math.max(...productsData.map(p => Number(p.price) || 0));

// ─── Scroll-direction hook (mobile sticky bar) ────────────────────────────────
// Returns true when the bar should be visible (scroll up or near top).
// Uses a passive rAF-debounced listener for zero jank and proper cleanup.
const useScrollVisible = (threshold = 6) => {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const rafId = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafId.current) return; // already scheduled
      rafId.current = requestAnimationFrame(() => {
        const currentY = window.scrollY;
        if (currentY < 60) {
          setVisible(true); // always show near top
        } else if (currentY - lastY.current > threshold) {
          setVisible(false); // scrolling down
        } else if (lastY.current - currentY > threshold) {
          setVisible(true); // scrolling up
        }
        lastY.current = currentY;
        rafId.current = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [threshold]);

  return visible;
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mobileBarVisible = useScrollVisible();
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

      {/* ── Mobile Sticky Search + Filter Bar ──────────────────────────────
          Only visible on screens < md. Slides up/down based on scroll dir.
          Sits at top-14 (flush below the 56 px navbar).
      ─────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileBarVisible && (
          <motion.div
            key="mobile-sticky-bar"
            initial={{ y: -72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -72, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="md:hidden fixed top-14 left-0 right-0 z-30 px-4 py-2.5"
            style={{
              background: 'rgba(4, 15, 42, 0.90)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
            }}
          >
            <div className="flex items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={17}
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                {/* Clear search */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-full transition-colors border border-white/10 text-sm flex-shrink-0"
              >
                <SlidersHorizontal size={16} />
                <span className="text-xs font-medium">Filter</span>
              </button>
            </div>

            {/* Active-filter chips (show category + price hint) */}
            {(activeCategory !== 'All' || maxPrice < maxProductPrice) && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {activeCategory !== 'All' && (
                  <span className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-2.5 py-0.5">
                    {activeCategory}
                    <button onClick={() => handleCategoryChange('All')}>
                      <X size={11} />
                    </button>
                  </span>
                )}
                {maxPrice < maxProductPrice && (
                  <span className="flex items-center gap-1 text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full px-2.5 py-0.5">
                    ≤ ₹{maxPrice}
                    <button onClick={() => setMaxPrice(maxProductPrice)}>
                      <X size={11} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated spacer — collapses when the sticky bar hides so no dead gap remains */}
      <motion.div
        className="md:hidden overflow-hidden"
        animate={{ height: mobileBarVisible ? 56 : 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        aria-hidden="true"
      />

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

        {/* Header & Controls — desktop only (hidden on mobile, handled by sticky bar) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Shop Collection</h1>
            <p className="text-gray-400">Discover all official merchandise.</p>
          </div>

          {/* Desktop search + filter toggle (hidden on mobile) */}
          <div className="hidden sm:flex w-auto gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Desktop filter toggle (md+ only) */}
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

