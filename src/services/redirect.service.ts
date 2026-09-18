import 'server-only';
import { db } from '@/db';
import { redirects, Redirect } from '@/db/schema/settings';
import { redirectRepository } from '@/repositories/postgres/postgres-redirect.repository';
import { normalizeRoutePath, validateSafeRoutePath, isReservedPath } from '@/lib/routing/path-utils';
import { logAuditEvent, AuditAction } from '@/lib/auth/audit';
import { revalidateTag } from 'next/cache';
import { eq, and } from 'drizzle-orm';

export interface WorkflowUserContext {
  userId: string;
  userEmail: string;
  roles: string[];
  permissions: string[];
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateRouteRedirectParams {
  sourcePath: string;
  targetPath: string;
  entityType?: string;
  entityId?: string;
  createdFromRevisionId?: string;
  createdBy?: string;
  statusCode?: number;
}

export class RedirectService {
  /**
   * Detects whether creating a redirect from sourcePath to targetPath would introduce
   * a direct (A -> A) or indirect cycle (A -> B -> ... -> A).
   */
  async detectRedirectLoop(
    sourcePath: string,
    targetPath: string,
    tx?: unknown,
    options?: { ignoreSourcePath?: string }
  ): Promise<boolean> {
    const normSource = normalizeRoutePath(sourcePath);
    const normTarget = normalizeRoutePath(targetPath);

    // 1. Direct self-loop
    if (normSource === normTarget) {
      return true;
    }

    const normIgnore = options?.ignoreSourcePath ? normalizeRoutePath(options.ignoreSourcePath) : undefined;

    // 2. Multi-hop cycle detection via active redirects graph
    const client = (tx as typeof db) || db;
    const activeRedirects = await client.select().from(redirects).where(eq(redirects.isActive, true));

    // Construct edge map: source -> destination
    const graph = new Map<string, string>();
    for (const r of activeRedirects) {
      const src = normalizeRoutePath(r.sourcePath);
      if (normIgnore && src === normIgnore) continue;
      graph.set(src, normalizeRoutePath(r.targetPath));
    }

    // Speculatively add candidate edge
    graph.set(normSource, normTarget);

    // Traverse from normTarget to detect if we ever hit normSource
    let current: string | undefined = normTarget;
    const visited = new Set<string>();
    visited.add(normSource);

    let depth = 0;
    while (current && depth < 50) {
      if (visited.has(current)) {
        return true; // Cycle detected!
      }
      visited.add(current);
      current = graph.get(current);
      depth++;
    }

    return false;
  }

  /**
   * Flattens existing redirect chains pointing to oldTarget so that they point
   * directly to newTarget, eliminating A -> B -> C chains.
   */
  async flattenRedirectChains(
    oldTarget: string,
    newTarget: string,
    supersededById?: string,
    tx?: unknown
  ): Promise<number> {
    const normOld = normalizeRoutePath(oldTarget);
    const normNew = normalizeRoutePath(newTarget);
    if (normOld === normNew) return 0;

    return await redirectRepository.updateTargetForSources(normOld, normNew, supersededById, tx);
  }

