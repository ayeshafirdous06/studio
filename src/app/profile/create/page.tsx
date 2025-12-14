
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { colleges } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';

const interestsList = [
  { id: 'editing', label: 'Editing' },
  { id: 'baking', label: 'Baking' },
  { id: 'writing', label: 'Writing' },
  { id: 'drawing', label: 'Drawing' },
  { id: 'ai-ml', label: 'AI & Machine Learning' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'web-dev', label: 'Web Development' },
  { id: 'photography', label: 'Photography' },
  { id: 'music', label: 'Music' },
  { id: 'entrepreneurship', label: 'Entrepreneurship' },
];

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  username: z.string().min(3, 'Username must be at least 3 characters.').regex(/^[a-z0-9_.]+$/, 'Username can only contain lowercase letters, numbers, underscores, and dots.'),
  avatarUrl: z.string().optional(),
  collegeId: z.string({ required_error: "Please select your college." }).min(1, "Please select your college."),
  skills: z.string().optional(), // For providers
  tagline: z.string().optional(),
  age: z.coerce.number().min(16, "You must be at least 16").optional(),
  pronouns: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function CreateProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useLocalStorage('userProfile', {});
  const [signupData, setSignupData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isGoogleSignIn, setIsGoogleSignIn] = useState(false);
  
  const approvedColleges = colleges.filter(c => c.approvalStatus);

  const isProvider = signupData?.accountType === 'provider';


  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      username: '',
      avatarUrl: '',
      skills: '',
      tagline: '',
      pronouns: '',
      interests: [],
    }
  });

  const { register, handleSubmit, setValue, watch, getValues, formState: { errors } } = form;
  
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
       if (data.collegeId) {
        setValue('collegeId', data.collegeId);
      }
      // A simple check to see if it was a Google sign-in
      if (data.isGoogleSignIn) {
        setIsGoogleSignIn(true);
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
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to create a profile.',
        });
        return;
    }

    setIsSubmitting(true);

    try {
        const skillsArray = data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
        const fullProfile = { 
          id: user.uid,
          email: user.email,
          name: data.name,
          username: data.username,
          collegeId: data.collegeId,
          avatarUrl: data.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${data.name}`,
          accountType: signupData?.accountType || 'seeker',
          age: data.age,
          pronouns: data.pronouns,
          interests: data.interests,
          // Provider specific fields
          skills: skillsArray, 
          tagline: data.tagline,
          rating: isProvider ? 4.5 + Math.random() * 0.5 : 0, // Mock rating for new providers
          earnings: 0,
        }; 

        // Save to local storage for immediate access
        setUserProfile(fullProfile);

        // Clean up temporary data
        localStorage.removeItem('signupData');

        toast({
            title: 'Profile Created!',
            description: 'Your profile has been successfully created.',
        });
        router.push('/dashboard');

    } catch (error) {
        console.error("Profile creation error:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not save your profile. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isUserLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <>
    <div className="container flex min-h-screen flex-col items-center justify-center py-8">
      <div className="w-full max-w-xl lg:p-8">
        <Card className="mx-auto bg-transparent border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Create Your {isProvider ? "Provider" : ""} Profile</CardTitle>
            <CardDescription>Just one more step. Let's get your profile ready.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-28 w-28 border-4 border-muted">
                      <AvatarImage src={previewImage ?? ''} />
                      <AvatarFallback className="text-3xl bg-secondary text-secondary-foreground">
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
                  <Input id="name" placeholder="e.g., Jane Doe" {...register('name')} disabled={isGoogleSignIn} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="flex items-center gap-2">
                      <Input id="username" placeholder="e.g., jane.doe" {...register('username')} />
                      <Button type="button" variant="ghost" size="icon" onClick={handleGenerateUsernames} disabled={isAiLoading}>
                          {isAiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-accent" />}
                          <span className="sr-only">Generate Usernames</span>
                      </Button>
                  </div>
                  {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" type="number" placeholder="e.g., 21" {...register('age')} />
                        {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pronouns">Pronouns</Label>
                        <Input id="pronouns" placeholder="e.g., she/her" {...register('pronouns')} />
                        {errors.pronouns && <p className="text-sm text-destructive">{errors.pronouns.message}</p>}
                    </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="college">College</Label>
                  <Controller
                    control={form.control}
                    name="collegeId"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                        <SelectTrigger id="college">
                          <SelectValue placeholder={"Select your college"} />
                        </SelectTrigger>
                        <SelectContent>
                          {approvedColleges.length > 0 ? (
                            approvedColleges.map((college) => (
                              <SelectItem key={college.id} value={college.id}>
                                {college.name}
                              </SelectItem>
                            ))
                          ) : (
                              <SelectItem value="no-colleges" disabled>No approved colleges available.</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                   />
                  {errors.collegeId && (
                    <p className="text-sm text-destructive">
                      {String(errors.collegeId?.message)}
                    </p>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="interests"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Interests</FormLabel>
                        <FormDescription>
                          Select a few of your interests.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {interestsList.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="interests"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      {errors.interests && <p className="text-sm text-destructive">{errors.interests.message}</p>}
                    </FormItem>
                  )}
                />
                
                {isProvider && (
                  <>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Profile Tagline</Label>
                    <Input
                      id="tagline"
                      placeholder="e.g., Full-Stack Developer & CS Tutor"
                      {...register('tagline')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills">Your Skills</Label>
                    <Textarea
                      id="skills"
                      placeholder="e.g., Web Design, Tutoring, Video Editing, Baking..."
                      {...register('skills')}
                    />
                    <p className="text-xs text-muted-foreground">
                      List the services you want to offer, separated by commas.
                    </p>
                    {errors.skills && <p className="text-sm text-destructive">{errors.skills.message}</p>}
                  </div>
                  </>
                )}


                <Button type="submit" disabled={isSubmitting || isUserLoading} className="w-full">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save and Continue'}
                </Button>
              </form>
            </Form>
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
