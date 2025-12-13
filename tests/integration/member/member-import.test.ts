import supertest from 'supertest';
import app from '../../../src/main'; // Adjust path to main app
import prisma from '../../../src/config/database';
import { TestHelper } from '../../test-util';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { createTestToken } from '../../utils/token'; // Assuming there's a token helper
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

const request = supertest(app);

describe('Member Import Integration Test', () => {
  const token = createTestToken({ id: 999, role_id: 1 });
  const testFilePath = path.join(__dirname, 'test-import.xlsx');

  beforeEach(async () => {
    jest.setTimeout(30000);
    await TestHelper.refreshDatabase();
  });

  afterEach(async () => {
    await TestHelper.cleanupDatabase();
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  it('should import members successfully from valid Excel file', async () => {
    // Create Excel file
    const data = [
      {
        name: 'Test Import 1',
        username: 'import_user_1',
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Test Address 1',
        phone: '081234567891',
        active: 1
      },
      {
        name: 'Test Import 2',
        username: 'import_user_2',
        gender: 'Female',
        birthdate: '1995-05-05',
        address: 'Test Address 2',
        phone: '081234567892',
        active: 1
      }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    XLSX.writeFile(wb, testFilePath);

    const response = await request
      .post('/api/setting/members/import-excel')
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', `token=${token}`) // Support cookie auth if needed
      .attach('file', testFilePath);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.count).toBe(2);

    // Verify DB
    const count = await prisma.member.count({
      where: {
        username: { in: ['import_user_1', 'import_user_2'] }
      }
    });
    expect(count).toBe(2);
  });

  it('should import members with DD/MM/YYYY birthdate and numeric active', async () => {
    const data = [
      {
        name: 'Test Import DD/MM 1',
        username: 'import_ddmm_1',
        gender: 'Male',
        birthdate: '01/01/1990',
        address: 'Address A',
        phone: '081200000001',
        active: 1
      },
      {
        name: 'Test Import DD/MM 2',
        username: 'import_ddmm_2',
        gender: 'Female',
        birthdate: '05/05/1995',
        address: 'Address B',
        phone: '081200000002',
        active: 0
      }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    XLSX.writeFile(wb, testFilePath);

    const response = await request
      .post('/api/setting/members/import-excel')
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', `token=${token}`)
      .attach('file', testFilePath);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.count).toBe(2);

    const m1 = await prisma.member.findUnique({ where: { username: 'import_ddmm_1' } });
    const m2 = await prisma.member.findUnique({ where: { username: 'import_ddmm_2' } });
    expect(m1).not.toBeNull();
    expect(m2).not.toBeNull();
    expect(m1?.active).toBe(true);
    expect(m2?.active).toBe(false);
  });

  it('should fail and rollback if file contains duplicate username', async () => {
    // Insert one member first
    await prisma.member.create({
      data: {
        name: 'Existing Member',
        username: 'existing_user',
        gender: 'Male',
        birthdate: new Date('1990-01-01'),
        address: 'Existing Address',
        phone: '0800000000',
        active: true,
        created_by: 999,
        updated_at: new Date()
      }
    });

    // Create Excel file with duplicate username
    const data = [
      {
        name: 'Test Import 3',
        username: 'import_user_3', // New
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Test Address 3',
        phone: '081234567893',
        active: 1
      },
      {
        name: 'Test Import 4',
        username: 'existing_user', // Duplicate
        gender: 'Female',
        birthdate: '1995-05-05',
        address: 'Test Address 4',
        phone: '081234567894',
        active: 1
      }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    XLSX.writeFile(wb, testFilePath);

    const response = await request
      .post('/api/setting/members/import-excel')
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', `token=${token}`)
      .attach('file', testFilePath);

    expect(response.status).toBe(400); // Should fail
    expect(response.body.success).toBe(false); // Or check specific error message structure

    // Verify DB - Check that import_user_3 was NOT created (rollback)
    const newMember = await prisma.member.findUnique({
      where: { username: 'import_user_3' }
    });
    expect(newMember).toBeNull();
  });

    it('should fail if excel file is empty', async () => {
    // Create empty Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, testFilePath);

    const response = await request
      .post('/api/setting/members/import-excel')
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', `token=${token}`)
      .attach('file', testFilePath);

    expect(response.status).toBe(400);
  });
});
