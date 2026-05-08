import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus } from 'lucide-react';
import useStore from '../store/useStore';
import Button from '../components/Button';
import CheckoutModal from '../components/CheckoutModal';

const Cart = () => {
  const cart = useStore((state) => state.cart);
  const updateQuantity = useStore((state) => state.updateQuantity);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} className="text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. Discover our latest drops.
        </p>
        <Link to="/shop">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-12">Your Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="lg:w-2/3 space-y-6">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.cartItemId || item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="glass rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6"
              >
                {/* Image */}
                <Link to={`/product/${item.id}`} className="w-32 h-32 flex-shrink-0 bg-white/5 rounded-2xl p-2">
                  <img src={`/assets/${item.mainImage}`} alt={item.name} className="w-full h-full object-contain" />
                </Link>

                {/* Details */}
                <div className="flex-grow text-center sm:text-left">
                  <Link to={`/product/${item.id}`}>
                    <h3 className="text-xl font-bold text-white hover:text-blue-400 transition-colors">{item.name}</h3>
                  </Link>
                  <p className="text-gray-400 text-sm mt-1 mb-2">{item.category}</p>
                  
                  {(item.selectedSize || item.selectedColor) && (
                    <div className="flex items-center justify-center sm:justify-start gap-3 mb-3 text-sm">
                      {item.selectedColor && (
                        <span className="flex items-center gap-1.5 text-gray-300">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.selectedColor === 'Black' ? '#000' : item.selectedColor === 'White' ? '#fff' : item.selectedColor === 'Navy' ? '#1E3A8A' : item.selectedColor === 'Red' ? '#DC2626' : item.selectedColor }} />
                          {item.selectedColor}
                        </span>
                      )}
                      {item.selectedSize && item.selectedColor && <span className="text-gray-600">|</span>}
                      {item.selectedSize && (
                        <span className="text-gray-300">Size: {item.selectedSize}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-center sm:justify-start gap-4">
                    {/* Quantity Control */}
                    <div className="flex items-center bg-white/10 rounded-full h-10">
                      <button 
                        onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                        className="w-10 h-full flex items-center justify-center text-white hover:text-blue-400 transition-colors"
                      ><Minus size={14} /></button>
                      <span className="w-8 text-center text-white text-sm font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                        className="w-10 h-full flex items-center justify-center text-white hover:text-blue-400 transition-colors"
                      ><Plus size={14} /></button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.cartItemId || item.id)}
                      className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-400">₹{item.price * item.quantity}</p>
                  {item.quantity > 1 && (
                    <p className="text-sm text-gray-500">₹{item.price} each</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="glass rounded-3xl p-8 sticky top-28">
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span className="text-green-400">FREE</span>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                <span className="text-white font-bold">Total</span>
                <span className="text-3xl font-bold text-orange-400">₹{total}</span>
              </div>
              <p className="text-xs text-gray-500 text-right">Inclusive of all taxes</p>
            </div>

            <Button
              id="proceed-to-checkout-btn"
              className="w-full h-14 text-lg mt-8"
              onClick={() => setIsCheckoutOpen(true)}
            >
              Proceed to Checkout <ArrowRight size={20} />
            </Button>

            <div className="mt-6 flex justify-center gap-4 opacity-50">
              <img src="/assets/aCookieGod_Official_Store/Paytm-Logo.webp" alt="Paytm" className="h-6 object-contain" />
              <img src="/assets/aCookieGod_Official_Store/Google_Pay-Logo.webp" alt="GPay" className="h-6 object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        total={total}
      />
    </div>
  );
};

export default Cart;
