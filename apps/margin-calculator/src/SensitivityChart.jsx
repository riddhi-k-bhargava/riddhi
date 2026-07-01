import { C, verdict } from './theme.js'

// A compact, on-palette hand-rolled SVG chart. Three modes share one y-axis: gross margin %,
// clamped to [-60, 100] for display, with an emphasized zero line.
const VB_W = 560
const VB_H = 360
const M = { top: 18, right: 18, bottom: 48, left: 48 }
const PLOT_W = VB_W - M.left - M.right
const PLOT_H = VB_H - M.top - M.bottom
const Y_MIN = -60
const Y_MAX = 100

const clampY = (m) => Math.max(Y_MIN, Math.min(Y_MAX, m))
const yToPx = (m) => M.top + ((Y_MAX - clampY(m)) / (Y_MAX - Y_MIN)) * PLOT_H
const xToPx = (x, xmax) => M.left + (xmax > 0 ? (x / xmax) * PLOT_W : 0)

const gridLines = [100, 40, 0, -60]

function marginFor(cpc, calls, price) {
  if (price <= 0) return -100
  return ((price - cpc * calls) / price) * 100
}

function Axes({ children, xLabel, xTicks, xmax }) {
  return (
    <>
      {/* horizontal gridlines + y labels */}
      {gridLines.map((g) => {
        const y = yToPx(g)
        const isZero = g === 0
        return (
          <g key={g}>
            <line
              x1={M.left}
              y1={y}
              x2={M.left + PLOT_W}
              y2={y}
              stroke={isZero ? 'rgba(28,26,23,0.32)' : C.line}
              strokeWidth={isZero ? 1 : 0.75}
              strokeDasharray={isZero ? '0' : '3 3'}
            />
            <text x={M.left - 8} y={y + 3.5} textAnchor="end" fontSize="10" fontFamily="'DM Sans',sans-serif" fill={C.inkMuted}>
              {g}%
            </text>
          </g>
        )
      })}
      {/* x ticks */}
      {xTicks &&
        xTicks.map((t, i) => {
          const x = xToPx(t, xmax)
          return (
            <text key={i} x={x} y={M.top + PLOT_H + 18} textAnchor="middle" fontSize="10" fontFamily="'DM Sans',sans-serif" fill={C.inkMuted}>
              {t >= 1000 ? Math.round(t).toLocaleString() : Math.round(t)}
            </text>
          )
        })}
      {xLabel && (
        <text x={M.left + PLOT_W / 2} y={VB_H - 8} textAnchor="middle" fontSize="10.5" fontFamily="'DM Sans',sans-serif" fontStyle="italic" fill={C.inkMuted}>
          {xLabel}
        </text>
      )}
      {children}
    </>
  )
}

function LineView({ xmax, sample, breakEvenX, nowX, nowMargin, xLabel }) {
  const pts = []
  const N = 72
  for (let i = 0; i <= N; i++) {
    const x = (xmax * i) / N
    pts.push(`${xToPx(x, xmax).toFixed(2)},${yToPx(sample(x)).toFixed(2)}`)
  }
  const xTicks = [0, xmax / 2, xmax]
  const beInRange = breakEvenX != null && isFinite(breakEvenX) && breakEvenX >= 0 && breakEvenX <= xmax
  const nowPx = { x: xToPx(nowX, xmax), y: yToPx(nowMargin) }
  const beLabelX = beInRange ? Math.min(Math.max(xToPx(breakEvenX, xmax), M.left + 30), M.left + PLOT_W - 30) : 0

  return (
    <Axes xLabel={xLabel} xTicks={xTicks} xmax={xmax}>
      {/* break-even vertical */}
      {beInRange && (
        <g>
          <line x1={xToPx(breakEvenX, xmax)} y1={M.top} x2={xToPx(breakEvenX, xmax)} y2={M.top + PLOT_H} stroke={C.inkMuted} strokeWidth="1" strokeDasharray="4 3" />
          <text x={beLabelX} y={M.top + 10} textAnchor="middle" fontSize="9.5" fontFamily="'DM Sans',sans-serif" fill={C.inkMuted}>
            break-even
          </text>
        </g>
      )}
      {/* margin curve */}
      <polyline points={pts.join(' ')} fill="none" stroke={C.accent} strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
      {/* now marker */}
      <g>
        <circle cx={nowPx.x} cy={nowPx.y} r="4.5" fill={C.accent} stroke={C.warmWhite} strokeWidth="1.5" />
        <text
          x={Math.min(Math.max(nowPx.x, M.left + 14), M.left + PLOT_W - 14)}
          y={nowPx.y < M.top + 26 ? nowPx.y + 16 : nowPx.y - 9}
          textAnchor="middle"
          fontSize="10"
          fontFamily="'Lora',serif"
          fontStyle="italic"
          fill={C.ink}
        >
          now
        </text>
      </g>
    </Axes>
  )
}

