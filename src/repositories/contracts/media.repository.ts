import { Media, NewMedia } from '@/db/schema/media';

export interface MediaListFilter {
  search?: string;
  mimeType?: string;
  status?: 'active' | 'archived' | 'all';
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'fileSizeBytes' | 'filename';
  sortOrder?: 'asc' | 'desc';
}

export interface MediaListResult {
  items: Media[];
  total: number;
  limit: number;
  offset: number;
}

export interface MediaReference {
  domain: 'articles' | 'doctors' | 'packages' | 'pages' | 'equipment' | 'testimonials' | 'homepage_blocks' | 'clinic_info';
  entityId: string;
  field: string;
  label: string;
}

export interface IMediaRepository {
  list(filter?: MediaListFilter): Promise<MediaListResult>;
  getById(id: string): Promise<Media | null>;
  getByChecksum(checksum: string): Promise<Media | null>;
  getByStoragePath(storagePath: string): Promise<Media | null>;
  getByPublicUrl(publicUrl: string): Promise<Media | null>;
  create(data: NewMedia): Promise<Media>;
  updateMetadata(id: string, data: { altText?: string; caption?: string | null }): Promise<Media | null>;
  setStatus(id: string, status: 'active' | 'archived'): Promise<Media | null>;
  delete(id: string): Promise<boolean>;
  count(filter?: Partial<MediaListFilter>): Promise<number>;
  checkReferences(mediaIdOrUrl: string): Promise<MediaReference[]>;
}
