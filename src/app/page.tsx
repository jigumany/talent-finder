
'use client';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';

export default function AuthPage() {
  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 bg-background">
      {/* Left Column - Image and Branding */}
      <div className="relative flex-col justify-between h-full p-10 bg-primary/90 text-primary-foreground hidden lg:flex">
        <div className="absolute inset-0 z-0 transition-transform duration-500 ease-in-out">
            <Image
                src="https://images.unsplash.com/photo-1517486808906-6538cb3b8656?q=80&w=2670&auto=format&fit=crop"
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
                    <Link
                      href="#"
                      className="ml-auto inline-block text-sm underline"
                    >
                      Forgot your password?
                    </Link>
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
                 <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard">
                       <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.67-4.66 1.67-3.86 0-6.99-3.16-6.99-7.12s3.13-7.12 6.99-7.12c2.16 0 3.57.84 4.38 1.62l2.5-2.5C18.44 1.19 15.7.01 12.48.01 7.2 0 3.02 4.23 3.02 9.38s4.18 9.38 9.46 9.38c3.22 0 5.5-1.12 7.34-2.97 1.9-1.9 2.53-4.49 2.53-6.76 0-.6-.05-1.18-.15-1.76h-9.7z"/></svg>
                      Google
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard">
                      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 fill-current"><title>Apple</title><path d="M12.152 6.896c-.948 0-1.896.505-2.843 1.514-1.317 1.317-2.264 3.34-2.264 5.362 0 1.22.284 2.345.852 3.37.568 1.025 1.317 2.05 2.264 2.843.948.81 1.991 1.22 3.125 1.22s2.08-.373 3.03-1.125c.948-.748 1.515-1.758 1.702-2.928h-3.592c-1.41 0-2.651-1.22-2.651-2.69 0-1.47 1.24-2.69 2.651-2.69h4.54c.284-3.125-1.41-5.55-3.125-6.42a4.67 4.67 0 0 0-2.843-.455zm.33 1.317c.568 0 1.136.19 1.702.568.948.568 1.636 1.55 1.948 2.843H11.3c-.662-.463-1.41-1.126-2.08-1.793-.67-.662-1.22-1.362-1.514-1.99a5.49 5.49 0 0 1-.237-2.144c.045-.512.14-.98.282-1.403.468-1.318 1.41-2.43 2.606-3.076a4.202 4.202 0 0 1 2.356-.373c1.22 0 2.345.468 3.26 1.41.916.948 1.462 2.183 1.515 3.547h-3.41c-1.41 0-2.651 1.22-2.651 2.69 0 .568.183 1.136.52 1.558.338.423.81.75 1.362.9v.045c-1.41-.33-2.606-1.515-2.973-2.928a4.417 4.417 0 0 1-.235-1.84C9.89 8.213 10.837 7.03 12.48 6.896h-.002z"/></svg>
                      Apple
                    </Link>
                  </Button>
                </div>
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
