import { prisma } from "./config/db";
import bcrypt from "bcryptjs";

/**
 * Seed script to create default users for all 4 roles.
 * Can be run manually or invoked on server boot.
 */
export async function seedDatabase() {
  console.log("Seeding database...");

  const users = [
    { name: "Admin User", email: "admin@fundrooms.com", password: "admin123", role: "ADMIN" as const },
    { name: "Sales User", email: "sales@fundrooms.com", password: "sales123", role: "SALES" as const },
    { name: "Warehouse User", email: "warehouse@fundrooms.com", password: "warehouse123", role: "WAREHOUSE" as const },
    { name: "Accounts User", email: "accounts@fundrooms.com", password: "accounts123", role: "ACCOUNTS" as const },
  ];

  const results = [];
  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        password: hashedPassword,
        role: userData.role,
      },
      create: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
      },
    });

    console.log(`Seeded/Updated user: ${user.email} (${user.role})`);
    results.push({ email: user.email, role: user.role, status: "seeded_upserted" });
  }

  console.log("Seeding complete!");
  return results;
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      prisma.$disconnect();
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed error:", error);
      prisma.$disconnect();
      process.exit(1);
    });
}

