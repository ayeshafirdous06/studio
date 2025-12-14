import { UserAuthForm } from "@/components/auth/user-auth-form";
import { BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { BackButton } from "@/components/common/back-button";

export default function LoginPage() {
  return (
    <div className="container relative flex h-screen flex-col items-center justify-center">
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <BookOpenCheck className="mx-auto h-8 w-8 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Welcome back to STUDORA
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
          <UserAuthForm mode="login" />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign Up
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
