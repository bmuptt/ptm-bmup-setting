import dotenv from 'dotenv';
import { TestHelper } from '../../test-util';
import supertest from 'supertest';
import app from '../../../src/main';
import memberService from '../../../src/services/member.service';
 
dotenv.config();
 
const baseUrlTest = '/api/setting/members/by-ids';
 
// Mock authentication middleware
jest.mock('../../../src/middleware/auth.middleware', () => ({
  verifyCoreToken: (req: any, res: any, next: any) => {
    req.user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: {
        id: 1,
        name: 'admin'
      }
    };
    req.menu = [];
    next();
  },
}));
 
describe('Member By IDs API Integration Tests', () => {
  beforeEach(async () => {
    jest.setTimeout(30000);
    await TestHelper.refreshDatabase();
  });
 
  afterEach(async () => {
    await TestHelper.cleanupDatabase();
  });
 
  afterAll(async () => {
    await TestHelper.cleanupAll();
  });
 
  it('Should get members by IDs via GET with custom sorting', async () => {
    const m1 = await memberService.createMember({
      user_id: 11,
      name: 'User One',
      username: 'userone',
      gender: 'Male',
      birthdate: '1990-01-01',
      address: 'Jl. Test 1',
      phone: '081111111111',
      active: true
    }, undefined, 1);
    const m2 = await memberService.createMember({
      user_id: 22,
      name: 'User Two',
      username: 'usertwo',
      gender: 'Female',
      birthdate: '1992-02-02',
      address: 'Jl. Test 2',
      phone: '082222222222',
      active: true
    }, undefined, 1);
    const m3 = await memberService.createMember({
      user_id: 33,
      name: 'User Three',
      username: 'userthree',
      gender: 'Male',
      birthdate: '1993-03-03',
      address: 'Jl. Test 3',
      phone: '083333333333',
      active: false
    }, undefined, 1);
 
    const ids = [m1.data.id, m3.data.id];
 
    const response = await supertest(app)
      .get(`${baseUrlTest}?ids=${ids.join(',')}&order_field=id&order_dir=desc`)
      .set('Cookie', 'token=mock-token-for-testing');
 
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.map((m: { id: number }) => m.id)).toEqual(ids.sort((a, b) => b - a));
    expect(response.body.message).toBe('OK');
  });
 
  it('Should get members by IDs via GET with default sort (id desc)', async () => {
    const a = await memberService.createMember({
      user_id: 101,
      name: 'Alpha',
      username: 'alpha',
      gender: 'Male',
      birthdate: '1990-01-01',
      address: 'Jl. Alpha',
      phone: '081234567890',
      active: true
    }, undefined, 1);
    const b = await memberService.createMember({
      user_id: 102,
      name: 'Beta',
      username: 'beta',
      gender: 'Female',
      birthdate: '1991-01-01',
      address: 'Jl. Beta',
      phone: '081234567891',
      active: true
    }, undefined, 1);
 
    const response = await supertest(app)
      .get(`${baseUrlTest}?ids=${a.data.id},${b.data.id}`)
      .set('Cookie', 'token=mock-token-for-testing');
 
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    const idsDesc = [a.data.id, b.data.id].sort((x, y) => y - x);
    expect(response.body.data.map((m: { id: number }) => m.id)).toEqual(idsDesc);
    expect(response.body.message).toBe('OK');
  });
 
  it('Should return 400 when ids is missing in GET query', async () => {
    const response = await supertest(app)
      .get(baseUrlTest)
      .set('Cookie', 'token=mock-token-for-testing');
 
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toContain('ids is required');
  });
});
