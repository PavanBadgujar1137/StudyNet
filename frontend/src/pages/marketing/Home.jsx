import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { OHFooter } from '../../components/openhand'
import {
  FiClock,
  FiCheckCircle,
  FiUsers,
  FiZap,
  FiArrowRight,
  FiLayers,
  FiMessageCircle,
  FiSliders,
  FiActivity
} from 'react-icons/fi'

export function Home() {
  // Box Time UI state
  const [activeBoxIndex, setActiveBoxIndex] = useState(0)
  
  // ... rest of boxTimeSlots remains ...


  const boxTimeSlots = [
    {
      id: 'pre-session',
      boxNum: '01',
      tag: 'Time Box: 15 Mins',
      title: 'Pre-Session Check-In Box',
      subtitle: 'Delivered automatically before sessions',
      desc: 'Learners complete a gentle 2-minute reflection check-in logging mood, current intentions, and key topics before stepping into the session container.',
      features: [
        'Gentle reflection prompts (no clinical forms)',
        'Real-time mood & intention logging',
        'Automatic summary delivered to practitioner notes',
      ],
      previewWidget: {
        type: 'checkin',
        status: 'Learner Submitted · 10m ago',
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
        circleName: 'Leadership Circle #4',
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
      desc: 'Learners hold each other accountable in small 8-person peer pods. Daily human-sounding reflection prompts keep momentum alive between weekly calls.',
      features: [
        'Peer accountability pods (max 8 seats)',
        'Human-sounding reflection nudges',
        'Protected private Circle activity feed',
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
      desc: 'After completing a 6-week circle, learners seamlessly escalate into 1:1 private coaching or transition into ongoing monthly membership spaces.',
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
    <div className="oh-home-page relative min-h-screen">
      {/* Hero */}
      <header className="oh-home-hero relative overflow-hidden">

        <div className="oh-wrap relative z-10 flex flex-col items-center text-center">
          <div className="oh-hero-badge mx-auto">
            <span className="oh-pulse-dot"></span>
            <span className="hidden sm:inline">The Modern Practice Platform Built for Guides, Not Course Sellers</span>
            <span className="sm:hidden">Built for Guides, Not Course Sellers</span>
          </div>

          <h1 className="text-center text-[clamp(20px,5.2vw,54px)] leading-tight max-w-5xl mx-auto my-4">
            <span className="block whitespace-nowrap">You already know how to hold space.</span>
            <span className="oh-grad-text block">We'll help you hold it online and get paid for it.</span>
          </h1>

          <p className="sub text-center text-[clamp(14px,2.5vw,18px)] max-w-2xl mx-auto px-2 sm:px-0">
            OpenHand is the practice platform built for people who guide, not just teach.
            Learner check-ins, private Circles, and real community — without the corporate LMS feel.
          </p>

          {/* Unified 3-Button Hero CTA Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 my-6">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' }}
            >
              Start your free practice space <FiArrowRight style={{ marginLeft: '8px' }} />
            </Link>

            <Link
              to="/learner-journey"
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 font-semibold text-sm shadow-sm hover:-translate-y-0.5 transition-all duration-200"
            >
              See sample learner journey →
            </Link>

            <Link
              to="/for-organizations"
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-slate-100/90 border border-slate-300 text-slate-800 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-900 font-semibold text-sm shadow-sm hover:-translate-y-0.5 transition-all duration-200"
            >
              🏢 For Organizations &amp; EAP →
            </Link>
          </div>

          {/* Key Assurance Stats Bar */}
          <div className="oh-hero-stats grid grid-cols-2 sm:flex sm:flex-row rounded-2xl sm:rounded-full px-4 sm:px-10 py-4">
            <div className="stat-item">
              <span className="stat-num">1,200+</span>
              <span className="stat-lbl">Practitioners Active</span>
            </div>
            <div className="stat-divider hidden sm:block"></div>
            <div className="stat-item">
              <span className="stat-num">100%</span>
              <span className="stat-lbl">Human-Led Growth</span>
            </div>
            <div className="stat-divider hidden sm:block"></div>
            <div className="stat-item">
              <span className="stat-num">6-Week</span>
              <span className="stat-lbl">Time-Boxed Circles</span>
            </div>
            <div className="stat-divider hidden sm:block"></div>
            <div className="stat-item">
              <span className="stat-num">Encrypted</span>
              <span className="stat-lbl">Confidential by Design</span>
            </div>
            <div className="stat-divider hidden sm:block"></div>
            <div className="stat-item">
              <span className="stat-num">0%</span>
              <span className="stat-lbl">Corporate LMS Clutter</span>
            </div>
          </div>

          {/* HOME-1: Proof strip — trust signals above the fold */}
          <div className="oh-proof-strip" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '24px',
            padding: '12px 24px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1.5px solid #CBD5E1',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            color: '#0F172A'
          }}>
            {/* Practitioner avatar placeholders — real photos + consent needed from client */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {['P1','P2','P3'].map((label, i) => (
                <div key={label} style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: `linear-gradient(135deg, hsl(${220 + i * 30},80%,55%), hsl(${240 + i * 30},80%,45%))`,
                  border: '2px solid #FFFFFF',
                  marginLeft: i > 0 ? '-10px' : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 800, color: '#FFFFFF'
                }}>
                  {label}
                </div>
              ))}
              <span style={{ marginLeft: '12px', fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                1,200+ practitioners on OpenHand
              </span>
            </div>
            <div style={{ width: '1px', height: '20px', background: '#CBD5E1' }} className="hidden sm:block" />
            {/* Outcome metric */}
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
              📈 <strong style={{ color: '#2563EB' }}>94% client retention across 6-week containers</strong>
            </span>
            <div style={{ width: '1px', height: '20px', background: '#CBD5E1' }} className="hidden sm:block" />
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
              Built by Zwiebel AI · India-first wellness tech
            </span>
          </div>
        </div>
      </header>

      {/* NEW INNOVATIVE SECTION: Box Time Practice Container System */}
      <section className="oh-sec boxtime-sec">
        <div className="oh-wrap">
          <div className="sec-head-center">
            <span className="oh-sec-tag">Interactive Time-Boxed Architecture</span>
            <h2 className="text-[clamp(20px,4vw,38px)]">The Care Loop &amp; Practice Operating System</h2>
            <p className="text-[clamp(14px,2vw,17px)]">
              Experience how OpenHand structures learner care into four seamless time-boxed containers — from pre-session intention to long-term community continuity.
            </p>
          </div>

          <div className="boxtime-layout grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">
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
                        <span>Learner Name:</span>
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
                        <span>Learner:</span>
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

          <div className="oh-grid-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="oh-bento-card">
              <div className="bento-icon">
                <FiActivity />
              </div>
              <h3>Learner Check-Ins</h3>
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
                Mood and progress tracking your learners will actually use, because it feels like self-reflection, not a clinical hospital dashboard.
              </p>
              <div className="bento-badge">
                <span>Self-Reflective Meter</span>
              </div>
            </div>

            <div className="oh-bento-card sm:col-span-2 lg:col-span-1">
              <div className="bento-icon">
                <FiUsers />
              </div>
              <h3>Private Circles</h3>
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

          <div className="oh-grid-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="circle-card">
              <div className="circle-card-head">
                <div className="circle-avatar-group">
                  <span className="cav av-1">AN</span>
                  <span className="cav av-2">RP</span>
                  <span className="cav av-3">SM</span>
                  <span className="cav av-plus">+5</span>
                </div>
              </div>
              <h3>Circles</h3>
              <p>
                Give learners a dedicated space to hold each other between sessions, guided by your container framework but not dependent on your 24/7 time.
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

      {/* Page 10 Correction 1: Headline Feature Depth Section */}
      <section 
        className="oh-sec py-16 relative z-10"
        style={{
          backgroundColor: '#F8FAFC',
          color: '#0F172A',
          borderTop: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div className="oh-wrap max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4"
              style={{
                backgroundColor: '#EEF2FF',
                border: '1px solid #C7D2FE',
                color: '#4F46E5',
              }}
            >
              ⚡ Deep Practice Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: '#0F172A', margin: '8px 0 12px 0' }}>
              Built for real practice depth, not basic course sales
            </h2>
            <p className="text-base font-medium" style={{ color: '#475569', margin: 0 }}>
              Everything your practice requires — built-in, encrypted, and ready out of the box.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              className="p-6 rounded-2xl transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div className="text-2xl mb-3">📅</div>
              <h3 className="text-lg font-extrabold mb-2" style={{ color: '#0F172A' }}>Google Calendar &amp; Outlook Sync</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#334155', margin: 0 }}>
                Two-way automated sync with Google Calendar, Outlook, and iCal. Prevents double-booking and applies custom buffer times between calls.
              </p>
            </div>

            <div 
              className="p-6 rounded-2xl transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div className="text-2xl mb-3">💳</div>
              <h3 className="text-lg font-extrabold mb-2" style={{ color: '#0F172A' }}>Stripe &amp; Razorpay Payouts</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#334155', margin: 0 }}>
                Accept UPI, credit cards, and international currencies directly to your bank account with automated payout schedules and zero platform commission options.
              </p>
            </div>

            <div 
              className="p-6 rounded-2xl transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div className="text-2xl mb-3">📹</div>
              <h3 className="text-lg font-extrabold mb-2" style={{ color: '#0F172A' }}>Breakout Rooms &amp; HD Video</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#334155', margin: 0 }}>
                Interactive zero-download WebRTC video rooms equipped with breakout rooms, screen sharing, live chat moderation, and cloud recordings.
              </p>
            </div>

            <div 
              className="p-6 rounded-2xl transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div className="text-2xl mb-3">📜</div>
              <h3 className="text-lg font-extrabold mb-2" style={{ color: '#0F172A' }}>Certificates &amp; SOAP Progress Notes</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#334155', margin: 0 }}>
                Automated completion certificates for Circle graduates and HIPAA/GDPR-compliant structured SOAP progress notes for clinical records.
              </p>
            </div>

            <div 
              className="p-6 rounded-2xl transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div className="text-2xl mb-3">⚡</div>
              <h3 className="text-lg font-extrabold mb-2" style={{ color: '#0F172A' }}>Zapier &amp; REST API Integrations</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#334155', margin: 0 }}>
                Connect OpenHand seamlessly to 5,000+ apps via Zapier, webhooks, and REST APIs for custom workflow automation.
              </p>
            </div>

            <div 
              className="p-6 rounded-2xl transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div className="text-2xl mb-3">🤝</div>
              <h3 className="text-lg font-extrabold mb-2" style={{ color: '#0F172A' }}>Peer Supervision &amp; Referrals</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#334155', margin: 0 }}>
                Join confidential peer supervision groups (4–6 practitioners) and send/receive verified client referrals across the network.
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
                {/* AURA descriptor — canonical name per glossary */}
                <span>AURA — consent-first session AI</span>
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

      {/* Comparison Table Section - Under Quietly Intelligent */}
      <section className="oh-sec comparison-sec py-16 relative z-10">
        <div className="oh-wrap max-w-6xl mx-auto px-4">
          <div 
            className="sec-head-center text-center mb-10"
            style={{ maxWidth: '100%', width: '100%', margin: '0 auto 40px auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <span className="oh-sec-tag">Why Guides Choose OpenHand</span>
            <h2 
              className="font-black tracking-tight text-slate-900"
              style={{
                fontSize: 'clamp(16px, 2.7vw, 34px)',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                width: '100%',
                margin: '8px auto 12px auto'
              }}
            >
              Built for practice OS depth, not generic course storefronts
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto text-center font-medium leading-relaxed">
              Traditional course storefronts treat your work as video downloads — OpenHand is built for human transformation &amp; privacy-first AI.
            </p>
          </div>

          <div 
            className="w-full overflow-x-auto rounded-[24px] bg-white p-4 sm:p-6 mb-8"
            style={{
              border: '1.5px solid #CBD5E1',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)'
            }}
          >
            <table className="w-full min-w-[800px] border-collapse text-left text-xs sm:text-sm" style={{ borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th 
                    className="py-4 px-5 font-bold w-[24%]"
                    style={{ color: '#0F172A', borderBottom: '1.5px solid #E2E8F0', fontSize: '14px' }}
                  >
                    Feature / Capability
                  </th>
                  
                  {/* OpenHand Highlight Header */}
                  <th className="p-0 text-center w-[28%] align-bottom">
                    <div 
                      className="py-3.5 px-4 text-center font-extrabold text-white text-sm"
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
                        borderTopLeftRadius: '14px',
                        borderTopRightRadius: '14px',
                        borderTop: '2px solid #7C3AED',
                        borderLeft: '2px solid #7C3AED',
                        borderRight: '2px solid #7C3AED',
                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                      }}
                    >
                      OpenHand Practice OS
                    </div>
                  </th>

                  <th 
                    className="py-4 px-3 text-center font-bold w-[16%]"
                    style={{ color: '#1E293B', borderBottom: '1.5px solid #E2E8F0', fontSize: '13.5px' }}
                  >
                    Topmate (Storefront)
                  </th>
                  <th 
                    className="py-4 px-3 text-center font-bold w-[16%]"
                    style={{ color: '#1E293B', borderBottom: '1.5px solid #E2E8F0', fontSize: '13.5px' }}
                  >
                    TagMango (Community)
                  </th>
                  <th 
                    className="py-4 px-3 text-center font-bold w-[16%]"
                    style={{ color: '#1E293B', borderBottom: '1.5px solid #E2E8F0', fontSize: '13.5px' }}
                  >
                    Graphy (LMS)
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* Row 1 */}
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td className="py-4 px-5 font-bold" style={{ color: '#0F172A' }}>
                    Build-Before-Pay Free Setup
                  </td>
                  <td 
                    className="py-4 px-3 text-center font-bold" 
                    style={{ 
                      color: '#7C3AED', 
                      background: '#FFFFFF',
                      borderLeft: '2px solid #7C3AED', 
                      borderRight: '2px solid #7C3AED' 
                    }}
                  >
                    ✓ Full Setup Free (0% Paywall Lock)
                  </td>
                  <td className="py-4 px-3 text-center font-semibold" style={{ color: '#1E293B' }}>
                    ✓ Free (10% Cut)
                  </td>
                  <td className="py-4 px-3 text-center font-semibold" style={{ color: '#1E293B' }}>
                    ✓ Free Start
                  </td>
                  <td className="py-4 px-3 text-center font-semibold" style={{ color: '#1E293B' }}>
                    ✓ Trial
                  </td>
                </tr>

                {/* Row 2 */}
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td className="py-4 px-5 font-bold" style={{ color: '#0F172A' }}>
                    Consent-First Session AI (AURA)
                  </td>
                  <td 
                    className="py-4 px-3 text-center font-bold" 
                    style={{ 
                      color: '#7C3AED', 
                      background: '#FFFFFF',
                      borderLeft: '2px solid #7C3AED', 
                      borderRight: '2px solid #7C3AED' 
                    }}
                  >
                    ✓ Included (Notes Free, Live Panel Paid)
                  </td>
                  <td className="py-4 px-3 text-center font-medium" style={{ color: '#475569' }}>
                    ✕ N/A
                  </td>
                  <td className="py-4 px-3 text-center font-medium" style={{ color: '#475569' }}>
                    ✕ Bot Only
                  </td>
                  <td className="py-4 px-3 text-center font-medium" style={{ color: '#475569' }}>
                    ✕ Generic Bot
                  </td>
                </tr>

                {/* Row 3 */}
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td className="py-4 px-5 font-bold" style={{ color: '#0F172A' }}>
                    Capped 8-Seat Group Circles
                  </td>
                  <td 
                    className="py-4 px-3 text-center font-bold" 
                    style={{ 
                      color: '#7C3AED', 
                      background: '#FFFFFF',
                      borderLeft: '2px solid #7C3AED', 
                      borderRight: '2px solid #7C3AED' 
                    }}
                  >
                    ✓ Built-in (6-wk Containers)
                  </td>
                  <td className="py-4 px-3 text-center font-medium" style={{ color: '#475569' }}>
                    ✕ Mass Webinars
                  </td>
                  <td className="py-4 px-3 text-center font-medium" style={{ color: '#475569' }}>
                    ✕ Uncapped Groups
                  </td>
                  <td className="py-4 px-3 text-center font-medium" style={{ color: '#475569' }}>
                    ✕ Video Streams
                  </td>
                </tr>

                {/* Row 4 */}
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td className="py-4 px-5 font-bold" style={{ color: '#0F172A' }}>
                    B2B EAP Org Billing Mode
                  </td>
                  <td 
                    className="py-4 px-3 text-center font-bold" 
                    style={{ 
                      color: '#7C3AED', 
                      background: '#FFFFFF',
                      borderLeft: '2px solid #7C3AED', 
                      borderRight: '2px solid #7C3AED' 
                    }}
                  >
                    ✓ Per-Seat Billing + HR Confidentiality
                  </td>
                  <td className="py-4 px-3 text-center font-medium" style={{ color: '#475569' }}>
                    ✕ N/A
                  </td>
                  <td className="py-4 px-3 text-center font-medium" style={{ color: '#475569' }}>
                    ✕ N/A
                  </td>
                  <td className="py-4 px-3 text-center font-medium" style={{ color: '#475569' }}>
                    ✕ N/A
                  </td>
                </tr>

                {/* Row 5 */}
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td className="py-4 px-5 font-bold" style={{ color: '#0F172A' }}>
                    Branded Mobile App &amp; White-label
                  </td>
                  <td 
                    className="py-4 px-3 text-center font-bold" 
                    style={{ 
                      color: '#7C3AED', 
                      background: '#FFFFFF',
                      borderLeft: '2px solid #7C3AED', 
                      borderRight: '2px solid #7C3AED' 
                    }}
                  >
                    ✓ Master Studio Plan Included
                  </td>
                  <td className="py-4 px-3 text-center font-medium" style={{ color: '#475569' }}>
                    ✕ N/A
                  </td>
                  <td className="py-4 px-3 text-center font-semibold" style={{ color: '#1E293B' }}>
                    ✓ Included
                  </td>
                  <td className="py-4 px-3 text-center font-semibold" style={{ color: '#1E293B' }}>
                    ✓ Included
                  </td>
                </tr>

                {/* Row 6 */}
                <tr>
                  <td className="py-4 px-5 font-bold" style={{ color: '#0F172A' }}>
                    Direct T+2 Bank Payouts
                  </td>
                  <td 
                    className="py-4 px-3 text-center font-bold" 
                    style={{ 
                      color: '#7C3AED', 
                      background: '#FFFFFF',
                      borderLeft: '2px solid #7C3AED', 
                      borderRight: '2px solid #7C3AED',
                      borderBottom: '2px solid #7C3AED',
                      borderBottomLeftRadius: '14px',
                      borderBottomRightRadius: '14px'
                    }}
                  >
                    ✓ Razorpay &amp; Stripe Direct
                  </td>
                  <td className="py-4 px-3 text-center font-semibold" style={{ color: '#1E293B' }}>
                    ✓ Razorpay
                  </td>
                  <td className="py-4 px-3 text-center font-semibold" style={{ color: '#1E293B' }}>
                    ✓ Razorpay
                  </td>
                  <td className="py-4 px-3 text-center font-semibold" style={{ color: '#1E293B' }}>
                    ✓ Razorpay
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                0%
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-1">Zero Paywall Lock</h4>
                <p className="text-xs text-slate-600 leading-relaxed m-0">
                  Build your space, onboard learners, and host check-ins completely free without forced paywalls.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                🔒
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-1">Confidential &amp; EAP Ready</h4>
                <p className="text-xs text-slate-600 leading-relaxed m-0">
                  Enterprise-grade HR confidentiality with per-seat organizational billing for corporate wellness programs.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                ⚡
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-1">AURA Session Intelligence</h4>
                <p className="text-xs text-slate-600 leading-relaxed m-0">
                  Consent-first AI that assists with notes and session insights tuned strictly to your authentic voice.
                </p>
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
            {/* Base Track Beam with Moving Train Light Spark */}
            <div className="timeline-beam">
              <div className="train-car-spark"></div>
              <div className="train-track-fill"></div>
            </div>

            <div className="timeline-steps-row">
              {/* Step 01 */}
              <div className="timeline-step-item flow-step-1">
                <div className="timeline-node">
                  <span className="node-num">01</span>
                  <span className="step-glow-ring"></span>
                </div>
                <div className="timeline-info">
                  <h3>Start your free practice space</h3>
                  <Link to="/signup" className="timeline-cta-btn btn-blue">
                    Start free space <FiArrowRight style={{ marginLeft: '6px' }} />
                  </Link>
                </div>
              </div>

              {/* Step 02 */}
              <div className="timeline-step-item flow-step-2">
                <div className="timeline-node">
                  <span className="node-num">02</span>
                  <span className="step-glow-ring"></span>
                </div>
                <div className="timeline-info">
                  <h3>See a sample learner journey</h3>
                  <Link to="/learner-journey" className="timeline-cta-btn btn-purple">
                    View sample journey <FiArrowRight style={{ marginLeft: '6px' }} />
                  </Link>
                </div>
              </div>

              {/* Step 03 */}
              <div className="timeline-step-item flow-step-3">
                <div className="timeline-node">
                  <span className="node-num">03</span>
                  <span className="step-glow-ring"></span>
                </div>
                <div className="timeline-info">
                  <h3>Talk to a real human</h3>
                  <Link to="/contact-us" className="timeline-cta-btn btn-emerald">
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
