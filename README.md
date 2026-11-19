# Natalie Brooks – Chat-Funnel (Stil wie ericaquinn.online)

**Alles Inhaltliche steht in `config.ts`** – Texte, Profil, Link, "In den Browser"-Funktion.
Auf GitHub ändern: Datei öffnen → Stift → ändern → Commit. Vercel baut automatisch neu.

## Dateien
- `config.ts` – Name, Bio, Follower, Nachrichten, Tracking-Link, `openInBrowser`
- `public/natalie.jpg` – Profilbild
- `public/brand/fanvue.png` – Logo auf der Link-Karte (optional, sonst grüner Platzhalter)

## Ablauf
1. "natalie brooks is accepting your request…" → nach 2,6 s "accepted"
2. Nach 3,4 s tippt sie die erste Nachricht
3. User schreibt frei – yes/no/sonstiges wird erkannt (reply1, reply2)
4. Ab der 3. Nachricht: Abschluss-Nachricht + Link-Karte → /r/default → Weiterleitung
5. In Instagram/TikTok/Facebook: "One more step" + automatischer Sprung in Safari/Chrome

## In den Browser springen an/aus
`config.ts` → `openInBrowser: true` (an) oder `false` (aus)

## Tracking
- Vercel → Analytics
- `/stats?key=STATS_KEY` (braucht Upstash Redis + Env-Variable STATS_KEY)
