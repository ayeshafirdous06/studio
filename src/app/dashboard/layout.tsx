
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
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait until the initial user loading is complete
    if (isUserLoading) {
      return; 
    }

    // After loading, if there's no user, they are not logged in.
    if (!user) {
      router.replace("/");
      return;
    }

    // If we reach here, the user is authenticated. Now, check for their profile.
    const checkUserProfile = async () => {
      // If profile is already in local storage and matches current user, we're good.
      if (userProfile && userProfile.id === user.uid) {
        setIsChecking(false);
        return;
      }

      // If not, try fetching it from Firestore.
      if (firestore) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const profileFromDb = userDocSnap.data();
            setUserProfile(profileFromDb as UserProfile);
            setIsChecking(false);
          } else {
            // No profile exists in the database for this authenticated user.
            // This means they need to create one.
            router.replace("/profile/create");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Failsafe: redirect home on error to prevent getting stuck
          router.replace("/"); 
        }
      }
    };

    checkUserProfile();

  }, [user, isUserLoading, userProfile, router, firestore, setUserProfile]);

  // While loading auth state or checking profile, show a skeleton screen.
  if (isUserLoading || isChecking) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-20" />
            </div>
        </header>
        <main className="flex-1 p-8">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
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
