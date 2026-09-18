'use server';

import { getCurrentUser } from '@/services/auth.service';
import { workflowService, WorkflowUserContext } from '@/services/workflow.service';
import { ContentTypeId, WorkflowOperationResult } from '@/lib/workflow/types';
import { ContentRevision } from '@/db/schema/workflow';

async function getWorkflowUserContext(): Promise<WorkflowUserContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  return {
    userId: user.id,
    userEmail: user.email,
    roles: user.roles,
    permissions: user.permissions,
  };
}

/**
 * Server Action to create a new draft revision.
 */
export async function createDraftAction(
  entityType: ContentTypeId,
  entityId: string,
  payload: Record<string, unknown>,
  options: { title?: string; changeSummary?: string } = {}
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getWorkflowUserContext();
  if (!user) {
    return { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.' };
  }

  return workflowService.createDraftRevision(entityType, entityId, payload, user, options);
}

/**
 * Server Action to update an existing draft revision with optimistic concurrency protection.
 */
export async function updateDraftAction(
  revisionId: string,
  expectedVersion: number,
  payload: Record<string, unknown>,
  options: { title?: string; changeSummary?: string } = {}
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getWorkflowUserContext();
  if (!user) {
    return { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.' };
  }

  return workflowService.updateDraftRevision(revisionId, expectedVersion, payload, user, options);
}

/**
 * Server Action to submit a draft for editorial/medical review.
 */
export async function submitReviewAction(
  revisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getWorkflowUserContext();
  if (!user) {
    return { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.' };
  }

  return workflowService.submitForReview(revisionId, user);
}

/**
 * Server Action to approve a revision.
 */
export async function approveRevisionAction(
  revisionId: string,
  reviewNotes?: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getWorkflowUserContext();
  if (!user) {
    return { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.' };
  }

  return workflowService.approveRevision(revisionId, user, { medicalReviewNotes: reviewNotes });
}

/**
 * Server Action to return a revision to draft state.
 */
export async function returnToDraftAction(
  revisionId: string,
  reviewNotes?: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getWorkflowUserContext();
  if (!user) {
    return { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.' };
  }

  return workflowService.returnToDraft(revisionId, user, { reviewNotes });
}

/**
 * Server Action to atomically publish a revision to canonical tables.
 */
export async function publishRevisionAction(
  revisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getWorkflowUserContext();
  if (!user) {
    return { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.' };
  }

  return workflowService.publishRevision(revisionId, user);
}

/**
 * Server Action to restore a historical revision.
 */
export async function restoreRevisionAction(
  historicalRevisionId: string
): Promise<WorkflowOperationResult<ContentRevision>> {
  const user = await getWorkflowUserContext();
  if (!user) {
    return { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.' };
  }

  return workflowService.restoreRevision(historicalRevisionId, user);
}
