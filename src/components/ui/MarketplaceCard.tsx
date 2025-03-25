
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, DollarSign } from 'lucide-react';

interface MarketplaceCardProps {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
  seller: {
    name: string;
    avatar: string;
  };
  timestamp: string;
  category: string;
}

const MarketplaceCard = ({
  id,
  title,
  price,
  description,
  image,
  seller,
  timestamp,
  category
}: MarketplaceCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100">
      <Link to={`/item/${id}`}>
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <span className="bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full">
              {category}
            </span>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/item/${id}`} className="block">
            <h3 className="font-semibold text-gray-800 hover:text-usm-gold transition-colors line-clamp-1">
              {title}
            </h3>
          </Link>
          
          <button 
            onClick={() => setIsLiked(!isLiked)} 
            className={`p-1 rounded-full transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>
        
        <div className="flex items-center mb-2">
          <DollarSign className="h-4 w-4 text-usm-gold mr-1" />
          <span className="font-bold text-gray-900">${price.toFixed(2)}</span>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {description}
        </p>
        
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center">
            <img 
              src={seller.avatar} 
              alt={seller.name} 
              className="w-6 h-6 rounded-full object-cover mr-2"
            />
            <span className="text-xs text-gray-600">{seller.name}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{timestamp}</span>
            <Link 
              to={`/message/${id}`} 
              className="p-1 rounded-full text-gray-400 hover:text-usm-gold transition-colors"
              aria-label="Message seller"
            >
              <MessageSquare className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceCard;
