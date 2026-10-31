/**
 * OpenHand — Sparkline Chart
 * Renders a small inline SVG sparkline from an array of numeric values.
 * Used in: Client check-in history, Practitioner wellbeing panel.
 * aria-label is required for accessibility.
 */
import React, { useMemo } from 'react'

export function OHSparkline({
  data = [],
  width = 120,
  height = 36,
  color = 'url(#oh-spark-grad)',
  strokeWidth = 2.2,
  ariaLabel = 'Trend chart',
  className = '',
}) {
  const points = useMemo(() => {
    if (!data.length) return ''
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const pad = strokeWidth
    const w = width - pad * 2
    const h = height - pad * 2
    return data
      .map((v, i) => {
        const x = pad + (i / (data.length - 1)) * w
        const y = pad + h - ((v - min) / range) * h
        return `${x},${y}`
      })
      .join(' ')
  }, [data, width, height, strokeWidth])

  const gradId = 'oh-spark-grad'

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2={width} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--oh-blue)" />
          <stop offset="100%" stopColor="var(--oh-violet)" />
        </linearGradient>
      </defs>
      {points && (
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  )
}

export default OHSparkline
