import { prisma } from "./config/db";
import bcrypt from "bcryptjs";

/**
 * Seed script to create default users for all 4 roles.
 * Run with: npx ts-node src/seed.ts
 */
async function seed() {
  console.log("Seeding database...");

  const users = [
    { name: "Admin User", email: "admin@fundrooms.com", password: "admin123", role: "ADMIN" as const },
    { name: "Sales User", email: "sales@fundrooms.com", password: "sales123", role: "SALES" as const },
    { name: "Warehouse User", email: "warehouse@fundrooms.com", password: "warehouse123", role: "WAREHOUSE" as const },
    { name: "Accounts User", email: "accounts@fundrooms.com", password: "accounts123", role: "ACCOUNTS" as const },
  ];

  for (const userData of users) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existing) {
      console.log(`User ${userData.email} already exists, skipping.`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
      },
    });

    console.log(`Created user: ${userData.email} (${userData.role})`);
  }

  console.log("Seeding complete!");
  await prisma.$disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed error:", error);
  prisma.$disconnect();
  process.exit(1);
});
