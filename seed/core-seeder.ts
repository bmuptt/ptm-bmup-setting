import prisma from '../src/config/database';

async function main() {
    console.log('🌱 Seeding Core data...');
    
    const core = await prisma.core.create({
        data: {
            id: 0,
            name: 'PTM BMUP',
            logo: null,
            description: 'Sistem pengaturan BMUP',
            address: 'Jl. Contoh No. 123, Jakarta',
            maps: null,
            primaryColor: '#f86f24',
            secondaryColor: '#efbc37',
            createdBy: 0,
            updatedBy: null,
        },
    });
    
    console.log('✅ Core data seeded successfully:', core);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log('🔌 Database connection closed');
    });