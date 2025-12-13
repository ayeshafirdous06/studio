

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
    const { user } = useUser();
    const [currentUser] = useLocalStorage<UserProfile | null>('userProfile', null);
    const firestore = useFirestore();

    const isProvider = currentUser?.accountType === 'provider';

    // Fetch service requests - this is public for all users
    const requestsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'serviceRequests');
    }, [firestore]);
    const { data: serviceRequests, isLoading: requestsLoading } = useCollection<ServiceRequest>(requestsQuery);

    // Fetch all users to map request studentId to user details - THIS IS NO LONGER ALLOWED
    // We need to fetch user profiles one by one if needed, or denormalize data.
    // For now, we will fetch all users to display their details on request cards.
    // In a production app, you would denormalize the user's name/avatar onto the request document itself.
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
            
            <h2 className="text-2xl font-semibold mb-4">Open for Bids</h2>

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
                                    {isProvider && user?.uid !== request.studentId && <Button variant="outline" size="sm">Make Offer</Button>}
                                    {user?.uid === request.studentId && <Button variant="ghost" size="sm">Manage</Button>}
                                </div>
                                </CardFooter>
                            </Card>
                        )
                    }) : <p className="text-muted-foreground col-span-full">No service requests posted yet.</p>}
                </div>
            )}
        </div>
    );
}
