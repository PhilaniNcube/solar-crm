import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  OrganizationProfile,
  OrganizationSwitcher,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solar CRM",
  description: "Solar CRM application with authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ConvexClientProvider>
            <NuqsAdapter>
              <header className="flex justify-between items-center container mx-auto p-4 border-b">
                <h1 className="text-xl font-bold">Prime Solar CRM</h1>
                <div className="flex items-center gap-4">
                  <SignedOut>
                    <SignInButton />
                    <SignUpButton />
                  </SignedOut>
                  <SignedIn>
                    <div className="flex items-center gap-4">
                      <OrganizationSwitcher
                        afterSelectOrganizationUrl="/dashboard"
                        appearance={{
                          elements: {
                            organizationSwitcherTrigger:
                              "border border-gray-300 rounded-md px-3 py-2",
                          },
                        }}
                      />
                      <UserButton />
                    </div>
                  </SignedIn>
                </div>
              </header>
              {children}
              <Toaster />
            </NuqsAdapter>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
