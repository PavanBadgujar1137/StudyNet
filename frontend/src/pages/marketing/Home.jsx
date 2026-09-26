import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { OHFooter } from '../../components/openhand'
import websiteIllustration from '../../assets/Images/website_illustration.svg'
import {
  FiArrowRight,
  FiSearch,
  FiStar,
} from 'react-icons/fi'

export function Home() {
  const navigate = useNavigate()
  
  // Hero Dual-Role Toggle: 'learner' | 'practitioner'
  const [heroRole, setHeroRole] = useState('learner')

  // Learner Hero interactive state
  const [learnerQuery, setLearnerQuery] = useState('')
  const [selectedOffer, setSelectedOffer] = useState('1on1') // '1on1' | 'circle'
  const [selectedTime, setSelectedTime] = useState('Today 6:00')

  // Practitioner Hero interactive state
  const [claimHandle, setClaimHandle] = useState('yourname')

  const handleLearnerSearch = (e) => {
    e?.preventDefault()
    if (learnerQuery.trim()) {
      navigate(`/find-a-practitioner?search=${encodeURIComponent(learnerQuery.trim())}`)
    } else {
      navigate('/find-a-practitioner')
    }
  }

  const handleClaimPage = (e) => {
    e?.preventDefault()
    const clean = claimHandle.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    navigate(`/signup?handle=${clean || 'practice'}&role=practitioner`)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ========================================================================= */}
      {/* 1. DUAL-ROLE INTERACTIVE HERO SECTION                                     */}
      {/* ========================================================================= */}
      <section className="relative pt-10 pb-16 lg:pt-14 lg:pb-24 overflow-hidden bg-white border-b border-slate-200/80">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Toggle Switcher: [ I want to grow ] [ I guide others ] */}
          <div className="flex items-center mb-8">
            <div className="inline-flex items-center p-1 rounded-full bg-white border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setHeroRole('learner')}
                className="px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer"
                style={
                  heroRole === 'learner'
                    ? { backgroundColor: '#0F172A', color: '#FFFFFF' }
                    : { backgroundColor: 'transparent', color: '#475569' }
                }
              >
                I want to grow
              </button>
              <button
                type="button"
                onClick={() => setHeroRole('practitioner')}
                className="px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer"
                style={
                  heroRole === 'practitioner'
                    ? { backgroundColor: '#0F172A', color: '#FFFFFF' }
                    : { backgroundColor: 'transparent', color: '#475569' }
                }
              >
                I guide others
              </button>
            </div>
          </div>

          {/* Hero Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* ─── LEFT COLUMN: COPY & INTERACTIVE INPUT ─── */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {heroRole === 'learner' ? (
                <>
                  {/* Eyebrow */}
                  <span
                    style={{
                      color: "#2563EB",
                      backgroundColor: "#EFF6FF",
                      border: "1px solid #BFDBFE",
                      borderRadius: "9999px",
                      padding: "5px 16px",
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      display: "inline-block",
                    }}
                  >
                    FOR LEARNERS
                  </span>

                  {/* Headline */}
                  <h1
                    className="text-4xl sm:text-6xl lg:text-[68px] font-black tracking-tight leading-[1.08]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F172A' }}
                  >
                    Find the guide who{' '}
                    <span className="italic font-bold" style={{ color: '#2563EB' }}>
                      gets you.
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-base sm:text-xl font-normal leading-relaxed max-w-xl" style={{ color: '#475569' }}>
                    Book 1:1 sessions or join a small 8-person Circle with verified coaches, counsellors and mentors.
                  </p>

                  {/* Search Bar Input */}
                  <form
                    onSubmit={handleLearnerSearch}
                    className="flex flex-col sm:flex-row items-center p-2 rounded-2xl sm:rounded-full bg-white border border-slate-200 shadow-md max-w-xl gap-2 mt-4"
                  >
                    <div className="flex items-center gap-3 w-full px-4 py-2 sm:py-0">
                      <FiSearch className="text-slate-400 shrink-0" size={20} />
                      <input
                        type="text"
                        value={learnerQuery}
                        onChange={(e) => setLearnerQuery(e.target.value)}
                        placeholder="What would you like help with?"
                        className="w-full text-sm sm:text-base font-medium placeholder-slate-400 bg-transparent focus:outline-none"
                        style={{ color: '#0F172A' }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-7 py-3 rounded-full text-white font-bold text-sm whitespace-nowrap shadow-md hover:bg-blue-700 transition-all cursor-pointer"
                      style={{ backgroundColor: '#2563EB', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' }}
                    >
                      Find a guide
                    </button>
                  </form>

                  {/* Suggestion Topic Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {['Burnout', 'Career change', 'Anxiety at work', 'Leadership', 'Parenting'].map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => {
                          setLearnerQuery(topic)
                          navigate(`/find-a-practitioner?search=${encodeURIComponent(topic)}`)
                        }}
                        className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-all shadow-2xs cursor-pointer"
                        style={{ color: '#334155' }}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Eyebrow */}
                  <span
                    style={{
                      color: "#2563EB",
                      backgroundColor: "#EFF6FF",
                      border: "1px solid #BFDBFE",
                      borderRadius: "9999px",
                      padding: "5px 16px",
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      display: "inline-block",
                    }}
                  >
                    FOR PRACTITIONERS
                  </span>

                  {/* Headline */}
                  <h1
                    className="text-4xl sm:text-6xl lg:text-[68px] font-black tracking-tight leading-[1.08]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F172A' }}
                  >
                    Your whole practice, <br />
                    <span className="italic font-bold" style={{ color: '#2563EB' }}>
                      one link.
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-base sm:text-xl font-normal leading-relaxed max-w-xl" style={{ color: '#475569' }}>
                    Sessions, Circles, check-ins and payouts in one place — without the corporate LMS feel. Set up free.
                  </p>

                  {/* Handle Claim Input */}
                  <form
                    onSubmit={handleClaimPage}
                    className="flex flex-col sm:flex-row items-center p-2 rounded-2xl sm:rounded-full bg-white border border-slate-200 shadow-md max-w-xl gap-2 mt-4"
                  >
                    <div className="flex items-center w-full px-4 py-2 sm:py-0 text-sm sm:text-base font-semibold" style={{ color: '#64748B' }}>
                      <span>openhand.live/</span>
                      <input
                        type="text"
                        value={claimHandle}
                        onChange={(e) => setClaimHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        placeholder="yourname"
                        className="w-full text-sm sm:text-base font-bold placeholder-slate-400 bg-transparent focus:outline-none ml-0.5"
                        style={{ color: '#0F172A' }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-7 py-3 rounded-full text-white font-bold text-sm whitespace-nowrap shadow-md hover:bg-blue-700 transition-all cursor-pointer"
                      style={{ backgroundColor: '#2563EB', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' }}
                    >
                      Claim your page
                    </button>
                  </form>

                  {/* Feature Checklist Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {['1:1 bookings', 'Circles', 'UPI & cards', 'AURA notes', 'Referrals'].map((pill) => (
                      <span
                        key={pill}
                        className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 shadow-2xs"
                        style={{ color: '#334155' }}
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </>
              )}

            </div>

            {/* ─── RIGHT COLUMN: LIVE INTERACTIVE WIDGET ─── */}
            <div className="lg:col-span-5 flex justify-center">
              
              {heroRole === 'learner' ? (
                /* Learner Mock Practitioner Card */
                <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xl transition-all">
                  
                  {/* Practitioner Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-800 font-black flex items-center justify-center text-lg shrink-0 border border-blue-200">
                      PR
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                        Dr. Priya Raman
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Burnout &amp; Resilience Coach
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-amber-500">
                        <FiStar size={13} fill="currentColor" />
                        <span>4.9</span>
                        <span className="text-slate-400 font-medium">· 320 sessions</span>
                      </div>
                    </div>
                  </div>

                  {/* 2 Selectable Offer Boxes */}
                  <div className="space-y-3 mb-5">
                    <div
                      onClick={() => setSelectedOffer('1on1')}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        selectedOffer === '1on1'
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-blue-600">📞</span>
                        <span className="text-xs font-bold text-slate-800">
                          1:1 Session · 45 min
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900">₹1,499</span>
                    </div>

                    <div
                      onClick={() => setSelectedOffer('circle')}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        selectedOffer === 'circle'
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-indigo-600">⭕</span>
                        <span className="text-xs font-bold text-slate-800">
                          Burnout Circle · 6 wks
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900">₹4,999</span>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    {['Today 6:00', 'Today 8:30', 'Tue 11:00'].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedTime === time
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-emerald-50/60 text-emerald-700 border border-emerald-100 hover:bg-emerald-100/70'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>

                  {/* Primary CTA */}
                  <button
                    type="button"
                    onClick={() => navigate('/find-a-practitioner')}
                    className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white shadow-md hover:bg-blue-700 transition-all cursor-pointer"
                    style={{ backgroundColor: '#2563EB', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' }}
                  >
                    Book a session
                  </button>
                </div>
              ) : (
                /* Practitioner Hero Illustration */
                <div className="w-full max-w-lg lg:max-w-xl flex items-center justify-center">
                  <div className="relative w-full bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-xl transition-all hover:shadow-2xl overflow-hidden group">
                    <img
                      src={websiteIllustration}
                      alt="OpenHand Practitioner Platform"
                      className="w-full h-auto object-contain rounded-2xl transform transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. STATS & PLATFORM ASSURANCE STRIP (Screenshot 3)                       */}
      {/* ========================================================================= */}
      <section className="py-7 text-white" style={{ backgroundColor: '#0F172A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-700/60">
            
            <div className="pt-2 md:pt-0">
              <div className="text-2xl sm:text-3xl font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFFFFF' }}>
                1,200+
              </div>
              <div className="text-xs font-medium mt-1" style={{ color: '#94A3B8' }}>practitioners</div>
            </div>

            <div className="pt-2 md:pt-0">
              <div className="text-2xl sm:text-3xl font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFFFFF' }}>
                8
              </div>
              <div className="text-xs font-medium mt-1" style={{ color: '#94A3B8' }}>max seats per Circle</div>
            </div>

            <div className="pt-2 md:pt-0">
              <div className="text-2xl sm:text-3xl font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFFFFF' }}>
                6-week
              </div>
              <div className="text-xs font-medium mt-1" style={{ color: '#94A3B8' }}>time-boxed containers</div>
            </div>

            <div className="pt-2 md:pt-0">
              <div className="text-2xl sm:text-3xl font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFFFFF' }}>
                UPI · Cards
              </div>
              <div className="text-xs font-medium mt-1" style={{ color: '#94A3B8' }}>Razorpay &amp; Stripe payouts</div>
            </div>

            <div className="pt-2 md:pt-0 col-span-2 md:col-span-1">
              <div className="text-2xl sm:text-3xl font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFFFFF' }}>
                Consent-first
              </div>
              <div className="text-xs font-medium mt-1" style={{ color: '#94A3B8' }}>AURA session AI</div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS: ONE PLATFORM, TWO JOURNEYS (Screenshot 4)               */}
      {/* ========================================================================= */}
      <section className="py-20 lg:py-24 bg-white border-b border-slate-200/80" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-left mb-12 sm:mb-16">
            <span
              style={{
                color: "#2563EB",
                backgroundColor: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: "9999px",
                padding: "5px 16px",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "inline-block",
                marginBottom: "12px",
              }}
            >
              HOW IT WORKS
            </span>
            <h2 
              className="text-3xl sm:text-5xl font-black tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F172A' }}
            >
              One platform, two journeys
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Card 1: Learners Journey */}
            <div className="bg-[#F8FAFC] rounded-3xl p-8 sm:p-10 border border-slate-200 flex flex-col justify-between shadow-xs">
              <div>
                <span 
                  className="inline-block px-3.5 py-1 rounded-full text-xs font-bold mb-8"
                  style={{ color: '#1E40AF', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}
                >
                  Learners
                </span>

                <div className="space-y-7">
                  <div className="flex items-start gap-4">
                    <span 
                      className="w-8 h-8 rounded-full font-extrabold flex items-center justify-center shrink-0 mt-0.5 text-sm shadow-xs"
                      style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                    >
                      1
                    </span>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg mb-1" style={{ color: '#0F172A' }}>
                        Tell us what's going on
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: '#475569' }}>
                        A 2-minute check-in — no clinical forms.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span 
                      className="w-8 h-8 rounded-full font-extrabold flex items-center justify-center shrink-0 mt-0.5 text-sm shadow-xs"
                      style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                    >
                      2
                    </span>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg mb-1" style={{ color: '#0F172A' }}>
                        Pick a guide or a Circle
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: '#475569' }}>
                        Compare verified profiles, prices and next slots.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span 
                      className="w-8 h-8 rounded-full font-extrabold flex items-center justify-center shrink-0 mt-0.5 text-sm shadow-xs"
                      style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                    >
                      3
                    </span>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg mb-1" style={{ color: '#0F172A' }}>
                        Grow between sessions
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: '#475569' }}>
                        Gentle check-ins and peer pods keep momentum.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10">
                <Link
                  to="/find-a-practitioner"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-sm shadow-md hover:bg-blue-700 transition-all"
                  style={{ backgroundColor: '#2563EB', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' }}
                >
                  Find your guide
                </Link>
              </div>
            </div>

            {/* Card 2: Practitioners Journey */}
            <div 
              className="rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xl"
              style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', color: '#FFFFFF' }}
            >
              <div>
                <span 
                  className="inline-block px-3.5 py-1 rounded-full text-xs font-bold mb-8"
                  style={{ color: '#E2E8F0', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  Practitioners
                </span>

                <div className="space-y-7">
                  <div className="flex items-start gap-4">
                    <span 
                      className="w-8 h-8 rounded-full font-extrabold flex items-center justify-center shrink-0 mt-0.5 text-sm shadow-xs"
                      style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                    >
                      1
                    </span>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg mb-1" style={{ color: '#FFFFFF' }}>
                        Claim your page
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: '#CBD5E1' }}>
                        openhand.live/yourname — live in minutes, free.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span 
                      className="w-8 h-8 rounded-full font-extrabold flex items-center justify-center shrink-0 mt-0.5 text-sm shadow-xs"
                      style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                    >
                      2
                    </span>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg mb-1" style={{ color: '#FFFFFF' }}>
                        Add your offers
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: '#CBD5E1' }}>
                        1:1s, Circles, check-ins, resources, org seats.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span 
                      className="w-8 h-8 rounded-full font-extrabold flex items-center justify-center shrink-0 mt-0.5 text-sm shadow-xs"
                      style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                    >
                      3
                    </span>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg mb-1" style={{ color: '#FFFFFF' }}>
                        Get booked &amp; paid
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: '#CBD5E1' }}>
                        Calendar sync, UPI/cards, AURA notes, referrals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10">
                <Link
                  to="/signup?role=practitioner"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-sm shadow-md hover:bg-slate-100 transition-all cursor-pointer"
                  style={{ backgroundColor: '#FFFFFF', color: '#0F172A', fontWeight: 800 }}
                >
                  Start your free practice
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. EVERYTHING YOU OFFER, BOOKABLE FROM ONE LINK (Screenshot 5)            */}
      {/* ========================================================================= */}
      <section className="py-20 lg:py-24 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span
                style={{
                  color: "#2563EB",
                  backgroundColor: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  borderRadius: "9999px",
                  padding: "5px 16px",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  display: "inline-block",
                  marginBottom: "12px",
                }}
              >
                FOR PRACTITIONERS
              </span>
              <h2 
                className="text-3xl sm:text-5xl font-black tracking-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F172A' }}
              >
                Everything you offer, bookable from one link
              </h2>
            </div>
            <div>
              <Link 
                to="/pricing"
                className="text-sm font-extrabold transition-colors inline-flex items-center gap-1.5"
                style={{ color: '#2563EB' }}
              >
                <span>See pricing</span>
                <FiArrowRight />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1: 1:1 Sessions */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex items-start gap-4">
              <span className="text-2xl p-2 rounded-2xl bg-blue-50 border border-blue-100 shrink-0">
                📞
              </span>
              <div>
                <h4 className="font-extrabold text-base mb-1" style={{ color: '#0F172A' }}>1:1 Sessions</h4>
                <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: '#475569' }}>
                  Video calls with calendar sync and buffers.
                </p>
              </div>
            </div>

            {/* 2: 6-Week Circles */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex items-start gap-4">
              <span className="text-2xl p-2 rounded-2xl bg-indigo-50 border border-indigo-100 shrink-0">
                ⭕
              </span>
              <div>
                <h4 className="font-extrabold text-base mb-1" style={{ color: '#0F172A' }}>6-Week Circles</h4>
                <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: '#475569' }}>
                  Capped at 8 people. Real accountability.
                </p>
              </div>
            </div>

            {/* 3: Check-ins */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex items-start gap-4">
              <span className="text-2xl p-2 rounded-2xl bg-teal-50 border border-teal-100 shrink-0">
                📝
              </span>
              <div>
                <h4 className="font-extrabold text-base mb-1" style={{ color: '#0F172A' }}>Check-ins</h4>
                <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: '#475569' }}>
                  Mood &amp; intention logs between sessions.
                </p>
              </div>
            </div>

            {/* 4: Priority DM */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex items-start gap-4">
              <span className="text-2xl p-2 rounded-2xl bg-purple-50 border border-purple-100 shrink-0">
                💬
              </span>
              <div>
                <h4 className="font-extrabold text-base mb-1" style={{ color: '#0F172A' }}>Priority DM</h4>
                <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: '#475569' }}>
                  Paid async questions with a reply window.
                </p>
              </div>
            </div>

            {/* 5: Resources */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex items-start gap-4">
              <span className="text-2xl p-2 rounded-2xl bg-emerald-50 border border-emerald-100 shrink-0">
                📚
              </span>
              <div>
                <h4 className="font-extrabold text-base mb-1" style={{ color: '#0F172A' }}>Resources</h4>
                <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: '#475569' }}>
                  Sell worksheets, audio practices, guides.
                </p>
              </div>
            </div>

            {/* 6: Org / EAP Seats */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex items-start gap-4">
              <span className="text-2xl p-2 rounded-2xl bg-sky-50 border border-sky-100 shrink-0">
                🏢
              </span>
              <div>
                <h4 className="font-extrabold text-base mb-1" style={{ color: '#0F172A' }}>Org / EAP Seats</h4>
                <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: '#475569' }}>
                  Per-seat billing with HR confidentiality.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. AURA · CONSENT-FIRST AI (Screenshot 6)                                */}
      {/* ========================================================================= */}
      <section 
        className="py-20 overflow-hidden relative" 
        id="aura"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #2A2665 100%)', color: '#FFFFFF' }}
      >
        {/* Glow ambient */}
        <div className="absolute -top-24 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left text */}
            <div className="lg:col-span-7 space-y-6">
              <span
                style={{
                  color: "#93C5FD",
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  border: "1px solid rgba(147, 197, 253, 0.4)",
                  borderRadius: "9999px",
                  padding: "5px 16px",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  display: "inline-block",
                }}
              >
                AURA · CONSENT-FIRST AI
              </span>
              
              <h2 
                className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFFFFF' }}
              >
                AI that sounds like you — and only listens when invited.
              </h2>

              <p className="text-sm sm:text-base font-normal leading-relaxed max-w-xl" style={{ color: '#CBD5E1' }}>
                Reflection prompts, session-note drafts and between-session nudges, tuned to your practice voice. Learners opt in, every time.
              </p>

              <div>
                <Link
                  to="/aura"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg cursor-pointer hover:bg-slate-100"
                  style={{ backgroundColor: '#FFFFFF', color: '#0F172A', fontWeight: 800 }}
                >
                  <span>Meet AURA</span>
                  <FiArrowRight style={{ color: '#0F172A' }} />
                </Link>
              </div>
            </div>

            {/* Right 4 Pill Cards */}
            <div className="lg:col-span-5 space-y-3.5">
              
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3.5 hover:bg-white/15 transition-all">
                <span className="text-xl">✨</span>
                <span className="text-sm font-bold" style={{ color: '#FFFFFF' }}>Reflection prompts in your voice</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3.5 hover:bg-white/15 transition-all">
                <span className="text-xl">📝</span>
                <span className="text-sm font-bold" style={{ color: '#FFFFFF' }}>Notes → structured summaries</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3.5 hover:bg-white/15 transition-all">
                <span className="text-xl">🔔</span>
                <span className="text-sm font-bold" style={{ color: '#FFFFFF' }}>Human-sounding nudges</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3.5 hover:bg-white/15 transition-all">
                <span className="text-xl">🔒</span>
                <span className="text-sm font-bold" style={{ color: '#FFFFFF' }}>Encrypted, consent logged</span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ORGANIZATIONS BANNER & DUAL CLOSING CTAS (Screenshot 7)                */}
      {/* ========================================================================= */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Top Banner: Organizations & EAP */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 text-left max-w-2xl">
              <span
                style={{
                  color: "#2563EB",
                  backgroundColor: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  borderRadius: "9999px",
                  padding: "5px 16px",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  display: "inline-block",
                  marginBottom: "8px",
                }}
              >
                FOR ORGANIZATIONS &amp; EAP
              </span>
              <h3 
                className="text-2xl sm:text-4xl font-black tracking-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F172A' }}
              >
                Give your people a guide, not another webinar.
              </h3>
              <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: '#475569' }}>
                Per-seat billing, HR-confidential reporting, and curated practitioner pools.
              </p>
            </div>

            <Link
              to="/for-organizations"
              className="w-full md:w-auto px-8 py-3.5 rounded-full font-bold text-sm shadow-md hover:bg-slate-800 transition-all whitespace-nowrap text-center cursor-pointer"
              style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}
            >
              Talk to our team
            </Link>
          </div>

          {/* Bottom 2 Split Dual CTAs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Left CTA: Learner */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 flex flex-col justify-between shadow-xs">
              <div className="space-y-2 mb-8">
                <h4 
                  className="text-2xl sm:text-3xl font-black tracking-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F172A' }}
                >
                  Ready to feel lighter?
                </h4>
                <p className="text-xs sm:text-sm font-medium" style={{ color: '#475569' }}>
                  Find a guide or join a Circle starting this week.
                </p>
              </div>

              <div>
                <Link
                  to="/find-a-practitioner"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-sm shadow-md hover:bg-blue-700 transition-all cursor-pointer"
                  style={{ backgroundColor: '#2563EB', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' }}
                >
                  Explore guides
                </Link>
              </div>
            </div>

            {/* Right CTA: Practitioner */}
            <div 
              className="rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xl"
              style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', color: '#FFFFFF' }}
            >
              <div className="space-y-2 mb-8">
                <h4 
                  className="text-2xl sm:text-3xl font-black tracking-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFFFFF' }}
                >
                  Ready to take your practice online?
                </h4>
                <p className="text-xs sm:text-sm font-medium" style={{ color: '#CBD5E1' }}>
                  Set up free. Pay only when you earn.
                </p>
              </div>

              <div>
                <Link
                  to="/signup?role=practitioner"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-sm shadow-md hover:bg-slate-100 transition-all cursor-pointer"
                  style={{ backgroundColor: '#FFFFFF', color: '#0F172A', fontWeight: 800 }}
                >
                  Claim your page
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Global Footer */}
      <OHFooter />

    </div>
  )
}

export default Home
