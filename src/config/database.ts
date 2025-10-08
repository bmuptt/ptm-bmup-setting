import { PrismaClient } from '@prisma/client';
import apm from './apm';

// Global variable to store Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Base Prisma Client
const basePrismaClient = globalThis.__prisma || new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

// Prisma Client dengan APM Extension
const prismaWithAPM = basePrismaClient.$extends({
  query: {
    $allOperations: async ({ model, operation, args, query }) => {
      // Nama span: prisma <Model>.<operation>
      const modelName = model ?? 'raw';
      const name = `prisma ${modelName}.${operation}`;

      // Buat span untuk operasi database (skip jika APM null)
      const span = apm?.startSpan(name, 'db', 'prisma', operation);

      try {
        const result = await query(args);
        return result;
      } catch (err: any) {
        // Tandai error di span
        span?.setLabel('error', String(err?.message ?? err));
        throw err;
      } finally {
        // Label ringan saja; hindari perekaman argumen besar/PII
        span?.setLabel('model', modelName);
        span?.setLabel('operation', operation);
        
        // Catat jumlah record yang diubah (untuk update/delete/createMany)
        const count = (args as any)?.data?.length ?? undefined;
        if (count !== undefined) span?.setLabel('items', count);
        
        span?.end();
      }
    },
  },
});

// Event listeners removed - using APM spans for monitoring

// In development, store the client in global variable to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = basePrismaClient;
}

// Log database connection
console.log('Database connection initialized with APM spans', {
  environment: process.env.NODE_ENV,
  database: process.env.POSTGRES_DB,
});

export default prismaWithAPM;
