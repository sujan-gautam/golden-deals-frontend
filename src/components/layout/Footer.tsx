
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Github, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 border-t border-gray-200 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-black">Eagle<span className="text-usm-gold">Mart</span></span>
            </Link>
            <p className="text-gray-600 text-sm">
              A marketplace for University of Southern Mississippi students to buy, sell, and connect.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-gray-500 hover:text-usm-gold transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-usm-gold transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-usm-gold transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-900 mb-4">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/categories" className="text-gray-600 hover:text-usm-gold transition-colors">
                  All Categories
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-600 hover:text-usm-gold transition-colors">
                  Campus Events
                </Link>
              </li>
              <li>
                <Link to="/featured" className="text-gray-600 hover:text-usm-gold transition-colors">
                  Featured Items
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-gray-600 hover:text-usm-gold transition-colors">
                  Sell Your Item
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-900 mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="text-gray-600 hover:text-usm-gold transition-colors">
                  Login / Register
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-600 hover:text-usm-gold transition-colors">
                  Your Profile
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-gray-600 hover:text-usm-gold transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-gray-600 hover:text-usm-gold transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-900 mb-4">Help</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-usm-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-usm-gold transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-usm-gold transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-usm-gold transition-colors">
                  Terms & Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} EagleMart. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="mailto:contact@eaglemart.com" className="text-gray-500 hover:text-usm-gold transition-colors text-sm flex items-center">
              <Mail size={16} className="mr-2" />
              contact@eaglemart.com
            </a>
            <a href="tel:+16011234567" className="text-gray-500 hover:text-usm-gold transition-colors text-sm flex items-center">
              <Phone size={16} className="mr-2" />
              (601) 123-4567
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
