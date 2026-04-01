import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Dev domains that should resolve to a default/first site
const DEV_DOMAINS = ['localhost', '127.0.0.1'];

export async function proxy(request: NextRequest) {
  // Strip www. prefix so nanoreefguide.com and www.nanoreefguide.com both resolve
  const rawHostname = request.headers.get('host')?.split(':')[0] || '';
  const hostname = rawHostname.startsWith('www.') ? rawHostname.slice(4) : rawHostname;
  const url = request.nextUrl.clone();

  // Skip middleware for static files, api routes, and _next
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/favicon') ||
    url.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let site;

  if (DEV_DOMAINS.includes(hostname)) {
    // In dev, resolve to the first active site (or use a query param ?site=slug)
    const siteSlug = url.searchParams.get('site');
    if (siteSlug) {
      const { data } = await supabase
        .from('sites')
        .select('id, slug, domain')
        .eq('slug', siteSlug)
        .eq('status', 'active')
        .single();
      site = data;
    } else {
      const { data } = await supabase
        .from('sites')
        .select('id, slug, domain')
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      site = data;
    }
  } else {
    // Production: resolve by domain
    const { data } = await supabase
      .from('sites')
      .select('id, slug, domain')
      .eq('domain', hostname)
      .eq('status', 'active')
      .single();
    site = data;
  }

  if (!site) {
    return new NextResponse('Site not found', { status: 404 });
  }

  // Inject site context into request headers for downstream server components
  const response = NextResponse.next();
  response.headers.set('x-site-id', site.id);
  response.headers.set('x-site-slug', site.slug);
  response.headers.set('x-hostname', hostname);

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
