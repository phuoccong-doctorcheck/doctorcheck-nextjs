import 'server-only';
import { Media, NewMedia } from '@/db/schema/media';
import { mediaRepository } from '@/repositories';
import { getStorageAdapter } from '@/lib/storage';
import { MediaListFilter, MediaListResult, MediaReference } from '@/repositories/contracts/media.repository';
import { logAuditEvent, AuditAction } from '@/lib/auth/audit';
import sharp, { Metadata } from 'sharp';

export interface UploadMediaOptions {
  altText?: string;
  caption?: string | null;
  userId?: string | null;
  userEmail?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface UpdateMediaMetadataOptions {
  altText?: string;
  caption?: string | null;
  userId?: string | null;
  userEmail?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface MediaOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  references?: MediaReference[];
}

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

/**
 * Sniffs buffer magic bytes to verify genuine image type.
 */
function sniffImageMagicBytes(buffer: Buffer): { detectedMime: string | null; isSvg: boolean } {
  if (!buffer || buffer.length < 12) {
    return { detectedMime: null, isSvg: false };
  }

  // Check for SVG / XML indicators
  const headStr = buffer.slice(0, 100).toString('utf-8').trim().toLowerCase();
  if (headStr.includes('<svg') || headStr.includes('<?xml') || headStr.includes('<!doctype svg')) {
    return { detectedMime: 'image/svg+xml', isSvg: true };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { detectedMime: 'image/jpeg', isSvg: false };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { detectedMime: 'image/png', isSvg: false };
  }

  // WebP: RIFF ... WEBP (52 49 46 46 .... 57 45 42 50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { detectedMime: 'image/webp', isSvg: false };
  }

  // GIF: GIF87a or GIF89a
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return { detectedMime: 'image/gif', isSvg: false };
  }

  // AVIF: ftypavif / ftypavis
  const subStr = buffer.slice(4, 12).toString('latin1');
  if (subStr.includes('avif') || subStr.includes('avis') || subStr.includes('mif1')) {
    return { detectedMime: 'image/avif', isSvg: false };
  }

  return { detectedMime: null, isSvg: false };
}

/**
 * Strips HTML tags and excessive whitespace from alt text / caption.
 */
function sanitizeText(input?: string | null): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/\s+/g, ' ')   // Normalize whitespace
    .trim();
}

