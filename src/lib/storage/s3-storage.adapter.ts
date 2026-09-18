import 'server-only';
import crypto from 'crypto';
import sharp from 'sharp';
import type {
  StorageAdapter,
  StorageFile,
  StorageUploadResult,
  StorageDeleteResult,
} from './types';

export interface S3Config {
  bucket: string;
  region: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrlPrefix?: string;
}

/**
 * Production Durable S3-Compatible Storage Adapter
 * Compatible with: AWS S3, Cloudflare R2, MinIO, Wasabi, and GCP Cloud Storage.
 * Uses standard AWS Signature Version 4 for zero external SDK bloat.
 */
export class S3StorageAdapter implements StorageAdapter {
  readonly providerName = 's3' as const;
  private config: S3Config;

  constructor(config?: Partial<S3Config>) {
    this.config = {
      bucket: config?.bucket || process.env.S3_BUCKET || '',
      region: config?.region || process.env.S3_REGION || 'auto',
      endpoint: config?.endpoint || process.env.S3_ENDPOINT || undefined,
      accessKeyId: config?.accessKeyId || process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: config?.secretAccessKey || process.env.S3_SECRET_ACCESS_KEY || '',
      publicUrlPrefix: config?.publicUrlPrefix || process.env.S3_PUBLIC_URL_PREFIX || undefined,
    };
  }

  /**
   * Generates AWS Signature Version 4 Headers for S3 REST Requests
   */
  private signRequest(
    method: string,
    key: string,
    body: Buffer = Buffer.alloc(0),
    contentType = 'application/octet-stream'
  ): { url: string; headers: Record<string, string> } {
    const { bucket, region, endpoint, accessKeyId, secretAccessKey } = this.config;

    // Determine host and URL
    let host = `${bucket}.s3.${region}.amazonaws.com`;
    let url = `https://${host}/${key}`;

    if (endpoint) {
      const endpointUrl = new URL(endpoint);
      host = endpointUrl.host;
      url = `${endpoint.replace(/\/$/, '')}/${bucket}/${key}`;
    }

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);

    const payloadHash = crypto.createHash('sha256').update(body).digest('hex');

    const canonicalHeaders =
      `content-type:${contentType}\n` +
      `host:${host}\n` +
      `x-amz-content-sha256:${payloadHash}\n` +
      `x-amz-date:${amzDate}\n`;

    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest =
      `${method}\n` +
      `/${endpoint ? `${bucket}/${key}` : key}\n\n` +
      `${canonicalHeaders}\n` +
      `${signedHeaders}\n` +
      payloadHash;

    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    const stringToSign =
      `${algorithm}\n` +
      `${amzDate}\n` +
      `${credentialScope}\n` +
      crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex');

    // Signing Key Derivation
    const kSecret = Buffer.from('AWS4' + secretAccessKey, 'utf8');
    const kDate = crypto.createHmac('sha256', kSecret).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update('s3').digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();

    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex');

    const authorization =
      `${algorithm} ` +
      `Credential=${accessKeyId}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, ` +
      `Signature=${signature}`;

    return {
      url,
      headers: {
        'Content-Type': contentType,
        'Host': host,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': payloadHash,
        'Authorization': authorization,
      },
    };
  }

  getPublicUrl(storageKey: string): string {
    if (this.config.publicUrlPrefix) {
      return `${this.config.publicUrlPrefix.replace(/\/$/, '')}/${storageKey.replace(/^\//, '')}`;
    }
    if (this.config.endpoint) {
      return `${this.config.endpoint.replace(/\/$/, '')}/${this.config.bucket}/${storageKey}`;
    }
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${storageKey}`;
  }

  async upload(
    file: StorageFile,
    options?: { generateThumbnail?: boolean; customPrefix?: string }
  ): Promise<StorageUploadResult> {
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

    let width: number | null = null;
    let height: number | null = null;
    let format = file.mimeType.split('/')[1] || 'bin';

    try {
      const metadata = await sharp(file.buffer).metadata();
      width = metadata.width || null;
      height = metadata.height || null;
      if (metadata.format) format = metadata.format;
    } catch {
      // Non-raster or binary
    }

    const date = new Date();
    const yearMonth = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    const sanitizedBase = file.originalFilename
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();

    const prefix = options?.customPrefix ? options.customPrefix.replace(/^\/|\/$/g, '') : 'uploads/media';
    const storageKey = `${prefix}/${yearMonth}/${checksum.slice(0, 12)}-${sanitizedBase}`;

    // S3 PUT Request
    const { url, headers } = this.signRequest('PUT', storageKey, file.buffer, file.mimeType);

    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body: new Uint8Array(file.buffer),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`S3_UPLOAD_FAILED: HTTP ${res.status} - ${errText || res.statusText}`);
    }

    const publicUrl = this.getPublicUrl(storageKey);
    let thumbnailUrl: string | null = null;

    // Optional Thumbnail Generation
    if (options?.generateThumbnail && width && width > 300) {
      try {
        const thumbBuffer = await sharp(file.buffer)
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .toBuffer();

        const thumbKey = `${prefix}/${yearMonth}/${checksum.slice(0, 12)}-thumb-${sanitizedBase}`;
        const thumbSign = this.signRequest('PUT', thumbKey, thumbBuffer, file.mimeType);

        const thumbRes = await fetch(thumbSign.url, {
          method: 'PUT',
          headers: thumbSign.headers,
          body: new Uint8Array(thumbBuffer),
        });

        if (thumbRes.ok) {
          thumbnailUrl = this.getPublicUrl(thumbKey);
        }
      } catch {
        // Thumbnail generation failure is non-fatal for master image
      }
    }

    return {
      storageProvider: 's3',
      storageKey,
      storagePath: storageKey,
      publicUrl,
      thumbnailUrl,
      fileSizeBytes: file.sizeBytes,
      width,
      height,
      checksum,
      metadata: {
        bucket: this.config.bucket,
        region: this.config.region,
        format,
      },
    };
  }

  async delete(storageKey: string, thumbnailUrl?: string | null): Promise<StorageDeleteResult> {
    try {
      const { url, headers } = this.signRequest('DELETE', storageKey);
      await fetch(url, { method: 'DELETE', headers });

      if (thumbnailUrl) {
        const thumbKey = thumbnailUrl.replace(this.getPublicUrl(''), '').replace(/^\//, '');
        if (thumbKey) {
          const thumbSign = this.signRequest('DELETE', thumbKey);
          await fetch(thumbSign.url, { method: 'DELETE', headers: thumbSign.headers });
        }
      }

      return { success: true, storageKey };
    } catch (err) {
      return {
        success: false,
        storageKey,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async exists(storageKey: string): Promise<boolean> {
    try {
      const { url, headers } = this.signRequest('HEAD', storageKey);
      const res = await fetch(url, { method: 'HEAD', headers });
      return res.status === 200;
    } catch {
      return false;
    }
  }
}
