
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, UserPlus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';

export default function AccountTypeSelectionPage() {
  const heroImage = placeholderImages.find(p => p.id === 'hero-charminar');

  return (
    <div className="relative flex min-h-screen flex-col">
       {heroImage && (
         <div className="absolute inset-0 z-0">
           <Image
             src={heroImage.imageUrl}
             alt={heroImage.description}
             data-ai-hint={heroImage.imageHint}
             fill
             className="object-cover"
           />
           <div className="absolute inset-0 bg-black/60" />
         </div>
       )}

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-4 text-white">
        <div className="mx-auto w-full max-w-lg text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl font-headline">
            Unlock Your Campus Potential
          </h1>
          <p className="mb-10 text-lg text-white/80">
            Join STUDORA, the exclusive marketplace for students to offer their skills and find help on campus.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Link href="/signup?accountType=provider" passHref>
              <Card className="transform border-white/20 bg-white/10 text-white backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-xl">
                <CardHeader>
                  <Briefcase className="h-8 w-8 text-white mb-2" />
                  <CardTitle className="text-xl font-semibold">
                    Offer a Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/70 mb-4">
                    Showcase your talents, connect with peers, and start earning.
                  </p>
                  <div className="flex items-center justify-end font-semibold">
                    Join as a Provider <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/signup?accountType=seeker" passHref>
              <Card className="transform border-white/20 bg-white/10 text-white backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-xl">
                 <CardHeader>
                  <UserPlus className="h-8 w-8 text-white mb-2" />
                  <CardTitle className="text-xl font-semibold">
                    Request a Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/70 mb-4">
                    Find talented students on campus to help with your projects and tasks.
                  </p>
                   <div className="flex items-center justify-end font-semibold">
                    Join as a Seeker <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <p className="mt-12 text-center text-sm text-white/60">
             Already have an account?{' '}
             <Link
               href="/login"
               className="font-semibold text-white underline-offset-4 hover:underline"
             >
               Log In
             </Link>
           </p>
        </div>
      </div>
    </div>
  );
}
