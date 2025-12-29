import { TestHelper } from '../../test-util';
import supertest from 'supertest';
import app from '../../../src/main';
import prisma from '../../../src/config/database';
import { seedIcons } from '../../../seed/icons-seeder';

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

describe('Landing Icons & Activities API Integration Tests', () => {
  beforeEach(async () => {
    await TestHelper.refreshDatabase();
  });

  afterAll(async () => {
    await TestHelper.cleanupAll();
  });

  it('GET /api/setting/landing/icons returns active icons', async () => {
    await seedIcons();

    const res = await supertest(app)
      .get('/api/setting/landing/icons')
      .set('Cookie', 'token=mock-token-for-testing');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'Icons retrieved successfully');
    expect(res.body).toHaveProperty('count');
    expect(Array.isArray(res.body.data)).toBe(true);
    const names = (res.body.data as { name: string }[]).map((i) => i.name);
    expect(names).toContain('mdi-table-tennis');
    expect(names).toContain('mdi-trophy');
    expect(names).toContain('mdi-handshake');
  });

  it('POST/GET/PUT sort activities follows payload order', async () => {
    await seedIcons();
    const icon = await prisma.icon.findFirst({ where: { name: 'mdi-table-tennis' } });
    expect(icon).toBeTruthy();

    const a1 = await supertest(app)
      .post('/api/setting/landing/activities')
      .set('Cookie', 'token=mock-token-for-testing')
      .send({
        icon_id: icon!.id.toString(),
        title: 'A1',
        subtitle: 'S1',
      });
    expect(a1.status).toBe(201);

    const a2 = await supertest(app)
      .post('/api/setting/landing/activities')
      .set('Cookie', 'token=mock-token-for-testing')
      .send({
        icon_id: icon!.id.toString(),
        title: 'A2',
        subtitle: 'S2',
      });
    expect(a2.status).toBe(201);

    const a3 = await supertest(app)
      .post('/api/setting/landing/activities')
      .set('Cookie', 'token=mock-token-for-testing')
      .send({
        icon_id: icon!.id.toString(),
        title: 'A3',
        subtitle: 'S3',
      });
    expect(a3.status).toBe(201);

    const list1 = await supertest(app)
      .get('/api/setting/landing/activities')
      .set('Cookie', 'token=mock-token-for-testing');

    expect(list1.status).toBe(200);
    expect(list1.body).toHaveProperty('success', true);
    expect(Array.isArray(list1.body.data)).toBe(true);
    const initialTitles = (list1.body.data as { title: string }[]).map((i) => i.title);
    expect(initialTitles).toEqual(['A1', 'A2', 'A3']);

    const ids = (list1.body.data as { id: number }[]).map((i) => BigInt(i.id));
    const newOrder = [ids[2], ids[0], ids[1]];

    const sortRes = await supertest(app)
      .put('/api/setting/landing/activities/sort')
      .set('Cookie', 'token=mock-token-for-testing')
      .send({ ids: newOrder.map((v) => v.toString()) });

    expect(sortRes.status).toBe(200);
    expect(sortRes.body).toHaveProperty('success', true);
    expect(sortRes.body).toHaveProperty('message', 'Activities sorted successfully');

    const list2 = await supertest(app)
      .get('/api/setting/landing/activities')
      .set('Cookie', 'token=mock-token-for-testing');

    expect(list2.status).toBe(200);
    const titlesAfter = (list2.body.data as { title: string }[]).map((i) => i.title);
    expect(titlesAfter).toEqual(['A3', 'A1', 'A2']);
  });

  it('GET /api/setting/landing/activities/:id returns activity detail', async () => {
    await seedIcons();
    const icon = await prisma.icon.findFirst({ where: { name: 'mdi-table-tennis' } });
    expect(icon).toBeTruthy();

    const created = await supertest(app)
      .post('/api/setting/landing/activities')
      .set('Cookie', 'token=mock-token-for-testing')
      .send({
        icon_id: icon!.id.toString(),
        title: 'Detail Title',
        subtitle: 'Detail Subtitle',
      });

    expect(created.status).toBe(201);
    const activityId = String(created.body.data.id);

    const detail = await supertest(app)
      .get(`/api/setting/landing/activities/${activityId}`)
      .set('Cookie', 'token=mock-token-for-testing');

    expect(detail.status).toBe(200);
    expect(detail.body).toHaveProperty('success', true);
    expect(detail.body).toHaveProperty('message', 'Activity retrieved successfully');
    expect(detail.body.data).toHaveProperty('id', created.body.data.id);
    expect(detail.body.data).toHaveProperty('title', 'Detail Title');
    expect(detail.body.data).toHaveProperty('subtitle', 'Detail Subtitle');
    expect(detail.body.data).toHaveProperty('icon');
    expect(detail.body.data.icon).toHaveProperty('id', Number(icon!.id));
    expect(detail.body.data.icon).toHaveProperty('name', 'mdi-table-tennis');
  });

  it('PUT /api/setting/landing/activities/:id updates activity', async () => {
    await seedIcons();
    const icon = await prisma.icon.findFirst({ where: { name: 'mdi-table-tennis' } });
    expect(icon).toBeTruthy();

    const created = await supertest(app)
      .post('/api/setting/landing/activities')
      .set('Cookie', 'token=mock-token-for-testing')
      .send({
        icon_id: icon!.id.toString(),
        title: 'Old Title',
        subtitle: 'Old Subtitle',
        is_published: true,
      });

    expect(created.status).toBe(201);
    const activityId = String(created.body.data.id);

    const updated = await supertest(app)
      .put(`/api/setting/landing/activities/${activityId}`)
      .set('Cookie', 'token=mock-token-for-testing')
      .send({
        icon_id: icon!.id.toString(),
        title: 'New Title',
        subtitle: 'New Subtitle',
        is_published: false,
      });

    expect(updated.status).toBe(200);
    expect(updated.body).toHaveProperty('success', true);
    expect(updated.body).toHaveProperty('message', 'Activity updated successfully');
    expect(updated.body.data).toHaveProperty('id', created.body.data.id);
    expect(updated.body.data).toHaveProperty('title', 'New Title');
    expect(updated.body.data).toHaveProperty('subtitle', 'New Subtitle');
    expect(updated.body.data).toHaveProperty('is_published', false);
  });

  it('DELETE /api/setting/landing/activities/:id deletes activity', async () => {
    await seedIcons();
    const icon = await prisma.icon.findFirst({ where: { name: 'mdi-table-tennis' } });
    expect(icon).toBeTruthy();

    const created = await supertest(app)
      .post('/api/setting/landing/activities')
      .set('Cookie', 'token=mock-token-for-testing')
      .send({
        icon_id: icon!.id.toString(),
        title: 'To Delete',
        subtitle: 'Subtitle',
      });

    expect(created.status).toBe(201);
    const activityId = String(created.body.data.id);

    const del = await supertest(app)
      .delete(`/api/setting/landing/activities/${activityId}`)
      .set('Cookie', 'token=mock-token-for-testing');

    expect(del.status).toBe(200);
    expect(del.body).toHaveProperty('success', true);
    expect(del.body).toHaveProperty('message', 'Activity deleted successfully');

    const list = await supertest(app)
      .get('/api/setting/landing/activities')
      .set('Cookie', 'token=mock-token-for-testing');

    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.data)).toBe(true);
    expect((list.body.data as { id: number }[]).map((i) => i.id)).not.toContain(created.body.data.id);
  });
});
