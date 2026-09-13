import React from 'react'

function MindMapGraphic({ activeSide = null }) {
  // activeSide can be "learner", "practitioner", or null/both
  const isLearnerActive = activeSide === "learner" || activeSide === null
  const isPractitionerActive = activeSide === "practitioner" || activeSide === null

  return (
    <div className={`mindmap-container ${activeSide ? `mindmap-container--${activeSide}` : ''}`}>
      {/* Background Soft Glow Aura */}
      <div className="mindmap-aura mindmap-aura--left" style={{ opacity: isLearnerActive ? 0.75 : 0.2 }} />
      <div className="mindmap-aura mindmap-aura--right" style={{ opacity: isPractitionerActive ? 0.75 : 0.2 }} />

      {/* Floating Network Energy Particles */}
      <div className="mindmap-particles">
        <span className="mm-particle p1" />
        <span className="mm-particle p2" />
        <span className="mm-particle p3" />
        <span className="mm-particle p4" />
        <span className="mm-particle p5" />
      </div>

      <svg
        viewBox="0 0 420 380"
        className="mindmap-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="learnerTreeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          <linearGradient id="practitionerTreeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          <linearGradient id="trunkGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>

          <linearGradient id="bridgeFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="cyanTreeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="violetTreeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="coreGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── CENTRAL TREE TRUNK & ROOT CONNECTOR ── */}
        <g className="tree-trunk-group">
          {/* Main Root Trunk */}
          <path
            d="M 210 340 
               C 210 290, 205 240, 210 190 
               C 210 150, 210 110, 210 70"
            fill="none"
            stroke="url(#trunkGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#coreGlow)"
          />

          {/* Secondary Intertwined Vines */}
          <path
            d="M 195 330 Q 220 270 200 210 Q 220 150 200 90"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            opacity="0.7"
            className="pulse-line"
          />
          <path
            d="M 225 330 Q 200 270 220 210 Q 200 150 220 90"
            fill="none"
            stroke="#C084FC"
            strokeWidth="2"
            opacity="0.7"
            className="pulse-line"
          />

          {/* Root Base Ring */}
          <ellipse cx="210" cy="335" rx="35" ry="12" fill="none" stroke="url(#bridgeFlowGrad)" strokeWidth="2" opacity="0.6" />
          <circle cx="210" cy="335" r="5" fill="#2563EB" />

          {/* Central Synergy Core Node */}
          <g transform="translate(210, 190)">
            <circle cx="0" cy="0" r="22" fill="#FFFFFF" stroke="url(#bridgeFlowGrad)" strokeWidth="3.5" filter="url(#coreGlow)" />
            <circle cx="0" cy="0" r="14" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3 3" className="spin-slow" />
            <circle cx="0" cy="0" r="6" fill="#2563EB" className="pulse-core" />
          </g>
        </g>

        {/* ── LEFT BRANCHES: LEARNER GROWTH NETWORK (CYAN / TEAL / EMERALD) ── */}
        <g
          className={`mindmap-side mindmap-side--left ${isLearnerActive ? 'active' : 'dim'}`}
          filter={isLearnerActive ? "url(#cyanTreeGlow)" : "none"}
        >
          {/* Main Left Branches */}
          <path d="M 210 190 C 170 170, 120 160, 75 140" fill="none" stroke="url(#learnerTreeGrad)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 210 230 C 160 220, 110 230, 65 240" fill="none" stroke="url(#learnerTreeGrad)" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 210 130 C 160 110, 120 80, 85 60" fill="none" stroke="url(#learnerTreeGrad)" strokeWidth="3" strokeLinecap="round" />

          {/* Sub-branches (Left) */}
          <path d="M 120 160 Q 90 180 60 190" fill="none" stroke="#10B981" strokeWidth="1.8" />
          <path d="M 160 110 Q 130 90 105 100" fill="none" stroke="#0EA5E9" strokeWidth="1.8" />
          <path d="M 110 230 Q 80 260 50 270" fill="none" stroke="#3B82F6" strokeWidth="1.8" />

          {/* Leaf Nodes & Badges (Left) */}
          {/* Node 1: Wellness */}
          <g transform="translate(85, 60)" className="tree-node">
            <circle cx="0" cy="0" r="14" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="6" fill="#0EA5E9" className="pulse-node-1" />
            <text x="-35" y="-18" fill="#0284C7" fontSize="10.5" fontWeight="700" className="tree-node-label">Daily Check-ins</text>
          </g>

          {/* Node 2: Growth Circles */}
          <g transform="translate(75, 140)" className="tree-node">
            <circle cx="0" cy="0" r="16" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.8" />
            <circle cx="0" cy="0" r="7" fill="#10B981" className="pulse-node-2" />
            <text x="-40" y="28" fill="#047857" fontSize="10.5" fontWeight="700" className="tree-node-label">Growth Circles</text>
          </g>

          {/* Node 3: Live Video Sessions */}
          <g transform="translate(65, 240)" className="tree-node">
            <circle cx="0" cy="0" r="15" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="6.5" fill="#2563EB" className="pulse-node-3" />
            <text x="-35" y="28" fill="#1D4ED8" fontSize="10.5" fontWeight="700" className="tree-node-label">Live HD Sessions</text>
          </g>

          {/* Minor Sub-nodes (Left) */}
          <circle cx="60" cy="190" r="5" fill="#0EA5E9" />
          <circle cx="105" cy="100" r="5.5" fill="#10B981" />
          <circle cx="50" cy="270" r="4.5" fill="#3B82F6" />
        </g>

        {/* ── RIGHT BRANCHES: PRACTITIONER MASTERY NETWORK (VIOLET / PURPLE / PINK) ── */}
        <g
          className={`mindmap-side mindmap-side--right ${isPractitionerActive ? 'active' : 'dim'}`}
          filter={isPractitionerActive ? "url(#violetTreeGlow)" : "none"}
        >
          {/* Main Right Branches */}
          <path d="M 210 190 C 250 170, 300 160, 345 140" fill="none" stroke="url(#practitionerTreeGrad)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 210 230 C 260 220, 310 230, 355 240" fill="none" stroke="url(#practitionerTreeGrad)" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 210 130 C 260 110, 300 80, 335 60" fill="none" stroke="url(#practitionerTreeGrad)" strokeWidth="3" strokeLinecap="round" />

          {/* Sub-branches (Right) */}
          <path d="M 300 160 Q 330 180 360 190" fill="none" stroke="#EC4899" strokeWidth="1.8" />
          <path d="M 260 110 Q 290 90 315 100" fill="none" stroke="#7C3AED" strokeWidth="1.8" />
          <path d="M 310 230 Q 340 260 370 270" fill="none" stroke="#8B5CF6" strokeWidth="1.8" />

          {/* Leaf Nodes & Badges (Right) */}
          {/* Node 1: Practice Hub */}
          <g transform="translate(335, 60)" className="tree-node">
            <circle cx="0" cy="0" r="14" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="6" fill="#7C3AED" className="pulse-node-2" />
            <text x="-5" y="-18" fill="#6D28D9" fontSize="10.5" fontWeight="700" className="tree-node-label">Practice Space</text>
          </g>

          {/* Node 2: AURA Co-Pilot */}
          <g transform="translate(345, 140)" className="tree-node">
            <circle cx="0" cy="0" r="16" fill="#FFFFFF" stroke="#EC4899" strokeWidth="2.8" />
            <circle cx="0" cy="0" r="7" fill="#EC4899" className="pulse-node-1" />
            <text x="-10" y="28" fill="#BE185D" fontSize="10.5" fontWeight="700" className="tree-node-label">AURA Co-Pilot</text>
          </g>

          {/* Node 3: Telemetry Analytics */}
          <g transform="translate(355, 240)" className="tree-node">
            <circle cx="0" cy="0" r="15" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="6.5" fill="#8B5CF6" className="pulse-node-3" />
            <text x="-15" y="28" fill="#5B21B6" fontSize="10.5" fontWeight="700" className="tree-node-label">Client Telemetry</text>
          </g>

          {/* Minor Sub-nodes (Right) */}
          <circle cx="360" cy="190" r="5" fill="#EC4899" />
          <circle cx="315" cy="100" r="5.5" fill="#7C3AED" />
          <circle cx="370" cy="270" r="4.5" fill="#8B5CF6" />
        </g>
      </svg>

      {/* Central Interactive Status Pills */}
      <div className="mindmap-center-badge">
        <div className="mindmap-badge-pill mindmap-badge-pill--learner" style={{ transform: isLearnerActive ? 'scale(1.05)' : 'scale(0.95)' }}>
          <span className="dot dot--cyan" />
          <span>Learner Growth</span>
        </div>

        <div className="mindmap-badge-connector">
          <span className="mindmap-spark-dot" />
        </div>

        <div className="mindmap-badge-pill mindmap-badge-pill--practitioner" style={{ transform: isPractitionerActive ? 'scale(1.05)' : 'scale(0.95)' }}>
          <span className="dot dot--violet" />
          <span>Practitioner Mastery</span>
        </div>
      </div>
    </div>
  )
}

export default MindMapGraphic
