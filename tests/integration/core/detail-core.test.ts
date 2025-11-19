import dotenv from 'dotenv';
import { TestHelper } from '../../test-util';
import supertest from 'supertest';
import app from '../../../src/main';

dotenv.config();

const baseUrlTest = '/api/setting/core';

describe('Core API Integration Tests', () => {
  
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

  describe('GET /api/setting/core', () => {
    it('Should handle complete get core configuration flow including data structure validation', async () => {
      // Increase timeout for this comprehensive test
      jest.setTimeout(30000);

      console.log('🧪 Testing get core configuration...');

      const response = await supertest(app)
        .get(baseUrlTest);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Core configuration retrieved successfully');
      
      // Validate core data structure
      expect(response.body.data).toHaveProperty('id', 0);
      expect(response.body.data).toHaveProperty('name', 'PTM BMUP');
      expect(response.body.data).toHaveProperty('description', 'Sistem pengaturan BMUP');
      expect(response.body.data).toHaveProperty('address', 'Jl. Contoh No. 123, Jakarta');
      expect(response.body.data).toHaveProperty('primary_color', '#f86f24');
      expect(response.body.data).toHaveProperty('secondary_color', '#efbc37');
      expect(response.body.data).toHaveProperty('logo');
      expect(response.body.data).toHaveProperty('maps');
      expect(response.body.data).toHaveProperty('created_by');
      expect(response.body.data).toHaveProperty('updated_by');
      expect(response.body.data).toHaveProperty('created_at');
      expect(response.body.data).toHaveProperty('updated_at');

      console.log('✅ Get core configuration test completed successfully');
    });

    it('Should return 404 when core data is not found', async () => {
      console.log('🧪 Testing core data not found scenario...');

      // Delete core data to simulate not found scenario
      await TestHelper.cleanupDatabase();

      const response = await supertest(app)
        .get(baseUrlTest);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Core configuration not found');

      console.log('✅ Core data not found test completed successfully');
    });
  });

});
