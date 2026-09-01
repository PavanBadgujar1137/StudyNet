import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { OHFooter, OHNeverDoSection } from '../../components/openhand'
import {
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiCalendar,
  FiArrowRight
} from 'react-icons/fi'


const EIGHT_WEEK_STEPS = [
  {
    weekNum: 1,
    badge: 'Week 1',
    title: 'Scope & Theme Alignment',
    subtitle: 'Pick one team and one specific focus theme',
    desc: 'Align leadership on the target pilot team (e.g. Engineering or Customer Care) and select an initial focus topic like burnout recovery or managing rapid change.',
    activity: 'Team scoping call · Capped at 8 seats · Employee interest survey sent out.',
  },
  {
    weekNum: 2,
    badge: 'Week 2',
    title: 'Vetted Practitioner Matching',
    badgeText: 'Week 2',
    subtitle: 'Match with a certified guide or bring your own',
    desc: 'We match your circle with a specialized, accredited practitioner from our panel or onboard your organization’s existing wellness facilitator onto OpenHand.',
    activity: 'Practitioner profile delivered · Circle curriculum approved · Infrastructure ready.',
  },
  {
    weekNum: 3,
    badge: 'Week 3',
    title: 'Private Opt-In & Anonymous Onboarding',
    subtitle: 'Confidential employee opt-in container',
    desc: 'Team members receive voluntary invitations. Names and individual check-in responses are strictly confidential and never shared with management or HR.',
    activity: '100% Voluntary opt-in · Names never sent to HR · Confidential welcome kit.',
  },
  {
    weekNum: 4,
    badge: 'Week 4',
    title: 'Circle Session 1: Foundation & Space',
    subtitle: 'First live group session & pod kickoff',
    desc: 'The 8-person circle holds its inaugural live video session led by the practitioner, establishing shared group norms and initial reflection goals.',
    activity: 'Live 60-min container · Peer pod activated · Pre-session intention check-in.',
  },
  {
    weekNum: 5,
    badge: 'Week 5',
    title: 'Circle Session 2 & 3: Deepening Focus',
    subtitle: 'Mid-pilot engagement & reflection nudges',
    desc: 'Midway through the pilot, participants engage in weekly live sessions accompanied by gentle 2-minute asynchronous check-ins between calls.',
    activity: '2 Live sessions completed · Asynchronous check-in retention: 88% active rate.',
  },
  {
    weekNum: 6,
    badge: 'Week 6',
    title: 'Circle Session 4: Workplace Integration',
    subtitle: 'Translating insights into daily team habits',
    desc: 'Focus shifts toward practical workplace boundaries, workload communication, and peer support strategies tested in real team settings.',
    activity: 'Practical boundary toolkit shared · Peer pod check-in · Practitioner guidance.',
  },
  {
    weekNum: 7,
    badge: 'Week 7',
    title: 'Circle Session 5: Longitudinal Progress',
    subtitle: 'Peer pod accountability & individual growth',
    desc: 'Participants review their longitudinal progress timeline, noting personal shifts in stress resilience and team communication.',
    activity: 'Progress timeline unlocked · 1:1 escalation pathway introduced for interested peers.',
  },
  {
    weekNum: 8,
    badge: 'Week 8',
    title: 'Circle Session 6 & Executive Review',
    subtitle: 'Final circle session & aggregate outcome report',
    desc: 'The circle concludes with a celebration of progress. HR receives an aggregate-only impact report measuring participation and theme clusters.',
    activity: 'Final session completed · Anonymous aggregate report · Option to renew or walk away.',
  },
]

