import React, { useEffect } from 'react'
import {
  OHFooter,
  OHButton,
  OHEyebrow,
  OHCard,
  OHBreakevenChart,
  OHRangeCalculator,
} from '../../components/openhand'
import { apiConnector } from '../../services/apiConnector'

export function Pricing() {
  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await apiConnector('GET', '/api/v1/plans')
        if (res?.data?.success) {
          console.log('Plans loaded:', res.data.plans)
        }
      } catch (e) {
        console.warn('Using default fallback plan math:', e)
      }
    }
    fetchPlans()
  }, [])

  // Breakeven chart functions
  const breakevenPlans = [
    { name: 'Starter (8%)', color: '#2563EB', fn: (gross) => gross * 0.08 },
    { name: 'Growth (₹1,499 + 5%)', color: '#7C3AED', fn: (gross) => 1499 + gross * 0.05 },
    { name: 'Practice (₹4,999 flat)', color: '#0D1B3D', fn: () => 4999 },
  ]

  // Calculator compute logic
  const calcCompute = (val) => {
    const clients = val.cIn || 0
    const price = val.pIn || 0
    const seats = val.sIn || 0
    const seatPrice = val.qIn || 0
    const members = val.mIn || 0

    const gross = clients * price + seats * seatPrice + members * 799
    const starter = gross * 0.08
    const growth = 1499 + gross * 0.05
    const practice = 4999

    let bestPlan = 'Starter'
    let cost = starter
    if (growth < cost) { bestPlan = 'Growth'; cost = growth }
    if (practice < cost) { bestPlan = 'Practice'; cost = practice }

    return {
      gross,
      fee: cost,
      net: gross - cost,
      bestPlan,
    }
  }

  const calcSliders = [
    { id: 'cIn', label: '1:1 clients per month', min: 0, max: 60, value: 12 },
    { id: 'pIn', label: 'Average session price', min: 500, max: 15000, step: 250, value: 2500, format: (v) => `₹${v.toLocaleString('en-IN')}` },
    { id: 'sIn', label: 'Circle seats sold per month', min: 0, max: 40, value: 0 },
    { id: 'qIn', label: 'Circle seat price', min: 2000, max: 60000, step: 1000, value: 15000, format: (v) => `₹${v.toLocaleString('en-IN')}` },
    { id: 'mIn', label: 'Monthly members', min: 0, max: 300, value: 0 },
  ]

  return (
    <div className="oh-pricing-page">

      {/* Hero */}
      <header className="oh-pricing-hero">
        <div className="oh-wrap">
          <OHEyebrow>Pricing</OHEyebrow>
          <h1>
            Pay us <span className="oh-grad-text">only when you get paid.</span>
          </h1>
          <p className="sub">
            No setup fee. No lock-in. Start free and stay free until the commission costs you more than the subscription would — then we'll tell you to switch.
          </p>
        </div>
      </header>

      {/* Plans Grid */}
      <section className="oh-sec">
        <div className="oh-wrap">
          <div className="plans-grid">
            {/* Starter */}
            <OHCard surface="white" pad="lg" className="plan-card">
              <h3>Starter</h3>
              <p className="who">For practitioners testing whether an online practice works at all.</p>
              <div className="price-tag">₹0<small> /month</small></div>
              <div className="cut-badge">We take 8% of what you earn</div>
              <ul className="plan-features">
                <li>Unlimited 1:1 sessions</li>
                <li>One private circle</li>
                <li>UPI, cards, net banking, Stripe</li>
                <li>Client check-ins &amp; reflection prompts</li>
                <li>Post-session co-pilot notes</li>
                <li>Listed in the practitioner directory</li>
              </ul>
              <OHButton href="/start-free" variant="ghost" fullWidth>Start free</OHButton>
            </OHCard>

            {/* Growth (Featured) */}
            <OHCard surface="navy" pad="lg" className="plan-card feat-card">
              <span className="featured-badge">Most practitioners</span>
              <h3>Growth</h3>
              <p className="who">For practitioners past ₹40,000/month who want the fee to stop stinging.</p>
              <div className="price-tag">₹1,499<small> /month</small></div>
              <div className="cut-badge">We take 5% of what you earn</div>
              <ul className="plan-features">
                <li>Everything in Starter</li>
                <li>Unlimited circles &amp; cohorts</li>
                <li>Recurring memberships</li>
                <li><b>Live in-session co-pilot</b></li>
                <li>WhatsApp reminders &amp; broadcasts</li>
                <li>GST-ready invoices</li>
                <li>Priority placement in directory</li>
              </ul>
              <OHButton href="/start-free" fullWidth>Start free, upgrade later</OHButton>
            </OHCard>

            {/* Practice */}
            <OHCard surface="white" pad="lg" className="plan-card">
              <h3>Practice</h3>
              <p className="who">For established practices running multiple cohorts under their own brand.</p>
              <div className="price-tag">₹4,999<small> /month</small></div>
              <div className="cut-badge">0% — you keep everything</div>
              <ul className="plan-features">
                <li>Everything in Growth</li>
                <li>Your own branded app (iOS + Android)</li>
                <li>Custom domain</li>
                <li>Team seats for associate practitioners</li>
                <li>Advanced client analytics</li>
                <li>Named support contact</li>
              </ul>
              <OHButton href="/talk-to-human" variant="ghost" fullWidth>Talk to a human</OHButton>
            </OHCard>
          </div>
        </div>
      </section>

      {/* Breakeven Chart */}
      <section className="oh-sec">
        <div className="oh-wrap">
          <div className="sec-head">
            <h2>Where each plan stops making sense</h2>
            <p>The lines cross twice. Below ₹30,000/month the free plan wins. Above ₹1,00,000 you should be on Practice. Here's the arithmetic, drawn.</p>
          </div>
          <OHCard surface="white" pad="lg" className="chart-card">
            <h3>What you pay OpenHand, by monthly earnings</h3>
            <p className="hint-text">Lower is better. Where two lines cross is where you should switch plans.</p>
            <OHBreakevenChart plans={breakevenPlans} maxGross={200000} />
            <p className="disclaim-text">Illustrative model. Payment gateway charges and GST are separate and depend on your registration status.</p>
          </OHCard>
        </div>
      </section>

      {/* Calculator */}
      <section className="oh-sec">
        <div className="oh-wrap">
          <OHRangeCalculator
            sliders={calcSliders}
            compute={calcCompute}
            note="Illustrative only — this is arithmetic, not a projection. Assumes ₹799/month membership pricing. Payment gateway charges and GST are additional; check with your accountant."
          />
        </div>
      </section>

      {/* Comparison Table */}
      <section className="oh-sec">
        <div className="oh-wrap">
          <div className="sec-head">
            <h2>How we compare</h2>
            <p>Honest version: on fees alone, we're mid-market. We're not trying to be the cheapest — we're the only one built for people whose clients disclose things that matter.</p>
          </div>
          <div className="cmp-table-wrap">
            <table className="cmp-table">
              <thead>
                <tr>
                  <th></th>
                  <th className="us-col">OpenHand</th>
                  <th>TagMango</th>
                  <th>Topmate</th>
                  <th>AppX</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Free tier commission</td><td className="us-col">8%</td><td>10%</td><td>No subscription fee</td><td>Varies by plan</td></tr>
                <tr><td>Zero-commission plan</td><td className="us-col">₹4,999/mo</td><td>Higher tiers + setup fee</td><td>—</td><td>Custom</td></tr>
                <tr><td>UPI / Indian payments</td><td className="us-col yes">Yes</td><td className="yes">Yes</td><td className="yes">Yes</td><td className="yes">Yes</td></tr>
                <tr><td>Courses &amp; cohorts</td><td className="us-col yes">Yes</td><td className="yes">Yes</td><td className="yes">Yes</td><td className="yes">Yes</td></tr>
                <tr><td>Branded mobile app</td><td className="us-col yes">On Practice</td><td className="yes">On enterprise</td><td className="no">No</td><td className="yes">Core offering</td></tr>
                <tr><td>Client check-ins &amp; mood tracking</td><td className="us-col yes">Yes</td><td className="no">No</td><td className="no">No</td><td className="no">No</td></tr>
                <tr><td>Consent-gated session recording</td><td className="us-col yes">Yes</td><td className="no">No</td><td className="no">No</td><td className="no">No</td></tr>
                <tr><td>Live in-session AI co-pilot</td><td className="us-col yes">Yes</td><td className="no">No</td><td className="no">No</td><td className="no">No</td></tr>
                <tr><td>Clinician-founded</td><td className="us-col yes">Two doctors</td><td className="no">No</td><td className="no">No</td><td className="no">No</td></tr>
                <tr><td>B2B employee wellbeing</td><td className="us-col yes">Yes</td><td className="no">No</td><td className="no">No</td><td className="no">No</td></tr>
              </tbody>
            </table>
          </div>
          <p className="disclaim-text margin-top-sm">
            Comparison compiled from publicly available information in July 2026. Competitor pricing and features change frequently — check each provider's own site before making a decision. We'd rather you verify than take our word for it.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="oh-sec">
        <div className="oh-wrap narrow">
          <div className="sec-head"><h2>Questions people actually ask</h2></div>
          <div className="faq-list">
            <div className="q-item">
              <h3>Is the free plan a trial?</h3>
              <p>No. There's no time limit and no card. Practitioners run real, paid practices on Starter indefinitely. We only make money when you do.</p>
            </div>
            <div className="q-item">
              <h3>When does money reach my bank?</h3>
              <p>Two working days after the session or purchase, straight to your bank account — not to a platform wallet you have to withdraw from.</p>
            </div>
            <div className="q-item">
              <h3>What about GST?</h3>
              <p>Invoices are generated GST-ready. Whether you charge GST depends on your registration and turnover — that's a conversation for your accountant, not us.</p>
            </div>
            <div className="q-item">
              <h3>Can I downgrade?</h3>
              <p>Any time, effective the next billing cycle. Nothing is deleted and your clients don't notice.</p>
            </div>
            <div className="q-item">
              <h3>What happens to my client data if I leave?</h3>
              <p>You export it — client records, notes, session history — and we delete our copy on request. Your practice is yours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="oh-sec text-center">
        <div className="oh-wrap">
          <h2 className="oh-sec-title center">Start on free. Switch when the maths says so.</h2>
          <p className="closing-sub">We'll email you the month your commission passes ₹1,499 and tell you to upgrade. Yes, really.</p>
          <div className="cta-row center-row">
            <OHButton href="/start-free" size="lg">Start your free practice space</OHButton>
            <OHButton href="/talk-to-human" variant="ghost" size="lg">Talk to a real human →</OHButton>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default Pricing
