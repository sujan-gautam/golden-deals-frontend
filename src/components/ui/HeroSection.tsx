
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-b from-white to-gray-50 pt-16 pb-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-usm-gold blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-blue-500 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find What You Need in the USM Community
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Buy, sell, and discover items, services, and events from fellow students at the University of Southern Mississippi.
          </p>
          
          <div className="max-w-2xl mx-auto relative">
            <div className="flex">
              <input 
                type="text"
                placeholder="What are you looking for?"
                className="w-full px-6 py-4 rounded-l-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-usm-gold focus:border-transparent text-gray-800"
              />
              <button className="bg-usm-gold text-black px-6 py-4 rounded-r-xl font-medium hover:bg-usm-gold-dark transition-all flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Search
              </button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-gray-600">
              <span>Popular:</span>
              <Link to="/category/textbooks" className="hover:text-usm-gold transition-colors">Textbooks</Link> •
              <Link to="/category/furniture" className="hover:text-usm-gold transition-colors">Furniture</Link> •
              <Link to="/category/electronics" className="hover:text-usm-gold transition-colors">Electronics</Link> •
              <Link to="/category/tickets" className="hover:text-usm-gold transition-colors">Event Tickets</Link>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 text-center animate-zoom-in" style={{ animationDelay: '0.1s' }}>
            <div className="text-2xl font-bold text-usm-gold mb-1">5,000+</div>
            <div className="text-sm text-gray-600">Active Items</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 text-center animate-zoom-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-2xl font-bold text-usm-gold mb-1">2,500+</div>
            <div className="text-sm text-gray-600">USM Students</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 text-center animate-zoom-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-2xl font-bold text-usm-gold mb-1">100+</div>
            <div className="text-sm text-gray-600">Daily Events</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 text-center animate-zoom-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-2xl font-bold text-usm-gold mb-1">$0</div>
            <div className="text-sm text-gray-600">Commission Fee</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
