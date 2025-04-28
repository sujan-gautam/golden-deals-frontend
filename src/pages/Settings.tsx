import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Bell, Globe, Loader2, Bookmark } from "lucide-react";
import SocialLayout from "@/components/layout/SocialLayout";
import ProfileImageUploader from "@/components/social/ProfileImageUploader";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import debounce from "lodash.debounce";

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
}

const Settings = () => {
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"profile" | "content" | "language" | "saved">("profile");
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
  });
  const [initialFormData, setInitialFormData] = useState(formData);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Error",
        description: "Please sign in to access settings.",
        variant: "destructive",
      });
      navigate("/login");
    } else if (user) {
      fetchProfile();
    }
  }, [isAuthenticated, authLoading, user, navigate, toast]);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Error",
        description: "Please sign in to view settings.",
        variant: "destructive",
      });
      setTimeout(() => navigate("/login"), 2000);
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
      const response = await api.get("/users/current", config);
      const userData: User = response.data;
      userData.id = userData.id || userData._id;
      setProfileUser(userData);
      const newFormData = {
        firstname: userData.firstname || "",
        lastname: userData.lastname || "",
        username: userData.username || "",
        email: userData.email || "",
      };
      setFormData(newFormData);
      setInitialFormData(newFormData);
      setUsernameStatus("idle");
      setUsernameError(null);
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : error instanceof Error
          ? error.message
          : "Failed to load profile data";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = useCallback(
    debounce(async (username: string) => {
      if (!username.trim() || username === profileUser?.username) {
        setUsernameStatus("idle");
        setUsernameError(null);
        return;
      }
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        setUsernameStatus("idle");
        setUsernameError("Username must be 3-20 characters, alphanumeric or underscore only");
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) {
        setUsernameStatus("idle");
        setUsernameError("Authentication required");
        return;
      }
      try {
        setUsernameStatus("checking");
        const response = await api.post(
          "/users/check-username",
          { username },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-api-key": API_KEY,
            },
          }
        );
        if (response.data.available) {
          setUsernameStatus("available");
          setUsernameError(null);
        } else {
          setUsernameStatus("taken");
          setUsernameError("Username is already taken");
        }
      } catch (error) {
        setUsernameStatus("idle");
        setUsernameError(
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "Error checking username"
        );
      }
    }, 500),
    [profileUser?.username]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "username") {
      checkUsernameAvailability(value);
    }
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "Error", description: "No authentication token found", variant: "destructive" });
      return;
    }

    if (formData.username && usernameStatus === "taken") {
      toast({ title: "Error", description: "Please choose a different username", variant: "destructive" });
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
      const { email, ...updateData } = formData; // Exclude email
      const response = await api.put("/users/current", updateData, config);
      const updatedUser: User = response.data;
      updatedUser.id = updatedUser.id || updatedUser._id;
      setProfileUser(updatedUser);
      setInitialFormData(formData);
      toast({ title: "Changes saved", description: "Your profile has been updated.", variant: "default" });
      setUsernameStatus("idle");
      setUsernameError(null);
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to update profile";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setUsernameStatus("idle");
    setUsernameError(null);
  };

  const handleChangeAvatar = () => setIsImageUploaderOpen(true);

  const handleSaveAvatar = async (avatarUrl: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "Error", description: "No authentication token found", variant: "destructive" });
      return;
    }

    try {
      setProfileUser((prev) => (prev ? { ...prev, avatar: avatarUrl } : null));
      setInitialFormData((prev) => ({ ...prev, avatar: avatarUrl }));
      toast({ title: "Avatar updated", description: "Your profile picture has been updated.", variant: "default" });
      await fetchProfile();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update avatar",
        variant: "destructive",
      });
    } finally {
      setIsImageUploaderOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "You have been successfully logged out.", variant: "default" });
    navigate("/");
  };

  const handleSavedItems = () => {
    setActiveTab("saved");
    navigate("/saved");
  };

  const fullName = profileUser
    ? `${profileUser.firstname || ""} ${profileUser.lastname || ""}`.trim() || profileUser.username || "User"
    : "User";
  const avatarSrc = profileUser?.avatar ? `${IMAGE_URL}${profileUser.avatar}` : undefined;

  if (authLoading || loading) {
    return (
      <SocialLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-usm-gold animate-spin" />
            <span className="text-gray-600 text-lg">Loading settings...</span>
          </div>
        </div>
      </SocialLayout>
    );
  }

  return (
    <SocialLayout>
      <div className="container max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-1/5">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <nav className="space-y-1">
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-gray-600 hover:bg-usm-gold/10 hover:text-usm-gold text-base font-medium ${
                    activeTab === "profile" ? "bg-usm-gold/10 text-usm-gold" : ""
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-gray-600 hover:bg-usm-gold/10 hover:text-usm-gold text-base font-medium ${
                    activeTab === "content" ? "bg-usm-gold/10 text-usm-gold" : ""
                  }`}
                  onClick={() => setActiveTab("content")}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-gray-600 hover:bg-usm-gold/10 hover:text-usm-gold text-base font-medium ${
                    activeTab === "language" ? "bg-usm-gold/10 text-usm-gold" : ""
                  }`}
                  onClick={() => setActiveTab("language")}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Language
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-gray-600 hover:bg-usm-gold/10 hover:text-usm-gold text-base font-medium ${
                    activeTab === "saved" ? "bg-usm-gold/10 text-usm-gold" : ""
                  }`}
                  onClick={handleSavedItems}
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  Saved Items
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 text-base font-medium mt-4"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="w-full lg:w-4/5">
            {activeTab === "profile" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profile</h2>
                <div className="space-y-6">
                  {/* Avatar */}
                  <div>
                    <Label className="text-gray-600 font-medium">Profile Picture</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Avatar className="h-12 w-12 border-2 border-gray-200">
                        <AvatarImage src={avatarSrc} alt={fullName} />
                        <AvatarFallback className="text-lg bg-gray-100">
                          {fullName.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-usm-gold/10 hover:text-usm-gold"
                        onClick={handleChangeAvatar}
                        disabled={loading}
                      >
                        Change Picture
                      </Button>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstname" className="text-gray-600 font-medium">
                        First Name
                      </Label>
                      <Input
                        id="firstname"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="mt-1 border-gray-300 rounded-md focus:border-usm-gold focus:ring-usm-gold transition-all"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastname" className="text-gray-600 font-medium">
                        Last Name
                      </Label>
                      <Input
                        id="lastname"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="mt-1 border-gray-300 rounded-md focus:border-usm-gold focus:ring-usm-gold transition-all"
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="username" className="text-gray-600 font-medium">
                        Username
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          disabled={loading}
                          className={`border-gray-300 rounded-md focus:border-usm-gold focus:ring-usm-gold transition-all pr-10 ${
                            usernameStatus === "taken"
                              ? "border-red-500"
                              : usernameStatus === "available"
                              ? "border-green-500"
                              : ""
                          }`}
                          placeholder="Enter username"
                        />
                        {usernameStatus === "checking" && (
                          <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />
                        )}
                        {usernameStatus === "available" && (
                          <span className="absolute right-3 top-2.5 text-green-500 text-lg">✓</span>
                        )}
                        {usernameStatus === "taken" && (
                          <span className="absolute right-3 top-2.5 text-red-500 text-lg">✗</span>
                        )}
                      </div>
                      {usernameError && (
                        <p className="text-red-500 text-sm mt-1 font-medium">{usernameError}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-600 font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        disabled={true}
                        className="mt-1 border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                        placeholder="Enter email"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 mt-8">
                    <Button
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-100 rounded-md"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-usm-gold text-gray-900 hover:bg-amber-500 rounded-md"
                      onClick={handleSaveProfile}
                      disabled={loading || usernameStatus === "taken"}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "content" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Notifications</h2>
                <div className="space-y-6">
                  <div>
                    <Label className="text-gray-600 font-medium">Email Notifications</Label>
                    <p className="text-gray-500 mt-1">
                      <input type="checkbox" disabled className="mr-2" />
                      Receive email updates for likes and comments (coming soon).
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600 font-medium">Push Notifications</Label>
                    <p className="text-gray-500 mt-1">
                      <input type="checkbox" disabled className="mr-2" />
                      Get push notifications for new followers (coming soon).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "language" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Language</h2>
                <div className="space-y-6">
                  <div>
                    <Label className="text-gray-600 font-medium">Display Language</Label>
                    <select disabled className="mt-1 w-full border-gray-300 rounded-md bg-gray-100 cursor-not-allowed">
                      <option>English (default)</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-gray-600 font-medium">Time Zone</Label>
                    <select disabled className="mt-1 w-full border-gray-300 rounded-md bg-gray-100 cursor-not-allowed">
                      <option>UTC (default)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "saved" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Saved Items</h2>
                <p className="text-gray-600">
                  View your saved posts, products, and events.
                </p>
                <Button
                  className="mt-4 bg-usm-gold text-gray-900 hover:bg-amber-500 rounded-md"
                  onClick={() => navigate("/saved")}
                >
                  Go to Saved Items
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProfileImageUploader
        isOpen={isImageUploaderOpen}
        onClose={() => setIsImageUploaderOpen(false)}
        onSave={handleSaveAvatar}
        currentImage={avatarSrc}
        username={profileUser?.username}
      />
    </SocialLayout>
  );
};

export default Settings;