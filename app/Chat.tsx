'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { track as vaTrack } from '@vercel/analytics';
import { ArrowUp, Calendar, Check, ChevronLeft, EllipsisVertical, LoaderCircle, Lock, Phone, Users, Video } from 'lucide-react';
import type { PublicSite } from '@/config';

function cn(...a: ClassValue[]) {
  return twMerge(clsx(a));
}

type Msg = { id: number; role: 'nina' | 'me'; text: string; time: string; link?: string };

const YES = ['yes', 'yeah', 'yep', 'yup', 'sure', 'ja', 'jep', 'mhm', 'ofc', 'definitely'];
const NO = ['no', 'nope', 'nah', 'nein', 'not', 'noo'];

const IN_APP = /Instagram|FBAV|FBAN|FBIOS|TikTok|musical_ly|Snapchat|Threads|FB_IAB/i;
const ANDROID = /Android/i;
const IOS = /iPhone|iPad|iPod/i;

const now = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

/** iOS: versucht nacheinander Safari, Chrome, Firefox, Edge zu öffnen */
function openExternalIOS(url: string) {
  const urls = [
    url.replace(/^https?:\/\//, 'x-safari-https://'),
    url.replace(/^https?:\/\//, 'googlechrome://'),
    `firefox://open-url?url=${encodeURIComponent(url)}`,
    url.replace(/^https?:\/\//, 'microsoft-edge-https://'),
  ];
  let i = 0;
  const next = () => {
    if (i >= urls.length) return;
    window.location.href = urls[i++];
    window.setTimeout(next, 400);
  };
  next();
}
const openAndroid = (url: string) => {
  window.location.href = `intent:${url}#Intent;action=android.intent.action.VIEW;end;`;
};

function OnlineDot() {
  return (
    <span className="online-pop relative inline-flex size-2.5">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75" />
      <span className="relative inline-flex size-2.5 rounded-full bg-green-500" />
    </span>
  );
}

function AcceptNotice({ name }: { name: string }) {
  const [accepted, setAccepted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setAccepted(true), 2600);
    return () => window.clearTimeout(t);
  }, []);
  const n = name.toLowerCase();
  return (
    <div className="mt-4 flex justify-center text-xs text-muted-foreground">
      {accepted ? (
        <span className="accept-pop flex items-center gap-1.5">
          <Check className="size-3.5 text-green-500" />
          {n} accepted your message request
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <LoaderCircle className="size-3.5 animate-spin" />
          {n} is accepting your request…
        </span>
      )}
    </div>
  );
}

function CallModal({ modal, name, onClose }: { modal: 'voice' | 'video' | null; name: string; onClose: () => void }) {
  if (!modal) return null;
  const voice = modal === 'voice';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" onClick={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        className="sheet-in w-full max-w-xs rounded-2xl border border-border bg-card p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-card-foreground">{voice ? 'Voice calls unavailable' : 'Video calls unavailable'}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {voice ? `${name} has disabled voice calls.` : `${name} has disabled video calls.`}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          OK
        </button>
      </div>
    </div>
  );
}

function Bubble({ m, countdownLabel, onLink }: { m: Msg; countdownLabel: string | null; onLink: (href: string) => void }) {
  const nina = m.role === 'nina';
  return (
    <div className={cn('flex flex-col', nina ? 'items-start' : 'items-end')}>
      <div
        className={cn(
          'max-w-[78%] px-4 py-2.5 text-[15px] leading-relaxed md:max-w-xl',
          nina ? 'rounded-2xl rounded-bl-md bg-[#2b2735] text-white' : 'rounded-2xl rounded-br-md bg-white text-black'
        )}
      >
        {m.text}
      </div>
      {m.link && (
        <>
          {countdownLabel && (
            <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-[11px] font-semibold text-red-400">
              {countdownLabel}
            </span>
          )}
          <button
            type="button"
            onClick={() => onLink(m.link!)}
            className="mt-1.5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-2 pl-2 pr-5 text-left transition-colors hover:bg-white/10"
          >
            <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#3ee06e]">
              {/* Platzhalter, falls /public/brand/fanvue.png fehlt */}
              <svg viewBox="0 0 24 24" className="size-6"><path d="M5 19 13 5h6l-4 6h4L9 19l2-5H8z" fill="#0b0c10" /></svg>
              <img
                src="/brand/fanvue.png"
                alt=""
                width={40}
                height={40}
                className="absolute inset-0 size-10 rounded-xl"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-sm font-semibold text-white">Fanvue</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">fanvue.com</span>
            </span>
          </button>
        </>
      )}
      <span className="mt-1 px-1 text-[11px] text-muted-foreground">{m.time}</span>
    </div>
  );
}

