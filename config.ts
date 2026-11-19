// ============================================================
//  ALLES, WAS DU ÄNDERN WILLST, STEHT IN DIESER DATEI.
//  Auf GitHub: Datei öffnen → Stift-Symbol → ändern → "Commit changes".
//  Vercel baut die Seite danach automatisch neu (ca. 1 Minute).
// ============================================================

const site = {
  id: 'natalie', // nur a-z, wird im Tracking benutzt
  name: 'Natalie Brooks',
  handle: '@nataliebrooks',
  avatar: '/natalie.jpg', // Profilbild in /public
  pageTitle: '(1) Chat with Natalie Brooks', // Tab-Titel

  /* ---------- Profil-Kopf ---------- */
  nameSizePx: 24,
  bio: 'your favorite girl next door',
  memberSince: 'May 2024',
  followers: '6,742',
  smartLocation: 'USA', // leer lassen ('') zum Ausblenden
  showAvailableNow: true, // grüner "Active now"-Punkt, während sie schreibt
  accent: '#c2703e', // Farbe Senden-Button + "Open in browser"-Button

  /* ---------- Chat ---------- */
  firstMessage: 'did you find me on instagram? 😂',
  // Antwort auf die 1. Nachricht des Users – je nachdem ob er ja / nein / etwas anderes schreibt
  reply1: {
    yes: 'ha, i knew it. like what you saw?',
    no: 'lmao no? then how did you even end up here. like what you saw though?',
    other: 'haha okay. like what you saw though?',
  },
  // Antwort auf die 2. Nachricht
  reply2: {
    yes: 'thought so. want to see more?',
    no: 'bruh. want to see more anyway?',
    other: 'hmm okay. want to see more though?',
  },
  // Ab der 3. Nachricht: eine davon (der Reihe nach) + Link-Karte
  closings: [
    "glad you think so. been a busy day over here. i'm almost never on here, but on fanvue i answer every single day.",
    "thanks, that's sweet of you. i have to run in a sec. message me on fanvue instead, i never miss a message there.",
    "that sounds really nice. i'm out and about right now, so i can only reply briefly here. on fanvue i'm online every day.",
    "you're welcome. i'm taking care of a few things right now. i'm online later on fanvue and answer everything personally.",
    "how sweet of you. i barely ever write back here though. on fanvue i'm around every day and always reply.",
  ],

  /* ---------- Link ---------- */
  // Die Seite verlinkt nie direkt hierauf, sondern auf /r/default.
  // Erst der Server leitet weiter – der Link steht nicht im Seiten-Code.
  links: {
    default: 'https://www.fanvue.com/nataliebrookss_/fv-14',
  } as Record<string, string> & { default: string },
  linkKey: 'default',
  countryLinks: {} as Record<string, string>, // z.B. { DE: 'eu' } für einen anderen Link pro Land
  blockedCountries: [] as string[], // z.B. ['IN', 'PK'] → "not available in your region"
  countdown: null as { minutes: number; percentOff: number } | null, // z.B. { minutes: 15, percentOff: 50 }

  /* ---------- Raus aus Instagram ---------- */
  // true  = Wer die Seite in Instagram/TikTok/Facebook öffnet, wird in Safari/Chrome weitergeleitet
  // false = Seite bleibt im Instagram-Browser
  openInBrowser: true,
  breakoutText: 'You are almost there. For the full experience open this page in your browser.',
};

export type Site = typeof site;
export type PublicSite = Omit<Site, 'links'>;
export default site;
