import site from '@/config';

export const dynamic = 'force-dynamic';

// /r/<key>  →  302-Weiterleitung auf den Link mit diesem Key (wie auf ericaquinn.online)
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const target = site.links[key] ?? site.links.default;
  return new Response(null, {
    status: 302,
    headers: { Location: target, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  });
}
