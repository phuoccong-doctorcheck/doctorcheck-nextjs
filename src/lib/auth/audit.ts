import 'server-only';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { AuditAction, AuditActionType, AuditEventInput } from './audit-types';

export { AuditAction, type AuditActionType, type AuditEventInput };

const REDACTED_KEYS = new Set([
  'password',
  'passwordhash',
  'password_hash',
  'token',
  'tokenhash',
  'token_hash',
  'sessiontoken',
  'session_token',
  'secret',
  'cookie',
  'authorization',
  'database_url',
]);

/**
 * Recursively redacts sensitive security keys from audit metadata.
 */
function sanitizeMetadata(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeMetadata);
  }

  const cleanObj: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (REDACTED_KEYS.has(lowerKey)) {
      cleanObj[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      cleanObj[key] = sanitizeMetadata(value);
    } else {
      cleanObj[key] = value;
    }
  }
  return cleanObj;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Writes an immutable audit log event to PostgreSQL.
 * Protects caller from fatal crashes while ensuring safe metadata.
 */
export async function logAuditEvent(event: AuditEventInput): Promise<void> {
  try {
    const cleanMeta = sanitizeMetadata(event.metadata || {});
    const validActorId = event.actorId && UUID_REGEX.test(event.actorId) ? event.actorId : null;

    await db.insert(auditLogs).values({
      actorId: validActorId,
      actorEmail: event.actorEmail ? event.actorEmail.toLowerCase().trim() : null,
      action: event.action,
      entityType: event.entityType || null,
      entityId: event.entityId || null,
      ipAddress: event.ipAddress || null,
      userAgent: event.userAgent || null,
      metadata: (cleanMeta as Record<string, unknown>) || {},
    });
  } catch (error) {
    // In production, fallback log to server stderr without exposing secrets
    console.error('⚠️ AUDIT_LOG_ERROR: Failed to persist audit event:', {
      action: event.action,
      actorEmail: event.actorEmail,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
