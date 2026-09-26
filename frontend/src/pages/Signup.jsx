import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  HiAcademicCap,
  HiBadgeCheck,
  HiVideoCamera,
  HiUserGroup,
  HiSparkles,
  HiBriefcase,
  HiChartPie,
  HiLightningBolt
} from 'react-icons/hi'
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
              Welcome to <span className="text-cyan-glow">OpenHand</span>
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
                <HiAcademicCap style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} size={18} /> Become a Learner
              </button>
              <button
                type="button"
                className={`split-mobile-btn ${mobileTab === 'practitioner' ? 'split-mobile-btn--practitioner' : ''}`}
                onClick={() => {
                  setMobileTab('practitioner')
                  setActiveSide('practitioner')
                }}
              >
                <HiBadgeCheck style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} size={18} /> Become a Practitioner
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
                <h2 className="split-card-title split-card-title--cyan">Become a Learner</h2>
                <p className="split-card-desc">
                  Begin your journey of healing, connect with verified practitioners, and track your daily reflections.
                </p>

                <div className="split-pills-row">
                  <span className="split-pill split-pill--cyan">
                    <HiVideoCamera /> <span>Mentorship</span>
                  </span>
                  <span className="split-pill split-pill--cyan">
                    <HiUserGroup /> <span>Wellness Circles</span>
                  </span>
                  <span className="split-pill split-pill--cyan">
                    <HiSparkles /> <span>Daily Reflections</span>
                  </span>
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
                <h2 className="split-card-title split-card-title--violet">Become a Practitioner</h2>
                <p className="split-card-desc">
                  Empower your healing practice, offer 1:1 mentorship, and scale your client impact seamlessly.
                </p>

                <div className="split-pills-row">
                  <span className="split-pill split-pill--violet">
                    <HiBriefcase /> <span>Practice Hub</span>
                  </span>
                  <span className="split-pill split-pill--violet">
                    <HiChartPie /> <span>Client Analytics</span>
                  </span>
                  <span className="split-pill split-pill--violet">
                    <HiLightningBolt /> <span>AI Co-Pilot</span>
                  </span>
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
