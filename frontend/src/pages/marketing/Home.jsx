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
      subtitle: 'Real-time session with AI AURA',
      desc: 'Built-in video space designed to feel like a living room. Optional real-time AURA assists with key transcript themes without intruding on your presence.',
      features: [
        'Zero-lag HD video with spatial audio',
        'Opt-in AI AURA for session insights',
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

      {/* Section 3: AI Robot Infographic - Quietly Intelligent */}
      <section className="oh-sec ai-infographic-sec">
        <div className="oh-wrap">
          <div className="sec-head-center">
            <span className="oh-sec-tag">Quietly Intelligent</span>
            <h2>AI that sounds like you, not like a bot</h2>
            <p>Enhance your human presence with automated reflection tools tuned strictly to your practice voice.</p>
          </div>

          <div className="robot-orbit-container">
            {/* Background SVG Orbit Track Rings */}
            <div className="orbit-rings-bg" aria-hidden="true">
              <svg className="orbit-rings-svg" viewBox="0 0 640 640">
                <circle cx="320" cy="320" r="270" stroke="rgba(124, 58, 237, 0.25)" strokeWidth="2" strokeDasharray="8 8" fill="none" />
                <circle cx="320" cy="320" r="190" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="1.5" fill="none" />
                <circle cx="320" cy="320" r="110" stroke="rgba(124, 58, 237, 0.15)" strokeWidth="1" fill="none" />
              </svg>
            </div>

            {/* Center Fixed Robot Mascot */}
            <div className="orbit-center-robot">
              <div className="robot-aura-glow"></div>
              
              <div className="robot-mascot-wrapper">
                <svg className="robot-svg" viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Robot Antenna & Spark */}
                  <path d="M120 45 V15" stroke="url(#robot-grad-1)" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="120" cy="12" r="7" fill="#7C3AED" className="robot-antenna-tip" />
                  <circle cx="120" cy="12" r="14" fill="#7C3AED" opacity="0.35" className="robot-antenna-pulse" />

                  {/* Robot Head */}
                  <rect x="65" y="45" width="110" height="80" rx="28" fill="url(#robot-head-grad)" stroke="url(#robot-stroke-grad)" strokeWidth="3" />

                  {/* Visor Screen */}
                  <rect x="78" y="58" width="84" height="54" rx="18" fill="#09132C" />

                  {/* Robot Eyes */}
                  <g className="robot-eyes">
                    <circle cx="102" cy="80" r="10" fill="#60A5FA" />
                    <circle cx="102" cy="80" r="4" fill="#FFFFFF" />
                    
                    <circle cx="138" cy="80" r="10" fill="#60A5FA" />
                    <circle cx="138" cy="80" r="4" fill="#FFFFFF" />
                  </g>

                  {/* Animated Voice Equalizer Mouth */}
                  <g className="robot-mouth-equalizer">
                    <rect x="98" y="98" width="4" height="6" rx="2" fill="#7C3AED" className="eq-bar bar-1" />
                    <rect x="106" y="96" width="4" height="10" rx="2" fill="#60A5FA" className="eq-bar bar-2" />
                    <rect x="114" y="94" width="4" height="14" rx="2" fill="#34D399" className="eq-bar bar-3" />
                    <rect x="122" y="96" width="4" height="10" rx="2" fill="#60A5FA" className="eq-bar bar-4" />
                    <rect x="130" y="98" width="4" height="6" rx="2" fill="#7C3AED" className="eq-bar bar-5" />
                  </g>

                  {/* Ears / Side Audio Sensors */}
                  <rect x="53" y="68" width="12" height="34" rx="6" fill="#1E293B" stroke="#60A5FA" strokeWidth="1.5" />
                  <rect x="175" y="68" width="12" height="34" rx="6" fill="#1E293B" stroke="#60A5FA" strokeWidth="1.5" />

                  {/* Neck Joint */}
                  <rect x="104" y="125" width="32" height="12" rx="4" fill="#334155" />

                  {/* Robot Body / Chest */}
                  <path d="M55 145 C55 137, 185 137, 185 145 L195 240 C195 255, 45 255, 45 240 Z" fill="url(#robot-body-grad)" stroke="url(#robot-stroke-grad)" strokeWidth="3" />

                  {/* Chest Arc Reactor / Practice Core */}
                  <circle cx="120" cy="185" r="24" fill="#0F172A" stroke="url(#robot-grad-1)" strokeWidth="2.5" />
                  <circle cx="120" cy="185" r="14" fill="url(#core-glow)" className="robot-core-pulse" />
                  <path d="M113 185 L127 185 M120 178 L120 192" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

                  {/* Robot Arms */}
                  <rect x="25" y="152" width="20" height="65" rx="10" fill="url(#robot-head-grad)" stroke="url(#robot-stroke-grad)" strokeWidth="2" />
                  <rect x="195" y="152" width="20" height="65" rx="10" fill="url(#robot-head-grad)" stroke="url(#robot-stroke-grad)" strokeWidth="2" />

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="robot-grad-1" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                    <linearGradient id="robot-head-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#F1F5F9" />
                    </linearGradient>
                    <linearGradient id="robot-body-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F8FAFC" />
                      <stop offset="100%" stopColor="#E2E8F0" />
                    </linearGradient>
                    <linearGradient id="robot-stroke-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#60A5FA" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                    <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#60A5FA" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>

              <div className="robot-status-badge">
                <span className="status-live-dot"></span>
                <span>AURA Voice Intelligence</span>
              </div>
            </div>

            {/* Rotating Orbit System Ring with 3 Points */}
            <div className="orbit-rotating-ring">
              {/* Orbit Point 1 */}
              <div className="orbit-node node-1">
                <div className="node-card-inner">
                  <div className="node-ic-box">
                    <FiZap />
                  </div>
                  <div className="node-text">
                    <h3>AI Reflection Prompts</h3>
                    <span className="node-pill">Tuned to your voice</span>
                  </div>
                </div>
              </div>

              {/* Orbit Point 2 */}
              <div className="orbit-node node-2">
                <div className="node-card-inner">
                  <div className="node-ic-box">
                    <FiMessageCircle />
                  </div>
                  <div className="node-text">
                    <h3>Human-Sounding Nudges</h3>
                    <span className="node-pill">Zero bot-drip feel</span>
                  </div>
                </div>
              </div>

              {/* Orbit Point 3 */}
              <div className="orbit-node node-3">
                <div className="node-card-inner">
                  <div className="node-ic-box">
                    <FiLayers />
                  </div>
                  <div className="node-text">
                    <h3>Notes-to-Content Converter</h3>
                    <span className="node-pill">Automatic structuring</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Section 5: Start Where You're Comfortable - Pure Infographic Timeline (No Box Cards) */}
      <section className="oh-sec pathway-sec">
        <div className="oh-wrap">
          <div className="sec-head-center">
            <span className="oh-sec-tag">Start Where You're Comfortable</span>
            <h2>Three ways in — no pressure, no mandatory sales call</h2>
            <p>Choose how you'd like to explore OpenHand for your practice.</p>
          </div>

          <div className="infographic-timeline-trail">
            {/* Smooth Connecting Line */}
            <div className="timeline-beam"></div>

            <div className="timeline-steps-row">
              {/* Step 01 */}
              <div className="timeline-step-item">
                <div className="timeline-node">
                  <span className="node-num">01</span>
                </div>
                <div className="timeline-info">
                  <h3>Start your free practice space</h3>
                  <Link to="/start-free" className="timeline-cta-btn btn-blue">
                    Start free space <FiArrowRight style={{ marginLeft: '6px' }} />
                  </Link>
                </div>
              </div>

              {/* Step 02 */}
              <div className="timeline-step-item">
                <div className="timeline-node">
                  <span className="node-num">02</span>
                </div>
                <div className="timeline-info">
                  <h3>See a sample client journey</h3>
                  <Link to="/client-journey" className="timeline-cta-btn btn-purple">
                    View sample journey <FiArrowRight style={{ marginLeft: '6px' }} />
                  </Link>
                </div>
              </div>

              {/* Step 03 */}
              <div className="timeline-step-item">
                <div className="timeline-node">
                  <span className="node-num">03</span>
                </div>
                <div className="timeline-info">
                  <h3>Talk to a real human</h3>
                  <Link to="/talk-to-human" className="timeline-cta-btn btn-emerald">
                    Book a conversation <FiArrowRight style={{ marginLeft: '6px' }} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default Home
