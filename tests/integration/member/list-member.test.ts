import request from 'supertest';
import app from '../../../src/main';
import { TestHelper } from '../../test-util';
import memberService from '../../../src/services/member.service';
import externalUserRepository from '../../../src/repository/external-user.repository';

jest.mock('../../../src/repository/external-user.repository', () => ({
  __esModule: true,
  default: {
    getUsersByIds: jest.fn(),
  },
}));

const mockExternalUserRepository = externalUserRepository as unknown as { getUsersByIds: jest.Mock };

// Mock authentication middleware
jest.mock('../../../src/middleware/auth.middleware', () => ({
  verifyCoreToken: (req: unknown, res: unknown, next: () => void) => {
    (req as { user?: unknown; menu?: unknown[] }).user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: {
        id: 1,
        name: 'admin'
      }
    };
    (req as { menu?: unknown[] }).menu = [];
    next();
  }
}));

describe('Member List API Integration Tests', () => {
  beforeEach(async () => {
    mockExternalUserRepository.getUsersByIds.mockReset();
    mockExternalUserRepository.getUsersByIds.mockResolvedValue([]);
    await TestHelper.refreshDatabase();
  });

  afterEach(async () => {
    await TestHelper.refreshDatabase();
  });

  describe('GET /api/setting/members', () => {
    it('Should get all members with default pagination', async () => {
      // Create some test members
      await memberService.createMember({
        user_id: 1,
        name: 'John Doe',
        username: 'johndoe',
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Jl. Test No. 1',
        phone: '081234567890',
        active: true
      }, undefined, 1);

      await memberService.createMember({
        user_id: 2,
        name: 'Jane Smith',
        username: 'janesmith',
        gender: 'Female',
        birthdate: '1995-05-15',
        address: 'Jl. Test No. 2',
        phone: '081234567891',
        active: false
      }, undefined, 1);

      mockExternalUserRepository.getUsersByIds.mockResolvedValue([
        { id: 1, email: 'john@example.com' },
        { id: 2, email: 'jane@example.com' },
      ]);

      const response = await request(app)
        .get('/api/setting/members')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 10
      });
      expect(response.body.message).toBe('Members retrieved successfully');
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'John Doe', email: 'john@example.com' }),
          expect.objectContaining({ name: 'Jane Smith', email: 'jane@example.com' }),
        ])
      );
    });

    it('Should get members with custom pagination using limit', async () => {
      // Create 5 test members
      for (let i = 1; i <= 5; i++) {
        await memberService.createMember({
          user_id: i,
          name: `User ${i}`,
          username: `user${i}`,
          gender: 'Male',
          birthdate: '1990-01-01',
          address: `Jl. Test No. ${i}`,
          phone: `08123456789${i}`,
          active: true
        }, undefined, 1);
      }

      const response = await request(app)
        .get('/api/setting/members?page=2&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toEqual({
        currentPage: 2,
        totalPages: 3,
        totalItems: 5,
        itemsPerPage: 2
      });
    });

    it('Should get members with custom pagination using per_page', async () => {
      // Create 5 test members
      for (let i = 1; i <= 5; i++) {
        await memberService.createMember({
          user_id: i,
          name: `User ${i}`,
          username: `user${i}`,
          gender: 'Male',
          birthdate: '1990-01-01',
          address: `Jl. Test No. ${i}`,
          phone: `08123456789${i}`,
          active: true
        }, undefined, 1);
      }

      const response = await request(app)
        .get('/api/setting/members?page=2&per_page=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toEqual({
        currentPage: 2,
        totalPages: 3,
        totalItems: 5,
        itemsPerPage: 2
      });
    });

    it('Should search members by name', async () => {
      await memberService.createMember({
        user_id: 1,
        name: 'John Doe',
        username: 'johndoe',
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Jl. Test No. 1',
        phone: '081234567890',
        active: true
      }, undefined, 1);

      await memberService.createMember({
        user_id: 2,
        name: 'Jane Smith',
        username: 'janesmith',
        gender: 'Female',
        birthdate: '1995-05-15',
        address: 'Jl. Test No. 2',
        phone: '081234567891',
        active: true
      }, undefined, 1);

      const response = await request(app)
        .get('/api/setting/members?search=John')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('John Doe');
    });

    it('Should search members by username', async () => {
      await memberService.createMember({
        user_id: 1,
        name: 'John Doe',
        username: 'johndoe',
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Jl. Test No. 1',
        phone: '081234567890',
        active: true
      }, undefined, 1);

      await memberService.createMember({
        user_id: 2,
        name: 'Jane Smith',
        username: 'janesmith',
        gender: 'Female',
        birthdate: '1995-05-15',
        address: 'Jl. Test No. 2',
        phone: '081234567891',
        active: true
      }, undefined, 1);

      const response = await request(app)
        .get('/api/setting/members?search=jane')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].username).toBe('janesmith');
    });

    it('Should search members by phone', async () => {
      await memberService.createMember({
        user_id: 1,
        name: 'John Doe',
        username: 'johndoe',
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Jl. Test No. 1',
        phone: '081234567890',
        active: true
      }, undefined, 1);

      await memberService.createMember({
        user_id: 2,
        name: 'Jane Smith',
        username: 'janesmith',
        gender: 'Female',
        birthdate: '1995-05-15',
        address: 'Jl. Test No. 2',
        phone: '081234567891',
        active: true
      }, undefined, 1);

      const response = await request(app)
        .get('/api/setting/members?search=890')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].phone).toBe('081234567890');
    });

    it('Should filter members by active status', async () => {
      await memberService.createMember({
        user_id: 1,
        name: 'Active User',
        username: 'activeuser',
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Jl. Test No. 1',
        phone: '081234567890',
        active: true
      }, undefined, 1);

      await memberService.createMember({
        user_id: 2,
        name: 'Inactive User',
        username: 'inactiveuser',
        gender: 'Female',
        birthdate: '1995-05-15',
        address: 'Jl. Test No. 2',
        phone: '081234567891',
        active: false
      }, undefined, 1);

      // Test active filter
      const activeResponse = await request(app)
        .get('/api/setting/members?active=active')
        .expect(200);

      expect(activeResponse.body.success).toBe(true);
      expect(activeResponse.body.data).toHaveLength(1);
      expect(activeResponse.body.data[0].active).toBe(true);

      // Test inactive filter
      const inactiveResponse = await request(app)
        .get('/api/setting/members?active=inactive')
        .expect(200);

      expect(inactiveResponse.body.success).toBe(true);
      expect(inactiveResponse.body.data).toHaveLength(1);
      expect(inactiveResponse.body.data[0].active).toBe(false);
    });

    it('Should order members by name ascending using camelCase', async () => {
      await memberService.createMember({
        user_id: 1,
        name: 'Charlie Brown',
        username: 'charlie',
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Jl. Test No. 1',
        phone: '081234567890',
        active: true
      }, undefined, 1);

      await memberService.createMember({
        user_id: 2,
        name: 'Alice Johnson',
        username: 'alice',
        gender: 'Female',
        birthdate: '1995-05-15',
        address: 'Jl. Test No. 2',
        phone: '081234567891',
        active: true
      }, undefined, 1);

      await memberService.createMember({
        user_id: 3,
        name: 'Bob Wilson',
        username: 'bob',
        gender: 'Male',
        birthdate: '1985-03-10',
        address: 'Jl. Test No. 3',
        phone: '081234567892',
        active: true
      }, undefined, 1);

      const response = await request(app)
        .get('/api/setting/members?orderField=name&orderDir=asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].name).toBe('Alice Johnson');
      expect(response.body.data[1].name).toBe('Bob Wilson');
      expect(response.body.data[2].name).toBe('Charlie Brown');
    });

    it('Should order members by name ascending using snake_case', async () => {
      await memberService.createMember({
        user_id: 1,
        name: 'Charlie Brown',
        username: 'charlie',
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Jl. Test No. 1',
        phone: '081234567890',
        active: true
      }, undefined, 1);

      await memberService.createMember({
        user_id: 2,
        name: 'Alice Johnson',
        username: 'alice',
        gender: 'Female',
        birthdate: '1995-05-15',
        address: 'Jl. Test No. 2',
        phone: '081234567891',
        active: true
      }, undefined, 1);

      await memberService.createMember({
        user_id: 3,
        name: 'Bob Wilson',
        username: 'bob',
        gender: 'Male',
        birthdate: '1985-03-10',
        address: 'Jl. Test No. 3',
        phone: '081234567892',
        active: true
      }, undefined, 1);

      const response = await request(app)
        .get('/api/setting/members?order_field=name&order_dir=asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].name).toBe('Alice Johnson');
      expect(response.body.data[1].name).toBe('Bob Wilson');
      expect(response.body.data[2].name).toBe('Charlie Brown');
    });

    it('Should order members by created_at descending (default with id desc)', async () => {
      await memberService.createMember({
        user_id: 1,
        name: 'First User',
        username: 'firstuser',
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Jl. Test No. 1',
        phone: '081234567890',
        active: true
      }, undefined, 1);

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      await memberService.createMember({
        user_id: 2,
        name: 'Second User',
        username: 'seconduser',
        gender: 'Female',
        birthdate: '1995-05-15',
        address: 'Jl. Test No. 2',
        phone: '081234567891',
        active: true
      }, undefined, 1);

      const response = await request(app)
        .get('/api/setting/members')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      // Should be ordered by id desc (newest first)
      expect(response.body.data[0].name).toBe('Second User');
      expect(response.body.data[1].name).toBe('First User');
    });

    it('Should validate invalid orderField parameter (camelCase)', async () => {
      const response = await request(app)
        .get('/api/setting/members?orderField=invalid_field')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('orderField: Order field must be one of: id, name, username, gender, birthdate, address, phone, active, created_at, updated_at');
    });

    it('Should validate invalid order_field parameter (snake_case)', async () => {
      const response = await request(app)
        .get('/api/setting/members?order_field=invalid_field')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('order_field: Order field must be one of: id, name, username, gender, birthdate, address, phone, active, created_at, updated_at');
    });

    it('Should validate invalid orderDir parameter (camelCase)', async () => {
      const response = await request(app)
        .get('/api/setting/members?orderDir=invalid_direction')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('orderDir: Order direction must be either asc or desc');
    });

    it('Should validate invalid order_dir parameter (snake_case)', async () => {
      const response = await request(app)
        .get('/api/setting/members?order_dir=invalid_direction')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('order_dir: Order direction must be either asc or desc');
    });

    it('Should validate invalid active parameter', async () => {
      const response = await request(app)
        .get('/api/setting/members?active=invalid_status')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('active: Active filter must be one of: active, inactive, all');
    });

    it('Should validate invalid page parameter', async () => {
      const response = await request(app)
        .get('/api/setting/members?page=0')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('page: Page must be at least 1');
    });

    it('Should validate invalid limit parameter', async () => {
      const response = await request(app)
        .get('/api/setting/members?limit=101')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('limit: Limit cannot exceed 100');
    });

    it('Should handle complex query with all parameters (camelCase)', async () => {
      // Create test data
      await memberService.createMember({
        user_id: 1,
        name: 'John Active',
        username: 'johnactive',
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Jl. Test No. 1',
        phone: '081234567890',
        active: true
      }, undefined, 1);

      await memberService.createMember({
        user_id: 2,
        name: 'Jane Inactive',
        username: 'janeinactive',
        gender: 'Female',
        birthdate: '1995-05-15',
        address: 'Jl. Test No. 2',
        phone: '081234567891',
        active: false
      }, undefined, 1);

      await memberService.createMember({
        user_id: 3,
        name: 'Bob Active',
        username: 'bobactive',
        gender: 'Male',
        birthdate: '1985-03-10',
        address: 'Jl. Test No. 3',
        phone: '081234567892',
        active: true
      }, undefined, 1);

      const response = await request(app)
        .get('/api/setting/members?search=active&active=active&orderField=name&orderDir=asc&page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // Only active users with 'active' in name
      expect(response.body.data[0].name).toBe('Bob Active');
      expect(response.body.data[1].name).toBe('John Active');
      expect(response.body.data.every((member: any) => member.active === true)).toBe(true);
    });

    it('Should handle complex query with all parameters (snake_case)', async () => {
      // Create test data
      await memberService.createMember({
        user_id: 1,
        name: 'John Active',
        username: 'johnactive',
        gender: 'Male',
        birthdate: '1990-01-01',
        address: 'Jl. Test No. 1',
        phone: '081234567890',
        active: true
      }, undefined, 1);

      await memberService.createMember({
        user_id: 2,
        name: 'Jane Inactive',
        username: 'janeinactive',
        gender: 'Female',
        birthdate: '1995-05-15',
        address: 'Jl. Test No. 2',
        phone: '081234567891',
        active: false
      }, undefined, 1);

      await memberService.createMember({
        user_id: 3,
        name: 'Bob Active',
        username: 'bobactive',
        gender: 'Male',
        birthdate: '1985-03-10',
        address: 'Jl. Test No. 3',
        phone: '081234567892',
        active: true
      }, undefined, 1);

      const response = await request(app)
        .get('/api/setting/members?search=active&active=active&order_field=name&order_dir=asc&page=1&per_page=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // Only active users with 'active' in name
      expect(response.body.data[0].name).toBe('Bob Active');
      expect(response.body.data[1].name).toBe('John Active');
      expect(response.body.data.every((member: any) => member.active === true)).toBe(true);
    });
  });
});
