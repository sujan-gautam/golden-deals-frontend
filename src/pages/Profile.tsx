import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SocialLayout from "@/components/layout/SocialLayout";
import ProfileImageUploader from '@/components/social/ProfileImageUploader';
import PostTypeDisplay from '@/components/social/PostTypeDisplay';
import { usePosts } from '@/hooks/use-posts';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, ShoppingBag, StickyNote } from "lucide-react";

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:5000";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_KEY = import.meta.env.VITE_API_KEY || "mySuperSecretToken";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

interface User {
  id?: string;
  _id?: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  location?: string | null;
  website?: string;
  createdAt?: string;
  isLoggedIn?: boolean;
  completedTasks?: number;
}

const Profile = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    bio: '',
    location: '',
    website: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    posts,
    isLoading: contentLoading,
    error: contentError,
    refetch,
    handleLikePost,
    handleCommentOnPost,
    handleSharePost,
    handleInterestedInEvent,
    handleDeletePost,
    handleEditPost,
  } = usePosts(id);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Error",
        description: "Please sign in to view profiles.",
        variant: "destructive",
      });
      setTimeout(() => navigate('/signin'), 2000);
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": API_KEY,
      },
    };

    try {
      setLoading(true);

      const currentUserResponse = await api.get('/users/current', config);
      const currentUserData: User = currentUserResponse.data;
      currentUserData.id = currentUserData.id || currentUserData._id;
      setCurrentUser(currentUserData);

      const userId = id || currentUserData.id;
      if (!userId) {
        throw new Error('No user ID available to fetch profile.');
      }

      let userData: User;
      if (!id) {
        userData = currentUserData;
      } else {
        const profileResponse = await api.get(`/users/${userId}`, config);
        userData = profileResponse.data;
        userData.id = userData.id || userData._id;
      }

      setProfileUser(userData);
      setFormData({
        firstname: userData.firstname || '',
        lastname: userData.lastname || '',
        email: userData.email || '',
        bio: userData.bio || '',
        location: userData.location || '',
        website: userData.website || '',
      });
      setIsOwnProfile(userId === currentUserData.id);

      await refetch();
    } catch (error) {
      console.error('Error fetching profile:', error);
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : error instanceof Error ? error.message : 'Failed to load profile data';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        setTimeout(() => navigate('/signin'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id, navigate]);

  const handleProfileEdit = () => setIsEditing(true);

  const handleProfileSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({ title: "Error", description: "No authentication token found", variant: "destructive" });
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": API_KEY,
      },
    };

    // Exclude email from the update payload
    const { email, ...updateData } = formData;

    try {
      setLoading(true);
      const response = await api.put('/users/current', updateData, config);
      const updatedUser: User = response.data;
      updatedUser.id = updatedUser.id || updatedUser._id;
      setProfileUser(updatedUser);
      setCurrentUser(updatedUser);
      toast({ title: "Profile updated", description: "Your profile has been successfully updated." });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = () => setIsImageUploaderOpen(true);

  const handleSaveAvatar = async (avatarUrl: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({ title: "Error", description: "No authentication token found", variant: "destructive" });
      return;
    }

    try {
      setProfileUser(prev => prev ? { ...prev, avatar: avatarUrl } : null);
      if (isOwnProfile) {
        setCurrentUser(prev => prev ? { ...prev, avatar: avatarUrl } : null);
      }
      toast({ title: "Avatar updated", description: "Your profile picture is being updated." });
      await fetchProfile();
      toast({ title: "Avatar updated", description: "Your profile picture has been successfully updated." });
    } catch (error) {
      console.error('Error refetching profile after avatar update:', error);
      toast({ title: "Error", description: "Failed to refresh profile after avatar update", variant: "destructive" });
    } finally {
      setIsImageUploaderOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Prevent email updates in formData
    if (name !== 'email') {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading && !profileUser) {
    return (
      <SocialLayout>
        <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
          <svg className="animate-spin h-8 w-8 text-gray-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      </SocialLayout>
    );
  }

  if (!profileUser) {
    return (
      <SocialLayout>
        <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
          <p>Profile not found</p>
        </div>
      </SocialLayout>
    );
  }

  const fullName = `${formData.firstname} ${formData.lastname}`.trim() || 'User';
  const avatarSrc = profileUser.avatar ? `${IMAGE_URL}${profileUser.avatar}` : undefined;

  const userId = profileUser.id || profileUser._id;
  const currentUserId = currentUser?.id || currentUser?._id || '';
  const userPosts = posts.filter(post => post.userId === userId && post.type === 'post');
  const userProducts = posts.filter(post => post.userId === userId && post.type === 'product');
  const userEvents = posts.filter(post => post.userId === userId && post.type === 'event');

  // Enhanced debug logs
  console.log("Posts from usePosts:", posts);
  console.log("profileUser:", profileUser);
  console.log("currentUser:", currentUser);
  console.log("userId used for filtering:", userId);
  console.log("currentUserId:", currentUserId);
  console.log("userPosts:", userPosts.map(p => ({ id: p._id, likes: p.likes })));
  console.log("userProducts:", userProducts.map(p => ({ id: p._id, likes: p.likes })));
  console.log("userEvents:", userEvents.map(p => ({ id: p._id, likes: p.likes, interested: p.interested })));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <SocialLayout>
      <div className="container max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="relative h-40 bg-gradient-to-r from-usm-gold to-yellow-500">
            {isOwnProfile && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 bg-white"
                onClick={isEditing ? handleProfileSave : handleProfileEdit}
                disabled={loading}
              >
                {loading ? 'Saving...' : isEditing ? 'Save Profile' : 'Edit Profile'}
              </Button>
            )}
          </div>

          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 sm:-mt-16 mb-4 gap-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  <AvatarImage src={avatarSrc} alt={fullName} />
                  <AvatarFallback className="text-3xl">
                    {fullName.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <div
                    className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={handleChangeAvatar}
                  >
                    <span className="text-white text-xs font-medium">Change</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold">{fullName}</h1>
                <p className="text-gray-500">@{profileUser.username}</p>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstname">First Name</Label>
                    <Input
                      id="firstname"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastname">Last Name</Label>
                    <Input
                      id="lastname"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled={true}
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {formData.bio && <p>{formData.bio}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                  {formData.location && (
                    <div className="flex items-center">
                      <span className="mr-1">📍</span> {formData.location}
                    </div>
                  )}
                  {formData.website && (
                    <div className="flex items-center">
                      <span className="mr-1">🔗</span>
                      <a href={formData.website} target="_blank" rel="noopener noreferrer">
                        {formData.website}
                      </a>
                    </div>
                  )}
                  {profileUser.createdAt && (
                    <div className="flex items-center">
                      <span className="mr-1">📅</span> Joined {new Date(profileUser.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            {contentLoading ? (
              <div className="text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-usm-gold border-r-transparent"></div>
                <p className="mt-2 text-gray-500">Loading posts...</p>
              </div>
            ) : contentError ? (
              <div className="text-center py-10 text-gray-500">
                <p>Failed to load posts: {contentError.message}</p>
              </div>
            ) : userPosts.length > 0 ? (
              <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                {userPosts.map((post) => {
                  const likesArray = Array.isArray(post.likes)
                    ? post.likes
                        .map((item) =>
                          typeof item === 'object' && item !== null ? item._id?.toString() || item.id?.toString() : item?.toString()
                        )
                        .filter(Boolean)
                    : [];
                  const likesCount = likesArray.length;
                  const isLiked = currentUserId && likesArray.includes(currentUserId);

                  console.log(`Post ${post._id}: Likes Array:`, likesArray, `Count: ${likesCount}, isLiked: ${isLiked}`);

                  return (
                    <motion.div key={post._id} variants={itemVariants}>
                      <PostTypeDisplay
                        post={{
                          ...post,
                          _id: post._id.toString(),
                          user_id: post.userId,
                          user: post.user,
                          content: post.content,
                          image: post.image,
                          likes: likesCount,
                          liked: isLiked,
                          shares: post.shares || 0,
                          comments: post.comments || [],
                        }}
                        onLike={() => handleLikePost(post._id.toString())}
                        onComment={(content) => content && handleCommentOnPost(post._id.toString(), content)}
                        onShare={() => handleSharePost(post._id.toString())}
                        currentUser={currentUser}
                        onDelete={isOwnProfile ? () => handleDeletePost(post._id.toString()) : undefined}
                        onEdit={isOwnProfile ? (postId, updatedPost) => handleEditPost(postId, {
                          ...updatedPost,
                          type: post.type,
                          content: updatedPost.content || post.content,
                        }) : undefined}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <StickyNote className="h-8 w-8 mx-auto mb-4" />
                <p>No posts yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            {contentLoading ? (
              <div className="text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-usm-gold border-r-transparent"></div>
                <p className="mt-2 text-gray-500">Loading products...</p>
              </div>
            ) : contentError ? (
              <div className="text-center py-10 text-gray-500">
                <p>Failed to load products: {contentError.message}</p>
              </div>
            ) : userProducts.length > 0 ? (
              <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                {userProducts.map((product) => {
                  const likesArray = Array.isArray(product.likes)
                    ? product.likes
                        .map((item) =>
                          typeof item === 'object' && item !== null ? item._id?.toString() || item.id?.toString() : item?.toString()
                        )
                        .filter(Boolean)
                    : [];
                  const likesCount = likesArray.length;
                  const isLiked = currentUserId && likesArray.includes(currentUserId);

                  console.log(`Product ${product._id}: Likes Array:`, likesArray, `Count: ${likesCount}, isLiked: ${isLiked}`);

                  return (
                    <motion.div key={product._id} variants={itemVariants}>
                      <PostTypeDisplay
                        post={{
                          ...product,
                          _id: product._id.toString(),
                          user_id: product.userId,
                          user: product.user,
                          content: product.content,
                          title: product.title,
                          price: product.price,
                          category: product.category,
                          condition: product.condition,
                          status: product.status,
                          image: product.image,
                          likes: likesCount,
                          liked: isLiked,
                          shares: product.shares || 0,
                          comments: product.comments || [],
                        }}
                        onLike={() => handleLikePost(product._id.toString())}
                        onComment={(content) => content && handleCommentOnPost(product._id.toString(), content)}
                        onShare={() => handleSharePost(product._id.toString())}
                        currentUser={currentUser}
                        onDelete={isOwnProfile ? () => handleDeletePost(product._id.toString()) : undefined}
                        onEdit={isOwnProfile ? (postId, updatedPost) => handleEditPost(postId, {
                          ...updatedPost,
                          type: product.type,
                          content: updatedPost.content || product.content,
                          title: updatedPost.title || product.title,
                          price: updatedPost.price || product.price,
                          category: updatedPost.category || product.category,
                          condition: updatedPost.condition || product.condition,
                          status: updatedPost.status || product.status,
                        }) : undefined}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <ShoppingBag className="h-8 w-8 mx-auto mb-4" />
                <p>No products listed yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            {contentLoading ? (
              <div className="text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-usm-gold border-r-transparent"></div>
                <p className="mt-2 text-gray-500">Loading events...</p>
              </div>
            ) : contentError ? (
              <div className="text-center py-10 text-gray-500">
                <p>Failed to load events: {contentError.message}</p>
              </div>
            ) : userEvents.length > 0 ? (
              <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                {userEvents.map((event) => {
                  const likesArray = Array.isArray(event.likes)
                    ? event.likes
                        .map((item) =>
                          typeof item === 'object' && item !== null ? item._id?.toString() || item.id?.toString() : item?.toString()
                        )
                        .filter(Boolean)
                    : [];
                  const interestedArray = Array.isArray(event.interested)
                    ? event.interested
                        .map((item) =>
                          typeof item === 'object' && item !== null ? item._id?.toString() || item.id?.toString() : item?.toString()
                        )
                        .filter(Boolean)
                    : [];
                  const likesCount = likesArray.length;
                  const interestedCount = interestedArray.length;
                  const isLiked = currentUserId && likesArray.includes(currentUserId);
                  const isInterested = currentUserId && interestedArray.includes(currentUserId);

                  console.log(`Event ${event._id}: Likes Array:`, likesArray, `Count: ${likesCount}, isLiked: ${isLiked}`);
                  console.log(`Event ${event._id}: Interested Array:`, interestedArray, `Count: ${interestedCount}, isInterested: ${isInterested}`);

                  return (
                    <motion.div key={event._id} variants={itemVariants}>
                      <PostTypeDisplay
                        post={{
                          ...event,
                          _id: event._id.toString(),
                          user_id: event.userId,
                          user: event.user,
                          content: event.content,
                          event_title: event.event_title,
                          event_date: event.event_date,
                          event_location: event.event_location,
                          image: event.image,
                          likes: likesCount,
                          liked: isLiked,
                          shares: event.shares || 0,
                          interested: interestedCount,
                          isInterested: isInterested,
                          comments: event.comments || [],
                        }}
                        onLike={() => handleLikePost(event._id.toString())}
                        onComment={(content) => content && handleCommentOnPost(event._id.toString(), content)}
                        onShare={() => handleSharePost(event._id.toString())}
                        onInterested={() => handleInterestedInEvent(event._id.toString())}
                        currentUser={currentUser}
                        onDelete={isOwnProfile ? () => handleDeletePost(event._id.toString()) : undefined}
                        onEdit={isOwnProfile ? (postId, updatedPost) => handleEditPost(postId, {
                          ...updatedPost,
                          type: event.type,
                          content: updatedPost.content || event.content,
                          event_title: updatedPost.event_title || event.event_title,
                          event_date: updatedPost.event_date || event.event_date,
                          event_location: updatedPost.event_location || event.event_location,
                        }) : undefined}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-4" />
                <p>No events created yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ProfileImageUploader
        isOpen={isImageUploaderOpen}
        onClose={() => setIsImageUploaderOpen(false)}
        onSave={handleSaveAvatar}
        currentImage={avatarSrc}
        username={profileUser.username}
      />
    </SocialLayout>
  );
};

export default Profile;