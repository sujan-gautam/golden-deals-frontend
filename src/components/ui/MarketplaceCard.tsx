
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, DollarSign, ShoppingBag, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { formatDistance } from 'date-fns';
import MessageSellerModal from '../social/MessageSellerModal';

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
  stock?: 'instock' | 'lowstock' | 'soldout';
}

const MarketplaceCard = ({
  id,
  title,
  price,
  description,
  image,
  seller,
  timestamp,
  category,
  stock = 'instock'
}: MarketplaceCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const { toast } = useToast();
  
  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };
  
  const stockColor = {
    instock: "bg-green-100 text-green-800 border-green-200",
    lowstock: "bg-yellow-100 text-yellow-800 border-yellow-200",
    soldout: "bg-red-100 text-red-800 border-red-200"
  };
  
  const stockText = {
    instock: "In Stock",
    lowstock: "Low Stock",
    soldout: "Sold Out"
  };

  const handlePurchase = () => {
    if (stock === 'soldout') return;
    
    toast({
      title: stock === 'lowstock' ? "Last items remaining!" : "Added to cart!",
      description: `${title} has been added to your cart.`,
    });
  };
  
  return (
    <motion.div 
      className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg border border-gray-100"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link to={`/marketplace/${id}`}>
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Badge className="capitalize">
              {category}
            </Badge>
            <Badge 
              variant={stock === 'instock' ? 'secondary' : stock === 'lowstock' ? 'default' : 'destructive'}
            >
              {stockText[stock]}
            </Badge>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/marketplace/${id}`} className="block">
            <h3 className="font-semibold text-gray-800 hover:text-primary transition-colors line-clamp-1">
              {title}
            </h3>
          </Link>
          
          <button 
            onClick={() => {
              setIsLiked(!isLiked);
              toast({
                title: isLiked ? "Removed from wishlist" : "Added to wishlist",
                description: isLiked ? `${title} has been removed from your wishlist.` : `${title} has been added to your wishlist.`,
              });
            }} 
            className={`p-1 rounded-full transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>
        
        <div className="flex items-center mb-2">
          <DollarSign className="h-4 w-4 text-primary mr-1" />
          <span className="font-bold text-gray-900">${price.toFixed(2)}</span>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {description}
        </p>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <Avatar className="w-6 h-6 mr-2">
              <AvatarImage src={seller.avatar} alt={seller.name} />
              <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600">{seller.name}</span>
          </div>
          
          <div className="text-xs text-gray-500">
            {formatTimeAgo(timestamp)}
          </div>
        </div>
        
        <div className="mt-3 flex gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1" 
            disabled={stock === 'soldout'}
            onClick={handlePurchase}
          >
            <ShoppingBag className="h-4 w-4 mr-1" />
            {stock === 'soldout' ? 'Sold Out' : 'Purchase'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsMessageModalOpen(true)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <MessageSellerModal 
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        seller={{
          id: 'seller-id',
          name: seller.name,
          avatar: seller.avatar
        }}
        productName={title}
      />
    </motion.div>
  );
};

export default MarketplaceCard;
