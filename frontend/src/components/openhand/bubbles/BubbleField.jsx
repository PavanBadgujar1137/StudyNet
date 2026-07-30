import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { getBubbleConfigForPath } from './bubbleConfig'
import './BubbleField.css'

/**
 * Generates a random float between min and max.
 */
function randomRange(min, max) {
  return Math.random() * (max - min) + min
}

/**
 * Generates initial bubble data array based on tier and screen size.
 */
function generateBubbles(densityTier, isMobile) {
  if (!densityTier || densityTier === 'none') return []

  let count = 22 // low tier desktop
  if (densityTier === 'medium') {
    count = isMobile ? 20 : 36 // medium tier hero section
  } else {
    count = isMobile ? 12 : 22 // low tier
  }

  const bubbles = []
  for (let i = 0; i < count; i++) {
    const size = Math.round(randomRange(16, 48)) // smaller, delicate soap bubbles
    const duration = randomRange(10, 18) // 10s-18s rise
    const delay = -1 * randomRange(0, duration) // negative delay for instant screen coverage on load
    const left = randomRange(3, 96) // 3% to 96% X position
    const sway = Math.round(randomRange(10, 25)) * (Math.random() > 0.5 ? 1 : -1)
    const opacity = parseFloat(randomRange(0.75, 0.95).toFixed(2)) // element visibility opacity

    bubbles.push({
      id: `b-${i}-${Date.now()}`,
      size,
      duration,
      delay,
      left,
      sway,
      opacity,
      isPopping: false,
      droplets: [],
    })
  }

  return bubbles
}

export function BubbleField({
  density: densityProp,
  interactive = true,
  zone: zoneProp,
}) {
  const location = useLocation()
  const routeConfig = getBubbleConfigForPath(location?.pathname)
  const density = densityProp || routeConfig.density || 'none'
  const zone = zoneProp || routeConfig.zone || 'fullscreen'
  const containerRef = useRef(null)
  const [bubbles, setBubbles] = useState([])
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // 1. Check prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  // 2. Initialize bubbles based on density & screen width
  useEffect(() => {
    if (density === 'none') {
      setBubbles([])
      return
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    setBubbles(generateBubbles(density, isMobile))

    const handleResize = () => {
      const mobileNow = window.innerWidth < 768
      setBubbles(generateBubbles(density, mobileNow))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [density])

  // 3. Tab visibility pause
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // 4. IntersectionObserver off-screen pause
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setIsPaused(true)
        } else if (!document.hidden) {
          setIsPaused(false)
        }
      },
      { threshold: 0.01 }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const [popEffects, setPopEffects] = useState([])

  // 5. Pop interaction handler with particle burst animation
  const popBubble = useCallback((bubbleId, e) => {
    if (!interactive) return

    // Calculate click coordinates for burst animation
    let clickX = 0
    let clickY = 0
    if (e && e.clientX && e.clientY) {
      clickX = e.clientX
      clickY = e.clientY
    } else if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect()
      clickX = rect.left + rect.width / 2
      clickY = rect.top + rect.height / 2
    }

    if (clickX && clickY) {
      const popId = `pop-${Date.now()}-${Math.random()}`
      const droplets = [
        { pdx: '-22px', pdy: '-24px', sz: 5 },
        { pdx: '24px', pdy: '-20px', sz: 4 },
        { pdx: '-20px', pdy: '22px', sz: 4 },
        { pdx: '22px', pdy: '24px', sz: 5 },
        { pdx: '0px', pdy: '-32px', sz: 6 },
        { pdx: '0px', pdy: '30px', sz: 4 },
      ]

      setPopEffects((prev) => [...prev, { id: popId, x: clickX, y: clickY, droplets }])

      setTimeout(() => {
        setPopEffects((prev) => prev.filter((p) => p.id !== popId))
      }, 320)
    }

    // Instantly reset and respawn bubble at bottom
    setBubbles((prev) =>
      prev.map((b) => {
        if (b.id !== bubbleId) return b
        return {
          ...b,
          id: `b-respawn-${Date.now()}-${Math.random()}`,
          size: Math.round(randomRange(16, 48)),
          duration: randomRange(10, 18),
          delay: 0.1, // immediate restart from bottom
          left: randomRange(3, 96),
          sway: Math.round(randomRange(10, 25)) * (Math.random() > 0.5 ? 1 : -1),
          opacity: parseFloat(randomRange(0.75, 0.95).toFixed(2)),
        }
      })
    )
  }, [interactive])

  // Don't render anything if density is 'none' or reduced motion enabled
  if (density === 'none' || prefersReducedMotion) {
    return null
  }

  return (
    <>
      <div
        ref={containerRef}
        className={`oh-bubble-field oh-bubble-field--${zone} ${isPaused ? 'oh-bubble-field--paused' : ''}`}
        aria-hidden="true"
        style={{ pointerEvents: 'none' }}
      >
        {bubbles.map((b) => (
          <div
            key={b.id}
            className={`oh-bubble-item ${
              interactive ? 'oh-bubble-item--interactive' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation()
              popBubble(b.id, e)
            }}
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: `${b.left}%`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
              '--bubble-sway': `${b.sway}px`,
              '--bubble-element-opacity': b.opacity,
              '--bubble-travel-h': zone === 'section' ? '-110%' : '-115vh',
            }}
          />
        ))}
      </div>

      {/* Interactive Pop-Burst Overlay Effects */}
      {popEffects.map((p) => (
        <div
          key={p.id}
          className="oh-pop-burst"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
          }}
          aria-hidden="true"
        >
          <div className="oh-pop-ring" />
          {p.droplets.map((d, idx) => (
            <div
              key={idx}
              className="oh-pop-droplet"
              style={{
                width: `${d.sz}px`,
                height: `${d.sz}px`,
                '--pdx': d.pdx,
                '--pdy': d.pdy,
              }}
            />
          ))}
        </div>
      ))}
    </>
  )
}

export default BubbleField
