import { TestHelper } from '../../test-util';
import landingService from '../../../src/services/landing.service';
import prisma from '../../../src/config/database';

describe('Landing Multi Section Upsert Integration Tests', () => {
  beforeEach(async () => {
    await TestHelper.refreshDatabase();
  });

  afterAll(async () => {
    await TestHelper.cleanupAll();
  });

  it('Should upsert home and about sections in one request', async () => {
    const result = await landingService.upsertItemsMulti({
      sections: [
        {
          page_key: 'home',
          items: [
            { key: 'hero', type: 'text', title: 'Judul Home', content: 'Konten Home', published: true },
            { key: 'contact_email', type: 'text', content: 'support@example.com', published: true },
          ],
        },
        {
          page_key: 'about',
          items: [
            { key: 'visi', type: 'text', content: 'Visi Kami', published: true },
            { key: 'misi', type: 'text', content: 'Misi Kami', published: true },
          ],
        },
      ],
    }, 10);

    expect(result.success).toBe(true);
    const home = await prisma.landingSection.findUnique({ where: { page_key: 'home' } });
    const about = await prisma.landingSection.findUnique({ where: { page_key: 'about' } });
    expect(home).toBeTruthy();
    expect(about).toBeTruthy();

    const homeItems = await prisma.landingItem.findMany({ where: { section_id: home!.id } });
    const aboutItems = await prisma.landingItem.findMany({ where: { section_id: about!.id } });
    expect(homeItems.length).toBe(2);
    expect(aboutItems.length).toBe(2);
    expect(homeItems.find(i => i.key === 'hero')?.title).toBe('Judul Home');
  });

  it('Should keep image_url when status_image = 0', async () => {
    await landingService.upsertItemsMulti({
      sections: [
        {
          page_key: 'home',
          items: [
            { key: 'tentang_kami', type: 'text', content: 'Tentang kami', published: true },
          ],
        },
      ],
    }, 1);

    const section = await prisma.landingSection.findUnique({ where: { page_key: 'home' } });
    const existing = await prisma.landingItem.findFirst({ where: { section_id: section!.id, key: 'tentang_kami' } });
    const seededImageUrl = 'http://localhost:3200/storage/images/tentang-kami.jpg';

    await prisma.landingItem.update({
      where: { id: existing!.id },
      data: { image_url: seededImageUrl },
    });

    await landingService.upsertItemsMulti({
      sections: [
        {
          page_key: 'home',
          items: [
            { key: 'tentang_kami', type: 'text', content: 'Tentang kami update', published: true, status_image: '0' },
          ],
        },
      ],
    }, 2);

    const after = await prisma.landingItem.findFirst({ where: { section_id: section!.id, key: 'tentang_kami' } });
    expect(after?.content).toBe('Tentang kami update');
    expect(after?.image_url).toBe(seededImageUrl);
  });
});
