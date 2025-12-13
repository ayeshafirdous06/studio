'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase/provider';
import { setDoc, doc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BackButton } from '@/components/common/back-button';
import { setDocumentNonBlocking } from '@/firebase';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function CreateProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, firestore } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileForm) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be signed in to create a profile.',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const collegeId = localStorage.getItem('collegeId');
    if (!collegeId) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not find your college selection. Please sign up again.',
        });
        router.push('/signup');
        return;
    }
    
    try {
      const studentRef = doc(firestore, `colleges/${collegeId}/students`, user.uid);
      await setDoc(studentRef, {
        id: user.uid,
        name: data.name,
        email: user.email,
        collegeId: collegeId,
      });

      localStorage.removeItem('collegeId'); // Clean up

      toast({
        title: 'Profile Created!',
        description: 'Your profile has been successfully created.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error creating profile:', error);
       toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not create your profile.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <div className="lg:p-8">
        <BackButton />
        <Card className="mx-auto w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Create Your Profile</CardTitle>
            <CardDescription>Just one more step. Let's get your name.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="e.g., Jane Doe" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save and Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
