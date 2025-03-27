
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SocialLayout from "@/components/layout/SocialLayout";
import CreatePostModal from "@/components/social/CreatePostModal";
import PostTypeDisplay from "@/components/social/PostTypeDisplay";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ImageIcon, ShoppingBag, Calendar } from "lucide-react";
import { Post } from "@/types/post";
import { useAuth } from "@/hooks/use-auth";
import { getPosts, createPost, likePost, commentOnPost } from "@/services/api";

const Feed = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data || []); // Ensure we have an array even if data is undefined
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to load posts",
          variant: "destructive",
        });
        setPosts([]); // Set empty array on error to prevent crashes
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, [toast]);

  const handleLikePost = async (postId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await likePost(postId);
      
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post._id?.toString() === postId) {
            // Ensure post.likes is an array before checking includes
            const likes = Array.isArray(post.likes) ? post.likes : [];
            const userId = user?._id as string;
            const currentUserLiked = likes.includes(userId);
            
            return {
              ...post,
              likes: currentUserLiked
                ? likes.filter(id => id !== userId)
                : [...likes, userId]
            };
          }
          return post;
        })
      );
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const handleCreatePost = async (newPostData: any) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create posts",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newPost = await createPost(newPostData);
      setPosts([newPost, ...posts]);
      setIsCreatePostOpen(false);
      
      toast({
        title: "Post created!",
        description: "Your post has been published.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const handleComment = async (postId: string, content: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await commentOnPost(postId, content);
      
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post._id?.toString() === postId) {
            return {
              ...post,
              comments: post.comments + 1
            };
          }
          return post;
        })
      );
      
      toast({
        title: "Comment added",
        description: "Your comment has been added to the post.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const filteredPosts = activeTab === "all" 
    ? posts 
    : posts.filter(post => post.type === activeTab);

  return (
    <SocialLayout>
      <div className="max-w-xl mx-auto w-full px-4">
        {/* Create Post Card */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
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
        {isLoading ? (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow animate-pulse">
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="mt-4 h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostTypeDisplay
                  key={post._id?.toString()}
                  post={{
                    ...post,
                    likes: Array.isArray(post.likes) ? post.likes.length : 0,
                    liked: Array.isArray(post.likes) && user?._id ? post.likes.includes(user._id as string) : false
                  }}
                  onLike={() => handleLikePost(post._id as string)}
                  onComment={(content) => {
                    if (content) {
                      handleComment(post._id as string, content);
                    }
                  }}
                  currentUser={user}
                />
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                No {activeTab === 'all' ? 'posts' : activeTab + 's'} to display.
                <p className="mt-2">Create your first {activeTab === 'all' ? 'post' : activeTab} by clicking on the box above!</p>
              </div>
            )}
          </>
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
