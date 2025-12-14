
'use client';

import { SiteHeader } from "@/components/common/site-header";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalStorage } from "@/hooks/use-local-storage";

type UserProfile = {
  id?: string;
  name?: string;
  accountType?: 'provider' | 'seeker';
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('userProfile', null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    // This effect handles authentication and profile checks.
    // It will only run to completion after the initial Firebase auth check is done.

    // 1. Wait until Firebase has determined the auth state.
    if (isUserLoading) {
      return; 
    }

    // 2. After loading, if there's no user, they are not logged in. Redirect home.
    if (!user) {
      router.replace("/");
      return;
    }

    // 3. If we reach here, the user is authenticated. Now, check for their profile.
    const checkUserProfile = async () => {
      // If profile is already in local storage and matches the current user, we are good.
      if (userProfile && userProfile.id === user.uid) {
        setIsCheckingProfile(false);
        return;
      }
      
      // If no profile in local storage, or if it doesn't match the current user,
      // try fetching it from Firestore.
      if (firestore) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            // Profile exists in Firestore, save it to local storage for future loads.
            const profileFromDb = userDocSnap.data() as UserProfile;
            setUserProfile({ ...profileFromDb, id: user.uid });
          } else {
            // No profile exists in the database for this authenticated user.
            // This means they need to create one. This can happen with Google Sign-In on first login.
            const pendingAccountType = localStorage.getItem('pendingAccountType') || 'seeker';
            localStorage.removeItem('pendingAccountType');

            const signupPayload = {
              email: user.email,
              name: user.displayName || '',
              uid: user.uid,
              isGoogleSignIn: user.providerData.some(p => p.providerId === 'google.com'),
              accountType: pendingAccountType,
            };
            localStorage.setItem('signupData', JSON.stringify(signupPayload));
            router.replace("/profile/create");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Failsafe: redirect home on error to prevent getting stuck
          router.replace("/"); 
        } finally {
            setIsCheckingProfile(false);
        }
      } else {
        // Firestore not available yet, stop checking for now.
        setIsCheckingProfile(false);
      }
    };

    checkUserProfile();

  }, [user, isUserLoading, router, firestore, userProfile, setUserProfile]);

  // While loading auth state or checking profile, show a skeleton screen.
  if (isUserLoading || isCheckingProfile) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-20" />
            </div>
        </header>
        <main className="flex-1 p-8">
            <div className="flex h-screen items-center justify-center">
                 <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-dashed border-primary"></div>
                    <span className="text-muted-foreground">Signing in...</span>
                </div>
            </div>
        </main>
      </div>
    );
  }

  // Once all checks are passed, render the actual layout and children
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}

    