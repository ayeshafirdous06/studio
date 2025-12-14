
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
import { GoogleAuthProvider, signInWithRedirect, createUserWithEmailAndPassword, signInWithEmailAndPassword, FirebaseError, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: "login" | "signup";
  accountType?: 'provider' | 'seeker';
}

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name is required."),
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
  const auth = useAuth();
  
  const [phone, setPhone] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [confirmationResult, setConfirmationResult] = React.useState<ConfirmationResult | null>(null);
  const [phoneAuthStep, setPhoneAuthStep] = React.useState<'enter-phone' | 'enter-otp'>('enter-phone');

  const approvedColleges = colleges.filter(c => c.approvalStatus);

  const schema = mode === 'login' ? loginSchema : signupSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === 'signup' ? { accountType } : {},
  });
  
  const setupRecaptcha = () => {
    if (!auth) return;
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      });
    }
  };


  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, `+${phone}`, appVerifier);
      setConfirmationResult(result);
      setPhoneAuthStep('enter-otp');
      toast({ title: 'OTP Sent!', description: 'An OTP has been sent to your phone number.' });
    } catch (error) {
      console.error("Phone sign-in error", error);
       toast({
          variant: "destructive",
          title: "Phone Sign-In Failed",
          description: "Could not send OTP. Please check the number and try again.",
      });
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) return;
    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
      // On successful login, just go to the dashboard.
      // The dashboard layout will handle fetching the profile or redirecting.
      router.push("/dashboard");

    } catch (error) {
       console.error("OTP verification error", error);
       toast({
          variant: "destructive",
          title: "Verification Failed",
          description: "The OTP is incorrect. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }


  const generateUsernameFromEmail = (email: string | null): string => {
    if (!email) return '';
    return email.split('@')[0].replace(/[^a-z0-9_.]/g, '').toLowerCase();
  };

  async function handleGoogleSignIn() {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Firebase is not ready. Please try again in a moment.",
      });
      return;
    }
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        // Set the accountType in localStorage so it can be retrieved after the redirect
        localStorage.setItem('pendingAccountType', accountType);

        await signInWithRedirect(auth, provider);
        // After this, the user is redirected to Google.
        // After they sign in, they are redirected back to the app.
        // The onAuthStateChanged listener in FirebaseProvider and the logic
        // in DashboardLayout will handle the rest.
    } catch (error) {
        console.error("Google sign-in error", error);
        toast({
            variant: "destructive",
            title: "Google Sign-In Failed",
            description: "Could not start Google Sign-In. Please try again.",
        });
        localStorage.removeItem('pendingAccountType'); // Clean up on error
        setIsGoogleLoading(false);
    }
  }


  async function onSubmit(data: z.infer<typeof schema>) {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Firebase is not ready. Please try again in a moment.",
      });
      return;
    }
    setIsLoading(true);

    if (mode === 'signup') {
        const { name, email, password, collegeId, accountType } = data as SignupFormData;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const signupPayload = {
              email: user.email,
              name: name, // Use the name from the form
              uid: user.uid,
              isGoogleSignIn: false,
              username: generateUsernameFromEmail(user.email),
              collegeId,
              accountType,
            };
            localStorage.setItem('signupData', JSON.stringify(signupPayload));

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
            // On successful login, just go to the dashboard.
            // The dashboard layout will handle fetching the profile or redirecting.
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
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
        </TabsList>
        <TabsContent value="email">
             <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
                <div className="grid gap-4">
                {mode === "signup" && (
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Jane Doe"
                            disabled={isLoading || isGoogleLoading}
                            {...form.register("name")}
                        />
                        {form.formState.errors.name && (
                            <p className="text-sm text-destructive">{String(form.formState.errors.name.message)}</p>
                        )}
                    </div>
                )}
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
                <Button disabled={isLoading || isGoogleLoading} className="mt-2 w-full">
                    {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {mode === "login" ? "Sign In" : "Create Account"}
                </Button>
                </div>
            </form>
        </TabsContent>
        <TabsContent value="phone">
            <div className="grid gap-4 mt-4">
                {phoneAuthStep === 'enter-phone' ? (
                     <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number (with country code)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="phone"
                                placeholder="+919876543210"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <Button onClick={handleSendOtp} disabled={isLoading || !phone}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Send OTP
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-2">
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input
                            id="otp"
                            placeholder="123456"
                            type="text"
                             value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            disabled={isLoading}
                        />
                         <Button onClick={handleVerifyOtp} disabled={isLoading || !otp}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify OTP & Continue
                        </Button>
                        <Button variant="link" size="sm" onClick={() => setPhoneAuthStep('enter-phone')} className="text-muted-foreground">
                            Back to phone number entry
                        </Button>
                    </div>
                )}
            </div>
        </TabsContent>
      </Tabs>


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
      <div id="recaptcha-container"></div>
    </div>
  );
}

    