
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SocialLayout from "@/components/layout/SocialLayout";
import CreatePostModal from "@/components/social/CreatePostModal";
import PostTypeDisplay from "@/components/social/PostTypeDisplay";
import StoriesSection from "@/components/social/StoriesSection";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ImageIcon, ShoppingBag, Calendar } from "lucide-react";

interface BasePost {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  image?: string;
  likes: number;
  liked: boolean;
  comments: number;
  createdAt: string;
  type: string;
}

interface ProductPost extends BasePost {
  type: 'product';
  productName: string;
  price: string;
  category?: string;
  condition?: string;
  status: 'instock' | 'lowstock' | 'soldout';
}

interface EventPost extends BasePost {
  type: 'event';
  title: string;
  date: string;
  location: string;
}

type Post = BasePost | ProductPost | EventPost;

const Feed = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  
  useEffect(() => {
    // In a real app, this would fetch posts from your backend
    // For now, we'll create some dummy data with different post types
    setPosts([
      {
        id: "1",
        type: "post",
        user: {
          id: "101",
          name: "Sarah Johnson",
          avatar: "https://i.pravatar.cc/300?img=1",
        },
        content:
          "Just aced my final exam! So happy to be done with this semester. Who\u2019s up for celebrating tonight? 🎉",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2069&auto=format&fit=crop",
        likes: 24,
        liked: false,
        comments: 5,
        createdAt: "2023-05-18T14:22:30Z",
      },
      {
        id: "2",
        type: "post",
        user: {
          id: "102",
          name: "Marcus Lee",
          avatar: "https://i.pravatar.cc/300?img=3",
        },
        content:
          "Looking for teammates for the upcoming hackathon! I need 2 more developers and a designer. DM if interested! #hackathon #teambuilding",
        likes: 12,
        liked: true,
        comments: 8,
        createdAt: "2023-05-18T10:15:00Z",
      },
      {
        id: "3",
        type: "product",
        user: {
          id: "103",
          name: "Taylor Wilson",
          avatar: "https://i.pravatar.cc/300?img=5",
        },
        productName: "Physics Textbook",
        price: "40",
        condition: "Like New",
        category: "Books",
        status: "instock",
        content:
          "Selling my physics textbook from last semester. Perfect condition, no highlights or notes.",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1974&auto=format&fit=crop",
        likes: 8,
        liked: false,
        comments: 3,
        createdAt: "2023-05-17T21:30:00Z",
      },
      {
        id: "4",
        type: "event",
        user: {
          id: "104",
          name: "Jamie Rodriguez",
          avatar: "https://i.pravatar.cc/300?img=10",
        },
        title: "Campus Music Festival",
        date: "2023-06-15T18:00:00Z",
        location: "Main Quad",
        content:
          "Don't miss our annual campus music festival! We've got great local bands, food trucks, and more. Bring your friends!",
        image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop",
        likes: 42,
        liked: false,
        comments: 12,
        createdAt: "2023-05-16T09:45:00Z",
      },
      {
        id: "5",
        type: "product",
        user: {
          id: "105",
          name: "Alex Chen",
          avatar: "https://i.pravatar.cc/300?img=12",
        },
        productName: "Mountain Bike",
        price: "350",
        condition: "Good",
        category: "Sports",
        status: "instock",
        content:
          "Selling my mountain bike. In good condition, recently tuned up. Perfect for trails around campus!",
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop",
        likes: 15,
        liked: false,
        comments: 7,
        createdAt: "2023-05-15T16:20:00Z",
      },
    ]);
  }, []);

  const handleLikePost = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const newLiked = !post.liked;
          return {
            ...post,
            liked: newLiked,
            likes: newLiked ? post.likes + 1 : post.likes - 1,
          };
        }
        return post;
      })
    );
  };

  const handleCreatePost = (newPost: any) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    const post: Post = {
      id: Date.now().toString(),
      user: {
        id: user.id || "anonymous",
        name: user.name || "Anonymous User",
        avatar: user.avatar || "https://i.pravatar.cc/300?img=68",
      },
      type: newPost.type || "post",
      content: newPost.content || newPost.description || "",
      image: newPost.image,
      likes: 0,
      liked: false,
      comments: 0,
      createdAt: new Date().toISOString(),
      ...newPost
    };

    setPosts([post, ...posts]);
    setIsCreatePostOpen(false);
    toast({
      title: "Post created!",
      description: "Your post has been published.",
    });
  };

  const handleComment = (postId: string) => {
    // Find the post and increase comment count for demo
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1,
          };
        }
        return post;
      })
    );
    
    toast({
      title: "Comment added",
      description: "Your comment has been added to the post.",
    });
  };

  const filteredPosts = activeTab === "all" 
    ? posts 
    : posts.filter(post => post.type === activeTab);

  return (
    <SocialLayout>
      <div className="max-w-xl mx-auto w-full px-4">
        {/* Stories Section */}
        <StoriesSection />
        
        {/* Create Post Card */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={JSON.parse(localStorage.getItem("user") || "{}").avatar} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              className="flex-grow text-left justify-start text-gray-500 font-normal h-11"
              onClick={() => setIsCreatePostOpen(true)}
            >
              What's on your mind?
            </Button>
          </div>
          <div className="flex mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              className="flex-1 text-gray-500"
              onClick={() => setIsCreatePostOpen(true)}
            >
              <ImageIcon className="mr-2 h-5 w-5" />
              Photo
            </Button>
            <Button
              variant="ghost"
              className="flex-1 text-gray-500"
              onClick={() => setIsCreatePostOpen(true)}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Product
            </Button>
            <Button
              variant="ghost"
              className="flex-1 text-gray-500"
              onClick={() => setIsCreatePostOpen(true)}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Event
            </Button>
          </div>
        </div>

        {/* Tabs for filtering post types */}
        <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="post">Posts</TabsTrigger>
            <TabsTrigger value="product">Products</TabsTrigger>
            <TabsTrigger value="event">Events</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Posts Feed */}
        {filteredPosts.map((post) => (
          <PostTypeDisplay
            key={post.id}
            post={post}
            onLike={() => handleLikePost(post.id)}
            onComment={() => handleComment(post.id)}
          />
        ))}
        
        {filteredPosts.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No {activeTab === 'all' ? 'posts' : activeTab + 's'} to display
          </div>
        )}
      </div>

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmit={handleCreatePost}
      />
    </SocialLayout>
  );
};

export default Feed;
