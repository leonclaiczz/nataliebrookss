import { redis, dayKey } from '@/lib/redis';

const ok = (v: unknown) => typeof v === 'string' && /^[a-z0-9_-]{1,40}$/i.test(v);

function device(ua: string) {
  const u = ua.toLowerCase();
  const os = /iphone|ipad|ipod/.test(u) ? 'ios' : /android/.test(u) ? 'android' : /mac os|windows|linux/.test(u) ? 'desktop' : 'other';
  const app = /instagram/.test(u) ? 'instagram' : /fban|fbav|facebook/.test(u) ? 'facebook' : /tiktok|musical_ly|bytedance/.test(u) ? 'tiktok' : /snapchat/.test(u) ? 'snapchat' : 'browser';
  return { os, app };
}

export async function POST(req: Request) {
  try {
    const { m, e, s } = JSON.parse(await req.text());
    if (!ok(m) || !ok(e)) return new Response(null, { status: 204 });
    const src = ok(s) ? s : 'direct';
    const now = new Date();
    const day = now.toISOString().slice(0, 10);

    // Von Vercel automatisch mitgeliefert
    const country = (req.headers.get('x-vercel-ip-country') ?? 'XX').toUpperCase().slice(0, 2);
    const region = (req.headers.get('x-vercel-ip-country-region') ?? '').toUpperCase().slice(0, 4);
    const { os, app } = device(req.headers.get('user-agent') ?? '');
    const hour = String(now.getUTCHours()).padStart(2, '0');

    if (redis) {
      const key = dayKey(m, day);
      const p = redis.pipeline();
      p.hincrby(key, e, 1);
      p.hincrby(key, `${src}:${e}`, 1);
      // Zielgruppen-Daten nur für Aufrufe & Klicks
      if (e === 'view' || e === 'click') {
        p.hincrby(key, `#country:${country}:${e}`, 1);
        if (country === 'US' && region) p.hincrby(key, `#state:${region}:${e}`, 1);
        p.hincrby(key, `#os:${os}:${e}`, 1);
        p.hincrby(key, `#app:${app}:${e}`, 1);
        p.hincrby(key, `#hour:${hour}:${e}`, 1);
      }
      p.expire(key, 60 * 60 * 24 * 120);
      await p.exec();
    } else {
      console.log('[px]', JSON.stringify({ m, e, src, day, country, region, os, app, hour }));
    }
  } catch {}
  return new Response(null, { status: 204 });
}
