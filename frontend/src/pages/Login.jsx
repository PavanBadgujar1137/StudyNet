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
import LoginForm from '../components/core/Auth/LoginForm'
import SynergyHubVisual from '../components/core/Auth/SynergyHubVisual'

function Login() {
  const { loading } = useSelector((state) => state.auth)
  const [activeSide, setActiveSide] = useState(null) // "learner" | "practitioner" | null
  const [mobileTab, setMobileTab] = useState('learner') // For responsive small screens

  return (
    <div className="split-auth-page">
      {/* Background Ambient Grid */}
      <div className="split-bg-grid" />
      <div className="split-blob split-blob--learner" />
      <div className="split-blob split-blob--practitioner" />

      {loading ? (
        <div className="auth-spinner-wrap">
          <div className="auth-spinner" />
        </div>
      ) : (
        <main className="split-main-container">
          {/* Headline Bar */}
          <div className="split-headline">
            <h1 className="split-headline-title">
              Welcome Back to <span className="text-cyan-glow">OpenHand</span>
            </h1>
            <p className="split-headline-sub">
              Sign in below to continue your journey as a Learner or manage your practice space as a Practitioner
            </p>

            {/* Mobile Tab Switcher (Visible on < 1024px) */}
            <div className="split-mobile-toggle">
              <button
                type="button"
                className={`split-mobile-btn ${mobileTab === 'learner' ? 'split-mobile-btn--learner' : ''}`}
                onClick={() => {
                  setMobileTab('learner')
                  setActiveSide('learner')
                  window.__activeAuthRole = 'Learner'
                  sessionStorage.setItem('socialAuthAccountType', 'Learner')
                }}
              >
                <HiAcademicCap style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} size={18} /> Sign In as Learner
              </button>
              <button
                type="button"
                className={`split-mobile-btn ${mobileTab === 'practitioner' ? 'split-mobile-btn--practitioner' : ''}`}
                onClick={() => {
                  setMobileTab('practitioner')
                  setActiveSide('practitioner')
                  window.__activeAuthRole = 'Practitioner'
                  sessionStorage.setItem('socialAuthAccountType', 'Practitioner')
                }}
              >
                <HiBadgeCheck style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} size={18} /> Sign In as Practitioner
              </button>
            </div>
          </div>

          {/* 3-Column Split Grid */}
          <div className={`split-grid ${mobileTab ? `show-mobile-${mobileTab}` : ''}`}>
            {/* ── LEFT COLUMN: LEARNER LOGIN ── */}
            <section
              className={`split-col split-col--learner ${activeSide === 'learner' ? 'split-col--active' : ''}`}
              onMouseEnter={() => {
                setActiveSide('learner')
                window.__activeAuthRole = 'Learner'
                sessionStorage.setItem('socialAuthAccountType', 'Learner')
              }}
            >
              <div className="split-card-header">
                <h2 className="split-card-title split-card-title--cyan">Learner Sign In</h2>
                <p className="split-card-desc">
                  Access your daily check-ins, join live Zoom classes, participate in wellness circles, and track reflections.
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
                <LoginForm
                  roleTitle="Learner"
                  themeColor="cyan"
                  onFormFocus={() => {
                    setActiveSide('learner')
                    window.__activeAuthRole = 'Learner'
                    sessionStorage.setItem('socialAuthAccountType', 'Learner')
                  }}
                />
              </div>
            </section>

            {/* ── CENTER COLUMN: ANIMATED UI GRAPHIC COMPONENT ── */}
            <section className="split-col split-col--center">
              <SynergyHubVisual activeSide={activeSide} />
            </section>

            {/* ── RIGHT COLUMN: PRACTITIONER LOGIN ── */}
            <section
              className={`split-col split-col--practitioner ${activeSide === 'practitioner' ? 'split-col--active' : ''}`}
              onMouseEnter={() => {
                setActiveSide('practitioner')
                window.__activeAuthRole = 'Practitioner'
                sessionStorage.setItem('socialAuthAccountType', 'Practitioner')
              }}
            >
              <div className="split-card-header">
                <h2 className="split-card-title split-card-title--violet">Practitioner Sign In</h2>
                <p className="split-card-desc">
                  Manage your client sessions, host live classes, utilize AI Co-Pilot notes, and monitor your practice earnings.
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
                <LoginForm
                  roleTitle="Practitioner"
                  themeColor="violet"
                  onFormFocus={() => {
                    setActiveSide('practitioner')
                    window.__activeAuthRole = 'Practitioner'
                    sessionStorage.setItem('socialAuthAccountType', 'Practitioner')
                  }}
                />
              </div>
            </section>
          </div>
        </main>
      )}
    </div>
  )
}

export default Login
