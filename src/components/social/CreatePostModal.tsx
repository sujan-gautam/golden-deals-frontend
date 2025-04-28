import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImagePlus, X, DollarSign, MapPin, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:5000";
const API_KEY = import.meta.env.VITE_API_KEY || "mySuperSecretToken";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Post>) => Promise<void>;
  initialType: "post" | "product" | "event";
  isLoading?: boolean;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialType,
  isLoading = false
}) => {
  const [postType, setPostType] = useState<"post" | "product" | "event">(initialType);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("new");
  const [stock, setStock] = useState("instock");

  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setLocation] = useState("");

  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const verifyTokenAndFetchUser = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setError("No token found. Please sign in.");
        setTimeout(() => navigate("/signin", { replace: true }), 2000);
        return;
      }

      try {
        const response = await api.get("/users/current", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        const data = response.data;
        if (data.isLoggedIn || data.id || data._id) {
          setUser(data);
          setToken(storedToken);
        } else {
          throw new Error("User not logged in");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        localStorage.removeItem("token");
        setError("Session expired. Please sign in again.");
        setTimeout(() => navigate("/signin", { replace: true }), 2000);
      } finally {
        setIsLoadingUser(false);
      }
    };

    if (isOpen) {
      verifyTokenAndFetchUser();
      setPostType(initialType);
    }
  }, [isOpen, initialType, navigate]);

  const resetForm = useCallback(() => {
    setContent("");
    setImage(null);
    setImagePreview(null);
    setProductName("");
    setPrice("");
    setCategory("");
    setCondition("new");
    setStock("instock");
    setEventTitle("");
    setEventDate("");
    setLocation("");
    setError(null);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isLoadingUser || !user || !token) {
        setError("Cannot submit: User not authenticated.");
        return;
      }

      setError(null);

      try {
        const postData: Partial<Post> = {
          type: postType,
          ...(postType === "post" && { content }),
          ...(postType === "product" && {
            title: productName,
            content,
            price: parseFloat(price) || 0,
            category,
            condition,
            status: stock,
          }),
          ...(postType === "event" && {
            event_title: eventTitle,
            content,
            event_date: eventDate,
            event_location: eventLocation,
          }),
          ...(image && { image }),
        };

        if (postType === "post" && !content) {
          throw new Error("Content is required for posts");
        } else if (postType === "product" && (!productName || !price)) {
          throw new Error("Product name and price are required");
        } else if (postType === "event" && (!eventTitle || !eventDate || !eventLocation || !content)) {
          throw new Error("All event fields are required");
        }

        await onSubmit(postData);
        resetForm();
        onClose();
      } catch (err: any) {
        setError(err.message || "Failed to process post");
      }
    },
    [
      postType,
      content,
      image,
      productName,
      price,
      category,
      condition,
      stock,
      eventTitle,
      eventDate,
      eventLocation,
      user,
      token,
      isLoadingUser,
      onSubmit,
      resetForm,
      onClose,
    ]
  );

  const avatarSrc = user?.avatar ? `${IMAGE_URL}${user.avatar}` : undefined;

  if (isLoadingUser && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-gray-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && (resetForm(), onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-2 bg-red-100 text-red-700 rounded mb-4">
            {error}
          </div>
        )}

        <Tabs value={postType} onValueChange={(value) => setPostType(value as "post" | "product" | "event")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="post">Post</TabsTrigger>
            <TabsTrigger value="product">Product</TabsTrigger>
            <TabsTrigger value="event">Event</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <div className="flex items-start space-x-3">
              <Avatar>
                <AvatarImage src={avatarSrc} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{user?.name || "Loading..."}</div>
                <div className="text-xs text-gray-500">
                  {postType === "post" && "Posting to your feed"}
                  {postType === "product" && "Listing a product"}
                  {postType === "event" && "Creating an event"}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <TabsContent value="post" className="space-y-4">
              <textarea
                placeholder="What's on your mind?"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-usm-gold min-h-[120px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </TabsContent>

            <TabsContent value="product" className="space-y-4">
              <Input
                placeholder="Product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required={postType === "product"}
              />
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    className="pl-9"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required={postType === "product"}
                  />
                </div>
                <div className="flex-1">
                  <Select value={stock} onValueChange={setStock}>
                    <SelectTrigger>
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instock">In Stock</SelectItem>
                      <SelectItem value="lowstock">Low Stock</SelectItem>
                      <SelectItem value="soldout">Sold Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="likenew">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Category (e.g., Electronics, Books, Clothing)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <textarea
                placeholder="Description"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-usm-gold min-h-[80px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </TabsContent>

            <TabsContent value="event" className="space-y-4">
              <Input
                placeholder="Event title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                required={postType === "event"}
              />
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    type="datetime-local"
                    placeholder="Date and Time"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required={postType === "event"}
                  />
                </div>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Location"
                  className="pl-9"
                  value={eventLocation}
                  onChange={(e) => setLocation(e.target.value)}
                  required={postType === "event"}
                />
              </div>
              <textarea
                placeholder="Event details"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-usm-gold min-h-[80px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required={postType === "event"}
              />
            </TabsContent>

            {imagePreview && (
              <div className="relative rounded-lg overflow-hidden border">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-60 object-cover"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex space-x-2">
                <Button type="button" variant="outline" size="sm" asChild>
                  <label className="relative">
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Add Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                    />
                  </label>
                </Button>
                {postType === "product" && (
                  <Badge variant={stock === "instock" ? "secondary" : stock === "lowstock" ? "default" : "destructive"}>
                    {stock === "instock" ? "In Stock" : stock === "lowstock" ? "Low Stock" : "Sold Out"}
                  </Badge>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;