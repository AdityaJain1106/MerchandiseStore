// src/pages/OrderSuccess.jsx
// Success page after a completed Razorpay payment.
// Receives order details via React Router location state.

import { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ArrowRight, Home, Receipt } from 'lucide-react';

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 24, stiffness: 300 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderDetails = location.state?.orderDetails;

  // Guard: redirect if arrived here directly (no order state)
  useEffect(() => {
    if (!orderDetails) {
      navigate('/', { replace: true });
    }
  }, [orderDetails, navigate]);

  if (!orderDetails) return null;

  const { orderId, paymentId, amount, customerDetails } = orderDetails;
  const shortOrderId = orderId?.slice(-8)?.toUpperCase() || 'N/A';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(16,185,129,0.08) 0%, transparent 70%)',
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg"
      >
        {/* ─── Success Icon ──────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer ring pulse */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(16,185,129,0.3)' }}
            />
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center relative"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))', border: '2px solid rgba(16,185,129,0.5)' }}
            >
              <CheckCircle2 size={48} className="text-emerald-400" />
            </div>
          </div>
        </motion.div>

        {/* ─── Heading ───────────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white font-display mb-3">
            Order Placed! 🎉
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Thank you, <span className="text-white font-semibold">{customerDetails?.fullName}</span>!<br />
            Your order is confirmed and being processed.
          </p>
          <p className="text-gray-500 text-sm mt-3">
            A confirmation email has been sent to{' '}
            <span className="text-gray-300">{customerDetails?.email}</span>
          </p>
        </motion.div>

        {/* ─── Order Card ────────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-6 mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(20,40,87,0.8), rgba(4,15,42,0.9))',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(16,185,129,0.1))', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              <Receipt size={20} className="text-emerald-400" />
            </div>
            <h2 className="text-white font-bold text-lg">Order Summary</h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Order ID</span>
              <span
                className="font-mono text-sm font-semibold px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}
              >
                #{shortOrderId}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Payment ID</span>
              <span className="text-gray-300 text-xs font-mono">{paymentId?.slice(-14) || 'N/A'}</span>
            </div>

            <div className="h-px bg-white/5 my-1" />

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total Paid</span>
              <span className="text-orange-400 font-bold text-xl">
                ₹{Number(amount).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="h-px bg-white/5 my-1" />

            <div className="flex justify-between items-start">
              <span className="text-gray-400 text-sm">Shipping To</span>
              <div className="text-right">
                <p className="text-gray-300 text-sm">{customerDetails?.address}</p>
                <p className="text-gray-400 text-xs">{customerDetails?.pincode}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Status</span>
              <span
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Placed
              </span>
            </div>
          </div>
        </motion.div>

        {/* ─── What's Next ───────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-5 mb-8"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-orange-400" />
            <span className="text-gray-300 text-sm font-semibold">What happens next?</span>
          </div>
          <ul className="space-y-2">
            {[
              'You\'ll receive an order confirmation email shortly.',
              'We\'ll process and pack your order within 1-2 business days.',
              'Tracking details will be shared once shipped.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                <span
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}
                >
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ─── CTAs ──────────────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
          <Link to="/shop" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 0 20px rgba(249,115,22,0.25)' }}
            >
              Continue Shopping
              <ArrowRight size={18} />
            </motion.button>
          </Link>
          <Link to="/" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 rounded-2xl font-semibold text-gray-300 flex items-center justify-center gap-2 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Home size={18} />
              Back to Home
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
