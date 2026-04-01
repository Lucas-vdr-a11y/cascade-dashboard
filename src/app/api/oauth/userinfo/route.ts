import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/oauth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401 }
    );
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: "invalid_token" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, image: true, customRole: { select: { name: true, permissions: true } }, permissionOverrides: true },
  });

  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  return NextResponse.json({
    sub: user.id,
    email: user.email,
    name: user.name,
    picture: user.image,
    role: user.customRole?.name || "ADMIN",
  });
}
