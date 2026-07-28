import React, { useState } from 'react'

export function GrowthTools({ telemetryData }) {
  const [copied, setCopied] = useState(false)
  const practitioner = telemetryData?.practitioner || {}
  const handle = practitioner.firstName ? `${practitioner.firstName.toLowerCase()}-${practitioner.lastName?.toLowerCase() || ''}` : 'practitioner'
  const bookingLink = `studynet.live/practitioner/${handle}`
  const reviews = telemetryData?.reviews || []
  const activeClients = telemetryData?.stats?.activeClientsCount || 0

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
          <p>Your booking link, client referrals, and directory performance.</p>
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
              <div className="lbl">Directory Profile</div>
              <div className="val" style={{ fontSize: '20px' }}>Active</div>
              <div className="dl flat">Listed in directory</div>
            </div>
            <div className="card stat" style={{ boxShadow: 'none', padding: '16px' }}>
              <div className="lbl">Active Clients</div>
              <div className="val" style={{ fontSize: '20px' }}>{activeClients}</div>
              <div className="dl up">Connected DB</div>
            </div>
            <div className="card stat" style={{ boxShadow: 'none', padding: '16px' }}>
              <div className="lbl">Verified Rating</div>
              <div className="val" style={{ fontSize: '20px' }}>{practitioner.rating || '5.0 ★'}</div>
              <div className="dl up">Client Reviews</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="sechd"><h3>Client Testimonials &amp; Reviews ({reviews.length})</h3></div>
          {reviews.length > 0 ? (
            reviews.map((rev, idx) => (
              <div key={idx} className="tstm">
                "{rev.review}"
                <div className="who">— {rev.user?.firstName || 'Verified Client'} ({rev.rating} ★)</div>
              </div>
            ))
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
              No client reviews submitted yet. Feedback left by your connected clients will appear here.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default GrowthTools

