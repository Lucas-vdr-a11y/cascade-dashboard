import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getEffectivePermissions } from "@/lib/permissions";

async function requireRolesManage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { customRole: true },
  });
  if (!user) return null;
  const perms = getEffectivePermissions(user.customRole?.permissions || [], user.permissionOverrides);
  if (!perms.includes("roles:manage")) return null;
  return session;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireRolesManage())) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;
  const { name, permissions } = await request.json();

  const role = await prisma.customRole.findUnique({ where: { id } });
  if (!role) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  if (role.isSystem) return NextResponse.json({ error: "Systeemrollen kunnen niet bewerkt worden" }, { status: 400 });

  await prisma.customRole.update({ where: { id }, data: { name, permissions } });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireRolesManage())) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;
  const role = await prisma.customRole.findUnique({ where: { id }, include: { users: true } });
  if (!role) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  if (role.isSystem) return NextResponse.json({ error: "Systeemrollen kunnen niet verwijderd worden" }, { status: 400 });
  if (role.users.length > 0) return NextResponse.json({ error: `Rol is nog toegewezen aan ${role.users.length} gebruiker(s)` }, { status: 400 });

  await prisma.customRole.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
