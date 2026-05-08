import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import VariantModal, { productHasVariants } from './VariantModal';

const ProductCard = ({ product }) => {
  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const wishlist = useStore((state) => state.wishlist);

  const [showVariantModal, setShowVariantModal] = useState(false);

  const isWishlisted = wishlist.some((item) => item.id === product.id);
  const hasVariants = productHasVariants(product);

  const handleAddToCartClick = () => {
    if (hasVariants) {
      setShowVariantModal(true);
    } else {
      // Product has no variants — add directly with empty selections
      addToCart({ ...product, selectedSize: '', selectedColor: '' });
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="group relative glass rounded-3xl p-6 flex flex-col items-center gap-4 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all overflow-hidden"
      >
        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
            {product.discount}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors backdrop-blur-md"
        >
          <Heart size={20} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'} />
        </button>

        {/* Image Container with Hover Effect */}
        <Link to={`/product/${product.id}`} className="w-full relative h-64 flex items-center justify-center">
          <img
            src={`/assets/${product.mainImage}`}
            alt={product.name}
            className="max-h-full object-contain transition-opacity duration-500 group-hover:opacity-0"
          />
          {product.hoverImage && (
            <img
              src={`/assets/${product.hoverImage}`}
              alt={`${product.name} alternate`}
              className="absolute inset-0 max-h-full w-full object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Product Info */}
        <div className="w-full text-center space-y-2">
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">{product.colors}</p>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-medium text-brand-light hover:text-white transition-colors">{product.name}</h3>
          </Link>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-bold text-orange-400">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCartClick}
          className="w-full py-3 mt-2 rounded-full bg-white/10 hover:bg-white text-white hover:text-brand-dark font-semibold flex items-center justify-center gap-2 transition-colors backdrop-blur-sm"
        >
          <ShoppingCart size={18} />
          {hasVariants ? 'Select & Add' : 'Add to Cart'}
        </motion.button>
      </motion.div>

      {/* Variant selection modal — only mounts when open */}
      {showVariantModal && (
        <VariantModal
          product={product}
          onClose={() => setShowVariantModal(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
