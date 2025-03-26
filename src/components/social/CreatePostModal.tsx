
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImagePlus, X, ShoppingBag, Calendar, MapPin, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: any) => void;
}

const CreatePostModal = ({ isOpen, onClose, onSubmit }: CreatePostModalProps) => {
  // Common state
  const [postType, setPostType] = useState('post');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Product specific state
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('new');
  const [stock, setStock] = useState('instock');
  
  // Event specific state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const resetForm = () => {
    setContent('');
    setImage(undefined);
    setProductName('');
    setPrice('');
    setCategory('');
    setCondition('new');
    setStock('instock');
    setEventTitle('');
    setEventDate('');
    setLocation('');
    setPostType('post');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let postData = {};
    
    switch(postType) {
      case 'post':
        if (!content.trim()) {
          setIsSubmitting(false);
          return;
        }
        postData = {
          type: 'post',
          content,
          image,
        };
        break;
      
      case 'product':
        if (!productName.trim() || !price.trim()) {
          setIsSubmitting(false);
          return;
        }
        postData = {
          type: 'product',
          productName,
          description: content,
          price,
          category,
          condition,
          status: stock,
          image,
        };
        break;
      
      case 'event':
        if (!eventTitle.trim() || !eventDate) {
          setIsSubmitting(false);
          return;
        }
        postData = {
          type: 'event',
          title: eventTitle,
          description: content,
          date: eventDate,
          location,
          image,
        };
        break;
    }
    
    onSubmit(postData);
    resetForm();
    setIsSubmitting(false);
  };
  
  // For demo purposes, let's simulate image upload by allowing URLs
  const handleImageUpload = () => {
    // In a real app, this would be an actual file upload
    // For now, we'll just prompt the user for an image URL
    const imageUrl = prompt('Enter an image URL:');
    if (imageUrl) {
      setImage(imageUrl);
    }
  };
  
  const removeImage = () => {
    setImage(undefined);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="post" onValueChange={setPostType}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="post">Post</TabsTrigger>
            <TabsTrigger value="product">Product</TabsTrigger>
            <TabsTrigger value="event">Event</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <div className="flex items-start space-x-3">
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">
                  {postType === 'post' && 'Posting to your feed'}
                  {postType === 'product' && 'Listing a product'}
                  {postType === 'event' && 'Creating an event'}
                </div>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <TabsContent value="post" className="space-y-4">
              <textarea
                placeholder="What's on your mind?"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-usm-gold min-h-[120px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </TabsContent>
            
            <TabsContent value="product" className="space-y-4">
              <Input
                placeholder="Product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    className="pl-9"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <Select value={stock} onValueChange={setStock}>
                    <SelectTrigger>
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instock">In Stock</SelectItem>
                      <SelectItem value="lowstock">Low Stock</SelectItem>
                      <SelectItem value="soldout">Sold Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="likenew">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Category (e.g., Electronics, Books, Clothing)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <textarea
                placeholder="Description"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-usm-gold min-h-[80px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </TabsContent>
            
            <TabsContent value="event" className="space-y-4">
              <Input
                placeholder="Event title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                required
              />
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    type="date"
                    placeholder="Date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Location"
                  className="pl-9"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <textarea
                placeholder="Event details"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-usm-gold min-h-[80px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </TabsContent>
            
            {image && (
              <div className="relative rounded-lg overflow-hidden border">
                <img src={image} alt="Post attachment" className="w-full max-h-60 object-cover" />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex space-x-2">
                <Button type="button" variant="outline" size="sm" onClick={handleImageUpload}>
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Add Photo
                </Button>
                {postType === 'product' && (
                  <Badge variant={stock === 'instock' ? 'secondary' : stock === 'lowstock' ? 'default' : 'destructive'}>
                    {stock === 'instock' ? 'In Stock' : stock === 'lowstock' ? 'Low Stock' : 'Sold Out'}
                  </Badge>
                )}
              </div>
              
              <Button type="submit" disabled={
                (postType === 'post' && !content.trim()) || 
                (postType === 'product' && (!productName.trim() || !price.trim())) ||
                (postType === 'event' && (!eventTitle.trim() || !eventDate)) ||
                isSubmitting
              }>
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
