import React from 'react'
import { OHCard, OHButton } from '../../components/openhand'
import toast from 'react-hot-toast'

export function GrowthTools() {
  const handleCopyLink = () => {
    navigator.clipboard.writeText('openhand.live/meera-iyer')
    toast.success('Practice booking link copied!')
  }

  return (
    <div className="practice-sec-growth">
      <div className="htop">
        <div>
          <div className="crumb">Growth tools</div>
          <h1>Fill the seats</h1>
          <p>Your link, your proof, and the people who send you clients.</p>
        </div>
        <OHButton onClick={handleCopyLink}>Share my practice</OHButton>
      </div>

      <div className="g2">
        {/* Booking Link & Analytics */}
        <OHCard surface="white" pad="lg">
          <div className="sechd"><h3>Your booking link</h3></div>
          <div className="linkbox">
            <span>openhand.live/meera-iyer</span>
            <button className="mini" onClick={handleCopyLink}>Copy</button>
            <button className="mini" onClick={() => toast.success('QR Code ready for download!')}>QR</button>
          </div>
          <p className="note" style={{ marginBottom: 16 }}>One link for your Instagram bio, WhatsApp broadcast, and email signature.</p>

          <div className="g3" style={{ gap: 12 }}>
            <div className="card stat" style={{ boxShadow: 'none', padding: 16 }}>
              <div className="lbl">Views</div>
              <div className="val" style={{ fontSize: 22 }}>1,840</div>
              <div className="dl flat">30 days</div>
            </div>
            <div className="card stat" style={{ boxShadow: 'none', padding: 16 }}>
              <div className="lbl">Bookings</div>
              <div className="val" style={{ fontSize: 22 }}>34</div>
              <div className="dl up">1.8% convert</div>
            </div>
            <div className="card stat" style={{ boxShadow: 'none', padding: 16 }}>
              <div className="lbl">From directory</div>
              <div className="val" style={{ fontSize: 22 }}>11</div>
              <div className="dl up">Free to you</div>
            </div>
          </div>
        </OHCard>

        {/* Testimonials */}
        <OHCard surface="white" pad="lg">
          <div className="sechd">
            <h3>Testimonials</h3>
            <a href="#request" onClick={() => toast.success('Testimonial request links generated!')} style={{ color: 'var(--oh-blue)', fontWeight: 600, fontSize: 13 }}>Request more →</a>
          </div>
          <div className="tstm">
            "I'd been to two therapists before. This was the first time someone asked a question that actually landed."
            <div className="who">— Circle participant, May cohort</div>
          </div>
          <div className="tstm">
            "The check-ins between sessions were the thing. It stopped being one hour a week and started being a practice."
            <div className="who">— 1:1 client, 6 months</div>
          </div>
          <p className="note">Requested automatically the day a circle completes — when people actually feel it.</p>
        </OHCard>
      </div>

      {/* Referrals */}
      <OHCard surface="white" pad="lg" style={{ marginTop: 18 }}>
        <div className="sechd"><h3>Refer another practitioner</h3></div>
        <div className="ref">
          <div><b>3</b><span>Practitioners referred</span></div>
          <div><b>9</b><span>Free months earned</span></div>
          <div><b>₹13,491</b><span>Subscription value saved</span></div>
        </div>
        <p className="note">Both of you get three months of Growth free. No cap on how many you refer.</p>
      </OHCard>

      {/* Milestones */}
      <OHCard surface="white" pad="lg" style={{ marginTop: 18 }}>
        <div className="sechd"><h3>Your milestones</h3></div>
        <div className="row">
          <div className="av g">✓</div>
          <div className="who"><b>First client</b><span>Reached 12 Feb</span></div>
          <div className="rt"><span className="pill ok">Done</span></div>
        </div>
        <div className="row">
          <div className="av g">✓</div>
          <div className="who"><b>First circle filled</b><span>Reached 2 May</span></div>
          <div className="rt"><span className="pill ok">Done</span></div>
        </div>
        <div className="row">
          <div className="av g">✓</div>
          <div className="who"><b>₹1,00,000 in a month</b><span>Reached 30 Jun</span></div>
          <div className="rt"><span className="pill ok">Done</span></div>
        </div>
        <div className="row">
          <div className="av g">4</div>
          <div className="who"><b>50 active clients</b><span>27 of 50 — no deadline, no pressure</span></div>
          <div className="rt"><span className="pill inf">In progress</span></div>
        </div>
        <p className="note">Milestones are yours alone. There is no leaderboard and no comparison with other practitioners.</p>
      </OHCard>
    </div>
  )
}

export default GrowthTools