export default function Chat({ site, src, country }: { site: PublicSite; src: string; country: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [active, setActive] = useState(true);
  const [lastSeen, setLastSeen] = useState<number | null>(null);
  const [, setTick] = useState(0);
  const [modal, setModal] = useState<'voice' | 'video' | null>(null);
  const [breakout, setBreakout] = useState(false);
  const [secsLeft, setSecsLeft] = useState<number | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  const idRef = useRef(1);
  const stepRef = useRef(0);
  const closingRef = useRef(0);
  const sentRef = useRef(0);
  const feedRef = useRef<HTMLDivElement>(null);

  const blocked = site.blockedCountries.includes(country);
  const linkKey = site.countryLinks[country] || site.linkKey;
  const linkHref = `/r/${linkKey}`;

  const track = (e: string) => {
    const body = JSON.stringify({ m: site.id, e, s: src });
    try {
      if (!navigator.sendBeacon?.('/api/px', body)) fetch('/api/px', { method: 'POST', body, keepalive: true });
      if (e !== 'view') vaTrack(e, { model: site.id, source: src });
    } catch {}
  };

  // Seitenaufruf
  useEffect(() => {
    track('view');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Instagram / TikTok / Facebook In-App-Browser → im echten Browser öffnen
  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(IOS.test(ua));
    if (!site.openInBrowser || !IN_APP.test(ua)) return;
    track('breakout');
    setBreakout(true);
    let t: number | undefined;
    if (ANDROID.test(ua)) t = window.setTimeout(() => openAndroid(window.location.href), 600);
    else if (IOS.test(ua)) t = window.setTimeout(() => openExternalIOS(window.location.href), 800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rabatt-Countdown (optional)
  useEffect(() => {
    if (!site.countdown) return;
    const end = Date.now() + site.countdown.minutes * 60_000;
    const i = window.setInterval(() => setSecsLeft(Math.max(0, Math.round((end - Date.now()) / 1000))), 1000);
    return () => window.clearInterval(i);
  }, [site.countdown]);
  const countdownLabel =
    site.countdown && secsLeft !== null && secsLeft > 0
      ? `${site.countdown.percentOff}% off — ends in ${Math.floor(secsLeft / 60)}:${String(secsLeft % 60).padStart(2, '0')}`
      : null;

  // "last seen" jede Sekunde aktualisieren
  useEffect(() => {
    if (active || !lastSeen) return;
    const i = window.setInterval(() => setTick((x) => x + 1), 1000);
    return () => window.clearInterval(i);
  }, [active, lastSeen]);

  const status =
    active && site.showAvailableNow ? (
      <span className="flex items-center gap-1.5 text-xs text-green-500">
        <OnlineDot />
        Active now
      </span>
    ) : (
      <span className="text-xs text-muted-foreground">
        {active || !lastSeen
          ? 'last seen 5min ago'
          : (() => {
              const s = Math.floor((Date.now() - lastSeen) / 1000);
              return s < 5 ? 'last seen just now' : s < 60 ? 'last seen a few seconds ago' : `last seen ${Math.floor(s / 60)}min ago`;
            })()}
      </span>
    );

  /** Sie antwortet: nach `delay` ms fängt sie an zu tippen, Tippdauer hängt von der Textlänge ab */
  const reply = (text: string, withLink = true, delay = 2500) => {
    window.setTimeout(() => {
      setActive(true);
      setTyping(true);
    }, delay);
    const typingMs = 1000 + Math.min(25 * text.length, 1500);
    window.setTimeout(() => {
      setTyping(false);
      setActive(false);
      setLastSeen(Date.now());
      setMsgs((x) => [...x, { id: idRef.current++, role: 'nina', text, time: now(), link: withLink ? linkHref : undefined }]);
      if (withLink) track('cta');
    }, delay + typingMs);
  };

  // Erste Nachricht nach 3,4 s
  useEffect(() => {
    const t = window.setTimeout(() => reply(site.firstMessage, false, 0), 3400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMsgs((x) => [...x, { id: idRef.current++, role: 'me', text, time: now() }]);
    sentRef.current += 1;
    if (sentRef.current <= 3) track(`a${sentRef.current}`);

    const t = text.toLowerCase();
    const yes = YES.some((w) => t.includes(w));
    const no = !yes && NO.some((w) => t.includes(w));
    const pick = (r: { yes: string; no: string; other: string }) => (yes ? r.yes : no ? r.no : r.other);

    if (stepRef.current === 0) {
      stepRef.current = 1;
      reply(pick(site.reply1), false);
    } else if (stepRef.current === 1) {
      stepRef.current = 2;
      reply(pick(site.reply2), false);
    } else {
      const c = site.closings[closingRef.current % site.closings.length];
      closingRef.current += 1;
      reply(c, true);
    }
  };

  const openLink = (href: string) => {
    track('click');
    const u = new URL(href, window.location.origin);
    u.searchParams.set('c', country);
    u.searchParams.set('p', site.id);
    window.open(`${u.pathname}${u.search}`, '_blank', 'noopener,noreferrer');
  };

  const today = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }), []);

  if (blocked) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-[#0c0a12] p-6 text-center">
        <p className="text-sm text-muted-foreground">This content is not available in your region.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full justify-center sm:items-center sm:p-4 lg:p-8">
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-gradient-to-b from-[#0c0a12] via-[#14101d] to-[#0c0a12] sm:h-[calc(100dvh-2rem)] sm:rounded-3xl sm:border sm:border-white/10 sm:shadow-2xl lg:h-[calc(100dvh-4rem)]">
        <header className="flex items-center gap-3 border-b border-white/5 px-3 py-3">
          <button type="button" aria-label="Back" className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
            <ChevronLeft className="size-5" />
          </button>
          <img src={site.avatar} alt={site.name} width={36} height={36} className="size-9 shrink-0 rounded-full border border-white/10 object-cover" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate font-semibold">{site.name}</p>
            {status}
          </div>
          <button type="button" aria-label="Voice call" onClick={() => setModal('voice')} className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
            <Phone className="size-5" />
          </button>
          <button type="button" aria-label="Video call" onClick={() => setModal('video')} className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
            <Video className="size-5" />
          </button>
          <button type="button" aria-label="More" className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
            <EllipsisVertical className="size-5" />
          </button>
        </header>

        <section className="flex flex-col items-center border-b border-white/5 px-4 pb-3 pt-4 text-center">
          <h1 className="font-semibold" style={{ fontSize: site.nameSizePx }}>
            {site.name}
          </h1>
          <p className="text-xs text-muted-foreground">{site.handle}</p>
          {site.bio && <p className="mt-1.5 max-w-xs text-xs text-muted-foreground">{site.bio}</p>}
          <div className="mt-1">{status}</div>
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              Member since {site.memberSince}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {site.followers} followers
            </span>
            {site.smartLocation && <span>{site.smartLocation}</span>}
          </div>
          <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Lock className="size-3" />
            Messages are end-to-end encrypted
          </p>
        </section>

        <div ref={feedRef} className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
          <div className="flex justify-center pt-3">
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-muted-foreground">{today}</span>
          </div>
          <AcceptNotice name={site.name} />
          {msgs.map((m) => (
            <Bubble key={m.id} m={m} countdownLabel={m.link ? countdownLabel : null} onLink={openLink} />
          ))}
          {typing && (
            <div className="flex items-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-[#2b2735] px-4 py-3">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
        </div>

        <form className="flex items-center gap-2 border-t border-white/5 p-3" onSubmit={send}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message…"
            aria-label="Send a message"
            className="min-w-0 flex-1 rounded-full bg-white/5 px-4 py-2.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-fuchsia-500/30"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!input.trim()}
            style={input.trim() ? { background: site.accent } : undefined}
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-full transition-opacity',
              input.trim() ? 'text-white hover:opacity-90' : 'bg-white/5 text-muted-foreground'
            )}
          >
            <ArrowUp className="size-5" />
          </button>
        </form>

        <CallModal modal={modal} name={site.name} onClose={() => setModal(null)} />
      </div>

      {breakout && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0c0a12] p-6">
          <div className="sheet-in w-full max-w-sm text-center">
            <h2 className="text-xl font-bold text-white">One more step</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{site.breakoutText}</p>
            <button
              type="button"
              onClick={() => {
                const href = window.location.href;
                if (ANDROID.test(navigator.userAgent)) openAndroid(href);
                else if (IOS.test(navigator.userAgent)) openExternalIOS(href);
                else window.open(href, '_blank', 'noopener,noreferrer');
              }}
              className="mt-6 w-full rounded-2xl py-3 text-sm font-semibold text-white"
              style={{ background: site.accent }}
            >
              {isIOS ? 'Open in another browser' : 'Open in browser'}
            </button>
            <p className="mt-4 text-[11px] text-muted-foreground">
              {isIOS
                ? 'Nothing happened? No other browser is installed — tap ⋯ (top right) and choose "Open in browser" to continue in Safari.'
                : 'Nothing happens? Tap ⋯ or the share icon in the app\'s browser and choose "Open in browser".'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
