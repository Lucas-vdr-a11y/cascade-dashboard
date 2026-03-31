/**
 * Registreert OAuth 2 clients (cadeaubon + planner).
 * Gebruik: npx tsx scripts/seed-oauth-clients.ts
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

const CLIENTS = [
  {
    clientId: "cascade-cadeaubon",
    name: "Cascade Cadeaubon",
    redirectUris: [
      "https://cadeaukaart.varenbijcascade.com/api/auth/callback/cascade-dashboard",
      "http://localhost:3000/api/auth/callback/cascade-dashboard",
    ],
    scopes: ["openid", "profile", "email"],
  },
  {
    clientId: "cascade-planner",
    name: "Cascade Personeelsplanner",
    redirectUris: [
      "https://planner.varenbijcascade.com/api/auth/callback/cascade-dashboard",
      "http://localhost:3002/api/auth/callback/cascade-dashboard",
    ],
    scopes: ["openid", "profile", "email"],
  },
];

async function main() {
  for (const client of CLIENTS) {
    const existing = await prisma.oAuthClient.findUnique({
      where: { clientId: client.clientId },
    });

    if (existing) {
      console.log(`Client ${client.clientId} bestaat al — overgeslagen.`);
      continue;
    }

    const clientSecret = randomBytes(32).toString("hex");
    await prisma.oAuthClient.create({
      data: { ...client, clientSecret },
    });
    console.log(`\nClient: ${client.clientId}`);
    console.log(`Secret: ${clientSecret}`);
    console.log(`→ Sla dit op in .env van het betreffende project.`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
