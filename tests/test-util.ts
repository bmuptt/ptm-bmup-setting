import dotenv from 'dotenv';
import { execSync } from 'child_process';
import prisma from '../src/config/database';
import supertest from 'supertest';
import app from '../src/main';

dotenv.config();

export class TestHelper {
  /**
   * Migrate dan seed ulang database untuk setiap test case
   * Seperti integration test di Laravel
   */
  static async refreshDatabase() {
    try {
      console.log('🔄 Refreshing database...');

      // Disconnect and reconnect to ensure clean state
      await prisma.$disconnect();

      // Clean database terlebih dahulu
      await prisma.core.deleteMany({});

      // Reset sequence dengan error handling
      try {
        await prisma.$executeRaw`ALTER SEQUENCE cores_id_seq RESTART WITH 1;`;
      } catch (seqError) {
        console.log(
          '⚠️ Sequence reset warning (might not exist):',
          seqError.message,
        );
      }

      // Wait a bit to ensure all connections are properly closed
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Disconnect and reconnect to ensure clean state
      await prisma.$disconnect();
      await prisma.$connect();

      // Seed data dengan timeout yang lebih lama
      execSync('npm run seed:core', { stdio: 'inherit', timeout: 60000 });

      // Verify database is clean
      const coreCount = await prisma.core.count();

      console.log(
        `✅ Database refreshed successfully - Core records: ${coreCount}`,
      );

      // Small delay to ensure database is fully ready
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error('❌ Error refreshing database:', error.message);
      throw error;
    }
  }

  /**
   * Cleanup database setelah test
   */
  static async cleanupDatabase() {
    try {
      // Clean in correct order
      await prisma.core.deleteMany({});

      console.log('🧹 Database cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up database:', error.message);
      // Don't throw error during cleanup to avoid masking test failures
    }
  }

  /**
   * Cleanup database connection
   */
  static async cleanupConnection() {
    try {
      await prisma.$disconnect();
      console.log('🔌 Database connection closed');
    } catch (error) {
      console.error('❌ Error closing database connection:', error.message);
    }
  }

  /**
   * Cleanup all resources (database, APM, server)
   */
  static async cleanupAll() {
    try {
      // Cleanup database
      await this.cleanupConnection();
      
      // Cleanup server if exists
      try {
        const { server } = require('../src/main');
        if (server && server.close) {
          await new Promise((resolve) => {
            server.close(() => {
              console.log('🔌 Server connection closed');
              resolve(true);
            });
          });
        }
      } catch (serverError) {
        // Server might not be initialized in testing
        console.log('⚠️ Server cleanup skipped (not initialized)');
      }
      
      // Cleanup APM if exists
      try {
        const apm = require('../src/config/apm').default;
        if (apm && apm.destroy) {
          apm.destroy();
          console.log('🔌 APM connection closed');
        }
      } catch (apmError) {
        // APM might not be initialized in testing
        console.log('⚠️ APM cleanup skipped (not initialized)');
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('🗑️ Garbage collection triggered');
      }
      
      console.log('✅ All resources cleaned up');
    } catch (error) {
      console.error('❌ Error during cleanup:', error.message);
    }
  }
}

export class CoreTable {
  static async resetCoreIdSequence() {
    await prisma.$executeRaw`ALTER SEQUENCE cores_id_seq RESTART WITH 1;`;
  }

  static async callCoreSeed() {
    try {
      execSync('npm run seed:core', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error running seed:core:', error.message);
    }
  }

  static async delete() {
    await prisma.core.deleteMany({});
    console.log('All core records deleted');
  }
}
