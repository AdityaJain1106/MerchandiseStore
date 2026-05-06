import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import HeroScene from '../components/HeroScene';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import productsData from '../data/products.json';

const Home = () => {
  const featuredProducts = productsData.slice(0, 4);

  return (
    <div className="flex flex-col w-full">
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroScene />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-blue-400 font-semibold tracking-widest uppercase mb-4 block">
              Welcome to the official
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              aCookieGod <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">
                Merchandise
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              Premium apparel, accessories, and exclusive drops. Level up your aesthetic.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/shop">
                <Button variant="primary" className="text-lg px-8 py-4">
                  Shop Collection <ArrowRight size={20} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-gray-400 text-sm uppercase tracking-widest mb-2">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-blue-400 to-transparent"></div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
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

      {/* Video Banners / Promotional Section */}
      <section className="py-12 w-full bg-brand-primary/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark to-transparent z-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12 relative z-20">
          <div className="md:w-1/2 rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group">
            {/* Using the short video from original assets */}
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              src="/assets/aCookieGod_Official_Store/short.mp4"
            ></video>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
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

export default Home;
