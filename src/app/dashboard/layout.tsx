
'use client';

import { SiteHeader } from "@/components/common/site-header";
import { useUser, useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

type UserProfile = {
  id: string;
  name: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Fail-safe timeout: never block UI indefinitely
    const authTimeout = setTimeout(() => {
      if (!authChecked) {
        console.warn("Auth timeout — redirecting to home for stability.");
        // If auth state is still unresolved after timeout, redirect to prevent getting stuck
        if (!user) {
            router.replace("/");
        }
        setAuthChecked(true); // Mark as checked to unblock UI
      }
    }, 3000); // 3-second timeout

    // This is the main auth checking logic
    const checkAuthAndProfile = async () => {
      if (isUserLoading) {
        return; // Wait until Firebase has determined the auth state
      }

      if (!user) {
        router.replace("/"); // No user found, redirect to home
        return;
      }
      
      // User is authenticated, now check for their profile
      try {
        if (!firestore) {
          console.error("Firestore not available");
          setAuthChecked(true); // Unblock UI even if firestore is down
          return;
        }
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          router.replace('/profile/create'); // New user, needs to create a profile
        } else {
           const profileData = { id: user.uid, ...userDocSnap.data() } as UserProfile;
           localStorage.setItem('userProfile', JSON.stringify(profileData));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setAuthChecked(true); // Mark auth as checked
      }
    };

    checkAuthAndProfile();

    // Cleanup the timeout if the component unmounts or effect re-runs
    return () => clearTimeout(authTimeout);

  }, [user, isUserLoading, router, firestore, authChecked]);

  if (!authChecked || isUserLoading) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-20" />
            </div>
        </header>
        <main className="flex-1 p-8">
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
                 <div className="flex items-center space-x-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-muted-foreground">Signing in...</span>
                </div>
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
