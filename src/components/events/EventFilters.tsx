import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Filter, ChevronDown } from 'lucide-react';

interface EventFiltersProps {
  filters: { timeFrame: string; category: string; location: string };
  setFilters: React.Dispatch<React.SetStateAction<{ timeFrame: string; category: string; location: string }>>;
  locations?: string[];
  className?: string;
}

const EventFilters: React.FC<EventFiltersProps> = ({ filters, setFilters, locations = [], className }) => {
  const categories = ['Music', 'Technology', 'Meeting', 'Sports', 'Career', 'Cultural', 'Arts', 'Volunteer', 'Academic', 'Social'];
  
  // Remove duplicate locations using Set and filter out falsy values
  const uniqueLocations = Array.from(new Set(locations.filter(location => location)));

  return (
    <div className={`flex flex-wrap md:flex-nowrap gap-2 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            {filters.timeFrame === 'all' && 'Any Time'}
            {filters.timeFrame === 'today' && 'Today'}
            {filters.timeFrame === 'this-week' && 'This Week'}
            {filters.timeFrame === 'this-month' && 'This Month'}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setFilters({ ...filters, timeFrame: 'all' })}>Any Time</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFilters({ ...filters, timeFrame: 'today' })}>Today</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFilters({ ...filters, timeFrame: 'this-week' })}>This Week</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFilters({ ...filters, timeFrame: 'this-month' })}>This Month</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            {filters.category === 'all' ? 'All Categories' : filters.category}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setFilters({ ...filters, category: 'all' })}>All Categories</DropdownMenuItem>
          {categories.map(category => (
            <DropdownMenuItem key={category} onClick={() => setFilters({ ...filters, category })}>{category}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            {filters.location === 'all' ? 'All Locations' : filters.location}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setFilters({ ...filters, location: 'all' })}>All Locations</DropdownMenuItem>
          {uniqueLocations.map(location => (
            <DropdownMenuItem key={location} onClick={() => setFilters({ ...filters, location })}>{location}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default EventFilters;