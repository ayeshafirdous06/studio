
'use client';

import { SiteHeader } from "@/components/common/site-header";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until Firebase auth state is determined
    }

    if (!user) {
      router.replace("/"); // User is not logged in, redirect to home
    } else {
      setIsChecking(false); // User is logged in
    }
  }, [user, isUserLoading, router]);

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

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}

    