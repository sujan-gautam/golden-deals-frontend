
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SocialLayout from "@/components/layout/SocialLayout";
import { useAuth } from '@/hooks/use-auth';
import ProfileImageUploader from '@/components/social/ProfileImageUploader';
import { User } from '@/types/user';

const Profile = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
  });
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if viewing own profile
    if (!id && user) {
      setIsOwnProfile(true);
      setProfileUser(user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
      });
    } else if (id && user) {
      // This is for demo purposes. In a real app, we would fetch the user data from the API
      if (id === user._id?.toString()) {
        setIsOwnProfile(true);
        setProfileUser(user);
        setFormData({
          name: user.name || '',
          email: user.email || '',
          bio: user.bio || '',
          location: user.location || '',
          website: user.website || '',
        });
      } else {
        // Simulate fetching another user's profile
        // In a real app, you would make an API call to fetch the user with the given ID
        const mockUser: User = {
          _id: id,
          name: 'Demo User',
          email: 'demo@example.com',
          avatar: 'https://ui-avatars.com/api/?name=Demo+User',
          role: 'user',
          createdAt: new Date().toISOString(),
          bio: 'This is a demo user profile',
          location: 'University of Southern Mississippi',
          website: 'https://example.com',
        };
        setIsOwnProfile(false);
        setProfileUser(mockUser);
      }
    }
  }, [id, user]);
  
  const handleProfileEdit = () => {
    setIsEditing(true);
  };
  
  const handleProfileSave = () => {
    // In a real app, you'd send this data to the server
    if (profileUser) {
      // Update local profile data for demonstration
      const updatedUser = {
        ...profileUser,
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
      };
      
      setProfileUser(updatedUser);
      
      // Save this to localStorage for demonstration purposes
      // In a real app, this would be saved to the database
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({
          ...parsedUser,
          name: formData.name,
          email: formData.email,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
        }));
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      setIsEditing(false);
    }
  };
  
  const handleChangeAvatar = () => {
    setIsImageUploaderOpen(true);
  };
  
  const handleSaveAvatar = (imageUrl: string) => {
    if (profileUser) {
      // Update local profile data for demonstration
      const updatedUser = {
        ...profileUser,
        avatar: imageUrl,
      };
      
      setProfileUser(updatedUser);
      
      // Save this to localStorage for demonstration purposes
      // In a real app, this would be saved to the database
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({
          ...parsedUser,
          avatar: imageUrl,
        }));
      }
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been successfully updated.",
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  if (!profileUser) {
    return (
      <SocialLayout>
        <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
          <p>Loading profile...</p>
        </div>
      </SocialLayout>
    );
  }
  
  return (
    <SocialLayout>
      <div className="container max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="relative h-40 bg-gradient-to-r from-usm-gold to-yellow-500">
            {isOwnProfile && (
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute top-4 right-4 bg-white"
                onClick={isEditing ? handleProfileSave : handleProfileEdit}
              >
                {isEditing ? 'Save Profile' : 'Edit Profile'}
              </Button>
            )}
          </div>
          
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 sm:-mt-16 mb-4 gap-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
                  <AvatarFallback className="text-3xl">
                    {profileUser.name?.charAt(0) || 'U'}
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
                <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                <p className="text-gray-500">@{profileUser.name?.toLowerCase().replace(/\s+/g, '')}</p>
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      name="location" 
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      name="website" 
                      value={formData.website}
                      onChange={handleInputChange}
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
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {profileUser.bio && <p>{profileUser.bio}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                  {profileUser.location && (
                    <div className="flex items-center">
                      <span className="mr-1">📍</span> {profileUser.location}
                    </div>
                  )}
                  {profileUser.website && (
                    <div className="flex items-center">
                      <span className="mr-1">🔗</span> {profileUser.website}
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="mr-1">📅</span> Joined {new Date(profileUser.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Profile Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            <div className="text-center py-10 text-gray-500">
              No posts yet
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="mt-6">
            <div className="text-center py-10 text-gray-500">
              No products listed yet
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="mt-6">
            <div className="text-center py-10 text-gray-500">
              No events created yet
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <ProfileImageUploader
        isOpen={isImageUploaderOpen}
        onClose={() => setIsImageUploaderOpen(false)}
        onSave={handleSaveAvatar}
        currentImage={profileUser.avatar}
        username={profileUser.name}
      />
    </SocialLayout>
  );
};

export default Profile;
