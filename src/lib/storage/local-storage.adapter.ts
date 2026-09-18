import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import sharp from 'sharp';
import { StorageAdapter, StorageFile, StorageUploadResult, StorageDeleteResult } from './types';

export class LocalStorageAdapter implements StorageAdapter {
  public readonly providerName = 'local';
  private readonly publicRootDir: string;
  private readonly uploadSubDir = 'uploads/media';
  private readonly thumbnailSubDir = 'uploads/thumbnails';

  constructor(publicRootDir?: string) {
    this.publicRootDir = publicRootDir || path.join(process.cwd(), 'public');
  }

  /**
   * Sanitizes a filename to prevent path traversal and special character issues.
   */
  private sanitizeFilename(filename: string): { baseName: string; extension: string } {
    const parsed = path.parse(filename);
    const cleanExt = parsed.ext.toLowerCase().replace(/[^a-z0-9.]/g, '');
    const cleanBase = parsed.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove Vietnamese accents
      .replace(/[^a-z0-9-_]/g, '-')     // Replace unsafe characters with hyphens
      .replace(/-+/g, '-')             // Collapse duplicate hyphens
      .replace(/^-|-$/g, '')           // Trim leading/trailing hyphens
      .slice(0, 80);                   // Limit length

    const baseName = cleanBase.length > 0 ? cleanBase : 'file';
    return { baseName, extension: cleanExt };
  }

  /**
   * Computes SHA-256 checksum of a buffer.
   */
  private computeChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Asserts that a target path resides strictly inside the allowed base directory.
   */
  private assertPathWithinBase(targetPath: string, baseDir: string): void {
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(targetPath);
    if (!resolvedTarget.startsWith(resolvedBase + path.sep) && resolvedTarget !== resolvedBase) {
      throw new Error(`Path traversal attempt blocked: ${targetPath}`);
    }
  }

  async upload(
    file: StorageFile,
    options?: {
      generateThumbnail?: boolean;
      customPrefix?: string;
    }
  ): Promise<StorageUploadResult> {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const nonce = crypto.randomBytes(6).toString('hex');

    const { baseName, extension } = this.sanitizeFilename(file.originalFilename);
    const finalFilename = `${baseName}-${nonce}${extension}`;

    // Relative storage keys (URL paths)
    const mediaRelDir = path.join(this.uploadSubDir, year, month).replace(/\\/g, '/');
    const storageKey = `${mediaRelDir}/${finalFilename}`;
    const storagePath = `/${storageKey}`;
    const publicUrl = `/${storageKey}`;

    // Target absolute disk path
    const targetDiskDir = path.join(this.publicRootDir, this.uploadSubDir, year, month);
    const targetDiskPath = path.join(targetDiskDir, finalFilename);
    this.assertPathWithinBase(targetDiskPath, this.publicRootDir);

    await fs.promises.mkdir(targetDiskDir, { recursive: true });

    // Write original file
    await fs.promises.writeFile(targetDiskPath, file.buffer);

    // Compute checksum
    const checksum = this.computeChecksum(file.buffer);

    // Extract image metadata via Sharp
    let width: number | null = null;
    let height: number | null = null;
    let metadataObj: Record<string, unknown> = {};

    try {
      const sharpInstance = sharp(file.buffer);
      const meta = await sharpInstance.metadata();
      width = meta.width ?? null;
      height = meta.height ?? null;
      metadataObj = {
        format: meta.format,
        space: meta.space,
        channels: meta.channels,
        density: meta.density,
        isAnimated: (meta.pages ?? 1) > 1,
        pages: meta.pages,
      };
    } catch {
      // Non-fatal if metadata extraction fails for unusual format
      metadataObj = { format: 'unknown' };
    }

    // Generate WebP thumbnail if requested and supported
    let thumbnailUrl: string | null = null;
    if (options?.generateThumbnail !== false) {
      try {
        const thumbFilename = `${baseName}-${nonce}-thumb.webp`;
        const thumbDiskDir = path.join(this.publicRootDir, this.thumbnailSubDir, year, month);
        const thumbDiskPath = path.join(thumbDiskDir, thumbFilename);
        this.assertPathWithinBase(thumbDiskPath, this.publicRootDir);

        await fs.promises.mkdir(thumbDiskDir, { recursive: true });

        await sharp(file.buffer)
          .rotate() // Auto-orient based on EXIF
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(thumbDiskPath);

        thumbnailUrl = `/${this.thumbnailSubDir}/${year}/${month}/${thumbFilename}`;
      } catch (err) {
        console.warn('Thumbnail generation skipped or failed:', err);
        thumbnailUrl = null;
      }
    }

    return {
      storageProvider: 'local',
      storageKey,
      storagePath,
      publicUrl,
      thumbnailUrl,
      fileSizeBytes: file.buffer.length,
      width,
      height,
      checksum,
      metadata: metadataObj,
    };
  }

  async delete(storageKey: string, thumbnailUrl?: string | null): Promise<StorageDeleteResult> {
    try {
      // Clean storage key: remove leading slash if present
      const cleanKey = storageKey.replace(/^\/+/, '');
      const diskPath = path.join(this.publicRootDir, cleanKey);
      this.assertPathWithinBase(diskPath, this.publicRootDir);

      if (fs.existsSync(diskPath)) {
        await fs.promises.unlink(diskPath);
      }

      // Delete thumbnail if exists
      if (thumbnailUrl) {
        const cleanThumbKey = thumbnailUrl.replace(/^\/+/, '');
        const thumbDiskPath = path.join(this.publicRootDir, cleanThumbKey);
        this.assertPathWithinBase(thumbDiskPath, this.publicRootDir);
        if (fs.existsSync(thumbDiskPath)) {
          await fs.promises.unlink(thumbDiskPath);
        }
      }

      return { success: true, storageKey };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, storageKey, error: errorMsg };
    }
  }

  getPublicUrl(storageKey: string): string {
    const cleanKey = storageKey.replace(/^\/+/, '');
    return `/${cleanKey}`;
  }

  async exists(storageKey: string): Promise<boolean> {
    try {
      const cleanKey = storageKey.replace(/^\/+/, '');
      const diskPath = path.join(this.publicRootDir, cleanKey);
      this.assertPathWithinBase(diskPath, this.publicRootDir);
      return fs.existsSync(diskPath);
    } catch {
      return false;
    }
  }
}
