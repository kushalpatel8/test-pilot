import { Suspense } from 'react';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading sign in...</div>}>
      <SignIn />
    </Suspense>
  );
}
