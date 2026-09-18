import { StorageAdapter } from './types';
import { LocalStorageAdapter } from './local-storage.adapter';
import { S3StorageAdapter } from './s3-storage.adapter';

export * from './types';
export * from './local-storage.adapter';
export * from './s3-storage.adapter';

let defaultStorageAdapter: StorageAdapter | null = null;

/**
 * Returns the configured storage adapter based on environment variables.
 * In production: Uses S3StorageAdapter (or LocalStorageAdapter if explicitly permitted).
 * In development: Uses LocalStorageAdapter by default.
 */
export function getStorageAdapter(): StorageAdapter {
  if (!defaultStorageAdapter) {
    const provider = process.env.STORAGE_PROVIDER || 'local';

    if (provider === 's3') {
      defaultStorageAdapter = new S3StorageAdapter();
    } else {
      defaultStorageAdapter = new LocalStorageAdapter();
    }
  }
  return defaultStorageAdapter;
}

/**
 * Allows resetting the adapter instance for testing or dynamic switching.
 */
export function setStorageAdapter(adapter: StorageAdapter | null): void {
  defaultStorageAdapter = adapter;
}
