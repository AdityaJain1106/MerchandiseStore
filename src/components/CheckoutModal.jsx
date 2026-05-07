// src/components/CheckoutModal.jsx
// Premium glassmorphism checkout modal with:
//   - Full field validation
//   - Loading states to prevent duplicate submissions
//   - Razorpay payment failure/retry support
//   - Framer Motion animations

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X,
  User,
  Mail,
  MapPin,
  Hash,
  Phone,
  ShoppingBag,
  Lock,
  AlertCircle,
  Loader2,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import useStore from '../store/useStore';
import { initiateRazorpayCheckout } from '../services/checkoutService';

// ─── Field Config ─────────────────────────────────────────────────────────────

const FIELDS = [
  {
    id: 'fullName',
    label: 'Full Name',
    type: 'text',
    placeholder: 'John Doe',
    icon: User,
    validate: (v) => (v.trim().length < 3 ? 'Name must be at least 3 characters.' : ''),
  },
  {
    id: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'john@example.com',
    icon: Mail,
    validate: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email address.' : ''),
  },
  {
    id: 'address',
    label: 'Full Address',
    type: 'textarea',
    placeholder: 'House No., Street, Area, City, State',
    icon: MapPin,
    validate: (v) => (v.trim().length < 10 ? 'Please enter your full address.' : ''),
  },
  {
    id: 'pincode',
    label: 'Pincode',
    type: 'text',
    placeholder: '400001',
    icon: Hash,
    validate: (v) => (!/^\d{6}$/.test(v) ? 'Enter a valid 6-digit pincode.' : ''),
  },
  {
    id: 'mobile',
    label: 'Mobile Number',
    type: 'tel',
    placeholder: '9876543210',
    icon: Phone,
    validate: (v) => (!/^\d{10}$/.test(v) ? 'Enter a valid 10-digit mobile number.' : ''),
  },
];

// ─── Initial Form State ───────────────────────────────────────────────────────

const INITIAL_FORM = { fullName: '', email: '', address: '', pincode: '', mobile: '' };
const INITIAL_ERRORS = { fullName: '', email: '', address: '', pincode: '', mobile: '' };

// ─── Payment Status ───────────────────────────────────────────────────────────

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',   // Creating Razorpay order
  PAYING: 'paying',     // Razorpay popup is open (we lose control)
  FAILED: 'failed',
};

// ─── Component ────────────────────────────────────────────────────────────────

