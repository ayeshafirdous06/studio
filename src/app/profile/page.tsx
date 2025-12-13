
'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SiteHeader } from '@/components/common/site-header';
import { users, serviceRequests as mockRequests, colleges } from '@/lib/data';
import { placeholderImages } from '@/lib/placeholder-images';
import { Star, Edit, DollarSign, Sparkles, Loader2, Save } from 'lucide-react';
import { recommendSkillsForProvider } from '@/ai/flows/skill-recommendation-for-providers';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BackButton } from '@/components/common/back-button';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { ServiceRequestForm } from '@/app/services/new/page';

// In a real app, this would come from an auth hook like useUser()
const currentUserId = '1'; 

type StoredRequest = ServiceRequestForm & { id: string; status: string; };

export default function ProfilePage() {
    const { toast } = useToast();

    // In a real app, these would be fetched from your database for the current user
    const [currentUser, setCurrentUser] = useState(() => users.find(u => u.id === currentUserId)!);
    const userAvatar = placeholderImages.find(p => p.id === currentUser.avatarId);
    const userCollege = colleges.find(c => c.id === currentUser.collegeId);
    
    const [isEditing, setIsEditing] = useState(false);
    const [profileSummary, setProfileSummary] = useState("I'm a third-year design student specializing in branding and digital illustration. I have experience with Adobe Creative Suite and have completed several freelance logo design projects. I'm passionate about creating visually compelling identities for clubs and student startups.");
    const [skills, setSkills] = useState<string[]>(['Graphic Design', 'Logo Design', 'Adobe Illustrator', 'Branding', 'UI/UX']);
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    // This simulates fetching requests created by the user
    const [myRequests] = useLocalStorage<StoredRequest[]>('my-requests', []);
    const allUserRequests = [...mockRequests.filter(r => r.studentId === currentUser.id), ...myRequests];

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

    const handleSaveChanges = () => {
        // In a real app, this would save the profileSummary and skills to the database
        setIsEditing(false);
        toast({
            title: "Profile Saved!",
            description: "Your changes have been saved successfully."
        });
    }

    return (
        <>
            <SiteHeader />
            <div className="container py-8">
                <BackButton />
                <Card className="mb-8">
                    <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                        <Avatar className="h-24 w-24 md:h-32 md:w-32 border">
                            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={currentUser.name} />}
                            <AvatarFallback className="text-4xl">{currentUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold font-headline">{currentUser.name}</h1>
                            <p className="text-muted-foreground">Student at {userCollege?.name}</p>
                            <div className="flex items-center justify-center md:justify-start mt-2">
                                <div className="flex items-center">
                                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                                    <span className="font-bold">{currentUser.rating.toFixed(1)}</span>
                                    <span className="text-muted-foreground ml-1">(23 reviews)</span>
                                </div>
                                <div className="mx-4 h-6 w-px bg-border" />
                                <div className="flex items-center">
                                    <DollarSign className="h-5 w-5 text-accent mr-1" />
                                    <span className="font-bold">${currentUser.earnings.toFixed(2)}</span>
                                    <span className="text-muted-foreground ml-1">Total Earnings</span>
                                </div>
                            </div>
                        </div>
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
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="gigs">
                            <TabsList>
                                <TabsTrigger value="gigs">My Gigs</TabsTrigger>
                                <TabsTrigger value="requests">My Requests</TabsTrigger>
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                            </TabsList>
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
                             <TabsContent value="requests" className="mt-4">
                                <div className="space-y-4">
                                    {allUserRequests.map(request => (
                                        <Card key={request.id}>
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold">{request.title}</h3>
                                                    <p className="text-sm text-muted-foreground">Budget: ${request.budget}</p>
                                                </div>
                                                <Badge variant={request.status === 'Open' ? 'default' : 'secondary'}>{request.status}</Badge>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {allUserRequests.length === 0 && <p className="text-muted-foreground text-sm p-4">You haven't posted any requests yet.</p>}
                                </div>
                            </TabsContent>
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
                        </Tabs>
                    </div>
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>My Skills & Profile</CardTitle>
                                {!isEditing && <CardDescription>This is how others find you.</CardDescription>}
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="summary">Profile Summary</Label>
                                            <Textarea 
                                                id="summary" 
                                                value={profileSummary} 
                                                onChange={(e) => setProfileSummary(e.target.value)}
                                                className="min-h-[120px] mt-1"
                                                placeholder="Tell everyone what you're great at..."
                                            />
                                        </div>
                                        <Button size="sm" onClick={handleGetRecommendations} disabled={isAiLoading} className="w-full">
                                            {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                                            Suggest Skills with AI
                                        </Button>
                                    </div>
                                ) : (
                                    <p className='text-sm text-muted-foreground mb-4'>{profileSummary}</p>
                                )}
                                 <div className="flex flex-wrap gap-2 mt-4">
                                    {skills.map(skill => (
                                        <Badge key={skill} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>
                                {isEditing && (
                                    <p className='text-xs text-muted-foreground mt-2'>Your skills will update based on AI suggestions.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}
