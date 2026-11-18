import { notFound } from 'next/navigation';
import { models } from '@/models';
import { redis, dayKey } from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

type VC = { view: number; click: number };
const pct = (a: number, b: number) => (b ? `${((a / b) * 100).toFixed(1)}%` : '–');

const th: React.CSSProperties = { textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid #333', whiteSpace: 'nowrap', fontWeight: 600 };
const td: React.CSSProperties = { textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid #222' };
const L: React.CSSProperties = { textAlign: 'left' };

function Breakdown({ title, rows, label }: { title: string; rows: Record<string, VC>; label?: (k: string) => string }) {
  const list = Object.entries(rows).sort((a, b) => b[1].view - a[1].view);
  if (!list.length) return null;
  return (
    <div style={{ minWidth: 260 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>{title}</h3>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead><tr><th style={{ ...th, ...L }}></th><th style={th}>Views</th><th style={th}>Klicks</th><th style={th}>Rate</th></tr></thead>
        <tbody>
          {list.slice(0, 15).map(([k, x]) => (
            <tr key={k}><td style={{ ...td, ...L }}>{label ? label(k) : k}</td><td style={td}>{x.view}</td><td style={td}>{x.click}</td><td style={td}>{pct(x.click, x.view)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function Stats({ searchParams }: { searchParams: Promise<{ key?: string; days?: string }> }) {
  const { key, days: d } = await searchParams;
  if (!process.env.STATS_KEY || key !== process.env.STATS_KEY) notFound();
  if (!redis) return <pre style={{ padding: 20 }}>Kein Redis verbunden – siehe README.</pre>;

  const DAYS = Math.min(90, Math.max(1, Number(d) || 14));
  const days = Array.from({ length: DAYS }, (_, i) => new Date(Date.now() - i * 864e5).toISOString().slice(0, 10));

  const data = await Promise.all(
    models.map(async (m) => {
      const rows = await Promise.all(
        days.map(async (day) => ({ day, h: ((await redis!.hgetall(dayKey(m.id, day))) ?? {}) as Record<string, number> }))
      );
      const waits = m.flow.filter((s) => 'wait' in s).length;
      const groups: Record<string, Record<string, VC>> = { source: {}, country: {}, state: {}, os: {}, app: {}, hour: {} };
      const totals = { view: 0, click: 0, cta: 0, answers: Array(waits).fill(0) as number[] };

      for (const { h } of rows) {
        totals.view += Number(h.view ?? 0);
        totals.click += Number(h.click ?? 0);
        totals.cta += Number(h.cta ?? 0);
        for (let i = 0; i < waits; i++) totals.answers[i] += Number(h[`a${i + 1}`] ?? 0);
        for (const [f, v] of Object.entries(h)) {
          let g: string, k: string, ev: string;
          if (f.startsWith('#')) [g, k, ev] = f.slice(1).split(':');
          else { const parts = f.split(':'); if (parts.length !== 2) continue; g = 'source'; [k, ev] = parts; }
          if (ev !== 'view' && ev !== 'click') continue;
          groups[g] ??= {};
          groups[g][k] ??= { view: 0, click: 0 };
          groups[g][k][ev] += Number(v);
        }
      }
      return { m, rows, waits, groups, totals };
    })
  );

  return (
    <main style={{ padding: 20, fontFamily: 'system-ui', color: '#eee', background: '#111', minHeight: '100vh', fontSize: 14 }}>
      <p style={{ color: '#888', marginBottom: 20 }}>
        Zeitraum: letzte {DAYS} Tage · ändern mit <code>&amp;days=30</code> · Uhrzeiten in UTC (US-Ostküste = UTC−5)
      </p>
      {data.map(({ m, rows, waits, groups, totals }) => (
        <section key={m.id} style={{ marginBottom: 48 }}>
          <h2 style={{ marginBottom: 12 }}>{m.name}</h2>

          {/* Funnel gesamt */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {[
              ['Besucher', totals.view],
              ...totals.answers.map((a, i) => [`Antwort ${i + 1}`, a] as [string, number]),
              ['Karte gesehen', totals.cta],
              ['Klicks', totals.click],
            ].map(([l, v]) => (
              <div key={l as string} style={{ background: '#1b1b1f', padding: '10px 14px', borderRadius: 10, minWidth: 110 }}>
                <div style={{ color: '#888', fontSize: 12 }}>{l}</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{v as number}</div>
                <div style={{ color: '#888', fontSize: 12 }}>{pct(v as number, totals.view)}</div>
              </div>
            ))}
          </div>

          {/* Zielgruppe */}
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 28 }}>
            <Breakdown title="Quelle (Subdomain)" rows={groups.source} />
            <Breakdown title="Land" rows={groups.country} />
            <Breakdown title="US-Bundesstaat" rows={groups.state} />
            <Breakdown title="Gerät" rows={groups.os} />
            <Breakdown title="Geöffnet in" rows={groups.app} />
            <Breakdown title="Uhrzeit (UTC)" rows={groups.hour} label={(k) => `${k}:00`} />
          </div>

          {/* Pro Tag */}
          <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>Pro Tag</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...th, ...L }}>Tag</th><th style={th}>Views</th>
                  {Array.from({ length: waits }, (_, i) => <th key={i} style={th}>Antwort {i + 1}</th>)}
                  <th style={th}>Karte</th><th style={th}>Klicks</th><th style={th}>View→Klick</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ day, h }) => {
                  const v = Number(h.view ?? 0), c = Number(h.click ?? 0);
                  return (
                    <tr key={day}>
                      <td style={{ ...td, ...L }}>{day}</td><td style={td}>{v}</td>
                      {Array.from({ length: waits }, (_, i) => <td key={i} style={td}>{Number(h[`a${i + 1}`] ?? 0)}</td>)}
                      <td style={td}>{Number(h.cta ?? 0)}</td><td style={td}>{c}</td><td style={td}>{pct(c, v)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </main>
  );
}
