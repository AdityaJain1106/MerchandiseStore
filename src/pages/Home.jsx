import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Star, Truck, ChevronDown } from 'lucide-react';
import HeroScene from '../components/HeroScene';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import productsData from '../data/products.json';

// ─── Trust badge data ──────────────────────────────────────────────────────────
const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Secure Payments' },
  { icon: Zap,         label: 'Limited Drops'   },
  { icon: Star,        label: 'Premium Quality' },
  { icon: Truck,       label: 'Fast Delivery'   },
];

// ─── Floating merch carousel cards ────────────────────────────────────────────
const MERCH_CARDS = [
  { id: 'hoodie1', img: 'aCookieGod_Official_Store/10002.png', label: 'One Block Hoodie',   price: '₹1,300' },
  { id: 'hoodie2', img: 'aCookieGod_Official_Store/10006.png', label: 'Cookie MMXVI Hoodie', price: '₹2,000' },
  { id: 'shirt1',  img: 'aCookieGod_Official_Store/10004.png', label: 'One Block T-Shirt',  price: '₹600'   },
];

// ─── Animation variants ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

const Home = () => {
  const featuredRef = useRef(null);
  const featuredProducts = productsData.slice(0, 4);
  const [activeCard, setActiveCard] = useState(0);

  const scrollToFeatured = () =>
    featuredRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="flex flex-col w-full">

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* Three-JS star / particle background */}
        <HeroScene />

        {/* ── Ambient glow blobs (CSS only, zero perf cost) ───────── */}
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.16) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(30,58,138,0.25) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />

        {/* ── Two-column content ───────────────────────────────────── */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-0">

            {/* ── LEFT — Copy ─────────────────────────────────────── */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">

              {/* Eyebrow badge */}
              <motion.div {...fadeUp(0.1)}>
                <span
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6"
                  style={{
                    background: 'rgba(59,130,246,0.12)',
                    border: '1px solid rgba(59,130,246,0.35)',
                    color: '#93c5fd',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Official aCookieGod Store
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight"
                {...fadeUp(0.2)}
              >
                Wear the{' '}
                <span
                  className="relative inline-block"
                  style={{
                    WebkitTextStroke: '1px transparent',
                    background: 'linear-gradient(135deg, #60a5fa 0%, #f97316 60%, #fb923c 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Legacy
                </span>
                <br />
                <span className="text-white">Drop by Drop.</span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                className="text-base sm:text-lg text-gray-400 max-w-md mb-10 leading-relaxed"
                {...fadeUp(0.35)}
              >
                Premium limited-edition apparel crafted for the{' '}
                <span className="text-gray-200 font-medium">aCookieGod community</span>.
                Exclusive drops. Unmatched quality.
              </motion.p>

              {/* CTA button */}
              <motion.div {...fadeUp(0.45)} className="mb-10">
                <Link to="/shop">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative inline-flex items-center gap-3 text-base font-bold text-white px-8 py-4 rounded-full overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      boxShadow: '0 0 0 0 rgba(249,115,22,0.4)',
                    }}
                  >
                    {/* Glow pulse ring */}
                    <motion.span
                      className="absolute inset-0 rounded-full"
                      animate={{ boxShadow: ['0 0 0 0 rgba(249,115,22,0.5)', '0 0 0 14px rgba(249,115,22,0)'] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                    />
                    {/* Shimmer sweep */}
                    <span
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                        animation: 'shimmer 2.5s infinite',
                      }}
                    />
                    Shop the Collection
                    <ArrowRight size={18} />
                  </motion.button>
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3"
                {...fadeUp(0.55)}
              >
                {TRUST_BADGES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                    <Icon size={13} className="text-blue-400 flex-shrink-0" />
                    {label}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── RIGHT — Floating merch showcase ─────────────────── */}
            <div className="flex-1 flex items-center justify-center lg:justify-end relative w-full max-w-sm lg:max-w-none">

              {/* Ambient glow behind cards */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 65%)',
                  filter: 'blur(40px)',
                }}
              />

              {/* Stacked card selector dots */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {MERCH_CARDS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCard(i)}
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: i === activeCard ? '20px' : '6px',
                      height: '6px',
                      background: i === activeCard ? '#f97316' : 'rgba(255,255,255,0.25)',
                    }}
                  />
                ))}
              </div>

              {/* Floating card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCard}
                  initial={{ opacity: 0, scale: 0.88, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -16 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className="relative w-[260px] sm:w-[300px] lg:w-[320px] pb-10"
                >
                  {/* Perpetual float animation wrapper */}
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  >
                    {/* Card */}
                    <div
                      className="rounded-3xl p-6 relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(20,40,87,0.85) 0%, rgba(4,15,42,0.9) 100%)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
                      }}
                    >
                      {/* Corner shimmer */}
                      <div
                        className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                        style={{
                          background: 'radial-gradient(circle at top right, rgba(249,115,22,0.12), transparent 60%)',
                        }}
                      />

                      {/* Badge */}
                      <span
                        className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4"
                        style={{ background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' }}
                      >
                        Limited Drop
                      </span>

                      {/* Product image */}
                      <div className="flex items-center justify-center h-48 mb-4">
                        <img
                          src={`/assets/${MERCH_CARDS[activeCard].img}`}
                          alt={MERCH_CARDS[activeCard].label}
                          className="max-h-full object-contain drop-shadow-2xl"
                          style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))' }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-white font-semibold text-sm leading-tight">
                            {MERCH_CARDS[activeCard].label}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">Official Merch</p>
                        </div>
                        <span className="text-orange-400 font-black text-xl">
                          {MERCH_CARDS[activeCard].price}
                        </span>
                      </div>

                      {/* Shop link */}
                      <Link
                        to={`/product/${MERCH_CARDS[activeCard].id}`}
                        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      >
                        View Product <ArrowRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Auto-cycle cards every 3 s */}
              <AutoCycle count={MERCH_CARDS.length} onChange={setActiveCard} />
            </div>
          </div>
        </div>

        {/* ── Explore indicator ────────────────────────────────────── */}
        <motion.button
          onClick={scrollToFeatured}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 group focus:outline-none"
          aria-label="Scroll to Featured Drops"
        >
          <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500 group-hover:text-gray-300 transition-colors">
            Explore
          </span>
          {/* Animated chevrons */}
          <div className="flex flex-col items-center -space-y-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2], y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.18, ease: 'easeInOut' }}
              >
                <ChevronDown
                  size={16}
                  className="text-blue-400 group-hover:text-orange-400 transition-colors"
                />
              </motion.div>
            ))}
          </div>
        </motion.button>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ═══════════════════════════════════════════════════════════════ */}
      <section ref={featuredRef} className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Featured Drops</h2>
            <p className="text-gray-400">Our most popular gear right now.</p>
          </motion.div>
          <Link to="/shop" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2 group transition-colors">
            View All
            <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          VIDEO / PROMOTIONAL SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 w-full bg-brand-primary/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark to-transparent z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12 relative z-20">
          <div className="md:w-1/2 rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group">
            <video
              autoPlay loop muted playsInline
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              src="/assets/aCookieGod_Official_Store/short.mp4"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
          </div>
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-4xl font-bold text-white">Behind The Design</h2>
            <p className="text-gray-300 text-lg">
              Every piece of aCookieGod merchandise is designed with comfort, style, and gamers in mind.
              We use premium generic blends that last long and look incredibly sharp.
            </p>
            <Link to="/story">
              <Button variant="secondary">Read Our Story</Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

// ─── Auto-cycle helper (no state in parent, just fires callback) ───────────────
const AutoCycle = ({ count, onChange }) => {
  useAutoCycle(count, onChange);
  return null;
};

const useAutoCycle = (count, onChange) => {
  const idx = useRef(0);
  useEffect(() => {
    const t = setInterval(() => {
      idx.current = (idx.current + 1) % count;
      onChange(idx.current);
    }, 3200);
    return () => clearInterval(t);
  }, [count, onChange]);
};

export default Home;

