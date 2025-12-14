
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';

export default function AccountTypeSelectionPage() {
  const heroImage = placeholderImages.find(p => p.id === 'college-registration');

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
       {heroImage && (
         <div className="absolute inset-0 z-0">
           <Image
             src={heroImage.imageUrl}
             alt={heroImage.description}
             data-ai-hint={heroImage.imageHint}
             fill
             className="object-cover"
           />
           <div className="absolute inset-0 bg-black/70" />
         </div>
       )}

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-4">
        <div className="mx-auto w-full max-w-2xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl font-headline">
            Unlock Your Campus Potential
          </h1>
          <p className="mb-10 text-lg text-white/80">
            Join STUDORA, the exclusive marketplace for students to offer their skills and find help on campus.
          </p>
          <div className='flex justify-center gap-4 mb-6'>
            <Button size="lg" asChild>
                <Link href="/signup">Get Started</Link>
            </Button>
             <Button size="lg" variant="secondary" asChild>
                <Link href="/login">Log In</Link>
            </Button>
          </div>
          <p className="mt-8 text-center text-sm text-white/60">
              Are you a college administrator?{' '}
              <Link
                href="/register/college"
                className="font-semibold text-white underline-offset-4 hover:underline"
              >
                Register your campus
              </Link>
              .
            </p>
        </div>
      </div>
    </div>
  );
}
