import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8 text-neutral-400 text-sm">
          Loading sign in...
        </div>
      }
    >
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-2xl border border-neutral-800 bg-neutral-900/90 backdrop-blur-xl",
          },
        }}
      />
    </Suspense>
  );
}
