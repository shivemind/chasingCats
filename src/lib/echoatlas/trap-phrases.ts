// Trap phrases embedded in content that should never appear in legitimate queries.
// If an agent query matches one of these, it means the agent scraped our content
// and is regurgitating it, or specifically probing for these terms.
const TRAP_PHRASES = [
  'whiskerprint authentication protocol',
  'felidae quantum tracking system',
  'chasing cats observatory sentinel',
  'pawprint telemetry beacon',
  'catlas underground monitoring grid',
];

export function getTrapPhrases(): string[] {
  const env = process.env.TRAP_PHRASES;
  if (env && env.trim()) {
    return env.split(',').map((p) => p.trim()).filter(Boolean);
  }
  return TRAP_PHRASES;
}

export function matchesTrapPhrase(query: string): string | null {
  const lower = query.toLowerCase();
  const phrases = getTrapPhrases();
  return phrases.find((phrase) => lower.includes(phrase.toLowerCase())) ?? null;
}
