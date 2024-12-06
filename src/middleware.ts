import { NextRequest, NextResponse } from "next/server";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  protectedRoutes,
} from "@/lib/routes";

const SESSION_COOKIE_NAME = "vishwas-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const isLoggedIn = !!sessionCookie?.value;

  // For API routes, set a header indicating authentication status and pass through
  if (pathname.startsWith(apiAuthPrefix)) {
    const headers = new Headers(request.headers);
    headers.set("X-Is-Authenticated", isLoggedIn ? "true" : "false");
    headers.set("X-Auth-Cookie", sessionCookie?.value || "");
    return NextResponse.next({
      request: {
        headers: headers,
      },
    });
  }

  // Redirect logged-in users trying to access auth routes
  if (isLoggedIn && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
  }

  // Redirect non-logged-in users to login page for protected routes
  if (!isLoggedIn && protectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Allow access to all other routes
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
