
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
import { useAuth } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";


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
  const auth = useAuth();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const collegesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, "colleges"), 
        where("approvalStatus", "==", true),
        orderBy("name", "asc")
    );
  }, [firestore]);

  const { data: approvedColleges, isLoading: isLoadingColleges } = useCollection(collegesQuery);

  const schema = mode === 'login' ? loginSchema : signupSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === 'signup' ? { accountType } : {},
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { email, password, collegeId } = data as SignupFormData;
        await createUserWithEmailAndPassword(auth, email, password);
        // Store collegeId temporarily to retrieve on the create-profile page
        localStorage.setItem('collegeId', collegeId);
        toast({
          title: "Account Created",
          description: "One more step to set up your profile."
        });
        router.push("/profile/create");
      } else { // Login mode
        const { email, password } = data as LoginFormData;
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Signed In",
          description: "Welcome back!"
        });
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "An unexpected error occurred.",
      });
      setIsLoading(false);
    }
    // Don't setIsLoading(false) on success because we are navigating away
  }


  return (
    <div className={cn("grid gap-6", className)} {...props}>
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
              disabled={isLoading}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              disabled={isLoading}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
          {mode === "signup" && (
            <>
              <input type="hidden" {...form.register("accountType")} />
              <div className="grid gap-2">
                <Label htmlFor="college">College</Label>
                <Select onValueChange={(value) => form.setValue('collegeId', value, { shouldValidate: true })} disabled={isLoading || isLoadingColleges}>
                  <SelectTrigger id="college">
                    <SelectValue placeholder={isLoadingColleges ? "Loading colleges..." : "Select your college"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingColleges ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : approvedColleges && approvedColleges.length > 0 ? (
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
                    {form.formState.errors.collegeId.message}
                  </p>
                )}
              </div>
            </>
          )}
          <Button disabled={isLoading} className="mt-2">
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </div>
      </form>
    </div>
  );
}
