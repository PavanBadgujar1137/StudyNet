import React, { useEffect, useState, useRef } from 'react'
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
    who: 'Client',
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
    who: 'Client',
    whoType: 'cl',
    title: 'The first session — and AURA beside you',
    desc: "You hold the session. With their consent, OpenHand's AURA-powered engine listens quietly and offers you a next question, a technique that fits, or a gentle flag when something's worth returning to. Your client never sees it. You stay present instead of scribbling notes.",
    earn: 'Session notes drafted for you — ready to approve in 90 seconds',
  },
  {
    num: '04',
    when: 'Week 2',
    side: 'left',
    who: 'Client',
    whoType: 'cl',
    title: "Between sessions, they're not alone",
    desc: 'Two reflection prompts a week, written in your voice from your own session notes. A one-tap check-in that takes eleven seconds. You see the pattern before they tell you about it.',
    earn: 'Clients who check in weekly rebook at a noticeably higher rate — track yours in the dashboard',
  },
  {
    num: '05',
    when: 'Week 4',
    side: 'right',
    who: 'You',
    whoType: 'co',
    title: 'You invite them into the circle',
    desc: 'One-to-one work has a ceiling — your hours. So you open a six-week circle. Same material, eight people, one evening a week. Your client joins the one that fits them, and starts holding other people too.',
    earn: 'Circle of 8 at ₹15,000 = ₹1,20,000 for six evenings',
  },
  {
    num: '06',
    when: 'Week 8',
    side: 'left',
    who: 'Client',
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
    earn: 'One client became ₹2,500 → ₹17,500 → recurring',
  },
]

const COPILOT_FEATURES = [
  {
    n: '01',
    title: 'It listens, with permission',
    desc: 'Your client explicitly consents before any session is transcribed. They can withdraw it at any time, mid-session, and AURA goes silent immediately.',
  },
  {
    n: '02',
    title: 'It suggests the next question',
    desc: 'Not a script to read aloud. A prompt in your peripheral vision — the question a supervisor might have nudged you toward, arriving while it’s still useful.',
  },
  {
    n: '03',
    title: 'It remembers across sessions',
    desc: '“She mentioned her sister in week two — she’s circling it again.” The connective memory that makes clients feel truly held, without you rereading six sets of notes before every call.',
  },
  {
    n: '04',
    title: 'It writes the aftermath',
    desc: 'Session notes, the next set of reflection prompts, and a suggested plan for next time — drafted the moment you hang up. You edit and approve. Nothing sends without you.',
  },
]

export function ClientJourney() {
  const [activeStages, setActiveStages] = useState({})
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

  return (
    <div className="oh-journey-page">

      {/* Hero Section */}
      <header className="oh-journey-hero">
        <div className="oh-wrap">
          <OHEyebrow>Step Two of Three</OHEyebrow>
          <h1 className="oh-journey-hero__title whitespace-nowrap text-center w-full mx-auto">
            Ninety days, <span className="oh-grad-text">from stranger to changed.</span>
          </h1>
          <p className="oh-journey-hero__sub">
            This is a real shape of a client journey inside OpenHand — what your client feels at each turn, and what lands in your account while it happens.
          </p>

          <div className="oh-journey-legend">
            <span className="oh-journey-legend__item">
              <span className="oh-journey-dot oh-journey-dot--cl" />
              <span>What your client experiences</span>
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
                      <span>{s.who === 'You' ? 'You (Practitioner)' : 'Client'}</span>
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
                      <span>{s.who === 'You' ? 'You (Practitioner)' : 'Client'}</span>
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
                  <FiLock style={{ marginRight: 6 }} /> Visible only to you · Client consented at 00:00
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
              AURA never speaks to your client, never diagnoses, and never sends anything on your behalf. Recordings are encrypted, retained only as long as you choose, and are not used to train external models. You are the practitioner. It's an instrument, and you're holding it.
            </p>
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
            <OHButton href="/start-free" size="lg">
              Start your free practice space
            </OHButton>
            <OHButton href="/talk-to-human" variant="ghost" size="lg">
              Talk to a real human →
            </OHButton>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default ClientJourney
