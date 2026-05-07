// src/pages/OrderHistory.jsx
// Displays all past orders for the logged-in user, fetched from Firestore.
// Redirects guests to /auth. Shows loading skeleton + empty states.

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Receipt,
  User,
} from 'lucide-react';
import useStore from '../store/useStore';
import { getUserOrdersFromFirestore } from '../firebase/orderService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

const formatCurrency = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const config = {
    Placed: { color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', dot: '#10b981' },
    Processing: { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', dot: '#3b82f6' },
    Shipped: { color: '#a78bfa', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', dot: '#8b5cf6' },
    Delivered: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', dot: '#f97316' },
  };
  const c = config[status] || config.Placed;

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {status}
    </span>
  );
};

const SkeletonCard = () => (
  <div
    className="rounded-3xl overflow-hidden"
    style={{ background: 'rgba(20,40,87,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
  >
    <div className="p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded-full bg-white/10" />
          <div className="h-3 w-24 rounded-full bg-white/5" />
        </div>
        <div className="h-6 w-20 rounded-full bg-white/10" />
      </div>
      <div className="flex gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-white/10 flex-shrink-0" />
            <div className="space-y-2">
              <div className="h-3 w-28 rounded-full bg-white/10" />
              <div className="h-3 w-16 rounded-full bg-white/5" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-px bg-white/5" />
      <div className="flex justify-between">
        <div className="h-4 w-24 rounded-full bg-white/10" />
        <div className="h-5 w-20 rounded-full bg-white/10" />
      </div>
    </div>
  </div>
);

const OrderCard = ({ order, index }) => {
  const [expanded, setExpanded] = useState(false);

  const shortOrderId = order.razorpayOrderId?.slice(-10)?.toUpperCase() || order.id?.slice(-10)?.toUpperCase() || 'N/A';
  const shortPaymentId = order.razorpayPaymentId?.slice(-12) || 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', damping: 24, stiffness: 280 }}
      className="rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(20,40,87,0.7) 0%, rgba(4,15,42,0.8) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* ─── Card Header ────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Receipt size={14} className="text-orange-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wider">Order</span>
              <span className="font-mono text-orange-400 text-sm font-bold">#{shortOrderId}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Clock size={12} />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status || 'Placed'} />
            <span className="text-orange-400 font-bold text-xl">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* ─── Product List ──────────────────────────────────────────── */}
        <div className="space-y-3 mb-5">
          {(order.items || []).map((item, i) => (
            <div key={`${item.cartItemId || item.id}-${i}`} className="flex items-center gap-3">
              {/* Product image */}
              <div
                className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {item.mainImage ? (
                  <img
                    src={`/assets/${item.mainImage}`}
                    alt={item.name}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg></div>';
                    }}
                  />
                ) : (
                  <Package size={22} className="text-gray-600" />
                )}
              </div>

              {/* Product info */}
              <div className="flex-grow min-w-0">
                <p className="text-white text-sm font-semibold truncate">{item.name}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                  {item.selectedSize && (
                    <span className="text-gray-500 text-xs">Size: {item.selectedSize}</span>
                  )}
                  {item.selectedColor && (
                    <span className="flex items-center gap-1 text-gray-500 text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20"
                        style={{
                          backgroundColor:
                            item.selectedColor === 'Black' ? '#111' :
                            item.selectedColor === 'White' ? '#fff' :
                            item.selectedColor === 'Navy' ? '#1E3A8A' :
                            item.selectedColor,
                        }}
                      />
                      {item.selectedColor}
                    </span>
                  )}
                  <span className="text-gray-500 text-xs">Qty: {item.quantity}</span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className="text-orange-400 font-semibold text-sm">{formatCurrency(item.lineTotal || item.price * item.quantity)}</p>
                {item.quantity > 1 && (
                  <p className="text-gray-600 text-xs">{formatCurrency(item.price)} each</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ─── Expand / Collapse Trigger ─────────────────────────────── */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Hide details' : 'Show order & payment details'}
        </button>
      </div>

      {/* ─── Expanded Details ──────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="px-5 sm:px-6 pb-6 pt-2 space-y-5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Payment IDs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={14} className="text-orange-400" />
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Payment ID</span>
                  </div>
                  <p className="font-mono text-gray-200 text-xs break-all">{order.razorpayPaymentId || 'N/A'}</p>
                </div>
                <div
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt size={14} className="text-gray-400" />
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Order ID</span>
                  </div>
                  <p className="font-mono text-gray-200 text-xs break-all">{order.razorpayOrderId || order.id}</p>
                </div>
              </div>

              {/* Customer Details */}
              {order.customerDetails && (
                <div
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User size={13} />
                    Customer Details
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <User size={13} className="text-gray-500 flex-shrink-0" />
                      <span>{order.customerDetails.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Mail size={13} className="text-gray-500 flex-shrink-0" />
                      <span className="truncate">{order.customerDetails.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Phone size={13} className="text-gray-500 flex-shrink-0" />
                      <span>{order.customerDetails.mobile}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-300 text-sm">
                      <MapPin size={13} className="text-gray-500 flex-shrink-0 mt-0.5" />
                      <span>{order.customerDetails.address}, {order.customerDetails.pincode}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Total Breakdown */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Payment Successful</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Total: </span>
                  <span className="text-orange-400 font-bold text-lg">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const OrderHistory = () => {
  const user = useStore((state) => state.user);
  const isAuthReady = useStore((state) => state.isAuthReady);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserOrdersFromFirestore(user.uid);
      setOrders(data);
    } catch (err) {
      console.error('[OrderHistory] Failed to fetch orders:', err);
      setError('Could not load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Wait for auth to resolve before deciding to redirect or fetch
  useEffect(() => {
    if (!isAuthReady) return;
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }
    fetchOrders();
  }, [isAuthReady, user, fetchOrders, navigate]);

  // ─── Auth Loading ──────────────────────────────────────────────────────────
  if (!isAuthReady) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-orange-400/30 border-t-orange-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ─── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-2">Account</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-display">Order History</h1>
          {!loading && orders.length > 0 && (
            <p className="text-gray-400 mt-2">
              {orders.length} order{orders.length !== 1 ? 's' : ''} placed
            </p>
          )}
        </div>
        {!loading && (
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors self-start sm:self-auto"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        )}
      </div>

      {/* ─── Loading State ────────────────────────────────────────────────── */}
      {loading && (
        <div className="space-y-5">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ─── Error State ──────────────────────────────────────────────────── */}
      {!loading && error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8 text-center"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <p className="text-red-300 font-semibold text-lg mb-2">Failed to load orders</p>
          <p className="text-red-400/70 text-sm mb-6">{error}</p>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </motion.div>
      )}

      {/* ─── Empty State ──────────────────────────────────────────────────── */}
      {!loading && !error && orders.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}
          >
            <ShoppingBag size={40} className="text-orange-400/60" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 font-display">No orders yet</h2>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">
            Looks like you haven't placed any orders. Explore the store and find something you love!
          </p>
          <Link to="/shop">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 0 20px rgba(249,115,22,0.25)' }}
            >
              Start Shopping
              <ArrowRight size={18} />
            </motion.button>
          </Link>
        </motion.div>
      )}

      {/* ─── Orders List ──────────────────────────────────────────────────── */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-5">
          {orders.map((order, index) => (
            <OrderCard key={order.id} order={order} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
