import fs from 'fs';
import path from 'path';
import { isInstalled } from './utils/lock';

export async function runPreflightCheck(force: boolean = false): Promise<boolean> {
  console.log('🔍 [Phase 1/7] Running Pre-flight Checks...');

  if (isInstalled() && !force) {
    console.error('🛑 System is already installed (.installed.lock exists). Installation locked.');
    console.error('To force re-install (DANGEROUS): npm run install:system:force');
    return false;
  }

  const requiredFiles = ['package.json', '.env.example'];
  for (const file of requiredFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Required file missing: ${file}`);
      return false;
    }
  }

  console.log('✅ Pre-flight checks passed successfully.');
  return true;
}
