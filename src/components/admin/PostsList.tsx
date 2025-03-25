
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
import { MoreHorizontal, Check, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Post {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  status: string;
  reports: number;
  createdAt: string;
}

interface PostsListProps {
  searchQuery: string;
}

const PostsList = ({ searchQuery }: PostsListProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll create mock data
    setPosts([
      {
        id: '1',
        content: 'Just aced my final exam! So happy to be done with this semester. Who's up for celebrating tonight? 🎉',
        user: {
          id: '101',
          name: 'Sarah Johnson',
          avatar: 'https://i.pravatar.cc/300?img=1',
        },
        status: 'published',
        reports: 0,
        createdAt: '2023-05-18T14:22:30Z',
      },
      {
        id: '2',
        content: 'Looking for teammates for the upcoming hackathon! I need 2 more developers and a designer. DM if interested! #hackathon #teambuilding',
        user: {
          id: '102',
          name: 'Marcus Lee',
          avatar: 'https://i.pravatar.cc/300?img=3',
        },
        status: 'published',
        reports: 0,
        createdAt: '2023-05-18T10:15:00Z',
      },
      {
        id: '3',
        content: 'Selling my physics textbook from last semester. Perfect condition, no highlights. $40 or best offer. Pickup on campus.',
        user: {
          id: '103',
          name: 'Taylor Wilson',
          avatar: 'https://i.pravatar.cc/300?img=5',
        },
        status: 'published',
        reports: 0,
        createdAt: '2023-05-17T21:30:00Z',
      },
      {
        id: '4',
        content: 'This is spam content that violates community guidelines...',
        user: {
          id: '104',
          name: 'Spam User',
          avatar: 'https://i.pravatar.cc/300?img=20',
        },
        status: 'flagged',
        reports: 5,
        createdAt: '2023-05-16T18:45:00Z',
      },
      {
        id: '5',
        content: 'Check out my new website! Link in bio.',
        user: {
          id: '105',
          name: 'James Wilson',
          avatar: 'https://i.pravatar.cc/300?img=11',
        },
        status: 'published',
        reports: 1,
        createdAt: '2023-05-15T09:10:00Z',
      },
    ]);
  }, []);
  
  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const truncateContent = (content: string, maxLength: number = 60) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Posts</h3>
        <Button size="sm">Create Post</Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reports</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="max-w-xs">{truncateContent(post.content)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.user.avatar} alt={post.user.name} />
                        <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{post.user.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.status === 'published' ? 'secondary' : 'destructive'}>
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {post.reports > 0 ? (
                      <div className="flex items-center text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {post.reports}
                      </div>
                    ) : (
                      <div className="flex items-center text-green-500">
                        <Check className="h-4 w-4 mr-1" />
                        None
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(post.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Post</DropdownMenuItem>
                        <DropdownMenuItem>Edit Post</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {post.status === 'published' ? (
                          <DropdownMenuItem className="text-red-600">Unpublish Post</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">Publish Post</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">Delete Post</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                  No posts found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PostsList;
