import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const SSO_SECRET = process.env.CASCADE_SSO_SECRET || "";

const APP_URLS: Record<string, string> = {
  vaarplanner: process.env.VAARPLANNER_URL || "https://planner.varenbijcascade.com",
  werkenbij: process.env.WERKENBIJ_URL || "https://werkenbijcascade.nl",
  qrscan: process.env.QR_SCAN_URL || "https://scan.varenbijcascade.com",
  cadeaubon: process.env.CADEAUBON_URL || "https://cadeaukaart.varenbijcascade.com",
};

export interface SSOPayload {
  email: string;
  name: string;
  role: string;
  source: string;
  target: string;
  nonce: string;
  iat: number;
  exp: number;
}

function sign(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", SSO_SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function createSSOToken(
  user: { email: string; name?: string | null; role: string },
  target: string,
): string {
  const payload: SSOPayload = {
    email: user.email,
    name: user.name || "",
    role: user.role,
    source: "cascade-dashboard",
    target,
    nonce: randomBytes(16).toString("hex"),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60,
  };
  return sign(payload);
}

export function verifySSOToken(token: string): SSOPayload | null {
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;
  const expected = createHmac("sha256", SSO_SECRET).update(data).digest("base64url");
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
  const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SSOPayload;
  if (payload.exp < Date.now() / 1000) return null;
  return payload;
}

export function getAppUrl(app: string): string | null {
  return APP_URLS[app] || null;
}
