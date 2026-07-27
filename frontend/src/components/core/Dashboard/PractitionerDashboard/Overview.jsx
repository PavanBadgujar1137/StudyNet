import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiVideo } from 'react-icons/fi'

export function Overview({ practitionerName = 'Dr. Meera Iyer', setActiveSection, telemetryData, loading }) {
  const navigate = useNavigate()
  const firstName = practitionerName.replace('Dr. ', '').split(' ')[0]

  const stats = telemetryData?.stats || {
    monthlyEarnings: 0,
    totalEarnings: 0,
    activeClientsCount: 0,
    clearingThisWeek: 0,
    circleSeatsFilled: 0,
    totalCircleCapacity: 0,
  }

  const upcomingClasses = telemetryData?.upcomingClasses || []
  const clients = telemetryData?.clients || []

  return (
    <section className="view on" id="dash">
      <div className="htop">
        <div>
          <div className="crumb">Dashboard</div>
          <h1>Good day, {firstName}.</h1>
          <p>{upcomingClasses.length} class(es) scheduled. Your telemetry is connected in real-time to MongoDB.</p>
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
            <h3>Earnings & Payout Overview</h3>
            <button
              type="button"
              className="link-btn"
              style={{ background: 'none', border: 'none', padding: 0, color: '#2563EB', cursor: 'pointer', font: 'inherit', fontWeight: 600 }}
              onClick={() => setActiveSection('payouts')}
            >
              Full report →
            </button>
          </div>
          <svg className="spark" viewBox="0 0 620 150" preserveAspectRatio="none" role="img" aria-label="Bar chart of monthly earnings">
            <defs>
              <linearGradient id="bg1" x1="0" y1="150" x2="0" y2="0">
                <stop offset="0" stopColor="#1F5FE0"/>
                <stop offset="1" stopColor="#8A2BE0"/>
              </linearGradient>
            </defs>
            <line x1="0" y1="120" x2="620" y2="120" stroke="rgba(14,18,53,.10)"/>
            <rect x="24" y="82" width="58" height="38" rx="6" fill="url(#bg1)" opacity=".35"/>
            <rect x="126" y="70" width="58" height="50" rx="6" fill="url(#bg1)" opacity=".45"/>
            <rect x="228" y="58" width="58" height="62" rx="6" fill="url(#bg1)" opacity=".58"/>
            <rect x="330" y="46" width="58" height="74" rx="6" fill="url(#bg1)" opacity=".72"/>
            <rect x="432" y="34" width="58" height="86" rx="6" fill="url(#bg1)" opacity=".86"/>
            <rect x="534" y="14" width="58" height="106" rx="6" fill="url(#bg1)"/>
            <text x="53" y="140" textAnchor="middle">Feb</text>
            <text x="155" y="140" textAnchor="middle">Mar</text>
            <text x="257" y="140" textAnchor="middle">Apr</text>
            <text x="359" y="140" textAnchor="middle">May</text>
            <text x="461" y="140" textAnchor="middle">Jun</text>
            <text x="563" y="140" textAnchor="middle">Jul</text>
          </svg>
          <p className="note">Total lifetime earnings recorded: ₹{stats.totalEarnings.toLocaleString('en-IN')}</p>
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
              <b>Session notes & AURA drafts</b>
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
              <span>{clients.length} client(s) currently active in platform</span>
            </div>
            <div className="rt">
              <button className="mini" onClick={() => setActiveSection('clients')}>View Clients</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="sechd"><h3>Client wellbeing trend</h3></div>
          <svg className="spark" viewBox="0 0 300 150" role="img" aria-label="Line showing average client check-in scores">
            <defs>
              <linearGradient id="lgr" x1="0" y1="0" x2="300" y2="0">
                <stop offset="0" stopColor="#1F5FE0"/>
                <stop offset="1" stopColor="#8A2BE0"/>
              </linearGradient>
            </defs>
            <line x1="20" y1="120" x2="290" y2="120" stroke="rgba(14,18,53,.10)"/>
            <path d="M20 96 L74 88 L128 92 L182 70 L236 62 L290 48" fill="none" stroke="url(#lgr)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="290" cy="48" r="4.5" fill="#8A2BE0"/>
            <text x="20" y="140">Wk 1</text>
            <text x="270" y="140">Wk 6</text>
          </svg>
          <p className="note">Average across {stats.activeClientsCount} clients who check in. Individual data stays private.</p>
        </div>
      </div>
    </section>
  )
}

export default Overview
