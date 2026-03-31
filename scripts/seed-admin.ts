/**
 * Maakt een initiële admin user aan.
 * Gebruik: npx tsx scripts/seed-admin.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as readline from "readline";

const prisma = new PrismaClient();

async function question(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const email = await question("E-mailadres: ");
  const name = await question("Naam: ");
  const password = await question("Wachtwoord: ");

  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Gebruiker ${email} bestaat al — wachtwoord bijgewerkt.`);
    await prisma.user.update({
      where: { email },
      data: { passwordHash, name },
    });
  } else {
    await prisma.user.create({
      data: { email, name, passwordHash, role: "SUPER_ADMIN" },
    });
    console.log(`Admin ${email} aangemaakt.`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
