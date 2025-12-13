
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { getSkillRecommendations } from '@/ai/flows/skill-recommendation-for-service-seekers';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { SiteHeader } from '@/components/common/site-header';
import { Loader2, CalendarIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BackButton } from '@/components/common/back-button';
import { useLocalStorage } from '@/hooks/use-local-storage';

const serviceRequestSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters.'),
  description: z.string().min(50, 'Description must be at least 50 characters.'),
  serviceType: z.string().min(1, 'Service type is required.'),
  budget: z.coerce.number().min(0, 'Budget must be a positive number.'),
  deadline: z.date({ required_error: 'A deadline is required.' }),
});

export type ServiceRequestForm = z.infer<typeof serviceRequestSchema>;

export default function NewServiceRequestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [recommendedSkills, setRecommendedSkills] = useState<string[]>([]);
  const [myRequests, setMyRequests] = useLocalStorage<ServiceRequestForm[]>('my-requests', []);
  
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<ServiceRequestForm>({
    resolver: zodResolver(serviceRequestSchema),
  });

  const descriptionValue = watch('description');
  
  useEffect(() => {
    const handler = setTimeout(() => {
        if (descriptionValue && descriptionValue.length > 30) {
            const fetchSkills = async () => {
                setIsAiLoading(true);
                setRecommendedSkills([]);
                try {
                    const result = await getSkillRecommendations({ requestDescription: descriptionValue });
                    setRecommendedSkills(result.recommendedSkills);
                } catch (error) {
                    console.error("AI skill recommendation failed:", error);
                    toast({
                        variant: "destructive",
                        title: "AI Error",
                        description: "Could not fetch skill recommendations.",
                    })
                } finally {
                    setIsAiLoading(false);
                }
            }
            fetchSkills();
        } else {
            setRecommendedSkills([]);
        }
    }, 1000);

    return () => {
        clearTimeout(handler);
    };
}, [descriptionValue, toast]);
  
  const onSubmit = (data: ServiceRequestForm) => {
    setIsSubmitting(true);
    // Simulate API call and update local storage
    setTimeout(() => {
      const newRequest = { ...data, id: `req-${Date.now()}`, status: 'Open' };
      setMyRequests([...myRequests, newRequest]);
      
      setIsSubmitting(false);
      toast({
        title: 'Request Posted!',
        description: 'Your service request has been successfully posted. View it on your profile.',
      });
      router.push('/profile');
    }, 1500);
  };
  
  return (
    <>
      <SiteHeader />
      <div className="container max-w-2xl py-8">
        <BackButton />
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Post a New Service Request</CardTitle>
            <CardDescription>Fill in the details below to find the perfect student provider for your task.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Request Title</Label>
                <Input id="title" placeholder="e.g., Need a tutor for Calculus II" {...register('title')} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe your request in detail..." {...register('description')} rows={6} />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                
                {(isAiLoading || recommendedSkills.length > 0) && (
                    <div className="p-3 bg-muted/50 rounded-lg mt-2">
                        <div className="flex items-center text-sm font-medium mb-2">
                           <Sparkles className="h-4 w-4 mr-2 text-primary" />
                           <span>AI Skill Suggestions</span>
                           {isAiLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {recommendedSkills.map(skill => (
                                <Badge key={skill} variant="outline">{skill}</Badge>
                            ))}
                        </div>
                    </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Input id="serviceType" placeholder="e.g., Tutoring, Design, Writing" {...register('serviceType')} />
                  {errors.serviceType && <p className="text-sm text-destructive">{errors.serviceType.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (₹)</Label>
                  <Input id="budget" type="number" placeholder="e.g., 5000" {...register('budget')} />
                  {errors.budget && <p className="text-sm text-destructive">{errors.budget.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Controller
                  name="deadline"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.deadline && <p className="text-sm text-destructive">{errors.deadline.message}</p>}
              </div>
              
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Post Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
