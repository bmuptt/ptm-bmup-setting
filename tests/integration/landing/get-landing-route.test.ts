import { TestHelper } from '../../test-util';
import supertest from 'supertest';
import app from '../../../src/main';

describe('Landing API GET Integration Tests', () => {
  beforeEach(async () => {
    await TestHelper.refreshDatabase();
  });

  afterAll(async () => {
    await TestHelper.cleanupAll();
  });

  it('GET /api/setting/landing/sections/:page_key returns section data', async () => {
    const service = require('../../../src/services/landing.service').default;
    await service.upsertItems({
      page_key: 'home',
      items: [
        { key: 'hero', type: 'text', title: 'Selamat Datang', content: 'BMUP Home', published: true },
        { key: 'contact_email', type: 'text', content: 'support@example.com', published: true },
      ],
    }, 1);

    const res = await supertest(app).get('/api/setting/landing/sections/home');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data.section.page_key', 'home');
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items.length).toBe(2);
  });

  it('GET /api/setting/landing/sections returns all sections data', async () => {
    const service = require('../../../src/services/landing.service').default;
    await service.upsertItemsMulti({
      sections: [
        {
          page_key: 'home',
          items: [
            { key: 'hero', type: 'text', title: 'Selamat Datang', content: 'BMUP Home', published: true },
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

    const res = await supertest(app).get('/api/setting/landing/sections');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const pages = res.body.data.map((s: any) => s.section.page_key);
    expect(pages).toEqual(expect.arrayContaining(['home', 'about']));
  });
});

