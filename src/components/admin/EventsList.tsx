
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Event {
  id: string;
  title: string;
  description: string;
  organizer: {
    id: string;
    name: string;
    avatar: string;
  };
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  attendees: number;
}

interface EventsListProps {
  searchQuery: string;
}

const EventsList = ({ searchQuery }: EventsListProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll create mock data
    setEvents([
      {
        id: '1',
        title: 'Spring Campus Mixer',
        description: 'Join us for the annual Spring Mixer! Food, music, and fun activities.',
        organizer: {
          id: '101',
          name: 'Student Government',
          avatar: 'https://i.pravatar.cc/300?img=61',
        },
        location: 'Main Quad',
        startDate: '2023-04-15T18:00:00Z',
        endDate: '2023-04-15T22:00:00Z',
        status: 'upcoming',
        attendees: 156,
      },
      {
        id: '2',
        title: 'Computer Science Hackathon',
        description: '48-hour coding competition. Form teams and build amazing projects!',
        organizer: {
          id: '102',
          name: 'CS Club',
          avatar: 'https://i.pravatar.cc/300?img=62',
        },
        location: 'Tech Building, Room 101',
        startDate: '2023-05-20T09:00:00Z',
        endDate: '2023-05-22T09:00:00Z',
        status: 'upcoming',
        attendees: 87,
      },
      {
        id: '3',
        title: 'Career Fair 2023',
        description: 'Meet recruiters from top companies across all industries.',
        organizer: {
          id: '103',
          name: 'Career Services',
          avatar: 'https://i.pravatar.cc/300?img=63',
        },
        location: 'Student Union Ballroom',
        startDate: '2023-03-10T10:00:00Z',
        endDate: '2023-03-10T16:00:00Z',
        status: 'completed',
        attendees: 432,
      },
      {
        id: '4',
        title: 'End of Year Party',
        description: 'Celebrate the end of another successful academic year!',
        organizer: {
          id: '104',
          name: 'Student Activities',
          avatar: 'https://i.pravatar.cc/300?img=64',
        },
        location: 'Beach Club',
        startDate: '2023-05-30T20:00:00Z',
        endDate: '2023-05-31T02:00:00Z',
        status: 'upcoming',
        attendees: 210,
      },
    ]);
  }, []);
  
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.organizer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Events</h3>
        <Button size="sm">Add Event</Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead>When</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attendees</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-500">{event.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
                        <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{event.organizer.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <div>{formatDate(event.startDate)}</div>
                        <div className="text-xs text-gray-500">to {formatDate(event.endDate)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        event.status === 'upcoming' ? 'secondary' :
                        event.status === 'completed' ? 'outline' : 'default'
                      }
                    >
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.attendees}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Event</DropdownMenuItem>
                        <DropdownMenuItem>Edit Event</DropdownMenuItem>
                        <DropdownMenuItem>Manage Attendees</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Cancel Event</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                  No events found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EventsList;
