import prisma from '../src/config/database';

export async function seedIcons() {
  const icons = [
    { name: 'mdi-table-tennis', label: 'Table Tennis' },
    { name: 'mdi-trophy', label: 'Trophy' },
    { name: 'mdi-handshake', label: 'Handshake' },
    { name: 'mdi-account-group', label: 'Komunitas' },
    { name: 'mdi-calendar', label: 'Jadwal' },
    { name: 'mdi-clock-outline', label: 'Waktu' },
    { name: 'mdi-map-marker', label: 'Lokasi' },
    { name: 'mdi-email', label: 'Email' },
    { name: 'mdi-phone', label: 'Telepon' },
    { name: 'mdi-whatsapp', label: 'WhatsApp' },
    { name: 'mdi-instagram', label: 'Instagram' },
    { name: 'mdi-facebook', label: 'Facebook' },
    { name: 'mdi-youtube', label: 'YouTube' },
    { name: 'mdi-medal', label: 'Prestasi' },
    { name: 'mdi-star', label: 'Highlight' },
    { name: 'mdi-heart', label: 'Solidaritas' },
  ];

  await prisma.icon.createMany({
    data: icons.map((icon) => ({
      name: icon.name,
      label: icon.label,
      is_active: true,
    })),
    skipDuplicates: true,
  });

  return icons;
}

async function main() {
  console.log('🌱 Seeding Icons...');
  const seeded = await seedIcons();
  console.log('✅ Icons seeded:', seeded.map((i) => i.name).join(', '));
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Error seeding icons:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      console.log('🔌 Database connection closed');
    });
}
