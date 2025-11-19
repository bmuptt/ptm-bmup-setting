import request from 'supertest';
import app from '../../../src/main';
import { TestHelper } from '../../test-util';
import memberService from '../../../src/services/member.service';
import httpClient from '../../../src/config/axios';
import memberRepository from '../../../src/repository/member.repository';
import externalUserRepository from '../../../src/repository/external-user.repository';

jest.mock('../../../src/config/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

jest.mock('../../../src/repository/external-user.repository', () => ({
  __esModule: true,
  default: {
    createUser: jest.fn(),
  },
}));

const mockHttpClient = httpClient as unknown as { get: jest.Mock };
const mockExternalUserRepository = externalUserRepository as unknown as { createUser: jest.Mock };

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

describe('Member Create External User Integration Tests', () => {
  beforeEach(async () => {
    mockHttpClient.get.mockReset();
    mockHttpClient.get.mockResolvedValue({ data: [] });
    mockExternalUserRepository.createUser.mockReset();
    await TestHelper.refreshDatabase();
  });

  afterEach(async () => {
    await TestHelper.refreshDatabase();
  });

  describe('POST /api/setting/members/create-user/:id', () => {
    it('should create an external user for member and update user_id', async () => {
      const createdMember = await memberService.createMember(
        {
          user_id: null,
          name: 'John Doe',
          username: 'johndoe',
          gender: 'Male',
          birthdate: '1990-01-01',
          address: 'Jl. Test No. 1',
          phone: '081234567890',
          active: true,
        },
        undefined,
        1
      );

      const memberId = createdMember.data.id;

      mockExternalUserRepository.createUser.mockResolvedValue({
        message: 'Success to add data user.',
        data: {
          id: 987,
          email: 'user@example.com',
          password: 'hashed-password',
          name: 'John Doe',
          gender: 'Male',
          birthdate: '1990-01-01T00:00:00.000Z',
          photo: null,
          active: 'Active',
          role_id: 2,
          created_by: 7,
          created_at: '2025-11-09T07:15:12.123Z',
          updated_by: null,
          updated_at: '2025-11-09T07:15:12.123Z',
        },
      });

      const response = await request(app)
        .post(`/api/setting/members/create-user/${memberId}`)
        .send({
          email: 'user@example.com',
          role_id: 2,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Success to add data user.');
      expect(response.body.data).toEqual({
        id: 987,
        email: 'user@example.com',
        name: 'John Doe',
        gender: 'Male',
        birthdate: '1990-01-01T00:00:00.000Z',
        photo: null,
        active: 'Active',
        role_id: 2,
        created_by: 7,
        created_at: '2025-11-09T07:15:12.123Z',
        updated_by: null,
        updated_at: '2025-11-09T07:15:12.123Z',
      });

      expect(mockExternalUserRepository.createUser).toHaveBeenCalledWith(
        {
          email: 'user@example.com',
          name: 'John Doe',
          gender: 'Male',
          birthdate: '1990-01-01',
          role_id: 2,
        },
        undefined
      );

      const updatedMember = await memberRepository.findById(memberId);
      expect(updatedMember?.user_id).toBe(987);
    });
  });
});

