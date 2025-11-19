import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3200', 10),
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  POSTGRES_USER: process.env.POSTGRES_USER || 'postgres',
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || '',
  POSTGRES_DB: process.env.POSTGRES_DB || 'ptm_bmup_setting',
  
  // API
  API_URL_CORE: process.env.API_URL_CORE || 'http://localhost:3000/api',
  APP_URL: process.env.APP_URL || 'http://localhost:3200',
  APP_FRONTEND_URL: process.env.APP_FRONTEND_URL || 'http://localhost:3100',
  
  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60', 10),
  
  // Timezone
  TZ: process.env.TZ || 'Asia/Jakarta',
  
  // APM Configuration
  APM_API_KEY_SETTING: process.env.APM_API_KEY_SETTING || '',
  APM_SERVER_URL: process.env.APM_SERVER_URL || 'http://localhost:8200',
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: ${envVar} is not set in environment variables`);
  }
}
