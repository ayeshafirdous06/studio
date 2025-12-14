
'use client';

import { SiteHeader } from "@/components/common/site-header";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { FirebaseClientProvider, useFirebase, useFirestore, useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { doc, getDoc } from "firebase/firestore";


function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [userProfile, setUserProfile] = useLocalStorage('userProfile', null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (isUserLoading) {
      return; 
    }

    if (!user) {
      router.replace('/login');
      return;
    }
    
    // If we have a user from Firebase, check for the app profile
    if (user) {
        // 1. Check local storage first
        if (userProfile && userProfile.id === user.uid) {
            setAuthChecked(true); // Profile is in sync
            return;
        }

        // 2. If not in local storage, fetch from Firestore
        const fetchProfile = async () => {
            const userDocRef = doc(firestore, 'users', user.uid);
            try {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const profileData = userDoc.data();
                    setUserProfile(profileData); // Save to local storage
                    setAuthChecked(true); // Allow access
                } else {
                    // Profile doesn't exist in DB, must create it
                    router.replace('/profile/create');
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                // Maybe redirect to an error page or back to login
                router.replace('/login');
            }
        };

        fetchProfile();
    }

  }, [user, isUserLoading, userProfile, router, firestore, setUserProfile]);


  if (!authChecked || isUserLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground">Verifying access...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <AuthGuard>{children}</AuthGuard>
        </main>
      </div>
    </FirebaseClientProvider>
  );
}
