import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Search, Filter, MapPin, Clock, ChevronDown, Star, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SocialLayout from '@/components/layout/SocialLayout';
import EventCard from '@/components/events/EventCard';
import FeaturedEvent from '@/components/events/FeaturedEvent';
import AuthModal from '@/components/auth/AuthModal';
import CreatePostModal from '@/components/social/CreatePostModal';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_KEY = import.meta.env.VITE_API_KEY || "mySuperSecretToken";

// Axios instance with default headers including x-api-key
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

const fetchEvents = async () => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "x-api-key": API_KEY,
    },
  };

  try {
    const response = await api.get('/events/all', config);
    console.log('Fetched events:', response.data);
    return response.data;
  } catch (error) {
    const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
      ? error.response.data.message
      : error instanceof Error ? error.message : 'Failed to fetch events';
    console.error('Fetch error:', error);
    throw new Error(`Failed to fetch events: ${errorMessage}`);
  }
};

const Events = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ timeFrame: 'all', location: 'all', sortBy: 'date' });
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const { data: events = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });

  useEffect(() => {
    if (events.length > 0) {
      const locations = events.map((event: any) => event.event_location).filter(Boolean);
      setUniqueLocations(Array.from(new Set(locations)));
    }
  }, [events]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  const handleInterestedClick = () => {
    refetch(); // Refresh events after an action in child components
  };

  const handleCreateEventClick = () => {
    if (isAuthenticated) {
      setIsCreatePostModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleCreatePostSubmit = async (data: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await api.post('/posts', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast({
        title: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Created`,
        description: `Your ${data.type} has been successfully posted.`,
      });
      setIsCreatePostModalOpen(false);
      refetch(); // Refresh events to include the new one
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to create event';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const filteredEvents = events
    .filter((event: any) => {
      if (!searchTerm) return true;
      return (
        (event.event_title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (event.event_details?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (event.event_location?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    })
    .filter((event: any) => {
      if (filters.timeFrame === 'all') return true;
      const eventDate = new Date(event.event_date);
      const today = new Date();
      if (filters.timeFrame === 'today') return eventDate.toDateString() === today.toDateString();
      if (filters.timeFrame === 'this-week') {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return eventDate >= today && eventDate <= nextWeek;
      }
      if (filters.timeFrame === 'this-month') {
        return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
      }
      return true;
    })
    .filter((event: any) => filters.location === 'all' || event.event_location === filters.location)
    .sort((a: any, b: any) => {
      if (filters.sortBy === 'popular') {
        const aScore = (a.likes?.length || 0) + (a.interested?.length || 0) * 2 + (a.shares || 0);
        const bScore = (b.likes?.length || 0) + (b.interested?.length || 0) * 2 + (b.shares || 0);
        return bScore - aScore; // Descending order (most popular first)
      }
      return new Date(a.event_date).getTime() - new Date(b.event_date).getTime(); // Sort by date ascending
    });

  const featuredEvent = events.length > 0 
    ? [...events].sort((a: any, b: any) => {
        const aScore = (a.likes?.length || 0) + (a.interested?.length || 0) * 2 + (a.shares || 0);
        const bScore = (b.likes?.length || 0) + (b.interested?.length || 0) * 2 + (b.shares || 0);
        return bScore - aScore;
      })[0]
    : null;

  const upcomingEvents = filteredEvents.filter((event: any) => new Date(event.event_date) >= new Date());
  const pastEvents = filteredEvents.filter((event: any) => new Date(event.event_date) < new Date());

  const renderEventCards = (eventsToRender: any[]) => {
    if (eventsToRender.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No events found</h3>
          <p className="text-gray-500 mt-2">{searchTerm ? "Try different search terms or filters" : "Check back later!"}</p>
        </div>
      );
    }
    return eventsToRender.map((event: any) => (
      <EventCard
        key={event._id}
        event={event}
        onInterested={handleInterestedClick}
        currentUser={user}
      />
    ));
  };

  return (
    <SocialLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600 mt-1">Discover and join exciting campus events</p>
          </div>
          <Button 
            className="mt-4 md:mt-0 bg-usm-gold text-black hover:bg-amber-600" 
            onClick={handleCreateEventClick}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search events..." 
                className="pl-10" 
                value={searchTerm} 
                onChange={handleSearchChange} 
              />
            </div>
            <Select 
              value={filters.timeFrame} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, timeFrame: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.location} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={filters.sortBy} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-shrink-0">
                  <Filter className="mr-2 h-4 w-4" />
                  View
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewType('grid')}>Grid View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewType('list')}>List View</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="h-80 bg-gray-100 animate-pulse rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>)}
            </div>
          </div>
        ) : (
          <>
            {featuredEvent && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Featured Event</h2>
                <FeaturedEvent 
                  event={featuredEvent} 
                  onInterested={handleInterestedClick} 
                  currentUser={user}
                />
              </div>
            )}

            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="upcoming">Upcoming Events ({upcomingEvents.length})</TabsTrigger>
                <TabsTrigger value="past">Past Events ({pastEvents.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming">
                <div className={viewType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {renderEventCards(upcomingEvents)}
                </div>
              </TabsContent>
              <TabsContent value="past">
                <div className={viewType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {renderEventCards(pastEvents)}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}

        {isError && (
          <div className="p-8 text-center bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-red-600">Unable to load events</h3>
            <p className="text-gray-600 mt-2">There was an error loading events. Please try again later.</p>
            <Button onClick={() => refetch()} className="mt-4 bg-usm-gold text-black hover:bg-amber-600">Retry</Button>
          </div>
        )}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab="signin"
        message="Please sign in to create an event."
      />

      <CreatePostModal 
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onSubmit={handleCreatePostSubmit}
        initialType="event"
      />
    </SocialLayout>
  );
};

export default Events;