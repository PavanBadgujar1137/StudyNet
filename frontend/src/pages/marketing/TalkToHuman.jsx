import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { OHFooter } from '../../components/openhand'
import { apiConnector } from '../../services/apiConnector'
import toast from 'react-hot-toast'
import {
  FiCheck,
  FiClock,
  FiUser,
  FiChevronDown,
  FiMessageSquare,
  FiArrowRight,
  FiShield,
  FiCheckCircle,
  FiZap,
  FiSend
} from 'react-icons/fi'

export function TalkToHuman() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    workType: 'Life or executive coaching',
    message: '',
  })
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [selectedFounder, setSelectedFounder] = useState('either')
  const [openFaq, setOpenFaq] = useState([0])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const topics = [
    {
      id: 'fit',
      dur: '25 minutes',
      title: `"I'm not sure this fits my practice"`,
      workTypeValue: 'Life or executive coaching',
      desc: `You work in a specific way — somatic, narrative, faith-based, group-only — and you've been burned by tools that assumed you sell courses.`,
      points: [
        'We look at your actual practice format',
        "We'll tell you honestly if we're wrong for you",
        'No slide decks or forced sales demos',
      ],
      founderHint: 'Best with Dr. Anamika',
    },
    {
      id: 'migration',
      dur: '40 minutes',
      title: `"I have clients already — how do I move?"`,
      workTypeValue: 'Counselling or psychotherapy',
      desc: `You're running on WhatsApp, Google Meet, spreadsheets, and manual payment links. It works, but it's exhausting.`,
      points: [
        'Migration mapped step-by-step',
        'Your existing client records moved smoothly',
        'Nothing goes live until you explicitly approve',
      ],
      founderHint: 'Best with Dr. Rajendra Patil',
    },
    {
      id: 'org',
      dur: '45 minutes',
      title: `"We want this for our employees"`,
      workTypeValue: 'Organisational / employee wellbeing',
      desc: `You're an HR or people leader. Your traditional EAP exists, nobody uses it, and you need something employees will actually open up in.`,
      points: [
        'Pilot container scoped for one team first',
        'Reporting that strictly respects individual confidentiality',
        'Vetted practitioner panel, or bring your own',
      ],
      founderHint: 'Recommended for Org Leads',
    },
  ]

  const faqs = [
    {
      q: 'Do I have to talk to anyone to start?',
      a: 'No. The free plan opens immediately without requiring a call, a credit card, or a demo. This page exists for practitioners who want a direct human conversation first — not as a paywall or gate in front of the product.',
    },
    {
      q: 'Is my client data safe if I move here?',
      a: 'Client records are end-to-end encrypted, access-controlled strictly per practitioner, and never used to train external public models. Bring this up on your call — Rajendra will walk you through exactly where data resides and what you can delete.',
    },
    {
      q: 'What if I already use TagMango, Topmate or my own site?',
      a: "Plenty of practitioners run both concurrently for a transition phase. We'll assist you in migrating your calendar, your offers, and your existing clients without any mandatory hard cutover date.",
    },
    {
      q: 'Can I turn the in-session co-pilot off?',
      a: "Yes, entirely — at either the account level or on a per-session basis. It is opt-in for you and separately consented by your client. OpenHand sessions function seamlessly with or without it.",
    },
  ]

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleSelectTopic = (index) => {
    setSelectedTopic(index)
    const topic = topics[index]
    if (topic) {
      setFormData((prev) => ({
        ...prev,
        workType: topic.workTypeValue,
      }))
    }
    // Scroll smoothly to form
    const bookElem = document.getElementById('book')
    if (bookElem) {
      bookElem.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const toggleFaq = (index) => {
    setOpenFaq((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      toast.error('Please provide your name and email so we can reply.')
      return
    }

    setLoading(true)
    try {
      const selectedTopicObj = selectedTopic !== null ? topics[selectedTopic] : null
      const topicTitle = selectedTopicObj ? selectedTopicObj.title : 'General Conversation'
      const founderPrefText =
        selectedFounder === 'anamika'
          ? 'Dr. Anamika'
          : selectedFounder === 'rajendra'
          ? 'Dr. Rajendra Patil'
          : 'Either Founder'

      const fullMessage = `[Founder Preference: ${founderPrefText}] [Focus Topic: ${topicTitle}]\n${formData.message}`

      const res = await apiConnector('POST', '/api/v1/reach/contact', {
        name: formData.name,
        email: formData.email,
        workType: formData.workType,
        message: fullMessage,
        meetingType: 'Requested Call',
      })

      if (res?.data?.success) {
        setSubmitted(true)
        toast.success('Conversation request sent successfully!')
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      console.error('Talk to human submit error:', err)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="talk-page">
      {/* Hero */}
      <header className="talk-hero">
        <div className="oh-wrap">
          <div className="talk-status-badge">
            <span className="talk-pulse-dot"></span>
            <span>Founders accepting 1:1 conversation requests this week</span>
          </div>

          <h1>
            Talk to <span className="talk-grad-text">a real human.</span>
          </h1>
          <p>
            Not a chatbot, not an SDR reading a script. One of the two people who built OpenHand, for fifteen to twenty minutes, about your practice specifically.
          </p>

          {/* Key Assurance Stats */}
          <div className="talk-hero-stats">
            <div className="stat-item">
              <span className="stat-num">2</span>
              <span className="stat-lbl">Co-Founders Direct</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">15–20m</span>
              <span className="stat-lbl">1:1 Dedicated Call</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">0%</span>
              <span className="stat-lbl">Sales Script Pitch</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">100%</span>
              <span className="stat-lbl">Private & Confidential</span>
            </div>
          </div>
        </div>
      </header>

      {/* Founders Section */}
      <section className="talk-sec">
        <div className="oh-wrap">
          <div className="talk-sec-head">
            <span className="talk-section-tag">Direct Founder Access</span>
            <h2>Who you'll be speaking with</h2>
            <p>Pick a founder whose background matches your questions, or select either.</p>
          </div>

          <div className="talk-founders-container">
            <div className="talk-link-loop-badge">
              <svg
                viewBox="0 0 68 40"
                fill="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="g2" x1="0" y1="0" x2="68" y2="40">
                    <stop offset="0" stopColor="#1F5FE0" />
                    <stop offset="0.5" stopColor="#4733C9" />
                    <stop offset="1" stopColor="#8A2BE0" />
                  </linearGradient>
                </defs>
                <path
                  d="M6 20c0-7 5-12 11-12s11 5 15 12c4 7 9 12 15 12s11-5 11-12-5-12-11-12-11 5-15 12c-4 7-9 12-15 12S6 27 6 20Z"
                  stroke="url(#g2)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="talk-founders">

            {/* Dr. Anamika Card */}
            <div
              className={`talk-fcard ${selectedFounder === 'anamika' ? 'active-founder' : ''}`}
              onClick={() => setSelectedFounder('anamika')}
            >
              <div className="fcard-badge">
                <FiClock className="fcard-ic" /> 15-20 min
              </div>
              <div className="fcard-top">
                <div className="av">AN</div>
                <div>
                  <h3>Dr. Anamika</h3>
                  <div className="role">Co-founder · IIT Bombay</div>
                </div>
              </div>
              <p>
                Talk to Dr. Anamika if your questions are about the practice itself — how to shape a cohort, what to charge, whether your material works as a six-week container or a self-paced program.
              </p>
              <div className="talk-tags">
                <span>Cohort Architecture</span>
                <span>Pricing & Offers</span>
                <span>Group Dynamics</span>
              </div>
              <button
                type="button"
                className={`fcard-btn ${selectedFounder === 'anamika' ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFounder('anamika')
                }}
              >
                {selectedFounder === 'anamika' ? (
                  <>
                    <FiCheck /> Preferred Founder
                  </>
                ) : (
                  'Request Call with Anamika'
                )}
              </button>
            </div>

            {/* Dr. Rajendra Patil Card */}
            <div
              className={`talk-fcard ${selectedFounder === 'rajendra' ? 'active-founder' : ''}`}
              onClick={() => setSelectedFounder('rajendra')}
            >
              <div className="fcard-badge">
                <FiClock className="fcard-ic" /> 15-20 min
              </div>
              <div className="fcard-top">
                <div className="av">RP</div>
                <div>
                  <h3>Dr. Rajendra Patil</h3>
                  <div className="role">Co-founder</div>
                </div>
              </div>
              <p>
                Talk to Dr. Rajendra if your questions are about the harder edges — client confidentiality, ethical use of the in-session co-pilot, working with organisations, or moving an existing caseload across.
              </p>
              <div className="talk-tags">
                <span>Data Confidentiality</span>
                <span>Ethical AI Co-pilot</span>
                <span>Caseload Migration</span>
              </div>
              <button
                type="button"
                className={`fcard-btn ${selectedFounder === 'rajendra' ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFounder('rajendra')
                }}
              >
                {selectedFounder === 'rajendra' ? (
                  <>
                    <FiCheck /> Preferred Founder
                  </>
                ) : (
                  'Request Call with Rajendra'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Three Conversations Section */}
      <section className="talk-sec">
        <div className="oh-wrap">
          <div className="talk-sec-head">
            <span className="talk-section-tag">Tailored Call Formats</span>
            <h2>Three conversations we actually have</h2>
            <p>Pick whichever is closest to your needs. Click any topic to select it for your booking.</p>
          </div>

          <div className="talk-ways">
            {topics.map((t, idx) => {
              const isSelected = selectedTopic === idx
              return (
                <div
                  key={t.id}
                  className={`talk-way ${isSelected ? 'selected-way' : ''}`}
                  onClick={() => handleSelectTopic(idx)}
                >
                  <div className="way-top-row">
                    <span className="dur">
                      <FiClock style={{ display: 'inline', marginRight: '4px' }} />
                      {t.dur}
                    </span>
                    {isSelected && (
                      <span className="way-selected-badge">
                        <FiCheck /> Selected
                      </span>
                    )}
                  </div>
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                  <ul>
                    {t.points.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>
                  <div className="way-footer">
                    <span className="hint-pill">{t.founderHint}</span>
                    <button type="button" className="way-action-btn">
                      {isSelected ? 'Selected Topic' : 'Choose Topic'} <FiArrowRight />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Book Form Section */}
      <section className="talk-sec" id="book">
        <div className="oh-wrap">
          <div className="talk-formsec">
            <div className="talk-formgrid">
              <div className="form-info-col">
                <span className="form-eyebrow">
                  <FiZap className="sparkle-icon" /> Direct Access
                </span>
                <h2>Book a conversation</h2>
                <p className="lede">
                  Tell us roughly where you are in your practice journey. We'll send two or three proposed time slots in your timezone within 24 hours.
                </p>

                {/* Selected Topic Context Indicator */}
                {selectedTopic !== null && (
                  <div className="topic-context-card">
                    <div className="topic-context-head">
                      <FiMessageSquare className="tc-icon" />
                      <span>Focus Topic Selected:</span>
                    </div>
                    <strong>{topics[selectedTopic].title}</strong>
                    <button
                      type="button"
                      className="topic-context-reset"
                      onClick={() => setSelectedTopic(null)}
                    >
                      Change topic
                    </button>
                  </div>
                )}

                <div className="talk-assure">
                  <div>
                    <FiCheckCircle />
                    <p>
                      <strong>A founder joins the call.</strong> Every single time — never an SDR or sales rep.
                    </p>
                  </div>
                  <div>
                    <FiShield />
                    <p>
                      <strong>Honest assessment.</strong> If OpenHand isn't right for your practice, we'll say so immediately and recommend better alternatives.
                    </p>
                  </div>
                  <div>
                    <FiZap />
                    <p>
                      <strong>Zero spam sequence.</strong> One prompt reply from us with times, then the ball is entirely in your court.
                    </p>
                  </div>
                </div>
              </div>

              <div className="form-fields-col">
                {submitted ? (
                  <div className="talk-ok-card">
                    <div className="ok-icon-wrap">
                      <FiCheckCircle className="ok-check" />
                    </div>
                    <h3>Conversation request sent!</h3>
                    <p>
                      Thanks, <strong>{formData.name.split(' ')[0]}</strong>. We have received your request.
                    </p>
                    <div className="ok-details">
                      <div className="ok-item">
                        <span>Reply Email:</span>
                        <strong>{formData.email}</strong>
                      </div>
                      <div className="ok-item">
                        <span>Founder Preference:</span>
                        <strong>
                          {selectedFounder === 'anamika'
                            ? 'Dr. Anamika'
                            : selectedFounder === 'rajendra'
                            ? 'Dr. Rajendra Patil'
                            : 'Either Founder'}
                        </strong>
                      </div>
                      {selectedTopic !== null && (
                        <div className="ok-item">
                          <span>Focus Topic:</span>
                          <strong>{topics[selectedTopic].title}</strong>
                        </div>
                      )}
                    </div>
                    <p className="ok-subtext">
                      We will review your practice context and reply with 2–3 time slots within one working day.
                    </p>
                    <button
                      type="button"
                      className="talk-btn-ghost"
                      style={{ marginTop: '16px', width: '100%' }}
                      onClick={() => {
                        setSubmitted(false)
                        setFormData({
                          name: '',
                          email: '',
                          workType: 'Life or executive coaching',
                          message: '',
                        })
                        setSelectedTopic(null)
                      }}
                    >
                      Submit Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="talk-fields">
                    {/* Founder Selector Tabs */}
                    <div className="founder-select-group">
                      <label className="group-label">Founder Preference</label>
                      <div className="founder-tabs">
                        <button
                          type="button"
                          className={`ftab ${selectedFounder === 'either' ? 'active' : ''}`}
                          onClick={() => setSelectedFounder('either')}
                        >
                          Either Founder
                        </button>
                        <button
                          type="button"
                          className={`ftab ${selectedFounder === 'anamika' ? 'active' : ''}`}
                          onClick={() => setSelectedFounder('anamika')}
                        >
                          Dr. Anamika
                        </button>
                        <button
                          type="button"
                          className={`ftab ${selectedFounder === 'rajendra' ? 'active' : ''}`}
                          onClick={() => setSelectedFounder('rajendra')}
                        >
                          Dr. Rajendra
                        </button>
                      </div>
                    </div>

                    <div className="form-row2">
                      <div>
                        <label htmlFor="name">Your Name</label>
                        <input
                          id="name"
                          type="text"
                          placeholder="Dr. Anamika"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="email">Work Email</label>
                        <input
                          id="email"
                          type="email"
                          placeholder="you@practice.in"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="workType">What kind of practice do you lead?</label>
                      <select id="workType" value={formData.workType} onChange={handleChange}>
                        <option>Life or executive coaching</option>
                        <option>Counselling or psychotherapy</option>
                        <option>Relationship or family work</option>
                        <option>Wellness, healing or somatic practice</option>
                        <option>Organisational / employee wellbeing</option>
                        <option>Something else</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message">Anything specific to share before the call?</label>
                      <textarea
                        id="message"
                        rows="3"
                        placeholder="e.g. I run two cohorts a year and see about eight 1:1 clients. Mostly curious about client data confidentiality."
                        value={formData.message}
                        onChange={handleChange}
                      />
                    </div>

                    <button type="submit" disabled={loading} className="talk-btn">
                      {loading ? (
                        <>
                          <span className="btn-spinner"></span> Sending Request…
                        </>
                      ) : (
                        <>
                          <FiSend style={{ marginRight: '8px' }} /> Request a Time Slot
                        </>
                      )}
                    </button>

                    <p className="talk-fineprint">
                      <FiShield style={{ display: 'inline', marginRight: '4px', color: '#9BB4FF' }} />
                      We reply within one working day. Your details are strictly confidential.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="talk-sec">
        <div className="oh-wrap">
          <div className="talk-sec-head">
            <span className="talk-section-tag">Frequently Asked Questions</span>
            <h2>Before you ask us</h2>
            <p>Common questions practitioners have before scheduling a founder call.</p>
          </div>

          <div className="talk-faq">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq.includes(idx)
              return (
                <div
                  key={idx}
                  className={`talk-q-card ${isOpen ? 'open' : ''}`}
                  onClick={() => toggleFaq(idx)}
                >
                  <div className="talk-q-head">
                    <h3>{faq.q}</h3>
                    <span className="talk-q-toggle">
                      <FiChevronDown className={`chevron-icon ${isOpen ? 'rotate' : ''}`} />
                    </span>
                  </div>
                  {isOpen && (
                    <div className="talk-q-body">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="talk-close">
        <div className="oh-wrap">
          <div className="close-card">
            <h2>Or skip the call and explore directly.</h2>
            <p>
              The free plan is open right now. You can create your practice space in seconds and book a call whenever you're ready.
            </p>
            <div className="talk-cta-row">
              <Link to="/start-free" className="talk-btn" style={{ width: 'auto', padding: '13px 28px' }}>
                Start Free Practice Space <FiArrowRight style={{ marginLeft: '8px' }} />
              </Link>
              <Link to="/client-journey" className="talk-btn-ghost">
                See Client Journey →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default TalkToHuman
