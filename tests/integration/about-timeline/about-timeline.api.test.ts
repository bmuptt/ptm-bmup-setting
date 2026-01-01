import request from 'supertest';
import app from '../../../src/main';
import { TestHelper } from '../../test-util';
import prisma from '../../../src/config/database';

jest.mock('../../../src/middleware/auth.middleware', () => ({
  verifyCoreToken: (req: unknown, res: unknown, next: () => void) => {
    (req as { user?: unknown; menu?: unknown[] }).user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: {
        id: 1,
        name: 'admin',
      },
    };
    (req as { menu?: unknown[] }).menu = [];
    next();
  },
}));

describe('About Timeline API Integration Tests', () => {
  beforeEach(async () => {
    jest.setTimeout(60000);
    await TestHelper.refreshDatabase();
  });

  afterAll(async () => {
    await TestHelper.cleanupAll();
  });

  describe('GET /api/setting/about-timelines/landing', () => {
    it('Should list published timelines ordered by year asc', async () => {
      await prisma.aboutTimeline.createMany({
        data: [
          {
            year: 2015,
            title: 'Tahun 2015',
            description: 'Desc 2015',
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            year: 2010,
            title: 'Tahun 2010',
            description: 'Desc 2010',
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            year: 2020,
            title: 'Tahun 2020',
            description: 'Desc 2020',
            is_published: false,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
        ],
      });

      const response = await request(app).get('/api/setting/about-timelines/landing').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((x: { year: number }) => x.year)).toEqual([2010, 2015]);
    });

    it('Should still return published even when query is_published=false provided', async () => {
      await prisma.aboutTimeline.createMany({
        data: [
          {
            year: 2015,
            title: 'Tahun 2015',
            description: 'Desc 2015',
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            year: 2010,
            title: 'Tahun 2010',
            description: 'Desc 2010',
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            year: 2020,
            title: 'Tahun 2020',
            description: 'Desc 2020',
            is_published: false,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
        ],
      });

      const response = await request(app)
        .get('/api/setting/about-timelines/landing?is_published=false')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.map((x: { year: number }) => x.year)).toEqual([2010, 2015]);
    });
  });

  describe('GET /api/setting/about-timelines (CMS)', () => {
    it('Should list all timelines ordered by year asc', async () => {
      await prisma.aboutTimeline.createMany({
        data: [
          {
            year: 2015,
            title: 'Tahun 2015',
            description: 'Desc 2015',
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            year: 2010,
            title: 'Tahun 2010',
            description: 'Desc 2010',
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            year: 2020,
            title: 'Tahun 2020',
            description: 'Desc 2020',
            is_published: false,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
        ],
      });

      const response = await request(app)
        .get('/api/setting/about-timelines')
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
      expect(response.body.data.map((x: { year: number }) => x.year)).toEqual([2010, 2015, 2020]);
    });

    it('Should allow filter is_published=false when authenticated', async () => {
      await prisma.aboutTimeline.createMany({
        data: [
          {
            year: 2015,
            title: 'Tahun 2015',
            description: 'Desc 2015',
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            year: 2010,
            title: 'Tahun 2010',
            description: 'Desc 2010',
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            year: 2020,
            title: 'Tahun 2020',
            description: 'Desc 2020',
            is_published: false,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
        ],
      });

      const response = await request(app)
        .get('/api/setting/about-timelines?is_published=false')
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data.map((x: { year: number }) => x.year)).toEqual([2020]);
    });
  });

  describe('CRUD /api/setting/about-timelines', () => {
    it('Should create, detail, update, and delete timeline', async () => {
      const createRes = await request(app)
        .post('/api/setting/about-timelines')
        .send({
          year: 2018,
          title: 'Judul 2018',
          description: 'Deskripsi 2018',
          is_published: true,
        })
        .expect(201);

      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data.year).toBe(2018);
      expect(createRes.body.data.created_by).toBe(1);
      const createdId = createRes.body.data.id as number;

      const detailRes = await request(app)
        .get(`/api/setting/about-timelines/${createdId}`)
        .expect(200);

      expect(detailRes.body.success).toBe(true);
      expect(detailRes.body.data.id).toBe(createdId);
      expect(detailRes.body.data.year).toBe(2018);

      const updateRes = await request(app)
        .put(`/api/setting/about-timelines/${createdId}`)
        .send({
          year: 2019,
          title: 'Judul 2019',
          description: 'Deskripsi 2019',
          is_published: false,
        })
        .expect(200);

      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.year).toBe(2019);
      expect(updateRes.body.data.is_published).toBe(false);
      expect(updateRes.body.data.updated_by).toBe(1);

      const deleteRes = await request(app)
        .delete(`/api/setting/about-timelines/${createdId}`)
        .expect(200);

      expect(deleteRes.body.success).toBe(true);

      await request(app)
        .get(`/api/setting/about-timelines/${createdId}`)
        .expect(404);
    });

    it('Should reject duplicate year on create', async () => {
      await prisma.aboutTimeline.create({
        data: {
          year: 2015,
          title: 'Judul 2015',
          description: 'Desc 2015',
          is_published: true,
          created_by: BigInt(0),
          updated_by: BigInt(0),
        },
      });

      const response = await request(app)
        .post('/api/setting/about-timelines')
        .send({
          year: 2015,
          title: 'Judul 2015 Baru',
          description: 'Desc',
          is_published: true,
        })
        .expect(400);

      expect(response.body.errors).toEqual(['The year is already exists!']);
    });
  });
});
