import type { Redirect, NewRedirect } from '@/db/schema/settings';

export interface AdminRedirectListOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  entityType?: string;
}

export interface AdminRedirectListResult {
  redirects: Redirect[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IRedirectRepository {
  list(options?: AdminRedirectListOptions): Promise<AdminRedirectListResult>;
  getById(id: string, tx?: unknown): Promise<Redirect | null>;
  getBySource(sourcePath: string, tx?: unknown): Promise<Redirect | null>;
  getAllActive(tx?: unknown): Promise<Redirect[]>;
  getByEntity(entityType: string, entityId: string, tx?: unknown): Promise<Redirect[]>;
  create(data: NewRedirect, tx?: unknown): Promise<Redirect>;
  update(id: string, data: Partial<NewRedirect>, tx?: unknown): Promise<Redirect | null>;
  updateTargetForSources(oldTarget: string, newTarget: string, supersededById?: string, tx?: unknown): Promise<number>;
  deactivate(id: string, tx?: unknown): Promise<boolean>;
  delete(id: string, tx?: unknown): Promise<boolean>;
}
