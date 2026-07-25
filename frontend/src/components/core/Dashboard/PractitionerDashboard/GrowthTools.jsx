import React, { useState } from 'react'

export function GrowthTools({ telemetryData }) {
  const [copied, setCopied] = useState(false)
  const practitioner = telemetryData?.practitioner || {}
  const handle = practitioner.firstName ? `${practitioner.firstName.toLowerCase()}-${practitioner.lastName?.toLowerCase() || ''}` : 'meera-iyer'
  const bookingLink = `studynet.live/practitioner/${handle}`

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="view on" id="growth">
      <div className="htop">
        <div>
          <div className="crumb">Growth tools</div>
          <h1>Practice Growth Hub</h1>
          <p>Your booking link, referral stats, and directory performance.</p>
        </div>
        <button className="btn" onClick={handleCopy}>Share my practice link</button>
      </div>

      <div className="g2">
        <div className="card">
          <div className="sechd"><h3>Your booking link</h3></div>
          <div className="linkbox">
            <span>{bookingLink}</span>
            <button className="mini" onClick={handleCopy}>{copied ? 'Copied' : 'Copy'}</button>
          </div>
          <p className="note" style={{ marginBottom: '16px' }}>Share this link in your email signature, bio, or course pages.</p>
          <div className="g3" style={{ gap: '12px' }}>
            <div className="card stat" style={{ boxShadow: 'none', padding: '16px' }}>
              <div className="lbl">Directory Views</div>
              <div className="val" style={{ fontSize: '22px' }}>1,840</div>
              <div className="dl flat">30 days</div>
            </div>
            <div className="card stat" style={{ boxShadow: 'none', padding: '16px' }}>
              <div className="lbl">Active Clients</div>
              <div className="val" style={{ fontSize: '22px' }}>{telemetryData?.stats?.activeClientsCount || 27}</div>
              <div className="dl up">Dynamic DB</div>
            </div>
            <div className="card stat" style={{ boxShadow: 'none', padding: '16px' }}>
              <div className="lbl">Rating</div>
              <div className="val" style={{ fontSize: '22px' }}>4.9/5</div>
              <div className="dl up">Verified</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="sechd"><h3>Client Testimonials</h3></div>
          <div className="tstm">"The sessions and Zoom classes were transformative. Excellent guidance!"<div className="who">— Verified Student</div></div>
          <div className="tstm">"The daily check-in rhythm helped me build consistency in my routine."<div className="who">— Client Review</div></div>
        </div>
      </div>
    </section>
  )
}

export default GrowthTools
