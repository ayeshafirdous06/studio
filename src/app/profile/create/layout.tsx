import type { Metadata } from 'next';
import '../../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Create Your Profile - STUDORA',
  description: 'Set up your account to get started.',
};

export default function CreateProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground">
      <FirebaseClientProvider>
        {children}
      </FirebaseClientProvider>
      <Toaster />
    </div>
  );
}
