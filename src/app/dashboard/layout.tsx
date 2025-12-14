
'use client';

import { SiteHeader } from "@/components/common/site-header";
import { FirebaseClientProvider } from "@/firebase";
import { useAuth }_from_ '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Skeleton } from '@/components/ui/skeleton';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [userProfile, setUserProfile] = useLocalStorage('userProfile', null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until Firebase auth state is resolved
    }

    if (!user) {
      // If no user, redirect to login
      router.replace('/login');
      return;
    }

    // If we already have a profile in local storage, we're good.
    if (userProfile && userProfile.id === user.uid) {
      setIsCheckingProfile(false);
      return;
    }

    // Auth is resolved, user exists, but we need to check for a Firestore profile
    const checkProfile = async () => {
      const userDocRef = doc(firestore, 'users', user.uid);
      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const profileData = { id: userDoc.id, ...userDoc.data() };
          setUserProfile(profileData);
        } else {
          // No profile document found, user needs to create one
          router.replace('/profile/create');
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Maybe redirect to an error page or show a toast
        // For now, let's block access if profile check fails
        router.replace('/login');
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfile();

  }, [user, isUserLoading, firestore, router, setUserProfile, userProfile]);

  if (isUserLoading || isCheckingProfile) {
    // Show a full-page loading skeleton while we verify auth and profile
    return (
      <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 p-4">
              <div className="container flex h-14 items-center">
                  <Skeleton className="h-6 w-32" />
                  <div className="flex-1" />
                  <Skeleton className="h-10 w-24" />
              </div>
          </header>
          <main className="flex-1 container py-8">
              <div className="space-y-6">
                  <Skeleton className="h-10 w-1/4" />
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <Skeleton className="h-64" />
                      <Skeleton className="h-64" />
                      <Skeleton className="h-64" />
                  </div>
              </div>
          </main>
      </div>
    );
  }

  // If we have a user and a profile, show the actual content
  if (user && userProfile) {
    return <>{children}</>;
  }

  // Fallback, should be covered by loading/redirects
  return null;
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <AuthGuard>
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </AuthGuard>
    </FirebaseClientProvider>
  );
}
