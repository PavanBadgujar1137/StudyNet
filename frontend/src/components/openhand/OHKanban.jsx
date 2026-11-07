/**
 * OpenHand — Kanban Board
 * Drag-and-drop kanban for Circle cohort stages.
 * Each card drop calls onStageChange(cardId, newStage).
 *
 * columns: [{ id, label, color? }]
 * cards:   [{ id, stageId, title, subtitle?, tags?, avatar? }]
 */
import React, { useState } from 'react'

export function OHKanban({
  columns = [],
  cards = [],
  onStageChange,
  className = '',
}) {
  const [dragging, setDragging] = useState(null)
  const [over, setOver] = useState(null)

  const cardsByStage = columns.reduce((acc, col) => {
    acc[col.id] = cards.filter((c) => c.stageId === col.id)
    return acc
  }, {})

  const handleDragStart = (e, card) => {
    setDragging(card)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, colId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOver(colId)
  }

  const handleDrop = (e, colId) => {
    e.preventDefault()
    if (dragging && dragging.stageId !== colId) {
      onStageChange?.(dragging.id, colId)
    }
    setDragging(null)
    setOver(null)
  }

  const handleDragEnd = () => {
    setDragging(null)
    setOver(null)
  }

  return (
    <div className={['oh-kanban', className].filter(Boolean).join(' ')} role="list">
      {columns.map((col) => (
        <div
          key={col.id}
          className={['oh-kanban__col', over === col.id ? 'oh-kanban__col--over' : ''].filter(Boolean).join(' ')}
          onDragOver={(e) => handleDragOver(e, col.id)}
          onDrop={(e) => handleDrop(e, col.id)}
          role="listitem"
          aria-label={col.label}
        >
          {/* Column header */}
          <div className="oh-kanban__col-head">
            <span
              className="oh-kanban__col-dot"
              style={{ background: col.color || 'var(--oh-grad)' }}
            />
            <span className="oh-kanban__col-label">{col.label}</span>
            <span className="oh-kanban__col-count">
              {cardsByStage[col.id]?.length || 0}
            </span>
          </div>

          {/* Cards */}
          <div className="oh-kanban__cards">
            {(cardsByStage[col.id] || []).map((card) => (
              <div
                key={card.id}
                className={[
                  'oh-kanban__card',
                  dragging?.id === card.id ? 'oh-kanban__card--dragging' : '',
                ].filter(Boolean).join(' ')}
                draggable
                onDragStart={(e) => handleDragStart(e, card)}
                onDragEnd={handleDragEnd}
                role="article"
                aria-label={card.title}
              >
                {/* Avatar initials */}
                {card.avatar && (
                  <div className="oh-kanban__card-avatar">{card.avatar}</div>
                )}
                <div className="oh-kanban__card-content">
                  <p className="oh-kanban__card-title">{card.title}</p>
                  {card.subtitle && (
                    <p className="oh-kanban__card-sub">{card.subtitle}</p>
                  )}
                  {card.tags?.length > 0 && (
                    <div className="oh-kanban__card-tags">
                      {card.tags.map((t, i) => (
                        <span key={i} className="oh-kanban__card-tag">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Empty column placeholder */}
            {!cardsByStage[col.id]?.length && (
              <div className="oh-kanban__empty">Drop here</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default OHKanban
