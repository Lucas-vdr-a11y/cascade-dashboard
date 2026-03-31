import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/oauth";

export async function POST(request: NextRequest) {
  let body: Record<string, string>;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    body = Object.fromEntries(new URLSearchParams(text));
  } else {
    body = await request.json();
  }

  const { grant_type, code, redirect_uri, client_id, client_secret } = body;

  if (grant_type !== "authorization_code") {
    return NextResponse.json(
      { error: "unsupported_grant_type" },
      { status: 400 }
    );
  }

  if (!code || !redirect_uri || !client_id || !client_secret) {
    return NextResponse.json(
      { error: "invalid_request" },
      { status: 400 }
    );
  }

  const tokens = await exchangeCodeForTokens({
    code,
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri,
  });

  if (!tokens) {
    return NextResponse.json(
      { error: "invalid_grant" },
      { status: 400 }
    );
  }

  return NextResponse.json(tokens, {
    headers: { "Cache-Control": "no-store" },
  });
}
