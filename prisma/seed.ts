import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test users with proper password hashing
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  // Create Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@georgy.com' },
    update: {},
    create: {
      email: 'admin@georgy.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+234-000-000-0000',
      role: 'admin',
      emailVerified: true,
      phoneVerified: true,
      identityVerified: true,
      addressVerified: true,
    },
  });

  // Create Customer user
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      password: customerPassword,
      firstName: 'Test',
      lastName: 'Customer',
      phone: '+234-111-111-1111',
      role: 'customer',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  // Create Seller user
  const sellerPassword = await bcrypt.hash('seller123', 12);
  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@test.com' },
    update: {},
    create: {
      email: 'seller@test.com',
      password: sellerPassword,
      firstName: 'Test',
      lastName: 'Seller',
      phone: '+234-222-222-2222',
      role: 'seller',
      emailVerified: true,
      phoneVerified: true,
      identityVerified: true,
    },
  });

  // Create Artisan user
  const artisanPassword = await bcrypt.hash('artisan123', 12);
  const artisanUser = await prisma.user.upsert({
    where: { email: 'artisan@test.com' },
    update: {},
    create: {
      email: 'artisan@test.com',
      password: artisanPassword,
      firstName: 'Test',
      lastName: 'Artisan',
      phone: '+234-333-333-3333',
      role: 'artisan',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  // Note: Category and Listing models not found in schema, skipping category and listing creation

  console.log('✅ Database seeded successfully');
  console.log('📝 Test accounts created:');
  console.log(`   Admin: ${adminUser.email} / admin123`);
  console.log(`   Customer: ${customerUser.email} / customer123`);
  console.log(`   Seller: ${sellerUser.email} / seller123`);
  console.log(`   Artisan: ${artisanUser.email} / artisan123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
