import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const productCategories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Phones, laptops, TVs, and other electronic devices',
    metadata: { icon: 'Smartphone', color: 'from-blue-500 to-purple-600', type: 'product' }
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, shoes, bags, and accessories',
    metadata: { icon: 'Shirt', color: 'from-pink-500 to-rose-600', type: 'product' }
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Furniture, decor, and garden supplies',
    metadata: { icon: 'Home', color: 'from-green-500 to-emerald-600', type: 'product' }
  },
  {
    name: 'Vehicles',
    slug: 'vehicles',
    description: 'Cars, motorcycles, and vehicle parts',
    metadata: { icon: 'Car', color: 'from-orange-500 to-red-600', type: 'product' }
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Sports equipment and fitness gear',
    metadata: { icon: 'Activity', color: 'from-teal-500 to-cyan-600', type: 'product' }
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Books, magazines, and educational materials',
    metadata: { icon: 'Book', color: 'from-amber-500 to-yellow-600', type: 'product' }
  },
  {
    name: 'Health & Beauty',
    slug: 'health-beauty',
    description: 'Health products, cosmetics, and personal care',
    metadata: { icon: 'Heart', color: 'from-purple-500 to-indigo-600', type: 'product' }
  },
  {
    name: 'Baby & Kids',
    slug: 'baby-kids',
    description: 'Baby products, toys, and children\'s items',
    metadata: { icon: 'Baby', color: 'from-rose-400 to-pink-500', type: 'product' }
  }
];

const propertyCategories = [
  {
    name: 'Residential',
    slug: 'residential',
    description: 'Houses, apartments, and residential properties',
    metadata: { icon: 'Home', color: 'from-emerald-500 to-teal-600', type: 'property' }
  },
  {
    name: 'Commercial',
    slug: 'commercial',
    description: 'Office spaces, shops, and commercial buildings',
    metadata: { icon: 'Building', color: 'from-blue-500 to-indigo-600', type: 'property' }
  },
  {
    name: 'Land & Plots',
    slug: 'land',
    description: 'Land for sale and development plots',
    metadata: { icon: 'MapPin', color: 'from-green-500 to-emerald-600', type: 'property' }
  },
  {
    name: 'Rentals',
    slug: 'rentals',
    description: 'Properties available for rent',
    metadata: { icon: 'Key', color: 'from-purple-500 to-violet-600', type: 'property' }
  },
  {
    name: 'Luxury Homes',
    slug: 'luxury',
    description: 'Premium and luxury properties',
    metadata: { icon: 'Crown', color: 'from-yellow-500 to-amber-600', type: 'property' }
  },
  {
    name: 'Investment',
    slug: 'investment',
    description: 'Investment properties and opportunities',
    metadata: { icon: 'TrendingUp', color: 'from-cyan-500 to-blue-600', type: 'property' }
  }
];

async function seedCategories() {
  console.log('🌱 Seeding categories...');

  try {
    // Seed product categories
    for (const category of productCategories) {
      const existing = await prisma.category.findUnique({
        where: { slug: category.slug }
      });

      if (!existing) {
        await prisma.category.create({
          data: {
            name: category.name,
            slug: category.slug,
            description: category.description,
            metadata: JSON.stringify(category.metadata)
          }
        });
        console.log(`✅ Created product category: ${category.name}`);
      } else {
        // Update existing category with new metadata
        await prisma.category.update({
          where: { slug: category.slug },
          data: {
            description: category.description,
            metadata: JSON.stringify(category.metadata)
          }
        });
        console.log(`🔄 Updated product category: ${category.name}`);
      }
    }

    // Seed property categories
    for (const category of propertyCategories) {
      const existing = await prisma.category.findUnique({
        where: { slug: category.slug }
      });

      if (!existing) {
        await prisma.category.create({
          data: {
            name: category.name,
            slug: category.slug,
            description: category.description,
            metadata: JSON.stringify(category.metadata)
          }
        });
        console.log(`✅ Created property category: ${category.name}`);
      } else {
        // Update existing category with new metadata
        await prisma.category.update({
          where: { slug: category.slug },
          data: {
            description: category.description,
            metadata: JSON.stringify(category.metadata)
          }
        });
        console.log(`🔄 Updated property category: ${category.name}`);
      }
    }

    console.log('✨ Category seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedCategories()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
