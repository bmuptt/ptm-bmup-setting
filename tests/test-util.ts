import dotenv from 'dotenv';
import { execSync } from 'child_process';
import prisma from '../src/config/database';
import supertest from 'supertest';
import app from '../src/main';

dotenv.config();

declare global {
  var __testMigrationsApplied: boolean | undefined;
}

export class TestHelper {
  /**
   * Migrate dan seed ulang database untuk setiap test case
   * Seperti integration test di Laravel
   * Optimized: Direct database operations instead of spawning npm scripts
   * Thread-safe: Uses transaction isolation to prevent conflicts in parallel execution
   */
  static async refreshDatabase() {
    try {
      if (!globalThis.__testMigrationsApplied) {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        globalThis.__testMigrationsApplied = true;
      }

      // Use transaction to ensure atomic operations and prevent conflicts in parallel execution
      // All operations are wrapped in a single transaction for consistency
      await prisma.$transaction(async (tx) => {
        // Clean database terlebih dahulu
        await tx.member.deleteMany({});
        await tx.core.deleteMany({});
        await tx.aboutTimeline.deleteMany({});
        await tx.aboutTeamMember.deleteMany({});
        await tx.trainingSchedule.deleteMany({});
        await tx.landingItem.deleteMany({});
        await tx.landingSection.deleteMany({});
        await tx.activity.deleteMany({});
        await tx.icon.deleteMany({});

        // Reset sequence with error handling (safe in transaction)
        try {
          await tx.$executeRaw`ALTER SEQUENCE members_id_seq RESTART WITH 1;`;
        } catch (seqError) {
          // Sequence might not exist, ignore
        }

        try {
          await tx.$executeRaw`ALTER SEQUENCE cores_id_seq RESTART WITH 1;`;
        } catch (seqError) {
          // Sequence might not exist, ignore
        }

        try {
          await tx.$executeRaw`ALTER SEQUENCE about_timelines_id_seq RESTART WITH 1;`;
        } catch (seqError) {
        }

        try {
          await tx.$executeRaw`ALTER SEQUENCE about_team_members_id_seq RESTART WITH 1;`;
        } catch (seqError) {
        }

        try {
          await tx.$executeRaw`ALTER SEQUENCE training_schedules_id_seq RESTART WITH 1;`;
        } catch (seqError) {
        }

        try {
          await tx.$executeRaw`ALTER SEQUENCE landing_items_id_seq RESTART WITH 1;`;
        } catch (seqError) {
        }

        try {
          await tx.$executeRaw`ALTER SEQUENCE landing_sections_id_seq RESTART WITH 1;`;
        } catch (seqError) {
        }

        try {
          await tx.$executeRaw`ALTER SEQUENCE activities_id_seq RESTART WITH 1;`;
        } catch (seqError) {
        }

        try {
          await tx.$executeRaw`ALTER SEQUENCE icons_id_seq RESTART WITH 1;`;
        } catch (seqError) {
        }

        // Seed data directly (upsert to prevent conflicts in parallel execution)
        // Upsert ensures idempotency - safe to run multiple times
        await tx.core.upsert({
          where: { id: 0 },
          update: {
            name: 'PTM BMUP',
            logo: null,
            description: 'Sistem pengaturan BMUP',
            address: 'Jl. Contoh No. 123, Jakarta',
            maps: null,
            primary_color: '#f86f24',
            secondary_color: '#efbc37',
            created_by: 0,
            updated_by: null,
          },
          create: {
            id: 0,
            name: 'PTM BMUP',
            logo: null,
            description: 'Sistem pengaturan BMUP',
            address: 'Jl. Contoh No. 123, Jakarta',
            maps: null,
            primary_color: '#f86f24',
            secondary_color: '#efbc37',
            created_by: 0,
            updated_by: null,
          },
        });
      }, {
        timeout: 10000, // 10 second timeout
      });

      // Verify database is ready
      const coreCount = await prisma.core.count();
      const memberCount = await prisma.member.count();
      const sectionCount = await prisma.landingSection.count();
      const itemCount = await prisma.landingItem.count();
      const iconCount = await prisma.icon.count();
      const activityCount = await prisma.activity.count();
      const aboutTimelineCount = await prisma.aboutTimeline.count();
      const aboutTeamMemberCount = await prisma.aboutTeamMember.count();
      const trainingScheduleCount = await prisma.trainingSchedule.count();

      if (
        coreCount !== 1
        || memberCount !== 0
        || sectionCount !== 0
        || itemCount !== 0
        || iconCount !== 0
        || activityCount !== 0
        || aboutTimelineCount !== 0
        || aboutTeamMemberCount !== 0
        || trainingScheduleCount !== 0
      ) {
        console.log(
          `⚠️ Database state: Core records: ${coreCount}, Member records: ${memberCount}, About timelines: ${aboutTimelineCount}, About team members: ${aboutTeamMemberCount}, Training schedules: ${trainingScheduleCount}, Sections: ${sectionCount}, Items: ${itemCount}, Icons: ${iconCount}, Activities: ${activityCount}`,
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Error refreshing database:', message);
      throw error;
    }
  }

  /**
   * Cleanup database setelah test
   */
  static async cleanupDatabase() {
    try {
      // Clean in correct order (members first due to foreign key constraints)
      await prisma.member.deleteMany({});
      await prisma.core.deleteMany({});

      console.log('🧹 Database cleaned up');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Error cleaning up database:', message);
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Error closing database connection:', message);
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Error during cleanup:', message);
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error running seed:core:', message);
    }
  }

  static async delete() {
    await prisma.core.deleteMany({});
    console.log('All core records deleted');
  }
}
