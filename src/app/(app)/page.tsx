

'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page is a redirect to the dashboard.
// The main app logic is in the (app) group layout and its children.
export default function RedirectToDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}
