

'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Star, Briefcase, Clock, User, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { serviceRequests, serviceProviders } from "@/lib/data";
import { placeholderImages } from "@/lib/placeholder-images";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


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
};


export default function DashboardPage() {
    const { user } = useUser();
    const [currentUser] = useLocalStorage<UserProfile | null>('userProfile', null);
    
    const [searchQuery, setSearchQuery] = useState('');

    const isProvider = currentUser?.accountType === 'provider';

    const filteredProviders = serviceProviders.filter(provider => 
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.username.toLowerCase().includes(searchQuery.toLowerCase())
    );


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
            
             <Tabs defaultValue="requests">
                <TabsList>
                    <TabsTrigger value="requests">Open for Bids</TabsTrigger>
                    <TabsTrigger value="providers">Service Providers</TabsTrigger>
                </TabsList>
                <TabsContent value="requests" className="mt-4">
                     <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                        {serviceRequests && serviceRequests.length > 0 ? serviceRequests.map(request => {
                             const student = serviceProviders.find(u => u.id === request.studentId);
                             const studentAvatar = student ? placeholderImages.find(p => p.id === student.avatarId) : null;
                            return (
                                <Card key={request.id} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{request.title}</CardTitle>
                                        <CardDescription className="line-clamp-2">{request.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-4">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Briefcase className="mr-2 h-4 w-4" />
                                            <span>{request.serviceType}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <span className="font-bold text-lg mr-2">₹</span>
                                            <span>Budget: {request.budget}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Clock className="mr-2 h-4 w-4" />
                                            <span>Deadline: {formatDistanceToNow(new Date(request.deadline), { addSuffix: true })}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {request.skills.slice(0, 4).map((skill: string) => (
                                                <Badge key={skill} variant="secondary">{skill}</Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between items-center">
                                    {student && (
                                            <div className="flex items-center space-x-2 text-sm">
                                                <Avatar className="h-8 w-8">
                                                    {studentAvatar && <AvatarImage src={studentAvatar.imageUrl} alt={student.name} />}
                                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>{student.name}</span>
                                            </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        {isProvider && user?.uid !== request.studentId && <Button variant="outline" size="sm">Make Offer</Button>}
                                        {currentUser?.id === request.studentId && <Button variant="ghost" size="sm">Manage</Button>}
                                    </div>
                                    </CardFooter>
                                </Card>
                            )
                        }) : <p className="text-muted-foreground col-span-full">No service requests posted yet.</p>}
                    </div>
                </TabsContent>
                <TabsContent value="providers" className="mt-4">
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
                            return (
                                <Card key={provider.id}>
                                    <CardHeader className="items-center text-center">
                                        <CardTitle className="text-2xl">{provider.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">@{provider.username}</p>
                                        <Avatar className="h-24 w-24 mt-4">
                                            {providerAvatar && <AvatarImage src={providerAvatar.imageUrl} alt={provider.name} />}
                                            <AvatarFallback className="text-3xl">{provider.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
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
                                    <CardFooter>
                                        <Button className="w-full">View Profile</Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
