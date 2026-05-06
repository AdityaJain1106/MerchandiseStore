import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-brand-light text-brand-dark hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]',
    secondary: 'bg-transparent border-2 border-brand-light text-brand-light hover:bg-brand-light hover:text-brand-dark',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    ghost: 'bg-transparent text-brand-light hover:bg-white/10'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
