
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
    if (isUserLoading) {
      return; 
    }

    if (!user) {
      router.replace("/");
      return;
    }

    // User is authenticated, now check for profile
    const checkUserProfile = async () => {
      if (userProfile && userProfile.id === user.uid) {
        // Profile is in local storage and matches the current user, we're good.
        setIsChecking(false);
        return;
      }

      // Profile not in local storage, try fetching from Firestore
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const profileFromDb = userDocSnap.data();
          setUserProfile(profileFromDb as UserProfile);
          setIsChecking(false);
        } else {
          // No profile in Firestore, this is a new user who needs to create one.
          router.replace("/profile/create");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Maybe redirect to an error page or show a toast
        router.replace("/"); // Failsafe
      }
    };

    checkUserProfile();

  }, [user, isUserLoading, userProfile, router, firestore, setUserProfile]);

  // While loading or checking, show a skeleton screen.
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

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
