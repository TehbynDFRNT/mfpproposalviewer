import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to proposal page without UUID
  redirect('/proposal');
}