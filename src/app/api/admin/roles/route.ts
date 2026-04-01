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

export async function POST(request: Request) {
  if (!(await requireRolesManage())) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { name, permissions } = await request.json();
  if (!name) return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });

  const exists = await prisma.customRole.findUnique({ where: { name } });
  if (exists) return NextResponse.json({ error: "Naam is al in gebruik" }, { status: 409 });

  const role = await prisma.customRole.create({
    data: { name, permissions: permissions || [] },
  });

  return NextResponse.json(role, { status: 201 });
}
