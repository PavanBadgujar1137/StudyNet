import React from 'react'
import logoIcon from '../../../assets/Logo/Logo-Icon.png'

function CenterHub({ activeSide = null }) {
  const isLearnerActive = activeSide === "learner" || activeSide === null
  const isPractitionerActive = activeSide === "practitioner" || activeSide === null

  return (
    <div className="pro-center-hub">
      {/* Brand Icon Header */}
      <div className="pro-hub-logo-wrap">
        <img src={logoIcon} alt="OpenHand Logo" className="pro-hub-logo-img" />
      </div>

      {/* Main Professional Telemetry Card */}
      <div className="pro-hub-card">
        <div className="pro-hub-header">
          <span className="pro-hub-badge">OPENHAND ECOSYSTEM</span>
          <h3 className="pro-hub-title">Integrative Care Platform</h3>
          <p className="pro-hub-sub">
            Bridging self-discovery learners with certified holistic practitioners through telemetry &amp; live care.
          </p>
        </div>

        {/* Footer Guarantee */}
        <div className="pro-hub-footer">
          <span>✓ HIPAA Compliant</span>
          <span className="pro-footer-dot">•</span>
          <span>✓ Verified Practitioners</span>
        </div>
      </div>
    </div>
  )
}

export default CenterHub
