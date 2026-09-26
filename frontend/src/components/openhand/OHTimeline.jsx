/**
 * OpenHand — Timeline Component
 * SVG-based, scroll-animated vertical timeline.
 * Source pattern: client-journey.html IntersectionObserver animation.
 *
 * items: [{ date, title, body, icon?, tag? }]
 */
import React, { useRef, useEffect, useState } from 'react'

function TimelineItem({ item, index, visible }) {
  return (
    <div
      className={[
        'oh-tl__item',
        index % 2 === 0 ? 'oh-tl__item--left' : 'oh-tl__item--right',
        visible ? 'oh-tl__item--visible' : '',
      ].filter(Boolean).join(' ')}
    >
      {/* Node on the rail */}
      <div className="oh-tl__node" aria-hidden="true">
        <span className="oh-tl__node-dot" />
      </div>

      {/* Content card */}
      <div className="oh-tl__card">
        {item.tag && <span className="oh-tl__tag">{item.tag}</span>}
        <p className="oh-tl__date">{item.date}</p>
        <h3 className="oh-tl__title">{item.title}</h3>
        {item.body && <p className="oh-tl__body">{item.body}</p>}
      </div>
    </div>
  )
}

export function OHTimeline({ items = [], className = '' }) {
  const containerRef = useRef(null)
  const [visibleSet, setVisibleSet] = useState(new Set())

  useEffect(() => {
    const nodes = containerRef.current?.querySelectorAll('.oh-tl__item')
    if (!nodes?.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = +entry.target.dataset.idx
            setVisibleSet((prev) => new Set([...prev, idx]))
          }
        })
      },
      { threshold: 0.2, rootMargin: '0px 0px -60px 0px' }
    )

    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [items])

  return (
    <div
      className={['oh-tl', className].filter(Boolean).join(' ')}
      ref={containerRef}
    >
      {/* Dashed vertical rail */}
      <div className="oh-tl__rail" aria-hidden="true" />

      {items.map((item, i) => (
        <div key={i} data-idx={i}>
          <TimelineItem item={item} index={i} visible={visibleSet.has(i)} />
        </div>
      ))}
    </div>
  )
}

export default OHTimeline
