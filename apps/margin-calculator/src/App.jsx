import { useState, useMemo } from 'react'
import Tooltip from './Tooltip.jsx'
import SensitivityChart from './SensitivityChart.jsx'
import { MODELS, modelById, PRICES_ASOF } from './models.js'
import { PRESETS, DEFAULT_PRESET_INDEX } from './presets.js'
import { verdict } from './theme.js'

/* ---------- formatting helpers ---------- */
const num = (s) => {
  const n = parseFloat(s)
  return isFinite(n) ? n : 0
}
const money2 = (n) => `$${n.toFixed(2)}`
const moneyCall = (n) => (n >= 0.01 || n === 0 ? `$${n.toFixed(2)}` : `$${n.toFixed(4)}`)
const pct1 = (n) => `${n.toFixed(1)}%`
const int = (n) => Math.round(n).toLocaleString()

/* ---------- small UI pieces ---------- */
function Field({ label, tip, value, onChange, prefix, suffix, step = '1', min = '0' }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
        {label}
        <Tooltip text={tip} label={`About ${label}`} />
      </span>
      <span className="flex items-center rounded-lg border border-hair bg-cream px-3 py-2.5 focus-within:border-accent">
        {prefix && <span className="mr-1 text-[14px] text-ink-muted">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent font-serif text-[17px] text-ink outline-none"
        />
        {suffix && <span className="ml-1 whitespace-nowrap text-[12px] italic text-ink-muted">{suffix}</span>}
      </span>
    </label>
  )
}

function Metric({ label, tip, value, band }) {
  const color = band ? band.color : 'var(--ink)'
  return (
    <div className="rounded-xl border border-hair bg-warm-white p-4">
      <div className="mb-2 flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-muted">
        {label}
        <Tooltip text={tip} label={`About ${label}`} />
      </div>
      <div className="font-serif text-[26px] leading-none" style={{ color }}>
        {value}
      </div>
    </div>
  )
}

function Stat({ n, label }) {
  return (
    <div className="rounded-xl border border-hair bg-warm-white px-5 py-5">
      <div className="font-serif text-[30px] leading-none text-accent">{n}</div>
      <div className="mt-2 text-[12.5px] leading-snug text-ink-muted">{label}</div>
    </div>
  )
}

