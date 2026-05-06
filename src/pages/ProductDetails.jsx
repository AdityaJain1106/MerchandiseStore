import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, X } from 'lucide-react';
import useStore from '../store/useStore';
import productsData from '../data/products.json';
import Button from '../components/Button';
import ProductReviews from '../components/ProductReviews';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = productsData.find((p) => p.id === id);
  
  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const wishlist = useStore((state) => state.wishlist);
  
  const [activeImg, setActiveImg] = useState(product?.mainImage);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    if (product) {
      if (product.sizes?.length > 0) setSelectedSize(product.sizes[0]);
      if (product.availableColors?.length > 0) setSelectedColor(product.availableColors[0].name);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl font-bold text-white mb-4">Product Not Found</h2>
        <p className="text-gray-400 mb-8">This item doesn't exist or has been removed.</p>
        <Link to="/shop">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  const handleAddToCart = () => {
    const productWithOptions = {
      ...product,
      selectedSize,
      selectedColor
    };
    for(let i=0; i<quantity; i++){
      addToCart(productWithOptions);
    }
    // Optionally trigger toast here
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* Images Section */}
        <div className="lg:w-1/2 flex flex-col gap-6">
          <div className="aspect-square relative glass rounded-3xl p-8 flex items-center justify-center overflow-hidden">
            {product.discount && (
              <span className="absolute top-6 left-6 bg-red-500 text-white text-sm font-bold px-4 py-1 rounded-full z-10">
                {product.discount}
              </span>
            )}
            <motion.img
              key={activeImg}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={`/assets/${activeImg}`}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="flex gap-4 overflow-x-auto py-2">
            {[product.mainImage, product.hoverImage].filter(Boolean).map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImg(img)}
                className={`w-24 h-24 rounded-2xl glass p-2 flex-shrink-0 transition-all ${
                  activeImg === img ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <img src={`/assets/${img}`} className="w-full h-full object-contain" alt="thumbnail" />
              </button>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="lg:w-1/2 flex flex-col justify-center">
          <div className="mb-2 flex items-center gap-4">
            <span className="text-blue-400 uppercase tracking-widest text-sm font-bold">
              {product.category}
            </span>
            <span className="text-gray-400 text-sm">
              {product.colors}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-end gap-4 mb-8 pb-8 border-b border-white/10">
            <span className="text-4xl font-bold text-orange-400">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xl text-gray-500 line-through mb-1">₹{product.originalPrice}</span>
            )}
            <span className="text-green-400 text-sm mb-2 ml-2">Inclusive of all taxes</span>
          </div>

          <div className="mb-8">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Premium official merchandise featuring custom high-quality prints and comfortable generic materials. Designed for the community.
            </p>
            
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-3">
                <Truck size={20} className="text-blue-400" />
                FREE Delivery available
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-blue-400" />
                Secure Checkout
              </li>
              <li className="flex items-center gap-3">
                <RotateCcw size={20} className="text-blue-400" />
                7 Days Return Policy
              </li>
            </ul>
          </div>

          {/* Options Section */}
          <div className="mb-8 space-y-6">
            {product.availableColors && product.availableColors.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">Color: <span className="text-gray-400 font-normal">{selectedColor}</span></h3>
                <div className="flex gap-3">
                  {product.availableColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        selectedColor === color.name ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-brand-dark' : 'opacity-80 hover:opacity-100 hover:scale-110'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Select ${color.name}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-white font-semibold">Size</h3>
                  <button onClick={() => setIsSizeGuideOpen(true)} className="text-blue-400 text-sm hover:text-blue-300 transition-colors">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 px-6 rounded-xl font-medium transition-all ${
                        selectedSize === size 
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                          : 'glass text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center glass rounded-full h-14">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-14 h-full flex items-center justify-center text-white hover:text-blue-400 transition-colors"
              >-</button>
              <span className="w-8 text-center text-white font-bold">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="w-14 h-full flex items-center justify-center text-white hover:text-blue-400 transition-colors"
              >+</button>
            </div>
            
            <p className="text-green-400 font-medium">In Stock</p>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleAddToCart}
              className="flex-1 h-14 text-lg"
            >
              <ShoppingCart size={20} /> Add to Cart
            </Button>
            <button 
              onClick={() => toggleWishlist(product)}
              className="w-14 h-14 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Heart size={24} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'} />
            </button>
          </div>
          
        </div>
      </div>

      <ProductReviews productId={product.id} />

      <AnimatePresence>
        {isSizeGuideOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-3xl p-8 max-w-lg w-full relative"
            >
              <button 
                onClick={() => setIsSizeGuideOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-6">Size Guide</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-300">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-3 font-semibold">Size</th>
                      <th className="py-3 font-semibold">Chest (in)</th>
                      <th className="py-3 font-semibold">Length (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="py-3">S</td>
                      <td className="py-3">34 - 36</td>
                      <td className="py-3">27</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3">M</td>
                      <td className="py-3">38 - 40</td>
                      <td className="py-3">28</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3">L</td>
                      <td className="py-3">42 - 44</td>
                      <td className="py-3">29</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3">XL</td>
                      <td className="py-3">46 - 48</td>
                      <td className="py-3">30</td>
                    </tr>
                    <tr>
                      <td className="py-3">XXL</td>
                      <td className="py-3">50 - 52</td>
                      <td className="py-3">31</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-6 text-center">Measurements may vary by up to 1 inch.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;
