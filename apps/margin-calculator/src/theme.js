// Single source of truth for palette — mirrors the CSS vars in index.css and the site.
// Used by the hand-rolled SVG chart so it stays on-palette with the rest of the portfolio.
export const C = {
  cream: '#FAF8F3',
  warmWhite: '#FFFEF9',
  ink: '#1C1A17',
  inkSoft: '#4A4640',
  inkMuted: '#8A8680',
  accent: '#C4622A',
  accentSoft: '#F5EAE2',
  line: 'rgba(28,26,23,0.1)',
  pos: '#4E7C59',
  posSoft: '#E7EFE8',
  warn: '#B5792A',
  warnSoft: '#F6EEDD',
  neg: '#B23A2A',
  negSoft: '#F5E6E2',
}

// Verdict band for a gross-margin percentage.
export function verdict(margin) {
  if (margin < 0) return { band: 'neg', color: C.neg, soft: C.negSoft, label: 'Underwater' }
  if (margin < 40) return { band: 'warn', color: C.warn, soft: C.warnSoft, label: 'Thin' }
  return { band: 'pos', color: C.pos, soft: C.posSoft, label: 'Healthy' }
}
