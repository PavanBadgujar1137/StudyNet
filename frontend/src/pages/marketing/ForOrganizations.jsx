import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { OHFooter } from '../../components/openhand'
import { apiConnector } from '../../services/apiConnector'
import toast from 'react-hot-toast'
import { FiSend, FiCheckCircle } from 'react-icons/fi'

export function ForOrganizations() {
  const [convForm, setConvForm] = useState({
    organizationName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    companySize: '',
    message: '',
    interestedIn: [],
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const interests = ['1:1 Coaching', 'Group Circles', 'Employee Wellbeing', 'EAP Replacement', 'Pilot Programme']

  const toggleInterest = (item) => {
    setConvForm(f => ({
      ...f,
      interestedIn: f.interestedIn.includes(item)
        ? f.interestedIn.filter(i => i !== item)
        : [...f.interestedIn, item]
    }))
  }

  const handleBookConversation = async (e) => {
    e.preventDefault()
    if (!convForm.organizationName || !convForm.contactName || !convForm.contactEmail || !convForm.message) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await apiConnector('POST', '/api/v1/org/book-conversation', convForm)
      if (res?.data?.success) {
        setSubmitted(true)
        toast.success("Thanks! We'll be in touch within 24 hours.")
      } else {
        toast.error(res?.data?.message || 'Failed to submit. Please try again.')
      }
    } catch (err) {
      toast.error('Failed to submit. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="org-page">
      {/* Hero */}
      <header className="org-hero">
        <div className="oh-wrap">
          <span className="org-eyebrow">For organizations</span>
          <h1 className="whitespace-nowrap text-center w-full mx-auto">
            Your EAP exists. <span className="org-grad-text">Nobody's using it.</span>
          </h1>
          <p>
            Employee mental health benefits are widely reported to sit largely unused. Not because people don't need them — because a phone number to a stranger isn't how anyone actually opens up. We sell circles instead.
          </p>
          <div className="org-cta-row">
            <Link to="/talk-to-human" className="org-btn">Request a pilot for one team</Link>
            <a href="#how" className="org-btn-ghost">See how a rollout works →</a>
          </div>
        </div>
      </header>

      {/* Section 1: Traditional EAP vs OpenHand Circles */}
      <section className="org-sec">
        <div className="oh-wrap">
          <div className="org-split">
            <div className="org-pane">
              <div className="tag">The traditional EAP</div>
              <h3>A helpline most people never call</h3>
              <p>
                Access is technically universal. Uptake isn't. Each step in the funnel loses people, and the ones who need it most fall out earliest.
              </p>
              <div className="org-funnel">
                <div className="funnel-step">
                  <div className="funnel-head">
                    <span className="funnel-label">Employees covered</span>
                    <span className="funnel-val">100%</span>
                  </div>
                  <div className="funnel-track">
                    <div className="funnel-fill f-gray-1" style={{ width: '100%' }}>
                      <span className="funnel-bar-text">Everyone has access</span>
                    </div>
                  </div>
                </div>

                <div className="funnel-step">
                  <div className="funnel-head">
                    <span className="funnel-label">Know it exists</span>
                    <span className="funnel-val">~60%</span>
                  </div>
                  <div className="funnel-track">
                    <div className="funnel-fill f-gray-2" style={{ width: '60%' }}>
                      <span className="funnel-bar-text">Remember the benefit</span>
                    </div>
                  </div>
                </div>

                <div className="funnel-step">
                  <div className="funnel-head">
                    <span className="funnel-label">Would consider using it</span>
                    <span className="funnel-val">~25%</span>
                  </div>
                  <div className="funnel-track">
                    <div className="funnel-fill f-gray-3" style={{ width: '25%' }}></div>
                    <span className="funnel-outside-text">Trust it's confidential</span>
                  </div>
                </div>

                <div className="funnel-step">
                  <div className="funnel-head">
                    <span className="funnel-label">Actually book</span>
                    <span className="funnel-val badge-red">Single Digits</span>
                  </div>
                  <div className="funnel-track">
                    <div className="funnel-fill f-red" style={{ width: '9%' }}></div>
                    <span className="funnel-outside-text text-red">High stigma & friction drop-off</span>
                  </div>
                </div>
              </div>
              <p className="org-note">
                Illustrative funnel shape based on widely reported low EAP utilisation. Verify against your own provider's numbers.
              </p>
            </div>

            <div className="org-pane dark">
              <div className="tag">OpenHand circles</div>
              <h3>A room your people already belong to</h3>
              <p>
                Eight colleagues, one practitioner, six weeks, a shared topic. Joining is a normal thing your team does — not a confession you make to HR.
              </p>
              <div className="org-funnel">
                <div className="funnel-step">
                  <div className="funnel-head">
                    <span className="funnel-label">Invited to a circle</span>
                    <span className="funnel-val">100%</span>
                  </div>
                  <div className="funnel-track">
                    <div className="funnel-fill f-blue-1" style={{ width: '100%' }}>
                      <span className="funnel-bar-text">Team-level invitation</span>
                    </div>
                  </div>
                </div>

                <div className="funnel-step">
                  <div className="funnel-head">
                    <span className="funnel-label">Attend session one</span>
                    <span className="funnel-val">Higher</span>
                  </div>
                  <div className="funnel-track">
                    <div className="funnel-fill f-blue-2" style={{ width: '75%' }}>
                      <span className="funnel-bar-text">Peers are visibly going</span>
                    </div>
                  </div>
                </div>

                <div className="funnel-step">
                  <div className="funnel-head">
                    <span className="funnel-label">Complete the circle</span>
                    <span className="funnel-val">Higher still</span>
                  </div>
                  <div className="funnel-track">
                    <div className="funnel-fill f-purple-1" style={{ width: '60%' }}>
                      <span className="funnel-bar-text">Group accountability</span>
                    </div>
                  </div>
                </div>

                <div className="funnel-step">
                  <div className="funnel-head">
                    <span className="funnel-label">Continue after</span>
                    <span className="funnel-val">Ongoing</span>
                  </div>
                  <div className="funnel-track">
                    <div className="funnel-fill f-purple-2" style={{ width: '45%' }}>
                      <span className="funnel-bar-text">1:1 or membership</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="org-note" style={{ color: '#8B90B8' }}>
                Directional model, not measured results. Report your real pilot numbers once you have them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Rollout Flow SVG Diagram */}
      <section className="org-sec" id="how">
        <div className="oh-wrap">
          <div className="org-sec-head">
            <h2>A pilot runs in eight weeks</h2>
            <p>One team first. If it doesn't move anything, you've lost eight weeks and one invoice — not a year-long contract.</p>
          </div>
          <div className="org-flow">
            <svg
              className="org-flowsvg"
              viewBox="0 0 1000 250"
              role="img"
              aria-label="Eight week pilot rollout flow from scoping to review"
            >
              <defs>
                <linearGradient id="fg" x1="0" y1="0" x2="1000" y2="0">
                  <stop offset="0" stopColor="#1F5FE0" />
                  <stop offset="0.5" stopColor="#4733C9" />
                  <stop offset="1" stopColor="#8A2BE0" />
                </linearGradient>
                <marker
                  id="ar"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto"
                >
                  <path
                    d="M1 1L9 5L1 9"
                    fill="none"
                    stroke="#8A2BE0"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </marker>
              </defs>
              <line
                x1="70"
                y1="120"
                x2="930"
                y2="120"
                stroke="url(#fg)"
                strokeWidth="3"
                strokeLinecap="round"
                markerEnd="url(#ar)"
                opacity="0.85"
              />

              <g>
                <circle cx="90" cy="120" r="26" fill="#fff" stroke="#1F5FE0" strokeWidth="2.5" />
                <text x="90" y="126" textAnchor="middle" className="ttl" fontSize="14" fill="#1F5FE0">1</text>
                <text x="90" y="70" textAnchor="middle" className="wk" fontSize="10.5">WEEK 0</text>
                <text x="90" y="176" textAnchor="middle" className="ttl" fontSize="13.5">Scope</text>
                <text x="90" y="196" textAnchor="middle" className="sub" fontSize="11.5">Pick one team</text>
                <text x="90" y="212" textAnchor="middle" className="sub" fontSize="11.5">and one theme</text>
              </g>

              <g>
                <circle cx="258" cy="120" r="26" fill="#fff" stroke="#3352D6" strokeWidth="2.5" />
                <text x="258" y="126" textAnchor="middle" className="ttl" fontSize="14" fill="#3352D6">2</text>
                <text x="258" y="70" textAnchor="middle" className="wk" fontSize="10.5">WEEK 1</text>
                <text x="258" y="176" textAnchor="middle" className="ttl" fontSize="13.5">Match</text>
                <text x="258" y="196" textAnchor="middle" className="sub" fontSize="11.5">Practitioner from our</text>
                <text x="258" y="212" textAnchor="middle" className="sub" fontSize="11.5">panel, or bring yours</text>
              </g>

              <g>
                <circle cx="426" cy="120" r="26" fill="#fff" stroke="#4733C9" strokeWidth="2.5" />
                <text x="426" y="126" textAnchor="middle" className="ttl" fontSize="14" fill="#4733C9">3</text>
                <text x="426" y="70" textAnchor="middle" className="wk" fontSize="10.5">WEEK 2</text>
                <text x="426" y="176" textAnchor="middle" className="ttl" fontSize="13.5">Invite</text>
                <text x="426" y="196" textAnchor="middle" className="sub" fontSize="11.5">Opt-in, capped at 8,</text>
                <text x="426" y="212" textAnchor="middle" className="sub" fontSize="11.5">names never sent to HR</text>
              </g>

              <g>
                <circle cx="594" cy="120" r="26" fill="#fff" stroke="#6B33D2" strokeWidth="2.5" />
                <text x="594" y="126" textAnchor="middle" className="ttl" fontSize="14" fill="#6B33D2">4</text>
                <text x="594" y="70" textAnchor="middle" className="wk" fontSize="10.5">WEEKS 3–8</text>
                <text x="594" y="176" textAnchor="middle" className="ttl" fontSize="13.5">Run the circle</text>
                <text x="594" y="196" textAnchor="middle" className="sub" fontSize="11.5">Six weekly sessions</text>
                <text x="594" y="212" textAnchor="middle" className="sub" fontSize="11.5">plus check-ins between</text>
              </g>

              <g>
                <circle cx="762" cy="120" r="26" fill="#fff" stroke="#8A2BE0" strokeWidth="2.5" />
                <text x="762" y="126" textAnchor="middle" className="ttl" fontSize="14" fill="#8A2BE0">5</text>
                <text x="762" y="70" textAnchor="middle" className="wk" fontSize="10.5">WEEK 9</text>
                <text x="762" y="176" textAnchor="middle" className="ttl" fontSize="13.5">Review</text>
                <text x="762" y="196" textAnchor="middle" className="sub" fontSize="11.5">Aggregate-only report,</text>
                <text x="762" y="212" textAnchor="middle" className="sub" fontSize="11.5">renew or walk away</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* Section 3: What your organization gets */}
      <section className="org-sec">
        <div className="oh-wrap">
          <div className="org-sec-head">
            <h2>What your organization gets</h2>
          </div>
          <div className="org-grid3">
            <div className="org-card">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Circles, not helplines</h3>
              <p>Capped at eight people, led by a vetted practitioner, on a theme your team actually named — burnout, managing up, new-parent transitions.</p>
            </div>

            <div className="org-card">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                </svg>
              </div>
              <h3>Confidentiality that holds</h3>
              <p>You get participation rates and themes. You never get names, transcripts, or who said what. That's what makes people show up.</p>
            </div>

            <div className="org-card">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M3 3v18h18M7 15l4-5 4 3 5-7" />
                </svg>
              </div>
              <h3>Reporting leadership can act on</h3>
              <p>Aggregate participation, completion, and theme clustering. Enough to make a budget case; never enough to identify an individual.</p>
            </div>

            <div className="org-card">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3>Priced per seat, not per headcount</h3>
              <p>You pay for people who actually take part. No more buying coverage for 400 employees so that nine can use it.</p>
            </div>

            <div className="org-card">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h3>Your own practitioners, if you have them</h3>
              <p>Already work with counsellors? Bring them onto OpenHand and keep the relationship. We're infrastructure, not a replacement.</p>
            </div>

            <div className="org-card">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3>1:1 access when a circle isn't enough</h3>
              <p>Anyone in a circle can escalate to private sessions with the same practitioner. Continuity, not a fresh referral to a stranger.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Pilot Pricing Tiers */}
      <section className="org-sec">
        <div className="oh-wrap">
          <div className="org-sec-head">
            <h2>Pilot pricing</h2>
            <p>Per participating seat. Nothing for the employees who don't take part.</p>
          </div>
          <div className="org-tiers">
            <div className="org-tier">
              <h3>Single circle</h3>
              <div className="size">One team, 8 seats, 6 weeks</div>
              <div className="amt">₹1,20,000</div>
              <div className="per">≈ ₹15,000 per participating employee</div>
              <ul>
                <li>Vetted practitioner matched</li>
                <li>6 live group sessions</li>
                <li>Weekly check-ins between sessions</li>
                <li>Aggregate completion report</li>
              </ul>
              <Link to="/talk-to-human" className="org-btn-ghost">Request a pilot</Link>
            </div>

            <div className="org-tier feat">
              <span className="badge">Most companies start here</span>
              <h3>Department programme</h3>
              <div className="size">4 circles, 32 seats, running quarterly</div>
              <div className="amt">
                ₹4,20,000<span style={{ fontSize: '15px', fontWeight: 500 }}> /quarter</span>
              </div>
              <div className="per">≈ ₹13,125 per participating employee</div>
              <ul>
                <li>Everything in Single circle</li>
                <li>Choice of themes per circle</li>
                <li>1:1 escalation pathway included</li>
                <li>Quarterly leadership review</li>
                <li>Manager briefing session</li>
              </ul>
              <Link to="/talk-to-human" className="org-btn">Talk to a founder</Link>
            </div>

            <div className="org-tier">
              <h3>Organization-wide</h3>
              <div className="size">Rolling circles across the company</div>
              <div className="amt">Custom</div>
              <div className="per">Volume rates from ₹9,000/seat</div>
              <ul>
                <li>Everything in Department</li>
                <li>Your own practitioner panel</li>
                <li>Branded employee app</li>
                <li>SSO and HRIS integration</li>
                <li>Named account contact</li>
              </ul>
              <Link to="/talk-to-human" className="org-btn-ghost">Talk to a founder</Link>
            </div>
          </div>
          <p className="org-note">
            Indicative pricing for planning purposes. Final rates depend on circle count, practitioner mix, and contract length — confirm on a call before budgeting.
          </p>
        </div>
      </section>

      {/* Section 5: Marketplace Loop Flywheel SVG Diagram */}
      <section className="org-sec">
        <div className="oh-wrap">
          <div className="org-loop">
            <h2>Why this is better for the practitioners too</h2>
            <p>
              Corporate circles aren't a side business bolted onto a coaching platform. They're the engine that makes the whole thing work — because they hand our practitioners paid, filled work they'd otherwise have to go find themselves.
            </p>
            <svg
              className="org-loopsvg"
              viewBox="0 0 940 300"
              role="img"
              aria-label="Circular flywheel diagram showing companies funding circles, practitioners earning, clients continuing, and the directory attracting more practitioners"
            >
              <defs>
                <linearGradient id="fg2" x1="408" y1="88" x2="532" y2="212">
                  <stop offset="0" stopColor="#1F5FE0" />
                  <stop offset="1" stopColor="#8A2BE0" />
                </linearGradient>
                <marker
                  id="ar2"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto"
                >
                  <path
                    d="M1 1L9 5L1 9"
                    fill="none"
                    stroke="#9BB4FF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </marker>
              </defs>

              <path d="M250 60 H690" stroke="#9BB4FF" strokeWidth="2" opacity="0.5" markerEnd="url(#ar2)" fill="none" />
              <path d="M810 105 V195" stroke="#9BB4FF" strokeWidth="2" opacity="0.5" markerEnd="url(#ar2)" fill="none" />
              <path d="M690 240 H250" stroke="#9BB4FF" strokeWidth="2" opacity="0.5" markerEnd="url(#ar2)" fill="none" />
              <path d="M130 195 V105" stroke="#9BB4FF" strokeWidth="2" opacity="0.5" markerEnd="url(#ar2)" fill="none" />

              <g>
                <rect x="30" y="28" width="200" height="76" rx="14" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.16)" />
                <text x="130" y="58" textAnchor="middle" className="lt">Companies buy circles</text>
                <text x="130" y="80" textAnchor="middle">Higher contract value</text>
              </g>

              <g>
                <rect x="710" y="28" width="200" height="76" rx="14" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.16)" />
                <text x="810" y="58" textAnchor="middle" className="lt">Practitioners get paid work</text>
                <text x="810" y="80" textAnchor="middle">Filled seats, no marketing</text>
              </g>

              <g>
                <rect x="710" y="196" width="200" height="76" rx="14" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.16)" />
                <text x="810" y="226" textAnchor="middle" className="lt">Employees continue privately</text>
                <text x="810" y="248" textAnchor="middle">1:1 and memberships</text>
              </g>

              <g>
                <rect x="30" y="196" width="200" height="76" rx="14" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.16)" />
                <text x="130" y="226" textAnchor="middle" className="lt">Directory gets deeper</text>
                <text x="130" y="248" textAnchor="middle">Better practitioners join</text>
              </g>

              <g>
                <circle cx="470" cy="150" r="62" fill="none" stroke="url(#fg2)" strokeWidth="2.5" />
                <text x="470" y="145" textAnchor="middle" className="lt" fontSize="15">OpenHand</text>
                <text x="470" y="166" textAnchor="middle" fontSize="11.5">takes a cut of each</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* Section 6: Confidentiality (HR Sees vs Never Sees) */}
      <section className="org-sec">
        <div className="oh-wrap">
          <div className="org-sec-head">
            <h2>What HR sees, and what HR never sees</h2>
            <p>This distinction is the entire reason people participate. We put it in the contract.</p>
          </div>
          <div className="org-conf">
            <div className="box see">
              <h3>You do see</h3>
              <ul>
                <li>How many seats were taken up</li>
                <li>Completion rate across the circle</li>
                <li>Themes raised, clustered and anonymised</li>
                <li>Aggregate wellbeing direction over time</li>
                <li>Whether people escalated to 1:1 (count only)</li>
              </ul>
            </div>
            <div className="box never">
              <h3>You never see</h3>
              <ul>
                <li>Who joined which circle</li>
                <li>Anything an individual said</li>
                <li>Session recordings or transcripts</li>
                <li>Individual check-in responses</li>
                <li>Who escalated to private sessions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Book a Conversation Form */}
      <section className="org-sec" id="book-conversation" style={{ background: '#F8FAFC' }}>
        <div className="oh-wrap" style={{ maxWidth: 640 }}>
          <div className="org-sec-head" style={{ textAlign: 'center' }}>
            <h2>Book a Conversation</h2>
            <p>Tell us about your organisation and what you are looking for. Our team will respond within 24 hours.</p>
          </div>

          {submitted ? (
            <div style={{ background: '#fff', borderRadius: 20, padding: '48px 32px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
              <FiCheckCircle size={56} color="#10B981" style={{ marginBottom: 16 }} />
              <h3 style={{ margin: '0 0 8px', fontSize: 22 }}>Message Received!</h3>
              <p style={{ color: '#64748B' }}>We will reach out to <strong>{convForm.contactEmail}</strong> within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleBookConversation} style={{ background: '#fff', borderRadius: 20, padding: '36px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Organisation Name *</label>
                  <input value={convForm.organizationName} onChange={e => setConvForm(f => ({ ...f, organizationName: e.target.value }))} placeholder="e.g. Acme Corp" required style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Company Size</label>
                  <select value={convForm.companySize} onChange={e => setConvForm(f => ({ ...f, companySize: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                    <option value="">Select size</option>
                    <option value="1-50">1 to 50</option>
                    <option value="50-200">50 to 200</option>
                    <option value="200-1000">200 to 1000</option>
                    <option value="1000+">1000 plus</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Your Name *</label>
                  <input value={convForm.contactName} onChange={e => setConvForm(f => ({ ...f, contactName: e.target.value }))} placeholder="Full name" required style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Work Email *</label>
                  <input type="email" value={convForm.contactEmail} onChange={e => setConvForm(f => ({ ...f, contactEmail: e.target.value }))} placeholder="you@company.com" required style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 8, fontWeight: 600 }}>Interested In</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {interests.map(item => (
                    <button key={item} type="button" onClick={() => toggleInterest(item)} style={{ padding: '6px 14px', border: convForm.interestedIn.includes(item) ? '1.5px solid #1F5FE0' : '1.5px solid #E2E8F0', borderRadius: 20, fontSize: 13, cursor: 'pointer', background: convForm.interestedIn.includes(item) ? '#EFF6FF' : '#fff', color: convForm.interestedIn.includes(item) ? '#1F5FE0' : '#64748B' }}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Your Message *</label>
                <textarea value={convForm.message} onChange={e => setConvForm(f => ({ ...f, message: e.target.value }))} rows={4} placeholder="Tell us about your team needs and what outcome you are hoping for..." required style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: submitting ? '#CBD5E1' : 'linear-gradient(135deg, #1F5FE0, #8A2BE0)', border: 'none', borderRadius: 12, color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 15 }}>
                <FiSend /> {submitting ? 'Sending...' : 'Book a Conversation'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="org-close">
        <div className="oh-wrap">
          <h2>Start with one team.</h2>
          <p>Eight weeks, eight seats, one invoice. If the numbers do not move, you walk away knowing something true.</p>
          <div className="org-cta-row">
            <Link to="/talk-to-human" className="org-btn">Request a pilot</Link>
            <Link to="/find-a-practitioner" className="org-btn-ghost">See our practitioners</Link>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default ForOrganizations
