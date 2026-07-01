# AI Feature Margin Calculator

**Working prototype.** Pick a product goal and a real model, and see the gross margin,
break-even, and sensitivity of shipping an AI feature — the unit-economics math most AI
feature pitches skip.

**Signals:** "I understand AI unit economics" + "I reason rigorously about AI product decisions."

Live: `https://riddhi-k-bhargava.github.io/riddhi/margin-calculator/`

---

## Hypothesis

> We believe PMs/founders pricing an AI feature will get a defensible margin model in **under 2
> minutes**, measured by a shareable break-even output; we're wrong if the inputs are too abstract
> to fill in.

The preset goals exist specifically to defeat that failure mode — nobody starts from a blank
"input tokens" box; they start from "I want to deflect support tickets."

## Target user + JTBD

- **Primary:** an AI PM or founder deciding whether a feature is viable at a given price point.
- **Secondary:** a GTM/finance partner sanity-checking the pricing of an AI add-on.
- **Job to be done:** *"When I'm scoping an AI feature, help me know — before I build it — whether
  it makes money at real usage, and which lever to pull if it doesn't, so I can price or re-scope
  with confidence."*

## v1 scope

- 10 business-goal presets that pre-fill token usage, call volume, price, and a default model.
- 9 real models with May–June 2026 list prices; every rate field editable.
- Four outputs (cost/call, cost/user/mo, gross margin %, break-even cost) + a color-coded verdict.
- A sensitivity chart with three levers: call volume, output length, and model choice.
- Full write-up (challenge, approach, how it's calculated, assumptions) on the page.

**Explicitly out of scope for v1:** caching/batch pricing tiers, infra/support cost modeling,
multi-feature blended margin, saved scenarios, auth. Called out as assumptions, not hidden.

## Success / eval / guardrail metrics

- **Success:** % of sessions that change ≥1 input after loading a preset (did they actually
  reason, not just look); reaching a non-default verdict state.
- **Eval:** spot-check the four formulas against hand math for all 10 presets × a few models;
  confirm the default (agentic analyst on GPT-5.5) reads underwater and flips healthy on cheaper
  models.
- **Guardrail (honesty):** every price is a dated list price with an editable field and a visible
  "list prices only, no caching/batch" disclaimer. The tool must never imply measured production
  outcomes.

## Back-of-envelope worked example (the teaching case)

Default goal — **agentic market-research analyst**: 12,000 input tokens, 2,000 output tokens,
500 calls/user/month, $49/user.

```
On GPT-5.5 ($5/M in, $30/M out):
  costPerCall  = 12000/1e6 · 5  + 2000/1e6 · 30 = 0.06 + 0.06 = $0.12
  costPerUser  = 0.12 · 500                      = $60.00
  grossMargin  = (49 − 60) / 49 · 100            = −22.4%   → UNDERWATER (loses $11/user/mo)

Same feature, swap the model:
  Gemini 3 Flash ($0.5/M in, $3/M out): costPerCall = 0.006 + 0.006 = $0.012
    costPerUser = $6.00  → grossMargin = (49 − 6)/49 = 87.8%  → HEALTHY
  Claude Haiku 4.5 ($1/M in, $5/M out): costPerCall = 0.012 + 0.010 = $0.022
    costPerUser = $11.00 → grossMargin = (49 − 11)/49 = 77.6% → HEALTHY
```

Same product, same usage — a **−22% loss becomes ~+80% margin** purely on model choice. That is
the punchline the "Model choice" chart makes visual.

## Strategy + distribution

The calculator is a **credibility artifact**, not a SaaS play. It lives in the portfolio's
Building section as the lead AI signal and is meant to be linked into conversations ("here's how
I'd pressure-test that feature's economics"). Distribution is the portfolio itself plus
shareable, self-contained reasoning — anyone can open it, change one number, and see the argument.

## Build-vs-write-up rationale

A slide claiming "I understand AI margins" is cheap; a working tool that computes them live is
not. Building it forces the honest edge cases (output billed ~5x input, call-volume as the real
cost multiplier, list-vs-cached prices) into the open, and the interactive sensitivity view
teaches the lesson faster than prose. The write-up on the page carries the reasoning; the tool
carries the proof.

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| **Price drift** — model list prices change often and will date this. | All prices in one `models.js` with a dated comment; every rate is an editable field; UI + README state the "as of" date. Refresh = one-line change. |
| **False precision** — users read list-price margins as their real margins. | Explicit assumptions block: caching/batch omitted, infra/support excluded, ~40% treated as a floor. Editable rates let users model their real (cached/negotiated) cost. |
| **Preset realism** — token/volume figures are illustrative. | Stated plainly as illustrations, not telemetry; everything is editable so users replace them with their own. |
| **Over-claiming** — reads as a product/outcome promise. | Labeled **working prototype** in the eyebrow, footer, and here; framed as a decision aid. |

## Effort + milestones

- **M1 — Model.** Formulas, model data, presets, verdict bands. (core arithmetic)
- **M2 — Tool.** React + Vite + Tailwind UI, editable inputs, tooltips, four outputs. (interaction)
- **M3 — Sensitivity.** Hand-rolled on-palette SVG chart across three levers with break-even line.
- **M4 — Write-up + integration.** On-page reasoning, this README, link from the portfolio, build
  + deploy to the Pages subpath.

## Portfolio framing

**Headline:** *Most AI features die in the unit economics, not the demo.*

**Three proof points:**
- **9 models · priced live** — real May–June 2026 list prices, every rate editable.
- **10 goals · PM-ready presets** — start from a business outcome, not a blank form.
- **3 levers · sensitivity in one view** — call volume, output length, and model choice.

---

## Tech + deployment

React + Vite + Tailwind, built to static assets and committed into the portfolio repo.

```bash
cd apps/margin-calculator
npm install
npm run build     # outputs to repo-root ../../margin-calculator/, base /riddhi/margin-calculator/
```

GitHub Pages serves the built folder at `/riddhi/margin-calculator/`. A repo-root `.nojekyll`
prevents Jekyll from breaking Vite's hashed asset paths. To refresh prices, edit `src/models.js`
and rebuild.

**Honesty guardrails (non-negotiable):** prices are list prices (no caching/batch discounts),
stated in the UI and here; the artifact is a **working prototype** and never implies measured
production outcomes.
