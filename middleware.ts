// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// More explicit route matching
const isProtectedRoutes = createRouteMatcher([
  "/dashboard(.*)",
  "/(dashboard)(.*)",
  "/profile(.*)",
]);

// Custom function to check if route should be protected
const isProtectedRoute = (pathname: string): boolean => {
  // Check for exact patterns that should be protected
  const protectedPatterns = [
    /^\/dashboard($|\/.*)/,
    /^\/(dashboard)($|\/.*)/,
    /^\/profile($|\/.*)/,
    /^\/[^\/]+\/dashboard($|\/.*)/,
    /^\/[^\/]+\/customers($|\/.*)/,
    /^\/[^\/]+\/leads($|\/.*)/,
    /^\/[^\/]+\/projects($|\/.*)/,
    /^\/[^\/]+\/settings($|\/.*)/,
    /^\/[^\/]+\/quotes($|\/.*)/,
    /^\/[^\/]+\/equipment($|\/.*)/,
    /^\/[^\/]+\/schedule($|\/.*)/,
  ];

  return protectedPatterns.some((pattern) => pattern.test(pathname));
};

export default clerkMiddleware(async (auth, req) => {
  const authData = await auth();
  const pathname = req.nextUrl.pathname;

  // If user hits root route and is authenticated, redirect to their org dashboard
  if (pathname === "/" && authData.userId && authData.orgSlug) {
    return NextResponse.redirect(
      new URL(`/${authData.orgSlug}/dashboard`, req.url)
    );
  }

  // If user hits root route and is authenticated but has no org, redirect to profile
  if (pathname === "/" && authData.userId && !authData.orgSlug) {
    return NextResponse.redirect(new URL(`/profile`, req.url));
  }

  // If user hits /dashboard directly, redirect to their org dashboard
  if (pathname === "/dashboard" && authData.userId && authData.orgSlug) {
    return NextResponse.redirect(
      new URL(`/${authData.orgSlug}/dashboard`, req.url)
    );
  }

  // if the authData.orgId is undefined but the user is signed in then redirect user profile page
  if (pathname === "/dashboard" && authData.userId && !authData.orgSlug) {
    return NextResponse.redirect(new URL(`/profile`, req.url));
  }

  // Check if route should be protected using our custom function
  if (isProtectedRoutes(req) || isProtectedRoute(pathname)) {
    await auth.protect();
  }

  // If user is authenticated, allow the request to proceed
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
