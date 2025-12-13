
'use client';

import { UserAuthForm } from "@/components/auth/user-auth-form";
import { BookOpenCheck, Briefcase, UserPlus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { BackButton } from "@/components/common/back-button";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const accountType = searchParams.get('accountType') || 'seeker'; // Default to seeker

  const isProvider = accountType === 'provider';

  return (
    <div className="container relative flex h-screen flex-col items-center justify-center">
      <div className="absolute top-4 left-4">
        <BackButton />
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
             {isProvider ? (
                <Briefcase className="mx-auto h-8 w-8 text-primary" />
             ) : (
                <UserPlus className="mx-auto h-8 w-8 text-primary" />
             )}
            <h1 className="text-2xl font-semibold tracking-tight">
              Create a {isProvider ? 'Provider' : 'Service Seeker'} Account
            </h1>
            <p className="text-sm text-muted-foreground">
              Join the student marketplace at your college
            </p>
          </div>
          <UserAuthForm mode="signup" accountType={accountType} />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Log In
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
