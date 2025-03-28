
import { useState } from 'react';
import { Search, CalendarDays, Utensils } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }
    
    if (isAuthenticated) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      toast({
        title: "Authentication required",
        description: "Please sign in to search for food and events",
        variant: "default",
      });
      
      // This would trigger the auth modal in a production app
      document.getElementById('auth-button')?.click();
    }
  };
  
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
            Order Food & Discover Events at USM
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The ultimate platform for Southern Miss students to order campus food, discover events, and connect with the USM community.
          </p>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center mb-8">
            <Link to={isAuthenticated ? "/food" : "/signin"} className="bg-usm-gold text-black px-6 py-4 rounded-xl font-medium hover:bg-usm-gold-dark transition-all flex items-center justify-center">
              <Utensils className="mr-2 h-5 w-5" />
              Order Food
            </Link>
            <Link to={isAuthenticated ? "/events" : "/signin"} className="bg-black text-white px-6 py-4 rounded-xl font-medium hover:bg-gray-800 transition-all flex items-center justify-center">
              <CalendarDays className="mr-2 h-5 w-5" />
              Browse Events
            </Link>
          </div>
          
          <div className="max-w-2xl mx-auto relative">
            <form onSubmit={handleSearch} className="flex">
              <input 
                type="text"
                placeholder="Search for food, events, or venues..."
                className="w-full px-6 py-4 rounded-l-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-usm-gold focus:border-transparent text-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-usm-gold text-black px-6 py-4 rounded-r-xl font-medium hover:bg-usm-gold-dark transition-all flex items-center"
              >
                <Search className="mr-2 h-5 w-5" />
                Search
              </button>
            </form>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-gray-600">
              <span>Popular:</span>
              <Link to={isAuthenticated ? "/food/the-hub" : "/signin"} className="hover:text-usm-gold transition-colors">The Hub</Link> •
              <Link to={isAuthenticated ? "/food/fresh-food-company" : "/signin"} className="hover:text-usm-gold transition-colors">Fresh Food Company</Link> •
              <Link to={isAuthenticated ? "/food/chick-fil-a" : "/signin"} className="hover:text-usm-gold transition-colors">Chick-fil-A</Link> •
              <Link to={isAuthenticated ? "/events/homecoming" : "/signin"} className="hover:text-usm-gold transition-colors">Homecoming</Link>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 text-center animate-zoom-in" style={{ animationDelay: '0.1s' }}>
            <div className="text-2xl font-bold text-usm-gold mb-1">20+</div>
            <div className="text-sm text-gray-600">Dining Options</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 text-center animate-zoom-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-2xl font-bold text-usm-gold mb-1">100+</div>
            <div className="text-sm text-gray-600">Weekly Events</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 text-center animate-zoom-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-2xl font-bold text-usm-gold mb-1">15k+</div>
            <div className="text-sm text-gray-600">Happy Students</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 text-center animate-zoom-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-2xl font-bold text-usm-gold mb-1">30min</div>
            <div className="text-sm text-gray-600">Avg. Delivery Time</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
