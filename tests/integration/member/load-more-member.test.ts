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

describe('Member Load More API Integration Tests', () => {
  beforeEach(async () => {
    mockExternalUserRepository.getUsersByIds.mockReset();
    mockExternalUserRepository.getUsersByIds.mockResolvedValue([]);
    await TestHelper.refreshDatabase();
  });

  afterEach(async () => {
    await TestHelper.refreshDatabase();
  });

  describe('GET /api/setting/members/load-more', () => {
    it('Should get members with cursor pagination', async () => {
      // Create 15 test members
      const members = [];
      for (let i = 1; i <= 15; i++) {
        const result = await memberService.createMember({
          user_id: i,
          name: `User ${i}`,
          username: `user${i}`,
          gender: 'Male',
          birthdate: '1990-01-01',
          address: `Address ${i}`,
          phone: `0812345678${i.toString().padStart(2, '0')}`,
          active: true
        }, undefined, 1);
        if (result.success && result.data) {
            members.push(result.data);
        }
      }

      // Test case 1: First page (no cursor)
      const response1 = await request(app)
        .get('/api/setting/members/load-more')
        .query({ limit: 10 });

      if (response1.status !== 200) {
        console.error('Load More Error Response:', JSON.stringify(response1.body, null, 2));
      }
      
      expect(response1.status).toBe(200);
      expect(response1.body.success).toBe(true);
      expect(response1.body.data).toHaveLength(10);
      expect(response1.body.meta.hasMore).toBe(true);
      expect(response1.body.meta.nextCursor).not.toBeNull();
      // Verify order (Ascending by Name, then Descending by ID)
      // "User 1", "User 10"..."User 15", "User 2"..."User 4"
      expect(response1.body.data[0].name).toBe('User 1');
      expect(response1.body.data[9].name).toBe('User 4');
      
      const nextCursor = response1.body.meta.nextCursor;

      // Test case 2: Next page (with cursor)
      const response2 = await request(app)
        .get('/api/setting/members/load-more')
        .query({ limit: 10, cursor: nextCursor })
        .expect(200);
      
      expect(response2.body.success).toBe(true);
      expect(response2.body.data).toHaveLength(5); // Remaining 5 items
      expect(response2.body.meta.hasMore).toBe(false);
      expect(response2.body.meta.nextCursor).not.toBeNull();
      
      expect(response2.body.data[0].name).toBe('User 5');
      expect(response2.body.data[4].name).toBe('User 9');
    });

    it('Should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/setting/members/load-more')
        .query({ limit: 'invalid' })
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('Should accept limit greater than 100', async () => {
      // Create 105 test members
      // Only need to create enough to prove > 100 works, but actually just testing the request acceptance is enough
      // We don't need to create 105 records to test validation pass
      
      const response = await request(app)
        .get('/api/setting/members/load-more')
        .query({ limit: 150 })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.meta.limit).toBe(150);
    });
  });
});