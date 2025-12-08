
import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { TourProvider } from '@/context/tour-context';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { GoogleMapsProvider } from '@/components/google-maps-provider';
import { FirebaseClientProvider } from '@/firebase';

const ptSans = PT_Sans({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-sans',
});


export const metadata: Metadata = {
  title: 'GSL',
  description: 'Connecting schools with qualified staff, seamlessly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ptSans.variable} suppressHydrationWarning>
      <head/>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <GoogleMapsProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              <TourProvider>
                {children}
              </TourProvider>
            </ThemeProvider>
            <Toaster />
          </GoogleMapsProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