export class MediaService {
  /**
   * Uploads an image file through the full validation and storage pipeline.
   */
  async uploadMedia(
    buffer: Buffer,
    originalFilename: string,
    claimedMimeType: string,
    options: UploadMediaOptions = {}
  ): Promise<MediaOperationResult<Media>> {
    try {
      // 1. Hard file size check (10MB)
      if (!buffer || buffer.length === 0) {
        return { success: false, error: 'Tập tin tải lên rỗng.' };
      }
      if (buffer.length > MAX_UPLOAD_SIZE_BYTES) {
        const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
        return {
          success: false,
          error: `Dung lượng tập tin vượt quá giới hạn cho phép 10MB (Kích thước hiện tại: ${sizeMb}MB).`,
        };
      }

      // 2. MIME sniffing & Magic bytes validation
      const { detectedMime, isSvg } = sniffImageMagicBytes(buffer);

      if (isSvg) {
        return {
          success: false,
          error:
            'Tải lên tệp SVG không được hỗ trợ vì lý do an toàn bảo mật (phòng ngừa XSS / XML Injection). Vui lòng sử dụng định dạng WebP, PNG, JPEG hoặc GIF.',
        };
      }

      if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
        return {
          success: false,
          error:
            'Định dạng tập tin không hợp lệ hoặc không được hỗ trợ. Chỉ chấp nhận các định dạng ảnh: WebP, PNG, JPEG, GIF, AVIF.',
        };
      }

      // 3. Sharp Image Decoding & Verification
      let imageMeta: Metadata;
      try {
        imageMeta = await sharp(buffer).metadata();
        if (!imageMeta.width || !imageMeta.height) {
          return { success: false, error: 'Không thể giải mã dữ liệu hình ảnh hoặc ảnh bị lỗi.' };
        }
      } catch (sharpErr) {
        return {
          success: false,
          error: `Tập tin hình ảnh bị lỗi cấu trúc hoặc bị hỏng: ${
            sharpErr instanceof Error ? sharpErr.message : 'Unknown'
          }`,
        };
      }

      // 4. Storage Adapter write
      const storageAdapter = getStorageAdapter();
      const storageResult = await storageAdapter.upload(
        {
          buffer,
          originalFilename,
          mimeType: detectedMime,
          sizeBytes: buffer.length,
        },
        { generateThumbnail: true }
      );

      // 5. Database persistence
      const altTextSanitized = sanitizeText(options.altText).slice(0, 255);
      const captionSanitized = options.caption ? sanitizeText(options.caption) : null;

      let createdMedia: Media;
      try {
        const newMediaData: NewMedia = {
          filename: storageResult.storageKey.split('/').pop() || originalFilename,
          originalFilename: originalFilename.slice(0, 255),
          storageProvider: storageResult.storageProvider,
          storagePath: storageResult.storagePath,
          storageKey: storageResult.storageKey,
          publicUrl: storageResult.publicUrl,
          thumbnailUrl: storageResult.thumbnailUrl,
          altText: altTextSanitized,
          caption: captionSanitized,
          mimeType: detectedMime,
          fileSizeBytes: storageResult.fileSizeBytes,
          width: storageResult.width,
          height: storageResult.height,
          checksum: storageResult.checksum,
          status: 'active',
          metadata: storageResult.metadata,
          createdBy: options.userId || null,
        };

        createdMedia = await mediaRepository.create(newMediaData);
      } catch (dbErr) {
        // Compensating cleanup: Delete written file if DB insertion failed
        await storageAdapter.delete(storageResult.storageKey, storageResult.thumbnailUrl);
        throw dbErr;
      }

      // 6. Audit logging
      await logAuditEvent({
        actorId: options.userId,
        actorEmail: options.userEmail,
        action: AuditAction.MEDIA_UPLOAD,
        entityType: 'media',
        entityId: createdMedia.id,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        metadata: {
          filename: createdMedia.filename,
          originalFilename: createdMedia.originalFilename,
          mimeType: createdMedia.mimeType,
          fileSizeBytes: createdMedia.fileSizeBytes,
          width: createdMedia.width,
          height: createdMedia.height,
          publicUrl: createdMedia.publicUrl,
        },
      });

      return { success: true, data: createdMedia };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Lỗi hệ thống khi lưu trữ hình ảnh: ${msg}` };
    }
  }

  /**
   * Updates metadata (alt text, caption) of an existing media item.
   */
  async updateMediaMetadata(
    id: string,
    updates: { altText?: string; caption?: string | null },
    options: UpdateMediaMetadataOptions = {}
  ): Promise<MediaOperationResult<Media>> {
    try {
      const existing = await mediaRepository.getById(id);
      if (!existing) {
        return { success: false, error: 'Không tìm thấy hình ảnh yêu cầu.' };
      }

      const altTextSanitized =
        updates.altText !== undefined ? sanitizeText(updates.altText).slice(0, 255) : existing.altText;
      const captionSanitized =
        updates.caption !== undefined ? (updates.caption ? sanitizeText(updates.caption) : null) : existing.caption;

      const updated = await mediaRepository.updateMetadata(id, {
        altText: altTextSanitized,
        caption: captionSanitized,
      });

      if (!updated) {
        return { success: false, error: 'Cập nhật metadata thất bại.' };
      }

      await logAuditEvent({
        actorId: options.userId,
        actorEmail: options.userEmail,
        action: AuditAction.MEDIA_METADATA_UPDATE,
        entityType: 'media',
        entityId: id,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        metadata: {
          previousAltText: existing.altText,
          newAltText: updated.altText,
          previousCaption: existing.caption,
          newCaption: updated.caption,
        },
      });

      return { success: true, data: updated };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Lỗi khi cập nhật metadata: ${msg}` };
    }
  }

  /**
   * Sets a media item to archived status.
   */
  async archiveMedia(
    id: string,
    options: { userId?: string; userEmail?: string; ipAddress?: string; userAgent?: string } = {}
  ): Promise<MediaOperationResult<Media>> {
    try {
      const existing = await mediaRepository.getById(id);
      if (!existing) {
        return { success: false, error: 'Không tìm thấy hình ảnh yêu cầu.' };
      }

      const updated = await mediaRepository.setStatus(id, 'archived');
      if (!updated) {
        return { success: false, error: 'Lưu trữ media thất bại.' };
      }

      await logAuditEvent({
        actorId: options.userId,
        actorEmail: options.userEmail,
        action: AuditAction.MEDIA_ARCHIVE,
        entityType: 'media',
        entityId: id,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        metadata: { filename: existing.filename, publicUrl: existing.publicUrl },
      });

      return { success: true, data: updated };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Lỗi khi lưu trữ media: ${msg}` };
    }
  }

  /**
   * Deletes a media item safely.
   * - Blocks physical deletion of legacy static assets.
   * - Blocks deletion if referenced in any domain.
   */
  async deleteMedia(
    id: string,
    options: { userId?: string; userEmail?: string; ipAddress?: string; userAgent?: string } = {}
  ): Promise<MediaOperationResult<boolean>> {
    try {
      const existing = await mediaRepository.getById(id);
      if (!existing) {
        return { success: false, error: 'Không tìm thấy hình ảnh yêu cầu.' };
      }

      // 1. Legacy Static Asset Protection
      if (existing.storageProvider === 'legacy_public' || existing.storagePath.startsWith('/sites/')) {
        return {
          success: false,
          error:
            'Tập tin tĩnh hệ thống (legacy assets) không được phép xóa vật lý để đảm bảo toàn vẹn website. Bạn có thể chọn Lưu trữ (Archive) nếu không còn sử dụng.',
        };
      }

      // 2. Reference Checking across all domains
      const references = await mediaRepository.checkReferences(id);
      if (references.length > 0) {
        return {
          success: false,
          error: `Không thể xóa tập tin vì đang được sử dụng ở ${references.length} vị trí trên website.`,
          references,
        };
      }

      // 3. Storage physical file cleanup
      const storageAdapter = getStorageAdapter();
      if (existing.storageKey) {
        await storageAdapter.delete(existing.storageKey, existing.thumbnailUrl);
      }

      // 4. Database row deletion
      const deleted = await mediaRepository.delete(id);
      if (!deleted) {
        return { success: false, error: 'Xóa dữ liệu media trong cơ sở dữ liệu thất bại.' };
      }

      // 5. Audit log
      await logAuditEvent({
        actorId: options.userId,
        actorEmail: options.userEmail,
        action: AuditAction.MEDIA_DELETE,
        entityType: 'media',
        entityId: id,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        metadata: {
          filename: existing.filename,
          originalFilename: existing.originalFilename,
          publicUrl: existing.publicUrl,
        },
      });

      return { success: true, data: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Lỗi khi xóa tập tin media: ${msg}` };
    }
  }

  /**
   * Checks references of a media item across all content domains.
   */
  async checkReferences(idOrUrl: string): Promise<MediaReference[]> {
    return mediaRepository.checkReferences(idOrUrl);
  }

  /**
   * Lists media items with pagination, search, and MIME filters.
   */
  async listMedia(filter?: MediaListFilter): Promise<MediaListResult> {
    return mediaRepository.list(filter);
  }

  /**
   * Retrieves a single media item by ID.
   */
  async getMediaById(id: string): Promise<Media | null> {
    return mediaRepository.getById(id);
  }
}

export const mediaService = new MediaService();
