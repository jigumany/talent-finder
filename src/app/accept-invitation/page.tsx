
'use client';

import { Suspense, useEffect, useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { validateInvitation, setupPassword } from '@/app/auth/actions';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

const PasswordSchema = z.object({
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingPassword, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof PasswordSchema>>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!token) {
      setError('No invitation token found. Please use the link from your email.');
      setIsLoading(false);
      return;
    }
    
    async function checkToken() {
      const result = await validateInvitation(token!);
      if (result.error) {
        setError(result.error);
      } else {
        setEmail(result.email!);
      }
      setIsLoading(false);
    }
    checkToken();
  }, [token]);

  const onSubmit = (values: z.infer<typeof PasswordSchema>) => {
    setError(null);
    startTransition(async () => {
      const result = await setupPassword({ 
        token: token!, 
        password: values.password,
        password_confirmation: values.confirmPassword,
      });
      if (result.error) {
        setError(result.error);
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Success!', description: result.message });
        setSuccessMessage(result.message!);
      }
    });
  }
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Validating invitation...</p>
      </div>
    );
  }

  if (error && !email) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
           <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Invitation Invalid</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardHeader>
         <CardContent>
          <Button asChild className="w-full" variant="secondary">
            <Link href="/">Return to Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (successMessage) {
     return (
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <CardTitle className="pt-4">Password Set Successfully!</CardTitle>
            <CardDescription>{successMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/">Proceed to Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
     <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome!</CardTitle>
        <CardDescription>Set up your password for your account: <span className="font-semibold text-primary">{email}</span>.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="password">New Password</Label>
                  <FormControl>
                    <Input id="password" type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <FormControl>
                    <Input id="confirmPassword" type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isSettingPassword}>
                {isSettingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Set Password and Finish
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function AcceptInvitationPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
       <div className="absolute top-8 left-8">
         <Logo />
       </div>
      <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      }>
        <AcceptInvitationForm />
      </Suspense>
    </div>
  );
}
