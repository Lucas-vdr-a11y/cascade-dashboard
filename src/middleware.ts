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
    const base = process.env.AUTH_URL || nextUrl.origin;
    const loginUrl = new URL("/login", base);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes require SUPER_ADMIN
  if (nextUrl.pathname.startsWith("/admin")) {
    const role = (session.user as any)?.role;
    if (role !== "SUPER_ADMIN") {
      const base = process.env.AUTH_URL || nextUrl.origin;
      return NextResponse.redirect(new URL("/", base));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|api/auth|api/oauth).*)"],
};
