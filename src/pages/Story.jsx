import { motion } from 'framer-motion';

const Story = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center min-h-[70vh] flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Our Story</h1>
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          Welcome to the aCookieGod Official Store. We started with a simple mission: 
          to create premium, high-quality merchandise that our community loves to wear. 
          Every design is crafted with passion and dedication.
        </p>
        <p className="text-lg text-gray-400">
          (Sample story content. You can update this text later with your actual brand story.)
        </p>
      </motion.div>
    </div>
  );
};

export default Story;
