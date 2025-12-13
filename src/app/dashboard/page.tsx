

'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Star, Briefcase, Clock, User, Search } from "lucide-react";
import Link from "next/link";
import { placeholderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

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

type ServiceRequest = {
    id: string;
    title: string;
    description: string;
    serviceType: string;
    budget: number;
    deadline: { seconds: number; nanoseconds: number; }; // Firestore timestamp
    studentId: string;
    status: string;
    skills: string[];
}


export default function DashboardPage() {
    const [currentUser] = useLocalStorage<UserProfile | null>('userProfile', null);
    const firestore = useFirestore();

    const isProvider = currentUser?.accountType === 'provider';
    const defaultTab = isProvider ? "requests" : "providers";

    // Fetch service providers
    const providersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "users"), where("accountType", "==", "provider"));
    }, [firestore]);
    const { data: serviceProviders, isLoading: providersLoading } = useCollection<UserProfile>(providersQuery);

    // Fetch service requests
    const requestsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // In a real app, you'd probably filter this more (e.g., by college)
        return collection(firestore, 'serviceRequests');
    }, [firestore]);
    const { data: serviceRequests, isLoading: requestsLoading } = useCollection<ServiceRequest>(requestsQuery);

    // Fetch all users to map request studentId to user details
    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);
    const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);


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

            <Tabs defaultValue={defaultTab} className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {isProvider ? (
                        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                            <TabsTrigger value="requests">Service Requests</TabsTrigger>
                            <TabsTrigger value="providers">Service Providers</TabsTrigger>
                        </TabsList>
                    ) : (
                         <h2 className="text-2xl font-semibold">Find a Provider</h2>
                    )}
                </div>
                
                {isProvider && (
                    <TabsContent value="requests">
                        {requestsLoading || usersLoading ? (
                             <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
                             </div>
                        ) : (
                            <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                                {serviceRequests && serviceRequests.length > 0 ? serviceRequests.map(request => {
                                    const student = users?.find(u => u.id === request.studentId);
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
                                                    <span>Deadline: {formatDistanceToNow(new Date(request.deadline.seconds * 1000), { addSuffix: true })}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {request.skills.slice(0, 4).map(skill => (
                                                        <Badge key={skill} variant="secondary">{skill}</Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex justify-between items-center">
                                            {student && (
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <Avatar className="h-8 w-8">
                                                            {student.avatarUrl && <AvatarImage src={student.avatarUrl} alt={student.name} />}
                                                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{student.name}</span>
                                                    </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm">Make Offer</Button>
                                                <Button variant="ghost" size="sm">Dismiss</Button>
                                            </div>
                                            </CardFooter>
                                        </Card>
                                    )
                                }) : <p className="text-muted-foreground col-span-full">No service requests posted yet.</p>}
                            </div>
                        )}
                    </TabsContent>
                )}

                <TabsContent value="providers">
                     {providersLoading ? (
                        <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                           {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                        </div>
                     ) : (
                         <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                            {serviceProviders && serviceProviders.length > 0 ? serviceProviders.map(provider => {
                                 return (
                                    <Card key={provider.id} className="flex flex-col">
                                        <CardHeader className="items-center text-center">
                                            <Avatar className="h-20 w-20 mb-2">
                                                {provider.avatarUrl && <AvatarImage src={provider.avatarUrl} alt={provider.name} />}
                                                <AvatarFallback className="text-3xl">{provider.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <CardTitle>{provider.name}</CardTitle>
                                            <CardDescription>{provider.tagline}</CardDescription>
                                            <div className="flex items-center pt-2">
                                                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                                                <span className="font-bold">{provider.rating.toFixed(1)}</span>
                                                <span className="text-muted-foreground ml-1">(from reviews)</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <p className="font-semibold mb-2 text-sm">Top Skills:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {provider.skills?.slice(0, 5).map(skill => (
                                                    <Badge key={skill} variant="secondary">{skill}</Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button asChild className="w-full">
                                              <Link href={`/profile/${provider.id}`}>
                                                <User className="mr-2 h-4 w-4" />
                                                View Profile
                                              </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                 )
                            }) : <p className="text-muted-foreground col-span-full">No service providers have signed up yet.</p>}
                         </div>
                     )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
