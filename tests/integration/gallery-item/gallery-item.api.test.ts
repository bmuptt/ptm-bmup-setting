import request from 'supertest';
import app from '../../../src/main';
import { TestHelper } from '../../test-util';
import prisma from '../../../src/config/database';
import path from 'path';
import fs from 'fs';

jest.setTimeout(120000);

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

describe('Gallery Item API Integration Tests', () => {
  beforeEach(async () => {
    jest.setTimeout(120000);
    await TestHelper.refreshDatabase();
  });

  afterAll(async () => {
    await TestHelper.cleanupAll();
  });

  it('POST /api/setting/gallery-items creates gallery item', async () => {
    const testImagePath = path.join(__dirname, 'test-gallery.png');
    fs.writeFileSync(testImagePath, 'dummy image data');

    const res = await request(app)
      .post('/api/setting/gallery-items')
      .set('Cookie', 'token=mock-token-for-testing')
      .field('title', 'Gallery A')
      .field('is_published', 'true')
      .attach('image', testImagePath)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(typeof res.body.data.image_url).toBe('string');
    expect(res.body.data.image_url).toContain('/storage/images/gallery/');
    expect(res.body.data.title).toBe('Gallery A');
    expect(res.body.data.is_published).toBe(true);
    expect(res.body.data.display_order).toBe(1);
    expect(res.body.data.created_by).toBe(1);
    expect(res.body.data.updated_by).toBe(1);

    const filename = (res.body.data.image_url as string).split('/').pop();
    if (filename) {
      const storedPath = path.join(process.cwd(), 'storage', 'images', 'gallery', filename);
      expect(fs.existsSync(storedPath)).toBe(true);
      if (fs.existsSync(storedPath)) {
        fs.unlinkSync(storedPath);
      }
    }
    fs.unlinkSync(testImagePath);
  });

  it('GET /api/setting/gallery-items lists items with is_published filter', async () => {
    await prisma.galleryItem.createMany({
      data: [
        {
          image_url: 'https://example.com/published.jpg',
          title: 'Published',
          display_order: 1,
          is_published: true,
          created_by: BigInt(0),
          updated_by: BigInt(0),
        },
        {
          image_url: 'https://example.com/draft.jpg',
          title: 'Draft',
          display_order: 2,
          is_published: false,
          created_by: BigInt(0),
          updated_by: BigInt(0),
        },
      ],
    });

    const res = await request(app)
      .get('/api/setting/gallery-items?is_published=true')
      .set('Cookie', 'token=mock-token-for-testing')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].title).toBe('Published');
    expect(res.body.data[0].is_published).toBe(true);
  });

  it('GET /api/setting/gallery-items/landing lists published items ordered', async () => {
    const a = await prisma.galleryItem.create({
      data: {
        image_url: 'https://example.com/a.jpg',
        title: 'A',
        display_order: 1,
        is_published: true,
        created_by: BigInt(0),
        updated_by: BigInt(0),
      },
    });

    const b = await prisma.galleryItem.create({
      data: {
        image_url: 'https://example.com/b.jpg',
        title: 'B',
        display_order: 1,
        is_published: true,
        created_by: BigInt(0),
        updated_by: BigInt(0),
      },
    });

    await prisma.galleryItem.create({
      data: {
        image_url: 'https://example.com/c.jpg',
        title: 'C',
        display_order: 0,
        is_published: false,
        created_by: BigInt(0),
        updated_by: BigInt(0),
      },
    });

    const res = await request(app)
      .get('/api/setting/gallery-items/landing')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2);
    expect(res.body.data.map((i: { title: string }) => i.title)).toEqual([b.title, a.title]);
  });

  it('POST /api/setting/gallery-items/:id?_method=PUT updates gallery item', async () => {
    const galleryDir = path.join(process.cwd(), 'storage', 'images', 'gallery');
    if (!fs.existsSync(galleryDir)) {
      fs.mkdirSync(galleryDir, { recursive: true });
    }
    const oldFilename = 'old.png';
    const oldPath = path.join(galleryDir, oldFilename);
    fs.writeFileSync(oldPath, 'dummy old image');

    const created = await prisma.galleryItem.create({
      data: {
        image_url: `http://localhost:3200/storage/images/gallery/${oldFilename}`,
        title: 'Before',
        display_order: 1,
        is_published: false,
        created_by: BigInt(0),
        updated_by: BigInt(0),
      },
    });

    const testImagePath = path.join(__dirname, 'test-gallery-update.png');
    fs.writeFileSync(testImagePath, 'dummy image data');

    const res = await request(app)
      .post(`/api/setting/gallery-items/${created.id.toString()}?_method=PUT`)
      .set('Cookie', 'token=mock-token-for-testing')
      .field('title', 'After')
      .field('is_published', 'true')
      .field('status_file', '1')
      .attach('image', testImagePath)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('After');
    expect(typeof res.body.data.image_url).toBe('string');
    expect(res.body.data.image_url).toContain('/storage/images/gallery/');
    expect(res.body.data.is_published).toBe(true);
    expect(res.body.data.updated_by).toBe(1);
    expect(fs.existsSync(oldPath)).toBe(false);

    const filename = (res.body.data.image_url as string).split('/').pop();
    if (filename) {
      const storedPath = path.join(process.cwd(), 'storage', 'images', 'gallery', filename);
      expect(fs.existsSync(storedPath)).toBe(true);
      if (fs.existsSync(storedPath)) {
        fs.unlinkSync(storedPath);
      }
    }
    fs.unlinkSync(testImagePath);
  });

  it('POST /api/setting/gallery-items/:id?_method=PUT keeps image when status_file=0', async () => {
    const galleryDir = path.join(process.cwd(), 'storage', 'images', 'gallery');
    if (!fs.existsSync(galleryDir)) {
      fs.mkdirSync(galleryDir, { recursive: true });
    }
    const oldFilename = 'old-keep.png';
    const oldPath = path.join(galleryDir, oldFilename);
    fs.writeFileSync(oldPath, 'dummy old image');

    const created = await prisma.galleryItem.create({
      data: {
        image_url: `http://localhost:3200/storage/images/gallery/${oldFilename}`,
        title: 'Before',
        display_order: 1,
        is_published: false,
        created_by: BigInt(0),
        updated_by: BigInt(0),
      },
    });

    const res = await request(app)
      .post(`/api/setting/gallery-items/${created.id.toString()}?_method=PUT`)
      .set('Cookie', 'token=mock-token-for-testing')
      .field('title', 'After')
      .field('status_file', '0')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('After');
    expect(res.body.data.image_url).toBe(`http://localhost:3200/storage/images/gallery/${oldFilename}`);
    expect(res.body.data.is_published).toBe(false);
    expect(res.body.data.updated_by).toBe(1);
    expect(fs.existsSync(oldPath)).toBe(true);

    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  });

  it('PUT /api/setting/gallery-items/sort updates display_order by ids', async () => {
    const a = await prisma.galleryItem.create({
      data: {
        image_url: 'https://example.com/a.jpg',
        title: 'A',
        display_order: 1,
        is_published: true,
        created_by: BigInt(0),
        updated_by: BigInt(0),
      },
    });
    const b = await prisma.galleryItem.create({
      data: {
        image_url: 'https://example.com/b.jpg',
        title: 'B',
        display_order: 2,
        is_published: true,
        created_by: BigInt(0),
        updated_by: BigInt(0),
      },
    });
    const c = await prisma.galleryItem.create({
      data: {
        image_url: 'https://example.com/c.jpg',
        title: 'C',
        display_order: 3,
        is_published: true,
        created_by: BigInt(0),
        updated_by: BigInt(0),
      },
    });

    await request(app)
      .put('/api/setting/gallery-items/sort')
      .set('Cookie', 'token=mock-token-for-testing')
      .send({
        ids: [c.id.toString(), a.id.toString(), b.id.toString()],
      })
      .expect(200);

    const res = await request(app)
      .get('/api/setting/gallery-items')
      .set('Cookie', 'token=mock-token-for-testing')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.map((i: { title: string }) => i.title)).toEqual(['C', 'A', 'B']);
    expect(res.body.data.map((i: { display_order: number }) => i.display_order)).toEqual([1, 2, 3]);
  });

  it('DELETE /api/setting/gallery-items/:id deletes gallery item', async () => {
    const galleryDir = path.join(process.cwd(), 'storage', 'images', 'gallery');
    if (!fs.existsSync(galleryDir)) {
      fs.mkdirSync(galleryDir, { recursive: true });
    }
    const filename = 'to-delete.png';
    const storedPath = path.join(galleryDir, filename);
    fs.writeFileSync(storedPath, 'dummy image');

    const created = await prisma.galleryItem.create({
      data: {
        image_url: `http://localhost:3200/storage/images/gallery/${filename}`,
        title: 'To delete',
        display_order: 1,
        is_published: true,
        created_by: BigInt(0),
        updated_by: BigInt(0),
      },
    });

    await request(app)
      .delete(`/api/setting/gallery-items/${created.id.toString()}`)
      .set('Cookie', 'token=mock-token-for-testing')
      .expect(200);

    expect(fs.existsSync(storedPath)).toBe(false);

    await request(app)
      .get(`/api/setting/gallery-items/${created.id.toString()}`)
      .set('Cookie', 'token=mock-token-for-testing')
      .expect(404);
  });
});
