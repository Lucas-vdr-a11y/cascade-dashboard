import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateClient, createAuthCode } from "@/lib/oauth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("client_id") ?? "";
  const redirectUri = searchParams.get("redirect_uri") ?? "";
  const responseType = searchParams.get("response_type");
  const scope = searchParams.get("scope") ?? "openid profile email";
  const state = searchParams.get("state") ?? "";

  if (responseType !== "code") {
    return NextResponse.json(
      { error: "unsupported_response_type" },
      { status: 400 }
    );
  }

  const client = await validateClient(clientId, redirectUri);
  if (!client) {
    return NextResponse.json(
      { error: "invalid_client" },
      { status: 400 }
    );
  }

  // Check if user is logged in
  const session = await auth();
  if (!session?.user?.id) {
    // Redirect to login with return URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Auto-approve (internal clients only — no consent screen needed)
  const scopes = scope.split(" ");
  const code = await createAuthCode({
    clientId: client.id,
    userId: session.user.id,
    redirectUri,
    scopes,
  });

  const callbackUrl = new URL(redirectUri);
  callbackUrl.searchParams.set("code", code);
  if (state) callbackUrl.searchParams.set("state", state);

  return NextResponse.redirect(callbackUrl);
}
