import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendInviteEmail } from "@/lib/email";
import { getEffectivePermissions } from "@/lib/permissions";

async function requireUsersManage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { customRole: true },
  });
  if (!user) return null;
  const perms = getEffectivePermissions(user.customRole?.permissions || [], user.permissionOverrides);
  if (!perms.includes("users:manage")) return null;
  return session;
}

export async function GET() {
  if (!(await requireUsersManage())) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true, email: true, name: true, passwordSet: true,
        apps: true, permissionOverrides: true, createdAt: true,
        customRole: { select: { id: true, name: true, permissions: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.customRole.findMany({ orderBy: { name: "asc" } }),
  ]);

  return NextResponse.json({ users, roles });
}

export async function POST(request: Request) {
  if (!(await requireUsersManage())) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const body = await request.json();
  const { email, name, roleId, apps, overrides } = body;

  if (!email) {
    return NextResponse.json({ error: "Email is verplicht" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email is al in gebruik" }, { status: 409 });
  }

  // Placeholder password - user sets via invite link
  const placeholderHash = await bcrypt.hash(crypto.randomBytes(64).toString("hex"), 12);

  const user = await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash: placeholderHash,
      passwordSet: false,
      customRoleId: roleId || null,
      apps: apps || [],
      permissionOverrides: overrides || [],
    },
  });

  // Generate invite token (48 hours)
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.inviteToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

  // Send invite email
  try {
    await sendInviteEmail(email, name || "", token);
  } catch (e) {
    console.error("Invite email failed:", e);
  }

  return NextResponse.json({ id: user.id }, { status: 201 });
}
