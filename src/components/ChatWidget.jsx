import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, AlertCircle } from 'lucide-react';
import { getAIResponse } from '../services/aiSupportService';

const FAQs = [
  "Where is my order?",
  "Shipping info",
  "Best hoodies?",
  "Return policy"
];

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSend = async (text) => {
    const userText = typeof text === 'string' ? text : inputValue;
    if (!userText.trim() || isGenerating) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInputValue('');
    setIsGenerating(true);
    setError(null);

    try {
      const response = await getAIResponse(userText);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (err) {
      console.error(err);
      setError('Failed to get response. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] glass rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-brand-primary/80 backdrop-blur-md text-brand-light p-4 flex justify-between items-center border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-brand-light" />
                <span className="font-semibold">Store Support</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-dark/90 text-brand-light">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-brand-light/70">
                  <Bot size={48} className="text-brand-light/50" />
                  <p className="text-sm">Hi! How can I help you today?</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {FAQs.map((faq, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(faq)}
                        disabled={isGenerating}
                        className="bg-brand-primary/50 border border-white/20 text-brand-light px-3 py-1.5 rounded-full text-xs hover:bg-brand-light hover:text-brand-dark transition-colors disabled:opacity-50"
                      >
                        {faq}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user' 
                        ? 'bg-brand-light text-brand-dark rounded-br-sm' 
                        : 'bg-brand-primary border border-white/10 text-brand-light rounded-bl-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-brand-primary border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                    <motion.div className="w-1.5 h-1.5 bg-brand-light rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-brand-light rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-brand-light rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-900/30 border border-red-500/50 p-2 rounded-lg text-xs justify-center">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-brand-primary/80 backdrop-blur-md border-t border-white/10">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isGenerating}
                  className="flex-1 bg-brand-dark/50 text-brand-light placeholder-brand-light/50 border border-transparent focus:border-brand-light/30 focus:bg-brand-dark focus:ring-0 rounded-full px-4 py-2 text-sm outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isGenerating}
                  className="bg-brand-light text-brand-dark p-2.5 rounded-full hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="glass p-4 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center relative text-brand-light hover:text-white"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-brand-primary rounded-full"></span>
        )}
      </motion.button>
    </div>
  );
};

export default ChatWidget;
