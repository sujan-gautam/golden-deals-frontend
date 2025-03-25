
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SocialLayout from "@/components/layout/SocialLayout";
import PostCard from "@/components/social/PostCard";
import CreatePostModal from "@/components/social/CreatePostModal";

interface Post {
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
}

const Feed = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, this would fetch posts from your backend
    // For now, we'll create some dummy data
    setPosts([
      {
        id: "1",
        user: {
          id: "101",
          name: "Sarah Johnson",
          avatar: "https://i.pravatar.cc/300?img=1",
        },
        content:
          "Just aced my final exam! So happy to be done with this semester. Who's up for celebrating tonight? 🎉",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2069&auto=format&fit=crop",
        likes: 24,
        liked: false,
        comments: 5,
        createdAt: "2023-05-18T14:22:30Z",
      },
      {
        id: "2",
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
        user: {
          id: "103",
          name: "Taylor Wilson",
          avatar: "https://i.pravatar.cc/300?img=5",
        },
        content:
          "Selling my physics textbook from last semester. Perfect condition, no highlights. $40 or best offer. Pickup on campus.",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1974&auto=format&fit=crop",
        likes: 8,
        liked: false,
        comments: 3,
        createdAt: "2023-05-17T21:30:00Z",
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

  const handleCreatePost = (newPost: {
    content: string;
    image?: string;
  }) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    const post: Post = {
      id: Date.now().toString(),
      user: {
        id: user.id || "anonymous",
        name: user.name || "Anonymous User",
        avatar: user.avatar || "https://i.pravatar.cc/300?img=68",
      },
      content: newPost.content,
      image: newPost.image,
      likes: 0,
      liked: false,
      comments: 0,
      createdAt: new Date().toISOString(),
    };

    setPosts([post, ...posts]);
    setIsCreatePostOpen(false);
    toast({
      title: "Post created!",
      description: "Your post has been published.",
    });
  };

  return (
    <SocialLayout>
      <div className="max-w-xl mx-auto w-full px-4">
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex items-center space-x-3">
            {/* Get user from localStorage for the avatar */}
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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              Photo
            </Button>
            <Button
              variant="ghost"
              className="flex-1 text-gray-500"
              onClick={() => setIsCreatePostOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              Video
            </Button>
            <Button
              variant="ghost"
              className="flex-1 text-gray-500"
              onClick={() => setIsCreatePostOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Event
            </Button>
          </div>
        </div>

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => handleLikePost(post.id)}
          />
        ))}
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
