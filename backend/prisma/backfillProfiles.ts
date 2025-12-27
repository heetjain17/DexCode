import { PrismaClient } from '../src/generated/prisma/index.js';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        username: user.email.split('@')[0], // temporary
        displayName: user.email.split('@')[0],
      },
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
