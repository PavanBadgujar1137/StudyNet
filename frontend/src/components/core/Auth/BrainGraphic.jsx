import React from 'react'

function BrainGraphic({ activeSide = null }) {
  // activeSide can be "learner", "practitioner", or null/both
  const isLearnerActive = activeSide === "learner" || activeSide === null
  const isPractitionerActive = activeSide === "practitioner" || activeSide === null

  return (
    <div className={`brain-ui-container ${activeSide ? `brain-ui-container--${activeSide}` : ''}`}>
      {/* Background Soft Glow Aura */}
      <div className="brain-aura brain-aura--left" style={{ opacity: isLearnerActive ? 0.8 : 0.2 }} />
      <div className="brain-aura brain-aura--right" style={{ opacity: isPractitionerActive ? 0.8 : 0.2 }} />

      {/* Floating Synapse Particles */}
      <div className="brain-particles">
        <span className="brain-particle p1" />
        <span className="brain-particle p2" />
        <span className="brain-particle p3" />
        <span className="brain-particle p4" />
        <span className="brain-particle p5" />
      </div>

      <svg
        viewBox="0 0 400 360"
        className="brain-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="learnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          <linearGradient id="practitionerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="50%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="purpleGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="intenseGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── CENTRAL CORPUS CALLOSUM BRIDGE (SYNAPSE FLOW) ── */}
        <g className="brain-bridge-group">
          {/* Bridge Arcs */}
          <path d="M 180 110 Q 200 95 220 110" fill="none" stroke="url(#bridgeGrad)" strokeWidth="2.5" strokeDasharray="4 3" className="pulse-line" />
          <path d="M 175 145 Q 200 130 225 145" fill="none" stroke="url(#bridgeGrad)" strokeWidth="3" />
          <path d="M 170 180 Q 200 165 230 180" fill="none" stroke="url(#bridgeGrad)" strokeWidth="3.5" filter="url(#intenseGlow)" />
          <path d="M 175 215 Q 200 230 225 215" fill="none" stroke="url(#bridgeGrad)" strokeWidth="3" />
          <path d="M 180 250 Q 200 265 220 250" fill="none" stroke="url(#bridgeGrad)" strokeWidth="2.5" strokeDasharray="4 3" className="pulse-line" />

          {/* Central Energy Core Circle */}
          <circle cx="200" cy="180" r="26" fill="#FFFFFF" stroke="url(#bridgeGrad)" strokeWidth="3" filter="url(#intenseGlow)" />
          <circle cx="200" cy="180" r="16" fill="none" stroke="#2563EB" strokeWidth="1.5" opacity="0.6" className="spin-slow" />
          <circle cx="200" cy="180" r="6" fill="#2563EB" className="pulse-core" />
        </g>

        {/* ── LEFT HEMISPHERE: LEARNER (CYAN / TEAL / BLUE) ── */}
        <g
          className={`brain-hemisphere brain-hemisphere--left ${isLearnerActive ? 'active' : 'dim'}`}
          filter={isLearnerActive ? "url(#cyanGlow)" : "none"}
        >
          {/* Left Brain Outline Lobes */}
          <path
            d="M 190 65 
               C 130 55, 70 85, 55 140 
               C 40 195, 60 245, 100 280 
               C 140 310, 180 300, 190 285 
               C 175 230, 175 120, 190 65 Z"
            fill="rgba(14, 165, 233, 0.07)"
            stroke="url(#learnerGrad)"
            strokeWidth={isLearnerActive ? "3.5" : "2"}
            className="brain-lobe-path"
          />

          {/* Inner Neural Sulci & Gyri Curves (Left) */}
          <path d="M 180 85 Q 120 100 100 135 Q 85 160 120 185" fill="none" stroke="#0EA5E9" strokeWidth="2.2" opacity="0.85" />
          <path d="M 175 125 Q 140 145 105 180 Q 80 210 115 240" fill="none" stroke="#10B981" strokeWidth="2.2" opacity="0.85" />
          <path d="M 180 170 Q 150 190 130 220 Q 110 250 155 265" fill="none" stroke="#2563EB" strokeWidth="2.2" opacity="0.85" />

          {/* Left Neural Synapse Lines */}
          <line x1="175" y1="90" x2="135" y2="110" stroke="#0EA5E9" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="135" y1="110" x2="90" y2="140" stroke="#10B981" strokeWidth="1.5" />
          <line x1="90" y1="140" x2="110" y2="195" stroke="#0EA5E9" strokeWidth="1.5" />
          <line x1="110" y1="195" x2="150" y2="235" stroke="#2563EB" strokeWidth="1.5" />
          <line x1="150" y1="235" x2="175" y2="260" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Synaptic Energy Nodes (Left) */}
          <circle cx="175" cy="90" r="5" fill="#0EA5E9" className="synapse-node" />
          <circle cx="135" cy="110" r="6" fill="#10B981" className="synapse-node pulse-node-1" />
          <circle cx="90" cy="140" r="7" fill="#0EA5E9" className="synapse-node pulse-node-2" />
          <circle cx="110" cy="195" r="5" fill="#2563EB" className="synapse-node pulse-node-3" />
          <circle cx="150" cy="235" r="6.5" fill="#10B981" className="synapse-node pulse-node-1" />
          <circle cx="175" cy="260" r="5" fill="#0EA5E9" className="synapse-node" />

          {/* Glowing Pulse Rings around key nodes */}
          {isLearnerActive && (
            <>
              <circle cx="90" cy="140" r="14" fill="none" stroke="#0EA5E9" strokeWidth="1.5" opacity="0.6" className="ring-pulse" />
              <circle cx="150" cy="235" r="15" fill="none" stroke="#10B981" strokeWidth="1.5" opacity="0.6" className="ring-pulse-delay" />
            </>
          )}
        </g>

        {/* ── RIGHT HEMISPHERE: PRACTITIONER (VIOLET / PINK / PURPLE) ── */}
        <g
          className={`brain-hemisphere brain-hemisphere--right ${isPractitionerActive ? 'active' : 'dim'}`}
          filter={isPractitionerActive ? "url(#purpleGlow)" : "none"}
        >
          {/* Right Brain Outline Lobes */}
          <path
            d="M 210 65 
               C 270 55, 330 85, 345 140 
               C 360 195, 340 245, 300 280 
               C 260 310, 220 300, 210 285 
               C 225 230, 225 120, 210 65 Z"
            fill="rgba(124, 58, 237, 0.07)"
            stroke="url(#practitionerGrad)"
            strokeWidth={isPractitionerActive ? "3.5" : "2"}
            className="brain-lobe-path"
          />

          {/* Inner Neural Sulci & Gyri Curves (Right) */}
          <path d="M 220 85 Q 280 100 300 135 Q 315 160 280 185" fill="none" stroke="#7C3AED" strokeWidth="2.2" opacity="0.85" />
          <path d="M 225 125 Q 260 145 295 180 Q 320 210 285 240" fill="none" stroke="#EC4899" strokeWidth="2.2" opacity="0.85" />
          <path d="M 220 170 Q 250 190 270 220 Q 290 250 245 265" fill="none" stroke="#8B5CF6" strokeWidth="2.2" opacity="0.85" />

          {/* Right Neural Synapse Lines */}
          <line x1="225" y1="90" x2="265" y2="110" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="265" y1="110" x2="310" y2="140" stroke="#EC4899" strokeWidth="1.5" />
          <line x1="310" y1="140" x2="290" y2="195" stroke="#7C3AED" strokeWidth="1.5" />
          <line x1="290" y1="195" x2="250" y2="235" stroke="#8B5CF6" strokeWidth="1.5" />
          <line x1="250" y1="235" x2="225" y2="260" stroke="#EC4899" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Synaptic Energy Nodes (Right) */}
          <circle cx="225" cy="90" r="5" fill="#7C3AED" className="synapse-node" />
          <circle cx="265" cy="110" r="6" fill="#EC4899" className="synapse-node pulse-node-2" />
          <circle cx="310" cy="140" r="7" fill="#7C3AED" className="synapse-node pulse-node-1" />
          <circle cx="290" cy="195" r="5" fill="#8B5CF6" className="synapse-node pulse-node-3" />
          <circle cx="250" cy="235" r="6.5" fill="#EC4899" className="synapse-node pulse-node-2" />
          <circle cx="225" cy="260" r="5" fill="#7C3AED" className="synapse-node" />

          {/* Glowing Pulse Rings around key nodes */}
          {isPractitionerActive && (
            <>
              <circle cx="310" cy="140" r="14" fill="none" stroke="#7C3AED" strokeWidth="1.5" opacity="0.6" className="ring-pulse" />
              <circle cx="250" cy="235" r="15" fill="none" stroke="#EC4899" strokeWidth="1.5" opacity="0.6" className="ring-pulse-delay" />
            </>
          )}
        </g>
      </svg>

      {/* Central Interactive Status Pills */}
      <div className="brain-center-badge">
        <div className="brain-badge-pill brain-badge-pill--learner" style={{ transform: isLearnerActive ? 'scale(1.05)' : 'scale(0.95)' }}>
          <span className="dot dot--cyan" />
          <span>Learner Mind</span>
        </div>

        <div className="brain-badge-connector">
          <span className="brain-spark-dot" />
        </div>

        <div className="brain-badge-pill brain-badge-pill--practitioner" style={{ transform: isPractitionerActive ? 'scale(1.05)' : 'scale(0.95)' }}>
          <span className="dot dot--violet" />
          <span>Practitioner Wisdom</span>
        </div>
      </div>
    </div>
  )
}

export default BrainGraphic
