
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, Menu, X, User, ShoppingBag, Bell, Heart } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/75 border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-usm-gold" />
            <span className="text-xl font-bold text-black">Eagle<span className="text-usm-gold">Mart</span></span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-usm-gold transition-colors">Home</Link>
            <Link to="/categories" className="text-gray-700 hover:text-usm-gold transition-colors">Categories</Link>
            <Link to="/events" className="text-gray-700 hover:text-usm-gold transition-colors">Events</Link>
            <Link to="/sell" className="text-gray-700 hover:text-usm-gold transition-colors">Sell</Link>
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link to="/wishlist" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Heart className="h-5 w-5" />
            </Link>
            <Link to="/notifications" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5" />
            </Link>
            <Button className="bg-usm-gold text-black hover:bg-usm-gold-dark">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden fixed inset-0 bg-white pt-16 z-40 animate-fade-in">
            <div className="flex flex-col space-y-4 p-6">
              <Link to="/" className="text-lg font-medium py-2 border-b border-gray-100" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <Link to="/categories" className="text-lg font-medium py-2 border-b border-gray-100" onClick={() => setIsOpen(false)}>
                Categories
              </Link>
              <Link to="/events" className="text-lg font-medium py-2 border-b border-gray-100" onClick={() => setIsOpen(false)}>
                Events
              </Link>
              <Link to="/sell" className="text-lg font-medium py-2 border-b border-gray-100" onClick={() => setIsOpen(false)}>
                Sell
              </Link>
              <div className="flex items-center space-x-4 pt-4">
                <Link to="/wishlist" className="flex items-center text-gray-700">
                  <Heart className="h-5 w-5 mr-2" />
                  Wishlist
                </Link>
                <Link to="/notifications" className="flex items-center text-gray-700">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </Link>
              </div>
              <Button className="bg-usm-gold text-black hover:bg-usm-gold-dark mt-4 w-full">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        )}
        
        {/* Search Bar Expanded */}
        {isSearchOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white shadow-md border-t border-gray-200 p-4 animate-fade-in">
            <div className="container mx-auto flex items-center">
              <input
                type="text"
                placeholder="Search for items, events, or services..."
                className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-usm-gold focus:border-transparent"
                autoFocus
              />
              <button className="bg-usm-gold text-black px-4 py-2 rounded-r-md hover:bg-usm-gold-dark">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
