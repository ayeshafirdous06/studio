'use client';

import { FirebaseClientProvider } from "@/firebase";
import { SiteHeader } from "@/components/common/site-header";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </div>
    </FirebaseClientProvider>
  );
}
