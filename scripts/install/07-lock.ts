import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createLockFile, LockData } from './utils/lock';

export async function lockInstallation(adminEmail: string): Promise<boolean> {
  console.log('🔒 [Phase 7/7] Locking System Installation...');

  const installationId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const lockData: LockData = {
    installed_at: timestamp,
    installed_by: 'system',
    version: '1.0.0',
    installation_id: installationId,
    checksum: crypto.createHash('sha256').update(timestamp + installationId).digest('hex'),
    phases_completed: ['preflight', 'environment', 'database', 'migration', 'seed', 'super_admin', 'lock'],
    db_migration_hash: crypto.randomBytes(16).toString('hex'),
    admin_email: adminEmail,
  };

  const success = createLockFile(lockData);

  // Update .env flag
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf-8');
    if (envContent.includes('INSTALLATION_COMPLETED=')) {
      envContent = envContent.replace(/INSTALLATION_COMPLETED=.*/g, 'INSTALLATION_COMPLETED="true"');
    } else {
      envContent += '\nINSTALLATION_COMPLETED="true"';
    }
    fs.writeFileSync(envPath, envContent, 'utf-8');
  }

  if (success) {
    console.log('🔒 System installation LOCKED successfully (.installed.lock generated with chmod 400).');
    console.log('🛑 Future installations are strictly blocked.');
  }

  return success;
}
