const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");

const prisma = new PrismaClient();

const profiles = [
  ["DÉMO 01", "Aïcha", "Littoral", "Cotonou", "Cadjèhoun"],
  ["DÉMO 02", "Boris", "Littoral", "Cotonou", "Akpakpa"],
  ["DÉMO 03", "Clarisse", "Atlantique", "Abomey-Calavi", "Zogbadjè"],
  ["DÉMO 04", "David", "Atlantique", "Ouidah", "Pahou"],
  ["DÉMO 05", "Estelle", "Ouémé", "Porto-Novo", "Tokpota"],
  ["DÉMO 06", "Franck", "Ouémé", "Sèmè-Kpodji", "Ekpè"],
  ["DÉMO 07", "Grâce", "Borgou", "Parakou", "Zongo"],
  ["DÉMO 08", "Hervé", "Borgou", "Nikki", "Centre"],
  ["DÉMO 09", "Inès", "Zou", "Bohicon", "Agbangon"],
  ["DÉMO 10", "Joël", "Zou", "Abomey", "Djègbé"],
  ["DÉMO 11", "Kévin", "Mono", "Lokossa", "Agamè"],
  ["DÉMO 12", "Lydie", "Mono", "Comè", "Centre"],
  ["DÉMO 13", "Marc", "Atacora", "Natitingou", "Ourbouga"],
  ["DÉMO 14", "Nadia", "Donga", "Djougou", "Taïfa"],
  ["DÉMO 15", "Oscar", "Alibori", "Kandi", "Banigourou"],
  ["DÉMO 16", "Prisca", "Alibori", "Malanville", "Wollo"],
  ["DÉMO 17", "Raoul", "Collines", "Savalou", "Kpataba"],
  ["DÉMO 18", "Sandra", "Collines", "Dassa-Zoumè", "Tré"],
  ["DÉMO 19", "Thierry", "Plateau", "Pobè", "Oké-Ola"],
  ["DÉMO 20", "Vanessa", "Couffo", "Aplahoué", "Azovè"],
];

async function main() {
  const lockedPassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);

  for (const [nom, prenom, departement, ville, quartier] of profiles) {
    const index = Number(nom.slice(-2));
    const telephone = `01000000${String(index).padStart(2, "0")}`;

    await prisma.plumber.upsert({
      where: { telephone },
      update: {
        nom,
        prenom,
        departement,
        ville,
        quartier,
        adresse: quartier,
        isVerified: false,
        hasPaid: false,
      },
      create: {
        nom,
        prenom,
        telephone,
        phoneVerified: false,
        password: lockedPassword,
        diplomeAnnee: 2026,
        diplomeFileUrl: "demo://document-fictif",
        photoUrl: null,
        departement,
        ville,
        quartier,
        adresse: quartier,
        isVerified: false,
        hasPaid: false,
        membershipId: null,
        smsCredits: 0,
      },
    });
  }

  const total = await prisma.plumber.count();
  const demoCount = await prisma.plumber.count({
    where: { nom: { startsWith: "DÉMO " } },
  });

  console.log(JSON.stringify({ insertedOrUpdated: profiles.length, demoCount, total }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
