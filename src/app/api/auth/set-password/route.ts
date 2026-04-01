import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ error: "Token en wachtwoord zijn verplicht" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Wachtwoord moet minimaal 8 tekens zijn" }, { status: 400 });
  }

  const inviteToken = await prisma.inviteToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!inviteToken || inviteToken.used || inviteToken.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Ongeldige of verlopen link. Vraag een nieuwe aan bij de beheerder." },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: inviteToken.userId },
      data: { passwordHash: hashedPassword, passwordSet: true },
    }),
    prisma.inviteToken.update({
      where: { id: inviteToken.id },
      data: { used: true },
    }),
  ]);

  return NextResponse.json({ success: true });
}
