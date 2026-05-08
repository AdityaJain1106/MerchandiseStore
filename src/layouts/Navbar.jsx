import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Heart, User, LogOut, ClipboardList, ChevronDown } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import useStore from '../store/useStore';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const user = useStore((state) => state.user);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setIsOpen(false);
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Hoodies', path: '/shop?category=Hoodies' },
    { name: 'Shirts', path: '/shop?category=Shirts' },
    { name: 'Accessories', path: '/shop?category=Accessories' },
  ];

  const userDisplayName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Account';

  return (
    <header className="fixed w-full top-0 z-50 bg-brand-primary/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src="/assets/aCookieGod_Official_Store/10001.png" alt="aCookieGod Official Store" className="h-8 w-auto" />
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
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-5">
            {/* Wishlist */}
            <Link to="/wishlist" className="relative text-brand-light hover:text-white transition-colors">
              <Heart size={22} />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative text-brand-light hover:text-white transition-colors">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Dropdown (logged in) / Login icon (guest) */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  id="user-menu-btn"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-brand-light hover:text-white transition-colors"
                  aria-label="User menu"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                  >
                    {userDisplayName[0]?.toUpperCase()}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-3 w-52 rounded-2xl overflow-hidden z-50"
                      style={{
                        background: 'linear-gradient(135deg, rgba(20,40,87,0.98), rgba(4,15,42,0.99))',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                      }}
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-white/8">
                        <p className="text-white text-sm font-semibold truncate">{userDisplayName}</p>
                        <p className="text-gray-500 text-xs truncate">{user.email}</p>
                      </div>

                      {/* Menu items */}
                      <div className="py-2">
                        <Link
                          to="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-sm"
                        >
                          <ClipboardList size={15} className="text-orange-400" />
                          Order History
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-red-400 hover:bg-red-500/5 transition-colors text-sm"
                        >
                          <LogOut size={15} className="text-gray-500" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/auth" className="text-brand-light hover:text-white transition-colors" title="Login">
                <User size={22} />
              </Link>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative text-brand-light hover:text-white transition-colors">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
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
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 text-base font-medium text-brand-light hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile divider + auth actions */}
              <div className="pt-3 border-t border-white/10 space-y-1">
                <Link
                  to="/wishlist"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-brand-light hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  <Heart size={20} />
                  Wishlist
                  {wishlist.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                {user ? (
                  <>
                    {/* Logged-in user info strip */}
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                      >
                        {userDisplayName[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{userDisplayName}</p>
                        <p className="text-gray-500 text-xs truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-brand-light hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <ClipboardList size={20} className="text-orange-400" />
                      Order History
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-colors"
                    >
                      <LogOut size={20} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-brand-light hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <User size={20} />
                    Login / Sign Up
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
