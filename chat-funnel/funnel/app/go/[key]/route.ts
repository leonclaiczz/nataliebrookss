import { headers } from 'next/headers';
import { resolveModel } from '@/models';

export const dynamic = 'force-dynamic';

// /go/<key>  →  302-Weiterleitung auf den Link mit diesem Key
export async function GET(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const h = await headers();
  const m = new URL(req.url).searchParams.get('m') ?? undefined;
  const model = resolveModel(h.get('host'), m);
  const target = model.links[key] ?? model.links.default;
  return new Response(null, {
    status: 302,
    headers: { Location: target, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  });
}
