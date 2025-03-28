import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, Menu, X, User, Utensils, CalendarDays, Bell, Heart, LogOut, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthModal from '@/components/auth/AuthModal';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/75 border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Utensils className="h-6 w-6 text-usm-gold" />
            <span className="text-xl font-bold text-black">Eagle<span className="text-usm-gold">Dine</span></span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-usm-gold transition-colors">Home</Link>
            <Link to="/food" className="text-gray-700 hover:text-usm-gold transition-colors">Food</Link>
            <Link to="/events" className="text-gray-700 hover:text-usm-gold transition-colors">Events</Link>
            <Link to="/meal-plans" className="text-gray-700 hover:text-usm-gold transition-colors">Meal Plans</Link>
            {isAuthenticated && (
              <Link to="/marketplace" className="text-gray-700 hover:text-usm-gold transition-colors">Marketplace</Link>
            )}
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
            
            {isAuthenticated ? (
              <>
                <Link to="/saved" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Heart className="h-5 w-5" />
                </Link>
                <Link to="/notifications" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Bell className="h-5 w-5" />
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/saved')}>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Saved Items</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/marketplace/my-listings')}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>My Listings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                id="auth-button"
                className="bg-usm-gold text-black hover:bg-usm-gold-dark"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
          
          <div className="flex md:hidden">
            <button
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {isOpen && (
          <div className="md:hidden fixed inset-0 bg-white pt-16 z-40 animate-fade-in">
            <div className="flex flex-col space-y-4 p-6">
              <Link to="/" className="text-lg font-medium py-2 border-b border-gray-100" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <Link to="/food" className="text-lg font-medium py-2 border-b border-gray-100" onClick={() => setIsOpen(false)}>
                Food
              </Link>
              <Link to="/events" className="text-lg font-medium py-2 border-b border-gray-100" onClick={() => setIsOpen(false)}>
                Events
              </Link>
              <Link to="/meal-plans" className="text-lg font-medium py-2 border-b border-gray-100" onClick={() => setIsOpen(false)}>
                Meal Plans
              </Link>
              {isAuthenticated && (
                <Link to="/marketplace" className="text-lg font-medium py-2 border-b border-gray-100" onClick={() => setIsOpen(false)}>
                  Marketplace
                </Link>
              )}
              
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-4 pt-4">
                    <Link to="/saved" className="flex items-center text-gray-700" onClick={() => setIsOpen(false)}>
                      <Heart className="h-5 w-5 mr-2" />
                      Saved
                    </Link>
                    <Link to="/notifications" className="flex items-center text-gray-700" onClick={() => setIsOpen(false)}>
                      <Bell className="h-5 w-5 mr-2" />
                      Notifications
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 pt-4 mt-2">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar>
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <Link to="/profile" className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>
                      <User className="inline h-5 w-5 mr-2" />
                      Profile
                    </Link>
                    <Link to="/marketplace/my-listings" className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>
                      <ShoppingBag className="inline h-5 w-5 mr-2" />
                      My Listings
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }} 
                      className="w-full text-left py-2 text-red-600 mt-2 flex items-center"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <Button 
                  className="bg-usm-gold text-black hover:bg-usm-gold-dark mt-4 w-full"
                  onClick={() => {
                    setIsOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
        
        {isSearchOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white shadow-md border-t border-gray-200 p-4 animate-fade-in">
            <div className="container mx-auto flex items-center">
              <input
                type="text"
                placeholder="Search for food, events, dining halls..."
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
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  );
};

export default Navbar;
