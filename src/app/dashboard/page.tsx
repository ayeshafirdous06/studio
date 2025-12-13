
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Star, Briefcase, Clock, User, Search } from "lucide-react";
import Link from "next/link";
import { serviceRequests, serviceProviders, users, colleges } from "@/lib/data";
import { placeholderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/use-local-storage";

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
};


export default function DashboardPage() {
    const [collegeSearch, setCollegeSearch] = useState('');
    const [currentUser] = useLocalStorage<UserProfile | null>('userProfile', null);

    const isProvider = currentUser?.accountType === 'provider';

    const filteredProviders = useMemo(() => {
        return serviceProviders.filter(provider => {
            if (!collegeSearch) return true;
            const student = users.find(u => u.id === provider.studentId);
            if (!student) return false;
            const college = colleges.find(c => c.id === student.collegeId);
            if (!college) return false;
            return college.name.toLowerCase().includes(collegeSearch.toLowerCase());
        });
    }, [collegeSearch]);
    
    const defaultTab = isProvider ? "requests" : "providers";

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
                    <div className="w-full md:w-auto">
                        <div className="relative">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                             <Input 
                                 placeholder="Search by college name..."
                                 className="pl-9 w-full md:w-[300px]"
                                 value={collegeSearch}
                                 onChange={(e) => setCollegeSearch(e.target.value)}
                             />
                        </div>
                    </div>
                </div>
                
                {isProvider && (
                    <TabsContent value="requests">
                        <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                            {serviceRequests.map(request => {
                                const student = users.find(u => u.id === request.studentId);
                                const avatar = placeholderImages.find(p => p.id === student?.avatarId);
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
                                                <span>Deadline: {formatDistanceToNow(request.deadline, { addSuffix: true })}</span>
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
                                                        {avatar && <AvatarImage src={avatar.imageUrl} alt={student.name} />}
                                                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{student.name}</span>
                                                </div>
                                        )}
                                        <Button variant="outline">View & Offer</Button>
                                        </CardFooter>
                                    </Card>
                                )
                            })}
                        </div>
                    </TabsContent>
                )}

                <TabsContent value="providers">
                     <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredProviders.map(provider => {
                             const student = users.find(u => u.id === provider.studentId);
                             const avatar = placeholderImages.find(p => p.id === student?.avatarId);
                             if (!student) return null;
                             return (
                                <Card key={provider.studentId} className="flex flex-col">
                                    <CardHeader className="items-center text-center">
                                        <Avatar className="h-20 w-20 mb-2">
                                            {avatar && <AvatarImage src={avatar.imageUrl} alt={student.name} />}
                                            <AvatarFallback className="text-3xl">{student.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <CardTitle>{student.name}</CardTitle>
                                        <CardDescription>{provider.tagline}</CardDescription>
                                        <div className="flex items-center pt-2">
                                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                                            <span className="font-bold">{student.rating.toFixed(1)}</span>
                                            <span className="text-muted-foreground ml-1">(from reviews)</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <p className="font-semibold mb-2 text-sm">Top Skills:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {provider.skills.slice(0, 5).map(skill => (
                                                <Badge key={skill} variant="secondary">{skill}</Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild className="w-full">
                                          <Link href={`/profile/${student.id}`}>
                                            <User className="mr-2 h-4 w-4" />
                                            View Profile
                                          </Link>
                                        </Button>
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
