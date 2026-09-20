import React from 'react'

function TechBrainGraphic({ activeSide = null }) {
  const isLearnerActive = activeSide === "learner" || activeSide === null
  const isPractitionerActive = activeSide === "practitioner" || activeSide === null

  return (
    <div className={`tech-brain-container ${activeSide ? `tech-brain-container--${activeSide}` : ''}`}>
      <svg
        viewBox="0 0 440 400"
        className="tech-brain-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── LEFT HEMISPHERE: AUTHENTIC ANATOMICAL BRAIN (LEARNER - CYAN) ── */}
        <g
          className={`tech-hemisphere tech-hemisphere--left ${isLearnerActive ? 'active' : 'dim'}`}
          style={{
            opacity: isLearnerActive ? 1 : 0.45,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: '214px 200px'
          }}
        >
          {/* Anatomical Brain Lobe Silhouette Path (Left) */}
          <path
            d="M 214 45
               C 165 45, 125 55, 95 80
               C 65 105, 45 140, 40 180
               C 35 210, 45 235, 60 250
               C 42 265, 38 290, 52 315
               C 68 340, 100 355, 135 350
               C 165 345, 195 355, 214 350
               Z"
            fill="#F0F9FF"
            stroke="#0284C7"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cerebellum Lobe Separation Line (Left) */}
          <path
            d="M 60 250 C 95 240, 150 255, 214 265"
            fill="none"
            stroke="#0284C7"
            strokeWidth="3.5"
            opacity="0.4"
            strokeDasharray="5 4"
          />

          {/* Gyri & Sulci Brain Folds + PCB Circuit Hybrid Lines (Left) */}
          <g stroke="#0284C7" strokeWidth="5.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Frontal Lobe Circuit */}
            <path d="M 208 85 L 145 85 L 145 125 L 90 125" />
            <path d="M 145 85 L 175 58" />

            {/* Parietal / Temporal Circuit */}
            <path d="M 208 140 L 125 140 L 85 175 L 85 210" />

            {/* Occipital / Central Bus */}
            <path d="M 208 190 L 140 235 L 140 275 L 95 320" />
            <path d="M 140 235 L 180 235" />

            {/* Cerebellum Circuit (Bottom Lobe) */}
            <path d="M 208 295 L 150 295 L 125 315" />
          </g>

          {/* Solid 2D Node Pads (Left) */}
          <g fill="#FFFFFF" stroke="#0284C7" strokeWidth="4">
            <circle cx="175" cy="58" r="7" />
            <circle cx="90" cy="125" r="7.5" />
            <circle cx="85" cy="210" r="7.5" />
            <circle cx="180" cy="235" r="6.5" />
            <circle cx="95" cy="320" r="7.5" />
            <circle cx="125" cy="315" r="6.5" />
          </g>
        </g>

        {/* ── RIGHT HEMISPHERE: AUTHENTIC ANATOMICAL BRAIN (PRACTITIONER - VIOLET SOLID) ── */}
        <g
          className={`tech-hemisphere tech-hemisphere--right ${isPractitionerActive ? 'active' : 'dim'}`}
          style={{
            opacity: isPractitionerActive ? 1 : 0.45,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: '226px 200px'
          }}
        >
          {/* Anatomical Brain Lobe Silhouette Path (Right - Solid Violet Fill) */}
          <path
            d="M 226 45
               C 275 45, 315 55, 345 80
               C 375 105, 395 140, 400 180
               C 405 210, 395 235, 380 250
               C 398 265, 402 290, 388 315
               C 372 340, 340 355, 305 350
               C 275 345, 245 355, 226 350
               Z"
            fill="#7C3AED"
            stroke="#7C3AED"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cerebellum Lobe Separation Line (Right) */}
          <path
            d="M 380 250 C 345 240, 290 255, 226 265"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            opacity="0.4"
            strokeDasharray="5 4"
          />

          {/* White Gyri / PCB Circuit Hybrid Lines (Right) */}
          <g stroke="#FFFFFF" strokeWidth="5.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Frontal Lobe Circuit */}
            <path d="M 232 80 L 280 80 L 310 110 L 310 140 L 345 170" />
            <path d="M 232 105 L 270 105 L 295 130 L 295 170 L 325 200" />

            {/* Temporal / Parietal Circuit */}
            <path d="M 232 145 L 260 145 L 280 165 L 280 210 L 310 240" />
            <path d="M 232 195 L 265 228 L 265 270 L 305 310 L 335 310" />

            {/* Cerebellum Circuit */}
            <path d="M 232 285 L 275 285 L 300 310 L 330 310" />
            <path d="M 232 330 L 265 330 L 285 342" />

            {/* Outer Contact Rays */}
            <path d="M 310 110 L 348 110 M 345 170 L 370 170 M 325 200 L 352 227" />
          </g>

          {/* Solid White Node Pads (Right) */}
          <g fill="#7C3AED" stroke="#FFFFFF" strokeWidth="4">
            <circle cx="348" cy="110" r="7.5" />
            <circle cx="345" cy="170" r="8" />
            <circle cx="370" cy="170" r="6.5" />
            <circle cx="352" cy="227" r="7.5" />
            <circle cx="335" cy="310" r="7.5" />
            <circle cx="330" cy="310" r="6.5" />
            <circle cx="285" cy="342" r="6.5" />
          </g>
        </g>

        {/* ── CLEAN CENTER DIVIDER ── */}
        <g className="tech-center-divider">
          <line x1="220" y1="36" x2="220" y2="364" stroke="#94A3B8" strokeWidth="3.5" />
          <circle cx="220" cy="200" r="11" fill="#FFFFFF" stroke="#475569" strokeWidth="3" />
          <circle cx="220" cy="200" r="4.5" fill="#2563EB" />
        </g>
      </svg>

      {/* Central Clean Status Pills */}
      <div className="tech-brain-center-badge">
        <div className="tech-badge-pill tech-badge-pill--learner">
          <span className="dot dot--cyan" />
          <span>Learner Mind</span>
        </div>

        <div className="tech-badge-connector">
          <span className="tech-spark-dot" />
        </div>

        <div className="tech-badge-pill tech-badge-pill--practitioner">
          <span className="dot dot--violet" />
          <span>Practitioner Wisdom</span>
        </div>
      </div>
    </div>
  )
}

export default TechBrainGraphic
