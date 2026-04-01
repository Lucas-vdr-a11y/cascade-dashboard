"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Niet ingelogd" };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Naam is verplicht" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  return { success: true };
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Niet ingelogd" };

  const current = formData.get("currentPassword") as string;
  const newPass = formData.get("newPassword") as string;
  const confirm = formData.get("confirmPassword") as string;

  if (!current || !newPass || !confirm) return { error: "Vul alle velden in" };
  if (newPass.length < 8) return { error: "Wachtwoord moet minimaal 8 tekens zijn" };
  if (newPass !== confirm) return { error: "Wachtwoorden komen niet overeen" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash) return { error: "Geen wachtwoord ingesteld" };

  const valid = await bcrypt.compare(current, user.passwordHash);
  if (!valid) return { error: "Huidig wachtwoord is onjuist" };

  const hash = await bcrypt.hash(newPass, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: hash },
  });

  return { success: true };
}
