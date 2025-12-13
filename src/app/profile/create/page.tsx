
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BackButton } from '@/components/common/back-button';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { generateUsernames } from '@/ai/flows/username-generation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  username: z.string().min(3, 'Username must be at least 3 characters.').regex(/^[a-z0-9_.]+$/, 'Username can only contain lowercase letters, numbers, underscores, and dots.'),
  avatarUrl: z.string().optional(), // Avatar is now optional from a predefined list
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function CreateProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useLocalStorage('userProfile', {});
  const [signupData, setSignupData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      username: '',
      avatarUrl: ''
    }
  });
  
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('signupData') || '{}');
      setSignupData(data);
      if (data.name) {
        setValue('name', data.name);
      }
      if (data.username) {
        setValue('username', data.username);
      }
    } catch (e) {
      console.error("Could not parse signup data from local storage");
    }
  }, [setValue]);


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreviewImage(dataUrl);
        setValue('avatarUrl', dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateUsernames = async () => {
    const fullName = getValues('name');
    if (!fullName) {
      toast({
        variant: 'destructive',
        title: 'Name is required',
        description: 'Please enter your full name to get username suggestions.',
      });
      return;
    }
    setIsAiLoading(true);
    try {
      const result = await generateUsernames({ fullName });
      setUsernameSuggestions(result.usernames);
      setIsSuggestionModalOpen(true);
    } catch (error) {
      console.error('AI username generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not generate usernames at this time.',
      });
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const selectUsername = (username: string) => {
    setValue('username', username, { shouldValidate: true });
    setIsSuggestionModalOpen(false);
  };


  const onSubmit = async (data: ProfileForm) => {
    setIsSubmitting(true);

    setTimeout(() => {
        try {
            const fullProfile = { 
              ...signupData, 
              ...data, 
              id: signupData?.uid || 'user-1', 
              rating: 4.8, 
              earnings: 1250.00,
              avatarUrl: data.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${data.name}`
            }; 
            setUserProfile(fullProfile);

            localStorage.removeItem('signupData');
        } catch (e) {
            console.error("Local storage is unavailable.");
        }

        toast({
            title: 'Profile Created!',
            description: 'Your profile has been successfully created.',
        });
        router.push('/dashboard');
        setIsSubmitting(false);

    }, 1000);
  };

  return (
    <>
    <div className="container flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-xl lg:p-8">
        <BackButton />
        <Card className="mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Create Your Profile</CardTitle>
            <CardDescription>Just one more step. Let's get your profile ready.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-28 w-28 border-4 border-muted">
                    <AvatarImage src={previewImage ?? ''} />
                    <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                        {getValues('name')?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                  />
                  {errors.avatarUrl && <p className="text-sm text-destructive">{errors.avatarUrl.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="e.g., Jane Doe" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex items-center gap-2">
                    <Input id="username" placeholder="e.g., jane.doe" {...register('username')} />
                    <Button type="button" variant="ghost" size="icon" onClick={handleGenerateUsernames} disabled={isAiLoading}>
                        {isAiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-primary" />}
                        <span className="sr-only">Generate Usernames</span>
                    </Button>
                </div>
                {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
              </div>


              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save and Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    <Dialog open={isSuggestionModalOpen} onOpenChange={setIsSuggestionModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>AI Username Suggestions</DialogTitle>
                <DialogDescription>
                    Here are a few creative usernames based on your name. Click one to select it.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap gap-2 py-4">
                {usernameSuggestions.map((name) => (
                    <Button key={name} variant="secondary" size="sm" onClick={() => selectUsername(name)}>
                        {name}
                    </Button>
                ))}
            </div>
             <DialogFooter>
                <Button variant="outline" onClick={() => setIsSuggestionModalOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
