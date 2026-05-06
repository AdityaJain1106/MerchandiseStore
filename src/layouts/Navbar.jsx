import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Heart, User, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import useStore from '../store/useStore';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const user = useStore((state) => state.user);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Hoodies', path: '/shop?category=Hoodies' },
    { name: 'Shirts', path: '/shop?category=Shirts' },
    { name: 'Accessories', path: '/shop?category=Accessories' },
  ];

  return (
    <header className="fixed w-full top-0 z-50 bg-brand-primary/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src="/assets/aCookieGod_Official_Store/10001.png" alt="aCookieGod Official Store" className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-brand-light hover:text-white font-medium tracking-wide transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/wishlist" className="relative text-brand-light hover:text-white transition-colors">
              <Heart size={24} />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative text-brand-light hover:text-white transition-colors">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <button onClick={handleLogout} className="text-brand-light hover:text-white transition-colors" title="Logout">
                <LogOut size={24} />
              </button>
            ) : (
              <Link to="/auth" className="text-brand-light hover:text-white transition-colors" title="Login">
                <User size={24} />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-light hover:text-white focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-primary border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-brand-light hover:text-white hover:bg-white/5 rounded-md"
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex justify-around pt-4 border-t border-white/10">
                <Link to="/wishlist" onClick={() => setIsOpen(false)} className="text-brand-light relative">
                  <Heart size={24} />
                  {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full"></span>}
                </Link>
                <Link to="/cart" onClick={() => setIsOpen(false)} className="text-brand-light relative">
                  <ShoppingCart size={24} />
                  {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-blue-500 w-3 h-3 rounded-full"></span>}
                </Link>
                {user ? (
                  <button onClick={() => { setIsOpen(false); handleLogout(); }} className="text-brand-light">
                    <LogOut size={24} />
                  </button>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)} className="text-brand-light">
                    <User size={24} />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
