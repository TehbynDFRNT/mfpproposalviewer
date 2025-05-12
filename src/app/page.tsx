/**
 * Root page that redirects to the proposal viewer
 */
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Default UUID for the sample proposal
  const defaultUuid = 'acec1f18-4af6-41d9-9b36-41aedf697d5f';
  
  // Redirect to the proposal viewer with the default UUID
  redirect(`/proposal/${defaultUuid}`);
  
  // This won't be rendered due to the redirect
  return null;
}