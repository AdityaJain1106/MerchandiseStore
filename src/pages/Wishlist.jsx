import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import useStore from '../store/useStore';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';

const Wishlist = () => {
  const wishlist = useStore((state) => state.wishlist);

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <Heart size={48} className="text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Your wishlist is empty</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          Save items you love here to easily find them later.
        </p>
        <Link to="/shop">
          <Button>Explore Collection</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-4">Your Wishlist</h1>
      <p className="text-gray-400 mb-12">Items you've saved for later.</p>

      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Wishlist;
