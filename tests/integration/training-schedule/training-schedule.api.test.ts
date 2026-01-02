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

describe('Training Schedule API Integration Tests', () => {
  beforeEach(async () => {
    jest.setTimeout(60000);
    await TestHelper.refreshDatabase();
  });

  afterAll(async () => {
    await TestHelper.cleanupAll();
  });

  describe('CRUD /api/setting/training-schedules', () => {
    it('Should create, list, detail, update, and delete training schedule', async () => {
      const member1 = await prisma.member.create({
        data: {
          name: 'Pelatih 1',
          username: 'pelatih_1',
          gender: 'Male',
          birthdate: new Date('1990-01-01'),
          address: 'Jl. Test 1',
          phone: '081234567890',
          photo: null,
          active: true,
          created_by: 0,
          updated_by: null,
        },
      });

      const createRes = await request(app)
        .post('/api/setting/training-schedules')
        .set('Cookie', 'token=mock-token-for-testing')
        .send({
          day_of_week: 1,
          start_time: '09:00',
          end_time: '10:00',
          category: 'Latihan Umum',
          member_id: String(member1.id),
          is_published: true,
        })
        .expect(201);

      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data).toHaveProperty('id');
      expect(createRes.body.data.day_of_week).toBe(1);
      expect(createRes.body.data.start_time).toBe('09:00');
      expect(createRes.body.data.end_time).toBe('10:00');
      expect(createRes.body.data.category).toBe('Latihan Umum');
      expect(createRes.body.data.member_id).toBe(member1.id);
      expect(createRes.body.data.is_published).toBe(true);
      expect(createRes.body.data.member).toBeTruthy();
      expect(createRes.body.data.member.id).toBe(member1.id);

      const scheduleId = BigInt(createRes.body.data.id);

      const listRes = await request(app)
        .get('/api/setting/training-schedules')
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      expect(listRes.body.success).toBe(true);
      expect(listRes.body.count).toBe(1);
      expect(listRes.body.data[0].id).toBe(Number(scheduleId));

      const detailRes = await request(app)
        .get(`/api/setting/training-schedules/${scheduleId.toString()}`)
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      expect(detailRes.body.success).toBe(true);
      expect(detailRes.body.data.id).toBe(Number(scheduleId));
      expect(detailRes.body.data.start_time).toBe('09:00');
      expect(detailRes.body.data.end_time).toBe('10:00');
      expect(detailRes.body.data.member).toBeTruthy();
      expect(detailRes.body.data.member.id).toBe(member1.id);

      const member2 = await prisma.member.create({
        data: {
          name: 'Pelatih 2',
          username: 'pelatih_2',
          gender: 'Male',
          birthdate: new Date('1991-01-01'),
          address: 'Jl. Test 2',
          phone: '081234567891',
          photo: null,
          active: true,
          created_by: 0,
          updated_by: null,
        },
      });

      const updateRes = await request(app)
        .put(`/api/setting/training-schedules/${scheduleId.toString()}`)
        .set('Cookie', 'token=mock-token-for-testing')
        .send({
          day_of_week: 2,
          start_time: '11:00',
          end_time: '12:00',
          category: 'Junior',
          member_id: String(member2.id),
          is_published: false,
        })
        .expect(200);

      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.day_of_week).toBe(2);
      expect(updateRes.body.data.start_time).toBe('11:00');
      expect(updateRes.body.data.end_time).toBe('12:00');
      expect(updateRes.body.data.category).toBe('Junior');
      expect(updateRes.body.data.member_id).toBe(member2.id);
      expect(updateRes.body.data.is_published).toBe(false);
      expect(updateRes.body.data.member).toBeTruthy();
      expect(updateRes.body.data.member.id).toBe(member2.id);

      const deleteRes = await request(app)
        .delete(`/api/setting/training-schedules/${scheduleId.toString()}`)
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      expect(deleteRes.body.success).toBe(true);
      expect(deleteRes.body.message).toBe('Training schedule deleted successfully');
    });

    it('Should reject end_time <= start_time', async () => {
      const member = await prisma.member.create({
        data: {
          name: 'Pelatih',
          username: 'pelatih',
          gender: 'Male',
          birthdate: new Date('1990-01-01'),
          address: 'Jl. Test',
          phone: '081234567892',
          photo: null,
          active: true,
          created_by: 0,
          updated_by: null,
        },
      });

      const response = await request(app)
        .post('/api/setting/training-schedules')
        .set('Cookie', 'token=mock-token-for-testing')
        .send({
          day_of_week: 1,
          start_time: '10:00',
          end_time: '10:00',
          category: 'Latihan Umum',
          member_id: String(member.id),
        })
        .expect(400);

      expect(response.body.errors).toEqual(['The end_time must be greater than start_time!']);
    });
  });

  describe('PUT /api/setting/training-schedules/sort', () => {
    it('Should sort training schedules follows payload order', async () => {
      const member = await prisma.member.create({
        data: {
          name: 'Pelatih',
          username: 'pelatih_sort',
          gender: 'Male',
          birthdate: new Date('1990-01-01'),
          address: 'Jl. Test',
          phone: '081234567893',
          photo: null,
          active: true,
          created_by: 0,
          updated_by: null,
        },
      });

      const s1 = await request(app)
        .post('/api/setting/training-schedules')
        .set('Cookie', 'token=mock-token-for-testing')
        .send({
          day_of_week: 1,
          start_time: '09:00',
          end_time: '10:00',
          category: 'S1',
          member_id: String(member.id),
          is_published: true,
        })
        .expect(201);

      const s2 = await request(app)
        .post('/api/setting/training-schedules')
        .set('Cookie', 'token=mock-token-for-testing')
        .send({
          day_of_week: 1,
          start_time: '10:00',
          end_time: '11:00',
          category: 'S2',
          member_id: String(member.id),
          is_published: true,
        })
        .expect(201);

      const s3 = await request(app)
        .post('/api/setting/training-schedules')
        .set('Cookie', 'token=mock-token-for-testing')
        .send({
          day_of_week: 1,
          start_time: '11:00',
          end_time: '12:00',
          category: 'S3',
          member_id: String(member.id),
          is_published: true,
        })
        .expect(201);

      const list1 = await request(app)
        .get('/api/setting/training-schedules')
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      const initialCategories = (list1.body.data as { category: string }[]).map((i) => i.category);
      expect(initialCategories).toEqual(['S1', 'S2', 'S3']);

      const ids = (list1.body.data as { id: number }[]).map((i) => BigInt(i.id));
      const newOrder = [ids[2], ids[0], ids[1]];

      const sortRes = await request(app)
        .put('/api/setting/training-schedules/sort')
        .set('Cookie', 'token=mock-token-for-testing')
        .send({ ids: newOrder.map((v) => v.toString()) })
        .expect(200);

      expect(sortRes.body.success).toBe(true);
      expect(sortRes.body.message).toBe('Training schedules sorted successfully');

      const list2 = await request(app)
        .get('/api/setting/training-schedules')
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      const categoriesAfter = (list2.body.data as { category: string }[]).map((i) => i.category);
      expect(categoriesAfter).toEqual(['S3', 'S1', 'S2']);

      expect(s1.body.data).toBeTruthy();
      expect(s2.body.data).toBeTruthy();
      expect(s3.body.data).toBeTruthy();
    });
  });

  describe('GET /api/setting/training-schedules/landing', () => {
    it('Should list only published schedules', async () => {
      await prisma.member.create({
        data: {
          name: 'Pelatih Landing',
          username: 'pelatih_landing',
          gender: 'Male',
          birthdate: new Date('1990-01-01'),
          address: 'Jl. Test',
          phone: '081234567894',
          photo: null,
          active: true,
          created_by: 0,
          updated_by: null,
        },
      });

      await prisma.trainingSchedule.createMany({
        data: [
          {
            day_of_week: 1,
            start_time: new Date('1970-01-01T09:00:00.000Z'),
            end_time: new Date('1970-01-01T10:00:00.000Z'),
            category: 'P1',
            member_id: BigInt(1),
            display_order: 1,
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            day_of_week: 1,
            start_time: new Date('1970-01-01T10:00:00.000Z'),
            end_time: new Date('1970-01-01T11:00:00.000Z'),
            category: 'HIDDEN',
            member_id: null,
            display_order: 2,
            is_published: false,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
        ],
      });

      const response = await request(app)
        .get('/api/setting/training-schedules/landing')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].category).toBe('P1');
      expect(response.body.data[0].start_time).toBe('09:00');
      expect(response.body.data[0].end_time).toBe('10:00');
      expect(response.body.data[0].member).toBeTruthy();
      expect(response.body.data[0].member.id).toBe(1);
    });
  });
});
