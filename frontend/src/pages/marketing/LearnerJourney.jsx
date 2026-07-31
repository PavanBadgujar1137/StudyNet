import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { apiConnector } from '../../services/apiConnector'
import {
  OHFooter,
  OHButton,
  OHEyebrow,
} from '../../components/openhand'
import { 
  FiShield, 
  FiTrendingUp,
  FiLock
} from 'react-icons/fi'

const STAGES = [
  {
    num: '01',
    when: 'Day 0',
    side: 'right',
    who: 'Learner',
    whoType: 'cl',
    title: 'They land on your link',
    desc: "From your Instagram bio. They see who you are, what you help with, and one clear next step — not a menu of seventeen services. They book, pay by UPI, and get a confirmation before they've closed the tab.",
    earn: 'You receive ₹2,500 — settled to your bank in two days',
  },
  {
    num: '02',
    when: 'Day 2',
    side: 'left',
    who: 'You',
    whoType: 'co',
    title: 'An intake that does the small talk for you',
    desc: "Before the first session, they answer six questions you wrote once. You walk into the call already knowing what brought them and what they've tried. No first-ten-minutes warm-up.",
    earn: 'Saved: ~15 minutes of every first session',
  },
  {
    num: '03',
    when: 'Day 5',
    side: 'right',
    who: 'Learner',
    whoType: 'cl',
    title: 'The first session — and AURA beside you',
    desc: "You hold the session. With their consent, OpenHand's AURA-powered engine listens quietly and offers you a next question, a technique that fits, or a gentle flag when something's worth returning to. Your learner never sees it. You stay present instead of scribbling notes.",
    earn: 'Session notes drafted for you — ready to approve in 90 seconds',
  },
  {
    num: '04',
    when: 'Week 2',
    side: 'left',
    who: 'Learner',
    whoType: 'cl',
    title: "Between sessions, they're not alone",
    desc: 'Two reflection prompts a week, written in your voice from your own session notes. A one-tap check-in that takes eleven seconds. You see the pattern before they tell you about it.',
    earn: 'Learners who check in weekly rebook at a noticeably higher rate — track yours in the dashboard',
  },
  {
    num: '05',
    when: 'Week 4',
    side: 'right',
    who: 'You',
    whoType: 'co',
    title: 'You invite them into the circle',
    desc: 'One-to-one work has a ceiling — your hours. So you open a six-week circle. Same material, eight people, one evening a week. Your learner joins the one that fits them, and starts holding other people too.',
    earn: 'Circle of 8 at ₹15,000 = ₹1,20,000 for six evenings',
  },
  {
    num: '06',
    when: 'Week 8',
    side: 'left',
    who: 'Learner',
    whoType: 'cl',
    title: "They can see how far they've come",
    desc: 'A progress view built from their own check-ins — not a score, not a leaderboard. Streaks they set themselves. A milestone marked when they finish the circle. The thing people quietly screenshot and send to a friend.',
    earn: 'Every shared milestone carries your booking link',
  },
  {
    num: '07',
    when: 'Day 90',
    side: 'right',
    who: 'You',
    whoType: 'co',
    title: 'The loop closes — and starts again',
    desc: 'They finish. OpenHand asks for a testimonial at the moment they feel it, not three months later. They move onto your ₹799/month circle membership. And they send you two people who watched them change.',
    earn: 'One learner became ₹2,500 → ₹17,500 → recurring',
  },
]

const COPILOT_FEATURES = [
  {
    n: '01',
    title: 'It listens, with permission',
    desc: 'Your learner explicitly consents before any session is transcribed. They can withdraw it at any time, mid-session, and AURA goes silent immediately.',
  },
  {
    n: '02',
    title: 'It suggests the next question',
    desc: 'Not a script to read aloud. A prompt in your peripheral vision — the question a supervisor might have nudged you toward, arriving while it’s still useful.',
  },
  {
    n: '03',
    title: 'It remembers across sessions',
    desc: '“She mentioned her sister in week two — she’s circling it again.” The connective memory that makes learners feel truly held, without you rereading six sets of notes before every call.',
  },
  {
    n: '04',
    title: 'It writes the aftermath',
    desc: 'Session notes, the next set of reflection prompts, and a suggested plan for next time — drafted the moment you hang up. You edit and approve. Nothing sends without you.',
  },
]

