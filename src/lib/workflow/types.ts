/**
 * Workflow and Revision History Types for DoctorCheck CMS
 */

export const WorkflowStatus = {
  DRAFT: 'draft',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type WorkflowStatusType = (typeof WorkflowStatus)[keyof typeof WorkflowStatus];

export const WorkflowAction = {
  CREATE_DRAFT: 'create_draft',
  UPDATE_DRAFT: 'update_draft',
  SUBMIT_REVIEW: 'submit_review',
  RETURN_TO_DRAFT: 'return_to_draft',
  APPROVE: 'approve',
  PUBLISH: 'publish',
  ARCHIVE: 'archive',
  RESTORE: 'restore',
} as const;

export type WorkflowActionType = (typeof WorkflowAction)[keyof typeof WorkflowAction];

export const ContentType = {
  ARTICLE: 'article',
  PAGE: 'page',
  DOCTOR: 'doctor',
  PACKAGE: 'package',
  CLINIC: 'clinic',
  EQUIPMENT: 'equipment',
  FAQ: 'faq',
  TESTIMONIAL: 'testimonial',
  HOMEPAGE: 'homepage',
} as const;

export type ContentTypeId = (typeof ContentType)[keyof typeof ContentType];

export interface WorkflowTransitionRule {
  from: WorkflowStatusType;
  to: WorkflowStatusType;
  action: WorkflowActionType;
  permissionResolver: (contentType: ContentTypeId) => string;
}

export interface ConcurrencyConflictDetail {
  id: string;
  entityType: ContentTypeId;
  entityId: string;
  currentVersion: number;
  expectedVersion: number;
  message: string;
}

export interface WorkflowOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  conflict?: ConcurrencyConflictDetail;
  validationErrors?: Record<string, string[]>;
  publishStatus?: 'PUBLISH_SUCCEEDED' | 'PUBLISH_FAILED';
  revalidationStatus?: 'REVALIDATION_SUCCEEDED' | 'REVALIDATION_FAILED' | 'REVALIDATION_SKIPPED';
  revalidationPaths?: string[];
}

export interface RevalidationPlan {
  paths: string[];
  tags?: string[];
}

export interface DomainValidationResult {
  valid: boolean;
  errors?: Record<string, string[]>;
  sanitizedPayload?: Record<string, unknown>;
}
