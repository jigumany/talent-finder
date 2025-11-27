
import Image from 'next/image';
import Link from 'next/link';
import { Briefcase, School } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import images from '@/lib/placeholder-images.json';

export default function AuthPage() {
  const classroomImage = images['school-classroom'];
  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="relative bg-muted">
         <div className="absolute inset-0 lg:hidden z-10 bg-gradient-to-b from-primary/80 to-primary/40" />
        <Image
          src="https://images.unsplash.com/photo-1618367588421-400296bac364?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNnx8TGlnaHQlMjBwdXJwcGxlJTIwZ3JhZGllbnR8ZW58MHx8fHwxNzYzNDQ3ODU4fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="A modern classroom with students and a teacher"
          fill
          style={{objectFit: 'cover'}}
          className="opacity-90"
          data-ai-hint={classroomImage.hint}
        />
        <div className="relative z-10 flex flex-col justify-between h-full p-10 bg-gradient-to-b from-primary/80 to-primary/40 text-primary-foreground">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <School className="h-8 w-8" />
            <span>Staffable</span>
          </Link>
          <div className="mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                “The best way to predict the future is to create it. This platform helps us build the future of education, one great teacher at a time.”
              </p>
              <footer className="text-sm">Sofia Davis, Headteacher</footer>
            </blockquote>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 relative z-20 -mt-32 lg:mt-0 bg-background rounded-t-2xl lg:rounded-none lg:bg-transparent">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold font-headline">Welcome to Staffable</h1>
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
                    <Link
                      href="#"
                      className="ml-auto inline-block text-sm underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full as" asChild>
                  <Link href="/dashboard">Login</Link>
                </Button>
                <Button variant="outline" className="w-full">
                  Login with Google
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="#" className="underline">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
