import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Phone, Mail } from 'lucide-react';
import Button from '../components/Button';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Use mailto to open the user's default email client
    const mailtoLink = `mailto:adijain1106@gmail.com?subject=${encodeURIComponent(
      formData.subject || 'Store Inquiry from ' + formData.name
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\n\nMessage:\n${formData.message}`
    )}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Have a question about your order, our products, or just want to say hi? Drop us a message below.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Contact Info */}
        <div className="lg:w-1/3 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 rounded-3xl"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Get in Touch</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 p-3 rounded-full text-blue-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Our Location</h4>
                  <p className="text-gray-400">Jain Bhavan<br />Agra, India</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 p-3 rounded-full text-blue-400">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Phone Number</h4>
                  <p className="text-gray-400">+91 9149154375</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 p-3 rounded-full text-blue-400">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Email Address</h4>
                  <p className="text-gray-400">adijain1106@gmail.com</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Contact Form */}
        <div className="lg:w-2/3">
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="glass p-8 rounded-3xl space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Your Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Order Inquiry"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Message</label>
              <textarea 
                name="message"
                required
                rows="6"
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="How can we help you?"
              ></textarea>
            </div>

            <Button type="submit" className="w-full sm:w-auto h-12 px-8">
              Send Message <Send size={18} />
            </Button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
