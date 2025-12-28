import { TestHelper } from '../../test-util';
import landingService from '../../../src/services/landing.service';

describe('Get Landing Sections Integration Tests', () => {
  beforeEach(async () => {
    await TestHelper.refreshDatabase();
  });

  afterAll(async () => {
    await TestHelper.cleanupAll();
  });

  it('Should get home section with items after upsert', async () => {
    await landingService.upsertItems({
      page_key: 'home',
      items: [
        { key: 'hero', type: 'text', title: 'Selamat Datang', content: 'BMUP Home', published: true },
        { key: 'contact_email', type: 'text', content: 'support@example.com', published: true },
        { key: 'tentang_kami', type: 'text', content: 'Tentang kami singkat di halaman Home', published: true, status_image: '0' },
      ],
    }, 1);

    const result = await landingService.getSection('home');
    expect(result.success).toBe(true);
    expect(result.message).toBe('Landing section retrieved successfully');
    expect(result.data.section.page_key).toBe('home');
    expect(Array.isArray(result.data.items)).toBe(true);
    expect(result.data.items.length).toBe(3);
  });

  it('Should get all sections with items after multi upsert', async () => {
    await landingService.upsertItemsMulti({
      sections: [
        {
          page_key: 'home',
          items: [
            { key: 'hero', type: 'text', title: 'Selamat Datang', content: 'BMUP Home', published: true },
            { key: 'contact_email', type: 'text', content: 'support@example.com', published: true },
          ],
        },
        {
          page_key: 'about',
          items: [
            { key: 'visi', type: 'text', content: 'Meningkatkan kualitas', published: true },
            { key: 'misi', type: 'text', content: 'Memberikan layanan terbaik', published: true },
          ],
        },
      ],
    }, 2);

    const result = await landingService.getAllSections();
    expect(result.success).toBe(true);
    expect(result.message).toBe('Landing sections retrieved successfully');
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThanOrEqual(2);
    const pages = result.data.map(s => s.section.page_key);
    expect(pages).toEqual(expect.arrayContaining(['home', 'about']));
  });
});