const CheckoutModal = ({ isOpen, onClose, cart, total }) => {
  const user = useStore((state) => state.user);
  const clearCart = useStore((state) => state.clearCart);
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState(STATUS.IDLE);
  const [failureMessage, setFailureMessage] = useState('');
  const firstFieldRef = useRef(null);
  // Tracks whether the Razorpay popup was successfully opened.
  // Avoids the stale-closure bug when reading `status` after an await.
  const popupOpenedRef = useRef(false);

  // Pre-fill email from logged-in user
  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({ ...prev, email: prev.email || user.email }));
    }
    if (user?.displayName) {
      setForm((prev) => ({ ...prev, fullName: prev.fullName || user.displayName }));
    }
  }, [user]);

  // Focus first field when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstFieldRef.current?.focus(), 100);
    } else {
      // Reset state when closed
      setStatus(STATUS.IDLE);
      setFailureMessage('');
      setTouched({});
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ─── Validation ─────────────────────────────────────────────────────────────

  const validateField = (id, value) => {
    const field = FIELDS.find((f) => f.id === id);
    return field ? field.validate(value) : '';
  };

  const validateAll = () => {
    const newErrors = {};
    let hasError = false;
    FIELDS.forEach(({ id }) => {
      const err = validateField(id, form[id]);
      newErrors[id] = err;
      if (err) hasError = true;
    });
    setErrors(newErrors);
    setTouched(Object.fromEntries(FIELDS.map((f) => [f.id, true])));
    return !hasError;
  };

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleChange = (id, value) => {
    setForm((prev) => ({ ...prev, [id]: value }));
    if (touched[id]) {
      setErrors((prev) => ({ ...prev, [id]: validateField(id, value) }));
    }
  };

  const handleBlur = (id) => {
    setTouched((prev) => ({ ...prev, [id]: true }));
    setErrors((prev) => ({ ...prev, [id]: validateField(id, form[id]) }));
  };

  const handlePaymentFailure = (message) => {
    if (message === 'payment_cancelled') {
      setStatus(STATUS.IDLE); // Silently reset on modal dismiss
    } else {
      setFailureMessage(message);
      setStatus(STATUS.FAILED);
    }
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    if (status === STATUS.LOADING || status === STATUS.PAYING) return;

    popupOpenedRef.current = false;
    setStatus(STATUS.LOADING);
    setFailureMessage('');

    await initiateRazorpayCheckout({
      cart,
      total,
      customerDetails: { ...form },
      userId: user?.uid || null,
      onSuccess: (orderDetails) => {
        popupOpenedRef.current = false;
        setStatus(STATUS.IDLE);
        onClose();
        navigate('/order-success', { state: { orderDetails } });
      },
      onFailure: (message) => {
        popupOpenedRef.current = false;
        handlePaymentFailure(message);
      },
      clearCart,
    });

    // `initiateRazorpayCheckout` resolves after razorpayInstance.open() is called.
    // If the popup launched successfully, popupOpenedRef stays false until a callback fires.
    // We transition to PAYING so the button shows the correct label while the popup is open.
    // If onFailure already fired (e.g. network error), status was already set to FAILED.
    setStatus((prev) => (prev === STATUS.LOADING ? STATUS.PAYING : prev));
  };

  // ─── Retry ──────────────────────────────────────────────────────────────────

  const handleRetry = () => {
    setStatus(STATUS.IDLE);
    setFailureMessage('');
  };

  // ─── Keyboard close ─────────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isOpen && status === STATUS.IDLE) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, status]);

  const isProcessing = status === STATUS.LOADING || status === STATUS.PAYING;

  // ─── Render ─────────────────────────────────────────────────────────────────

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="checkout-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(4, 15, 42, 0.85)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && !isProcessing && onClose()}
        >
          <motion.div
            key="checkout-modal"
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(20,40,87,0.95) 0%, rgba(4,15,42,0.98) 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Checkout"
          >
            {/* ─── Header ──────────────────────────────────────────────── */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5"
              style={{ background: 'linear-gradient(to bottom, rgba(20,40,87,0.98), rgba(20,40,87,0.90))', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                  <ShoppingBag size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg font-display leading-none">Checkout</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Secure • Encrypted • Fast</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            {/* ─── Order Summary Strip ─────────────────────────────────── */}
            <div className="mx-6 mt-5 rounded-2xl px-4 py-3 flex items-center justify-between"
              style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
              <span className="text-gray-300 text-sm">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
              <span className="text-orange-400 font-bold text-lg">₹{total.toLocaleString('en-IN')}</span>
            </div>

            {/* ─── Form ────────────────────────────────────────────────── */}
            <div className="px-6 pt-5 pb-6 space-y-4">
              {FIELDS.map((field, idx) => {
                const Icon = field.icon;
                const hasError = touched[field.id] && errors[field.id];
                return (
                  <div key={field.id}>
                    <label htmlFor={`checkout-${field.id}`} className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      {field.label}
                    </label>
                    <div className="relative">
                      <Icon
                        size={16}
                        className={`absolute left-3.5 top-3.5 transition-colors ${hasError ? 'text-red-400' : 'text-gray-500'}`}
                      />
                      {field.type === 'textarea' ? (
                        <textarea
                          id={`checkout-${field.id}`}
                          ref={idx === 0 ? firstFieldRef : undefined}
                          value={form[field.id]}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          onBlur={() => handleBlur(field.id)}
                          placeholder={field.placeholder}
                          disabled={isProcessing}
                          rows={3}
                          className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 resize-none transition-all duration-200 outline-none disabled:opacity-60
                            ${hasError
                              ? 'border-red-500/50 bg-red-950/20'
                              : 'border-white/10 bg-white/5 focus:border-orange-500/50 focus:bg-white/8'
                            }`}
                          style={{ border: '1px solid' }}
                        />
                      ) : (
                        <input
                          id={`checkout-${field.id}`}
                          ref={idx === 0 ? firstFieldRef : undefined}
                          type={field.type}
                          value={form[field.id]}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          onBlur={() => handleBlur(field.id)}
                          placeholder={field.placeholder}
                          disabled={isProcessing}
                          className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 transition-all duration-200 outline-none disabled:opacity-60
                            ${hasError
                              ? 'border-red-500/50 bg-red-950/20'
                              : 'border-white/10 bg-white/5 focus:border-orange-500/50 focus:bg-white/8'
                            }`}
                          style={{ border: '1px solid' }}
                        />
                      )}
                    </div>
                    <AnimatePresence>
                      {hasError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs"
                        >
                          <AlertCircle size={12} />
                          {errors[field.id]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* ─── Failure Banner ──────────────────────────────────── */}
              <AnimatePresence>
                {status === STATUS.FAILED && failureMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="rounded-2xl px-4 py-4"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-grow">
                        <p className="text-red-400 font-semibold text-sm">Payment Failed</p>
                        <p className="text-red-300/80 text-xs mt-1">{failureMessage}</p>
                      </div>
                      <button
                        onClick={handleRetry}
                        className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors font-semibold flex-shrink-0"
                      >
                        <RotateCcw size={12} />
                        Retry
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── CTA Button ──────────────────────────────────────── */}
              <motion.button
                onClick={handleSubmit}
                disabled={isProcessing}
                whileHover={!isProcessing ? { scale: 1.01 } : {}}
                whileTap={!isProcessing ? { scale: 0.99 } : {}}
                className="w-full h-14 rounded-2xl font-bold text-white text-base relative overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                style={{
                  background: isProcessing
                    ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                    : status === STATUS.FAILED
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'linear-gradient(135deg, #f97316, #ea580c)',
                  boxShadow: isProcessing ? '0 0 24px rgba(124,58,237,0.4)' : '0 0 24px rgba(249,115,22,0.3)',
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {status === STATUS.LOADING ? 'Creating Order...' : 'Opening Payment...'}
                  </>
                ) : status === STATUS.FAILED ? (
                  <>
                    <RotateCcw size={20} />
                    Retry Payment
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Order Now — ₹{total.toLocaleString('en-IN')}
                    <ChevronRight size={18} />
                  </>
                )}

                {/* Shimmer effect */}
                {!isProcessing && (
                  <span
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                      animation: 'shimmer 2.5s infinite',
                    }}
                  />
                )}
              </motion.button>

              {/* ─── Trust Badges ────────────────────────────────────── */}
              <div className="flex items-center justify-center gap-6 pt-1">
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <Lock size={11} />
                  <span>256-bit SSL</span>
                </div>
                <div className="w-px h-3 bg-gray-700" />
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <span>Powered by</span>
                  <span className="text-gray-400 font-semibold">Razorpay</span>
                </div>
                <div className="w-px h-3 bg-gray-700" />
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <span>Free Returns</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default CheckoutModal;
