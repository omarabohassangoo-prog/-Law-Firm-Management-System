import { runPreflightCheck } from './01-preflight';
import { setupEnvironment } from './02-environment';
import { setupDatabase } from './03-database';
import { runSchemaMigration } from './04-migration';
import { seedInitialData } from './05-seed';
import { createSuperAdmin } from './06-super-admin';
import { lockInstallation } from './07-lock';
import { removeLockFile } from './utils/lock';

async function main() {
  const args = process.argv.slice(2);
  const isForce = args.includes('--force');
  const isReset = args.includes('--reset');

  if (isReset) {
    console.log('⚠️ [RESET] Removing installation lock...');
    removeLockFile();
  }

  console.log('🚀 Starting System Installation Process (Install Once + Lock)...');

  // Phase 1: Pre-flight
  const preflightOk = await runPreflightCheck(isForce || isReset);
  if (!preflightOk) {
    process.exit(1);
  }

  // Phase 2: Environment
  await setupEnvironment();

  // Phase 3: Database
  const dbOk = await setupDatabase();
  if (!dbOk) process.exit(1);

  // Phase 4: Migration
  const migrationOk = await runSchemaMigration();
  if (!migrationOk) process.exit(1);

  // Phase 5: Seed
  await seedInitialData();

  // Phase 6: Super Admin
  const adminCreds = await createSuperAdmin();

  // Phase 7: Lock Installation
  const locked = await lockInstallation(adminCreds.email);

  if (locked) {
    console.log('\n======================================================');
    console.log('🎉 SYSTEM INSTALLATION COMPLETED AND LOCKED SUCCESSFULLY!');
    console.log(`📧 Super Admin Email: ${adminCreds.email}`);
    console.log(`🔑 Super Admin Password: ${adminCreds.password}`);
    console.log('======================================================\n');
  } else {
    console.error('❌ Failed to lock installation.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('💥 Critical error during installation:', err);
  process.exit(1);
});
