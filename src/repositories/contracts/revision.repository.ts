import { ContentRevision, NewContentRevision } from '@/db/schema/workflow';
import { ContentTypeId, WorkflowStatusType } from '@/lib/workflow/types';

export interface ConcurrencyUpdateResult {
  updated: ContentRevision | null;
  conflict: boolean;
  currentVersion?: number;
}

export interface IRevisionRepository {
  getById(id: string): Promise<ContentRevision | null>;
  getByEntityAndRevision(
    entityType: ContentTypeId,
    entityId: string,
    revisionNumber: number
  ): Promise<ContentRevision | null>;
  getLatestByEntity(entityType: ContentTypeId, entityId: string): Promise<ContentRevision | null>;
  getPublishedByEntity(entityType: ContentTypeId, entityId: string): Promise<ContentRevision | null>;
  listByEntity(entityType: ContentTypeId, entityId: string): Promise<ContentRevision[]>;
  create(data: NewContentRevision): Promise<ContentRevision>;
  updateDraftWithConcurrency(
    id: string,
    expectedVersion: number,
    updates: Partial<NewContentRevision>
  ): Promise<ConcurrencyUpdateResult>;
  updateStatus(
    id: string,
    status: WorkflowStatusType,
    metadata?: Partial<ContentRevision>
  ): Promise<ContentRevision | null>;
  getNextRevisionNumber(entityType: ContentTypeId, entityId: string): Promise<number>;
}
