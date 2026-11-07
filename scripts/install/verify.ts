import fs from 'fs';
import path from 'path';
import { isInstalled, getLockData } from './utils/lock';

export async function verifyInstallation(): Promise<boolean> {
  console.log('🧪 Verifying Installation State...');

  const lockExists = isInstalled();
  if (!lockExists) {
    console.error('❌ .installed.lock is missing!');
    return false;
  }

  const lockData = getLockData();
  if (!lockData || !lockData.installation_id) {
    console.error('❌ .installed.lock is corrupted!');
    return false;
  }

  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file is missing!');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  if (!envContent.includes('INSTALLATION_COMPLETED="true"') && !envContent.includes('INSTALLATION_COMPLETED=true')) {
    console.error('❌ INSTALLATION_COMPLETED flag is not set to true in .env!');
    return false;
  }

  console.log('🎉 Installation verified successfully — System ready!');
  console.log(`📌 Installation ID: ${lockData.installation_id}`);
  console.log(`📌 Installed At: ${lockData.installed_at}`);
  console.log(`📌 Super Admin Email: ${lockData.admin_email}`);

  return true;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  verifyInstallation();
}
