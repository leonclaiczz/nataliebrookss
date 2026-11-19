import type { Metadata } from 'next';
import { headers } from 'next/headers';
import site from '@/config';
import Chat from './Chat';

export const dynamic = 'force-dynamic';

type SP = Promise<Record<string, string | string[] | undefined>>;

const clean = (v: unknown) =>
  typeof v === 'string' && /^[a-z0-9_-]{1,40}$/i.test(v) ? v.toLowerCase() : undefined;

export const metadata: Metadata = {
  title: site.pageTitle,
  description: `Message ${site.name}`,
  robots: { index: false, follow: false, nocache: true },
};

export default async function Page({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const h = await headers();
  const src = clean(sp.s) ?? clean(sp.utm_source) ?? 'direct';
  const country = (h.get('x-vercel-ip-country') ?? 'unknown').toUpperCase(); // kommt automatisch von Vercel
  // Ziel-Links bleiben auf dem Server – der Browser bekommt sie nie
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { links, ...publicSite } = site;
  return (
    <main className="min-h-dvh">
      <Chat site={publicSite} src={src} country={country} />
    </main>
  );
}
