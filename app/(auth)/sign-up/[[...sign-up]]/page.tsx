import { Suspense } from 'react';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading sign up...</div>}>
      <SignUp />
    </Suspense>
  );
}