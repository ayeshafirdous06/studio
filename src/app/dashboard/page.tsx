
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Star, Briefcase, Clock, User, Search, CheckCircle2, UserPlus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useUser } from "@/firebase";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { serviceRequests, serviceProviders } from "@/lib/data";
import { placeholderImages } from "@/lib/placeholder-images";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";


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


export default function DashboardPage() {
    const { user } = useUser();
    const [currentUser] = useLocalStorage<UserProfile | null>('userProfile', null);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [sentRequests, setSentRequests] = useState<string[]>([]);

    const isProvider = currentUser?.accountType === 'provider';

    const filteredProviders = serviceProviders.filter(provider => 
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const handleAddFriend = (providerId: string) => {
        setSentRequests(prev => [...prev, providerId]);
    };


    return (
        <div className="container py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold font-headline">Marketplace</h1>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href="/services/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Post a Request
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/profile">
                            <User className="mr-2 h-4 w-4" />
                           My Profile
                        </Link>
                    </Button>
                </div>
            </div>
            
            <div>
                <h2 className="text-2xl font-semibold mb-4">Service Providers</h2>
                <div className="relative mb-6">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search providers by name or username..." 
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                     {filteredProviders.map(provider => {
                        const providerAvatar = placeholderImages.find(p => p.id === provider.avatarId);
                        const isOwnProfile = currentUser?.id === provider.id;
                        const isRequestSent = sentRequests.includes(provider.id);

                        return (
                            <Card key={provider.id}>
                                <CardHeader className="flex flex-col items-center text-center">
                                    <CardTitle className="text-2xl mb-2">{provider.name}</CardTitle>
                                     <Avatar className="h-24 w-24 mb-2">
                                        {providerAvatar && <AvatarImage src={providerAvatar.imageUrl} alt={provider.name} />}
                                        <AvatarFallback className="text-3xl">{provider.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm text-muted-foreground">@{provider.username}</p>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2 h-10">{provider.tagline}</p>
                                    <div className="flex flex-wrap gap-2 justify-center mb-4 min-h-[52px]">
                                        {provider.skills.slice(0, 3).map((skill:string) => (
                                            <Badge key={skill} variant="secondary">{skill}</Badge>
                                        ))}
                                    </div>
                                     <div className="flex items-center justify-center">
                                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                                        <span className="font-bold">{provider.rating.toFixed(1)}</span>
                                        <span className="text-muted-foreground ml-1">({provider.reviews} reviews)</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-2">
                                    <Button className="w-full" asChild>
                                        <Link href="#">View Profile</Link>
                                    </Button>
                                    {!isOwnProfile && (
                                        <Button 
                                            variant="secondary" 
                                            className="w-full" 
                                            onClick={() => handleAddFriend(provider.id)}
                                            disabled={isRequestSent}
                                        >
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            {isRequestSent ? 'Request Sent' : 'Add Friend'}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            </div>

            <Separator className="my-12" />

            <div>
                 <h2 className="text-2xl font-semibold mb-4">Open for Bids</h2>
                 <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                    {serviceRequests.map(request => {
                        const requestor = serviceProviders.find(p => p.id === request.studentId);
                        const requestorAvatar = requestor ? placeholderImages.find(p => p.id === requestor.avatarId) : null;
                        const acceptedProvider = request.providerId ? serviceProviders.find(p => p.id === request.providerId) : null;
                        
                        const isMyRequest = currentUser?.id === request.studentId;
                        const isAccepted = request.status === 'In Progress';

                        return (
                            <Card key={request.id} className={cn(isAccepted && "bg-muted/50 border-dashed")}>
                                <CardHeader>
                                    <CardTitle className="line-clamp-2">{request.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-2 pt-2">
                                        <Avatar className="h-6 w-6">
                                            {requestorAvatar && <AvatarImage src={requestorAvatar.imageUrl} alt={requestor?.name} />}
                                            <AvatarFallback>{requestor?.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{requestor?.name}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 h-[60px]">{request.description}</p>
                                     <div className="flex flex-wrap gap-1 mb-4">
                                        {request.skills.map(skill => (
                                            <Badge key={skill} variant="outline">{skill}</Badge>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                        <div className="font-bold text-lg text-foreground">₹{request.budget}</div>
                                        <div className="flex items-center">
                                            <Clock className="mr-1 h-4 w-4" />
                                            <span>{formatDistanceToNow(new Date(request.deadline), { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col items-start gap-3">
                                    {isAccepted && acceptedProvider && (
                                        <div className="w-full text-center text-sm p-2 rounded-md bg-accent text-accent-foreground flex items-center justify-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>Offer accepted from @{acceptedProvider.username}</span>
                                        </div>
                                    )}

                                    {isMyRequest ? (
                                         <Button className="w-full" variant="secondary">Manage</Button>
                                    ) : isProvider ? (
                                        <Button className="w-full" disabled={isAccepted}>
                                            {isAccepted ? 'Offer Accepted' : 'Place Bid'}
                                        </Button>
                                    ) : (
                                        <Button className="w-full" disabled>Sign up as Provider to Bid</Button>
                                    )}
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            </div>

        </div>
    );
}
