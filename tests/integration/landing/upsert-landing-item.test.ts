import { TestHelper } from '../../test-util';
import landingService from '../../../src/services/landing.service';
import prisma from '../../../src/config/database';

describe('Landing Items Upsert Integration Tests', () => {
  beforeEach(async () => {
    await TestHelper.refreshDatabase();
  });

  afterAll(async () => {
    await TestHelper.cleanupAll();
  });

  it('Should create items when not exists for home section', async () => {
    const result = await landingService.upsertItems({
      page_key: 'home',
      items: [
        {
          key: 'hero',
          type: 'text',
          title: 'Selamat Datang',
          content: 'BMUP Home',
          button_label: 'Mulai',
          button_url: 'https://example.com/start',
          published: true,
        },
        {
          key: 'contact_email',
          type: 'text',
          content: 'support@example.com',
          button_url: 'mailto:support@example.com',
          published: true,
        },
      ],
    }, 1);

    expect(result.success).toBe(true);
    const section = await prisma.landingSection.findUnique({ where: { page_key: 'home' } });
    expect(section).toBeTruthy();
    const items = await prisma.landingItem.findMany({ where: { section_id: section!.id } });
    expect(items.length).toBe(2);
    const hero = items.find(i => i.key === 'hero');
    expect(hero?.title).toBe('Selamat Datang');
  });

  it('Should update items when exists for home section', async () => {
    await landingService.upsertItems({
      page_key: 'home',
      items: [
        {
          key: 'hero',
          type: 'text',
          title: 'Selamat Datang',
          content: 'BMUP Home',
          published: true,
        },
      ],
    }, 1);

    const result = await landingService.upsertItems({
      page_key: 'home',
      items: [
        {
          key: 'hero',
          type: 'text',
          title: 'Judul Baru',
          content: 'Konten Baru',
          published: true,
        },
      ],
    }, 2);

    expect(result.success).toBe(true);
    const section = await prisma.landingSection.findUnique({ where: { page_key: 'home' } });
    const hero = await prisma.landingItem.findFirst({ where: { section_id: section!.id, key: 'hero' } });
    expect(hero?.title).toBe('Judul Baru');
    expect(hero?.content).toBe('Konten Baru');
  });

  it('Should create items for about section separately', async () => {
    const result = await landingService.upsertItems({
      page_key: 'about',
      items: [
        {
          key: 'visi',
          type: 'text',
          content: 'Meningkatkan kualitas',
          published: true,
        },
        {
          key: 'misi',
          type: 'text',
          content: 'Memberikan layanan terbaik',
          published: true,
        },
      ],
    }, 3);

    expect(result.success).toBe(true);
    const aboutSection = await prisma.landingSection.findUnique({ where: { page_key: 'about' } });
    const items = await prisma.landingItem.findMany({ where: { section_id: aboutSection!.id } });
    expect(items.length).toBe(2);
  });
});

