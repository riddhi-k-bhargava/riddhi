// Business-goal presets. Each pre-fills token usage, call volume, price, and a default model.
// Token/volume/price figures are illustrative starting points, not measured production numbers.
export const PRESETS = [
  { label: 'Deflect support tickets with a self-serve AI assistant', inTok: 3000, outTok: 400, calls: 60, price: 8, model: 'sonnet-4.6' },
  { label: 'Lift conversion with AI product recommendations', inTok: 2000, outTok: 300, calls: 200, price: 5, model: 'haiku-4.5' },
  { label: 'Scale outbound with an AI SDR that drafts personalized outreach', inTok: 4000, outTok: 800, calls: 150, price: 40, model: 'sonnet-4.6' },
  { label: 'Speed procurement with automated contract review', inTok: 25000, outTok: 2000, calls: 20, price: 50, model: 'opus-4.8' },
  { label: 'Run an agentic market-research analyst', inTok: 12000, outTok: 2000, calls: 500, price: 49, model: 'gpt-5.5' },
  { label: 'Summarize meetings and extract action items', inTok: 15000, outTok: 800, calls: 40, price: 12, model: 'sonnet-4.6' },
  { label: 'Flag fraud and risk anomalies in real time', inTok: 1500, outTok: 200, calls: 1000, price: 6, model: 'haiku-4.5' },
  { label: 'Ship an in-app AI copilot for a SaaS product', inTok: 5000, outTok: 1000, calls: 120, price: 15, model: 'sonnet-4.6' },
  { label: 'Auto-moderate marketplace listings for policy compliance', inTok: 2500, outTok: 300, calls: 400, price: 10, model: 'haiku-4.5' },
  { label: 'Generate marketing copy and content at scale', inTok: 1500, outTok: 2000, calls: 80, price: 20, model: 'gpt-5.4' },
]

// Default to the agentic analyst — it renders underwater on GPT-5.5, the strongest teaching example.
export const DEFAULT_PRESET_INDEX = 4
