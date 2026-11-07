import fs from 'fs';
import path from 'path';

const LOCK_FILE_PATH = path.resolve(process.cwd(), '.installed.lock');

export interface LockData {
  installed_at: string;
  installed_by: string;
  version: string;
  installation_id: string;
  checksum: string;
  phases_completed: string[];
  db_migration_hash: string;
  admin_email: string;
}

export function isInstalled(): boolean {
  if (!fs.existsSync(LOCK_FILE_PATH)) {
    return false;
  }
  try {
    const content = fs.readFileSync(LOCK_FILE_PATH, 'utf-8');
    const data = JSON.parse(content);
    return Boolean(data && data.installation_id);
  } catch {
    return false;
  }
}

export function getLockData(): LockData | null {
  if (!isInstalled()) return null;
  try {
    const content = fs.readFileSync(LOCK_FILE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export function createLockFile(data: LockData): boolean {
  try {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(LOCK_FILE_PATH, content, 'utf-8');
    try {
      fs.chmodSync(LOCK_FILE_PATH, 0o400); // Read-only protection
    } catch {
      // Windows / environment fallback
    }
    return true;
  } catch (error) {
    console.error('Failed to create installation lock file:', error);
    return false;
  }
}

export function removeLockFile(): void {
  if (fs.existsSync(LOCK_FILE_PATH)) {
    try {
      fs.chmodSync(LOCK_FILE_PATH, 0o666);
    } catch {}
    fs.unlinkSync(LOCK_FILE_PATH);
  }
}
