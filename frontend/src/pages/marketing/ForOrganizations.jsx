import React from 'react'
import { OHNav, OHFooter, OHButton, OHEyebrow, OHCard, OHCardTitle, OHCardBody } from '../../components/openhand'
import './ForOrganizations.css'

export function ForOrganizations() {
  return (
    <div className="oh-org-page">

      {/* Hero */}
      <header className="oh-org-hero">
        <div className="oh-wrap">
          <OHEyebrow>For Organizations</OHEyebrow>
          <h1>
            Employee wellbeing that doesn't feel like <span className="oh-grad-text">an EAP nobody opens.</span>
          </h1>
          <p className="sub">
            Private circles, vetted practitioners, and reporting that respects confidentiality — built for teams that actually care about their people.
          </p>
          <div className="cta-row">
            <OHButton href="/talk-to-human" size="lg">Scope a pilot for your team</OHButton>
            <OHButton href="#flywheel" variant="ghost" size="lg">How the circle flywheel works →</OHButton>
          </div>
        </div>
      </header>

      {/* Section 1: EAP vs OpenHand Circles */}
      <section className="oh-sec">
        <div className="oh-wrap">
          <div className="sec-head">
            <h2>Why traditional EAPs hit 3% utilization</h2>
            <p>Employees don't use EAPs because they feel clinical, bureaucratic, and unsafe. Here is what happens when you switch to peer circles.</p>
          </div>
          <div className="cmp-table-wrap">
            <table className="cmp-table">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>Traditional EAP</th>
                  <th className="us-col">OpenHand Circles</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Format</td>
                  <td>Transactional 1:1 sessions via helpline</td>
                  <td className="us-col">Fixed 6-to-8 week private cohort containers</td>
                </tr>
                <tr>
                  <td>Utilization</td>
                  <td>Avg. 2% to 4% company-wide</td>
                  <td className="us-col">Avg. 68% active cohort engagement</td>
                </tr>
                <tr>
                  <td>Privacy &amp; Trust</td>
                  <td>Feared HR reporting &amp; corporate oversight</td>
                  <td className="us-col">Query-level strict confidentiality (aggregate HR view only)</td>
                </tr>
                <tr>
                  <td>Practitioner Quality</td>
                  <td>Assigned randomly from generic network</td>
                  <td className="us-col">Specialized, verified practitioners with explicit modality notes</td>
                </tr>
                <tr>
                  <td>Ongoing Impact</td>
                  <td>Stops when session budget expires</td>
                  <td className="us-col">Self-organizing accountability peer pods that last long-term</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 2: 8-Week Pilot Flow */}
      <section className="oh-sec oh-sec-community">
        <div className="oh-wrap">
          <div className="sec-head">
            <h2>An 8-week pilot designed for zero friction</h2>
            <p>From initial team scoping to post-pilot impact report — launched in under 10 days.</p>
          </div>
          <div className="pilot-flow-grid">
            <OHCard surface="white" pad="md">
              <span className="step-tag">Phase 1 · Week 1</span>
              <OHCardTitle>Team Scoping &amp; Match</OHCardTitle>
              <OHCardBody>Select your team focus area (burnout, parenting, leadership, high anxiety) and match with a verified senior practitioner.</OHCardBody>
            </OHCard>

            <OHCard surface="white" pad="md">
              <span className="step-tag">Phase 2 · Weeks 2–7</span>
              <OHCardTitle>6-Week Private Container</OHCardTitle>
              <OHCardBody>Weekly live circle sessions, encrypted async check-ins, and peer pod accountability threads.</OHCardBody>
            </OHCard>

            <OHCard surface="white" pad="md">
              <span className="step-tag">Phase 3 · Week 8</span>
              <OHCardTitle>Aggregate Impact Report</OHCardTitle>
              <OHCardBody>HR receives aggregated wellbeing shift metrics, attendance telemetry, and recommendations for org roll-out.</OHCardBody>
            </OHCard>
          </div>
        </div>
      </section>

      {/* Section 3: B2B Pricing Tiers */}
      <section className="oh-sec">
        <div className="oh-wrap">
          <div className="sec-head">
            <h2>Organization Plans</h2>
            <p>Simple, transparent pricing per circle container or company-wide roll-out.</p>
          </div>
          <div className="b2b-plans-grid">
            <OHCard surface="white" pad="lg">
              <h3>Single Team Pilot</h3>
              <p className="b2b-who">One 6-week circle for up to 12 employees.</p>
              <div className="b2b-price">₹75,000<small> /pilot container</small></div>
              <ul className="b2b-list">
                <li>1 Dedicated Senior Practitioner</li>
                <li>6 Live group circle calls</li>
                <li>Encrypted client check-in app</li>
                <li>Aggregate impact summary</li>
              </ul>
              <OHButton href="/talk-to-human" variant="ghost" fullWidth>Request Pilot →</OHButton>
            </OHCard>

            <OHCard surface="navy" pad="lg" className="feat-b2b">
              <span className="featured-badge">Recommended</span>
              <h3>Multi-Circle Pod</h3>
              <p className="b2b-who">Up to 4 parallel circles for department-wide coverage.</p>
              <div className="b2b-price">₹2,40,000<small> /quarter</small></div>
              <ul className="b2b-list">
                <li>Up to 48 employee seats</li>
                <li>Dedicated Account Specialist</li>
                <li>Co-pilot session note synthesis</li>
                <li>Quarterly HR Insights Telemetry</li>
              </ul>
              <OHButton href="/talk-to-human" fullWidth>Book Org Consultation →</OHButton>
            </OHCard>

            <OHCard surface="white" pad="lg">
              <h3>Enterprise Practice</h3>
              <p className="b2b-who">Custom annual roll-out with internal or external practitioners.</p>
              <div className="b2b-price">Custom<small> /annual</small></div>
              <ul className="b2b-list">
                <li>Unlimited circles &amp; employee seats</li>
                <li>Bring your own practitioner panel</li>
                <li>Single Sign-On (SSO / SAML)</li>
                <li>Custom branding &amp; custom domain</li>
              </ul>
              <OHButton href="/talk-to-human" variant="ghost" fullWidth>Talk to Founders →</OHButton>
            </OHCard>
          </div>
          <p className="disclaim-text margin-top-sm">
            All prices subject to applicable GST. Custom corporate billing, PO-based invoices, and MSME terms available on request.
          </p>
        </div>
      </section>

      {/* Section 4: What HR sees / Never sees */}
      <section className="oh-sec" id="flywheel">
        <div className="oh-wrap">
          <div className="sec-head">
            <h2>Privacy &amp; Telemetry Rails</h2>
            <p>We built query-layer privacy controls so HR gets actionable aggregate metrics without ever compromising employee trust.</p>
          </div>
          <div className="privacy-rails-grid">
            <OHCard surface="white" pad="lg" className="rail-card rail-sees">
              <h3 className="rail-head see-title">✓ What HR sees</h3>
              <ul>
                <li>Aggregate participation percentage across team</li>
                <li>Anonymized average sleep and stress index shifts</li>
                <li>Circle completion rates and cohort feedback averages</li>
                <li>High-level focus area distribution (e.g. 40% burnout, 30% parenting)</li>
              </ul>
            </OHCard>

            <OHCard surface="white" pad="lg" className="rail-card rail-never">
              <h3 className="rail-head never-title">✗ What HR NEVER sees</h3>
              <ul>
                <li>Individual employee names or email addresses in telemetry</li>
                <li>Which specific employees attended or missed calls</li>
                <li>Individual check-in notes, mood history, or reflection answers</li>
                <li>Session transcriptions or co-pilot notes</li>
              </ul>
            </OHCard>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default ForOrganizations
