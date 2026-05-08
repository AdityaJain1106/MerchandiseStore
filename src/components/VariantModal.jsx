// src/components/VariantModal.jsx
// Glassmorphism "Select Variant" modal for product cards.
// Features:
//   - Portal-rendered (z-[9998], below CheckoutModal)
//   - Body-scroll lock while open
//   - Dismiss via backdrop click or ESC key
//   - Shake + inline error when size or colour is missing
//   - Toast fires automatically via useStore.addToCart

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, AlertCircle } from 'lucide-react';
import useStore from '../store/useStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true when the product has at least one size and one colour defined.
 * Used by both VariantModal (internal guard) and ProductCard (external guard).
 */
export const productHasVariants = (product) =>
  Array.isArray(product?.sizes) &&
  product.sizes.length > 0 &&
  Array.isArray(product?.availableColors) &&
  product.availableColors.length > 0;

// ─── Shake keyframes (inline style; no extra CSS file needed) ─────────────────
const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [0, -8, 8, -6, 6, -4, 4, 0],
    transition: { duration: 0.45, ease: 'easeInOut' },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

const VariantModal = ({ product, onClose }) => {
  const addToCart = useStore((state) => state.addToCart);

  // ── Variant state ──────────────────────────────────────────────────────────
  const hasVariants = productHasVariants(product);

  const [selectedSize, setSelectedSize] = useState(
    hasVariants ? product.sizes[0] : ''
  );
  const [selectedColor, setSelectedColor] = useState(
    hasVariants ? product.availableColors[0].name : ''
  );
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);

  // ── Body scroll lock ───────────────────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ── ESC key close ──────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Add to cart ────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    const missSize = !selectedSize;
    const missColor = !selectedColor;

    setSizeError(missSize);
    setColorError(missColor);

    if (missSize || missColor) return;

    addToCart({ ...product, selectedSize, selectedColor });
    onClose();
  };

  // ── Backdrop click ─────────────────────────────────────────────────────────
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ── Guard: nothing to render ───────────────────────────────────────────────
  if (!product || !hasVariants) return null;

  // ── Portal render ──────────────────────────────────────────────────────────
  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="variant-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
        style={{
          backgroundColor: 'rgba(4, 15, 42, 0.82)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        onClick={handleBackdropClick}
      >
        {/* Modal panel */}
        <motion.div
          key="variant-modal"
          initial={{ opacity: 0, scale: 0.92, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 28 }}
          transition={{ type: 'spring', damping: 26, stiffness: 360 }}
          className="relative w-full max-w-sm rounded-3xl overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(20,40,87,0.96) 0%, rgba(4,15,42,0.99) 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow:
              '0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Select variant"
        >
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between px-6 py-5"
            style={{
              background:
                'linear-gradient(to bottom, rgba(20,40,87,0.98), rgba(20,40,87,0.88))',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
              >
                <ShoppingCart size={17} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base leading-tight">
                  Select Variant
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Choose size &amp; color to continue
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Product Preview ──────────────────────────────────────────── */}
          <div className="flex items-center gap-4 px-6 pt-5">
            <div
              className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center p-2"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <img
                src={`/assets/${product.mainImage}`}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-snug truncate">
                {product.name}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-orange-400 font-bold text-lg">
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-gray-500 text-xs line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Variant Selectors ────────────────────────────────────────── */}
          <div className="px-6 pt-5 pb-6 space-y-5">

            {/* Color */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm font-semibold">
                  Color{' '}
                  <span className="text-gray-400 font-normal">
                    {selectedColor ? `— ${selectedColor}` : ''}
                  </span>
                </h3>
                {colorError && (
                  <motion.span
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1 text-red-400 text-xs"
                  >
                    <AlertCircle size={11} />
                    Required
                  </motion.span>
                )}
              </div>

              <motion.div
                variants={shakeVariants}
                animate={colorError ? 'shake' : 'idle'}
                onAnimationComplete={() => setColorError(false)}
                className="flex flex-wrap gap-3"
              >
                {product.availableColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color.name);
                      setColorError(false);
                    }}
                    aria-label={`Select ${color.name}`}
                    className="relative w-9 h-9 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: color.hex,
                      boxShadow:
                        selectedColor === color.name
                          ? `0 0 0 2px rgba(59,130,246,1), 0 0 0 4px rgba(4,15,42,1)`
                          : colorError
                          ? '0 0 0 2px rgba(239,68,68,0.6)'
                          : '0 0 0 1px rgba(255,255,255,0.15)',
                      transform:
                        selectedColor === color.name ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {/* White border for light colours */}
                    {color.hex === '#FFFFFF' && (
                      <span className="absolute inset-0 rounded-full border border-gray-400/40" />
                    )}
                  </button>
                ))}
              </motion.div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

            {/* Size */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm font-semibold">Size</h3>
                {sizeError && (
                  <motion.span
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1 text-red-400 text-xs"
                  >
                    <AlertCircle size={11} />
                    Required
                  </motion.span>
                )}
              </div>

              <motion.div
                variants={shakeVariants}
                animate={sizeError ? 'shake' : 'idle'}
                onAnimationComplete={() => setSizeError(false)}
                className="flex flex-wrap gap-2"
              >
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeError(false);
                    }}
                    className="h-10 px-4 rounded-xl text-sm font-medium transition-all duration-200"
                    style={
                      selectedSize === size
                        ? {
                            background:
                              'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            color: '#fff',
                            boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
                          }
                        : sizeError
                        ? {
                            background: 'rgba(239,68,68,0.08)',
                            color: '#fca5a5',
                            border: '1px solid rgba(239,68,68,0.4)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.06)',
                            color: '#d1d5db',
                            border: '1px solid rgba(255,255,255,0.12)',
                          }
                    }
                  >
                    {size}
                  </button>
                ))}
              </motion.div>
            </div>

            {/* ── Action Buttons ────────────────────────────────────────── */}
            <div className="flex gap-3 pt-1">
              {/* Cancel */}
              <button
                onClick={onClose}
                className="flex-1 h-12 rounded-2xl text-sm font-semibold text-gray-300 hover:text-white transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                Cancel
              </button>

              {/* Add to Cart */}
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex-[2] h-12 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  boxShadow: '0 8px 24px rgba(249,115,22,0.35)',
                }}
              >
                <ShoppingCart size={16} />
                Add to Cart
                {/* Shimmer */}
                <span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                    animation: 'shimmer 2.5s infinite',
                  }}
                />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default VariantModal;
