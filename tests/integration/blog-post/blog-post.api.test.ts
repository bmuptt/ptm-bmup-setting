import request from 'supertest';
import app from '../../../src/main';
import { TestHelper } from '../../test-util';
import prisma from '../../../src/config/database';
import fs from 'fs';
import path from 'path';

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

describe('Blog Post API Integration Tests', () => {
  beforeEach(async () => {
    await TestHelper.refreshDatabase();
  });

  afterAll(async () => {
    await TestHelper.cleanupAll();
  });

  describe('Landing endpoints', () => {
    it('GET /api/setting/blog-posts/landing lists published posts ordered by published_at desc', async () => {
      const now = Date.now();
      await prisma.blogPost.createMany({
        data: [
          {
            slug: 'older-post',
            title: 'Older',
            excerpt: null,
            content: '# Old',
            cover_image_url: null,
            status: 'published',
            published_at: new Date(now - 60_000),
            is_featured: false,
            meta_title: null,
            meta_description: null,
            og_image_url: null,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            slug: 'newer-post',
            title: 'Newer',
            excerpt: null,
            content: '# New',
            cover_image_url: null,
            status: 'published',
            published_at: new Date(now - 10_000),
            is_featured: true,
            meta_title: null,
            meta_description: null,
            og_image_url: null,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            slug: 'draft-post',
            title: 'Draft',
            excerpt: null,
            content: '# Draft',
            cover_image_url: null,
            status: 'draft',
            published_at: null,
            is_featured: false,
            meta_title: null,
            meta_description: null,
            og_image_url: null,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
        ],
      });

      const res = await request(app)
        .get('/api/setting/blog-posts/landing?page=1&limit=10')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.total).toBe(2);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data.map((x: { slug: string }) => x.slug)).toEqual(['newer-post', 'older-post']);
    });

    it('GET /api/setting/blog-posts/landing supports paging', async () => {
      const now = Date.now();
      await prisma.blogPost.createMany({
        data: [
          {
            slug: 'post-1',
            title: 'Post 1',
            excerpt: null,
            content: '# 1',
            cover_image_url: null,
            status: 'published',
            published_at: new Date(now - 10_000),
            is_featured: false,
            meta_title: null,
            meta_description: null,
            og_image_url: null,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            slug: 'post-2',
            title: 'Post 2',
            excerpt: null,
            content: '# 2',
            cover_image_url: null,
            status: 'published',
            published_at: new Date(now - 20_000),
            is_featured: false,
            meta_title: null,
            meta_description: null,
            og_image_url: null,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
        ],
      });

      const res = await request(app)
        .get('/api/setting/blog-posts/landing?page=1&limit=1')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.total).toBe(2);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].slug).toBe('post-1');
    });

    it('GET /api/setting/blog-posts/landing/featured lists published featured posts only', async () => {
      const now = Date.now();
      await prisma.blogPost.createMany({
        data: [
          {
            slug: 'featured-1',
            title: 'Featured 1',
            excerpt: null,
            content: '# F1',
            cover_image_url: null,
            status: 'published',
            published_at: new Date(now - 10_000),
            is_featured: true,
            meta_title: null,
            meta_description: null,
            og_image_url: null,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            slug: 'not-featured',
            title: 'Not featured',
            excerpt: null,
            content: '# NF',
            cover_image_url: null,
            status: 'published',
            published_at: new Date(now - 5_000),
            is_featured: false,
            meta_title: null,
            meta_description: null,
            og_image_url: null,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
        ],
      });

      const res = await request(app)
        .get('/api/setting/blog-posts/landing/featured?limit=10')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].slug).toBe('featured-1');
    });

    it('GET /api/setting/blog-posts/landing/:slug returns published post detail', async () => {
      await prisma.blogPost.create({
        data: {
          slug: 'my-post',
          title: 'My Post',
          excerpt: null,
          content: '## Markdown content',
          cover_image_url: null,
          status: 'published',
          published_at: new Date(),
          is_featured: false,
          meta_title: null,
          meta_description: null,
          og_image_url: null,
          created_by: BigInt(0),
          updated_by: BigInt(0),
        },
      });

      const res = await request(app)
        .get('/api/setting/blog-posts/landing/my-post')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('my-post');
      expect(res.body.data.content).toBe('## Markdown content');
      expect(res.body.data.status).toBe('published');
    });

    it('GET /api/setting/blog-posts/landing/:slug returns 404 for non-published', async () => {
      await prisma.blogPost.create({
        data: {
          slug: 'hidden-post',
          title: 'Hidden Post',
          excerpt: null,
          content: '# Hidden',
          cover_image_url: null,
          status: 'not_published',
          published_at: null,
          is_featured: false,
          meta_title: null,
          meta_description: null,
          og_image_url: null,
          created_by: BigInt(0),
          updated_by: BigInt(0),
        },
      });

      await request(app)
        .get('/api/setting/blog-posts/landing/hidden-post')
        .expect(404);
    });
  });

  describe('CMS CRUD endpoints', () => {
    it('POST creates blog post and generates unique slug', async () => {
      const first = await request(app)
        .post('/api/setting/blog-posts')
        .set('Cookie', 'token=mock-token-for-testing')
        .send({
          title: 'Hello World',
          content: '# Hello',
        })
        .expect(201);

      expect(first.body.success).toBe(true);
      expect(first.body.data.slug).toBe('hello-world');
      expect(first.body.data.status).toBe('draft');
      expect(first.body.data.published_at).toBeNull();
      expect(first.body.data.created_by).toBe(1);

      const second = await request(app)
        .post('/api/setting/blog-posts')
        .set('Cookie', 'token=mock-token-for-testing')
        .send({
          title: 'Hello World',
          content: '# Hello again',
        })
        .expect(201);

      expect(second.body.success).toBe(true);
      expect(second.body.data.slug).toBe('hello-world-2');
    });

    it('GET /api/setting/blog-posts supports status and search filters', async () => {
      await prisma.blogPost.createMany({
        data: [
          {
            slug: 'a-draft',
            title: 'Draft Post A',
            excerpt: 'Some excerpt',
            content: '# A',
            cover_image_url: null,
            status: 'draft',
            published_at: null,
            is_featured: false,
            meta_title: null,
            meta_description: null,
            og_image_url: null,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            slug: 'b-published',
            title: 'Published Post B',
            excerpt: 'Another excerpt',
            content: '# B',
            cover_image_url: null,
            status: 'published',
            published_at: new Date(),
            is_featured: false,
            meta_title: null,
            meta_description: null,
            og_image_url: null,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
        ],
      });

      const resDraft = await request(app)
        .get('/api/setting/blog-posts?status=draft')
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      expect(resDraft.body.success).toBe(true);
      expect(resDraft.body.total).toBe(1);
      expect(resDraft.body.data).toHaveLength(1);
      expect(resDraft.body.data[0].slug).toBe('a-draft');

      const resSearch = await request(app)
        .get('/api/setting/blog-posts?search=Published')
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      expect(resSearch.body.success).toBe(true);
      expect(resSearch.body.total).toBe(1);
      expect(resSearch.body.data[0].slug).toBe('b-published');
    });

    it('PUT updates status and manages published_at', async () => {
      const created = await prisma.blogPost.create({
        data: {
          slug: 'status-post',
          title: 'Status Post',
          excerpt: null,
          content: '# Status',
          cover_image_url: null,
          status: 'draft',
          published_at: null,
          is_featured: false,
          meta_title: null,
          meta_description: null,
          og_image_url: null,
          created_by: BigInt(0),
          updated_by: BigInt(0),
        },
      });

      const publishRes = await request(app)
        .put(`/api/setting/blog-posts/${created.id}`)
        .set('Cookie', 'token=mock-token-for-testing')
        .send({ status: 'published', status_file_cover: '0', status_file_og_image: '0' })
        .expect(200);

      expect(publishRes.body.success).toBe(true);
      expect(publishRes.body.data.status).toBe('published');
      expect(publishRes.body.data.published_at).toBeTruthy();

      const hideRes = await request(app)
        .put(`/api/setting/blog-posts/${created.id}`)
        .set('Cookie', 'token=mock-token-for-testing')
        .send({ status: 'not_published', status_file_cover: '0', status_file_og_image: '0' })
        .expect(200);

      expect(hideRes.body.success).toBe(true);
      expect(hideRes.body.data.status).toBe('not_published');
      expect(hideRes.body.data.published_at).toBeNull();
    });

    it('PUT /:id/publish sets status published and published_at', async () => {
      const created = await prisma.blogPost.create({
        data: {
          slug: 'publish-post',
          title: 'Publish Post',
          excerpt: null,
          content: '# Publish',
          cover_image_url: null,
          status: 'draft',
          published_at: null,
          is_featured: false,
          meta_title: null,
          meta_description: null,
          og_image_url: null,
          created_by: BigInt(0),
          updated_by: BigInt(0),
        },
      });

      const res = await request(app)
        .put(`/api/setting/blog-posts/${created.id}/publish`)
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('published');
      expect(res.body.data.published_at).toBeTruthy();
    });

    it('PUT /:id/unpublish sets status not_published and published_at null', async () => {
      const created = await prisma.blogPost.create({
        data: {
          slug: 'unpublish-post',
          title: 'Unpublish Post',
          excerpt: null,
          content: '# Unpublish',
          cover_image_url: null,
          status: 'published',
          published_at: new Date(),
          is_featured: false,
          meta_title: null,
          meta_description: null,
          og_image_url: null,
          created_by: BigInt(0),
          updated_by: BigInt(0),
        },
      });

      const res = await request(app)
        .put(`/api/setting/blog-posts/${created.id}/unpublish`)
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('not_published');
      expect(res.body.data.published_at).toBeNull();
    });

    it('DELETE removes blog post', async () => {
      const created = await prisma.blogPost.create({
        data: {
          slug: 'delete-post',
          title: 'Delete Post',
          excerpt: null,
          content: '# Delete',
          cover_image_url: null,
          status: 'draft',
          published_at: null,
          is_featured: false,
          meta_title: null,
          meta_description: null,
          og_image_url: null,
          created_by: BigInt(0),
          updated_by: BigInt(0),
        },
      });

      await request(app)
        .delete(`/api/setting/blog-posts/${created.id}`)
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      const count = await prisma.blogPost.count({ where: { id: created.id } });
      expect(count).toBe(0);
    });

    it('DELETE removes cover and og image files if stored', async () => {
      const coverDir = path.join(process.cwd(), 'storage', 'images', 'blog', 'covers');
      const ogDir = path.join(process.cwd(), 'storage', 'images', 'blog', 'og-images');
      fs.mkdirSync(coverDir, { recursive: true });
      fs.mkdirSync(ogDir, { recursive: true });

      const coverFilename = `cover-${Date.now()}-test.png`;
      const ogFilename = `og-${Date.now()}-test.png`;
      const coverPath = path.join(coverDir, coverFilename);
      const ogPath = path.join(ogDir, ogFilename);
      fs.writeFileSync(coverPath, 'x');
      fs.writeFileSync(ogPath, 'x');

      const created = await prisma.blogPost.create({
        data: {
          slug: 'delete-with-files',
          title: 'Delete With Files',
          excerpt: null,
          content: '# Delete',
          cover_image_url: `http://localhost:3200/storage/images/blog/covers/${coverFilename}`,
          status: 'draft',
          published_at: null,
          is_featured: false,
          meta_title: null,
          meta_description: null,
          og_image_url: `http://localhost:3200/storage/images/blog/og-images/${ogFilename}`,
          created_by: BigInt(0),
          updated_by: BigInt(0),
        },
      });

      expect(fs.existsSync(coverPath)).toBe(true);
      expect(fs.existsSync(ogPath)).toBe(true);

      await request(app)
        .delete(`/api/setting/blog-posts/${created.id}`)
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      expect(fs.existsSync(coverPath)).toBe(false);
      expect(fs.existsSync(ogPath)).toBe(false);
    });
  });
});
