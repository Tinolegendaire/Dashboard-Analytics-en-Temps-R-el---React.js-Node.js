import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with 10,000 analytics records...');

  const records = [];
  const startDate = new Date('2024-01-01T00:00:00Z');
  const endDate = new Date('2024-12-31T23:59:59Z');

  const regions = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'];
  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys'];
  const sources = ['Direct', 'Organic Search', 'Paid Ads', 'Social Media', 'Email', 'Referral'];

  for (let i = 0; i < 10000; i++) {
    const timestamp = faker.date.between({ from: startDate, to: endDate });
    
    records.push({
      timestamp,
      revenue: faker.number.float({ min: 100, max: 50000, fractionDigits: 2 }),
      users: faker.number.int({ min: 10, max: 5000 }),
      sessions: faker.number.int({ min: 15, max: 8000 }),
      bounceRate: faker.number.float({ min: 20, max: 85, fractionDigits: 1 }),
      conversion: faker.number.float({ min: 0.5, max: 15, fractionDigits: 2 }),
      region: faker.helpers.arrayElement(regions),
      category: faker.helpers.arrayElement(categories),
      source: faker.helpers.arrayElement(sources),
    });

    // Batch insert every 1000 records for performance
    if (records.length === 1000) {
      await prisma.analytics.createMany({
        data: records,
        skipDuplicates: true,
      });
      console.log(`✅ Inserted ${i + 1} records...`);
      records.length = 0;
    }
  }

  // Insert remaining records
  if (records.length > 0) {
    await prisma.analytics.createMany({
      data: records,
      skipDuplicates: true,
    });
  }

  console.log('✅ Seeding completed successfully!');
  
  // Verify count
  const count = await prisma.analytics.count();
  console.log(`📊 Total records in database: ${count}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });