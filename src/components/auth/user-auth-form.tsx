
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchemaLogin = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const formSchemaSignup = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  accountType: z.enum(['seeker', 'provider'], {
    required_error: 'You need to select an account type.',
  }),
});

type FormDataLogin = z.infer<typeof formSchemaLogin>;
type FormDataSignup = z.infer<typeof formSchemaSignup>;

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: 'login' | 'signup';
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="24px"
        height="24px"
        {...props}
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        />
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        />
      </svg>
    );
}

export function UserAuthForm({ className, mode, ...props }: UserAuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const auth = getAuth();
  
  const formSchema = mode === 'login' ? formSchemaLogin : formSchemaSignup;
  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: mode === 'signup' ? { accountType: 'seeker' } : {},
  });

  // Handle Google Sign in Redirect
  React.useEffect(() => {
    setIsLoading(true);
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          toast({ title: 'Signed in!', description: 'Welcome back.' });
          router.replace('/profile/create');
        }
      })
      .catch((error) => {
        console.error("Google sign in error", error);
        toast({ variant: 'destructive', title: 'Sign-in Failed', description: error.message });
      }).finally(() => {
        setIsLoading(false);
      });
  }, [auth, router, toast]);

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      if (mode === 'login') {
        const { email, password } = data as FormDataLogin;
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Login Successful!', description: "You're now signed in." });
        router.push('/dashboard');
      } else {
        const { email, password, accountType } = data as FormDataSignup;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Store signup data for profile creation page
        const signupData = {
          email: userCredential.user.email,
          name: userCredential.user.displayName,
          accountType,
        };
        localStorage.setItem('signupData', JSON.stringify(signupData));

        toast({ title: 'Account Created!', description: "Let's set up your profile." });
        router.push('/profile/create');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onGoogleSignIn() {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
    // The redirect will happen, and the result is handled in the useEffect
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          {mode === 'signup' && (
            <div className="grid gap-2">
                <Label>Account Type</Label>
                 <RadioGroup
                    defaultValue="seeker"
                    className="grid grid-cols-2 gap-4"
                    onValueChange={(value) => setValue("accountType", value as 'seeker' | 'provider')}
                >
                    <div>
                        <RadioGroupItem value="seeker" id="seeker" className="peer sr-only" {...register("accountType")} />
                        <Label htmlFor="seeker" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            Service Seeker
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="provider" id="provider" className="peer sr-only" {...register("accountType")} />
                        <Label htmlFor="provider" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                           Service Provider
                        </Label>
                    </div>
                </RadioGroup>
                {errors.accountType && <p className="text-sm text-destructive">{errors.accountType.message}</p>}
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
              disabled={isLoading}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              disabled={isLoading}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {String(errors.password.message)}
              </p>
            )}
          </div>
          <Button disabled={isLoading} className="mt-2 w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Sign In with Email' : 'Sign Up with Email'}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={isLoading} onClick={onGoogleSignIn}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="mr-2 h-4 w-4" />
        )}{' '}
        Google
      </Button>
    </div>
  );
}

    