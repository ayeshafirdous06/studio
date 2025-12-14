import type { Metadata } from 'next';
import '../../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

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
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
