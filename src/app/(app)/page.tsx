import { redirect } from 'next/navigation';

// This page performs a permanent server-side redirect to the dashboard.
export default function AppPage() {
  redirect('/dashboard');
}
