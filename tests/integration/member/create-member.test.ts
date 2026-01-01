import dotenv from 'dotenv';
import { TestHelper } from '../../test-util';
import supertest from 'supertest';
import app from '../../../src/main';
import path from 'path';

dotenv.config();

const baseUrlTest = '/api/setting/members';

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

describe('Member API Integration Tests', () => {
  
  beforeEach(async () => {
    // Increase timeout for database operations
    jest.setTimeout(30000);
    // Migrate dan seed ulang database untuk setiap test case
    await TestHelper.refreshDatabase();
  });

  afterEach(async () => {
    // Cleanup database setelah test
    await TestHelper.cleanupDatabase();
  });

  describe('POST /api/setting/members', () => {
    it('Should create member successfully with valid data', async () => {
      // Increase timeout for this comprehensive test
      jest.setTimeout(30000);

      console.log('🧪 Testing create member with valid data...');

      const memberData = {
        name: 'John Doe',
        username: 'johndoe',
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Jl. Contoh No. 123, Jakarta',
        phone: '081234567890',
        active: true
      };

      const response = await supertest(app)
        .post(baseUrlTest)
        .send(memberData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Member created successfully');
      
      // Validate member data structure
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', 'John Doe');
      expect(response.body.data).toHaveProperty('username', 'johndoe');
      expect(response.body.data).toHaveProperty('gender', 'Male');
      expect(response.body.data).toHaveProperty('birthdate');
      expect(response.body.data).toHaveProperty('address', 'Jl. Contoh No. 123, Jakarta');
      expect(response.body.data).toHaveProperty('phone', '081234567890');
      expect(response.body.data).toHaveProperty('active', true);
      expect(response.body.data).toHaveProperty('created_by');
      expect(response.body.data).toHaveProperty('created_at');
      expect(response.body.data).toHaveProperty('updated_at');

      console.log('✅ Create member test completed successfully');
    });

    it('Should create member successfully with minimal required data', async () => {
      console.log('🧪 Testing create member with minimal required data...');

      const memberData = {
        name: 'Jane Doe',
        username: 'janedoe',
        gender: 'Female',
        birthdate: '1995-05-15',
        address: 'Jl. Test No. 456, Bandung',
        phone: '081234567891',
        active: false
      };

      const response = await supertest(app)
        .post(baseUrlTest)
        .send(memberData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('name', 'Jane Doe');
      expect(response.body.data).toHaveProperty('username', 'janedoe');
      expect(response.body.data).toHaveProperty('gender', 'Female');
      expect(response.body.data).toHaveProperty('active', false);

      console.log('✅ Create member with minimal data test completed successfully');
    });

    it('Should fail when username is already taken', async () => {
      console.log('🧪 Testing create member with duplicate username...');

      const memberData = {
        name: 'John Doe',
        username: 'johndoe',
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Jl. Contoh No. 123, Jakarta',
        phone: '081234567890',
        active: true
      };

      // Create first member
      await supertest(app)
        .post(baseUrlTest)
        .send(memberData);

      // Try to create second member with same username
      const duplicateMemberData = {
        ...memberData,
        name: 'Jane Doe',
        phone: '081234567891'
      };

      const response = await supertest(app)
        .post(baseUrlTest)
        .send(duplicateMemberData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('This username is already taken');

      console.log('✅ Duplicate username test completed successfully');
    });

    it('Should fail when user_id is already registered', async () => {
      console.log('🧪 Testing create member with duplicate user_id...');

      const memberData = {
        user_id: 123,
        name: 'John Doe',
        username: 'johndoe',
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Jl. Contoh No. 123, Jakarta',
        phone: '081234567890',
        active: true
      };

      // Create first member
      await supertest(app)
        .post(baseUrlTest)
        .send(memberData);

      // Try to create second member with same user_id
      const duplicateMemberData = {
        ...memberData,
        name: 'Jane Doe',
        username: 'janedoe',
        phone: '081234567891'
      };

      const response = await supertest(app)
        .post(baseUrlTest)
        .send(duplicateMemberData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('This user is already registered as a member');

      console.log('✅ Duplicate user_id test completed successfully');
    });

    it('Should fail validation when required fields are missing', async () => {
      console.log('🧪 Testing create member with missing required fields...');

      const incompleteMemberData = {
        username: 'johndoe',
        gender: 'Male'
        // Missing: name, birthdate, address, phone, active
      };

      const response = await supertest(app)
        .post(baseUrlTest)
        .send(incompleteMemberData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);

      console.log('✅ Missing required fields test completed successfully');
    });

    it('Should fail validation when gender is invalid', async () => {
      console.log('🧪 Testing create member with invalid gender...');

      const memberData = {
        name: 'John Doe',
        username: 'johndoe',
        gender: 'Invalid',
        birthdate: '1990-01-01',
        address: 'Jl. Contoh No. 123, Jakarta',
        phone: '081234567890',
        active: true
      };

      const response = await supertest(app)
        .post(baseUrlTest)
        .send(memberData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Gender must be either Male or Female');

      console.log('✅ Invalid gender test completed successfully');
    });

    it('Should fail validation when birthdate is in the future', async () => {
      console.log('🧪 Testing create member with future birthdate...');

      // Use a fixed future date to ensure it's always in the future
      const futureDateString = '2030-12-31';

      const memberData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        gender: 'Male',
        birthdate: futureDateString,
        address: 'Jl. Contoh No. 123, Jakarta',
        phone: '081234567890',
        active: true
      };

      const response = await supertest(app)
        .post(baseUrlTest)
        .send(memberData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Birthdate must be before today');

      console.log('✅ Future birthdate test completed successfully');
    });

    it('Should fail validation when username format is invalid', async () => {
      console.log('🧪 Testing create member with invalid username format...');

      const memberData = {
        name: 'John Doe',
        username: 'invalid username!@#', // Contains invalid characters
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Jl. Contoh No. 123, Jakarta',
        phone: '081234567890',
        active: true
      };

      const response = await supertest(app)
        .post(baseUrlTest)
        .send(memberData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Username can only contain letters, numbers, underscores, and hyphens');

      console.log('✅ Invalid username format test completed successfully');
    });

    it('Should fail validation when field lengths exceed limits', async () => {
      console.log('🧪 Testing create member with field length violations...');

      const memberData = {
        name: 'a'.repeat(256), // Exceeds 255 character limit
        username: 'johndoe',
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'a'.repeat(501), // Exceeds 500 character limit
        phone: 'a'.repeat(21), // Exceeds 20 character limit
        active: true
      };

      const response = await supertest(app)
        .post(baseUrlTest)
        .send(memberData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Name cannot exceed 255 characters');
      expect(response.body.errors).toContain('Address cannot exceed 500 characters');
      expect(response.body.errors).toContain('Phone cannot exceed 20 characters');

      console.log('✅ Field length violation test completed successfully');
    });

    it('Should handle boolean conversion for active field correctly', async () => {
      console.log('🧪 Testing create member with various active field formats...');

      const testCases = [
        { active: 'true', expected: true },
        { active: 'false', expected: false },
        { active: '1', expected: true },
        { active: '0', expected: false },
        { active: 1, expected: true },
        { active: 0, expected: false }
      ];

      for (const testCase of testCases) {
        const memberData = {
          name: `Test User ${testCase.active}`,
          username: `testuser${testCase.active}${Date.now()}`,
          gender: 'Male',
          birthdate: '1990-01-01',
          address: 'Jl. Test No. 123, Jakarta',
          phone: `08123456789${testCase.active}`,
          active: testCase.active
        };

        const response = await supertest(app)
          .post(baseUrlTest)
          .send(memberData);

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('active', testCase.expected);
      }

      console.log('✅ Boolean conversion test completed successfully');
    });

    it('Should fail validation when username is too short', async () => {
      console.log('🧪 Testing create member with username too short...');

      const memberData = {
        name: 'John Doe',
        username: 'ab', // Less than 3 characters
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Jl. Contoh No. 123, Jakarta',
        phone: '081234567890',
        active: true
      };

      const response = await supertest(app)
        .post(baseUrlTest)
        .send(memberData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Username must be at least 3 characters');

      console.log('✅ Username too short test completed successfully');
    });
  });
});
