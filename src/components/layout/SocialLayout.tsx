import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Home, Search, ShoppingBag, Calendar, LogOut, Settings, User, X, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useDebounce } from 'use-debounce';
import BottomNavBar from './BottomNavBar';
import { useNotifications } from '@/hooks/useNotifications';
import { useQueryClient } from '@tanstack/react-query';
import CreatePostModal from '../social/CreatePostModal';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY ;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

interface SocialLayoutProps {
  children: React.ReactNode;
}

const SocialLayout = ({ children }: SocialLayoutProps) => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tooltip, setTooltip] = useState<{ label: string; index: number } | null>(null);
  const hoverTimeouts = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionListRef = useRef<HTMLUListElement>(null);

  // Load recent searches
  useEffect(() => {
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]') as string[];
    if (debouncedQuery.trim()) {
      const filteredSuggestions = recentSearches.filter((search) =>
        search.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
      setSuggestions([...new Set([debouncedQuery, ...filteredSuggestions])].slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  // Save search query
  const saveSearchQuery = (query: string) => {
    if (!query.trim()) return;
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]') as string[];
    const updatedSearches = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        title: 'Empty Search',
        description: 'Please enter a search term.',
        variant: 'destructive',
      });
      return;
    }
    saveSearchQuery(searchQuery);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
    setIsMobileSearchExpanded(false);
    setSuggestions([]);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    saveSearchQuery(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setIsMobileSearchExpanded(false);
    setSuggestions([]);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  // Handle create submission
  const handleCreateSubmit = async (data: Partial<any>) => {
    if (!user || !isAuthenticated) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('type', data.type);
      if (data.content) formData.append('content', data.content);
      if (data.image) formData.append('image', data.image);
      if (data.type === 'product') {
        formData.append('title', data.title);
        formData.append('price', data.price.toString());
        formData.append('category', data.category || '');
        formData.append('condition', data.condition);
        formData.append('status', data.status);
      }
      if (data.type === 'event') {
        formData.append('event_title', data.event_title);
        formData.append('event_date', data.event_date);
        formData.append('event_location', data.event_location);
      }

      await api.post('/posts', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Focus input when search expands
  useEffect(() => {
    if (isMobileSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isMobileSearchExpanded]);

  // Handle clicks outside suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionListRef.current &&
        !suggestionListRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle tooltip hover
  const handleMouseEnter = (label: string, index: number) => {
    hoverTimeouts.current[index] = setTimeout(() => {
      setTooltip({ label, index });
    }, 1000);
  };

  const handleMouseLeave = (index: number) => {
    if (hoverTimeouts.current[index]) {
      clearTimeout(hoverTimeouts.current[index]);
      delete hoverTimeouts.current[index];
    }
    setTooltip(null);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSuggestions([]);
      setIsMobileSearchExpanded(false);
      setSearchQuery('');
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;
  const fullName = user

    ? `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username || 'User'
    : 'User';
  const avatarSrc = user?.avatar ? `${IMAGE_URL}${user.avatar}` : undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <svg className="animate-spin h-8 w-8 text-usm-gold" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: '/feed', icon: Home, label: 'Home' },
    { path: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/interested', icon: Heart, label: 'Interested' },
  ];

  const desktopActionItems = [
    { onClick: () => navigate('/notification'), icon: Bell, label: 'Notifications', badge: unreadCount },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className={cn('flex items-center', isMobileSearchExpanded && 'hidden md:flex')}>
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-usm-gold">Golden</span> Deals
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item, index) => (
                <div
                  key={item.path}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.label, index)}
                  onMouseLeave={() => handleMouseLeave(index)}
                >
                  <Link to={item.path}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-900 hover:text-usm-gold hover:bg-gray-50 px-2 py-2"
                      aria-label={item.label}
                    >
                      <item.icon className="h-5 w-5" />
                    </Button>
                  </Link>
                  {tooltip && tooltip.index === index && (
                    <div
                      className={cn(
                        'absolute top-full mt-2 bg-gray-800 text-white text-[11px] font-light tracking-tight',
                        'px-2 py-1 rounded-md shadow-lg',
                        'pointer-events-none z-50'
                      )}
                    >
                      {tooltip.label}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search
                  className={cn(
                    'absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors',
                    isSearchFocused ? 'text-usm-gold' : 'text-gray-400'
                  )}
                  aria-hidden="true"
                />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search users, products, events..."
                  className={cn(
                    'w-full py-2 pl-10 pr-4 rounded-full bg-gray-100 border-none text-sm text-gray-900',
                    'focus:ring-2 focus:ring-usm-gold focus:bg-white transition-all duration-200',
                    'placeholder:text-gray-500'
                  )}
                  aria-label="Search Golden Deals"
                  ref={searchInputRef}
                />
                {suggestions.length > 0 && (
                  <ul
                    ref={suggestionListRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
                    role="listbox"
                    aria-label="Search suggestions"
                  >
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
                        role="option"
                        aria-selected={false}
                      >
                        <span className="flex items-center">
                          <Search className="h-4 w-4 mr-2 text-gray-400" />
                          {suggestion}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </form>
            </div>

            {/* Mobile Search Bar (Expanding) */}
            <div className="md:hidden flex items-center flex-1">
              <div className="flex items-center w-full transition-all duration-300 ease-in-out">
                <form
                  onSubmit={handleSearchSubmit}
                  className={cn(
                    'flex items-center transition-all duration-300 flex-1',
                    isMobileSearchExpanded ? 'w-full' : 'w-0 overflow-hidden'
                  )}
                >
                  <div className="relative w-full">
                    {isMobileSearchExpanded && (
                      <Search
                        className={cn(
                          'absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors',
                          isSearchFocused ? 'text-usm-gold' : 'text-gray-400'
                        )}
                        aria-hidden="true"
                      />
                    )}
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        setIsSearchFocused(true);
                        setIsMobileSearchExpanded(true);
                      }}
                      onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                      onKeyDown={handleKeyDown}
                      placeholder={isMobileSearchExpanded ? 'Search Golden Deals...' : ''}
                      className={cn(
                        'py-2 pl-10 pr-4 rounded-full bg-gray-100 border-none text-sm text-gray-900',
                        'focus:ring-2 focus:ring-usm-gold focus:bg-white transition-all duration-300',
                        'placeholder:text-gray-500',
                        isMobileSearchExpanded ? 'w-full' : 'w-0 opacity-0 pointer-events-none'
                      )}
                      aria-label="Search Golden Deals"
                      ref={searchInputRef}
                    />
                    {isMobileSearchExpanded && suggestions.length > 0 && (
                      <ul
                        ref={suggestionListRef}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
                        role="listbox"
                        aria-label="Search suggestions"
                      >
                        {suggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
                            role="option"
                            aria-selected={false}
                          >
                            <span className="flex items-center">
                              <Search className="h-4 w-4 mr-2 text-gray-400" />
                              {suggestion}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {isMobileSearchExpanded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsMobileSearchExpanded(false);
                        setSearchQuery('');
                        setSuggestions([]);
                        if (searchInputRef.current) {
                          searchInputRef.current.blur();
                        }
                      }}
                      className="ml-2 text-gray-600 hover:text-gray-900 shrink-0"
                      aria-label="Cancel search"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </form>
                {!isMobileSearchExpanded && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileSearchExpanded(true)}
                    className="text-gray-900 hover:text-usm-gold hover:bg-gray-50 shrink-0"
                    aria-label="Open search"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* User Actions (Desktop includes Notifications, Mobile only Profile) */}
            <div className="flex items-center space-x-1">
              {/* Desktop Notifications */}
              <div className="hidden md:flex items-center space-x-1">
                {desktopActionItems.map((item, index) => (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(item.label, index + navItems.length)}
                    onMouseLeave={() => handleMouseLeave(index + navItems.length)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={item.onClick}
                      className="relative text-gray-900 hover:text-usm-gold hover:bg-gray-50 px-2 py-2"
                      aria-label={`${item.label}${item.badge ? ` (${item.badge} unread)` : ''}`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.badge > 0 && (
                        <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 text-xs font-semibold text-white bg-red-500 rounded-full ring-2 ring-white">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </Button>
                    {tooltip && tooltip.index === index + navItems.length && (
                      <div
                        className={cn(
                          'absolute top-full mt-2 bg-gray-800 text-white text-[11px] font-light tracking-tight',
                          'px-2 py-1 rounded-md shadow-lg',
                          'pointer-events-none z-50'
                        )}
                      >
                        {tooltip.label}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* User Profile (Visible on all screens) */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="p-0 hover:bg-gray-50 rounded-full"
                      aria-label={`Open user menu for ${fullName}`}
                    >
                      <Avatar className="h-10 w-10 ring-2 ring-gray-200 hover:ring-usm-gold transition-all">
                        <AvatarImage
                          src={avatarSrc}
                          alt={fullName}
                          onError={(e) => {
                            console.error('SocialLayout - Failed to load avatar:', avatarSrc);
                            e.currentTarget.src = '/default-avatar.png';
                          }}
                        />
                        <AvatarFallback className="bg-gray-200 text-gray-700">
                          {fullName.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-white shadow-xl rounded-lg py-2">
                    <DropdownMenuLabel className="px-4 py-3">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-semibold text-gray-900">{fullName}</span>
                        <span className="text-xs text-gray-500 truncate">{user?.email || 'No email'}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 hover:text-usm-gold"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 hover:text-usm-gold"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 hover:text-usm-gold"
                        >
                          <span className="mr-2">👑</span>
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50 hover:text-red-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-900 hover:text-usm-gold hover:bg-gray-50 px-2 py-2"
                  onClick={() => navigate('/login')}
                  aria-label="Sign in"
                >
                  <User className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-6 pb-20 md:pb-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* Bottom Navigation */}
      {isAuthenticated && <BottomNavBar />}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        initialType="post"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default SocialLayout;