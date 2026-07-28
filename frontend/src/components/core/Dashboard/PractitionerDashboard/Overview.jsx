import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiVideo, FiTrendingUp, FiCheckCircle } from 'react-icons/fi'

export function Overview({ practitionerName = 'Practitioner', setActiveSection, telemetryData, loading }) {
  const navigate = useNavigate()
  const firstName = practitionerName.replace('Dr. ', '').split(' ')[0]

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
      <div className="htop">
        <div>
          <div className="crumb">Dashboard</div>
          <h1>Good day, {firstName}.</h1>
          <p>{upcomingClasses.length} class(es) scheduled for today.</p>
        </div>
        <button className="btn" onClick={() => setActiveSection('room')}>Start next Zoom session</button>
      </div>

      <div className="g4">
        <div className="card stat">
          <div className="lbl">This month</div>
          <div className="val">₹{stats.monthlyEarnings.toLocaleString('en-IN')}</div>
          <div className="dl up">▲ Live from database</div>
        </div>
        <div className="card stat">
          <div className="lbl">Clearing Thursday</div>
          <div className="val">₹{stats.clearingThisWeek.toLocaleString('en-IN')}</div>
          <div className="dl flat">Weekly payout queue</div>
        </div>
        <div className="card stat">
          <div className="lbl">Active clients</div>
          <div className="val">{stats.activeClientsCount}</div>
          <div className="dl up">Enrolled students</div>
        </div>
        <div className="card stat">
          <div className="lbl">Circle seats filled</div>
          <div className="val">{stats.circleSeatsFilled} / {stats.totalCircleCapacity}</div>
          <div className="dl flat">Active cohorts</div>
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
              <b>Active Client Check-in Trends</b>
              <span>{clients.length} client(s) currently connected in platform</span>
            </div>
            <div className="rt">
              <button className="mini" onClick={() => setActiveSection('clients')}>View Clients</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="sechd"><h3>Client wellbeing trend</h3></div>
          {stats.avgWellbeing > 0 ? (
            <div style={{ padding: '12px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A' }}>{stats.avgWellbeing}%</span>
                <span style={{ fontSize: '13px', color: '#166534', fontWeight: 700, background: '#F0FDF4', padding: '2px 8px', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                  Positive Engagement
                </span>
              </div>
              <svg className="spark" viewBox="0 0 300 100" style={{ height: '80px', marginTop: '8px' }} role="img" aria-label="Line showing average client check-in scores">
                <defs>
                  <linearGradient id="lgr" x1="0" y1="0" x2="300" y2="0">
                    <stop offset="0" stopColor="#1F5FE0"/>
                    <stop offset="1" stopColor="#8A2BE0"/>
                  </linearGradient>
                </defs>
                <line x1="20" y1="80" x2="290" y2="80" stroke="rgba(14,18,53,.10)"/>
                <path d="M20 70 L74 65 L128 68 L182 45 L236 40 L290 25" fill="none" stroke="url(#lgr)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="290" cy="25" r="4.5" fill="#8A2BE0"/>
              </svg>
            </div>
          ) : (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
              No client check-ins logged yet. Connect with clients to start tracking wellbeing trends.
            </div>
          )}
          <p className="note" style={{ marginTop: '12px' }}>
            {stats.avgWellbeing > 0
              ? `Average across ${stats.checkInClientCount || 0} client(s) who logged check-ins. Data stays private.`
              : `0 check-ins logged so far. Connected client data stays 100% private.`}
          </p>
        </div>
      </div>
    </section>
  )
}

export default Overview
