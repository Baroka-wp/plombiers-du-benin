import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || "admin@plombiersbenin.bj";
  const password = process.argv[3] || "admin123";
  const name = process.argv[4] || "Administrateur";

  if (!email || !password) {
    console.error("Usage: tsx scripts/create-admin.ts <email> <password> <name>");
    process.exit(1);
  }

  // Vérifier si l'admin existe déjà
  const existing = await prisma.admin.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`Admin avec l'email ${email} existe déjà.`);
    process.exit(0);
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Créer l'admin
  const admin = await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: "admin",
    },
  });

  console.log(`✅ Admin créé avec succès !`);
  console.log(`Email: ${admin.email}`);
  console.log(`Nom: ${admin.name}`);
  console.log(`Rôle: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

