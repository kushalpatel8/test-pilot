import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8 text-neutral-400 text-sm">
          Loading sign up...
        </div>
      }
    >
      <SignUp
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