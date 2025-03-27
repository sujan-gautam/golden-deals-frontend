
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Home, Search, MessageSquare, ShoppingBag, Calendar, LogOut, Settings, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface SocialLayoutProps {
  children: React.ReactNode;
}

const SocialLayout = ({ children }: SocialLayoutProps) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/feed" className="flex items-center">
                <span className="text-xl font-bold">
                  <span className="text-usm-gold">Social</span>Eagle
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              <Link to="/feed">
                <Button variant="ghost" size="sm" className="relative">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/messages">
                <Button variant="ghost" size="sm" className="relative">
                  <MessageSquare className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="ghost" size="sm">
                  <ShoppingBag className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/events">
                <Button variant="ghost" size="sm">
                  <Calendar className="h-5 w-5" />
                </Button>
              </Link>
            </nav>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search SocialEagle..."
                  className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-100 border-0 focus:ring-2 focus:ring-usm-gold focus:bg-white"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="hidden md:flex relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-transparent p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.name}</span>
                      <span className="text-xs text-gray-500">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer flex w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer flex w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="cursor-pointer flex w-full">
                        <span className="mr-2">👑</span>
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search - Show below header when on mobile */}
        <div className="md:hidden border-t border-gray-100 px-4 py-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search SocialEagle..."
              className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-100 border-0 focus:ring-2 focus:ring-usm-gold focus:bg-white"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="flex flex-col px-4 py-2 space-y-1">
              <Link to="/feed" className="flex items-center py-2">
                <Home className="mr-3 h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link to="/messages" className="flex items-center py-2">
                <MessageSquare className="mr-3 h-5 w-5" />
                <span>Messages</span>
              </Link>
              <Link to="/marketplace" className="flex items-center py-2">
                <ShoppingBag className="mr-3 h-5 w-5" />
                <span>Marketplace</span>
              </Link>
              <Link to="/events" className="flex items-center py-2">
                <Calendar className="mr-3 h-5 w-5" />
                <span>Events</span>
              </Link>
              <Link to="/notifications" className="flex items-center py-2">
                <Bell className="mr-3 h-5 w-5" />
                <span>Notifications</span>
              </Link>
            </div>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="flex-1 pt-6">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SocialLayout;
