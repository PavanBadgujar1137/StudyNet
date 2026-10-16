/**
 * OpenHand — Bar Chart
 * Simple SVG bar chart for practitioner earnings breakdown.
 * data: [{ label, value }]
 */
import React, { useMemo } from 'react'

export function OHBarChart({
  data = [],
  width = 300,
  height = 160,
  ariaLabel = 'Bar chart',
  barColor = 'url(#oh-bar-grad)',
  className = '',
}) {
  const bars = useMemo(() => {
    if (!data.length) return []
    const max = Math.max(...data.map((d) => d.value)) || 1
    const barW = (width / data.length) * 0.55
    const gap  = (width / data.length) * 0.45
    const padB = 28 // bottom padding for labels
    const padT = 10
    const chartH = height - padB - padT

    return data.map((d, i) => {
      const barH = (d.value / max) * chartH
      const x = i * (barW + gap) + gap / 2
      const y = padT + chartH - barH
      return { x, y, w: barW, h: barH, label: d.label, value: d.value }
    })
  }, [data, width, height])

  const gradId = 'oh-bar-grad'

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--oh-violet)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--oh-blue)" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {bars.map((b, i) => (
        <g key={i}>
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="5"
            fill={barColor}
            aria-label={`${b.label}: ${b.value}`}
          />
          <text
            x={b.x + b.w / 2}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill="var(--oh-muted)"
            fontFamily="var(--oh-font-body)"
          >
            {b.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default OHBarChart
