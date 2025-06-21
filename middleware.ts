// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/(dashboard)(.*)",
  "/:orgSlug/dashboard(.*)",
  "/:orgSlug/customers(.*)",
  "/:orgSlug/leads(.*)",
  "/:orgSlug/projects(.*)",
  "/:orgSlug/settings(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const authData = await auth();

  // If user hits /dashboard directly, redirect to their org dashboard
  if (
    req.nextUrl.pathname === "/dashboard" &&
    authData.userId &&
    authData.orgSlug
  ) {
    return NextResponse.redirect(
      new URL(`/${authData.orgSlug}/dashboard`, req.url)
    );
  }

  // if the authData.orgId is undefined but the user is signed in then redirect user profile page
  if (
    req.nextUrl.pathname === "/dashboard" &&
    authData.userId &&
    !authData.orgSlug
  ) {
    return NextResponse.redirect(new URL(`/profile`, req.url));
  }

  if (isProtectedRoute(req)) {
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
