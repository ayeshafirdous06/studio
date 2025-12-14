
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
import { Loader2, Phone } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { colleges } from "@/lib/data";
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword, FirebaseError, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, User } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';


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
  const auth = useAuth();
  const firestore = useFirestore();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const [isPhoneLoading, setIsPhoneLoading] = React.useState<boolean>(false);
  
  const [authMethod, setAuthMethod] = React.useState<'email' | 'phone'>('email');
  const [phoneStep, setPhoneStep] = React.useState<'input' | 'verify'>('input');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [confirmationResult, setConfirmationResult] = React.useState<ConfirmationResult | null>(null);

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
  
  const handleSuccessfulLogin = React.useCallback(async (user: User) => {
    if (!firestore) {
        toast({ variant: "destructive", title: "Database Error", description: "Could not connect to database." });
        setIsLoading(false);
        setIsGoogleLoading(false);
        return;
    }
    const userDocRef = doc(firestore, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      localStorage.setItem('userProfile', JSON.stringify({ id: user.uid, ...userDocSnap.data() }));
      router.push("/dashboard");
    } else {
      const signupPayload: any = {
        uid: user.uid,
        accountType: accountType,
      };
      if (user.email) signupPayload.email = user.email;
      if (user.displayName) signupPayload.name = user.displayName;
      if (user.email) signupPayload.username = generateUsernameFromEmail(user.email);
      if (user.phoneNumber) signupPayload.phoneNumber = user.phoneNumber;

      localStorage.setItem('signupData', JSON.stringify(signupPayload));
      router.push("/profile/create");
    }
  }, [firestore, router, accountType, toast]);


  React.useEffect(() => {
    if (!auth) return;
    
    // Set up reCAPTCHA verifier for phone auth
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
              'size': 'invisible',
              'callback': () => {
                // reCAPTCHA solved
              }
            });
        }
    }
    if (authMethod === 'phone') {
        setupRecaptcha();
    }
    
    // Handle redirect result from Google sign-in
    const checkRedirectResult = async () => {
        setIsGoogleLoading(true);
        try {
            const result = await getRedirectResult(auth);
            if (result && result.user) {
                toast({ title: "Signed In!", description: "Welcome back." });
                await handleSuccessfulLogin(result.user);
            } else {
                setIsGoogleLoading(false);
            }
        } catch (error) {
            const firebaseError = error as FirebaseError;
            console.error("Google sign-in redirect error", firebaseError);
            let description = "Could not sign in with Google. Please try again.";
            if (firebaseError.code === 'auth/account-exists-with-different-credential') {
                description = "An account already exists with this email address. Please sign in with your original method.";
            }
            toast({ variant: "destructive", title: "Google Sign-In Failed", description });
            setIsGoogleLoading(false);
        }
    };
    
    checkRedirectResult();

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    }
  }, [auth, handleSuccessfulLogin, toast, authMethod]);

  async function handleGoogleSignIn() {
    if (!auth) {
      toast({ variant: "destructive", title: "Authentication Error", description: "Firebase is not ready. Please try again." });
      return;
    }
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider); // This will redirect the user
  }

  async function onSubmit(data: z.infer<typeof schema>) {
    if (!auth) {
      toast({ variant: "destructive", title: "Authentication Error", description: "Firebase is not ready." });
      return;
    }
    setIsLoading(true);

    if (mode === 'signup') {
        const { name, email, password, collegeId, accountType } = data as SignupFormData;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const signupPayload = { email: user.email, name, uid: user.uid, username: generateUsernameFromEmail(user.email), collegeId, accountType };
            localStorage.setItem('signupData', JSON.stringify(signupPayload));
            router.push("/profile/create");
        } catch (error) {
            const firebaseError = error as FirebaseError;
            console.error("Signup error:", firebaseError);
            toast({ variant: "destructive", title: "Sign-Up Failed", description: firebaseError.code === 'auth/email-already-in-use' ? "This email is already in use." : "An unexpected error occurred." });
        } finally {
            setIsLoading(false);
        }
    } else {
        const { email, password } = data as LoginFormData;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await handleSuccessfulLogin(userCredential.user);
        } catch (error) {
             const firebaseError = error as FirebaseError;
             console.error("Login error:", firebaseError);
             toast({ variant: "destructive", title: "Login Failed", description: "Invalid email or password." });
             setIsLoading(false);
        }
    }
  }

  async function handleSendOtp() {
    if (!auth || !window.recaptchaVerifier) return;
    setIsPhoneLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setPhoneStep('verify');
      toast({ title: "OTP Sent!", description: `Verification code sent to ${phoneNumber}.` });
    } catch (error) {
      console.error("Phone sign-in error", error);
      toast({ variant: "destructive", title: "Failed to Send OTP", description: "Please check the phone number and try again." });
    } finally {
      setIsPhoneLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!confirmationResult) return;
    setIsPhoneLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      await handleSuccessfulLogin(result.user);
    } catch (error) {
      console.error("OTP verification error", error);
      toast({ variant: "destructive", title: "Invalid OTP", description: "The code you entered is incorrect. Please try again." });
    } finally {
      setIsPhoneLoading(false);
    }
  }


  return (
    <div className={cn("grid gap-6 bg-card p-8 rounded-lg border", className)} {...props}>
      {(isLoading || isGoogleLoading) && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      {authMethod === 'email' ? (
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            {mode === "signup" && (
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="e.g., Jane Doe" disabled={isLoading || isGoogleLoading} {...form.register("name")} />
                {form.formState.errors.name && <p className="text-sm text-destructive">{String(form.formState.errors.name.message)}</p>}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="name@example.com" type="email" autoCapitalize="none" autoComplete="email" autoCorrect="off" disabled={isLoading || isGoogleLoading} {...form.register("email")} />
              {form.formState.errors.email && <p className="text-sm text-destructive">{String(form.formState.errors.email?.message)}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" disabled={isLoading || isGoogleLoading} {...form.register("password")} />
              {form.formState.errors.password && <p className="text-sm text-destructive">{String(form.formState.errors.password?.message)}</p>}
            </div>
            {mode === "signup" && (
              <>
                <input type="hidden" {...form.register("accountType")} />
                <div className="grid gap-2">
                  <Label htmlFor="college">College</Label>
                  <Select onValueChange={(value) => form.setValue('collegeId', value, { shouldValidate: true })} disabled={isLoading || isGoogleLoading}>
                    <SelectTrigger id="college"><SelectValue placeholder={"Select your college"} /></SelectTrigger>
                    <SelectContent>
                      {approvedColleges.map((college) => (<SelectItem key={college.id} value={college.id}>{college.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.collegeId && <p className="text-sm text-destructive">{String(form.formState.errors.collegeId?.message)}</p>}
                </div>
              </>
            )}
            <Button disabled={isLoading || isGoogleLoading} className="mt-2 w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" ? "Sign In with Email" : "Create Account"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid gap-4">
            {phoneStep === 'input' ? (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="+91 98765 43210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={isPhoneLoading} />
                    </div>
                    <Button onClick={handleSendOtp} disabled={isPhoneLoading || phoneNumber.length < 10}>
                        {isPhoneLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send OTP'}
                    </Button>
                </>
            ) : (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="otp">Verification Code</Label>
                        <Input id="otp" type="text" placeholder="Enter 6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} disabled={isPhoneLoading} />
                    </div>
                    <Button onClick={handleVerifyOtp} disabled={isPhoneLoading || otp.length !== 6}>
                        {isPhoneLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify & Continue'}
                    </Button>
                </>
            )}
        </div>
      )}

      <div id="recaptcha-container"></div>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" type="button" disabled={isLoading || isGoogleLoading || isPhoneLoading} onClick={handleGoogleSignIn}>
            {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12.5C5,8.75 8.36,5.73 12.19,5.73C15.22,5.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2.5 12.19,2.5C6.42,2.5 2,7.18 2,12.5C2,17.82 6.42,22.5 12.19,22.5C17.6,22.5 21.5,18.33 21.5,12.81C21.5,12.08 21.43,11.56 21.35,11.1Z"/></svg>}
            Google
        </Button>
         <Button variant="outline" type="button" disabled={isLoading || isGoogleLoading || isPhoneLoading} onClick={() => setAuthMethod(authMethod === 'email' ? 'phone' : 'email')}>
            {authMethod === 'email' ? <Phone className="mr-2 h-4 w-4" /> : <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>}
            {authMethod === 'email' ? 'Phone' : 'Email'}
        </Button>
      </div>

    </div>
  );
}

// Add this to your global types or a suitable place if you don't have one
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

    