import React from 'react'
import { HiAcademicCap, HiBadgeCheck } from 'react-icons/hi'
import logoIcon from '../../../assets/Logo/Logo-Icon.png'

function SynergyHubVisual({ activeSide = null }) {
  const isLearnerActive = activeSide === "learner" || activeSide === null
  const isPractitionerActive = activeSide === "practitioner" || activeSide === null

  return (
    <div className={`synergy-visual-container ${activeSide ? `synergy-visual-container--${activeSide}` : ''}`}>
      {/* Central OpenHand Infinity Logo Visual (Floating & Big) */}
      <div className="synergy-hero-graphic">
        {/* Cyan Energy Beam (Left) */}
        <div className="synergy-beam synergy-beam--left" style={{ opacity: isLearnerActive ? 1 : 0.25 }} />
        
        {/* Violet Energy Beam (Right) */}
        <div className="synergy-beam synergy-beam--right" style={{ opacity: isPractitionerActive ? 1 : 0.25 }} />

        {/* Central Logo Ring Container */}
        <div className="synergy-core-ring">
          <div className="synergy-orbit-ring spin-slow" />
          <div className="synergy-pulse-ring" />
          <img src={logoIcon} alt="OpenHand" className="synergy-logo-img" />
        </div>

        {/* Orbiting Satellite Nodes */}
        <div className="synergy-satellites">
          <div className="synergy-node sat-learner" style={{ opacity: isLearnerActive ? 1 : 0.4 }}>
            <HiAcademicCap size={24} color="#0284C7" />
          </div>
          <div className="synergy-node sat-practitioner" style={{ opacity: isPractitionerActive ? 1 : 0.4 }}>
            <HiBadgeCheck size={24} color="#7C3AED" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SynergyHubVisual
