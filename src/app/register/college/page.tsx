
import { SiteHeader } from "@/components/common/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Image from "next/image";
import { placeholderImages } from "@/lib/placeholder-images";
import { CollegeRegistrationForm } from "@/components/college/college-registration-form";
import { BackButton } from "@/components/common/back-button";

const subscriptionTiers = [
    {
        name: "Basic",
        price: "₹8,000",
        priceDetail: "/year for up to 500 students",
        features: ["Student Authentication", "Service Marketplace", "Basic Support"],
    },
    {
        name: "Standard",
        price: "₹16,000",
        priceDetail: "/year for up to 5000 students",
        features: ["All Basic Features", "AI Skill Recommendation", "Priority Support"],
        isFeatured: true,
    },
    {
        name: "Premium",
        price: "₹32,000",
        priceDetail: "/year for unlimited students",
        features: ["All Standard Features", "College-wide Analytics", "Custom Branding", "On-campus Promotions"],
    },
];

export default function CollegeRegistrationPage() {
    const heroImage = placeholderImages.find(p => p.id === 'college-registration');

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <BackButton />
                        <div className="grid gap-10 lg:grid-cols-2">
                            <div className="space-y-4">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-headline">
                                    Bring STUDORA to Your Campus
                                </h1>
                                <p className="text-muted-foreground md:text-xl">
                                    Empower your students with a dedicated marketplace to share skills, collaborate on projects, and foster an entrepreneurial spirit within a safe, university-managed environment.
                                </p>
                                {heroImage && (
                                     <Image
                                        src={heroImage.imageUrl}
                                        width={600}
                                        height={400}
                                        alt={heroImage.description}
                                        data-ai-hint={heroImage.imageHint}
                                        className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
                                     />
                                )}
                            </div>
                            <div className="flex items-center">
                                <Card className="w-full">
                                    <CardHeader>
                                        <CardTitle>Register Your College</CardTitle>
                                        <CardDescription>Fill out the form to get started.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <CollegeRegistrationForm />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
                    <div className="container px-4 md:px-6">
                         <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Subscription Plans</h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                                Choose the plan that's right for your institution.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {subscriptionTiers.map(tier => (
                                <Card key={tier.name} className={`flex flex-col ${tier.isFeatured ? 'border-primary ring-2 ring-primary' : ''}`}>
                                    <CardHeader>
                                        <CardTitle>{tier.name}</CardTitle>
                                        <CardDescription className="flex items-baseline">
                                            <span className="text-4xl font-bold">{tier.price}</span>
                                            <span className="ml-1 text-muted-foreground">{tier.priceDetail}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ul className="space-y-2">
                                            {tier.features.map(feature => (
                                                <li key={feature} className="flex items-center">
                                                    <Check className="h-4 w-4 mr-2 text-accent" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full" variant={tier.isFeatured ? 'default' : 'secondary'}>
                                            {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
