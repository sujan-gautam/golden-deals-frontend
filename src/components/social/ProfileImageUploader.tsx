import React, { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_KEY = import.meta.env.VITE_API_KEY || "mySuperSecretToken";

// Axios instance with default headers including x-api-key
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

interface ProfileImageUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageUrl: string) => void;
  currentImage?: string;
  username?: string;
}

const ProfileImageUploader = ({
  isOpen,
  onClose,
  onSave,
  currentImage,
  username = "U",
}: ProfileImageUploaderProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      console.log("Selected file:", file.name, file.size); // Debug file selection
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      setError("Please select an image to upload.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to upload a profile picture.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("profile", imageFile);

    try {
      const res = await api.post<{ message: string; avatarUrl: string }>(
        "/users/upload-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload response:", res.data); // Debug backend response
      onSave(res.data.avatarUrl); // Pass the URL to parent component
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data.message
          ? err.response.data.message
          : "Failed to upload image. Please try again.";
      setError(errorMessage);
      console.error("Upload error:", err); // Debug error details
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(currentImage);
    setError(null);
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== currentImage) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, currentImage]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          {previewUrl ? (
            <div className="relative rounded-full overflow-hidden w-32 h-32">
              <img
                src={previewUrl}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute top-0 right-0 h-8 w-8 p-0 rounded-full"
                onClick={removeImage}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Avatar className="w-32 h-32">
              <AvatarImage src={currentImage} alt={username} />
              <AvatarFallback className="text-3xl">
                {username.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="profile-image-upload"
            disabled={isSubmitting}
          />
          <label htmlFor="profile-image-upload">
            <Button asChild variant="outline" disabled={isSubmitting}>
              <span>
                <Camera className="mr-2 h-4 w-4" />
                Select New Image
              </span>
            </Button>
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!imageFile || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileImageUploader;