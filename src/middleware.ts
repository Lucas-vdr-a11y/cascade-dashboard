import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  const { nextUrl, auth: session } = request;

  // Public paths — skip auth check
  const isPublic =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname.startsWith("/api/oauth");

  if (isPublic) return NextResponse.next();

  if (!session) {
    // Use AUTH_URL for the redirect base to avoid 0.0.0.0 issues behind proxy
    const base = process.env.AUTH_URL || nextUrl.origin;
    const loginUrl = new URL("/login", base);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|api/oauth).*)"],
};
