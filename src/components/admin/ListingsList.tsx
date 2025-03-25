
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
import { MoreHorizontal, DollarSign } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Listing {
  id: string;
  title: string;
  description: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
  };
  price: number;
  category: string;
  condition: string;
  status: string;
  createdAt: string;
}

interface ListingsListProps {
  searchQuery: string;
}

const ListingsList = ({ searchQuery }: ListingsListProps) => {
  const [listings, setListings] = useState<Listing[]>([]);
  
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll create mock data
    setListings([
      {
        id: '1',
        title: 'Calculus Textbook',
        description: 'Perfect condition, no highlights or notes.',
        seller: {
          id: '101',
          name: 'Sarah Johnson',
          avatar: 'https://i.pravatar.cc/300?img=1',
        },
        price: 40,
        category: 'Books',
        condition: 'Like New',
        status: 'active',
        createdAt: '2023-05-10T14:30:00Z',
      },
      {
        id: '2',
        title: 'Dorm Refrigerator',
        description: 'Small fridge, perfect for dorm rooms. Works great.',
        seller: {
          id: '102',
          name: 'Michael Brown',
          avatar: 'https://i.pravatar.cc/300?img=43',
        },
        price: 85,
        category: 'Appliances',
        condition: 'Good',
        status: 'active',
        createdAt: '2023-05-12T10:15:00Z',
      },
      {
        id: '3',
        title: 'Mountain Bike',
        description: '2021 Trek mountain bike. Minor wear, recently tuned up.',
        seller: {
          id: '103',
          name: 'James Wilson',
          avatar: 'https://i.pravatar.cc/300?img=11',
        },
        price: 350,
        category: 'Sports',
        condition: 'Good',
        status: 'pending',
        createdAt: '2023-05-15T09:45:00Z',
      },
      {
        id: '4',
        title: 'iPhone 13 Pro',
        description: 'Used for 8 months, includes charger and case.',
        seller: {
          id: '104',
          name: 'Marcus Lee',
          avatar: 'https://i.pravatar.cc/300?img=3',
        },
        price: 650,
        category: 'Electronics',
        condition: 'Excellent',
        status: 'sold',
        createdAt: '2023-04-28T16:20:00Z',
      },
    ]);
  }, []);
  
  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Marketplace Listings</h3>
        <Button size="sm">Add Listing</Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Listed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredListings.length > 0 ? (
              filteredListings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{listing.title}</div>
                      <div className="text-xs text-gray-500">{listing.condition}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={listing.seller.avatar} alt={listing.seller.name} />
                        <AvatarFallback>{listing.seller.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{listing.seller.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center font-medium">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      {listing.price.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>{listing.category}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        listing.status === 'active' ? 'secondary' :
                        listing.status === 'pending' ? 'outline' :
                        listing.status === 'sold' ? 'default' : 'destructive'
                      }
                    >
                      {listing.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(listing.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Listing</DropdownMenuItem>
                        <DropdownMenuItem>Edit Listing</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {listing.status === 'active' ? (
                          <DropdownMenuItem>Mark as Sold</DropdownMenuItem>
                        ) : listing.status === 'pending' ? (
                          <DropdownMenuItem>Approve Listing</DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem className="text-red-600">Remove Listing</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  No listings found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ListingsList;
