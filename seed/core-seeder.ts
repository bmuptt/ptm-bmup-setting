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
            primary_color: '#f86f24',
            secondary_color: '#efbc37',
            created_by: 0,
            updated_by: null,
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