  /**
   * Reconciles route history when restoring an old slug revision.
   * If a redirect already exists with sourcePath == restoredPath, deactivates it
   * to free up the path for the canonical restore.
   */
  async reconcileHistoricalRestore(
    entityType: string,
    entityId: string,
    restoredPath: string,
    tx?: unknown
  ): Promise<void> {
    const normPath = normalizeRoutePath(restoredPath);
    const client = (tx as typeof db) || db;

    // Find active redirect with source = restoredPath
    const [existing] = await client
      .select()
      .from(redirects)
      .where(and(eq(redirects.sourcePath, normPath), eq(redirects.isActive, true)));

    if (existing) {
      await client
        .update(redirects)
        .set({
          isActive: false,
          disabledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(redirects.id, existing.id));
    }
  }

  /**
   * Creates or updates a backward-compatible redirect when a published slug/path changes.
   * Must participate in the publishing database transaction.
   */
  async createPublishedRouteRedirect(
    params: CreateRouteRedirectParams,
    tx?: unknown
  ): Promise<Redirect> {
    const sourcePath = normalizeRoutePath(params.sourcePath);
    const targetPath = normalizeRoutePath(params.targetPath);

    // 1. Validate safety
    const sourceValid = validateSafeRoutePath(sourcePath);
    if (!sourceValid.valid) throw new Error(sourceValid.error);

    const targetValid = validateSafeRoutePath(targetPath);
    if (!targetValid.valid) throw new Error(targetValid.error);

    if (isReservedPath(sourcePath)) {
      throw new Error(`Không thể tạo chuyển hướng từ đường dẫn bảo vệ hệ thống '${sourcePath}'.`);
    }

    // 2. Loop prevention
    const hasLoop = await this.detectRedirectLoop(sourcePath, targetPath, tx);
    if (hasLoop) {
      throw new Error(`Không thể tạo chuyển hướng vì phát hiện vòng lặp định tuyến (Redirect Loop) giữa '${sourcePath}' và '${targetPath}'.`);
    }

    const client = (tx as typeof db) || db;

    // 3. Upsert redirect record
    const [existing] = await client
      .select()
      .from(redirects)
      .where(eq(redirects.sourcePath, sourcePath));

    let record: Redirect;
    if (existing) {
      const [updated] = await client
        .update(redirects)
        .set({
          targetPath,
          statusCode: params.statusCode || 301,
          isActive: true,
          entityType: params.entityType || existing.entityType,
          entityId: params.entityId || existing.entityId,
          createdFromRevisionId: params.createdFromRevisionId || existing.createdFromRevisionId,
          createdBy: params.createdBy || existing.createdBy,
          disabledAt: null,
          updatedAt: new Date(),
        })
        .where(eq(redirects.id, existing.id))
        .returning();
      record = updated;
    } else {
      const [inserted] = await client
        .insert(redirects)
        .values({
          sourcePath,
          targetPath,
          statusCode: params.statusCode || 301,
          isActive: true,
          entityType: params.entityType,
          entityId: params.entityId,
          createdFromRevisionId: params.createdFromRevisionId,
          createdBy: params.createdBy,
        })
        .returning();
      record = inserted;
    }

    // 4. Flatten existing redirect chains pointing to sourcePath
    await this.flattenRedirectChains(sourcePath, targetPath, record.id, tx);

    return record;
  }

  /**
   * Fast lookup for dynamic redirect matching.
   */
  async resolveDynamicRedirect(pathname: string): Promise<Redirect | null> {
    const normalized = normalizeRoutePath(pathname);
    return await redirectRepository.getBySource(normalized);
  }

  /**
   * Disables an existing redirect.
   */
  async disableRedirect(id: string, user: WorkflowUserContext): Promise<boolean> {
    const existing = await redirectRepository.getById(id);
    if (!existing) return false;

    const ok = await redirectRepository.deactivate(id);
    if (ok) {
      await logAuditEvent({
        actorId: user.userId,
        actorEmail: user.userEmail,
        action: AuditAction.REDIRECT_DISABLED || 'redirect.disabled',
        entityType: 'redirect',
        entityId: id,
        metadata: {
          sourcePath: existing.sourcePath,
          targetPath: existing.targetPath,
          disabledBy: user.userId,
        },
      });

      try {
        revalidateTag('redirects', 'max-age=0');
      } catch {}
    }
    return ok;
  }

  /**
   * Re-enables an existing disabled redirect.
   */
  async enableRedirect(id: string, user: WorkflowUserContext): Promise<boolean> {
    const existing = await redirectRepository.getById(id);
    if (!existing) return false;

    const hasLoop = await this.detectRedirectLoop(existing.sourcePath, existing.targetPath);
    if (hasLoop) {
      throw new Error(`Không thể kích hoạt lại chuyển hướng vì gây ra vòng lặp định tuyến giữa '${existing.sourcePath}' và '${existing.targetPath}'.`);
    }

    const updated = await redirectRepository.update(id, {
      isActive: true,
      disabledAt: null,
    });

    if (updated) {
      await logAuditEvent({
        actorId: user.userId,
        actorEmail: user.userEmail,
        action: 'redirect.enabled',
        entityType: 'redirect',
        entityId: id,
        metadata: {
          sourcePath: updated.sourcePath,
          targetPath: updated.targetPath,
          enabledBy: user.userId,
        },
      });

      try {
        revalidateTag('redirects', 'max-age=0');
      } catch {}
    }

    return !!updated;
  }
}

export const redirectService = new RedirectService();
