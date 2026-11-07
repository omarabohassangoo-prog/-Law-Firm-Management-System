import fs from 'fs';
import path from 'path';
import { generateRandomHex } from './utils/secrets';

export async function setupEnvironment(): Promise<{
  jwtSecret: string;
  jwtRefreshSecret: string;
  cookieSecret: string;
}> {
  console.log('⚙️ [Phase 2/7] Setting up Environment & Secrets...');

  const envPath = path.resolve(process.cwd(), '.env');
  const envExamplePath = path.resolve(process.cwd(), '.env.example');

  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  } else if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf-8');
  }

  const jwtSecret = generateRandomHex(32);
  const jwtRefreshSecret = generateRandomHex(32);
  const cookieSecret = generateRandomHex(32);

  // Update or append secrets
  const updates: Record<string, string> = {
    JWT_SECRET: jwtSecret,
    JWT_REFRESH_SECRET: jwtRefreshSecret,
    COOKIE_SECRET: cookieSecret,
    NODE_ENV: 'production',
    PORT: '3000',
  };

  let updatedEnv = envContent;
  for (const [key, value] of Object.entries(updates)) {
    if (updatedEnv.includes(`${key}=`)) {
      updatedEnv = updatedEnv.replace(new RegExp(`${key}=.*`, 'g'), `${key}="${value}"`);
    } else {
      updatedEnv += `\n${key}="${value}"`;
    }
  }

  fs.writeFileSync(envPath, updatedEnv, 'utf-8');
  console.log('✅ Environment configuration and secure 64-char secrets generated.');

  return { jwtSecret, jwtRefreshSecret, cookieSecret };
}
