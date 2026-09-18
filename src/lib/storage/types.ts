/**
 * Storage Abstraction Types for DoctorCheck CMS
 */

export interface StorageFile {
  buffer: Buffer;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface StorageUploadResult {
  storageProvider: 'local' | 'legacy_public' | 's3';
  storageKey: string;
  storagePath: string;
  publicUrl: string;
  thumbnailUrl: string | null;
  fileSizeBytes: number;
  width: number | null;
  height: number | null;
  checksum: string; // SHA-256 hex string
  metadata: Record<string, unknown>;
}

export interface StorageDeleteResult {
  success: boolean;
  storageKey: string;
  error?: string;
}

export interface StorageAdapter {
  providerName: 'local' | 'legacy_public' | 's3';

  /**
   * Saves a file to the storage provider and optionally generates a thumbnail.
   */
  upload(
    file: StorageFile,
    options?: {
      generateThumbnail?: boolean;
      customPrefix?: string;
    }
  ): Promise<StorageUploadResult>;

  /**
   * Deletes a file and optional thumbnail from storage.
   */
  delete(storageKey: string, thumbnailUrl?: string | null): Promise<StorageDeleteResult>;

  /**
   * Resolves the canonical public URL for a given storage key.
   */
  getPublicUrl(storageKey: string): string;

  /**
   * Checks whether a given storage key exists.
   */
  exists(storageKey: string): Promise<boolean>;
}
