import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import SignupForm from '../components/core/Auth/SignupForm'
import SynergyHubVisual from '../components/core/Auth/SynergyHubVisual'
import { ACCOUNT_TYPE } from '../utils/constants'

function Signup() {
  const { loading } = useSelector((state) => state.auth)
  const [activeSide, setActiveSide] = useState(null) // "learner" | "practitioner" | null
  const [mobileTab, setMobileTab] = useState('learner') // For responsive small screens

  return (
    <div className="split-auth-page">
      {/* Background Ambient Grid */}
      <div className="split-bg-grid" />
      <div className="split-blob split-blob--learner" />
      <div className="split-blob split-blob--practitioner" />

      {/* NOTE: No duplicate navbar here! The global Navbar is rendered by App layout */}

      {loading ? (
        <div className="auth-spinner-wrap">
          <div className="auth-spinner" />
        </div>
      ) : (
        <main className="split-main-container">
          {/* Headline Bar */}
          <div className="split-headline">
            <h1 className="split-headline-title">
              Join the OpenHand <span className="text-cyan-glow">Integrative Platform</span>
            </h1>
            <p className="split-headline-sub">
              Register below to begin your journey as a Learner or build your practice space as a Practitioner
            </p>

            {/* Mobile Tab Switcher (Visible on < 1024px) */}
            <div className="split-mobile-toggle">
              <button
                type="button"
                className={`split-mobile-btn ${mobileTab === 'learner' ? 'split-mobile-btn--learner' : ''}`}
                onClick={() => {
                  setMobileTab('learner')
                  setActiveSide('learner')
                }}
              >
                🧘 Learner Registration
              </button>
              <button
                type="button"
                className={`split-mobile-btn ${mobileTab === 'practitioner' ? 'split-mobile-btn--practitioner' : ''}`}
                onClick={() => {
                  setMobileTab('practitioner')
                  setActiveSide('practitioner')
                }}
              >
                🪷 Practitioner Registration
              </button>
            </div>
          </div>

          {/* 3-Column Split Grid */}
          <div className={`split-grid ${mobileTab ? `show-mobile-${mobileTab}` : ''}`}>
            {/* ── LEFT COLUMN: LEARNER REGISTRATION ── */}
            <section
              className={`split-col split-col--learner ${activeSide === 'learner' ? 'split-col--active' : ''}`}
              onMouseEnter={() => setActiveSide('learner')}
            >
              <div className="split-card-header">
                <div className="split-badge split-badge--cyan">
                  <span>🧘</span> LEARNER PORTAL
                </div>
                <h2 className="split-card-title">Learner Registration</h2>
                <p className="split-card-desc">
                  Begin your journey of healing, connect with verified practitioners, and track your daily reflections.
                </p>

                <div className="split-pills-row">
                  <span className="split-pill split-pill--cyan">📹 HD Sessions</span>
                  <span className="split-pill split-pill--cyan">🌿 Wellness Circles</span>
                  <span className="split-pill split-pill--cyan">📊 Daily Telemetry</span>
                </div>
              </div>

              <div className="split-card-body">
                <SignupForm
                  fixedAccountType={ACCOUNT_TYPE.CLIENT}
                  themeColor="cyan"
                  onFormFocus={() => setActiveSide('learner')}
                />
              </div>
            </section>

            {/* ── CENTER COLUMN: ANIMATED UI GRAPHIC COMPONENT ── */}
            <section className="split-col split-col--center">
              <SynergyHubVisual activeSide={activeSide} />
            </section>

            {/* ── RIGHT COLUMN: PRACTITIONER REGISTRATION ── */}
            <section
              className={`split-col split-col--practitioner ${activeSide === 'practitioner' ? 'split-col--active' : ''}`}
              onMouseEnter={() => setActiveSide('practitioner')}
            >
              <div className="split-card-header">
                <div className="split-badge split-badge--violet">
                  <span>🪷</span> PRACTITIONER PORTAL
                </div>
                <h2 className="split-card-title">Practitioner Registration</h2>
                <p className="split-card-desc">
                  Build your integrative practice space, host live video sessions, and manage telemetry analytics.
                </p>

                <div className="split-pills-row">
                  <span className="split-pill split-pill--violet">💼 Practice Hub</span>
                  <span className="split-pill split-pill--violet">📈 Client Analytics</span>
                  <span className="split-pill split-pill--violet">⚡ AI Co-Pilot</span>
                </div>
              </div>

              <div className="split-card-body">
                <SignupForm
                  fixedAccountType={ACCOUNT_TYPE.PRACTITIONER}
                  themeColor="violet"
                  onFormFocus={() => setActiveSide('practitioner')}
                />
              </div>
            </section>
          </div>
        </main>
      )}
    </div>
  )
}

export default Signup
