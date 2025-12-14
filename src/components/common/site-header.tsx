
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, BookOpenCheck, User as UserIcon, MessageSquare, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/firebase";

type UserProfile = {
  name: string;
  avatarUrl: string;
}

export function SiteHeader() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Marketplace" },
    { href: "/register/college", label: "For Colleges" },
  ];

  // Hide header on landing page for a cleaner look
  if (pathname === '/') {
    return null;
  }
  
  const handleLogout = async () => {
    try {
        if(auth) {
            await signOut(auth);
        }
        localStorage.removeItem('userProfile');
        toast({
            title: 'Signed Out',
            description: 'You have been successfully signed out.',
        });
        router.push('/login');
    } catch(e) {
        console.error(e);
        toast({
            variant: "destructive",
            title: 'Sign Out Failed',
            description: 'There was an issue signing you out. Please try again.',
        })
    }
  }

  const renderUserNav = () => {
    if (isUserLoading) {
      return <Skeleton className="h-10 w-24" />;
    }

    if (!user) {
      return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" asChild><Link href="/login">Log In</Link></Button>
            <Button asChild><Link href="/signup">Sign Up</Button>
        </div>
      );
    }

    const displayName = user.displayName || 'User';
    const photoURL = user.photoURL;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <Avatar className="h-8 w-8 mr-2 border">
              {photoURL && <AvatarImage src={photoURL} />}
              <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>My Account</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/messages">
               <MessageSquare className="mr-2 h-4 w-4" />
               <span>Messages</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
             <LogOut className="mr-2 h-4 w-4" />
             <span>Log Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <BookOpenCheck className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">STUDORA</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
         {isClient && (
           <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <Link href="/dashboard" className="mr-6 flex items-center space-x-2 p-4">
                  <BookOpenCheck className="h-6 w-6 text-primary" />
                  <span className="font-bold">STUDORA</span>
                </Link>
                <div className="my-4 h-[calc(100vh-8rem)] pb-10">
                  <div className="flex flex-col space-y-3 px-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
         )}
           <Link href="/dashboard" className="flex items-center space-x-2 md:hidden">
            <BookOpenCheck className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">STUDORA</span>
          </Link>
          <nav className="flex items-center">
            {isClient ? renderUserNav() : <Skeleton className="h-10 w-32" />}
          </nav>
        </div>
      </div>
    </header>
  );
}
