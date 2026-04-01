import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createSSOToken, getAppUrl } from "@/lib/sso";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const target = request.nextUrl.searchParams.get("target");
  if (!target) {
    return NextResponse.json({ error: "Target app is verplicht" }, { status: 400 });
  }

  const appUrl = getAppUrl(target);
  if (!appUrl) {
    return NextResponse.json({ error: "Onbekende target app" }, { status: 400 });
  }

  const token = createSSOToken(
    { email: session.user.email, name: session.user.name, role: "ADMIN" },
    target,
  );

  const ssoPath = target === "qrscan" ? "/api/auth/sso" : "/api/sso/receive";
  return NextResponse.redirect(`${appUrl}${ssoPath}?token=${token}`);
}
