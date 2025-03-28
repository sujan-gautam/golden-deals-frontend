import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, CalendarDays, Clock, MapPin, Star, Coffee, Pizza, Sandwich, CreditCard, Info } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/ui/HeroSection';
import CategoryCard from '@/components/ui/CategoryCard';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/hooks/use-auth';
import FeaturedSection from '@/components/ui/FeaturedSection';

// Food categories for the campus dining section
const foodCategories = [
  { title: 'Fast Food', icon: <Pizza size={24} />, slug: 'fast-food', count: 12 },
  { title: 'Coffee Shops', icon: <Coffee size={24} />, slug: 'coffee', count: 5 },
  { title: 'Dining Halls', icon: <Utensils size={24} />, slug: 'dining-halls', count: 3 },
  { title: 'Grab & Go', icon: <Sandwich size={24} />, slug: 'grab-and-go', count: 8 },
];

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loginReason, setLoginReason] = useState('');
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Fetch restaurants data
    const fetchRestaurants = async () => {
      try {
        // This would be a real API call in production
        // For demo purposes, using a timeout to simulate API call
        setTimeout(() => {
          setFeaturedRestaurants([
            {
              id: "1",
              name: "The Fresh Food Company",
              image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
              rating: 4.7,
              deliveryTime: "15-25 min",
              location: "Thad Cochran Center",
              tags: ["Meal Plan", "Dine-in", "To-go"]
            },
            {
              id: "2",
              name: "Chick-fil-A",
              image: "https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
              rating: 4.9,
              deliveryTime: "20-30 min",
              location: "Thad Cochran Center",
              tags: ["Popular", "Chicken", "Fast food"]
            },
            {
              id: "3",
              name: "Starbucks",
              image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
              rating: 4.5,
              deliveryTime: "10-20 min",
              location: "Cook Library",
              tags: ["Coffee", "Breakfast", "Snacks"]
            },
            {
              id: "4",
              name: "Subway",
              image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
              rating: 4.3,
              deliveryTime: "15-25 min",
              location: "Century Park",
              tags: ["Sandwiches", "Healthy", "Meal Plan"]
            }
          ]);
        }, 1000);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        toast({
          title: "Error",
          description: "Could not load restaurants data. Please try again later.",
          variant: "destructive",
        });
      }
    };

    // Fetch events data
    const fetchEvents = async () => {
      try {
        // This would be a real API call in production
        // For demo purposes, using a timeout to simulate API call
        setTimeout(() => {
          setUpcomingEvents([
            {
              id: "1",
              title: "Homecoming Game",
              date: "Oct 15, 2023",
              time: "6:00 PM",
              location: "M.M. Roberts Stadium",
              image: "https://images.unsplash.com/photo-1628891890467-b79f2c8ba7b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
              category: "Sports"
            },
            {
              id: "2",
              title: "Student Organization Fair",
              date: "Sep 8, 2023",
              time: "11:00 AM - 2:00 PM",
              location: "Shoemaker Square",
              image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
              category: "Campus"
            },
            {
              id: "3",
              title: "Career Fair",
              date: "Oct 5, 2023",
              time: "10:00 AM - 3:00 PM",
              location: "Thad Cochran Center",
              image: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
              category: "Career"
            }
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error",
          description: "Could not load events data. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchRestaurants();
    fetchEvents();
  }, [toast]);

  const handleAuthAction = (action, reason) => {
    if (isAuthenticated) {
      if (action === 'rsvp') {
        toast({
          title: "Success",
          description: "You've successfully RSVP'd to this event!",
        });
      } else {
        navigate(`/${action}`);
      }
    } else {
      setLoginReason(reason);
      setIsAuthModalOpen(true);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        {/* Campus Dining Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Campus Dining</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore dining options across USM campus, from dining halls to grab-and-go spots
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
              {foodCategories.map((category) => (
                <CategoryCard 
                  key={category.slug}
                  title={category.title}
                  icon={category.icon}
                  slug={category.slug}
                  count={category.count}
                />
              ))}
            </div>

            {/* Featured Restaurants */}
            <div className="mt-16">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Popular Places to Eat</h3>
                <button 
                  onClick={() => handleAuthAction('food', 'to view all dining options')}
                  className="text-usm-gold hover:text-usm-gold-dark font-medium"
                >
                  View All
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 h-80 animate-pulse">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  featuredRestaurants.map((restaurant) => (
                    <div key={restaurant.id} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={restaurant.image} 
                          alt={restaurant.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-sm font-medium flex items-center">
                          <Star className="h-4 w-4 text-usm-gold mr-1 fill-usm-gold" />
                          {restaurant.rating}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 mb-1">{restaurant.name}</h4>
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {restaurant.location}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm mb-3">
                          <Clock className="h-4 w-4 mr-1" />
                          {restaurant.deliveryTime}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {restaurant.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button 
                          onClick={() => handleAuthAction(`food/${restaurant.id}`, 'to order food')}
                          className="w-full mt-3 text-center bg-usm-gold text-black font-medium py-2 px-4 rounded-md hover:bg-usm-gold-dark transition-colors"
                        >
                          Order Now
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Upcoming Events Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Upcoming Events</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Don't miss out on the exciting events happening around campus
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 h-96 animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/5"></div>
                      <div className="h-10 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={event.image} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-usm-gold text-black px-2 py-1 rounded-md text-sm font-medium">
                        {event.category}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 mb-2">{event.title}</h4>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <CalendarDays className="h-4 w-4 mr-1" />
                        {event.date}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                      <button 
                        onClick={() => handleAuthAction('rsvp', 'to RSVP for this event')} 
                        className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
                      >
                        RSVP Now
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center mt-8">
              <button 
                onClick={() => handleAuthAction('events', 'to view all events')}
                className="inline-block bg-usm-gold text-black font-medium px-6 py-3 rounded-lg hover:bg-usm-gold-dark transition-colors"
              >
                View All Events
              </button>
            </div>
          </div>
        </section>
        
        {/* Marketplace Section */}
        <FeaturedSection 
          title="Student Marketplace" 
          subtitle="Buy and sell items from fellow students" 
          moreLink="/marketplace"
        />
        
        {/* How It Works Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Order food or discover events in just a few simple steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-usm-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="h-8 w-8 text-usm-gold" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Choose Your Food</h3>
                <p className="text-gray-600">
                  Browse through our range of campus dining options to find your perfect meal.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-usm-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-usm-gold" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Track in Real-Time</h3>
                <p className="text-gray-600">
                  Know exactly when your food will arrive with our real-time tracking system.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-usm-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-usm-gold" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Pay with Eagle Bucks</h3>
                <p className="text-gray-600">
                  Use your student meal plan, Eagle Bucks, or credit card for a seamless payment.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <p className="text-gray-500 mb-3">
                <Info className="h-4 w-4 inline-block mr-1" />
                Login required for ordering food, RSVPing to events, and accessing the marketplace
              </p>
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-usm-gold text-black font-medium px-6 py-3 rounded-lg hover:bg-usm-gold-dark transition-colors"
              >
                Sign In to Get Started
              </button>
            </div>
          </div>
        </section>
        
        {/* Mobile App Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Download the EagleDine App</h2>
                <p className="text-gray-300 mb-8">
                  Get the full Southern Miss dining experience on your mobile device. Order food, discover events, and track your meal plan balance on the go.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <button className="flex items-center justify-center bg-white text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                    <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path 
                        d="M17.5646,3.15186 C16.0946,1.88986 14.1346,1.14286 12.1316,1.14286 C11.2996,1.14286 10.4916,1.26786 9.72464,1.50786 C9.05664,1.71429 8.41964,2.00386 7.82764,2.36786 C5.82164,3.61386 4.43464,5.69786 4.11864,8.10386 C3.91164,9.69386 4.13164,11.3279 4.73864,12.8139 C5.34564,14.3019 6.34164,15.6379 7.60764,16.6079 C8.16064,17.0339 8.76664,17.3699 9.41864,17.6039 C10.0716,17.8379 10.7586,17.9639 11.4586,17.9639 C11.4886,17.9639 11.5176,17.9639 11.5466,17.9639 C12.1946,17.9519 12.8176,17.8279 13.4036,17.5939 C13.9906,17.3579 14.5376,17.0219 15.0386,16.5919 C15.1506,16.4979 15.2606,16.3979 15.3656,16.2939 C15.3696,16.2899 15.3746,16.2859 15.3776,16.2829 C15.7006,15.9619 16.0046,15.6139 16.2266,15.1979 C16.2406,15.1739 16.2516,15.1459 16.2616,15.1159 C16.2616,15.1139 16.2636,15.1139 16.2636,15.1119 C16.2666,15.1039 16.2696,15.0959 16.2716,15.0879 C16.5366,14.4959 16.5896,13.8139 16.4196,13.1619 C16.2466,12.5019 15.8616,11.9019 15.3256,11.4899 C14.9796,11.2179 14.5836,11.0139 14.1546,10.8879 C13.7176,10.7579 13.2556,10.7119 12.7956,10.7439 C12.3236,10.7779 11.8656,10.8939 11.4466,11.0929 C11.0206,11.2939 10.6346,11.5759 10.3166,11.9399 C10.0986,12.1879 9.91664,12.4659 9.77764,12.7639 C9.77664,12.7659 9.77564,12.7679 9.77464,12.7699 C9.53664,13.2739 9.42264,13.8339 9.45364,14.3979 C9.48264,14.9339 9.64464,15.4459 9.92464,15.8939"
                        className="app-download-image w-full h-full"
                      />
                    </svg>
                    <span>App Store</span>
                  </button>
                  <button className="flex items-center justify-center bg-white text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                    <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path 
                        d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
                        className="app-download-image w-full h-full"
                      />
                    </svg>
                    <span>Google Play</span>
                  </button>
                </div>
              </div>
              <div className="relative h-96 rounded-xl overflow-hidden hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="USM Campus" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white">EagleDine - USM's Official Dining App</h3>
                  <p className="text-gray-200">Get it now on iOS and Android</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        message={loginReason ? `Please sign in ${loginReason}` : undefined}
      />
    </div>
  );
};

export default Index;
