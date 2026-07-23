import React, { useEffect, useState } from 'react'
import { OHCard, OHBarChart, OHSparkline, OHButton } from '../../components/openhand'
import { apiConnector } from '../../services/apiConnector'

export function Dashboard({ practitionerName = 'Meera', setActiveSection }) {
  const [telemetry, setTelemetry] = useState(null)

  useEffect(() => {
    async function loadDash() {
      try {
        const res = await apiConnector('GET', '/api/v1/practitioner/dashboard')
        if (res?.data?.success) {
          setTelemetry(res.data.telemetry)
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err)
      }
    }
    loadDash()
  }, [])

  const earningsBarData = [
    { label: 'Feb', value: 42000 },
    { label: 'Mar', value: 58000 },
    { label: 'Apr', value: 66000 },
    { label: 'May', value: 84000 },
    { label: 'Jun', value: 105000 },
    { label: 'Jul', value: 124500 },
  ]

  return (
    <div className="practice-sec-dash">
      <div className="htop">
        <div>
          <div className="crumb">Dashboard</div>
          <h1>Good morning, {practitionerName.split(' ')[0]}.</h1>
          <p>Three sessions today. Your next payout clears Thursday.</p>
        </div>
        <OHButton onClick={() => setActiveSection('room')}>
          Start next session →
        </OHButton>
      </div>

      {/* 4 Telemetry Stats */}
      <div className="g4">
        <OHCard surface="white" pad="md" className="stat">
          <div className="lbl">This month</div>
          <div className="val">₹1,24,500</div>
          <div className="dl up">▲ 18% vs June</div>
        </OHCard>

        <OHCard surface="white" pad="md" className="stat">
          <div className="lbl">Clearing Thursday</div>
          <div className="val">₹38,200</div>
          <div className="dl flat">3 sessions + 1 circle seat</div>
        </OHCard>

        <OHCard surface="white" pad="md" className="stat">
          <div className="lbl">Active clients</div>
          <div className="val">{telemetry?.activeClientsCount || 27}</div>
          <div className="dl up">▲ 4 this month</div>
        </OHCard>

        <OHCard surface="white" pad="md" className="stat">
          <div className="lbl">Circle seats filled</div>
          <div className="val">6 / 8</div>
          <div className="dl flat">Starts 4 Aug</div>
        </OHCard>
      </div>

      {/* Charts & Today Row */}
      <div className="g2">
        <OHCard surface="white" pad="lg">
          <div className="sechd">
            <h3>Earnings, last 6 months</h3>
            <a href="#payouts" onClick={() => setActiveSection('payouts')} style={{ color: 'var(--oh-blue)', fontWeight: 600, fontSize: 13 }}>Full report →</a>
          </div>
          <OHBarChart data={earningsBarData} width={500} height={160} ariaLabel="Earnings bar chart" />
          <p className="note">Circles began in May — that's the step change.</p>
        </OHCard>

        <OHCard surface="white" pad="lg">
          <div className="sechd"><h3>Today</h3></div>
          <div className="row">
            <div className="av">PS</div>
            <div className="who"><b>Priya S.</b><span>1:1 · Session 3</span></div>
            <div className="rt"><b>10:00</b>in 40 min</div>
          </div>
          <div className="row">
            <div className="av">AK</div>
            <div className="who"><b>Arun K.</b><span>1:1 · First session</span></div>
            <div className="rt"><b>12:30</b>intake done</div>
          </div>
          <div className="row">
            <div className="av g">8</div>
            <div className="who"><b>Anxiety Circle</b><span>Group · Week 2 of 6</span></div>
            <div className="rt"><b>19:00</b>6 confirmed</div>
          </div>
        </OHCard>
      </div>

      {/* Attention & Wellbeing Trend Row */}
      <div className="g2" style={{ marginTop: 18 }}>
        <OHCard surface="white" pad="lg">
          <div className="sechd"><h3>Needs your attention</h3></div>
          <div className="row">
            <div className="av g">!</div>
            <div className="who"><b>4 session notes awaiting approval</b><span>Drafted by the co-pilot · oldest is 3 days old</span></div>
            <div className="rt"><button className="mini" onClick={() => setActiveSection('clients')}>Review</button></div>
          </div>
          <div className="row">
            <div className="av g">!</div>
            <div className="who"><b>Kavya hasn't checked in for 11 days</b><span>Was checking in weekly before that</span></div>
            <div className="rt"><button className="mini" onClick={() => setActiveSection('clients')}>Reach out</button></div>
          </div>
          <div className="row">
            <div className="av g">!</div>
            <div className="who"><b>2 seats left in the August circle</b><span>Starts in 14 days</span></div>
            <div className="rt"><button className="mini" onClick={() => setActiveSection('growth')}>Share link</button></div>
          </div>
        </OHCard>

        <OHCard surface="white" pad="lg">
          <div className="sechd"><h3>Client wellbeing trend</h3></div>
          <OHSparkline data={[4, 5, 4, 7, 8, 9]} width={300} height={140} ariaLabel="Client wellbeing sparkline trend" />
          <p className="note">Average across 27 clients who check in. Individual data stays private.</p>
        </OHCard>
      </div>
    </div>
  )
}

export default Dashboard
