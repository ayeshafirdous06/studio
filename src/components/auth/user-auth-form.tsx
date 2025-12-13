
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";

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

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: "login" | "signup";
}

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  collegeId: z.string({ required_error: "Please select your college." }).min(1, "Please select your college."),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;


export function UserAuthForm({ className, mode, ...props }: UserAuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const firestore = useFirestore();

  const collegesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'colleges'),
            where('approvalStatus', '==', true),
            where('city', '==', 'Hyderabad'),
            where('state', '==', 'Telangana'),
            orderBy('name')
          )
        : null,
    [firestore]
  );
  const { data: colleges, isLoading: isLoadingColleges } = useCollection(collegesQuery);

  const schema = mode === 'login' ? loginSchema : signupSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: mode === 'login' ? "Signed In" : "Account Created",
        description: `Welcome! You have been successfully ${mode === 'login' ? 'signed in' : 'signed up'}.`
      })
      // On success, redirect to dashboard
      router.push("/dashboard");
    }, 1500);
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
            <div className="grid gap-2">
              <Label htmlFor="college">College</Label>
              <Select onValueChange={(value) => form.setValue('collegeId', value, { shouldValidate: true })} disabled={isLoading || isLoadingColleges}>
                <SelectTrigger id="college">
                  <SelectValue placeholder={isLoadingColleges ? "Loading colleges..." : "Select your college"} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingColleges && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                  {!isLoadingColleges && colleges && colleges.length === 0 && (
                    <SelectItem value="no-colleges" disabled>No approved colleges available.</SelectItem>
                  )}
                  {colleges && colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.collegeId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.collegeId.message}
                </p>
              )}
            </div>
          )}
          <Button disabled={isLoading || (mode === 'signup' && isLoadingColleges)} className="mt-2">
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
