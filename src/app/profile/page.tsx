
'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { colleges } from '@/lib/data';
import { Star, Edit, DollarSign, Sparkles, Loader2, Save, LogOut, Cake, UserCircle, Upload } from 'lucide-react';
import { recommendSkillsForProvider } from '@/ai/flows/skill-recommendation-for-providers';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BackButton } from '@/components/common/back-button';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { ServiceRequestForm } from '@/app/services/new/page';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

type StoredRequest = ServiceRequestForm & { id: string; status: string; };

type UserProfile = {
  id: string;
  name: string;
  username: string;
  email: string;
  collegeId: string;
  avatarUrl: string;
  rating: number;
  earnings: number;
  accountType: 'provider' | 'seeker';
  skills?: string[];
  tagline?: string;
  age?: number;
  pronouns?: string;
  interests?: string[];
};

export default function ProfilePage() {
    const { toast } = useToast();
    const router = useRouter();
    const auth = useAuth();
    const [currentUser, setCurrentUser] = useLocalStorage<UserProfile | null>('userProfile', null);
    
    const userCollege = currentUser ? colleges.find(c => c.id === currentUser.collegeId) : null;
    
    const [isEditing, setIsEditing] = useState(false);
    const [profileSummary, setProfileSummary] = useState("I'm a third-year design student specializing in branding and digital illustration. I have experience with Adobe Creative Suite and have completed several freelance logo design projects. I'm passionate about creating visually compelling identities for clubs and student startups.");
    const [skills, setSkills] = useState<string[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    const [myRequests, setMyRequests] = useLocalStorage<(StoredRequest & { title: string })[]>('my-requests', []);
    const [isLoading, setIsLoading] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const isProvider = currentUser?.accountType === 'provider';
    
    useEffect(() => {
        if (currentUser) {
            setSkills(currentUser.skills || []);
            setProfileSummary(currentUser.tagline || profileSummary);
            setPreviewImage(currentUser.avatarUrl);
            setIsLoading(false);
        } else {
             // If no profile in local storage, maybe they haven't created one
             const timeout = setTimeout(() => {
                // if still no user after a bit, assume not logged in or no profile
                if(!currentUser) {
                    setIsLoading(false); // Stop loading to show the 'not found' message
                }
             }, 2000);
             return () => clearTimeout(timeout);
        }
    }, [currentUser, profileSummary]);


    const handleLogout = async () => {
        try {
            if (auth) {
                await signOut(auth);
            }
            localStorage.removeItem('userProfile');
            toast({
                title: 'Signed Out',
                description: 'You have been successfully signed out.',
            });
            router.push('/');
        } catch (error) {
            console.error("Error signing out:", error);
            toast({
                variant: 'destructive',
                title: 'Sign Out Failed',
                description: 'There was an issue signing you out. Please try again.',
            });
        }
    };


    const handleGetRecommendations = async () => {
        if (!profileSummary) {
            toast({
                variant: 'destructive',
                title: 'Profile Summary Needed',
                description: 'Please write a summary before getting AI recommendations.'
            });
            return;
        }
        setIsAiLoading(true);
        try {
            const result = await recommendSkillsForProvider({
                profileSummary: profileSummary,
                servicesInDemand: "High demand for web development (React, Next.js), mobile app development, video editing for social media, and academic tutoring in STEM subjects.",
            });
            
            const newSkills = [...new Set([...skills, ...result.recommendedSkills])];
            setSkills(newSkills);

            toast({
                title: "AI Recommendations Added!",
                description: result.rationale,
            });

        } catch (error) {
            console.error("AI skill recommendation failed:", error);
            toast({
                variant: "destructive",
                title: "AI Error",
                description: "Could not fetch skill recommendations.",
            });
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setPreviewImage(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSaveChanges = () => {
        if (currentUser) {
            setCurrentUser({ 
                ...currentUser, 
                skills: skills, 
                tagline: profileSummary,
                avatarUrl: previewImage || currentUser.avatarUrl,
            });
        }
        setIsEditing(false);
        toast({
            title: "Profile Saved!",
            description: "Your changes have been saved successfully."
        });
    }

    if (isLoading) {
        return (
             <>
                <div className="container py-8">
                    <Skeleton className="h-8 w-24 mb-4" />
                    <Card className="mb-8">
                        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                            <Skeleton className="h-32 w-32 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-6 w-64" />
                                <Skeleton className="h-6 w-80" />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-48" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                    </div>
                </div>
            </>
        )
    }

    if (!currentUser || !currentUser.id) {
        return (
            <>
                <div className="container py-8 text-center">
                     <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                    <Card className="max-w-md mx-auto">
                        <CardHeader>
                            <CardTitle>Profile Not Found</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Could not load user profile. Please sign in to view your profile.</p>
                            <Button onClick={() => router.push('/login')} className="mt-4">Go to Login</Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        )
    }


    return (
        <>
            <div className="container py-8">
                <BackButton />
                <Card className="mb-8">
                    <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <Avatar className="h-24 w-24 md:h-32 md:w-32 border">
                                {previewImage && <AvatarImage src={previewImage} alt={currentUser.name} />}
                                <AvatarFallback className="text-4xl">
                                    {currentUser?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                             {isEditing && (
                                <div className="absolute bottom-0 right-0">
                                    <Button size="icon" className="h-8 w-8 rounded-full" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="h-4 w-4"/>
                                        <span className="sr-only">Upload photo</span>
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/gif"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold font-headline">{currentUser.name}</h1>
                            <p className="text-muted-foreground">@{currentUser.username} &middot; Student at {userCollege?.name || 'their college'}</p>
                            
                            <div className="flex items-center justify-center md:justify-start mt-2 space-x-4 text-sm text-muted-foreground">
                                {currentUser.age && (
                                    <div className="flex items-center">
                                        <Cake className="mr-1.5 h-4 w-4" />
                                        <span>{currentUser.age} years old</span>
                                    </div>
                                )}
                                {currentUser.pronouns && (
                                    <div className="flex items-center">
                                        <UserCircle className="mr-1.5 h-4 w-4" />
                                        <span>{currentUser.pronouns}</span>
                                    </div>
                                )}
                            </div>

                            {isProvider && (
                                <div className="flex items-center justify-center md:justify-start mt-2">
                                    <div className="flex items-center">
                                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                                        <span className="font-bold">{currentUser.rating.toFixed(1)}</span>
                                        <span className="text-muted-foreground ml-1">(23 reviews)</span>
                                    </div>
                                    <div className="mx-4 h-6 w-px bg-border" />
                                    <div className="flex items-center">
                                        <DollarSign className="h-5 w-5 text-green-500" />
                                        <span className="font-bold">{currentUser.earnings.toFixed(2)}</span>
                                        <span className="text-muted-foreground ml-1">Total Earnings</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            {isEditing ? (
                                 <Button onClick={handleSaveChanges}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            ) : (
                                <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Profile
                                </Button>
                            )}
                             <Button variant="ghost" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Log Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Tabs defaultValue={isProvider ? "gigs" : "requests"}>
                            <TabsList>
                                {isProvider && <TabsTrigger value="gigs">My Gigs</TabsTrigger>}
                                <TabsTrigger value="requests">My Requests</TabsTrigger>
                                {isProvider && <TabsTrigger value="reviews">Reviews</TabsTrigger>}
                            </TabsList>
                            {isProvider && (
                                <TabsContent value="gigs" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Active Gigs</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground">You have no active gigs. Offer your skills on service requests to get started!</p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}
                             <TabsContent value="requests" className="mt-4">
                                <div className="space-y-4">
                                    {myRequests.map(request => (
                                        <Card key={request.id}>
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold">{request.title}</h3>
                                                    <p className="text-sm text-muted-foreground">Budget: ₹{request.budget}</p>
                                                </div>
                                                <Badge variant={request.status === 'Open' ? 'default' : 'secondary'}>{request.status}</Badge>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {myRequests.length === 0 && <p className="text-muted-foreground text-sm p-4">You haven't posted any requests yet.</p>}
                                </div>
                            </TabsContent>
                            {isProvider && (
                                <TabsContent value="reviews" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Reviews</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground">No reviews yet.</p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>{isProvider ? "My Skills & Profile" : "My Profile Summary"}</CardTitle>
                                {!isEditing && <CardDescription>{isProvider ? "This is how others find you." : "A brief summary about you."}</CardDescription>}
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="summary">Profile Summary (Tagline)</Label>
                                            <Textarea 
                                                id="summary" 
                                                value={profileSummary} 
                                                onChange={(e) => setProfileSummary(e.target.value)}
                                                className="min-h-[120px] mt-1"
                                                placeholder="Tell everyone what you're great at..."
                                            />
                                        </div>
                                        {isProvider && (
                                            <Button size="sm" onClick={handleGetRecommendations} disabled={isAiLoading} className="w-full">
                                                {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                                                Suggest Skills with AI
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <p className='text-sm text-muted-foreground mb-4'>{profileSummary}</p>
                                )}
                                 {isProvider && (
                                     <div className="flex flex-wrap gap-2 mt-4">
                                        {skills.map(skill => (
                                            <Badge key={skill} variant="secondary">{skill}</Badge>
                                        ))}
                                    </div>
                                 )}
                                {isEditing && isProvider && (
                                    <p className='text-xs text-muted-foreground mt-2'>Your skills will update based on AI suggestions.</p>
                                )}
                            </CardContent>
                        </Card>
                        {currentUser.interests && currentUser.interests.length > 0 && (
                             <Card>
                                <CardHeader>
                                    <CardTitle>Interests</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {currentUser.interests.map(interest => (
                                            <Badge key={interest} variant="outline">{interest}</Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
