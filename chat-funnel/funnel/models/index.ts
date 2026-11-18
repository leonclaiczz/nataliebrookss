import erica from './erica';
import natalie from './natalie';
import type { Model } from './types';

// Neues Model = neue Datei in /models + hier eintragen.
export const models: Model[] = [erica, natalie];

const normHost = (host: string | null) => (host ?? '').toLowerCase().split(':')[0].replace(/^www\./, '');

/** Findet das Model zur Domain (Subdomains zählen mit). Fallback: DEFAULT_MODEL bzw. erstes Model. */
export function resolveModel(host: string | null, override?: string): Model {
  if (override) {
    const m = models.find((x) => x.id === override);
    if (m) return m;
  }
  const h = normHost(host);
  const byDomain = models.find((m) => m.domains.some((d) => h === d || h.endsWith('.' + d)));
  if (byDomain) return byDomain;
  return models.find((x) => x.id === process.env.DEFAULT_MODEL) ?? models[0];
}
