import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import openHand4StepsSvg from '../../assets/Images/OpenHand_4_Steps_High_Resolution.svg'
import {
  OHFooter,
  OHButton,
  OHEyebrow,
  OHPricingSection,
} from '../../components/openhand'

export function PractitionerJourney() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)
  const [unlockEmail, setUnlockEmail] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)

  // Sliders state
  const [sessionsCount, setSessionsCount] = useState(8)
  const [sessionRate, setSessionRate] = useState(3000)
  const [circlesCount, setCirclesCount] = useState(2)
  const [seatsCount, setSeatsCount] = useState(6)
  const [seatPrice, setSeatPrice] = useState(1500)

  // Dynamic Calculations
  const totalEarnings = (sessionsCount * sessionRate) + (circlesCount * seatsCount * seatPrice)
  let calculatedPlan = 'Starter'
  if (circlesCount > 2 || sessionsCount > 5) calculatedPlan = 'Growth'
  if (sessionsCount > 10 || (circlesCount * seatsCount) > 50) calculatedPlan = 'Master'

  const handleUnlock = (e) => {
    e.preventDefault()
    if (!unlockEmail || !unlockEmail.includes('@')) {
      toast.error('Please enter a valid practitioner email')
      return
    }
    setIsUnlocked(true)
    toast.success('Calculator unlocked! Enter your practice numbers.')
  }

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
      a: 'OpenHand charges 0% platform commission on your earnings. Tiered platform subscription plans (Starter ₹999, Growth ₹2,999, Master ₹5,999) cover platform hosting, AURA intelligence, and payment gateway infrastructure with direct T+2 bank payouts.',
    },
    {
      cat: 'AURA & Privacy',
      q: 'How does AURA handle client consent and data privacy?',
      a: 'AURA operates strictly on explicit client and practitioner consent. Audio or transcripts are never stored permanently, never used to train public AI models, and only aftercare summary drafts are generated for practitioner review before saving.',
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
          <p className="sub text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-4">
            OpenHand gives practitioners a free starting point — publish offers, run 1:1 Sessions, host Circles, and use AURA — consent-first session AI — to hold space better.
          </p>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm font-bold shadow-xs">
            <span>✨</span>
            <span>Trusted by 1,200+ practitioners across India</span>
          </div>
        </div>
      </header>

      {/* HOW IT ACTUALLY WORKS — 4 Steps High Resolution Banner */}
      <section className="oh-sec py-8 sm:py-14 bg-white relative" id="how-it-works">
        <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-center">
          <img
            src={openHand4StepsSvg}
            alt="Get Started in 4 Simple Steps — Share, Teach, Help, Get Rewarded"
            className="w-full h-auto max-w-[1360px] object-contain block select-none"
            loading="eager"
          />
        </div>
      </section>

      {/* Practitioner Pricing Section */}
      <OHPricingSection
        defaultRole="practitioner"
        hideRoleSwitcher={true}
        title="Practitioner Platform Subscriptions"
        subtitle="Choose the practitioner plan tailored to your practice size and growth goals."
      />

      {/* PRACTITIONER Earnings Calculator — Two Ways Gated Mockup UI */}
      <section className="oh-sec py-16 bg-slate-50/70 border-t border-b border-slate-200" id="earnings-calculator">
        <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">
              Two ways to show the earnings calculator
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
              Illustrative mockup only — not the real OpenHand page. Left: what a visitor (learner, competitor,
              anyone) sees by default. Right: the interactive slider calculator, unlocked only for signed-in
              practitioners.
            </p>
          </div>

          {/* 2-Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-8 w-full">
            
            {/* Left Card — Visible to Everyone (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              
              <div>
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-blue-50 text-blue-600 border border-blue-100">
                    VISIBLE TO EVERYONE
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5 mb-6">
                  <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    ✓ 0% commission on Starter
                  </span>
                  <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                    Direct Razorpay payouts
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
                  Keep what you earn
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                  OpenHand doesn't take a cut of your session or Circle fees. A flat monthly platform plan covers hosting, AURA and payments — the rest is yours.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <span className="text-sm font-semibold text-slate-800">Practitioner running 8 sessions/mo</span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">Keeps ~90%+</div>
                      <div className="text-[11px] text-slate-400 font-medium">illustrative</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <span className="text-sm font-semibold text-slate-800">Practitioner hosting 2 Circles/mo</span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">Keeps ~90%+</div>
                      <div className="text-[11px] text-slate-400 font-medium">illustrative</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700 space-y-2 mb-6">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="text-emerald-600 font-bold">✓</span> Direct client payouts settled to your bank account
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <span className="text-emerald-600 font-bold">✓</span> Transparent fixed monthly subscription
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <span className="text-emerald-600 font-bold">✓</span> You own 100% of your client relationships &amp; notes
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => navigate('/login?role=practitioner')}
                  className="w-full py-4 px-6 rounded-xl font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  See your exact take-home →
                </button>
                <p className="text-xs text-slate-500 text-center mt-3 font-medium">
                  Sign in to open the calculator with your own numbers
                </p>
              </div>
            </div>

            {/* Right Card — Unlocked for Practitioners (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-amber-400 to-orange-500"></div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-200">
                    UNLOCKED FOR PRACTITIONERS
                  </span>
                  {isUnlocked && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      ✓ Active
                    </span>
                  )}
                </div>

                <div className="w-11 h-11 mx-auto rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 mb-3 shadow-sm">
                  <span className="text-lg">🔒</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-2 tracking-tight">
                  Calculate your exact earnings
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm text-center max-w-lg mx-auto mb-4 leading-relaxed font-medium">
                  Enter your practitioner email to unlock the interactive calculator with your own session count, fees and Circle pricing.
                </p>

                <form onSubmit={handleUnlock} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto w-full mb-2.5">
                  <input
                    type="email"
                    value={unlockEmail}
                    onChange={(e) => setUnlockEmail(e.target.value)}
                    placeholder="Enter email"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 text-sm shadow-sm transition-all whitespace-nowrap cursor-pointer"
                  >
                    {isUnlocked ? 'Update' : 'Unlock'}
                  </button>
                </form>

                <div className="text-center mb-5">
                  <button
                    onClick={() => navigate('/login?role=practitioner')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Already a practitioner? Sign in instead →
                  </button>
                </div>
              </div>

              {/* Embedded Calculator Container */}
              <div className="relative rounded-2xl bg-[#090E1A] p-5 sm:p-6 text-white shadow-inner border border-slate-800 overflow-hidden">
                
                {/* 2-Column Split: Sliders on Left, Result Card on Right */}
                <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 items-center ${!isUnlocked ? 'filter blur-[3.5px] opacity-40 pointer-events-none select-none' : ''}`}>
                  
                  {/* Left Column: Sliders (7 cols) */}
                  <div className="md:col-span-7 space-y-3.5">
                    
                    {/* Slider 1 */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                        <span>1:1 Sessions per month</span>
                        <span className="font-bold text-white text-sm">{sessionsCount}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={sessionsCount}
                        onChange={(e) => setSessionsCount(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Slider 2 */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                        <span>Your session fee</span>
                        <span className="font-bold text-white text-sm">₹{sessionRate.toLocaleString('en-IN')}</span>
                      </div>
                      <input
                        type="range"
                        min="500"
                        max="15000"
                        step="500"
                        value={sessionRate}
                        onChange={(e) => setSessionRate(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Slider 3 */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                        <span>Circles hosted per month</span>
                        <span className="font-bold text-white text-sm">{circlesCount}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="8"
                        value={circlesCount}
                        onChange={(e) => setCirclesCount(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Slider 4 */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                        <span>Seats per Circle (max 8)</span>
                        <span className="font-bold text-white text-sm">{seatsCount}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        value={seatsCount}
                        onChange={(e) => setSeatsCount(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Slider 5 */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                        <span>Price per Circle seat</span>
                        <span className="font-bold text-white text-sm">₹{seatPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <input
                        type="range"
                        min="500"
                        max="5000"
                        step="250"
                        value={seatPrice}
                        onChange={(e) => setSeatPrice(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                  </div>

                  {/* Right Column: Result Card (5 cols) */}
                  <div className="md:col-span-5 h-full flex flex-col justify-center">
                    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-5 text-center text-white shadow-lg border border-white/10">
                      <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-100 mb-1">
                        YOU KEEP, PER MONTH
                      </div>
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight my-2">
                        ₹{totalEarnings.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-blue-100/90 font-medium mb-3">
                        OpenHand charges 0% commission — you keep everything above your monthly plan fee.
                      </div>
                      <div className="inline-block bg-white/20 backdrop-blur-xs px-3.5 py-1.5 rounded-full text-xs font-bold text-white border border-white/10">
                        Best plan for you: {calculatedPlan}
                      </div>
                    </div>
                  </div>

                </div>

                <p className="text-[11px] text-slate-400 text-center mt-4 font-medium border-t border-slate-800/80 pt-3">
                  Payment gateway charges and taxes apply at checkout.
                </p>

                {/* Locked Centered Overlay */}
                {!isUnlocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
                    <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 text-center max-w-[280px]">
                      Full slider calculator appears here once unlocked
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

          {/* Bottom Explanatory Box (Wide) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 w-full shadow-sm text-left">
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
              <strong className="text-slate-900 font-bold">Why split it this way:</strong> the left panel keeps the trust-building message (&quot;no commission&quot;) visible to any visitor, so it still works as a conversion tool in search results and social shares. The right panel — the exact plan-by-plan slider with real ₹ figures — only renders after an email or sign-in, so a casual visitor or a competitor scanning the page can't screenshot your full pricing model or reverse-engineer your unit economics. It also gives you a practitioner lead capture at the exact moment someone is most convinced.
            </p>
          </div>

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
                <tr><td className="p-4 font-semibold text-slate-900">Practitioner Courses Library</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Included in Growth &amp; Master</td><td className="p-4 text-slate-600">₹1,500+ / course</td><td className="p-4 text-slate-600">Pay per course</td><td className="no p-4 text-slate-400">✕ Not offered</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Live Group Circles</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Unlimited in Growth &amp; Master</td><td className="p-4 text-slate-600">₹800+ / circle</td><td className="no p-4 text-slate-400">✕ Extra charge</td><td className="no p-4 text-slate-400">✕ Not offered</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">1:1 Session Discounts</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ 15%–25% OFF + 1 Free/mo on Master</td><td className="no p-4 text-slate-400">✕ 0% discount</td><td className="no p-4 text-slate-400">✕ 0% discount</td><td className="no p-4 text-slate-400">✕ Full fee always</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Personal AI Companion (AURA)</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Included in all plans</td><td className="no p-4 text-slate-400">✕ Not offered</td><td className="no p-4 text-slate-400">✕ Not offered</td><td className="no p-4 text-slate-400">✕ Not offered</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Daily Reflection &amp; Mood Check-ins</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Included in all plans</td><td className="no p-4 text-slate-400">✕ Not offered</td><td className="no p-4 text-slate-400">✕ Not offered</td><td className="no p-4 text-slate-400">✕ Not offered</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Family Account Sharing</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Up to 3 sub-accounts on Master</td><td className="no p-4 text-slate-400">✕ Not offered</td><td className="no p-4 text-slate-400">✕ Not offered</td><td className="no p-4 text-slate-400">✕ Not offered</td></tr>
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
            Ready to build your practice?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
            Start free on OpenHand, publish your first offer, and upgrade to Growth or Master Studio whenever you&apos;re ready to scale. No commission, no lock-in.
          </p>
          <div className="cta-row flex flex-wrap items-center justify-center gap-4">
            <OHButton href="/signup?role=practitioner" size="lg">Start Free — No Card Required</OHButton>
            <OHButton href="#pricing" variant="ghost" size="lg">Compare Plans →</OHButton>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default PractitionerJourney
