import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/auth.service';
import { mediaRepository } from '@/repositories';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const mimeType = searchParams.get('mimeType') || undefined;
    const status = (searchParams.get('status') as 'active' | 'archived' | 'all') || 'active';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await mediaRepository.list({
      search,
      mimeType,
      status,
      limit,
      offset,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('API_MEDIA_LIST_ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
