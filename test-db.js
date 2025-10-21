const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test if tables exist by counting users
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in database`);
    
    await prisma.$disconnect();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    
    if (error.code === 'P1001') {
      console.error('💡 Database server not reachable. Is MySQL running?');
    } else if (error.code === 'P1017') {
      console.error('💡 Database not found. Run: npm run db:push');
    }
    
    process.exit(1);
  }
}

testDatabase();