/* ---------- app ---------- */
export default function App() {
  const p0 = PRESETS[DEFAULT_PRESET_INDEX]
  const m0 = modelById(p0.model)
  const [goal, setGoal] = useState(DEFAULT_PRESET_INDEX)
  const [inTok, setInTok] = useState(String(p0.inTok))
  const [outTok, setOutTok] = useState(String(p0.outTok))
  const [calls, setCalls] = useState(String(p0.calls))
  const [price, setPrice] = useState(String(p0.price))
  const [modelId, setModelId] = useState(p0.model)
  const [inRate, setInRate] = useState(String(m0.in))
  const [outRate, setOutRate] = useState(String(m0.out))
  const [chartMode, setChartMode] = useState('model')

  function applyPreset(idx) {
    const p = PRESETS[idx]
    const m = modelById(p.model)
    setGoal(idx)
    setInTok(String(p.inTok))
    setOutTok(String(p.outTok))
    setCalls(String(p.calls))
    setPrice(String(p.price))
    setModelId(p.model)
    setInRate(String(m.in))
    setOutRate(String(m.out))
  }
  function applyModel(id) {
    const m = modelById(id)
    setModelId(id)
    if (m) {
      setInRate(String(m.in))
      setOutRate(String(m.out))
    }
  }

  const calc = useMemo(() => {
    const it = num(inTok)
    const ot = num(outTok)
    const c = num(calls)
    const ir = num(inRate)
    const or = num(outRate)
    const pr = num(price)
    const costPerCall = (it / 1e6) * ir + (ot / 1e6) * or
    const costPerUser = costPerCall * c
    const grossMargin = pr > 0 ? ((pr - costPerUser) / pr) * 100 : -100
    const breakEvenCost = costPerUser
    const breakEvenCalls = costPerCall > 0 && pr > 0 ? pr / costPerCall : null
    return { it, ot, c, ir, or, pr, costPerCall, costPerUser, grossMargin, breakEvenCost, breakEvenCalls }
  }, [inTok, outTok, calls, inRate, outRate, price])

  const v = verdict(calc.grossMargin)

  const banner =
    v.band === 'neg'
      ? `Underwater — you lose ${money2(calc.costPerUser - calc.pr)} per user every month at this price.`
      : v.band === 'warn'
        ? `Thin — ${pct1(calc.grossMargin)} gross margin leaves little room for infra, support, or churn.`
        : `Healthy — ${pct1(calc.grossMargin)} gross margin at ${money2(calc.pr)} / user.`

  const caption = (() => {
    if (chartMode === 'model') return 'Same feature, every model — bars are gross margin at your current usage. Your selected model is highlighted.'
    if (chartMode === 'calls') {
      if (calc.breakEvenCalls == null) return 'Gross margin as monthly call volume rises.'
      return `Gross margin as monthly call volume rises. Break-even near ${int(calc.breakEvenCalls)} calls / user — you're at ${int(calc.c)}.`
    }
    // output
    let beOut = null
    if (calc.or > 0 && calc.c > 0) beOut = ((calc.pr / calc.c - (calc.it / 1e6) * calc.ir) * 1e6) / calc.or
    if (beOut == null || beOut < 0) return 'Gross margin as the answer gets longer — already past break-even on input cost alone across this range.'
    return `Gross margin as the answer gets longer. Break-even near ${int(beOut)} output tokens / call — you're at ${int(calc.ot)}.`
  })()

  const modes = [
    { id: 'calls', label: 'Call volume' },
    { id: 'output', label: 'Output length' },
    { id: 'model', label: 'Model choice' },
  ]

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <nav className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-hair bg-cream/90 px-6 backdrop-blur md:px-10">
        <a href="../index.html" className="text-[13px] text-ink-soft transition-colors hover:text-accent">
          ← Back to portfolio
        </a>
        <span className="font-serif text-[14px] text-ink">Riddhi Bhargava</span>
      </nav>

      <main className="mx-auto max-w-[1080px] px-6 pb-16 pt-12 md:px-10">
        {/* HEADER */}
        <p className="mb-5 text-[12px] font-medium uppercase tracking-[0.12em] text-accent">Working prototype · AI product economics</p>
        <h1 className="max-w-[760px] font-serif text-[clamp(30px,5vw,46px)] font-normal leading-[1.15] text-ink">
          Most AI features die in the <em className="italic text-accent">unit economics</em>, not the demo.
        </h1>
        <p className="mt-5 max-w-[620px] text-[17px] font-light leading-[1.7] text-ink-soft">
          Pick a product goal and a real model, then watch the gross margin, break-even, and sensitivity move as you change the inputs — the math most AI feature pitches skip.
        </p>
        <p className="mt-3 text-[12px] italic text-ink-muted">Prices as of May 2026 · list prices only, no caching or batch discounts.</p>

        {/* STAT CARDS */}
        <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat n="9" label="models · priced live" />
          <Stat n="10" label="goals · PM-ready presets" />
          <Stat n="3" label="levers · sensitivity in one view" />
        </div>

        {/* CALCULATOR */}
        <section className="mt-12 rounded-xl border border-hair bg-warm-white p-5 md:p-7">
          {/* goal */}
          <label className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              Business goal
              <Tooltip
                text="The outcome you're pricing an AI feature for. Picking one pre-fills realistic token usage, call volume, price, and a sensible default model — a starting point you then fine-tune."
                label="About Business goal"
              />
            </span>
            <select
              value={goal}
              onChange={(e) => applyPreset(Number(e.target.value))}
              className="w-full rounded-lg border border-hair bg-cream px-3 py-2.5 font-sans text-[15px] text-ink outline-none focus:border-accent"
            >
              {PRESETS.map((p, i) => (
                <option key={i} value={i}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-6 grid grid-cols-1 gap-7 lg:grid-cols-2">
            {/* LEFT — inputs */}
            <div>
              <label className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  Model
                  <Tooltip
                    text="The LLM you'd run this on, with real May–June 2026 list prices. Model choice is usually the single biggest lever on margin — a cheaper model can flip a feature from loss to profit."
                    label="About Model"
                  />
                </span>
                <select
                  value={modelId}
                  onChange={(e) => applyModel(e.target.value)}
                  className="w-full rounded-lg border border-hair bg-cream px-3 py-2.5 font-sans text-[15px] text-ink outline-none focus:border-accent"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — ${m.in}/M in · ${m.out}/M out
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <Field
                  label="Input tokens / call"
                  tip="Tokens you send per call: your prompt, system instructions, retrieved documents (RAG), and chat history. ~1 token ≈ 0.75 words. Bigger context = more input tokens = higher cost."
                  value={inTok}
                  onChange={setInTok}
                  step="100"
                />
                <Field
                  label="Output tokens / call"
                  tip="Tokens the model generates back per call — its response. Billed at ~5x the input rate on most models, so verbose answers erode margin faster than long prompts."
                  value={outTok}
                  onChange={setOutTok}
                  step="100"
                />
                <Field
                  label="Calls / user / month"
                  tip="How many model calls one user triggers a month. A chat reply = 1 call; an agent that loops can be dozens or hundreds per task. This multiplier is what most often blows up cost."
                  value={calls}
                  onChange={setCalls}
                  step="10"
                />
                <Field
                  label="Price / user / month"
                  tip="What you charge one user a month for this feature (or the add-on's standalone price). Cost per user is subtracted from this to get gross margin. For an internal tool, enter the value created per user instead."
                  value={price}
                  onChange={setPrice}
                  prefix="$"
                  step="1"
                />
                <Field
                  label="$ / M in"
                  tip="Price per 1 million input tokens (USD). Auto-filled from the model; edit it for an unlisted model, a negotiated rate, or to model prompt-caching (cached input can be ~90% cheaper)."
                  value={inRate}
                  onChange={setInRate}
                  prefix="$"
                  step="0.05"
                />
                <Field
                  label="$ / M out"
                  tip="Price per 1 million output tokens (USD). Auto-filled from the model. Output almost always costs several times more than input — usually about 5x."
                  value={outRate}
                  onChange={setOutRate}
                  prefix="$"
                  step="0.05"
                />
              </div>
            </div>

            {/* RIGHT — chart */}
            <div className="flex flex-col">
              <div className="mb-3 flex flex-wrap gap-2">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setChartMode(m.id)}
                    className={`rounded-full border px-3.5 py-1.5 text-[12px] tracking-[0.02em] transition-colors ${
                      chartMode === m.id ? 'border-accent bg-accent text-white' : 'border-hair bg-cream text-ink-soft hover:border-accent hover:text-accent'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="rounded-xl border border-hair bg-cream p-3">
                <SensitivityChart
                  mode={chartMode}
                  inTok={calc.it}
                  outTok={calc.ot}
                  calls={calc.c}
                  inRate={calc.ir}
                  outRate={calc.or}
                  price={calc.pr}
                  models={MODELS}
                  selectedModelId={modelId}
                />
              </div>
              <p className="mt-2.5 text-[12px] italic leading-snug text-ink-muted">{caption}</p>
            </div>
          </div>

          {/* VERDICT */}
          <div
            className="mt-7 rounded-xl border px-5 py-4"
            style={{ background: v.soft, borderColor: v.color + '55' }}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: v.color }}>
                {v.label}
              </span>
            </div>
            <p className="mt-1 text-[15px] leading-snug" style={{ color: v.color }}>
              {banner}
            </p>
          </div>

          {/* METRICS */}
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metric
              label="Cost / call"
              tip="Blended cost of one model call: (input tokens × input rate) + (output tokens × output rate). The atomic unit everything else scales from."
              value={moneyCall(calc.costPerCall)}
            />
            <Metric
              label="Cost / user / mo"
              tip="Cost of one user for a month: cost per call × calls per user per month. This is what you subtract from price to get margin."
              value={money2(calc.costPerUser)}
            />
            <Metric
              label="Gross margin"
              tip="(Price − cost per user) ÷ price, as a percentage. Above ~40% is healthy for software; below 0% you pay to serve each user."
              value={pct1(calc.grossMargin)}
              band={v}
            />
            <Metric
              label="Break-even cost"
              tip="Your per-user cost — the price floor. Charge below this and the feature is underwater before any infra, support, or sales cost."
              value={money2(calc.breakEvenCost)}
            />
          </div>
        </section>

        {/* WRITE-UP */}
        <section className="mt-14 max-w-[720px]">
          <p className="mb-8 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">The thinking</p>

          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-[20px] text-ink">Challenge</h2>
              <p className="mt-2 text-[15px] leading-[1.75] text-ink-soft">
                AI features demo beautifully and die quietly in the P&amp;L. The moment that kills them isn't the model quality — it's the per-user cost at real call volume. Most teams price the feature before they've done the token math, and only discover the margin after launch. The gap between a slick prototype and a shippable product is almost always the unit economics.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-[20px] text-ink">Approach</h2>
              <p className="mt-2 text-[15px] leading-[1.75] text-ink-soft">
                Make the economics playable. Start from a concrete business goal so the inputs aren't abstract, load real list prices for nine current models, and let every assumption stay editable. Then surface the one thing spreadsheets hide — <em className="italic text-accent">sensitivity</em>: how margin bends as call volume, answer length, or model choice change. The default goal ships underwater on GPT-5.5 on purpose, because the fastest way to teach the lesson is to show the same feature turn profitable the moment you switch models.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-[20px] text-ink">How it's calculated</h2>
              <p className="mt-2 text-[15px] leading-[1.75] text-ink-soft">
                Every number comes from four visible lines of arithmetic:
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-hair bg-cream px-4 py-3.5 font-mono text-[12.5px] leading-[1.7] text-ink-soft">
{`costPerCall   = (inTok/1e6)·inRate + (outTok/1e6)·outRate
costPerUser   = costPerCall · callsPerMonth
grossMargin%  = (price − costPerUser) / price · 100
breakEvenCost = costPerUser        // the per-user price floor`}
              </pre>
              <p className="mt-3 text-[15px] leading-[1.75] text-ink-soft">
                The sensitivity chart just re-runs this across a sweep — of call volume, of output length, or of every model at once.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-[20px] text-ink">Assumptions</h2>
              <ul className="mt-2 space-y-2 text-[15px] leading-[1.7] text-ink-soft">
                <li>· Prices are <b className="font-medium text-ink">list prices</b> as of {PRICES_ASOF}, standard tier — <b className="font-medium text-ink">no</b> prompt-caching or batch discounts. Real caching can cut input cost ~90%; model that by editing the rate fields.</li>
                <li>· Gross margin here is model-inference cost only. It ignores infra, storage, support, and retrieval — so treat the healthy threshold (~40%) as a floor, not a target.</li>
                <li>· Preset token counts and call volumes are realistic illustrations, not measured production telemetry.</li>
                <li>· This is a <b className="font-medium text-ink">working prototype</b> for reasoning about a decision — not a billing system or a promise of outcomes.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mx-auto flex max-w-[1080px] flex-col gap-3 border-t border-hair px-6 py-8 md:px-10">
        <a href="../index.html" className="w-fit text-[13px] text-ink-soft transition-colors hover:text-accent">← Back to portfolio</a>
        <div className="flex flex-col gap-1">
          <span className="font-serif text-[14px] text-ink-soft">Riddhi Bhargava</span>
          <span className="text-[12px] text-ink-muted">AI Feature Margin Calculator · working prototype · list prices as of {PRICES_ASOF}, verify before quoting.</span>
        </div>
      </footer>
    </div>
  )
}
