// SearchPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, Calendar, DollarSign, MapPin, Package } from 'lucide-react';
import SocialLayout from '@/components/layout/SocialLayout';
import PostTypeDisplay from '@/components/social/PostTypeDisplay';
import { useSearch } from '@/hooks/use-search';
import { usePosts } from '@/hooks/use-posts';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

// Define the backend base URL
const BASE_URL = import.meta.env.VITE_IMAGE_URL;

const SearchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { handleLikePost, handleCommentOnPost, handleSharePost, handleInterestedInEvent, handleDeletePost } = usePosts(
    undefined,
    () => navigate('/login')
  );
  const {
    searchQuery,
    setSearchQuery,
    advancedFilters,
    setAdvancedFilters,
    results,
    isLoading,
    isFetching,
    handleSearch,
    clearSearch,
  } = useSearch(new URLSearchParams(location.search).get('q') || '');

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('q') || '';
    if (query && query !== searchQuery && !hasSearched) {
      setSearchQuery(query);
      setLocalQuery(query);
      handleSearch(query);
      setHasSearched(true);
    }
  }, [location.search, setSearchQuery, handleSearch, searchQuery, hasSearched]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(localQuery)}`);
      handleSearch(localQuery, advancedFilters);
      setHasSearched(true);
    }
  };

  const handleAdvancedSearch = () => {
    handleSearch(localQuery, advancedFilters);
    setHasSearched(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const renderUserResult = (userResult: any) => {
    if (!userResult || !userResult._id) return null;

    const avatarPath = userResult.avatar || '';
    const avatarUrl = avatarPath
      ? avatarPath.startsWith('http')
        ? avatarPath
        : `${BASE_URL}${avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`}`
      : '/default-avatar.jpg';

    return (
      <motion.div key={userResult._id} variants={itemVariants}>
        <Card className="p-4 flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={avatarUrl}
              alt={userResult.username || 'User avatar'}
              onError={(e) => {
                e.currentTarget.src = '/default-avatar.jpg';
              }}
            />
            <AvatarFallback>{userResult.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <Link to={`/profile/${userResult._id}`} className="font-semibold text-gray-900 hover:underline">
              {userResult.username || 'Unknown User'}
            </Link>
            <p className="text-sm text-gray-500">
              {userResult.firstname || ''} {userResult.lastname || ''}
            </p>
            <p className="text-sm text-gray-500">{userResult.bio || ''}</p>
          </div>
        </Card>
      </motion.div>
    );
  };

  const renderPostResult = (post: any, category: 'posts' | 'products' | 'events') => {
    const postId = post._id;
    const userId = user?.id?.toString();

    const normalizedUserId = post.user_id?._id || post.user_id || post.user?._id || 'unknown';
    const normalizedUserName = post.user_id?.username || post.user?.name || 'Unknown User';
    const normalizedUserAvatar = post.user_id?.avatar || post.user?.avatar || '';

    // Determine post type based on category
    const validTypes = ['post', 'product', 'event'];
    let postType: 'post' | 'product' | 'event';
    switch (category) {
      case 'posts':
        postType = 'post';
        break;
      case 'products':
        postType = 'product';
        break;
      case 'events':
        postType = 'event';
        break;
      default:
        postType = post.type?.toLowerCase() && validTypes.includes(post.type.toLowerCase())
          ? post.type.toLowerCase()
          : 'post';
    }

    // Override with post.type if valid
    if (post.type?.toLowerCase() && validTypes.includes(post.type.toLowerCase())) {
      postType = post.type.toLowerCase() as 'post' | 'product' | 'event';
    }

    const normalizedPost = {
      ...post,
      type: postType,
      user: {
        _id: normalizedUserId,
        name: normalizedUserName,
        avatar: normalizedUserAvatar,
      },
      content: post.content || post.description || post.event_details || '',
      likes: Array.isArray(post.likes) ? post.likes.length : post.likes || 0,
      liked: userId && (post.liked || (Array.isArray(post.likes) && post.likes.includes(userId))) || false,
      shares: post.shares || 0,
      comments: post.comments || [],
      createdAt: post.createdAt || new Date().toISOString(),
      updatedAt: post.updatedAt || new Date().toISOString(),
      ...(postType === 'product' && {
        title: post.title || 'Untitled',
        price: post.price || 0,
        category: post.category || '',
        condition: post.condition || 'new',
        status: post.status || 'instock',
      }),
      ...(postType === 'event' && {
        event_title: post.event_title || 'Untitled Event',
        event_date: post.event_date || new Date().toISOString(),
        event_location: post.event_location || 'Unknown Location',
        interested: Array.isArray(post.interested) ? post.interested.length : post.interested || 0,
        isInterested: userId && (post.isInterested || (Array.isArray(post.interested) && post.interested.includes(userId))) || false,
      }),
    };

    return (
      <motion.div key={postId} variants={itemVariants}>
        <PostTypeDisplay
          post={normalizedPost}
          onLike={() => handleLikePost(postId)}
          onComment={(content) => content && handleCommentOnPost(postId, content)}
          onShare={() => handleSharePost(postId)}
          onInterested={postType === 'event' ? () => handleInterestedInEvent(postId) : undefined}
          currentUser={user || null}
          onDelete={() => handleDeletePost(postId)}
        />
      </motion.div>
    );
  };

  const hasResults =
    (Array.isArray(results.users) && results.users.length > 0) ||
    (Array.isArray(results.posts) && results.posts.length > 0) ||
    (Array.isArray(results.products) && results.products.length > 0) ||
    (Array.isArray(results.events) && results.events.length > 0);

  return (
    <SocialLayout>
      <div className="max-w-5xl mx-auto w-full px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search users, posts, products, events..."
                className="pl-10 pr-4 py-2 w-full rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-usm-gold"
              />
            </div>
            <Button type="submit" className="bg-usm-gold text-black hover:bg-amber-600">
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </form>

          {showAdvanced && (
            <Card className="p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={advancedFilters.type || ''}
                    onValueChange={(value) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        type: value as 'users' | 'posts' | 'products' | 'events' | undefined,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="users">Users</SelectItem>
                      <SelectItem value="posts">Posts</SelectItem>
                      <SelectItem value="products">Products</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {advancedFilters.type === 'products' && (
                  <>
                    <div>
                      <Label>Min Price</Label>
                      <Input
                        type="number"
                        value={advancedFilters.minPrice || ''}
                        onChange={(e) =>
                          setAdvancedFilters({ ...advancedFilters, minPrice: parseFloat(e.target.value) || undefined })
                        }
                        placeholder="Min Price"
                        className="flex items-center gap-2"
                      />
                    </div>
                    <div>
                      <Label>Max Price</Label>
                      <Input
                        type="number"
                        value={advancedFilters.maxPrice || ''}
                        onChange={(e) =>
                          setAdvancedFilters({ ...advancedFilters, maxPrice: parseFloat(e.target.value) || undefined })
                        }
                        placeholder="Max Price"
                        className="flex items-center gap-2"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={advancedFilters.category || ''}
                        onChange={(e) =>
                          setAdvancedFilters({ ...advancedFilters, category: e.target.value || undefined })
                        }
                        placeholder="e.g., Electronics"
                      />
                    </div>
                    <div>
                      <Label>Condition</Label>
                      <Select
                        value={advancedFilters.condition || ''}
                        onValueChange={(value) =>
                          setAdvancedFilters({ ...advancedFilters, condition: value || undefined })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="used">Used</SelectItem>
                          <SelectItem value="refurbished">Refurbished</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                {advancedFilters.type === 'events' && (
                  <>
                    <div>
                      <Label>From Date</Label>
                      <Input
                        type="date"
                        value={advancedFilters.eventDateFrom || ''}
                        onChange={(e) =>
                          setAdvancedFilters({ ...advancedFilters, eventDateFrom: e.target.value || undefined })
                        }
                        className="flex items-center gap-2"
                      />
                    </div>
                    <div>
                      <Label>To Date</Label>
                      <Input
                        type="date"
                        value={advancedFilters.eventDateTo || ''}
                        onChange={(e) =>
                          setAdvancedFilters({ ...advancedFilters, eventDateTo: e.target.value || undefined })
                        }
                        className="flex items-center gap-2"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={advancedFilters.location || ''}
                        onChange={(e) =>
                          setAdvancedFilters({ ...advancedFilters, location: e.target.value || undefined })
                        }
                        placeholder="e.g., New York"
                        className="flex items-center gap-2"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAdvancedSearch} className="bg-usm-gold text-black hover:bg-amber-600">
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAdvancedFilters({});
                    setShowAdvanced(false);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </motion.div>

        {(isLoading || isFetching) ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
                <div className="mt-4 h-24 bg-gray-200 rounded" />
              </Card>
            ))}
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full" key={searchQuery}>
            <TabsList className="grid grid-cols-5 w-full bg-gray-100 p-1 rounded-lg mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                {!hasResults ? (
                  <Card className="text-center py-10">
                    <Search className="text-gray-400 h-8 w-8 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No results found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters.</p>
                  </Card>
                ) : (
                  <>
                    {Array.isArray(results.users) && results.users.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Users</h3>
                        <div className="space-y-4">{results.users.map(renderUserResult)}</div>
                      </div>
                    )}
                    {Array.isArray(results.posts) && results.posts.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Posts</h3>
                        <div className="space-y-4">{results.posts.map((post) => renderPostResult(post, 'posts'))}</div>
                      </div>
                    )}
                    {Array.isArray(results.products) && results.products.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Products</h3>
                        <div className="space-y-4">{results.products.map((post) => renderPostResult(post, 'products'))}</div>
                      </div>
                    )}
                    {Array.isArray(results.events) && results.events.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Events</h3>
                        <div className="space-y-4">{results.events.map((post) => renderPostResult(post, 'events'))}</div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </TabsContent>
            <TabsContent value="users">
              <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                {Array.isArray(results.users) && results.users.length > 0 ? (
                  results.users.map(renderUserResult)
                ) : (
                  <Card className="text-center py-10">
                    <Search className="text-gray-400 h-8 w-8 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No users found</h3>
                    <p className="text-gray-500">Try adjusting your search.</p>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
            <TabsContent value="posts">
              <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                {Array.isArray(results.posts) && results.posts.length > 0 ? (
                  results.posts.map((post) => renderPostResult(post, 'posts'))
                ) : (
                  <Card className="text-center py-10">
                    <Search className="text-gray-400 h-8 w-8 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No posts found</h3>
                    <p className="text-gray-500">Try adjusting your search.</p>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
            <TabsContent value="products">
              <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                {Array.isArray(results.products) && results.products.length > 0 ? (
                  results.products.map((post) => renderPostResult(post, 'products'))
                ) : (
                  <Card className="text-center py-10">
                    <Search className="text-gray-400 h-8 w-8 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No products found</h3>
                    <p className="text-gray-500">Try adjusting your search.</p>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
            <TabsContent value="events">
              <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                {Array.isArray(results.events) && results.events.length > 0 ? (
                  results.events.map((post) => renderPostResult(post, 'events'))
                ) : (
                  <Card className="text-center py-10">
                    <Search className="text-gray-400 h-8 w-8 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No events found</h3>
                    <p className="text-gray-500">Try adjusting your search.</p>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </SocialLayout>
  );
};

export default SearchPage;