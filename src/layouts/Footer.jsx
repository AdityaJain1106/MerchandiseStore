import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-brand-primary border-t border-white/10 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">

          {/* Brand Info */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <img src="/assets/aCookieGod_Official_Store/10001.png" alt="Logo" className="w-40" />
            <p className="text-sm text-gray-400 mt-4 max-w-xs">
              Premium merchandise and official store. Delivering quality products worldwide.
            </p>
          </div>

          {/* Payment Methods */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h3 className="text-lg font-bold tracking-wider text-white uppercase">Payment Methods</h3>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-4">
              <img src="/assets/aCookieGod_Official_Store/Paytm-Logo.png" alt="Paytm" className="h-8 object-contain bg-white/10 p-1 rounded" />
              <img src="/assets/aCookieGod_Official_Store/Google_Pay-Logo.png" alt="Google Pay" className="h-8 object-contain bg-white/10 p-1 rounded" />
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h3 className="text-lg font-bold tracking-wider text-white uppercase">Contact Us</h3>
            <div className="space-y-2 mt-4 text-gray-300">
              <p>📍 Jain Bhavan, Agra, India</p>
              <p>📞 <a href="tel:+919149154375" className="hover:text-white transition-colors">+91 9149154375</a></p>
              <p>✉️ <a href="mailto:adijain1106@gmail.com" className="hover:text-white transition-colors">adijain1106@gmail.com</a></p>
            </div>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Official Store. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
