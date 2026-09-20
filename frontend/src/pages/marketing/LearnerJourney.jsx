import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  OHFooter,
  OHButton,
  OHEyebrow,
  OHPricingSection,
  IntakeModal,
} from '../../components/openhand'
import { FiTrendingUp } from 'react-icons/fi'
import openHandMeetAuraSvg from '../../assets/Images/OpenHand_Meet_AURA_High_Resolution.svg'


const STAGES = [
  {
    num: '01',
    when: 'Day 0',
    side: 'right',
    who: 'Learner',
    whoType: 'cl',
    title: 'They land on your link',
    desc: "From your Instagram bio. They see who you are, what you help with, and one clear next step — not a menu of seventeen services. They book, pay by UPI, and get a confirmation before they've closed the tab.",
    earn: "You receive ₹2,500 — settled to your bank on your plan's payout schedule",
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
    earn: 'Circle of 8 at ₹15,000/seat = ₹1,20,000 for six evenings',
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
    earn: 'One learner: ₹2,500 first session → ₹17,500 total after their first Circle → ₹799/month recurring',
  },
]

export function LearnerJourney() {
  const navigate = useNavigate()
  const [activeStages, setActiveStages] = useState({})
  const [filterWho, setFilterWho] = useState('all') // 'all' | 'cl' | 'co'
  const [previewIntakeOpen, setPreviewIntakeOpen] = useState(false)
  const progRef = useRef(null)

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

  const handleStageAction = (num) => {
    switch (num) {
      case '01':
        navigate('/find-a-practitioner')
        break
      case '02':
        setPreviewIntakeOpen(true)
        break
      case '03':
        navigate('/dashboard?tab=room')
        break
      case '04':
        navigate('/dashboard?tab=clients')
        break
      case '05':
        navigate('/dashboard?tab=circles')
        break
      case '06':
        navigate('/dashboard?tab=dash')
        break
      case '07':
        navigate('/pricing')
        break
      default:
        break
    }
  }

  return (
    <div className="oh-journey-page relative min-h-screen">


      {/* Hero Section */}
      <header className="oh-journey-hero">
        <div className="oh-wrap">
          <OHEyebrow>Step Two of Three</OHEyebrow>
          <h1 className="oh-journey-hero__title text-center w-full mx-auto">
            Ninety days, <span className="oh-grad-text">from stranger to changed.</span>
          </h1>
          <p className="oh-journey-hero__sub">
            This is a real shape of a learner journey inside OpenHand — what your learner feels at each turn, and what lands in your account while it happens.
          </p>

          {/* Interactive Filterable Legend */}
          <div className="oh-journey-legend flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6">
            <button
              type="button"
              onClick={() => setFilterWho('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterWho === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200'
              }`}
            >
              Show all stages
            </button>
            <button
              type="button"
              onClick={() => setFilterWho(filterWho === 'cl' ? 'all' : 'cl')}
              className={`oh-journey-legend__item px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterWho === 'cl'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
              }`}
            >
              <span className="oh-journey-dot oh-journey-dot--cl" />
              <span>What your learner experiences</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterWho(filterWho === 'co' ? 'all' : 'co')}
              className={`oh-journey-legend__item px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterWho === 'co'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
              }`}
            >
              <span className="oh-journey-dot oh-journey-dot--co" />
              <span>What you see and earn</span>
            </button>
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
            const isDimmed = filterWho !== 'all' && s.whoType !== filterWho

            return (
              <div
                key={s.num}
                data-index={idx}
                className={`oh-journey__stage oh-journey__stage--${s.side} ${
                  isVisible ? 'oh-journey__stage--vis' : ''
                } ${isDimmed ? 'opacity-25 grayscale-[0.5] scale-95 transition-all duration-300' : 'transition-all duration-300'}`}
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
                    <button
                      onClick={() => handleStageAction(s.num)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      {s.num === '01' && 'Try Booking Link →'}
                      {s.num === '02' && 'Preview 6-Question Intake →'}
                      {s.num === '03' && 'Launch Session Co-Pilot →'}
                      {s.num === '04' && 'View Reflection Prompts →'}
                      {s.num === '05' && 'Explore Circles →'}
                      {s.num === '06' && 'View Progress Milestones →'}
                      {s.num === '07' && 'Explore Plans →'}
                    </button>
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
                    <button
                      onClick={() => handleStageAction(s.num)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      {s.num === '01' && 'Try Booking Link →'}
                      {s.num === '02' && 'Preview 6-Question Intake →'}
                      {s.num === '03' && 'Launch Session Co-Pilot →'}
                      {s.num === '04' && 'View Reflection Prompts →'}
                      {s.num === '05' && 'Explore Circles →'}
                      {s.num === '06' && 'View Progress Milestones →'}
                      {s.num === '07' && 'Explore Plans →'}
                    </button>
                  </div>
                ) : (
                  <div className="oh-journey__spacer" />
                )}
              </div>
            )
          })}

        </div>
      </section>

      {/* Meet AURA Section — High Resolution Banner */}
      <section className="oh-sec py-8 sm:py-14 bg-white relative" id="copilot">
        <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-center">
          <img
            src={openHandMeetAuraSvg}
            alt="Meet AURA — Consent-First AI Companion for Practitioners"
            className="w-full h-auto max-w-[1360px] object-contain block select-none rounded-2xl shadow-xl"
            loading="eager"
          />
        </div>
      </section>

      {/* Learner Pricing Section */}
      <OHPricingSection defaultRole="learner" hideRoleSwitcher={true} />

      {/* Closing CTA */}
      <section className="oh-journey-close">
        <div className="oh-wrap text-center">
          <h2 className="oh-journey-close__title">
            This is what being held looks like.
          </h2>
          <p className="oh-journey-close__sub">
            Ninety days, one relationship, and support that actually remembers you.
          </p>

          <div className="oh-journey-close__cta-row">
            <OHButton href="/signup" size="lg">
              Start for Free →
            </OHButton>
            <OHButton href="/find-a-practitioner" variant="ghost" size="lg">
              Find a Practitioner →
            </OHButton>
          </div>
        </div>
      </section>

      {/* Stage 02 — Intake Preview Modal */}
      <IntakeModal
        open={previewIntakeOpen}
        onClose={() => setPreviewIntakeOpen(false)}
        practitionerName="Dr. Sarah M."
      />

      <OHFooter />
    </div>
  )
}

export default LearnerJourney
