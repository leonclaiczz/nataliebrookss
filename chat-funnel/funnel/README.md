# Chat-Funnel (1:1 Nachbau von ericaquinn.online)

## Wichtigste Dateien
- `models/erica.ts` – alles Inhaltliche: Profil, Nachrichten, Antworten (yes/no/sonstiges), Abschluss-Nachrichten, Ziel-Link-Link, gesperrte Länder, Countdown.
- `public/erica.jpg` – Profilbild
- `public/brand/fanvue.png` – Ziel-Link-Logo (aus dem alten Projekt übernehmen)

## Wie der Chat läuft
1. „erica quinn is accepting your request…“ → nach 2,6 s „accepted“
2. Nach 3,4 s tippt sie die erste Nachricht
3. User schreibt frei. Erkennt yes/no/sonstiges und antwortet passend (reply1, reply2)
4. Ab der 3. Nachricht: Abschluss-Nachricht + Ziel-Link-Karte → `/r/default` → Weiterleitung auf `fanvue.default`
5. Im Instagram/TikTok-Browser erscheint „One more step“ und die Seite versucht, sich im echten Browser zu öffnen

## Tracking
- Vercel → Analytics (Besucher, Länder, Geräte, Events)
- `/stats?key=STATS_KEY` (Funnel, Land, Bundesstaat, Gerät, App, Uhrzeit) – braucht Upstash Redis + Env-Variable `STATS_KEY`
