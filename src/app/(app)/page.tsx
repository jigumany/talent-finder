import { redirect } from 'next/navigation';

// This page is necessary for routing, but the actual entry point for the authenticated
// app is /dashboard. Redirecting here is a failsafe.
export default function AppPage() {
  redirect('/dashboard');
}
