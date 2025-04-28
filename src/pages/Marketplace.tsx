import React, { useState, useMemo } from 'react';
import SocialLayout from '@/components/layout/SocialLayout';
import PostTypeDisplay from '@/components/social/PostTypeDisplay';
import CreatePostModal from '@/components/social/CreatePostModal';
import AuthModal from '@/components/auth/AuthModal';
import { usePosts } from '@/hooks/use-posts';
import { useAuth } from '@/hooks/use-auth';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, SlidersHorizontal, PlusIcon, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const Marketplace = () => {
  const { toast } = useToast();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'price-asc' | 'price-desc'>('newest');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const {
    posts,
    isLoading,
    handleLikePost,
    handleCommentOnPost,
    handleSharePost,
    handleDeletePost,
    handleEditPost,
    handleCreatePost,
  } = usePosts(undefined, () => setIsAuthModalOpen(true));

  // Extract unique categories with product counts
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    posts
      .filter(post => post.type === 'product' && post.category)
      .forEach(post => {
        const category = post.category!.toLowerCase();
        counts[category] = (counts[category] || 0) + 1;
      });
    return counts;
  }, [posts]);

  // Get unique, sorted categories for dropdown
  const categories = useMemo(() => {
    return Object.keys(categoryCounts).sort((a, b) => a.localeCompare(b));
  }, [categoryCounts]);

  // Get top 4 categories sorted by count (descending)
  const topCategories = useMemo(() => {
    return Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [categoryCounts]);

  const filteredProducts = useMemo(() => {
    let filtered = posts.filter(post => post.type === 'product');

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        (post.title?.toLowerCase().includes(query) || false) ||
        post.content.toLowerCase().includes(query) ||
        (post.category?.toLowerCase().includes(query) || false)
      );
    }

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        default:
          return 0;
      }
    });
  }, [posts, selectedCategory, searchQuery, sortOption]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const handleCreateListingClick = () => {
    if (isAuthenticated) {
      setIsCreatingPost(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <SocialLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Campus Marketplace</h1>
            <p className="text-gray-600">Buy and sell items within the campus community</p>
          </div>
          <Button
            className="mt-4 sm:mt-0 bg-usm-gold text-black hover:bg-amber-600"
            onClick={handleCreateListingClick}
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Create Listing
          </Button>
        </div>

        {topCategories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {topCategories.map(({ name, count }) => (
              <div
                key={name}
                onClick={() => setSelectedCategory(name)}
                className="bg-white rounded-lg p-4 text-center shadow-sm border cursor-pointer hover:border-usm-gold transition-colors"
              >
                <div className="bg-amber-50 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-medium capitalize">{name}</h3>
                <p className="text-sm text-gray-500 mt-1">{count} items</p>
              </div>
            ))}
          </div>
        )}

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search marketplace..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)} ({categoryCounts[category]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => setSortOption(value as any)}>
                  <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price-asc">Price: Low to High</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price-desc">Price: High to Low</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {(selectedCategory !== 'all' || searchQuery) && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="py-1 px-3">
                  Category: {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                  <button className="ml-2 text-gray-500 hover:text-gray-700" onClick={() => setSelectedCategory('all')}>
                    ×
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="py-1 px-3">
                  Search: {searchQuery}
                  <button className="ml-2 text-gray-500 hover:text-gray-700" onClick={() => setSearchQuery('')}>
                    ×
                  </button>
                </Badge>
              )}
              {(selectedCategory !== 'all' || searchQuery) && (
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse p-4">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {selectedCategory !== 'all' || searchQuery
                ? "Try adjusting your filters to see more products."
                : "There are no products listed at this time."}
            </p>
            {(selectedCategory !== 'all' || searchQuery) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredProducts.map((product) => {
              // Validate and normalize product data
              if (!product._id || !product.title) {
                console.warn('Invalid product data:', product);
                return null; // Skip invalid products
              }

              const postId = product._id.toString();
              const userId = currentUser?.id?.toString() || '';
              const likesArray = Array.isArray(product.likes) ? product.likes.map((item: any) =>
                typeof item === 'object' && item !== null ? item._id?.toString() || item.id?.toString() : item?.toString()
              ).filter(Boolean) : [];
              const likesCount = likesArray.length;
              const isLiked = userId && likesArray.includes(userId);

              // Normalize user data
              const user = product.user || {
                _id: product.userId || 'unknown',
                username: 'Unknown User',
                avatar: null,
                firstname: '',
                lastname: '',
              };

              // Normalize image data
              const image = typeof product.image === 'object' && product.image?.path
                ? { path: product.image.path, filename: product.image.filename, mimetype: product.image.mimetype }
                : product.image || null;

              return (
                <motion.div key={postId} variants={itemVariants}>
                  <PostTypeDisplay
                    post={{
                      ...product,
                      _id: postId,
                      user_id: product.userId || user._id,
                      user,
                      content: product.content || '',
                      title: product.title || 'Untitled Product',
                      price: product.price ?? null,
                      category: product.category || '',
                      condition: product.condition || '',
                      status: product.status || 'instock',
                      image,
                      likes: likesCount,
                      liked: isLiked,
                      shares: product.shares || 0,
                      comments: Array.isArray(product.comments) ? product.comments : [],
                      type: 'product',
                      createdAt: product.createdAt || new Date().toISOString(),
                      updatedAt: product.updatedAt || product.createdAt || new Date().toISOString(),
                    }}
                    onLike={() => handleLikePost(postId)}
                    onComment={(content) => content && handleCommentOnPost(postId, content)}
                    onShare={() => handleSharePost(postId)}
                    onRestrictedAction={() => setIsAuthModalOpen(true)}
                    currentUser={currentUser}
                    onDelete={currentUser && (product.userId === userId || user._id === userId) ? () => handleDeletePost(postId) : undefined}
                    onEdit={currentUser && (product.userId === userId || user._id === userId) ? (postId, updatedPost) => handleEditPost(postId, {
                      ...updatedPost,
                      type: 'product',
                      content: updatedPost.content || product.content || '',
                      title: updatedPost.title || product.title || 'Untitled Product',
                      price: updatedPost.price ?? product.price ?? null,
                      category: updatedPost.category || product.category || '',
                      condition: updatedPost.condition || product.condition || '',
                      status: updatedPost.status || product.status || 'instock',
                    }) : undefined}
                  />
                </motion.div>
              );
            }).filter(Boolean)} {/* Filter out null entries */}
          </motion.div>
        )}
      </div>

      <CreatePostModal
        isOpen={isCreatingPost}
        onClose={() => setIsCreatingPost(false)}
        onSubmit={(data) => {
          handleCreatePost(data);
          setIsCreatingPost(false);
        }}
        initialType="product"
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        message="Please sign in to create a listing."
      />
    </SocialLayout>
  );
};

export default Marketplace;