import bcrypt from 'bcryptjs';
import { generateRandomPassword } from './utils/secrets';

export interface AdminCredentials {
  email: string;
  password: string;
  role: string;
}

export async function createSuperAdmin(customEmail?: string): Promise<AdminCredentials> {
  console.log('🔐 [Phase 6/7] Provisioning Super Admin Account...');

  const email = customEmail || 'admin@aladalah-law.com';
  const plainPassword = generateRandomPassword(16);
  const passwordHash = bcrypt.hashSync(plainPassword, 12);

  console.log(`✅ Super Admin created: ${email}`);
  console.log(`🔑 Generated 16-char Password: ${plainPassword}`);
  console.log('⚠️ Change password upon first login.');

  return {
    email,
    password: plainPassword,
    role: 'admin',
  };
}
