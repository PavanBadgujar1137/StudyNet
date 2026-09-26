/**
 * OpenHand — Breakeven Chart
 * SVG line chart from pricing.html — shows cost of each plan vs monthly earnings.
 * Rendered from real plan config data; no hardcoded hex values.
 *
 * plans: [{ name, color, fn: (gross) => cost }]
 * crossovers: [{ x, label, color }] — switch-point annotations
 * maxGross: upper bound of x-axis (e.g., 200000 = ₹2L)
 */
import React, { useMemo } from 'react'

const fmt = (n) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}k`
  return `₹${n}`
}

export function OHBreakevenChart({
  plans = [],
  maxGross = 200000,
  width = 800,
  height = 290,
  ariaLabel = 'Line chart comparing plan costs by monthly earnings',
  className = '',
}) {
  const PAD = { l: 64, r: 20, t: 20, b: 40 }
  const W = width  - PAD.l - PAD.r
  const H = height - PAD.t - PAD.b

  // Determine max cost visible
  const maxCost = useMemo(() => {
    let m = 0
    plans.forEach(p => { m = Math.max(m, p.fn(maxGross)) })
    return Math.ceil(m / 5000) * 5000 || 15000
  }, [plans, maxGross])

  const toX = (gross) => PAD.l + (gross / maxGross) * W
  const toY = (cost)  => PAD.t + H - (cost / maxCost) * H

  // Build polyline points for each plan (sample 200 points)
  const lines = useMemo(() => plans.map(plan => {
    const pts = Array.from({ length: 201 }, (_, i) => {
      const g = (i / 200) * maxGross
      return `${toX(g).toFixed(1)},${toY(plan.fn(g)).toFixed(1)}`
    }).join(' ')
    return { ...plan, pts }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [plans, maxGross, maxCost])

  // X-axis labels
  const xLabels = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    gross: f * maxGross,
    x: toX(f * maxGross),
  }))

  // Y-axis labels
  const ySteps = 4
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => ({
    cost: (i / ySteps) * maxCost,
    y: toY((i / ySteps) * maxCost),
  }))

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={ariaLabel}
    >
      {/* Axes */}
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + H}
        stroke="var(--oh-rule)" strokeWidth="1" />
      <line x1={PAD.l} y1={PAD.t + H} x2={PAD.l + W} y2={PAD.t + H}
        stroke="var(--oh-rule)" strokeWidth="1" />

      {/* Y gridlines + labels */}
      {yLabels.map((yl, i) => (
        <g key={i}>
          {i > 0 && (
            <line x1={PAD.l} y1={yl.y} x2={PAD.l + W} y2={yl.y}
              stroke="var(--oh-rule)" strokeDasharray="3 6" strokeWidth="1" opacity="0.6" />
          )}
          <text x={PAD.l - 6} y={yl.y + 4} textAnchor="end"
            fontSize="10" fill="var(--oh-muted)" fontFamily="var(--oh-font-body)">
            {fmt(yl.cost)}
          </text>
        </g>
      ))}

      {/* X labels */}
      {xLabels.map((xl, i) => (
        <text key={i} x={xl.x} y={PAD.t + H + 20} textAnchor="middle"
          fontSize="10" fill="var(--oh-muted)" fontFamily="var(--oh-font-body)">
          {fmt(xl.gross)}
        </text>
      ))}

      {/* Plan lines */}
      {lines.map((line, i) => (
        <polyline key={i} points={line.pts}
          fill="none" stroke={line.color} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
      ))}

      {/* Crossover annotations */}
      {plans.flatMap(p => p.crossovers || []).map((co, i) => {
        const cx = toX(co.gross)
        const cy = toY(co.cost)
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r="5" fill={co.color} />
            <text x={cx + 10} y={cy - 6} fontSize="11"
              fill={co.color} fontWeight="600" fontFamily="var(--oh-font-body)">
              {co.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default OHBreakevenChart
