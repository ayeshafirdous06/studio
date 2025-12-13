
'use client';

import { SiteHeader } from "@/components/common/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, DollarSign, PenSquare, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { placeholderImages } from "@/lib/placeholder-images";
import { preloadColleges } from "@/lib/college-initializer";
import { useToast } from "@/hooks/use-toast";


export default function Home() {
  const { toast } = useToast();
  const features = [
    {
      icon: <PenSquare className="h-8 w-8 text-primary" />,
      title: "Post Service Requests",
      description: "Need help with a project? Post your request and get offers from skilled students.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Offer Your Skills",
      description: "Showcase your talents, build your portfolio, and earn money on campus.",
    },
    {
      icon: <DollarSign className="h-8 w-8 text-primary" />,
      title: "Simulated Payments",
      description: "A safe, simulated payment system to track your earnings and payments.",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: "Ratings & Reviews",
      description: "Build your reputation with a robust rating and review system.",
    },
  ];

  const heroImage = placeholderImages.find(p => p.id === 'hero-students-collaborating');

  const handlePreload = async () => {
    try {
      const result = await preloadColleges();
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Preload Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };


  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    The Student-to-Student Marketplace
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    STUDORA connects students on campus. Get help, offer your skills, and build your network. All within your college community.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/dashboard">Find a Service</Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/profile">Become a Provider</Link>
                  </Button>
                </div>
              </div>
              {heroImage && (
                 <Image
                    src={heroImage.imageUrl}
                    width={600}
                    height={400}
                    alt={heroImage.description}
                    data-ai-hint={heroImage.imageHint}
                    className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                  />
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why Choose STUDORA?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A platform built by students, for students. Empowering you to succeed.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="h-full">
                  <CardHeader className="flex flex-col items-center text-center">
                    {feature.icon}
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Ready to Join Your Campus Marketplace?</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Sign up today and start connecting with fellow students.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/signup">Get Started Now</Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Temporary Preload Button */}
        <div className="container py-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">Dev only: Click to seed database</p>
            <Button onClick={handlePreload} variant="outline" size="sm">
                Preload College Data
            </Button>
        </div>
      </main>
      
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 STUDORA Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">Terms of Service</Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
