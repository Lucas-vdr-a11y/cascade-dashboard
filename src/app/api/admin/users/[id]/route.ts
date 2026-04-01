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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireUsersManage())) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, email, roleId, apps, overrides, password } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if (roleId !== undefined) data.customRoleId = roleId || null;
  if (apps !== undefined) data.apps = apps;
  if (overrides !== undefined) data.permissionOverrides = overrides;
  if (password) {
    if (password.length < 8) {
      return NextResponse.json({ error: "Wachtwoord moet minimaal 8 tekens zijn" }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireUsersManage();
  if (!session) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;
  if (session.user!.id === id) {
    return NextResponse.json({ error: "Je kunt jezelf niet verwijderen" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

// Resend invite
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireUsersManage())) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  // Invalidate old tokens
  await prisma.inviteToken.updateMany({
    where: { userId: id, used: false },
    data: { used: true },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.inviteToken.create({
    data: {
      userId: id,
      token,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

  await sendInviteEmail(user.email, user.name || "", token);
  return NextResponse.json({ success: true });
}
