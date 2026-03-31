import { randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "fallback-secret-change-me"
);

export function generateCode(): string {
  return randomBytes(32).toString("hex");
}

export function generateToken(): string {
  return randomBytes(48).toString("hex");
}

export async function createAuthCode(params: {
  clientId: string;
  userId: string;
  redirectUri: string;
  scopes: string[];
}): Promise<string> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await prisma.oAuthAuthCode.create({
    data: {
      code,
      clientId: params.clientId,
      userId: params.userId,
      redirectUri: params.redirectUri,
      scopes: params.scopes,
      expiresAt,
    },
  });

  return code;
}

export async function exchangeCodeForTokens(params: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<{ access_token: string; token_type: string; expires_in: number; scope: string } | null> {
  const authCode = await prisma.oAuthAuthCode.findUnique({
    where: { code: params.code },
    include: { client: true },
  });

  if (!authCode) return null;
  if (authCode.used) return null;
  if (authCode.expiresAt < new Date()) return null;
  if (authCode.client.clientId !== params.clientId) return null;
  if (authCode.client.clientSecret !== params.clientSecret) return null;
  if (authCode.redirectUri !== params.redirectUri) return null;

  // Mark as used
  await prisma.oAuthAuthCode.update({
    where: { id: authCode.id },
    data: { used: true },
  });

  // Create JWT access token (1 hour)
  const accessExpires = new Date(Date.now() + 60 * 60 * 1000);
  const accessToken = await new SignJWT({
    sub: authCode.userId,
    client_id: params.clientId,
    scope: authCode.scopes.join(" "),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(JWT_SECRET);

  await prisma.oAuthToken.create({
    data: {
      accessToken,
      clientId: authCode.client.id,
      userId: authCode.userId,
      scopes: authCode.scopes,
      accessExpires,
    },
  });

  return {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    scope: authCode.scopes.join(" "),
  };
}

export async function verifyAccessToken(
  token: string
): Promise<{ userId: string; scopes: string[] } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const stored = await prisma.oAuthToken.findUnique({
      where: { accessToken: token },
    });
    if (!stored || stored.accessExpires < new Date()) return null;
    return {
      userId: payload.sub as string,
      scopes: stored.scopes,
    };
  } catch {
    return null;
  }
}

export async function validateClient(
  clientId: string,
  redirectUri: string
): Promise<{ id: string; name: string; scopes: string[] } | null> {
  const client = await prisma.oAuthClient.findUnique({
    where: { clientId },
  });
  if (!client) return null;
  if (!client.redirectUris.includes(redirectUri)) return null;
  return { id: client.id, name: client.name, scopes: client.scopes };
}
