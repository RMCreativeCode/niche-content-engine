import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Called by the content pipeline after publishing an article to bust ISR cache
// Usage: POST /api/revalidate?token=SECRET&path=/some-slug
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const path = request.nextUrl.searchParams.get('path');

  if (token !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  if (!path) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  revalidatePath(path);
  // Always revalidate the homepage too so new articles appear in the feed
  if (path !== '/') revalidatePath('/');

  return NextResponse.json({ revalidated: true, path });
}
