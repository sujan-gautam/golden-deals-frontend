
import React, { useState } from 'react';
import { Book, Home, Laptop, Camera, Bicycle, Music, ShoppingBag, Utensils, Gift } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/ui/HeroSection';
import FeaturedSection from '@/components/ui/FeaturedSection';
import CategoryCard from '@/components/ui/CategoryCard';
import AuthModal from '@/components/auth/AuthModal';

const categories = [
  { title: 'Books', icon: <Book size={24} />, slug: 'books', count: 423 },
  { title: 'Housing', icon: <Home size={24} />, slug: 'housing', count: 85 },
  { title: 'Electronics', icon: <Laptop size={24} />, slug: 'electronics', count: 196 },
  { title: 'Photography', icon: <Camera size={24} />, slug: 'photography', count: 42 },
  { title: 'Sports', icon: <Bicycle size={24} />, slug: 'sports', count: 78 },
  { title: 'Music', icon: <Music size={24} />, slug: 'music', count: 64 },
  { title: 'Clothing', icon: <ShoppingBag size={24} />, slug: 'clothing', count: 127 },
  { title: 'Food', icon: <Utensils size={24} />, slug: 'food', count: 93 },
];

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Browse Categories</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Find exactly what you're looking for from our diverse selection of categories
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map((category) => (
                <CategoryCard 
                  key={category.slug}
                  title={category.title}
                  icon={category.icon}
                  slug={category.slug}
                  count={category.count}
                />
              ))}
            </div>
          </div>
        </section>
        
        <FeaturedSection 
          title="Featured Items" 
          subtitle="Hand-picked deals you won't want to miss"
          moreLink="/featured"
        />
        
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-usm-gold font-semibold mb-2 inline-block">EagleMart Benefits</span>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Use EagleMart?</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-usm-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-6 w-6 text-usm-gold" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">USM Community</h3>
                  <p className="text-gray-600 text-sm">
                    Buy and sell exclusively with fellow USM students, faculty, and staff.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-usm-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="h-6 w-6 text-usm-gold" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">No Commission</h3>
                  <p className="text-gray-600 text-sm">
                    List and sell your items completely free, no hidden fees or commissions.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-usm-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home className="h-6 w-6 text-usm-gold" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Local Pickup</h3>
                  <p className="text-gray-600 text-sm">
                    Convenient campus meetups for exchanging items safely and easily.
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="mt-10 bg-usm-gold text-black font-medium px-6 py-3 rounded-lg hover:bg-usm-gold-dark transition-colors"
              >
                Join EagleMart Today
              </button>
            </div>
          </div>
        </section>
        
        <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Download the EagleMart App</h2>
                <p className="text-gray-300 mb-8">
                  Get the full EagleMart experience on your mobile device. Buy, sell, and connect with the USM community on the go.
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
      />
    </div>
  );
};

export default Index;
