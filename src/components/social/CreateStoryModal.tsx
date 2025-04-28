import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { X, Camera, Upload, Smile } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStory: (image: File, text: string, textColor: string) => void; // Changed imageUrl to image: File
}

const CreateStoryModal = ({ isOpen, onClose, onCreateStory }: CreateStoryModalProps) => {
  const [storyImage, setStoryImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [storyText, setStoryText] = useState('');
  const [storyTextColor, setStoryTextColor] = useState('#ffffff');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Image must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setStoryImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      toast({
        title: "Image selected",
        description: "Your image is ready to be uploaded.",
      });
    }
  };

  const handleStoryImageSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCreateStory = () => {
    if (!storyImage) {
      toast({
        title: "Image required",
        description: "Please add an image to your story.",
        variant: "destructive",
      });
      return;
    }

    // Pass the File directly to onCreateStory
    onCreateStory(storyImage, storyText, storyTextColor);

    // Reset form after calling onCreateStory
    setStoryImage(null);
    setPreviewUrl('');
    setStoryText('');
    setStoryTextColor('#ffffff');
    onClose();
  };

  // Cleanup preview URL when component unmounts or image changes
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Story</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            {previewUrl ? (
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <img src={previewUrl} alt="Story" className="w-full h-full object-cover" />

                {storyText && (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <h3
                      className="text-2xl font-bold text-center break-words"
                      style={{ color: storyTextColor }}
                    >
                      {storyText}
                    </h3>
                  </div>
                )}

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                  onClick={() => {
                    setStoryImage(null);
                    setPreviewUrl('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 gap-4">
                <Button onClick={handleStoryImageSelect} variant="outline" className="gap-2">
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
                <Button onClick={handleStoryImageSelect} variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload from Device
                </Button>
              </div>
            )}

            {previewUrl && (
              <div className="w-full space-y-2">
                <div className="flex items-center gap-2">
                  <Smile className="h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Add text to your story..."
                    className="flex-1 p-2 text-sm border rounded-md"
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Text Color:</span>
                  <div className="flex gap-2">
                    {['#ffffff', '#000000', '#FF5757', '#47A992', '#FF9843', '#4D77FF'].map(color => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full ${storyTextColor === color ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setStoryTextColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleCreateStory} disabled={!storyImage}>
              Share to Story
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />
    </>
  );
};

export default CreateStoryModal;