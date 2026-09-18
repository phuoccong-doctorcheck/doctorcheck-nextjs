import 'server-only';
import { hash, verify } from '@node-rs/argon2';

/**
 * Argon2id Recommended Security Parameters (OWASP compliant)
 * Memory Cost: 64MB (65536 KiB)
 * Time Cost (Iterations): 3
 * Parallelism: 4 threads
 * Hash Output Length: 32 bytes
 */
const ARGON2_OPTIONS = {
  memoryCost: 65536,
  timeCost: 3,
  outputLen: 32,
  parallelism: 4,
};

export const PASSWORD_POLICY = {
  MIN_LENGTH: 12,
  MAX_LENGTH: 128,
};

/**
 * Validates password against administrative complexity & length standards.
 */
export function validatePasswordPolicy(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Mật khẩu không được để trống.' };
  }

  if (password.length < PASSWORD_POLICY.MIN_LENGTH) {
    return {
      valid: false,
      error: `Mật khẩu phải có độ dài tối thiểu ${PASSWORD_POLICY.MIN_LENGTH} ký tự để đảm bảo an toàn.`,
    };
  }

  if (password.length > PASSWORD_POLICY.MAX_LENGTH) {
    return {
      valid: false,
      error: `Mật khẩu không được vượt quá ${PASSWORD_POLICY.MAX_LENGTH} ký tự.`,
    };
  }

  // Check for sufficient entropy (at least has a mix of characters or sufficient length)
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigitOrSpecial = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  if (!hasLetter || !hasDigitOrSpecial) {
    return {
      valid: false,
      error: 'Mật khẩu phải chứa ít nhất một chữ cái và một số hoặc ký tự đặc biệt.',
    };
  }

  return { valid: true };
}

/**
 * Hashes a plaintext password using Argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
  const policyCheck = validatePasswordPolicy(password);
  if (!policyCheck.valid) {
    throw new Error(policyCheck.error || 'Password does not meet security requirements.');
  }

  return await hash(password, ARGON2_OPTIONS);
}

/**
 * Verifies a plaintext password against an Argon2id hash.
 * Returns false on mismatch or malformed hash without throwing errors.
 */
export async function verifyPassword(passwordHash: string, passwordAttempt: string): Promise<boolean> {
  if (!passwordHash || !passwordAttempt) {
    return false;
  }

  try {
    return await verify(passwordHash, passwordAttempt);
  } catch {
    return false;
  }
}
