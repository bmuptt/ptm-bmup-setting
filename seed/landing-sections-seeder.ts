import prisma from '../src/config/database';

async function main() {
  console.log('🌱 Seeding Landing Sections...');
  const sections = ['home', 'about'] as const;
  for (const key of sections) {
    await prisma.landingSection.upsert({
      where: { page_key: key },
      update: {
        updated_by: BigInt(0),
      },
      create: {
        page_key: key,
        created_by: BigInt(0),
        updated_by: BigInt(0),
      },
    });
  }
  console.log('✅ Landing Sections seeded:', sections.join(', '));
}

main()
  .catch((e) => {
    console.error('❌ Error seeding landing sections:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  });

