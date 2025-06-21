import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-8">
      <main className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Welcome to Solar CRM</h1>

        <SignedOut>
          <div className="space-y-4">
            <p className="text-lg text-gray-600">
              Please sign in to access your solar CRM dashboard.
            </p>
            <p className="text-sm text-gray-500">
              Click the "Sign in" or "Sign up" button in the header to get
              started.
            </p>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="space-y-4">
            <p className="text-lg text-green-600">
              🎉 You're successfully authenticated!
            </p>
            <p className="text-gray-600">
              Welcome to your Solar CRM dashboard. You can now access all the
              features.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-700">
                Your Clerk authentication is working correctly with Next.js App
                Router.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/example-org"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Test Organization Route
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              The organization route will only work if you're a member of that
              organization in Clerk.
            </p>
          </div>
        </SignedIn>
      </main>
    </div>
  );
}
