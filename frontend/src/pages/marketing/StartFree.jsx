import React from 'react'
import {
  OHFooter,
  OHButton,
  OHEyebrow,
  OHCard,
  OHRangeCalculator,
} from '../../components/openhand'

export function StartFree() {
  const calcCompute = (val) => {
    const clients = val.cIn || 0
    const price = val.pIn || 0
    const mem = val.mIn || 0
    const gross = clients * price + mem * 799
    const fee = Math.round(gross * 0.05)
    return {
      gross,
      fee,
      net: gross - fee,
    }
  }

  const calcSliders = [
    { id: 'cIn', label: 'Clients you see per month', min: 2, max: 60, value: 12 },
    { id: 'pIn', label: 'Your average price', min: 500, max: 15000, step: 250, value: 2500, format: (v) => `₹${v.toLocaleString('en-IN')}` },
    { id: 'mIn', label: 'Members in your circle', min: 0, max: 200, value: 0 },
  ]

  return (
    <div className="oh-startfree-page">

      {/* Hero */}
      <header className="oh-startfree-hero">
        <div className="oh-wrap">
          <OHEyebrow>Step one of three</OHEyebrow>
          <h1>
            Your practice, <span className="oh-grad-text">live in 20 minutes.</span>
          </h1>
          <p className="sub">
            No card. No sales call. No time limit. Set up your space, invite your first client, and only pay us when you actually get paid.
          </p>
          <div className="cta-row">
            <OHButton href="/signup" size="lg">Create my practice space</OHButton>
            <OHButton href="/client-journey" variant="ghost" size="lg">See a client journey →</OHButton>
          </div>
          <p className="trust-note">Free forever on the Starter plan · You keep 100% until your first ₹25,000</p>
        </div>
      </header>

      {/* 4-step ribbon */}
      <section className="oh-sec" id="setup">
        <div className="oh-wrap">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
            <h2 className="oh-sec-title text-center mx-auto mb-3">Four steps between you and your first paid client</h2>
            <p className="sub text-center mx-auto max-w-2xl">Most practitioners finish this in a single sitting. You can stop anywhere and come back — nothing is lost.</p>
          </div>

          <div className="ribbon-vertical">
            <div className="step-node-item">
              <div className="node-badge">1</div>
              <div>
                <h3>Claim your space</h3>
                <p>Pick your handle — openhand.live/yourname — add your photo, your credentials, and the two or three sentences that describe what you actually help people with.</p>
                <span className="step-time-tag">~3 minutes</span>
              </div>
            </div>

            <div className="step-node-item">
              <div className="node-badge">2</div>
              <div>
                <h3>Add one offer</h3>
                <p>A single 1:1 session, a six-week cohort, or a self-paced program. Start with one. You can add the rest once you see how people respond to the first.</p>
                <span className="step-time-tag">~6 minutes</span>
              </div>
            </div>

            <div className="step-node-item">
              <div className="node-badge">3</div>
              <div>
                <h3>Connect payments</h3>
                <p>UPI, cards, net banking, and international payments through Razorpay and Stripe. Money lands in your bank account, not in a platform wallet you have to withdraw from.</p>
                <span className="step-time-tag">~5 minutes · PAN + bank details needed</span>
              </div>
            </div>

            <div className="step-node-item">
              <div className="node-badge">4</div>
              <div>
                <h3>Share your link</h3>
                <p>One link for your Instagram bio, your WhatsApp broadcast, your email signature. Bookings, payments, reminders, and follow-ups run themselves from here.</p>
                <span className="step-time-tag">~1 minute</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Streams */}
      <section className="oh-sec" id="money">
        <div className="oh-wrap">
          <OHCard surface="navy" pad="lg" className="revenue-card">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">How you actually get paid</h2>
              <p className="text-indigo-200 text-base max-w-2xl text-center">You hold space. OpenHand handles the invoice, the reminder, the receipt, the GST line, and the follow-up. Three ways money reaches you — and you can run all three at once.</p>
            </div>

            <div className="streams-grid">
              <div className="stream-box">
                <span className="stream-tag">Stream one</span>
                <h3>Sessions</h3>
                <p>One-to-one bookings, paid at the time of booking. No chasing, no awkward reminder messages.</p>
                <span className="stream-num">₹1,500–₹6,000</span>
                <span className="stream-per">typical per session</span>
              </div>

              <div className="stream-box">
                <span className="stream-tag">Stream two</span>
                <h3>Cohorts &amp; circles</h3>
                <p>Run eight people through a six-week container for the same hours you'd spend on two clients.</p>
                <span className="stream-num">₹15,000–₹45,000</span>
                <span className="stream-per">typical per seat, per cohort</span>
              </div>

              <div className="stream-box">
                <span className="stream-tag">Stream three</span>
                <h3>Memberships</h3>
                <p>Recurring monthly access to your circle, your recordings, and your check-ins. Income that doesn't reset every month.</p>
                <span className="stream-num">₹499–₹2,500</span>
                <span className="stream-per">typical per member, per month</span>
              </div>
            </div>

            <OHRangeCalculator
              sliders={calcSliders}
              compute={calcCompute}
              note="Illustrative only. Assumes ₹799/month membership pricing and the Growth plan's 5% fee. Payment gateway charges and GST are additional and depend on your registration status — check with your accountant."
            />

            <div className="fees-table-wrap">
              <table className="fees-table">
                <thead>
                  <tr><th>Plan</th><th>Monthly</th><th>We take</th><th>Best when</th></tr>
                </thead>
                <tbody>
                  <tr><td>Starter</td><td><span className="pill-free">Free</span></td><td>8% of what you earn</td><td>You're testing whether this works at all</td></tr>
                  <tr><td>Growth</td><td>₹1,499</td><td>5% of what you earn</td><td>You're past ₹40,000/month and want the fee to stop stinging</td></tr>
                  <tr><td>Practice</td><td>₹4,999</td><td>0% — you keep everything</td><td>You're running cohorts and want your own branded app</td></tr>
                </tbody>
              </table>
            </div>
          </OHCard>
        </div>
      </section>

      {/* What's in the free plan */}
      <section className="oh-sec">
        <div className="oh-wrap">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
            <h2 className="oh-sec-title text-center mx-auto mb-3">What's in the free plan</h2>
            <p className="sub text-center mx-auto max-w-2xl">Not a crippled trial. A real, working practice you can earn from indefinitely.</p>
          </div>
          <div className="oh-grid-3">
            <OHCard surface="white" pad="lg">
              <h3>Bookings &amp; reminders</h3>
              <p>Your calendar, your buffer times, your cancellation rules. Clients get WhatsApp and email reminders automatically.</p>
            </OHCard>
            <OHCard surface="white" pad="lg">
              <h3>One private cohort</h3>
              <p>A closed group container with its own feed, resources, and check-ins. Nobody wanders in from outside.</p>
            </OHCard>
            <OHCard surface="white" pad="lg">
              <h3>Payments that clear to your bank</h3>
              <p>UPI, cards, net banking, international. Settled to your account on a two-day cycle, with GST-ready invoices.</p>
            </OHCard>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="oh-sec text-center">
        <div className="oh-wrap">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
            <h2 className="oh-sec-title text-center mx-auto mb-3">You already know how to hold space.</h2>
            <p className="sub text-center mx-auto max-w-2xl">The rest — the booking link, the invoice, the reminder, the receipt — is what we're for.</p>
          </div>
          <div className="cta-row center-row">
            <OHButton href="/signup" size="lg">Create my practice space</OHButton>
            <OHButton href="/talk-to-human" variant="ghost" size="lg">Talk to a real human →</OHButton>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default StartFree
