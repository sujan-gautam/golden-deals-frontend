
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { ImageIcon, ShoppingBag, Calendar, Filter, TrendingUp, Clock, Sparkles, Zap, Megaphone, Rocket, StickyNote } from 'lucide-react';
import { usePosts } from "@/hooks/use-posts";
import { useAuth } from "@/hooks/use-auth";
import { idToString } from "@/types/post";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

const Feed = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [sortOption, setSortOption] = useState("latest");
  const { user } = useAuth();
  
  const {
    posts,
    isLoading,
    handleLikePost,
    handleCommentOnPost,
    handleCreatePost,
    handleSharePost,
    handleInterestedInEvent,
    isCreatingPost,
    setIsCreatingPost
  } = usePosts();
  
  // Apply sorting to posts
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortOption === "latest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortOption === "trending") {
      const aEngagement = (Array.isArray(a.likes) ? a.likes.length : 0) + a.comments + (a as any).shares || 0;
      const bEngagement = (Array.isArray(b.likes) ? b.likes.length : 0) + b.comments + (b as any).shares || 0;
      return bEngagement - aEngagement;
    }
    return 0;
  });
  
  const filteredPosts = activeTab === "all" 
    ? sortedPosts 
    : sortedPosts.filter(post => post.type === activeTab);

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <SocialLayout>
      <div className="max-w-5xl mx-auto w-full px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="hidden md:block">
            <div className="bg-white rounded-xl shadow p-4 mb-4 sticky top-20">
              <h3 className="text-lg font-semibold mb-3">Quick Access</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <TrendingUp className="mr-2 h-4 w-4 text-blue-500" />
                  Trending Topics
                </Button>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <ShoppingBag className="mr-2 h-4 w-4 text-green-500" />
                  Marketplace
                </Button>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                  Upcoming Events
                </Button>
              </div>
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-500 mb-2">SUGGESTED FOR YOU</h4>
                <div className="space-y-3">
                  {/* Suggested users/topics would go here */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>SG</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Science Group</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 rounded-full">Follow</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>AC</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Arts Club</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 rounded-full">Follow</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>TS</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Tech Society</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 rounded-full">Follow</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Feed */}
          <div className="md:col-span-2">
            {/* Stories Section */}
            <div className="mb-6">
              <StoriesSection />
            </div>
            
            {/* Create Post Card with completely new design */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 overflow-visible"
            >
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -right-10 top-10 w-20 h-20 bg-purple-400/20 rounded-full blur-xl"></div>
                <div className="absolute -left-10 -bottom-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl"></div>
                
                {/* Main hexagonal card with unique design */}
                <div className="relative">
                  {/* Hexagonal shape with clip path */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 shadow-lg overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full translate-x-10 -translate-y-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full -translate-x-10 translate-y-10"></div>
                    
                    {/* Sparkling dots */}
                    <div className="absolute top-8 right-8 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                    <div className="absolute top-20 right-20 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></div>
                    <div className="absolute bottom-12 left-12 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    
                    {/* Content area */}
                    <div className="relative">
                      <div className="mb-4 text-center">
                        <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                          Inspire the Community
                        </h3>
                        <p className="text-xs text-gray-500">What's your story today?</p>
                      </div>
                      
                      <div className="flex flex-col space-y-3" onClick={() => setIsCreatingPost(true)}>
                        <div className="group relative cursor-pointer">
                          <div className="h-20 bg-white/60 backdrop-blur-sm rounded-xl border border-indigo-100 focus-within:border-indigo-300 transition-all px-4 py-2 flex items-center justify-center">
                            <div className="text-center text-gray-400 group-hover:text-indigo-500 transition-colors">
                              <StickyNote className="h-6 w-6 mx-auto mb-1 opacity-70 group-hover:scale-110 transition-transform" />
                              <span className="text-sm">Express a thought or idea...</span>
                            </div>
                          </div>
                          
                          {/* Pulsing effect around the input */}
                          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-200/50 via-purple-200/50 to-pink-200/50 rounded-xl blur-md opacity-0 group-hover:opacity-70 transition-opacity"></div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <motion.button
                            whileHover={{ y: -3, boxShadow: "0 4px 6px rgba(37, 99, 235, 0.1)" }}
                            whileTap={{ y: 0 }}
                            className="rounded-xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 text-white py-3 px-2 flex flex-col items-center justify-center text-xs shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsCreatingPost(true);
                            }}
                          >
                            <Megaphone className="h-5 w-5 mb-1" />
                            <span>Post</span>
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ y: -3, boxShadow: "0 4px 6px rgba(16, 185, 129, 0.1)" }}
                            whileTap={{ y: 0 }}
                            className="rounded-xl bg-gradient-to-br from-emerald-500/90 to-emerald-600/90 text-white py-3 px-2 flex flex-col items-center justify-center text-xs shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsCreatingPost(true);
                            }}
                          >
                            <ShoppingBag className="h-5 w-5 mb-1" />
                            <span>Product</span>
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ y: -3, boxShadow: "0 4px 6px rgba(168, 85, 247, 0.1)" }}
                            whileTap={{ y: 0 }}
                            className="rounded-xl bg-gradient-to-br from-purple-500/90 to-purple-600/90 text-white py-3 px-2 flex flex-col items-center justify-center text-xs shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsCreatingPost(true);
                            }}
                          >
                            <Calendar className="h-5 w-5 mb-1" />
                            <span>Event</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feed Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
              <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all" className="rounded-md">All</TabsTrigger>
                  <TabsTrigger value="post" className="rounded-md">Posts</TabsTrigger>
                  <TabsTrigger value="product" className="rounded-md">Products</TabsTrigger>
                  <TabsTrigger value="event" className="rounded-md">Events</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex items-center bg-white border rounded-lg overflow-hidden">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`flex items-center px-3 py-2 ${sortOption === 'latest' ? 'bg-gray-100' : ''}`}
                  onClick={() => setSortOption('latest')}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Latest
                </Button>
                <div className="h-6 w-px bg-gray-200"></div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`flex items-center px-3 py-2 ${sortOption === 'trending' ? 'bg-gray-100' : ''}`}
                  onClick={() => setSortOption('trending')}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Trending
                </Button>
              </div>
            </div>

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
              <motion.div 
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => {
                    const postId = idToString(post._id);
                    const isLiked = Array.isArray(post.likes) && user?._id ? post.likes.includes(user._id as string) : false;
                    const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;
                    let isInterested = false;
                    let interestedCount = 0;
                    
                    if (post.type === 'event') {
                      const eventPost = post as any;
                      isInterested = Array.isArray(eventPost.interested) && user?._id 
                        ? eventPost.interested.includes(user._id as string) 
                        : false;
                      interestedCount = Array.isArray(eventPost.interested) 
                        ? eventPost.interested.length 
                        : 0;
                    }
                    
                    return (
                      <motion.div key={postId} variants={itemVariants}>
                        <PostTypeDisplay
                          post={{
                            ...post,
                            likes: likesCount,
                            liked: isLiked,
                            shares: (post as any).shares || 0,
                            ...(post.type === 'event' ? {
                              interested: interestedCount,
                              isInterested: isInterested
                            } : {})
                          }}
                          onLike={() => handleLikePost(postId)}
                          onComment={(content) => {
                            if (content) {
                              handleCommentOnPost(postId, content);
                            }
                          }}
                          onShare={() => handleSharePost(postId)}
                          onInterested={post.type === 'event' ? () => handleInterestedInEvent(postId) : undefined}
                          currentUser={user}
                        />
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Filter className="text-gray-400 h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No posts to display</h3>
                    <p className="text-gray-500">
                      No {activeTab === 'all' ? 'posts' : activeTab + 's'} available with the current filters.
                    </p>
                    <Button 
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsCreatingPost(true)}
                    >
                      Create your first {activeTab === 'all' ? 'post' : activeTab}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
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