function BarView({ models, selectedId, inTok, outTok, calls, price }) {
  const slot = PLOT_W / models.length
  const barW = slot * 0.6
  const y0 = yToPx(0)

  return (
    <Axes>
      {models.map((m, i) => {
        const cpc = (inTok / 1e6) * m.in + (outTok / 1e6) * m.out
        const margin = marginFor(cpc, calls, price)
        const v = verdict(margin)
        const cx = M.left + slot * (i + 0.5)
        const yv = yToPx(margin)
        const top = Math.min(y0, yv)
        const h = Math.max(1.5, Math.abs(yv - y0))
        const selected = m.id === selectedId
        return (
          <g key={m.id}>
            <rect
              x={cx - barW / 2}
              y={top}
              width={barW}
              height={h}
              rx="2"
              fill={selected ? v.color : v.soft}
              stroke={v.color}
              strokeWidth={selected ? 1.5 : 0.75}
            />
            {selected && (
              <text x={cx} y={top - 5 < M.top + 8 ? top + 12 : top - 5} textAnchor="middle" fontSize="9.5" fontFamily="'Lora',serif" fill={C.ink}>
                {margin.toFixed(0)}%
              </text>
            )}
            <text
              x={cx}
              y={M.top + PLOT_H + 14}
              textAnchor="end"
              fontSize="8.5"
              fontFamily="'DM Sans',sans-serif"
              fill={selected ? C.accent : C.inkMuted}
              fontWeight={selected ? 500 : 400}
              transform={`rotate(-32 ${cx} ${M.top + PLOT_H + 14})`}
            >
              {m.label}
            </text>
          </g>
        )
      })}
    </Axes>
  )
}

export default function SensitivityChart({ mode, inTok, outTok, calls, inRate, outRate, price, models, selectedModelId }) {
  const cpcNow = (inTok / 1e6) * inRate + (outTok / 1e6) * outRate

  let body = null
  if (mode === 'calls') {
    const xmax = Math.max(2 * calls, 50)
    const breakEvenX = cpcNow > 0 ? price / cpcNow : null
    body = (
      <LineView
        xmax={xmax}
        sample={(c) => marginFor(cpcNow, c, price)}
        breakEvenX={breakEvenX}
        nowX={calls}
        nowMargin={marginFor(cpcNow, calls, price)}
        xLabel="calls / user / month"
      />
    )
  } else if (mode === 'output') {
    const xmax = Math.max(2 * outTok, 500)
    const sample = (o) => marginFor((inTok / 1e6) * inRate + (o / 1e6) * outRate, calls, price)
    // break-even output tokens: cost/user = price
    let breakEvenX = null
    if (outRate > 0 && calls > 0) {
      breakEvenX = ((price / calls - (inTok / 1e6) * inRate) * 1e6) / outRate
    }
    body = (
      <LineView
        xmax={xmax}
        sample={sample}
        breakEvenX={breakEvenX}
        nowX={outTok}
        nowMargin={sample(outTok)}
        xLabel="output tokens / call"
      />
    )
  } else {
    body = <BarView models={models} selectedId={selectedModelId} inTok={inTok} outTok={outTok} calls={calls} price={price} />
  }

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" role="img" aria-label="Sensitivity of gross margin" style={{ display: 'block' }}>
      {body}
    </svg>
  )
}
