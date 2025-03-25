
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MarketplaceCard from './MarketplaceCard';

// Sample data
const featuredItems = [
  {
    id: "1",
    title: "Calculus Textbook - 8th Edition",
    price: 45.99,
    description: "Barely used calculus textbook in excellent condition. Perfect for Math 121 and 122.",
    image: "https://images.unsplash.com/photo-1621944190310-e3cca1564bd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
    seller: {
      name: "John D.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    timestamp: "2 days ago",
    category: "Books"
  },
  {
    id: "2",
    title: "MacBook Air M1 - 256GB",
    price: 750.00,
    description: "2020 MacBook Air with M1 chip, 8GB RAM, 256GB storage. In perfect condition with charger.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
    seller: {
      name: "Sarah K.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    timestamp: "5 hours ago",
    category: "Electronics"
  },
  {
    id: "3",
    title: "Apartment Sublet - Summer 2023",
    price: 650.00,
    description: "Subleasing my apartment near campus for summer months. Fully furnished, utilities included.",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
    seller: {
      name: "Mike T.",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg"
    },
    timestamp: "1 day ago",
    category: "Housing"
  },
  {
    id: "4",
    title: "Trek Mountain Bike",
    price: 320.00,
    description: "2018 Trek mountain bike in great condition. Recently tuned up with new brakes and tires.",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80",
    seller: {
      name: "Alex W.",
      avatar: "https://randomuser.me/api/portraits/women/67.jpg"
    },
    timestamp: "3 days ago",
    category: "Sports"
  }
];

interface FeaturedSectionProps {
  title: string;
  subtitle?: string;
  moreLink?: string;
}

const FeaturedSection = ({ title, subtitle, moreLink }: FeaturedSectionProps) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
          
          {moreLink && (
            <Link to={moreLink} className="flex items-center text-usm-gold hover:text-usm-gold-dark transition-colors font-medium">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.map((item) => (
            <MarketplaceCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
