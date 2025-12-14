
import { Metadata } from 'next';
import Link from 'next/link';
import { UserAuthForm } from '@/components/auth/user-auth-form';
import { BookOpenCheck } from 'lucide-react';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Sign Up - STUDORA',
  description: 'Create a new STUDORA account.',
};

export default function SignupPage() {
  return (
    <FirebaseClientProvider>
      <div className="container relative flex h-screen flex-col items-center justify-center">
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
            <div className="flex flex-col space-y-2 text-center">
              <BookOpenCheck className="mx-auto h-8 w-8 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and password to get started.
              </p>
            </div>
            <UserAuthForm mode="signup" />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{' '}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
            <p className="px-8 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="underline underline-offset-4 hover:text-primary font-semibold"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </FirebaseClientProvider>
  );
}
