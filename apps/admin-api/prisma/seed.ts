import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding initial SuperAdmin...');

  // Use environment variables. NEVER hardcode the initial admin credentials here!
  const adminEmail = process.env.INITIAL_SUPERADMIN_EMAIL;
  const adminPassword = process.env.INITIAL_SUPERADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      'Warning: INITIAL_SUPERADMIN_EMAIL or INITIAL_SUPERADMIN_PASSWORD is not set in .env. Skipping SuperAdmin seeding.',
    );
    return;
  }

  // WIPE DATABASE CLEAN
  console.log('Wiping all existing superadmins for a clean slate...');
  await prisma.superAdmin.deleteMany();

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const superAdmin = await prisma.superAdmin.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      fullName: 'Infinite Motion Xpress Admin',
      role: 'ROOT_SUPERADMIN',
      status: 'ACTIVE',
    },
    create: {
      email: adminEmail,
      passwordHash,
      fullName: 'Infinite Motion Xpress Admin',
      role: 'ROOT_SUPERADMIN',
      status: 'ACTIVE',
    },
  });

  console.log(`SuperAdmin seeded successfully: ${superAdmin.email}`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
