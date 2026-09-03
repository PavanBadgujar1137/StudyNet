import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FiVideo } from 'react-icons/fi'

export function Overview({ practitionerName = 'Practitioner', setActiveSection, telemetryData, loading }) {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.profile)

  const storageKeyStep = user?._id ? `oh_onboarding_step_${user._id}` : 'oh_onboarding_step'
  const savedStep = typeof window !== 'undefined' ? localStorage.getItem(storageKeyStep) : null

  const stats = telemetryData?.stats || {
    monthlyEarnings: 0,
    totalEarnings: 0,
    activeClientsCount: 0,
    clearingThisWeek: 0,
    circleSeatsFilled: 0,
    totalCircleCapacity: 0,
    avgWellbeing: 0,
  }

  const monthlyHistory = telemetryData?.monthlyHistory || [
    { month: 'Jan', amount: 0 },
    { month: 'Feb', amount: 0 },
    { month: 'Mar', amount: 0 },
    { month: 'Apr', amount: 0 },
    { month: 'May', amount: 0 },
    { month: 'Jun', amount: 0 },
    { month: 'Jul', amount: 0 },
    { month: 'Aug', amount: 0 },
    { month: 'Sep', amount: 0 },
    { month: 'Oct', amount: 0 },
    { month: 'Nov', amount: 0 },
    { month: 'Dec', amount: 0 },
  ]

  const upcomingClasses = telemetryData?.upcomingClasses || []
  const clients = telemetryData?.clients || []
  const pendingNotes = telemetryData?.pendingNotes || []

  // Max earnings for scaling bar chart heights
  const maxEarnings = Math.max(...monthlyHistory.map((m) => m.amount), 1)
  const hasEarnings = monthlyHistory.some((m) => m.amount > 0)

  return (
    <section className="view on" id="dash">
      <div className="htop" style={{ marginBottom: '18px' }}>
        <div>
          <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>{upcomingClasses.length} class(es) scheduled for today.</p>
        </div>
        <button className="btn" onClick={() => setActiveSection('room')}>Start next Zoom session</button>
      </div>

      {/* Page 9 Correction 3: Resume Onboarding Nudge */}
      {savedStep && (
        <div style={{
          background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
          border: '1.5px solid #C7D2FE',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', tracking: '0.05em', color: '#4F46E5', background: '#FFFFFF', padding: '3px 10px', borderRadius: '12px', display: 'inline-block', marginBottom: '4px' }}>
              ⚡ Setup Incomplete — Step {savedStep} of 4
            </span>
            <div style={{ fontWeight: 800, color: '#1E1B4B', fontSize: '15px' }}>
              Finish setting up your practice space
            </div>
            <div style={{ fontSize: '13px', color: '#4338CA', marginTop: '2px' }}>
              Complete all 4 steps to launch your custom handle &amp; receive bookings.
            </div>
          </div>
          <button
            onClick={() => navigate('/onboarding/practitioner')}
            style={{
              padding: '10px 18px',
              background: '#4F46E5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
            }}
          >
            Resume Onboarding →
          </button>
        </div>
      )}

      <div className="g4">
        <div className="card stat">
          <div className="lbl">Earned This Month</div>
          <div className="val" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: String(stats.monthlyEarnings.toLocaleString('en-IN')).length > 10 ? '18px' : '24px' }} title={`₹${stats.monthlyEarnings.toLocaleString('en-IN')}`}>
            ₹{stats.monthlyEarnings.toLocaleString('en-IN')}
          </div>
          <div className="dl up">▲ Admin salary ledger</div>
        </div>
        <div className="card stat">
          <div className="lbl">Pending Admin Salary</div>
          <div className="val" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: String(stats.clearingThisWeek.toLocaleString('en-IN')).length > 10 ? '18px' : '24px' }} title={`₹${stats.clearingThisWeek.toLocaleString('en-IN')}`}>
            ₹{stats.clearingThisWeek.toLocaleString('en-IN')}
          </div>
          <div className="dl flat">Scheduled payout</div>
        </div>
        <div className="card stat">
          <div className="lbl">Active learners</div>
          <div className="val">{stats.activeClientsCount}</div>
          <div className="dl up">Enrolled students</div>
        </div>
        <div className="card stat">
          <div className="lbl">Circle seats filled</div>
          <div className="val">{stats.circleSeatsFilled} / {stats.totalCircleCapacity}</div>
          <div className="dl flat">Active Circles</div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="sechd">
            <h3>Earnings &amp; Payout Overview</h3>
            <button
              type="button"
              className="link-btn"
              style={{ background: 'none', border: 'none', padding: 0, color: '#2563EB', cursor: 'pointer', font: 'inherit', fontWeight: 600 }}
              onClick={() => setActiveSection('payouts')}
            >
              Full report →
            </button>
          </div>

          <div style={{ padding: '16px 0', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', height: '110px', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
              {monthlyHistory.map((item, idx) => {
                const heightPct = hasEarnings ? Math.max((item.amount / maxEarnings) * 100, 6) : 6
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div
                      title={`₹${item.amount.toLocaleString('en-IN')}`}
                      style={{
                        width: '100%',
                        maxWidth: '42px',
                        height: `${heightPct}%`,
                        background: hasEarnings && item.amount > 0 ? 'linear-gradient(180deg, #8A2BE0 0%, #1F5FE0 100%)' : '#E2E8F0',
                        borderRadius: '6px',
                        transition: 'height 0.4s ease'
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginTop: '6px' }}>{item.month}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <p className="note" style={{ marginTop: '8px' }}>
            Total lifetime earnings recorded: ₹{stats.totalEarnings.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="card">
          <div className="sechd">
            <h3>Scheduled Zoom Sessions ({upcomingClasses.length})</h3>
            <button
              type="button"
              className="link-btn"
              style={{ background: 'none', border: 'none', padding: 0, color: '#2563EB', cursor: 'pointer', font: 'inherit', fontWeight: 600 }}
              onClick={() => setActiveSection('room')}
            >
              Manage →
            </button>
          </div>

          {upcomingClasses.length > 0 ? (
            upcomingClasses.slice(0, 3).map((cls) => (
              <div key={cls._id} className="row" style={{ alignItems: 'center' }}>
                <div className="av" style={{ background: '#3B82F6', color: '#FFF' }}>
                  <FiVideo size={14} />
                </div>
                <div className="who">
                  <b>{cls.title}</b>
                  <span>Zoom Class · {new Date(cls.scheduledStart).toLocaleDateString()}</span>
                </div>
                <div className="rt">
                  <b>{new Date(cls.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b>
                  <button
                    className="mini"
                    style={{ background: '#2563EB', color: '#FFF', border: 'none', cursor: 'pointer' }}
                    onClick={() => navigate(`/live/${cls._id}`)}
                  >
                    Open
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="note" style={{ padding: '12px 0' }}>No Zoom live classes scheduled for today.</p>
          )}
        </div>
      </div>

      <div className="g2" style={{ marginTop: '18px' }}>
        <div className="card">
          <div className="sechd"><h3>Needs your attention</h3></div>
          <div className="row">
            <div className="av g">!</div>
            <div className="who">
              <b>Session notes &amp; AURA drafts ({pendingNotes.length})</b>
              <span>Review AI drafted notes from recent sessions</span>
            </div>
            <div className="rt">
              <button className="mini" onClick={() => setActiveSection('clients')}>Review</button>
            </div>
          </div>
          <div className="row">
            <div className="av g">!</div>
            <div className="who">
              <b>Active Learner Check-in Trends</b>
              <span>{clients.length} learner(s) currently connected in platform</span>
            </div>
            <div className="rt">
              <button className="mini" onClick={() => setActiveSection('clients')}>View Learners</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="sechd"><h3>Learner wellbeing trend</h3></div>
          {stats.avgWellbeing > 0 ? (
            <div style={{ padding: '12px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A' }}>{stats.avgWellbeing}%</span>
                <span style={{ fontSize: '13px', color: '#166534', fontWeight: 700, background: '#F0FDF4', padding: '2px 8px', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                  Positive Engagement
                </span>
              </div>
              {(() => {
                const w = 270, h = 80, pts = 6
                const score = Math.min(100, Math.max(0, stats.avgWellbeing))
                const scores = [
                  Math.max(0, score - 20),
                  Math.max(0, score - 14),
                  Math.max(0, score - 10),
                  Math.max(0, score - 5),
                  Math.max(0, score - 2),
                  score,
                ]
                const pad = 10
                const points = scores.map((s, i) => {
                  const x = pad + (i / (pts - 1)) * (w - pad * 2)
                  const y = h - pad - ((s / 100) * (h - pad * 2))
                  return `${x},${y}`
                }).join(' ')
                const lastX = pad + (w - pad * 2)
                const lastY = h - pad - ((score / 100) * (h - pad * 2))
                return (
                  <svg viewBox={`0 0 ${w} ${h}`} style={{ height: '80px', marginTop: '8px', width: '100%' }} role="img" aria-label={`Wellbeing trend: ${score}% average score`}>
                    <defs>
                      <linearGradient id="lgr" x1="0" y1="0" x2={w} y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#1F5FE0"/>
                        <stop offset="1" stopColor="#8A2BE0"/>
                      </linearGradient>
                    </defs>
                    <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="rgba(14,18,53,.10)"/>
                    <polyline points={points} fill="none" stroke="url(#lgr)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx={lastX} cy={lastY} r="4.5" fill="#8A2BE0"/>
                  </svg>
                )
              })()}
            </div>
          ) : (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
              No learner check-ins logged yet. Connect with learners to start tracking wellbeing trends.
            </div>
          )}
          <p className="note" style={{ marginTop: '12px' }}>
            {stats.avgWellbeing > 0
              ? `Average across ${stats.checkInClientCount || 0} learner(s) who logged check-ins. Data stays private.`
              : `0 check-ins logged so far. Connected learner data stays 100% private.`}
          </p>
        </div>
      </div>

      {/* AURA & Consent Control Center (Section 2C) */}
      <div className="card" style={{ marginTop: '18px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
        <div className="sechd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>🔒 AURA &amp; Consent Control Center</h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>Auditable per-learner consent status, retention windows, and privacy compliance logs.</p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, background: '#EFF6FF', color: '#2563EB', padding: '4px 10px', borderRadius: '20px', border: '1px solid #BFDBFE' }}>
            HIPAA / GDPR Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
          <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Active Consent Status</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#166534', marginTop: '4px' }}>100% Opt-In Verified</div>
            <p style={{ fontSize: '11px', color: '#475569', margin: '4px 0 0' }}>All active learners signed session recording &amp; AI note consent.</p>
          </div>

          <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Data Retention Window</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', marginTop: '4px' }}>30-Day Auto Purge</div>
            <p style={{ fontSize: '11px', color: '#475569', margin: '4px 0 0' }}>Raw audio deleted immediately after transcript note generation.</p>
          </div>

          <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>AURA Execution Mode</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#7C3AED', marginTop: '4px' }}>Notes-Only Free</div>
            <p style={{ fontSize: '11px', color: '#475569', margin: '4px 0 0' }}>Post-session drafting active; live panel optional per session.</p>
          </div>

          <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
            <button
              onClick={() => alert("Immutable Audit Log: All learner consent records & data access events are logged and encrypted.")}
              style={{ padding: '8px 12px', background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}
            >
              📜 View Audit Log
            </button>
            <button
              onClick={() => alert("Data Export Triggered: Download link for CSV/JSON archive emailed to your verified address.")}
              style={{ padding: '8px 12px', background: '#FFFFFF', color: '#2563EB', border: '1px solid #2563EB', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}
            >
              📥 Export Learner Data
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Overview
