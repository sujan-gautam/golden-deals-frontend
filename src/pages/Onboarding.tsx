import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { fetchAPI } from '@/services/api';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const interestOptions = [
    'Sports', 'Music', 'Art', 'Technology', 'Books',
    'Movies', 'Fitness', 'Cooking', 'Gaming', 'Travel',
    'Photography', 'Fashion', 'Science', 'Politics', 'Environment'
  ];

  // Check authentication and fetch user profile
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your profile.",
        variant: "destructive",
      });
      navigate('/signin');
      return;
    }

    // Fetch current user profile
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const userData = await fetchAPI('users/current', {
          method: 'GET',
        });
        console.log('Fetched user profile:', userData);

        // Check if bio or website is non-empty
        if (
          (userData.bio && userData.bio.trim()) ||
          (userData.website && userData.website.trim())
        ) {
          console.log('Bio or website exists, redirecting to /feed');
          navigate('/feed');
        }
      } catch (error: any) {
        console.error('Failed to fetch user profile:', error);
        toast({
          title: "Error",
          description: "Could not load your profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, navigate, toast]);

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const completeOnboarding = async () => {
    try {
      const userData = {
        bio,
        interests,
      };

      await fetchAPI('users/current', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      toast({
        title: "Profile setup complete!",
        description: "Your profile has been updated.",
      });
      navigate('/feed');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Profile Update Failed",
        description: error.message || "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading state while fetching profile
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Let's set up your profile
          </CardTitle>
          <div className="flex justify-center items-center space-x-2 mt-4">
            <div className={`h-2.5 w-12 rounded-full ${step >= 1 ? 'bg-usm-gold' : 'bg-gray-200'}`}></div>
            <div className={`h-2.5 w-12 rounded-full ${step >= 2 ? 'bg-usm-gold' : 'bg-gray-200'}`}></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tell us about yourself</h3>
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                  <Textarea
                    id="bio"
                    placeholder="Share a little about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
          
          {step === 2 && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">What are you interested in?</h3>
                <p className="text-sm text-gray-500">Select all that apply. These will help us personalize your feed.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`p-3 rounded-lg text-left transition ${
                        interests.includes(interest)
                          ? 'bg-usm-gold text-black'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{interest}</span>
                        {interests.includes(interest) && <Check className="h-4 w-4" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={completeOnboarding} disabled={!bio.trim() || interests.length === 0}>
                  Complete Profile
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;