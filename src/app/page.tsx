
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
import images from '@/lib/placeholder-images.json';

export default function AuthPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [isResetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const landingImage = images['landing-page'];


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

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 bg-background">
      {/* Left Column - Image and Branding */}
      <div className="relative flex-col justify-between h-full p-10 bg-primary/90 text-primary-foreground hidden lg:flex">
        <div className="absolute inset-0 z-0 transition-transform duration-500 ease-in-out">
            <Image
                src={landingImage.src}
                alt="Diverse group of professionals in a meeting"
                fill
                style={{objectFit: 'cover'}}
                className="opacity-20"
                data-ai-hint={landingImage.hint}
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
                Enter your details below to login to your account.
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