export function ForOrganizations() {
  const [activeWeekIndex, setActiveWeekIndex] = useState(0)

  const handlePrevWeek = () => {
    setActiveWeekIndex((prev) => (prev > 0 ? prev - 1 : EIGHT_WEEK_STEPS.length - 1))
  }

  const handleNextWeek = () => {
    setActiveWeekIndex((prev) => (prev < EIGHT_WEEK_STEPS.length - 1 ? prev + 1 : 0))
  }

  const currentStep = EIGHT_WEEK_STEPS[activeWeekIndex]

  return (
    <div className="org-page relative min-h-screen">

      {/* Hero */}
      <header className="org-hero">
        <div className="oh-wrap">
          <span className="org-eyebrow">For organizations</span>
          <h1 className="text-center w-full mx-auto text-[clamp(22px,6vw,58px)] leading-tight">
            Your EAP exists. <span className="org-grad-text">Nobody's using it.</span>
          </h1>
          <p>
            Employee mental health benefits are widely reported to sit largely unused. Not because people don't need them — because a phone number to a stranger isn't how anyone actually opens up. We sell circles instead.
          </p>
          <div className="org-cta-row flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/contact-us" className="org-btn">Request a pilot for one team</Link>
            <a href="#how" className="org-btn-ghost">See how a rollout works →</a>
          </div>
        </div>
      </header>

      {/* Section 1: Traditional EAP vs OpenHand Circles */}
      <section className="org-sec">
        <div className="oh-wrap">
          <div className="org-split grid grid-cols-1 md:grid-cols-2 gap-5">
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

      {/* Section 2: Interactive 8-Week Timeline Stepper (Items 2 & 4) */}
      <section className="org-sec bg-slate-950/60 py-12 border-y border-slate-800" id="how">
        <div className="oh-wrap">
          <div className="org-sec-head text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
              Structured Rollout
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">A pilot runs in eight weeks</h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-base">
              One team first. If it doesn't move anything, you've lost eight weeks and one invoice — not a year-long contract.
            </p>
          </div>

          {/* Interactive Week Circle Badges & Controls Header */}
          <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl mb-6">
            
            <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800 flex-wrap sm:flex-nowrap">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Interactive Timeline Stepper</span>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiCalendar className="text-sky-400" /> Week-by-Week Pilot Roadmap
                </h3>
              </div>

              {/* Prev / Next Arrow Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevWeek}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors border border-slate-700"
                  title="Previous Week"
                  aria-label="Previous Week"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-bold text-slate-300 px-2 min-w-[70px] text-center">
                  Week {activeWeekIndex + 1} of 8
                </span>
                <button
                  onClick={handleNextWeek}
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors shadow-lg shadow-blue-600/30"
                  title="Next Week (Navigates through Week 8)"
                  aria-label="Next Week"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Horizontal Week Circles Selector (Week 1 to Week 8) */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-8">
              {EIGHT_WEEK_STEPS.map((step, idx) => {
                const isActive = activeWeekIndex === idx
                return (
                  <button
                    key={step.weekNum}
                    type="button"
                    onClick={() => setActiveWeekIndex(idx)}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all border text-center cursor-pointer ${
                      isActive
                        ? 'bg-sky-400 text-slate-950 font-bold border-sky-300 shadow-lg shadow-sky-400/30 scale-105 z-10'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border-slate-700/60'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-wider mb-1 opacity-90">
                      Week {step.weekNum}
                    </span>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                      isActive ? 'bg-slate-950 text-sky-400' : 'bg-slate-900 text-slate-200'
                    }`}>
                      {step.weekNum}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Active Week Activity Card Detail Box */}
            <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30 mb-2">
                    {currentStep.badge} — Milestone Phase
                  </span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{currentStep.title}</h3>
                  <p className="text-sm font-medium text-slate-300 mt-1">{currentStep.subtitle}</p>
                </div>
                <Link
                  to="/contact-us"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors shrink-0 shadow-md"
                >
                  Request Week {currentStep.weekNum} Pilot <FiArrowRight />
                </Link>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                {currentStep.desc}
              </p>

              {/* ITEM 4 FIX: High-Contrast Dark Text for Light Blue Activity Box */}
              <div className="rounded-xl p-4 bg-sky-100 border border-sky-300 shadow-md">
                <div className="flex items-start gap-2.5">
                  <FiCheckCircle className="w-5 h-5 text-sky-800 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-sky-900 block mb-0.5">
                      Week Activity &amp; Deliverable Output:
                    </span>
                    <p className="text-slate-950 font-extrabold text-sm sm:text-base leading-snug">
                      {currentStep.activity}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 3: What your organization gets */}
      <section className="org-sec">
        <div className="oh-wrap">
          <div className="org-sec-head">
            <h2>What your organization gets</h2>
          </div>
          <div className="org-grid3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
              <h3>15-Minute Emergency SLA</h3>
              <p>24/7 dedicated support desk with 15-minute first response SLA for live-session technical or crisis escalations.</p>
            </div>
            <div className="org-card">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
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
          <div className="org-tiers grid grid-cols-1 md:grid-cols-3 gap-5">
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
              <Link to="/contact-us" className="org-btn-ghost">Request a pilot</Link>
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
              <Link to="/contact-us" className="org-btn">Talk to a founder</Link>
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
              <Link to="/contact-us" className="org-btn-ghost">Talk to a founder</Link>
            </div>
          </div>
          <p className="org-note">
            Indicative pricing for planning purposes. Final rates depend on circle count, practitioner mix, and contract length — confirm on a call before budgeting.
          </p>
        </div>
      </section>

      {/* Section 5: Confidentiality & Uniform Never Do Section (Item 5) */}
      <section className="org-sec">
        <div className="oh-wrap">
          <div className="org-sec-head">
            <h2>What HR sees, and what HR never sees</h2>
            <p>This distinction is the entire reason people participate. We put it in the contract.</p>
          </div>
          <div className="org-conf grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="box see rounded-2xl p-6 sm:p-8 bg-slate-900 border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4">You do see</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> How many seats were taken up
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Completion rate across the circle
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Themes raised, clustered and anonymised
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Aggregate wellbeing direction over time
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Whether people escalated to 1:1 (count only)
                </li>
              </ul>
            </div>

            {/* ITEM 5: Uniform OHNeverDoSection component */}
            <OHNeverDoSection
              title="What HR never sees"
              subtitle="Strict employee privacy limits hardcoded into OpenHand contracts:"
              items={[
                "Who joined which circle or attended specific weekly calls.",
                "Anything an individual employee said during group sessions.",
                "Session video recordings, chat logs, or transcription records.",
                "Individual daily reflection check-in responses.",
                "Who escalated to private 1:1 sessions with practitioners."
              ]}
            />
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="org-close">
        <div className="oh-wrap">
          <h2>Start with one team.</h2>
          <p>Eight weeks, eight seats, one invoice. If the numbers do not move, you walk away knowing something true.</p>
          <div className="org-cta-row">
            <Link to="/contact-us" className="org-btn">Request a pilot</Link>
            <Link to="/find-a-practitioner" className="org-btn-ghost">See our practitioners</Link>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default ForOrganizations
