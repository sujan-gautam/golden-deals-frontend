
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { usePosts } from "@/hooks/use-posts";
import { useAuth } from "@/hooks/use-auth";
import { idToString } from "@/types/post";

const Feed = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();
  
  const {
    posts,
    isLoading,
    handleLikePost,
    handleCommentOnPost,
    handleCreatePost,
    isCreatingPost,
    setIsCreatingPost
  } = usePosts();
  
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
              onClick={() => setIsCreatingPost(true)}
            >
              What's on your mind?
            </Button>
          </div>
          <div className="flex mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              className="flex-1 text-gray-500"
              onClick={() => setIsCreatingPost(true)}
            >
              <ImageIcon className="mr-2 h-5 w-5" />
              Photo
            </Button>
            <Button
              variant="ghost"
              className="flex-1 text-gray-500"
              onClick={() => setIsCreatingPost(true)}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Product
            </Button>
            <Button
              variant="ghost"
              className="flex-1 text-gray-500"
              onClick={() => setIsCreatingPost(true)}
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
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow animate-pulse">
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
            ))}
          </div>
        ) : (
          <>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostTypeDisplay
                  key={idToString(post._id)}
                  post={{
                    ...post,
                    likes: Array.isArray(post.likes) ? post.likes.length : 0,
                    liked: Array.isArray(post.likes) && user?._id ? post.likes.includes(user._id as string) : false
                  }}
                  onLike={() => handleLikePost(idToString(post._id))}
                  onComment={(content) => {
                    if (content) {
                      handleCommentOnPost(idToString(post._id), content);
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
        isOpen={isCreatingPost}
        onClose={() => setIsCreatingPost(false)}
        onSubmit={handleCreatePost}
      />
    </SocialLayout>
  );
};

export default Feed;
