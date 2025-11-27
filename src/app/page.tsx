
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { useTour } from '@/context/tour-context';

export default function AuthPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { startTour } = useTour();

  const [isResetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const [isSignUpDialogOpen, setSignUpDialogOpen] = useState(false);
  const [signUpSchoolName, setSignUpSchoolName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');


  const handlePasswordReset = () => {
    if (!resetEmail) {
        toast({
            title: 'Email Required',
            description: 'Please enter your email address.',
            variant: 'destructive'
        });
        return;
    }
    // In a real app, you would call your auth provider here.
    setResetDialogOpen(false);
    toast({
        title: 'Password Reset Sent',
        description: `If an account exists for ${resetEmail}, a password reset link has been sent.`,
    });
    setResetEmail('');
  }

  const handleSignUp = () => {
    if (!signUpSchoolName || !signUpEmail || !signUpPassword) {
         toast({
            title: 'All fields required',
            description: 'Please fill out all fields to create your account.',
            variant: 'destructive'
        });
        return;
    }
    // In a real app, this would create a new user account
    setSignUpDialogOpen(false);
    toast({
        title: 'Account Created!',
        description: `Welcome, ${signUpSchoolName}! You are now being redirected.`,
    });
    
    // Redirect to dashboard and start the tour
    router.push('/dashboard');
    setTimeout(() => {
      startTour();
    }, 500); // Small delay to allow for page transition
  }

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 bg-background">
      {/* Left Column - Image and Branding */}
      <div className="relative flex-col justify-between h-full p-10 bg-primary/90 text-primary-foreground hidden lg:flex">
        <div className="absolute inset-0 z-0 transition-transform duration-500 ease-in-out">
            <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop"
                alt="Diverse group of professionals in a meeting"
                fill
                style={{objectFit: 'cover'}}
                className="opacity-20"
                data-ai-hint="diverse professionals"
            />
        </div>
        <div className="relative z-10">
          <Logo className="text-primary-foreground" />
        </div>
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl">
              “The best way to predict the future is to create it. This platform helps us build the future of education, one great teacher at a time.”
            </p>
            <footer className="text-sm">Sofia Davis, Headteacher</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex items-center justify-center py-12 px-4 transition-transform duration-500 ease-in-out">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Welcome to GSL</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Select your role and enter your details below to login to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="me@example.co.uk"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Dialog open={isResetDialogOpen} onOpenChange={setResetDialogOpen}>
                      <DialogTrigger asChild>
                        <button className="ml-auto inline-block text-sm underline">
                          Forgot your password?
                        </button>
                      </DialogTrigger>
                       <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Forgot Password</DialogTitle>
                          <DialogDescription>
                            Enter your email address and we'll send you a link to reset your password.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="reset-email">Email Address</Label>
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder="me@example.co.uk"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button type="button" onClick={handlePasswordReset}>
                                Send Reset Link
                            </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" asChild>
                  <Link href="/dashboard">Login</Link>
                </Button>
                 <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                 <div className="grid grid-cols-1">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" className="mr-2 h-4 w-4">
                          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.6-1.861,12.63-5.002l-6.157-4.921C28.251,36.446,26.211,38,24,38c-5.223,0-9.655-3.373-11.303-8H6.306C9.656,39.663,16.318,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.157,4.921C42.022,35.242,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                       </svg>
                      Google
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Dialog open={isSignUpDialogOpen} onOpenChange={setSignUpDialogOpen}>
                    <DialogTrigger asChild>
                         <button className="underline">Sign up</button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create a Client Account</DialogTitle>
                            <DialogDescription>
                                Join GSL today to find the best educational staff for your needs.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="school-name">School Name</Label>
                                <Input id="school-name" placeholder="e.g. Oakwood Primary School" value={signUpSchoolName} onChange={e => setSignUpSchoolName(e.target.value)} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="signup-email">Email</Label>
                                <Input id="signup-email" type="email" placeholder="me@example.co.uk" value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="signup-password">Password</Label>
                                <Input id="signup-password" type="password" value={signUpPassword} onChange={e => setSignUpPassword(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleSignUp}>Create Account</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
