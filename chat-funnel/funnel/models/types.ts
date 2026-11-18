export type LinkCard = {
  title: string;
  /** Angezeigte Adresse unter dem Titel */
  domain: string;
  /** Vorschaubild oben in der Karte (aus /public) */
  image?: string;
  /** Text auf dem Button in der Karte */
  button?: string;
};

export type Step =
  /** old: true = steht schon beim Laden da (ohne Tippen, mit älterer Uhrzeit) */
  | { say: string; old?: boolean }
  | { image: string }
  /** Wartet, bis der User irgendwas schreibt. Egal was – es geht weiter. */
  | { wait: true }
  /** Große Link-Karte; ab hier wird unten der CTA-Button statt dem Eingabefeld gezeigt */
  | { link: LinkCard };

export type Model = {
  /** kurz, nur a-z/0-9 – wird im Tracking verwendet */
  id: string;
  name: string;
  handle: string;
  /** Bild in /public, z.B. "/erica.jpg" */
  avatar: string;
  /** Tab-Titel */
  pageTitle?: string;
  /** Profil-Kopf */
  bio?: string;
  memberSince?: string;
  followers?: string;
  country?: string;
  encryptedNote?: boolean;
  /** Text auf dem großen Button unten, sobald die Link-Karte da ist */
  ctaBar: string;
  /** Domains, auf denen dieses Model ausgeliefert wird (ohne www) */
  domains: string[];
  /**
   * Ziel-Links (dein Tracking-Link). Die Seite verlinkt nie direkt darauf,
   * sondern auf /go/<key>. Erst der Server leitet weiter. "default" ist Pflicht.
   */
  links: { default: string; [key: string]: string };
  flow: Step[];
};
