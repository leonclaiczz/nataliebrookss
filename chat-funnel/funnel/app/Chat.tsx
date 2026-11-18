'use client';

import { useEffect, useRef, useState } from 'react';
import type { Model, LinkCard } from '@/models/types';
import { track as vaTrack } from '@vercel/analytics';

type Msg = { from: 'bot' | 'me'; text?: string; image?: string; link?: LinkCard; time: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
// Realistisches Timing: erst "lesen/überlegen", dann tippen (abhängig von der Länge)
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const typingTime = (t: string) => Math.min(5500, Math.max(1800, 1200 + t.length * 45));
const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
const now = () => fmt(new Date());

/* Icons */
const I = {
  back: <path d="m15 18-6-6 6-6" />,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />,
  video: <><path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11" /><rect x="2" y="6" width="14" height="12" rx="2" /></>,
  more: <><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></>,
  cal: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  up: <path d="M12 19V5M5 12l7-7 7 7" />,
  ext: <path d="M7 17 17 7M8 7h9v9" />,
  check: <path d="M20 6 9 17l-5-5" />,
};
const Icon = ({ i, s = 18 }: { i: keyof typeof I; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {I[i]}
  </svg>
);
const PvTile = ({ s = 36 }: { s?: number }) => (
  <span className="pv" style={{ width: s, height: s }}>
    <svg viewBox="0 0 24 24" width={s * 0.55} height={s * 0.55} fill="#fff"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2 0 3.4 1.1 4.2 2.3h2.4c.8-1.2 2.2-2.3 4.2-2.3 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21z" /></svg>
  </span>
);

export default function Chat({ model, src, link }: { model: Omit<Model, 'links'>; src: string; link: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [draft, setDraft] = useState('');
  const [connected, setConnected] = useState(false);
  const resume = useRef<(() => void) | null>(null);
  const feed = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const track = (e: string) => {
    const body = JSON.stringify({ m: model.id, e, s: src });
    try {
      if (!navigator.sendBeacon?.('/api/px', body)) fetch('/api/px', { method: 'POST', body, keepalive: true });
      // zusätzlich in Vercel Analytics (Custom Events, Pro-Plan); "view" zählt Vercel selbst
      if (e !== 'view') vaTrack(e, { model: model.id, source: src });
    } catch {}
  };

  useEffect(() => {
    const el = feed.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing, showCta]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    track('view');

    const push = (m: Omit<Msg, 'time'>, time = now()) => setMsgs((x) => [...x, { ...m, time }]);
    const say = async (text: string, pre = rand(1200, 2600)) => {
      await sleep(pre); // überlegt kurz, bevor sie anfängt zu tippen
      setTyping(true);
      await sleep(typingTime(text));
      setTyping(false);
      push({ from: 'bot', text });
      await sleep(rand(500, 1100));
    };

    (async () => {
      // Verbindungsaufbau, dann nach ~0,5 s fängt sie an zu tippen
      await sleep(1600);
      setConnected(true);
      let q = 0;
      let first = true;
      for (const step of model.flow) {
        if ('say' in step) {
          if (step.old) {
            push({ from: 'bot', text: step.say }, fmt(new Date(Date.now() - (15 + Math.random() * 25) * 6e4)));
          } else {
            await say(step.say, first ? 500 : undefined);
          }
          first = false;
        } else if ('image' in step) {
          setTyping(true);
          await sleep(1300);
          setTyping(false);
          push({ from: 'bot', image: step.image });
        } else if ('wait' in step) {
          q++;
          await new Promise<void>((res) => {
            resume.current = res;
            setWaiting(true);
          });
          track(`a${q}`);
          await sleep(rand(1500, 3500)); // "liest" die Antwort
        } else if ('link' in step) {
          await sleep(rand(1500, 2500));
          push({ from: 'bot', link: step.link });
          setShowCta(true);
          track('cta');
          await sleep(900);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t) return;
    setMsgs((x) => [...x, { from: 'me', text: t, time: now() }]);
    setDraft('');
    const r = resume.current;
    if (r) {
      resume.current = null;
      setWaiting(false);
      r();
    }
  };

  const go = () => track('click');

  return (
    <div className="shell">
      <main className="app">
        <header className="top">
          <button className="ib" aria-label="Back"><Icon i="back" /></button>
          <span className="avawrap">
            <img className="ava" src={model.avatar} alt={model.name} />
            <span className="odot" />
          </span>
          <div className="who">
            <div className="name">{model.name}</div>
            <div className="seen">last seen a few seconds ago</div>
          </div>
          <div className="acts">
            <button className="ib" aria-label="Call"><Icon i="phone" /></button>
            <button className="ib" aria-label="Video"><Icon i="video" /></button>
            <button className="ib" aria-label="More"><Icon i="more" /></button>
          </div>
        </header>

        <div className="feed" ref={feed}>
          <section className="prof">
            <h1>{model.name}</h1>
            <div className="h">@{model.handle}</div>
            {model.bio && <div className="bio">{model.bio}</div>}
            <div className="bio">last seen a few seconds ago</div>
            <div className="meta">
              {model.memberSince && <span><Icon i="cal" s={13} />Member since {model.memberSince}</span>}
              {model.followers && <span><Icon i="users" s={13} />{model.followers} followers</span>}
              {model.country && <span>{model.country}</span>}
            </div>
            {model.encryptedNote && (
              <div className="enc"><Icon i="lock" s={12} />Messages are end-to-end encrypted</div>
            )}
          </section>

          <section className="msgs">
            <div className="sys">
              {connected ? (
                <span className="sys-ok"><Icon i="check" s={13} />connected with {model.name.toLowerCase()}</span>
              ) : (
                <span><span className="spin" />connecting to {model.name.toLowerCase()}…</span>
              )}
            </div>
            {msgs.map((m, i) => (
              <div key={i} className={`row ${m.from}`}>
                {m.link ? (
                  <a className="card" href={link} onClick={go}>
                    {m.link.image && (
                      <span className="cimg">
                        <img src={m.link.image} alt="" />
                        <span className="live">● online now</span>
                      </span>
                    )}
                    <span className="cbody">
                      <PvTile />
                      <span className="ctxt">
                        <b>{m.link.title}</b>
                        <small>{m.link.domain}</small>
                      </span>
                      <span className="cbtn">{m.link.button ?? 'Open'}<Icon i="ext" s={14} /></span>
                    </span>
                  </a>
                ) : m.image ? (
                  <div className="pic"><img src={m.image} alt="" /></div>
                ) : (
                  <div className="bubble">{m.text}</div>
                )}
                <time>{m.time}</time>
              </div>
            ))}
            {typing && (
              <div className="row bot">
                <div className="bubble typing"><i /><i /><i /></div>
              </div>
            )}
          </section>
        </div>

        <footer className="bar">
          {showCta ? (
            <a className="ctabar" href={link} onClick={go}>
              <PvTile s={28} />
              <span>{model.ctaBar}</span>
            </a>
          ) : (
            <form className="input" onSubmit={send}>
              <input
                className={waiting ? 'hint' : ''}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Send a message..."
                enterKeyHint="send"
                autoComplete="off"
              />
              <button type="submit" className={`send ${draft.trim() ? 'on' : ''}`} aria-label="Send">
                <Icon i="up" s={16} />
              </button>
            </form>
          )}
        </footer>
      </main>
    </div>
  );
}
