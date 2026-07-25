import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { OHFooter } from '../../components/openhand'
import {
  FiClock,
  FiCheckCircle,
  FiUsers,
  FiZap,
  FiShield,
  FiArrowRight,
  FiHeart,
  FiLayers,
  FiMessageCircle,
  FiSliders,
  FiPlay,
  FiActivity
} from 'react-icons/fi'

export function Home() {
  // Box Time UI state
  const [activeBoxIndex, setActiveBoxIndex] = useState(0)
  const [coPilotActive, setCoPilotActive] = useState(true)

  const boxTimeSlots = [
    {
      id: 'pre-session',
      boxNum: '01',
      tag: 'Time Box: 15 Mins',
      title: 'Pre-Session Check-In Box',
      subtitle: 'Delivered automatically before sessions',
      desc: 'Clients complete a gentle 2-minute reflection check-in logging mood, current intentions, and key topics before stepping into the session container.',
      features: [
        'Gentle reflection prompts (no clinical forms)',
        'Real-time mood & intention logging',
        'Automatic summary delivered to practitioner notes',
      ],
      previewWidget: {
        type: 'checkin',
        status: 'Client Submitted · 10m ago',
        clientName: 'Sarah M.',
        mood: 'Calm & Seeking Focus (8/10)',
        intention: 'Overcoming burnout in team communication.',
      },
    },
    {
      id: 'in-session',
      boxNum: '02',
      tag: 'Time Box: 60 Mins',
      title: 'Live Circle Container',
      subtitle: 'Real-time session with AI Co-pilot',
      desc: 'Built-in video space designed to feel like a living room. Optional real-time Co-pilot assists with key transcript themes without intruding on your presence.',
      features: [
        'Zero-lag HD video with spatial audio',
        'Opt-in AI Co-pilot for session insights',
        'One-click instant summary & action items',
      ],
      previewWidget: {
        type: 'session',
        status: 'Live Container · 42m elapsed',
        circleName: 'Leadership Circle Cohort #4',
        participants: 8,
        aiInsight: 'Theme detected: Transition boundaries & workload delegation',
      },
    },
    {
      id: 'between-sessions',
      boxNum: '03',
      tag: 'Time Box: 7 Days',
      title: 'Between-Session Circle Box',
      subtitle: 'Peer pods & asynchronous support',
      desc: 'Clients hold each other accountable in small 8-person peer pods. Daily human-sounding reflection prompts keep momentum alive between weekly calls.',
      features: [
        'Peer accountability pods (max 8 seats)',
        'Human-sounding reflection nudges',
        'Protected private cohort activity feed',
      ],
      previewWidget: {
        type: 'pod',
        status: 'Pod Activity · 3 new reflections',
        podName: 'Burnout Recovery Pod A',
        activeMembers: '8/8 Peers active',
        lastReflect: '"Implemented the 10-minute boundary rule today!" — Elena',
      },
    },
    {
      id: 'post-container',
      boxNum: '04',
      tag: 'Time Box: Week 6+',
      title: 'Long-Term Growth Container',
      subtitle: 'Continuity & 1:1 escalation pathway',
      desc: 'After completing a 6-week circle, clients seamlessly escalate into 1:1 private coaching or transition into ongoing monthly membership spaces.',
      features: [
        'Seamless 1:1 private session booking',
        'Recurring monthly membership transition',
        'Complete longitudinal progress timeline',
      ],
      previewWidget: {
        type: 'growth',
        status: 'Escalation Ready · Week 6 Completed',
        clientName: 'Marcus T.',
        journeyStat: '6/6 Circle sessions completed',
        nextStep: 'Escalated to 1:1 Private Monthly Retainer',
      },
    },
  ]

  const activeBox = boxTimeSlots[activeBoxIndex]

  return (
    <div className="oh-home-page">
      {/* Hero */}
      <header className="oh-home-hero">
        <div className="oh-wrap">
          <div className="oh-hero-badge">
            <span className="oh-pulse-dot"></span>
            <span>The Modern Practice Platform Built for Guides, Not Course Sellers</span>
          </div>

          <h1>
            You already know how to hold space.<br />
            <span className="oh-grad-text">We'll help you hold it online — and get paid for it.</span>
          </h1>

          <p className="sub">
            OpenHand is the practice platform built for people who guide, not just teach.
            Client check-ins, private cohorts, and real community — without the corporate LMS feel.
          </p>

          <div className="cta-row">
            <Link to="/start-free" className="oh-btn-primary">
              Start your free practice space <FiArrowRight style={{ marginLeft: '8px' }} />
            </Link>
            <Link to="/client-journey" className="oh-btn-ghost">
              See sample client journey →
            </Link>
          </div>

          {/* Key Assurance Stats Bar */}
          <div className="oh-hero-stats">
            <div className="stat-item">
              <span className="stat-num">100%</span>
              <span className="stat-lbl">Human-Led Growth</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">6-Week</span>
              <span className="stat-lbl">Time-Boxed Containers</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">Encrypted</span>
              <span className="stat-lbl">Confidential by Design</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">0%</span>
              <span className="stat-lbl">Corporate LMS Clutter</span>
            </div>
          </div>
        </div>
      </header>

      {/* Decorative Held Wave Line */}
      <div className="held-line-wrap oh-wrap" aria-hidden="true">
        <svg className="held-line" viewBox="0 0 1080 64" preserveAspectRatio="none">
          <path
            d="M0 32 C 180 4, 360 60, 540 32 C 720 4, 900 60, 1080 32"
            fill="none"
            stroke="var(--oh-blue)"
            strokeWidth="1.8"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* NEW INNOVATIVE SECTION: Box Time Practice Container System */}
      <section className="oh-sec boxtime-sec">
        <div className="oh-wrap">
          <div className="sec-head-center">
            <span className="oh-sec-tag">Interactive Time-Boxed Architecture</span>
            <h2>The Box Time Practice System</h2>
            <p>
              Experience how OpenHand structures client care into four seamless time-boxed containers — from pre-session intention to long-term community continuity.
            </p>
          </div>

          <div className="boxtime-layout">
            {/* Left 4 Time Box Selector Tabs */}
            <div className="boxtime-nav">
              {boxTimeSlots.map((slot, idx) => {
                const isActive = activeBoxIndex === idx
                return (
                  <div
                    key={slot.id}
                    className={`boxtime-tab ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveBoxIndex(idx)}
                  >
                    <div className="bt-tab-left">
                      <span className="bt-num">{slot.boxNum}</span>
                    </div>
                    <div className="bt-tab-content">
                      <span className="bt-tag">{slot.tag}</span>
                      <h4>{slot.title}</h4>
                      <p>{slot.subtitle}</p>
                    </div>
                    <FiArrowRight className="bt-chevron" />
                  </div>
                )
              })}
            </div>

            {/* Right Live Interactive Container Preview Box */}
            <div className="boxtime-preview-card">
              <div className="bt-card-header">
                <div className="bt-header-badge">
                  <FiClock className="ic-clock" />
                  <span>{activeBox.tag}</span>
                </div>
                <span className="bt-status-pill">{activeBox.previewWidget.status}</span>
              </div>

              <h3>{activeBox.title}</h3>
              <p className="bt-desc">{activeBox.desc}</p>

              {/* Dynamic Live Widget Box */}
              <div className="bt-live-widget">
                <div className="widget-header">
                  <span className="w-dot"></span>
                  <span className="w-title">Live Practice Container Widget</span>
                </div>
                <div className="widget-body">
                  {activeBox.previewWidget.type === 'checkin' && (
                    <div className="w-content">
                      <div className="w-row">
                        <span>Client Name:</span>
                        <strong>{activeBox.previewWidget.clientName}</strong>
                      </div>
                      <div className="w-row">
                        <span>Current Mood:</span>
                        <strong className="mood-tag">{activeBox.previewWidget.mood}</strong>
                      </div>
                      <div className="w-row">
                        <span>Intention:</span>
                        <em>"{activeBox.previewWidget.intention}"</em>
                      </div>
                    </div>
                  )}

                  {activeBox.previewWidget.type === 'session' && (
                    <div className="w-content">
                      <div className="w-row">
                        <span>Circle Name:</span>
                        <strong>{activeBox.previewWidget.circleName}</strong>
                      </div>
                      <div className="w-row">
                        <span>Participants:</span>
                        <strong>{activeBox.previewWidget.participants} Members (Live)</strong>
                      </div>
                      <div className="w-row ai-highlight">
                        <FiZap className="zap-ic" />
                        <span>{activeBox.previewWidget.aiInsight}</span>
                      </div>
                    </div>
                  )}

                  {activeBox.previewWidget.type === 'pod' && (
                    <div className="w-content">
                      <div className="w-row">
                        <span>Pod Name:</span>
                        <strong>{activeBox.previewWidget.podName}</strong>
                      </div>
                      <div className="w-row">
                        <span>Activity Status:</span>
                        <strong className="active-tag">{activeBox.previewWidget.activeMembers}</strong>
                      </div>
                      <div className="w-row">
                        <span>Latest Reflection:</span>
                        <em>{activeBox.previewWidget.lastReflect}</em>
                      </div>
                    </div>
                  )}

                  {activeBox.previewWidget.type === 'growth' && (
                    <div className="w-content">
                      <div className="w-row">
                        <span>Client:</span>
                        <strong>{activeBox.previewWidget.clientName}</strong>
                      </div>
                      <div className="w-row">
                        <span>Circle Progress:</span>
                        <strong>{activeBox.previewWidget.journeyStat}</strong>
                      </div>
                      <div className="w-row">
                        <span>Next Step:</span>
                        <strong className="growth-tag">{activeBox.previewWidget.nextStep}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="bt-feature-list">
                {activeBox.features.map((feat, fIdx) => (
                  <div key={fIdx} className="bt-feature-item">
                    <FiCheckCircle className="chk-ic" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Built around how you actually work */}
      <section className="oh-sec">
        <div className="oh-wrap">
          <div className="sec-head-center">
            <span className="oh-sec-tag">Not Modules. Practice.</span>
            <h2>Built around how you actually work with people</h2>
            <p>Designed for transformation and holding space — not generic video courses.</p>
          </div>

          <div className="oh-grid-3">
            <div className="oh-bento-card">
              <div className="bento-icon">
                <FiActivity />
              </div>
              <h3>Client Check-Ins</h3>
              <p>
                Simple, recurring check-ins that show you how someone's really doing between sessions — not just whether they clicked "complete."
              </p>
              <div className="bento-badge">
                <span>Mood & Intention Logs</span>
              </div>
            </div>

            <div className="oh-bento-card">
              <div className="bento-icon">
                <FiSliders />
              </div>
              <h3>Gentle Progress Tracking</h3>
              <p>
                Mood and progress tracking your clients will actually use, because it feels like self-reflection, not a clinical hospital dashboard.
              </p>
              <div className="bento-badge">
                <span>Self-Reflective Meter</span>
              </div>
            </div>

            <div className="oh-bento-card">
              <div className="bento-icon">
                <FiUsers />
              </div>
              <h3>Private Cohorts</h3>
              <p>
                Small group containers capped at eight people with their own rhythm and boundaries — not a public course feed anyone can wander into.
              </p>
              <div className="bento-badge">
                <span>Capped 8-Person Circles</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: People heal in circles */}
      <section className="oh-sec oh-sec-community">
        <div className="oh-wrap">
          <div className="sec-head-center">
            <span className="oh-sec-tag">The Part Corporate LMS Forgets</span>
            <h2>People heal in circles, not in isolation</h2>
            <p>Growth happens when people hold each other accountable in guided group containers.</p>
          </div>

          <div className="oh-grid-3">
            <div className="circle-card">
              <div className="circle-card-head">
                <div className="circle-avatar-group">
                  <span className="cav av-1">AN</span>
                  <span className="cav av-2">RP</span>
                  <span className="cav av-3">SM</span>
                  <span className="cav av-plus">+5</span>
                </div>
              </div>
              <h3>Peer Circles</h3>
              <p>
                Give clients a dedicated space to hold each other between sessions, guided by your container framework but not dependent on your 24/7 time.
              </p>
            </div>

            <div className="circle-card">
              <div className="circle-card-head">
                <div className="live-pulse-badge">
                  <span className="pulse-dot-red"></span>
                  <span>Live HD Circle Room</span>
                </div>
              </div>
              <h3>Live Sessions</h3>
              <p>
                Built-in group video sessions that feel like your living room — zero lag, high audio clarity, and zero corporate webinar clutter.
              </p>
            </div>

            <div className="circle-card">
              <div className="circle-card-head">
                <div className="pod-tag-wrap">
                  <span>8-Member Pod</span>
                </div>
              </div>
              <h3>Accountability Pods</h3>
              <p>
                Small, self-organizing peer pods that keep momentum and mutual care going long after the container module ends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: AI that sounds like you */}
      <section className="oh-sec">
        <div className="oh-wrap">
          <div className="sec-head-center">
            <span className="oh-sec-tag">Quietly Intelligent</span>
            <h2>AI that sounds like you, not like a bot</h2>
            <p>Enhance your human presence with automated reflection tools tuned strictly to your practice voice.</p>
          </div>

          <div className="oh-grid-3">
            <div className="ai-card">
              <div className="ai-ic-wrap">
                <FiZap />
              </div>
              <h3>AI Reflection Prompts</h3>
              <p>
                Clients receive thoughtful, personalized reflection prompts between sessions — written in the exact tone and framework you set.
              </p>
            </div>

            <div className="ai-card">
              <div className="ai-ic-wrap">
                <FiMessageCircle />
              </div>
              <h3>Human-Sounding Nudges</h3>
              <p>
                Automated check-ins that read naturally like a personal note from you, ensuring clients never feel like they fell into a cold email drip campaign.
              </p>
            </div>

            <div className="ai-card">
              <div className="ai-ic-wrap">
                <FiLayers />
              </div>
              <h3>Notes-to-Content Converter</h3>
              <p>
                Turn your anonymised session notes into your next lesson or client resource automatically — your expertise, beautifully structured.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Section 5: 3-step action ladder */}
      <section className="oh-sec ladder-sec">
        <div className="oh-wrap">
          <div className="sec-head-center">
            <span className="oh-sec-tag">Start Where You're Comfortable</span>
            <h2>Three ways in — no pressure, no mandatory sales call</h2>
            <p>Choose how you'd like to explore OpenHand for your practice.</p>
          </div>

          <div className="ladder-steps">
            <div className="step-card">
              <span className="step-num">Step One</span>
              <h3>Start your free practice space</h3>
              <p>Set up your space in minutes. No credit card required, no time limit to explore.</p>
              <Link to="/start-free" className="step-link">
                Start free space <FiArrowRight style={{ marginLeft: '6px' }} />
              </Link>
            </div>

            <div className="step-card">
              <span className="step-num">Step Two</span>
              <h3>See a sample client journey</h3>
              <p>Walk through what a client actually experiences, from check-in to circle cohort.</p>
              <Link to="/client-journey" className="step-link">
                View sample journey <FiArrowRight style={{ marginLeft: '6px' }} />
              </Link>
            </div>

            <div className="step-card">
              <span className="step-num">Step Three</span>
              <h3>Talk to a real human</h3>
              <p>Have questions specific to your practice? Book 25 minutes with our co-founders.</p>
              <Link to="/talk-to-human" className="step-link">
                Book a conversation <FiArrowRight style={{ marginLeft: '6px' }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default Home
