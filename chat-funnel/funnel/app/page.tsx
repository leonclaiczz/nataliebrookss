import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { resolveModel } from '@/models';
import Chat from './Chat';

export const dynamic = 'force-dynamic';

type SP = Promise<Record<string, string | string[] | undefined>>;

const clean = (v: unknown) =>
  typeof v === 'string' && /^[a-z0-9_-]{1,40}$/i.test(v) ? v.toLowerCase() : undefined;

async function load(searchParams: SP) {
  const sp = await searchParams;
  const h = await headers();
  const model = resolveModel(h.get('host'), clean(sp.m));
  const src = clean(sp.s) ?? clean(sp.utm_source) ?? 'direct';
  // Kein Ziel-Link im HTML: die Seite zeigt nur auf /go/<key>, der Server leitet weiter.
  const key = model.links[src] ? src : 'default';
  const link = `/go/${key}`;
  return { model, src, link };
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { model } = await load(searchParams);
  return {
    title: model.pageTitle ?? model.name,
    description: `Message ${model.name}`,
    robots: { index: false, follow: false },
    openGraph: { title: model.name, images: [model.avatar] },
  };
}

export default async function Page({ searchParams }: { searchParams: SP }) {
  const { model, src, link } = await load(searchParams);
  // Ziel-Links bleiben auf dem Server – der Browser bekommt sie nie zu sehen
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { links, ...publicModel } = model;
  return <Chat model={publicModel} src={src} link={link} />;
}
