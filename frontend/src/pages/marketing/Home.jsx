import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { OHFooter, OpenHandFlow, OHBrandStrap } from '../../components/openhand'
import learnerIllustration from '../../assets/Images/illustration_path.svg'
import websiteIllustration from '../../assets/Images/website_illustration.svg'
import {
  FiArrowRight,
  FiSearch,
} from 'react-icons/fi'

export function Home() {
  const navigate = useNavigate()
  
  // Hero Dual-Role Toggle: 'learner' | 'practitioner'
  const [heroRole, setHeroRole] = useState('learner')

  // Learner Hero interactive state
  const [learnerQuery, setLearnerQuery] = useState('')

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
          
          {/* Top Toggle Switcher: Centered Glowing Bubble [ I want to grow ] [ I guide others ] */}
          <div className="flex justify-center items-center mb-10">
            <div
              className="relative inline-flex items-center p-1.5 rounded-full transition-all duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1.5px solid rgba(145, 55, 239, 0.4)",
                boxShadow:
                  "0 0 28px -4px rgba(12, 109, 255, 0.35), 0 0 36px -6px rgba(145, 55, 239, 0.4), 0 10px 30px -10px rgba(47, 59, 224, 0.25)",
              }}
            >
              <button
                type="button"
                onClick={() => setHeroRole('learner')}
                className="relative px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer select-none"
                style={
                  heroRole === 'learner'
                    ? {
                        background:
                          "linear-gradient(100deg, #0C6DFF 0%, #2F3BE0 45%, #5B2FE0 70%, #9137EF 100%)",
                        color: "#FFFFFF",
                        boxShadow:
                          "0 4px 18px -2px rgba(47, 59, 224, 0.7), 0 0 14px 0 rgba(145, 55, 239, 0.55)",
                        transform: "scale(1.02)",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "#4A5378",
                        transform: "scale(1)",
                      }
                }
              >
                I want to grow
              </button>
              <button
                type="button"
                onClick={() => setHeroRole('practitioner')}
                className="relative px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer select-none"
                style={
                  heroRole === 'practitioner'
                    ? {
                        background:
                          "linear-gradient(100deg, #0C6DFF 0%, #2F3BE0 45%, #5B2FE0 70%, #9137EF 100%)",
                        color: "#FFFFFF",
                        boxShadow:
                          "0 4px 18px -2px rgba(47, 59, 224, 0.7), 0 0 14px 0 rgba(145, 55, 239, 0.55)",
                        transform: "scale(1.02)",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "#4A5378",
                        transform: "scale(1)",
                      }
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
                /* Learner Hero Illustration */
                <div className="w-full max-w-lg lg:max-w-xl flex items-center justify-center">
                  <div className="relative w-full bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-xl transition-all hover:shadow-2xl overflow-hidden group animate-heartbeat">
                    <img
                      src={learnerIllustration}
                      alt="Find the Guide Who Gets You"
                      className="w-full h-auto object-contain rounded-2xl transform transition-transform duration-300"
                    />
                  </div>
                </div>
              ) : (
                /* Practitioner Hero Illustration */
                <div className="w-full max-w-lg lg:max-w-xl flex items-center justify-center">
                  <div className="relative w-full bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-xl transition-all hover:shadow-2xl overflow-hidden group animate-heartbeat">
                    <img
                      src={websiteIllustration}
                      alt="OpenHand Practitioner Platform"
                      className="w-full h-auto object-contain rounded-2xl transform transition-transform duration-300"
                    />
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FLOATING CONTINUOUS SCROLLING BRAND MARQUEE STRAP                      */}
      {/* ========================================================================= */}
      <OHBrandStrap />

      {/* ========================================================================= */}
      {/* 2.5 OPENHAND FLOW: SCATTERED IN. ONE PRACTICE OUT                         */}
      {/* ========================================================================= */}
      <OpenHandFlow />

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS: ONE PLATFORM, TWO JOURNEYS (Screenshot 4)               */}
      {/* ========================================================================= */}
      <section className="py-20 lg:py-24 bg-white border-b border-slate-200/80" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
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
                <div className="flex justify-center mb-8">
                  <span 
                    className="inline-block px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider"
                    style={{ color: '#1E40AF', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}
                  >
                    FOR LEARNERS
                  </span>
                </div>

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
                <div className="flex justify-center mb-8">
                  <span 
                    className="inline-block px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider"
                    style={{ color: '#E2E8F0', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    FOR PRACTITIONERS
                  </span>
                </div>

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
              to="/contact-us"
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