export function LearnerJourney() {
  const [activeStages, setActiveStages] = useState({})
  const [payingPlan, setPayingPlan] = useState(null)
  const progRef = useRef(null)

  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayNow = async (planKey) => {
    try {
      setPayingPlan(planKey)
      const isLoaded = await loadRazorpaySDK()
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load. Please check your network.')
        setPayingPlan(null)
        return
      }

      const res = await apiConnector('POST', '/api/v1/plans/create-order', { planKey })
      if (!res?.data?.success) {
        toast.error(res?.data?.message || 'Could not initiate plan order')
        setPayingPlan(null)
        return
      }

      const { order, key, planName } = res.data

      const options = {
        key: key || 'rzp_test_TDhFSRuAl18Gcb',
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'OpenHand Practice Platform',
        description: `Subscription: ${planName}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await apiConnector('POST', '/api/v1/plans/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planKey,
            })

            if (verifyRes?.data?.success) {
              toast.success(`🎉 Payment Verified! Welcome to ${planName}.`)
            } else {
              toast.error(verifyRes?.data?.message || 'Payment verification failed.')
            }
          } catch (err) {
            console.error('Verification error:', err)
            toast.error('Payment verification failed.')
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#4F46E5',
        },
      }

      const rzpModal = new window.Razorpay(options)
      rzpModal.open()
    } catch (err) {
      console.error('PayNow error:', err)
      toast.error('Payment launch failed. Try again.')
    } finally {
      setPayingPlan(null)
    }
  }

  // Stage visibility observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = entry.target.getAttribute('data-index')
            if (index !== null) {
              setActiveStages((prev) => ({ ...prev, [index]: true }))
            }
          }
        })
      },
      { threshold: 0.25 }
    )

    const stageElements = document.querySelectorAll('.oh-journey__stage')
    stageElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  // Curved SVG progress path scroll animation
  useEffect(() => {
    const progEl = progRef.current
    if (progEl) {
      const len = progEl.getTotalLength()
      progEl.style.strokeDasharray = len
      progEl.style.strokeDashoffset = len

      const draw = () => {
        const journeyEl = document.getElementById('journey')
        if (!journeyEl) return
        const r = journeyEl.getBoundingClientRect()
        const vh = window.innerHeight
        let p = (vh - r.top) / (r.height + vh)
        p = Math.max(0, Math.min(1, p))
        progEl.style.strokeDashoffset = len * (1 - p)
      }

      window.addEventListener('scroll', draw, { passive: true })
      window.addEventListener('resize', draw)
      draw()

      return () => {
        window.removeEventListener('scroll', draw)
        window.removeEventListener('resize', draw)
      }
    }
  }, [])

  return (
    <div className="oh-journey-page relative min-h-screen">


      {/* Hero Section */}
      <header className="oh-journey-hero">
        <div className="oh-wrap">
          <OHEyebrow>Step Two of Three</OHEyebrow>
          <h1 className="oh-journey-hero__title whitespace-nowrap text-center w-full mx-auto">
            Ninety days, <span className="oh-grad-text">from stranger to changed.</span>
          </h1>
          <p className="oh-journey-hero__sub">
            This is a real shape of a learner journey inside OpenHand — what your learner feels at each turn, and what lands in your account while it happens.
          </p>

          <div className="oh-journey-legend">
            <span className="oh-journey-legend__item">
              <span className="oh-journey-dot oh-journey-dot--cl" />
              <span>What your learner experiences</span>
            </span>
            <span className="oh-journey-legend__item">
              <span className="oh-journey-dot oh-journey-dot--co" />
              <span>What you see and earn</span>
            </span>
          </div>
        </div>
      </header>

      {/* Interactive 7-Stage Journey Section with Curved Path */}
      <section className="oh-journey-timeline" id="journey">

        {/* Curved SVG Path Background */}
        <svg className="oh-journey-path-svg" viewBox="0 0 880 1700" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="oh-journey-pg" x1="0" y1="0" x2="0" y2="1700" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#4733C9" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          <path
            className="oh-journey-track"
            d="M440 20 C 640 130, 640 250, 440 360 C 240 470, 240 590, 440 700 C 640 810, 640 930, 440 1040 C 240 1150, 240 1270, 440 1380 C 620 1480, 620 1580, 440 1680"
          />
          <path
            ref={progRef}
            className="oh-journey-prog"
            d="M440 20 C 640 130, 640 250, 440 360 C 240 470, 240 590, 440 700 C 640 810, 640 930, 440 1040 C 240 1150, 240 1270, 440 1380 C 620 1480, 620 1580, 440 1680"
          />
        </svg>

        <div className="oh-wrap oh-journey-timeline__inner">

          {STAGES.map((s, idx) => {
            const isVisible = activeStages[idx]
            return (
              <div
                key={s.num}
                data-index={idx}
                className={`oh-journey__stage oh-journey__stage--${s.side} ${
                  isVisible ? 'oh-journey__stage--vis' : ''
                }`}
              >
                {/* Left side bubble if side === left */}
                {s.side === 'left' ? (
                  <div className="oh-journey__bubble">
                    <div className={`oh-journey__who oh-journey__who--${s.whoType}`}>
                      <span className={`oh-journey-dot oh-journey-dot--${s.whoType}`} />
                      <span>{s.who === 'You' ? 'You (Practitioner)' : 'Learner'}</span>
                    </div>
                    <h3 className="oh-journey__bubble-title">{s.title}</h3>
                    <p className="oh-journey__bubble-desc">{s.desc}</p>
                    <div className="oh-journey__earn">
                      <FiTrendingUp className="oh-journey__earn-icon" />
                      <span>{s.earn}</span>
                    </div>
                  </div>
                ) : (
                  <div className="oh-journey__spacer" />
                )}

                {/* Center Pin Ring */}
                <div className="oh-journey__pin">
                  <div className="oh-journey__ring">
                    <b>{s.num}</b>
                  </div>
                  <span className="oh-journey__when">{s.when}</span>
                </div>

                {/* Right side bubble if side === right */}
                {s.side === 'right' ? (
                  <div className="oh-journey__bubble">
                    <div className={`oh-journey__who oh-journey__who--${s.whoType}`}>
                      <span className={`oh-journey-dot oh-journey-dot--${s.whoType}`} />
                      <span>{s.who === 'You' ? 'You (Practitioner)' : 'Learner'}</span>
                    </div>
                    <h3 className="oh-journey__bubble-title">{s.title}</h3>
                    <p className="oh-journey__bubble-desc">{s.desc}</p>
                    <div className="oh-journey__earn">
                      <FiTrendingUp className="oh-journey__earn-icon" />
                      <span>{s.earn}</span>
                    </div>
                  </div>
                ) : (
                  <div className="oh-journey__spacer" />
                )}
              </div>
            )
          })}

        </div>
      </section>

      {/* Powered by AURA Section */}
      <section className="oh-copilot-section" id="copilot">
        <div className="oh-wrap">
          <div className="oh-copilot__grid">

            {/* Left Column: Header + 4 Feature Items */}
            <div className="flex flex-col gap-6">
              <div>
                <OHEyebrow dark>Powered by AURA AI</OHEyebrow>
                <h2 className="oh-copilot__heading">A second pair of ears in every session.</h2>
                <p className="oh-copilot__sub">
                  You're listening to a person. You shouldn't also be tracking frameworks, remembering what they said in week two, and planning the next question. That's what AURA is for — and it only ever speaks to you.
                </p>
              </div>

              <div className="oh-copilot__list">
                {COPILOT_FEATURES.map((item) => (
                  <div key={item.n} className="oh-copilot__item">
                    <div className="oh-copilot__num">{item.n}</div>
                    <div>
                      <h3 className="oh-copilot__item-title">{item.title}</h3>
                      <p className="oh-copilot__item-desc">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Live Session AURA Mock Panel */}
            <div className="oh-copilot__panel-wrap">
              <div className="oh-copilot__panel">
                <div className="oh-copilot__panel-top">
                  <span className="oh-copilot__live-tag">
                    <span className="oh-copilot__live-dot" /> Live AURA
                  </span>
                  <span className="oh-copilot__session-time">Session 3 · 24:16</span>
                </div>

                <div className="oh-copilot__panel-body">
                  <div className="oh-copilot__sug oh-copilot__sug--blue">
                    <div className="oh-copilot__sug-label">Try Asking</div>
                    <p className="oh-copilot__sug-text">
                      "You said 'I should be over it by now' — whose voice is the 'should' in?"
                    </p>
                    <div className="oh-copilot__chips">
                      <span className="oh-copilot__chip">Use</span>
                      <span className="oh-copilot__chip">Not now</span>
                    </div>
                  </div>

                  <div className="oh-copilot__sug oh-copilot__sug--indigo">
                    <div className="oh-copilot__sug-label">Pattern Across Sessions</div>
                    <p className="oh-copilot__sug-text">
                      Third time work has come up right after family. Worth naming the link?
                    </p>
                    <div className="oh-copilot__chips">
                      <span className="oh-copilot__chip">Flag for notes</span>
                    </div>
                  </div>

                  <div className="oh-copilot__sug oh-copilot__sug--violet">
                    <div className="oh-copilot__sug-label">Technique That Fits Here</div>
                    <p className="oh-copilot__sug-text">
                      Two-chair work — she's holding both sides of this herself. Script ready.
                    </p>
                    <div className="oh-copilot__chips">
                      <span className="oh-copilot__chip">Open script</span>
                      <span className="oh-copilot__chip">Save for later</span>
                    </div>
                  </div>
                </div>

                <div className="oh-copilot__panel-foot">
                  <FiLock style={{ marginRight: 6 }} /> Visible only to you · Learner consented at 00:00
                </div>
              </div>
            </div>

          </div>

          {/* Ethical Consent Card */}
          <div className="oh-copilot__consent">
            <h3 className="oh-copilot__consent-title">
              <FiShield style={{ color: '#60A5FA', marginRight: 8 }} />
              Where we draw the line
            </h3>
            <p className="oh-copilot__consent-desc">
              AURA never speaks to your learner, never diagnoses, and never sends anything on your behalf. Recordings are encrypted, retained only as long as you choose, and are not used to train external models. You are the practitioner. It's an instrument, and you're holding it.
            </p>
          </div>

        </div>
      </section>

      {/* Learner Membership Pricing Section */}
      <section className="oh-sec py-16 bg-slate-50 border-t border-slate-200" id="pricing">
        <div className="oh-wrap max-w-[1360px] mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <OHEyebrow>Learner Membership Plans</OHEyebrow>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight my-4">
              Invest in your wellness. <span className="oh-grad-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Care built around you.</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
              Choose the learner membership plan that fits your personal care journey. Unlock practitioner courses, live group circles, daily check-ins, and AURA AI guidance.
            </p>
          </div>

          <div className="plans-grid grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
            
            {/* Beginner Plan */}
            <div className="plan-card bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Beginner Plan</h3>
                <p className="who text-slate-600 text-sm mb-6 min-h-[42px] font-medium leading-relaxed">
                  For individuals starting their personal wellness &amp; mental health journey.
                </p>
                <div className="price-tag text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  ₹51<small className="text-slate-500 font-medium text-base"> /month</small>
                </div>
                <div className="cut-badge bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider py-2 px-3.5 rounded-xl mb-6 inline-flex items-center gap-2 border border-blue-100">
                  ESSENTIAL LEARNER MEMBERSHIP
                </div>
                <ul className="plan-features text-slate-700 text-sm space-y-3 mb-8">
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Access to core practitioner courses &amp; library</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> 1 Monthly group circle pass included</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Daily mood check-ins &amp; guided prompts</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Personal AI health &amp; reflection assistant (AURA)</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Standard 1:1 session booking access</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Secure digital health record vault</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2.5">
                <OHButton
                  onClick={() => handlePayNow('beginner')}
                  disabled={payingPlan === 'beginner'}
                  fullWidth
                  size="lg"
                >
                  {payingPlan === 'beginner' ? 'Opening Razorpay...' : 'Subscribe to Beginner — ₹51'}
                </OHButton>
              </div>
            </div>

            {/* Advance Plan (Featured) */}
            <div className="plan-card feat-card relative bg-slate-900 text-white border-2 border-indigo-500 rounded-3xl p-8 shadow-2xl transition-all flex flex-col justify-between transform -translate-y-2">
              <span className="featured-badge absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-5 rounded-full shadow-lg whitespace-nowrap">
                MOST POPULAR LEARNER CHOICE
              </span>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 mt-2">Advance Plan</h3>
                <p className="who text-slate-300 text-sm mb-6 min-h-[42px] font-normal leading-relaxed">
                  For active wellness seekers wanting full access to courses, circles, and session discounts.
                </p>
                <div className="price-tag text-4xl font-extrabold text-white mb-3 tracking-tight">
                  ₹151<small className="text-slate-300 font-medium text-base"> /month</small>
                </div>
                <div className="cut-badge bg-indigo-900/60 text-sky-300 font-bold text-xs uppercase tracking-wider py-2 px-3.5 rounded-xl mb-6 inline-flex items-center gap-2 border border-indigo-500/30">
                  FULL ACCESS + 15% OFF SESSIONS
                </div>
                <ul className="plan-features text-slate-200 text-sm space-y-3 mb-8">
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> Everything in Beginner Plan</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> Unlimited access to ALL practitioner courses</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> Unlimited access to live group circles</li>
                  <li className="flex items-center gap-2.5 font-semibold text-white"><span className="text-sky-400 font-bold text-base">✓</span> <b>15% discount on all 1:1 sessions</b></li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> Live in-session AURA companion &amp; insights</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> Priority session scheduling &amp; waitlist bypass</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> Monthly companion pass for a friend</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2.5">
                <OHButton
                  onClick={() => handlePayNow('advance')}
                  disabled={payingPlan === 'advance'}
                  fullWidth
                  size="lg"
                >
                  {payingPlan === 'advance' ? 'Opening Razorpay...' : 'Subscribe to Advance — ₹151'}
                </OHButton>
              </div>
            </div>

            {/* Champion Plan */}
            <div className="plan-card bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Champion Plan</h3>
                <p className="who text-slate-600 text-sm mb-6 min-h-[42px] font-medium leading-relaxed">
                  For complete wellbeing coverage with dedicated care, free monthly session, and VIP perks.
                </p>
                <div className="price-tag text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  ₹1,500<small className="text-slate-500 font-medium text-base"> /month</small>
                </div>
                <div className="cut-badge bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider py-2 px-3.5 rounded-xl mb-6 inline-flex items-center gap-2 border border-emerald-100">
                  1 FREE 1:1 SESSION + 25% OFF EXTRA
                </div>
                <ul className="plan-features text-slate-700 text-sm space-y-3 mb-8">
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Everything in Advance Plan</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> <b>1 Free 1:1 private session included / mo</b></li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> <b>25% discount on additional 1:1 sessions</b></li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Dedicated care manager &amp; concierge support</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Family sharing (up to 3 family sub-accounts)</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Custom wellness path &amp; biometric analytics</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2.5">
                <OHButton
                  onClick={() => handlePayNow('champion')}
                  disabled={payingPlan === 'champion'}
                  fullWidth
                  size="lg"
                >
                  {payingPlan === 'champion' ? 'Opening Razorpay...' : 'Subscribe to Champion — ₹1,500'}
                </OHButton>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="oh-journey-close">
        <div className="oh-wrap text-center">
          <h2 className="oh-journey-close__title">
            This is what "held" looks like as a product.
          </h2>
          <p className="oh-journey-close__sub">
            Ninety days, one link, three ways to earn — and nobody handed off to a stranger.
          </p>

          <div className="oh-journey-close__cta-row">
            <OHButton href="/signup" size="lg">
              Start your free practice space
            </OHButton>
            <OHButton href="/contact-us" variant="ghost" size="lg">
              Talk to a real human →
            </OHButton>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default LearnerJourney
