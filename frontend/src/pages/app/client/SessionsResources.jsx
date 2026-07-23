import React, { useEffect } from 'react'
import { OHCard } from '../../../components/openhand'
import { apiConnector } from '../../../services/apiConnector'

export function SessionsResources({ clientName = 'Priya', practitionerName = 'Dr. Meera Iyer' }) {
  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await apiConnector('GET', '/api/v1/bookings')
        if (res?.data?.success) {
          console.log('Bookings loaded:', res.data.bookings)
        }
      } catch (err) {
        console.warn('SessionsResources fetch error:', err)
      }
    }
    loadBookings()
  }, [])

  return (
    <div className="tab-view-sessions">
      <div className="tab-hd">
        <div className="k">Sessions &amp; resources</div>
        <h1>Everything in one place</h1>
        <p>Your bookings, your recordings where you've agreed to them, and whatever {practitionerName} has shared with you.</p>
      </div>

      {/* Coming Up */}
      <OHCard surface="white" pad="lg" style={{ marginBottom: 20 }}>
        <div className="sechd">
          <h3>Coming up</h3>
          <a href="/find-a-practitioner" style={{ color: 'var(--oh-blue)', fontWeight: 600, fontSize: 13 }}>Book another →</a>
        </div>

        <div className="srow">
          <div className="sdate"><b>24</b><span>Jul</span></div>
          <div className="info"><b>1:1 with {practitionerName}</b><span>Session 4 · 60 minutes · 10:00 am</span></div>
          <div className="go"><span className="pill up">Confirmed</span></div>
        </div>

        <div className="srow">
          <div className="sdate"><b>04</b><span>Aug</span></div>
          <div className="info"><b>Anxiety circle — week 1</b><span>Group · 90 minutes · 7:00 pm</span></div>
          <div className="go"><span className="pill up">Confirmed</span></div>
        </div>
      </OHCard>

      {/* Past Sessions */}
      <OHCard surface="white" pad="lg" style={{ marginBottom: 20 }}>
        <div className="sechd"><h3>Past sessions</h3></div>
        
        <div className="srow">
          <div className="sdate"><b>08</b><span>Jul</span></div>
          <div className="info"><b>Session 3</b><span>60 minutes · notes shared with you</span></div>
          <div className="go"><button type="button" className="mini">Read notes</button></div>
        </div>

        <div className="srow">
          <div className="sdate"><b>01</b><span>Jul</span></div>
          <div className="info"><b>Session 2</b><span>60 minutes</span></div>
          <div className="go"><span className="pill past">Completed</span></div>
        </div>

        <div className="srow">
          <div className="sdate"><b>17</b><span>Jun</span></div>
          <div className="info"><b>Session 1</b><span>60 minutes · first session</span></div>
          <div className="go"><span className="pill past">Completed</span></div>
        </div>

        <p className="note">Meera chooses what to share with you. Anything not shared stays in her private notes — that's normal clinical practice.</p>
      </OHCard>

      {/* Shared Resources */}
      <OHCard surface="white" pad="lg">
        <div className="sechd"><h3>Shared with you</h3></div>
        <div className="res">
          <div className="rc"><div className="ty">Reading</div><b>What regulation actually means</b><span>10 min · shared 20 July</span></div>
          <div className="rc"><div className="ty">Audio</div><b>Four-count breathing</b><span>6 min · shared 8 July</span></div>
          <div className="rc"><div className="ty">Worksheet</div><b>Sunday-evening map</b><span>PDF · shared 1 July</span></div>
        </div>
      </OHCard>
    </div>
  )
}

export default SessionsResources
