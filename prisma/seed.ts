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

  // Create a sample category, product, inventory, address, coupon and cart

  // Upsert Category
  const category = await prisma.category.upsert({
    where: { id: 'cat_electronics' },
    update: {},
    create: {
      id: 'cat_electronics',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
    },
  });

  // Create a sample product (use deterministic id so upsert works)
  const sampleProductId = 'prod_sample_1';
  const product = await prisma.product.upsert({
    where: { id: sampleProductId },
    update: {},
    create: {
      id: sampleProductId,
      title: 'Sample Phone',
      productName: 'Sample Phone',
      description: 'A demo smartphone for seeding',
      price: 199.99,
      originalPrice: 249.99,
      categoryId: category.id,
      images: JSON.stringify(['https://placehold.co/600x400.png']),
      sellerId: sellerUser.id,
      featured: true,
      status: 'active',
    },
  });

  // Inventory for sample product
  await prisma.inventory.upsert({
    where: { id: 'inv_prod_sample_1' },
    update: {},
    create: {
      id: 'inv_prod_sample_1',
      productId: product.id,
      sku: 'SAMPLE-SKU-1',
      stock: 100,
      reserved: 0,
      threshold: 5,
    },
  });

  // Address for customer
  await prisma.address.upsert({
    where: { id: 'addr_customer_1' },
    update: {},
    create: {
      id: 'addr_customer_1',
      userId: customerUser.id,
      label: 'Home',
      address: JSON.stringify({ line1: '12 Demo Street', city: 'Lagos', state: 'LA', country: 'NG' }),
      city: 'Lagos',
      state: 'LA',
      country: 'NG',
      postalCode: '100001',
      isPrimary: true,
    },
  });

  // Coupon
  await prisma.coupon.upsert({
    where: { id: 'coupon_demo_10' },
    update: {},
    create: {
      id: 'coupon_demo_10',
      code: 'WELCOME10',
      description: '10% off for new users',
      discountType: 'percentage',
      amount: 10,
      isActive: true,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Cart with one item for the customer
  await prisma.cart.upsert({
    where: { id: 'cart_customer_1' },
    update: {},
    create: {
      id: 'cart_customer_1',
      userId: customerUser.id,
      total: product.price * 2,
      items: {
        create: [{
          id: 'cart_item_1',
          productId: product.id,
          quantity: 2,
          price: product.price,
        }],
      },
    },
  });

  // 🔥 Create realistic orders and payments for analytics
  console.log('📦 Creating sample orders and payments...');

  // Create 10+ orders with various statuses and timestamps
  const orderStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < 12; i++) {
    const orderTimestamp = new Date(thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo));
    const status = orderStatuses[i % orderStatuses.length];
    const quantity = Math.floor(Math.random() * 5) + 1;
    const itemPrice = Math.floor(Math.random() * 150000) + 50000; // ₦50k-₦200k
    const totalAmount = itemPrice * quantity;

    await prisma.order.create({
      data: {
        productId: product.id,
        buyerId: customerUser.id,
        sellerId: sellerUser.id,
        quantity,
        totalAmount,
        status,
        paymentStatus: status === 'delivered' ? 'paid' : 'pending',
        paymentMethod: 'card',
        shippingAddress: '123 Market Street, Lagos, Nigeria',
        createdAt: orderTimestamp,
        updatedAt: orderTimestamp,
      },
    }).catch(() => {
      // Silently skip if order already exists
    });
  }

  // Create corresponding payment records
  const platformCut = 0.10; // 10% platform fee
  for (let i = 0; i < 8; i++) {
    const orderTimestamp = new Date(thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo));
    const totalAmount = Math.floor(Math.random() * 150000) + 50000;
    const platformCutAmount = totalAmount * platformCut;
    const sellerNetAmount = totalAmount - platformCutAmount;

    await prisma.payment.create({
      data: {
        reference: `ref_${Math.random().toString(36).substr(2, 9)}`,
        userId: customerUser.id,
        sellerId: sellerUser.id,
        amount: totalAmount,
        currency: 'NGN',
        method: 'card',
        status: 'completed',
        provider: 'paystack',
        providerRef: `pstk_${Math.random().toString(36).substr(2, 9)}`,
        platformCut: platformCutAmount,
        sellerNet: sellerNetAmount,
        processingFee: totalAmount * 0.015,
        paidAt: orderTimestamp,
        createdAt: orderTimestamp,
      },
    }).catch(() => {
      // Silently skip if payment already exists
    });
  }

  // Create additional sellers
  const sellers = [sellerUser];
  for (let i = 2; i <= 3; i++) {
    const newSeller = await prisma.user.upsert({
      where: { email: `seller${i}@test.com` },
      update: {},
      create: {
        email: `seller${i}@test.com`,
        password: await bcrypt.hash(`seller${i}password`, 12),
        firstName: `Seller ${i}`,
        lastName: 'Store',
        phone: `+234-${i}${i}${i}-${i}${i}${i}-${i}${i}${i}${i}`,
        role: 'seller',
        emailVerified: true,
      },
    });
    sellers.push(newSeller);
  }

  // Create more products for top sellers analytics
  const productNames = [
    'Wireless Earbuds',
    'USB-C Cable',
    'Phone Case',
    'Screen Protector',
    'Power Bank',
    'Laptop Stand',
    'Bluetooth Speaker',
    'Phone Charger',
  ];

  for (let i = 0; i < productNames.length; i++) {
    const seller = sellers[i % sellers.length];
    const prodName = productNames[i];

    await prisma.product.create({
      data: {
        title: prodName,
        productName: prodName,
        description: `Premium ${prodName.toLowerCase()} for your devices`,
        price: Math.floor(Math.random() * 50000) + 5000,
        originalPrice: Math.floor(Math.random() * 60000) + 10000,
        categoryId: category.id,
        images: JSON.stringify(['https://placehold.co/600x400.png']),
        sellerId: seller.id,
        featured: false,
        status: 'active',
      },
    }).catch(() => {
      // Silently skip if product already exists
    });
  }

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
