
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { colleges } from "@/lib/data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, FirebaseError } from 'firebase/auth';
import { useAuth } from '@/firebase';


interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: "login" | "signup";
  accountType?: 'provider' | 'seeker';
}

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  collegeId: z.string({ required_error: "Please select your college." }).min(1, "Please select your college."),
  accountType: z.enum(['provider', 'seeker']),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export function UserAuthForm({ className, mode, accountType = 'seeker', ...props }: UserAuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const [, setUserProfile] = useLocalStorage('userProfile', {});
  const auth = useAuth();


  const approvedColleges = colleges.filter(c => c.approvalStatus);

  const schema = mode === 'login' ? loginSchema : signupSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === 'signup' ? { accountType } : {},
  });

  const generateUsernameFromEmail = (email: string | null): string => {
    if (!email) return '';
    return email.split('@')[0].replace(/[^a-z0-9_.]/g, '').toLowerCase();
  };

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // For Google Sign-In, we assume they need to create a profile first.
        // The create profile page will handle redirecting if a profile already exists.
        const googleSignupData = {
            email: user.email,
            name: user.displayName,
            uid: user.uid,
            isGoogleSignIn: true,
            username: generateUsernameFromEmail(user.email),
            // Default to 'seeker', user can't choose this in Google flow
            accountType: 'seeker' 
        };
        localStorage.setItem('signupData', JSON.stringify(googleSignupData));
        
        toast({
            title: "Signed In with Google",
            description: "Let's set up your profile."
        });
        
        router.push("/profile/create");

    } catch (error) {
        console.error("Google sign-in error", error);
        toast({
            variant: "destructive",
            title: "Google Sign-In Failed",
            description: "Could not sign in with Google. Please try again.",
        });
    } finally {
        setIsGoogleLoading(false);
    }
  }


  async function onSubmit(data: z.infer<typeof schema>) {
    setIsLoading(true);

    if (mode === 'signup') {
        const { email, password, collegeId, accountType } = data as SignupFormData;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const signupPayload = {
              email: user.email,
              name: user.displayName || '',
              uid: user.uid,
              isGoogleSignIn: false,
              username: generateUsernameFromEmail(user.email),
              collegeId,
              accountType,
            };
            localStorage.setItem('signupData', JSON.stringify(signupPayload));

            toast({
              title: "Account Created",
              description: "One more step to set up your profile."
            });
            router.push("/profile/create");
        } catch (error) {
            const firebaseError = error as FirebaseError;
            console.error("Signup error:", firebaseError);
            let description = "An unexpected error occurred.";
            if (firebaseError.code === 'auth/email-already-in-use') {
                description = "This email is already in use. Please log in or use a different email.";
            } else if (firebaseError.code === 'auth/weak-password') {
                description = "The password is too weak. Please use a stronger password.";
            }
            toast({
                variant: "destructive",
                title: "Sign-Up Failed",
                description,
            });
        } finally {
            setIsLoading(false);
        }
    } else { // Login mode
        const { email, password } = data as LoginFormData;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: "Signed In",
                description: "Welcome back!"
            });
            router.push("/dashboard");
        } catch (error) {
             const firebaseError = error as FirebaseError;
             console.error("Login error:", firebaseError);
             let description = "An unexpected error occurred.";
             if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
                description = "Invalid email or password. Please try again.";
             }
             toast({
                variant: "destructive",
                title: "Login Failed",
                description,
            });
        } finally {
            setIsLoading(false);
        }
    }
  }


  return (
    <div className={cn("grid gap-6 bg-card p-8 rounded-lg border", className)} {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading || isGoogleLoading}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {String(form.formState.errors.email?.message)}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              disabled={isLoading || isGoogleLoading}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {String(form.formState.errors.password?.message)}
              </p>
            )}
          </div>
          {mode === "signup" && (
            <>
              <input type="hidden" {...form.register("accountType")} />
              <div className="grid gap-2">
                <Label htmlFor="college">College</Label>
                <Select onValueChange={(value) => form.setValue('collegeId', value, { shouldValidate: true })} disabled={isLoading || isGoogleLoading}>
                  <SelectTrigger id="college">
                    <SelectValue placeholder={"Select your college"} />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedColleges.length > 0 ? (
                      approvedColleges.map((college) => (
                        <SelectItem key={college.id} value={college.id}>
                          {college.name}
                        </SelectItem>
                      ))
                    ) : (
                        <SelectItem value="no-colleges" disabled>No approved colleges available.</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.collegeId && (
                  <p className="text-sm text-destructive">
                    {String(form.formState.errors.collegeId?.message)}
                  </p>
                )}
              </div>
            </>
          )}
          <Button disabled={isLoading || isGoogleLoading} className="mt-2">
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </div>
      </form>
       <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={isLoading || isGoogleLoading} onClick={handleGoogleSignIn}>
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12.5C5,8.75 8.36,5.73 12.19,5.73C15.22,5.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2.5 12.19,2.5C6.42,2.5 2,7.18 2,12.5C2,17.82 6.42,22.5 12.19,22.5C17.6,22.5 21.5,18.33 21.5,12.81C21.5,12.08 21.43,11.56 21.35,11.1Z"
            />
          </svg>
        )}
        Google
      </Button>
    </div>
  );
}

    