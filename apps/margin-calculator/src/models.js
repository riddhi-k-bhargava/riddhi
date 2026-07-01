// List prices as of May–June 2026, standard (non-cached, non-batch). Verify before quoting.
// Prices are per 1M tokens, USD. To refresh: edit the two numbers on each row.
export const MODELS = [
  { id: 'opus-4.8',   name: 'Claude Opus 4.8',  label: 'Opus 4.8',   in: 5,    out: 25 },
  { id: 'sonnet-4.6', name: 'Claude Sonnet 4.6', label: 'Sonnet 4.6', in: 3,    out: 15 },
  { id: 'haiku-4.5',  name: 'Claude Haiku 4.5', label: 'Haiku 4.5',  in: 1,    out: 5  },
  { id: 'gpt-5.5',    name: 'GPT-5.5',          label: 'GPT-5.5',    in: 5,    out: 30 },
  { id: 'gpt-5.4',    name: 'GPT-5.4',          label: 'GPT-5.4',    in: 2.5,  out: 15 },
  { id: 'gpt-5.4-mini', name: 'GPT-5.4 Mini',   label: '5.4 Mini',   in: 0.75, out: 4.5 },
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', label: 'Gem 3.1',  in: 2,    out: 12 },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', label: 'Gem Flash', in: 0.5, out: 3  },
  { id: 'grok-4.1',   name: 'Grok 4.1',         label: 'Grok 4.1',   in: 0.2,  out: 0.5 },
]

export const modelById = (id) => MODELS.find((m) => m.id === id)

export const PRICES_ASOF = 'May–June 2026'
