import request from 'supertest';
import app from '../../../src/main';
import { TestHelper } from '../../test-util';
import prisma from '../../../src/config/database';

jest.setTimeout(60000);

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

describe('About Team Member API Integration Tests', () => {
  const seedMembers = async (ids: number[]) => {
    if (ids.length === 0) return;
    await prisma.member.createMany({
      data: ids.map((id) => ({
        id,
        user_id: null,
        name: `Member ${id}`,
        username: `member${id}`,
        gender: 'M',
        birthdate: new Date('2000-01-01'),
        address: 'Address',
        phone: `08${id}`,
        photo: null,
        active: true,
        created_by: 0,
        updated_by: null,
      })),
    });
  };

  beforeEach(async () => {
    await TestHelper.refreshDatabase();
  });

  afterAll(async () => {
    await TestHelper.cleanupAll();
  });

  describe('GET /api/setting/about-team-members/landing', () => {
    it('Should list published team members ordered by display_order asc', async () => {
      await seedMembers([1001, 1002, 1003]);
      await prisma.aboutTeamMember.createMany({
        data: [
          {
            member_id: BigInt(1001),
            role: 'Pelatih Kepala',
            display_order: 2,
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            member_id: BigInt(1002),
            role: 'Ketua Umum',
            display_order: 1,
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            member_id: BigInt(1003),
            role: 'Sekretaris',
            display_order: 3,
            is_published: false,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
        ],
      });

      const response = await request(app).get('/api/setting/about-team-members/landing').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.map((x: { role: string }) => x.role)).toEqual(['Ketua Umum', 'Pelatih Kepala']);
      expect(response.body.data[0].member).toMatchObject({ id: 1002, name: 'Member 1002', username: 'member1002' });
      expect(response.body.data[1].member).toMatchObject({ id: 1001, name: 'Member 1001', username: 'member1001' });
    });
  });

  describe('CMS /api/setting/about-team-members', () => {
    it('Should list all team members in CMS', async () => {
      await seedMembers([1001, 1002, 1003]);
      await prisma.aboutTeamMember.createMany({
        data: [
          {
            member_id: BigInt(1001),
            role: 'Pelatih Kepala',
            display_order: 2,
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            member_id: BigInt(1002),
            role: 'Ketua Umum',
            display_order: 1,
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            member_id: BigInt(1003),
            role: 'Sekretaris',
            display_order: 3,
            is_published: false,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
        ],
      });

      const response = await request(app)
        .get('/api/setting/about-team-members')
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
      expect(response.body.data.map((x: { role: string }) => x.role)).toEqual(['Ketua Umum', 'Pelatih Kepala', 'Sekretaris']);
      expect(response.body.data[0].member).toMatchObject({ id: 1002, name: 'Member 1002', username: 'member1002' });
    });

    it('Should allow filter is_published=false in CMS', async () => {
      await seedMembers([1001, 1003]);
      await prisma.aboutTeamMember.createMany({
        data: [
          {
            member_id: BigInt(1001),
            role: 'Pelatih Kepala',
            display_order: 2,
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            member_id: BigInt(1003),
            role: 'Sekretaris',
            display_order: 3,
            is_published: false,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
        ],
      });

      const response = await request(app)
        .get('/api/setting/about-team-members?is_published=false')
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data.map((x: { role: string }) => x.role)).toEqual(['Sekretaris']);
      expect(response.body.data[0].member).toMatchObject({ id: 1003, name: 'Member 1003', username: 'member1003' });
    });

    it('Should sort team members by ids order', async () => {
      await seedMembers([1001, 1002, 1003]);
      const created = await prisma.aboutTeamMember.createMany({
        data: [
          {
            member_id: BigInt(1001),
            role: 'A',
            display_order: 1,
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            member_id: BigInt(1002),
            role: 'B',
            display_order: 2,
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
          {
            member_id: BigInt(1003),
            role: 'C',
            display_order: 3,
            is_published: true,
            created_by: BigInt(0),
            updated_by: BigInt(0),
          },
        ],
      });
      expect(created.count).toBe(3);

      const items = await prisma.aboutTeamMember.findMany({ orderBy: [{ display_order: 'asc' }, { id: 'desc' }] });
      const ids = items.map((x) => x.id);

      const newOrder = [ids[2], ids[0], ids[1]];

      await request(app)
        .put('/api/setting/about-team-members/sort')
        .set('Cookie', 'token=mock-token-for-testing')
        .send({ ids: newOrder.map((x) => x.toString()) })
        .expect(200);

      const response = await request(app)
        .get('/api/setting/about-team-members')
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      expect(response.body.data.map((x: { id: number }) => BigInt(x.id).toString())).toEqual(newOrder.map((x) => x.toString()));
      expect(response.body.data[0].member).toHaveProperty('id');
    });
  });

  describe('CRUD /api/setting/about-team-members', () => {
    it('Should create, detail, update, and delete team member', async () => {
      await seedMembers([2001]);
      const createRes = await request(app)
        .post('/api/setting/about-team-members')
        .set('Cookie', 'token=mock-token-for-testing')
        .send({
          member_id: '2001',
          role: 'Ketua Umum',
          is_published: true,
        })
        .expect(201);

      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data.member_id).toBe(2001);
      expect(createRes.body.data.created_by).toBe(1);

      const createdId = createRes.body.data.id as number;

      const detailRes = await request(app)
        .get(`/api/setting/about-team-members/${createdId}`)
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      expect(detailRes.body.success).toBe(true);
      expect(detailRes.body.data.id).toBe(createdId);
      expect(detailRes.body.data.member).toMatchObject({ id: 2001, name: 'Member 2001', username: 'member2001' });

      const updateRes = await request(app)
        .put(`/api/setting/about-team-members/${createdId}`)
        .set('Cookie', 'token=mock-token-for-testing')
        .send({
          member_id: '2001',
          role: 'Ketua Umum Updated',
          is_published: false,
        })
        .expect(200);

      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.role).toBe('Ketua Umum Updated');
      expect(updateRes.body.data.is_published).toBe(false);
      expect(updateRes.body.data.updated_by).toBe(1);

      await request(app)
        .delete(`/api/setting/about-team-members/${createdId}`)
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(200);

      await request(app)
        .get(`/api/setting/about-team-members/${createdId}`)
        .set('Cookie', 'token=mock-token-for-testing')
        .expect(404);
    });
  });
});
