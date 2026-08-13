import React, { useState } from 'react'
import {
  OHFooter,
  OHButton,
  OHEyebrow,
  OHRangeCalculator,
  OHPricingSection,
} from '../../components/openhand'

export function PractitionerJourney() {
  const [openFaq, setOpenFaq] = useState(null)

  // PRACTITIONER earnings calculator — "what you keep per month"
  // (was incorrectly a learner savings calculator — fixed per 5.3)
  const calcCompute = (val) => {
    const sessionsPerMonth = val.sessionsPerMonth || 0
    const sessionFee = val.sessionRate || 0
    const circlesPerMonth = val.circlesPerMonth || 0
    const seatsPerCircle = val.seatsPerCircle || 0
    const pricePerSeat = val.pricePerSeat || 0

    const sessionRevenue = sessionsPerMonth * sessionFee
    const circleRevenue = circlesPerMonth * seatsPerCircle * pricePerSeat
    const gross = sessionRevenue + circleRevenue

    // ⚠️ CP-6: Actual commission/take-rate CLIENT_SUPPLIED — placeholder 0% used
    // Client must confirm actual rate. Replace 0 with real decimal (e.g., 0.08 = 8%)
    const COMMISSION_RATE = 0  // TODO: CLIENT_SUPPLIED_COMMISSION_%
    const fee = gross * COMMISSION_RATE
    const net = gross - fee

    // Best plan suggestion
    let bestPlan = 'Free Tier'
    if (circlesPerMonth > 0 || sessionsPerMonth > 2) bestPlan = 'Starter'
    if (circlesPerMonth > 2 || sessionsPerMonth > 5) bestPlan = 'Growth'
    if (sessionsPerMonth > 10 || (circlesPerMonth * seatsPerCircle) > 50) bestPlan = 'Master'

    return { gross, fee, net, bestPlan }
  }

  const calcSliders = [
    { id: 'sessionsPerMonth', label: '1:1 Sessions per month', min: 0, max: 30, value: 8 },
    { id: 'sessionRate', label: 'Your session fee (per session)', min: 500, max: 15000, step: 500, value: 3000, format: (v) => `₹${v.toLocaleString('en-IN')}` },
    { id: 'circlesPerMonth', label: 'Circles hosted per month', min: 0, max: 8, value: 2 },
    { id: 'seatsPerCircle', label: 'Seats per Circle (max 8)', min: 1, max: 8, value: 6 },
    { id: 'pricePerSeat', label: 'Price per Circle seat', min: 500, max: 5000, step: 250, value: 1500, format: (v) => `₹${v.toLocaleString('en-IN')}` },
  ]

  // Practitioner FAQs — per 5.3 (was incorrectly showing learner FAQs on practitioner page)
  const faqs = [
    {
      cat: 'Payouts & Fees',
      q: 'How and when do I get paid?',
      a: 'All payments from learners are processed via Razorpay and settled directly to your bank account on a rolling 7-day basis. You can view your full payout ledger under Payouts in your Practice Cockpit.',
    },
    {
      cat: 'Commission & Take-Rate',
      q: 'What take-rate or commission does OpenHand charge?',
      a: 'OpenHand charges 0% platform commission on your initial earnings. Tiered platform subscription plans (Starter ₹999, Growth ₹2,999, Master ₹5,999) cover platform hosting, AURA intelligence, and payment gateway infrastructure with direct T+2 bank payouts.',
    },
    {
      cat: 'Circles',
      q: 'How does billing work for Circles?',
      a: 'You set the per-seat price for each Circle you publish. Each learner pays their seat price directly. Circle billing is per-seat, not per-session — you collect the full amount up front for the whole Circle run.',
    },
    {
      cat: 'Free Tier',
      q: 'What can I do on the free tier before paying?',
      a: 'On the free tier you can complete all 4 onboarding steps, publish 1 offer, appear in the practitioner directory, and use AURA Aftercare Notes (post-session drafting). Payment is only triggered when you receive your first booking or publish your first Circle.',
    },
    {
      cat: 'AURA',
      q: 'Which AURA features are free?',
      a: 'AURA Aftercare Notes (post-session note drafting) is free on every plan including the free tier. The live in-session AURA panel (AURA Live Prompts) is available from Starter tier onwards.',
    },
    {
      cat: 'Calendar & Tools',
      q: 'Does OpenHand sync with my existing calendar?',
      a: 'Yes — OpenHand supports Google Calendar, Outlook, and iCal sync. You can configure this in your Practice Cockpit under Profile & Settings.',
    },
  ]

  return (
    <div className="oh-pricing-page font-sans bg-slate-50 min-h-screen text-slate-900 relative">


      {/* Hero */}
      <header className="oh-pricing-hero pt-14 pb-8 text-center bg-gradient-to-b from-white to-slate-50 border-b border-slate-100">
        <div className="oh-wrap max-w-5xl mx-auto px-4">
          <OHEyebrow>Practitioner Journey &amp; Pricing</OHEyebrow>
          {/* PJ-1 fix: replaced learner hero copy with practitioner-facing copy */}
          <h1 className="text-center w-full mx-auto text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight my-4">
            Build your practice. <span className="oh-grad-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Keep what you earn.</span>
          </h1>
          <p className="sub text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-6">
            OpenHand gives practitioners a free starting point — publish offers, run 1:1 Sessions, host Circles, and use AURA — consent-first session AI — to hold space better.
          </p>
        </div>
      </header>

      {/* Practitioner Pricing Section */}
      <OHPricingSection
        defaultRole="practitioner"
        hideRoleSwitcher={true}
        title="Practitioner Platform Subscriptions"
        subtitle="Choose the practitioner plan tailored to your practice size and growth goals."
      />

      {/* PRACTITIONER Earnings Calculator — PJ-1/5.3: was incorrectly showing learner savings */}
      <section className="oh-sec py-12 bg-white border-t border-b border-slate-200">
        <div className="oh-wrap max-w-5xl mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3">What you keep per month</h2>
            <p className="text-slate-600 text-base font-medium">
              Drag the sliders to estimate your monthly earnings from 1:1 Sessions and Circles on OpenHand.
              {/* ⚠️ CP-6: commission rate is CLIENT_SUPPLIED — currently shown as 0% placeholder */}
            </p>
          </div>

          <OHRangeCalculator
            sliders={calcSliders}
            compute={calcCompute}
            note="⚠️ Commission / take-rate is CLIENT_SUPPLIED and currently shown as 0%. Confirm actual rate with the client before publishing. Payment gateway charges and taxes apply at checkout."
          />
        </div>
      </section>

      {/* Why Choose OpenHand Section */}
      <section className="oh-sec py-16 bg-slate-50">
        <div className="oh-wrap max-w-5xl mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3">Why learners choose OpenHand membership</h2>
            <p className="text-slate-600 text-base font-medium">
              Compare OpenHand learner subscriptions against traditional pay-as-you-go platforms and standalone sessions.
            </p>
          </div>
          
          <div className="cmp-table-wrap overflow-x-auto bg-white border border-slate-200 rounded-3xl shadow-sm">
            <table className="cmp-table w-full border-collapse text-sm min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-4 text-left font-bold text-slate-700 bg-slate-50">Feature / Benefit</th>
                  <th className="us-col p-4 text-left font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600">OpenHand Membership</th>
                  <th className="p-4 text-left font-bold text-slate-700 bg-slate-50">Standalone Pay-As-You-Go</th>
                  <th className="p-4 text-left font-bold text-slate-700 bg-slate-50">Standard Apps</th>
                  <th className="p-4 text-left font-bold text-slate-700 bg-slate-50">Traditional Offline Care</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr><td className="p-4 font-semibold text-slate-900">Monthly Subscription Starting Price</td><td className="us-col p-4 font-bold text-blue-700 bg-blue-50/70">₹999/mo</td><td className="p-4 text-slate-600">No subscription</td><td className="p-4 text-slate-600">Varies per platform</td><td className="p-4 text-slate-600">No subscription option</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Practitioner Courses Library</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Included in Growth &amp; Master</td><td className="p-4 text-slate-600">₹1,500+ / course</td><td className="p-4 text-slate-600">Pay per course</td><td className="no p-4 text-slate-400">✕ N/A</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Live Group Circles</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Unlimited in Growth &amp; Master</td><td className="p-4 text-slate-600">₹800+ / circle</td><td className="no p-4 text-slate-400">✕ Extra charge</td><td className="no p-4 text-slate-400">✕ N/A</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">1:1 Session Discounts</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ 15%–25% OFF + 1 Free/mo on Master</td><td className="no p-4 text-slate-400">✕ 0% discount</td><td className="no p-4 text-slate-400">✕ 0% discount</td><td className="no p-4 text-slate-400">✕ Full fee always</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Personal AI Companion (AURA)</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Included in all plans</td><td className="no p-4 text-slate-400">✕ N/A</td><td className="no p-4 text-slate-400">✕ N/A</td><td className="no p-4 text-slate-400">✕ N/A</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Daily Reflection &amp; Mood Check-ins</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Included in all plans</td><td className="no p-4 text-slate-400">✕ N/A</td><td className="no p-4 text-slate-400">✕ N/A</td><td className="no p-4 text-slate-400">✕ N/A</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Family Account Sharing</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Up to 3 sub-accounts on Master</td><td className="no p-4 text-slate-400">✕ N/A</td><td className="no p-4 text-slate-400">✕ N/A</td><td className="no p-4 text-slate-400">✕ N/A</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 2-Column FAQ Grid */}
      <section className="oh-sec py-12" id="faq">
        <div className="oh-wrap max-w-[1240px] mx-auto px-4">
          <div className="sec-head text-center max-w-3xl mx-auto mb-10">
          {/* PJ-1 fix: renamed from "Frequently asked learner questions" */}
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3">Practitioner questions</h2>
          <p className="text-slate-600 text-base font-medium">Clear answers about payouts, commission, Circle billing, free tier access, AURA, and calendar sync.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i
              return (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-blue-300 transition-all cursor-pointer"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                      {f.cat}
                    </span>
                    <span className="text-slate-400 font-bold text-lg">
                      {isOpen ? '−' : '+'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                    {f.q}
                  </h3>
                  <p className={`text-slate-700 text-sm leading-relaxed font-medium ${isOpen ? 'block' : 'line-clamp-2'}`}>
                    {f.a}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="oh-sec py-16 bg-gradient-to-b from-slate-50 to-white text-center border-t border-slate-200">
        <div className="oh-wrap max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Start your personal care journey today.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
            Subscribe to an OpenHand learner plan or find a practitioner to get started. Switch or cancel anytime.
          </p>
          <div className="cta-row flex flex-wrap items-center justify-center gap-4">
            <OHButton href="#plans" size="lg">Choose a Learner Plan</OHButton>
            <OHButton href="/find-a-practitioner" variant="ghost" size="lg">Find a Practitioner →</OHButton>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default PractitionerJourney
