import { z } from 'zod';

/**
 * Environment Validation Schema for DoctorCheck CMS
 * Ensures all required secrets and configuration parameters are validated at runtime.
 */
export const envSchema = z.object({
  // Core Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // PostgreSQL Connection
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(
      (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
      'DATABASE_URL must start with postgresql:// or postgres://'
    ),

  // Session Security Secret (Optional in dev, recommended in prod)
  SESSION_SECRET: z.string().min(16).optional(),

  // Storage Configuration
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  ALLOW_LOCAL_STORAGE_IN_PRODUCTION: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),

  // S3 / Object Storage Configuration (Required if STORAGE_PROVIDER === 's3')
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default('auto'),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL_PREFIX: z.string().optional(),

  // Data Provider Overrides
  DATA_PROVIDER: z.enum(['static', 'postgres']).default('postgres'),
  DOCTOR_DATA_PROVIDER: z.enum(['static', 'postgres']).default('postgres'),
  PACKAGE_DATA_PROVIDER: z.enum(['static', 'postgres']).default('postgres'),
  CATEGORY_DATA_PROVIDER: z.enum(['static', 'postgres']).default('postgres'),
  ARTICLE_DATA_PROVIDER: z.enum(['static', 'postgres']).default('postgres'),
  PAGE_DATA_PROVIDER: z.enum(['static', 'postgres']).default('postgres'),
  CLINIC_DATA_PROVIDER: z.enum(['static', 'postgres']).default('postgres'),
  CLINICAL_TRUST_DATA_PROVIDER: z.enum(['static', 'postgres']).default('postgres'),
  HOMEPAGE_DATA_PROVIDER: z.enum(['static', 'postgres']).default('postgres'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  config?: EnvConfig;
}

/**
 * Validates the runtime environment against production standards.
 */
export function validateEnvironment(): EnvValidationResult {
  const result = envSchema.safeParse(process.env);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`${issue.path.join('.')}: ${issue.message}`);
    }
    return { valid: false, errors, warnings };
  }

  const config = result.data;

  // Production-specific validation invariants
  if (config.NODE_ENV === 'production') {
    // 1. Storage durability fail-safe
    if (config.STORAGE_PROVIDER === 'local' && !config.ALLOW_LOCAL_STORAGE_IN_PRODUCTION) {
      errors.push(
        'PRODUCTION_STORAGE_INVARIANT: STORAGE_PROVIDER is set to "local" without ALLOW_LOCAL_STORAGE_IN_PRODUCTION=true. Production deployments require durable object storage (STORAGE_PROVIDER=s3) to prevent media loss on container restart.'
      );
    }

    if (config.STORAGE_PROVIDER === 's3') {
      if (!config.S3_BUCKET) errors.push('S3_BUCKET is required when STORAGE_PROVIDER is "s3"');
      if (!config.S3_ACCESS_KEY_ID) errors.push('S3_ACCESS_KEY_ID is required when STORAGE_PROVIDER is "s3"');
      if (!config.S3_SECRET_ACCESS_KEY) errors.push('S3_SECRET_ACCESS_KEY is required when STORAGE_PROVIDER is "s3"');
    }

    // 2. Data Provider cutover invariant
    if (config.DATA_PROVIDER === 'static') {
      warnings.push('DATA_PROVIDER is set to "static". Production cutover expects PostgreSQL data providers.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    config,
  };
}

/**
 * Validates environment and throws on fatal production misconfigurations.
 */
export function enforceProductionEnv(): EnvConfig {
  const validation = validateEnvironment();
  if (!validation.valid) {
    const errorDetails = validation.errors.join('\n  - ');
    throw new Error(`CRITICAL_STARTUP_CONFIG_ERROR: Environment validation failed:\n  - ${errorDetails}`);
  }
  return validation.config!;
}

/**
 * Sanitizes strings, URLs, or error messages by redacting passwords, session secrets, and database credentials.
 */
export function redactSecrets(input: string): string {
  if (!input || typeof input !== 'string') return input;
  return input
    .replace(/(postgres(?:ql)?:\/\/[^:]+:)([^@]+)(@)/gi, '$1***REDACTED***$3')
    .replace(/(SESSION_SECRET=)[^\s&]+/gi, '$1***REDACTED***')
    .replace(/(S3_SECRET_ACCESS_KEY=)[^\s&]+/gi, '$1***REDACTED***')
    .replace(/(password["']?\s*[:=]\s*["']?)([^"',\s}]+)/gi, '$1***REDACTED***');
}
