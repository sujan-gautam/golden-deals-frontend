import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SocialLayout from "@/components/layout/SocialLayout";
import CreatePostModal from "@/components/social/CreatePostModal";
import PostTypeDisplay from "@/components/social/PostTypeDisplay";
import StoriesSection from "@/components/social/StoriesSection";
import AuthModal from "@/components/auth/AuthModal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Calendar, Filter, TrendingUp, Clock, StickyNote, Megaphone, Bookmark  } from "lucide-react";
import { usePosts } from "@/hooks/use-posts";
import { idToString } from "@/types/post";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

type FeedTab = "all" | "post" | "product" | "event";
type SortOption = "latest" | "trending";

const Feed: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FeedTab>("all");
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<"post" | "product" | "event">("post");
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: isLoadingUser } = useAuth();
  const {
    posts,
    isLoading,
    refetch,
    handleLikePost,
    handleCommentOnPost,
    handleCreatePost,
    handleSharePost,
    handleInterestedInEvent,
    handleDeletePost,
  } = usePosts(undefined, () => setIsAuthModalOpen(true));

  useEffect(() => {
    if (!isLoadingUser && isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated, isLoadingUser, refetch]);

  useEffect(() => {
    if (activeTab === "event" && !isLoading && posts.filter((post) => post.type === "event").length === 0) {
      refetch();
    }
  }, [activeTab, posts, isLoading, refetch]);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      if (sortOption === "latest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        const aEngagement = (Array.isArray(a.likes) ? a.likes.length : a.likes || 0) + (a.comments?.length || 0) + (a.shares || 0);
        const bEngagement = (Array.isArray(b.likes) ? b.likes.length : b.likes || 0) + (b.comments?.length || 0) + (b.shares || 0);
        return bEngagement - aEngagement;
      }
    });
  }, [posts, sortOption]);

  const filteredPosts = useMemo(() => {
    return activeTab === "all" ? sortedPosts : sortedPosts.filter((post) => post.type === activeTab);
  }, [sortedPosts, activeTab]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const handleOpenModal = (type: "post" | "product" | "event") => {
    if (isAuthenticated) {
      setModalInitialType(type);
      setIsCreatingPost(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleTrendingTopics = () => {
    setSortOption("trending");
    setActiveTab("all");
  };

  if (isLoadingUser) {
    return (
      <SocialLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-8 w-8 text-gray-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-gray-600">Loading feed...</span>
          </div>
        </div>
      </SocialLayout>
    );
  }

  return (
    <SocialLayout>
      <div className="max-w-5xl mx-auto w-full px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hidden md:block">
            <div className="bg-white rounded-xl shadow p-4 mb-4 sticky top-20">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Quick Access</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal hover:bg-usm-gold/10 hover:text-usm-gold"
                  onClick={handleTrendingTopics}
                >
                  <TrendingUp className="mr-2 h-4 w-4 text-blue-500" />
                  Trending Topics
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal hover:bg-usm-gold/10 hover:text-usm-gold"
                  onClick={() => navigate("/marketplace")}
                >
                  <ShoppingBag className="mr-2 h-4 w-4 text-green-500" />
                  Marketplace
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal hover:bg-usm-gold/10 hover:text-usm-gold"
                  onClick={() => navigate("/events")}
                >
                  <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                  New Events
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal hover:bg-usm-gold/10 hover:text-usm-gold"
                  onClick={() => navigate("/saved")}
                >
                  <Bookmark className="mr-2 h-4 w-4 text-orange-500" />
                  Saved Items
                </Button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <StoriesSection className="mb-6" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-800">What's on your mind?</h3>
                  <p className="text-xs text-gray-500">Share with the community</p>
                </div>
                <div className="flex flex-col space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-gray-600 hover:text-usm-gold hover:bg-gray-50"
                    onClick={() => handleOpenModal("post")}
                  >
                    <StickyNote className="mr-2 h-5 w-5" />
                    Write a post...
                  </Button>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => handleOpenModal("post")}
                    >
                      <Megaphone className="mr-2 h-4 w-4" />
                      Post
                    </Button>
                    <Button
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      onClick={() => handleOpenModal("product")}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Product
                    </Button>
                    <Button
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                      onClick={() => handleOpenModal("event")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Event
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FeedTab)} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-4 w-full bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="post" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Posts
                  </TabsTrigger>
                  <TabsTrigger value="product" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Products
                  </TabsTrigger>
                  <TabsTrigger value="event" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Events
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center bg-white border rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-2 ${sortOption === "latest" ? "bg-usm-gold/10 text-usm-gold" : ""}`}
                  onClick={() => setSortOption("latest")}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Latest
                </Button>
                <div className="h-6 w-px bg-gray-200" />
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-2 ${sortOption === "trending" ? "bg-usm-gold/10 text-usm-gold" : ""}`}
                  onClick={() => setSortOption("trending")}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Trending
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow animate-pulse p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                    <div className="mt-4 h-24 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => {
                    const postId = idToString(post._id);
                    const userId = user?.id?.toString();
                    const likesArray = Array.isArray(post.likes)
                      ? post.likes.map((item) =>
                          typeof item === "object" && item !== null
                            ? item._id?.toString() || item.id?.toString()
                            : item?.toString()
                        ).filter(Boolean)
                      : [];
                    const interestedArray =
                      post.type === "event" && Array.isArray(post.interested)
                        ? post.interested
                            .map((item) =>
                              typeof item === "object" && item !== null
                                ? item._id?.toString() || item.id?.toString()
                                : item?.toString()
                            )
                            .filter(Boolean)
                        : [];
                    const likesCount = typeof post.likes === "number" ? post.likes : likesArray.length;
                    const interestedCount = typeof post.interested === "number" ? post.interested : interestedArray.length;
                    const isLiked = userId && (typeof post.liked === "boolean" ? post.liked : likesArray.includes(userId));
                    const isInterested = userId && post.type === "event" && (typeof post.isInterested === "boolean" ? post.isInterested : interestedArray.includes(userId));

                    const normalizedPost = {
                      _id: postId,
                      type: post.type,
                      user_id: post.userId || post.user?._id || userId || "",
                      user: post.user || {
                        _id: userId || "unknown",
                        name: user?.username || "Unknown User",
                        avatar: user?.avatar || "",
                      },
                      content: post.content || post.description || post.event_details || "",
                      image: post.image,
                      likes: likesCount,
                      liked: isLiked,
                      shares: post.shares || 0,
                      comments: post.comments || [],
                      createdAt: post.createdAt || new Date().toISOString(),
                      updatedAt: post.updatedAt || new Date().toISOString(),
                      ...(post.type === "product" && {
                        title: post.title || "Untitled",
                        price: post.price || 0,
                        category: post.category || "",
                        condition: post.condition || "new",
                        status: post.status || "instock",
                      }),
                      ...(post.type === "event" && {
                        event_title: post.event_title || "Untitled Event",
                        event_date: post.event_date || new Date().toISOString(),
                        event_location: post.event_location || "Unknown Location",
                        interested: interestedCount,
                        isInterested: isInterested,
                      }),
                    };

                    return (
                      <motion.div key={postId} variants={itemVariants}>
                        <PostTypeDisplay
                          post={normalizedPost}
                          onLike={() => handleLikePost(postId)}
                          onComment={(content) => content && handleCommentOnPost(postId, content)}
                          onShare={() => handleSharePost(postId)}
                          onInterested={post.type === "event" ? () => handleInterestedInEvent(postId) : undefined}
                          currentUser={user}
                          onDelete={() => handleDeletePost(postId)}
                        />
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <Filter className="text-gray-400 h-8 w-8 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No {activeTab === "all" ? "posts" : activeTab + "s"} yet</h3>
                    <p className="text-gray-500 mb-4">Be the first to share something with the community!</p>
                    <Button
                      onClick={() => handleOpenModal(activeTab === "all" ? "post" : activeTab)}
                      className="bg-usm-gold hover:bg-amber-600 text-black"
                    >
                      Create a {activeTab === "all" ? "post" : activeTab}
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
        onSubmit={(data) => {
          handleCreatePost(data);
          setIsCreatingPost(false);
        }}
        initialType={modalInitialType}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        message="Please sign in to create a post, product, or event."
      />
    </SocialLayout>
  );
};

export default Feed;