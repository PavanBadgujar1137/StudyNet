/**
 * OpenHand — Loading State (Skeleton)
 * Renders animated skeleton placeholders for data-loading views.
 * Used on every data view that hits a real endpoint.
 */
import React from 'react'
import './OHLoadingState.css'

export function OHSkeleton({ width, height = 20, radius = 8, className = '' }) {
  return (
    <span
      className={['oh-skeleton', className].filter(Boolean).join(' ')}
      style={{
        width: width || '100%',
        height,
        borderRadius: radius,
        display: 'block',
      }}
      aria-hidden="true"
    />
  )
}

/**
 * OHCardSkeleton — renders a skeleton that matches OHCard layout.
 */
export function OHCardSkeleton() {
  return (
    <div className="oh-card oh-card--white oh-card--pad-md" aria-hidden="true">
      <OHSkeleton width={44} height={44} radius={12} />
      <div style={{ marginTop: 16 }}>
        <OHSkeleton width="60%" height={16} style={{ marginBottom: 10 }} />
        <OHSkeleton height={14} />
        <OHSkeleton width="85%" height={14} style={{ marginTop: 6 }} />
        <OHSkeleton width="70%" height={14} style={{ marginTop: 6 }} />
      </div>
    </div>
  )
}

/**
 * OHTableRowSkeleton — for table loading states.
 */
export function OHTableRowSkeleton({ cols = 4 }) {
  return (
    <tr className="oh-table-skeleton-row" aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <OHSkeleton height={14} width={i === 0 ? '60%' : '80%'} />
        </td>
      ))}
    </tr>
  )
}

export default OHSkeleton
