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

  // Client savings calculator compute logic
  const calcCompute = (val) => {
    const sessions = val.sessionsPerMonth || 0
    const rate = val.sessionRate || 0
    const courses = val.coursesEnrolled || 0

    // Pay-as-you-go cost (without membership):
    const standalone = sessions * rate + courses * 1500

    // Starter Plan (₹999/mo + full session fee, core courses free):
    const starterCost = 999 + sessions * rate

    // Growth Plan (₹2,999/mo + 15% off sessions, all courses free):
    const growthCost = 2999 + sessions * (rate * 0.85)

    // Master Plan (₹5,999/mo + 1 free session + 25% off extra sessions, all courses free):
    const extraSessions = Math.max(0, sessions - 1)
    const masterCost = 5999 + extraSessions * (rate * 0.75)

    let bestPlan = 'Pay-As-You-Go'
    let bestCost = standalone

    if (starterCost < bestCost) { bestPlan = 'Starter Plan'; bestCost = starterCost }
    if (growthCost < bestCost) { bestPlan = 'Growth Plan'; bestCost = growthCost }
    if (masterCost < bestCost) { bestPlan = 'Master VIP Plan'; bestCost = masterCost }

    const savings = Math.max(0, standalone - bestCost)

    return {
      gross: standalone,
      fee: bestCost,
      net: savings,
      bestPlan,
    }
  }

  const calcSliders = [
    { id: 'sessionsPerMonth', label: '1:1 sessions per month', min: 0, max: 10, value: 2 },
    { id: 'sessionRate', label: 'Average practitioner session fee', min: 1000, max: 10000, step: 250, value: 2500, format: (v) => `₹${v.toLocaleString('en-IN')}` },
    { id: 'coursesEnrolled', label: 'Practitioner courses / cohorts per month', min: 0, max: 5, value: 1 },
  ]

  const faqs = [
    {
      cat: 'Membership & Access',
      q: 'How does the learner membership work?',
      a: 'Your learner membership grants you instant access to practitioner-led courses, live group circles, daily reflection tools, AURA AI insights, and exclusive member discounts on 1:1 sessions.',
    },
    {
      cat: 'Session Perks',
      q: 'How do 1:1 session discounts work?',
      a: 'As a Growth (15% OFF) or Master subscriber (25% OFF + 1 Free session/month), your discounts are automatically calculated and applied at checkout when booking sessions with any verified practitioner.',
    },
    {
      cat: 'Flexibility & Cancellation',
      q: 'Can I change or cancel my plan anytime?',
      a: 'Yes, you can upgrade, downgrade, or cancel your membership at any time. There are no lock-in periods, hidden charges, or cancellation penalties.',
    },
    {
      cat: 'Family Access',
      q: 'Can I share my plan with family members?',
      a: 'Yes! The Master Plan includes family sharing for up to 3 sub-accounts, allowing your family members to access courses, group circles, and wellness tools under one subscription.',
    },
    {
      cat: 'Privacy & Security',
      q: 'Is my personal reflection and session data confidential?',
      a: '100% confidential. Your check-ins, journal prompts, and AURA AI notes are end-to-end encrypted and completely private to you.',
    },
    {
      cat: 'Payments',
      q: 'What payment methods do you accept?',
      a: 'We accept all major Indian and global payment options through Razorpay — including UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Wallets.',
    },
  ]

  return (
    <div className="oh-pricing-page font-sans bg-slate-50 min-h-screen text-slate-900 relative">


      {/* Hero */}
      <header className="oh-pricing-hero pt-14 pb-8 text-center bg-gradient-to-b from-white to-slate-50 border-b border-slate-100">
        <div className="oh-wrap max-w-5xl mx-auto px-4">
          <OHEyebrow>Practitioner Journey &amp; Pricing</OHEyebrow>
          <h1 className="text-center w-full mx-auto text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight my-4">
            Invest in your wellness. <span className="oh-grad-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Care built around you.</span>
          </h1>
          <p className="sub text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-6">
            Choose the learner or practitioner plan that fits your care journey. Unlock courses, live group circles, daily check-ins, and AURA AI guidance.
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

      {/* Learner Savings Calculator */}
      <section className="oh-sec py-12 bg-white border-t border-b border-slate-200">
        <div className="oh-wrap max-w-5xl mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3">Calculate your monthly learner savings</h2>
            <p className="text-slate-600 text-base font-medium">
              Drag the sliders below to estimate your savings on 1:1 sessions, courses, and group circles with OpenHand learner memberships.
            </p>
          </div>

          <OHRangeCalculator
            sliders={calcSliders}
            compute={calcCompute}
            note="Estimates based on standard standalone session &amp; course prices vs OpenHand learner membership benefits. Payment gateway charges and taxes are processed at checkout."
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
                <tr><td className="p-4 font-semibold text-slate-900">Live Group Circles &amp; Cohorts</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Unlimited in Growth &amp; Master</td><td className="p-4 text-slate-600">₹800+ / circle</td><td className="no p-4 text-slate-400">✕ Extra charge</td><td className="no p-4 text-slate-400">✕ N/A</td></tr>
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
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3">Frequently asked learner questions</h2>
            <p className="text-slate-600 text-base font-medium">Clear answers about learner membership access, session perks, family sharing, and privacy.</p>
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
