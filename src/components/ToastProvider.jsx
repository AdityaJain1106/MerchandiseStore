import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../store/useToastStore';
import { X } from 'lucide-react';

const ToastProvider = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none sm:bottom-8 sm:right-8">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)', transition: { duration: 0.2 } }}
            className="pointer-events-auto flex items-center justify-between gap-4 glass text-brand-light px-5 py-4 rounded-2xl shadow-[0_8px_32px_rgba(20,40,87,0.3)] min-w-[280px] max-w-[400px] border-t border-t-white/20 border-l border-l-white/20 relative overflow-hidden"
          >
            {/* Subtle light effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] animate-[shimmer_2s_infinite]" />
            
            <span className="text-sm font-medium tracking-wide flex-1 pr-2 relative z-10">
              {toast.message}
            </span>
            <button 
              onClick={() => removeToast(toast.id)} 
              className="text-white/60 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full relative z-10 flex-shrink-0"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastProvider;
