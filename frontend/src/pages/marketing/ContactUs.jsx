import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { OHFooter } from '../../components/openhand'
import { apiConnector } from '../../services/apiConnector'
import toast from 'react-hot-toast'
import {
  FiCheck,
  FiClock,
  FiChevronDown,
  FiMessageSquare,
  FiArrowRight,
  FiShield,
  FiCheckCircle,
  FiZap,
  FiSend
} from 'react-icons/fi'

export function ContactUs() {
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
      founderHint: 'Best with Assistant of Dr. Anamika',
    },
    {
      id: 'migration',
      dur: '40 minutes',
      title: `"I have learners already — how do I move?"`,
      workTypeValue: 'Counselling or psychotherapy',
      desc: `You're running on WhatsApp, Google Meet, spreadsheets, and manual payment links. It works, but it's exhausting.`,
      points: [
        'A single transition window, zero dropped bookings',
        'Your existing learner records moved smoothly',
        'Nothing goes live until you explicitly approve',
      ],
      founderHint: 'Best with Assistant of Dr. Rajendra Patil',
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
      q: 'Is my learner data safe if I move here?',
      a: 'Learner records are end-to-end encrypted, access-controlled strictly per practitioner, and never used to train external public models. Bring this up on your call — Rajendra will walk you through exactly where data resides and what you can delete.',
    },
    {
      q: 'What if I already use TagMango, Topmate or my own site?',
      a: "Plenty of practitioners run both concurrently for a transition phase. We'll assist you in migrating your calendar, your offers, and your existing learners without any mandatory hard cutover date.",
    },
    {
      q: 'Can I turn the in-session AURA off?',
      a: "Yes, entirely — at either the account level or on a per-session basis. It is opt-in for you and separately consented by your learner. OpenHand sessions function seamlessly with or without it.",
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

      // Also log to Admin Panel OrgConversation if this is an org inquiry
      const isOrgInquiry =
        formData.workType === 'Organisational / employee wellbeing' ||
        (selectedTopicObj?.id === 'org')

      if (isOrgInquiry) {
        try {
          await apiConnector('POST', '/api/v1/org/book-conversation', {
            organizationName: formData.workType || 'Organisation',
            contactName: formData.name,
            contactEmail: formData.email,
            message: fullMessage,
            interestedIn: selectedTopicObj ? [selectedTopicObj.title] : ['Employee Wellbeing'],
          })
        } catch (orgErr) {
          console.warn('OrgConversation log failed (non-critical):', orgErr.message)
        }
      }

      if (res?.data?.success) {
        setSubmitted(true)
        toast.success('Contact message sent successfully!')
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      console.error('Contact us submit error:', err)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="talk-page relative min-h-screen">

      {/* Hero */}
      <header className="talk-hero">
        <div className="oh-wrap">
          <div className="talk-status-badge">
            <span className="talk-pulse-dot"></span>
            <span>Contact Us — Response within 24 hours guaranteed</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 my-4">
            Contact <span className="talk-grad-text">OpenHand Team.</span>
          </h1>
          <p className="sub text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-8">
            Have questions about OpenHand? Connect directly with the assistant of Dr. Anamika or the assistant of Dr. Rajendra Patil for personalized practice guidance, platform setup, or enterprise inquiries.
          </p>

          {/* Key Assurance Stats */}
          <div className="talk-hero-stats grid grid-cols-2 sm:flex sm:flex-row rounded-2xl sm:rounded-full gap-4 sm:gap-6 px-6 sm:px-10 py-4">
            <div className="stat-item">
              <span className="stat-num">24h SLA</span>
              <span className="stat-lbl">Guaranteed Response</span>
            </div>
            <div className="stat-divider hidden sm:block"></div>
            <div className="stat-item">
              <span className="stat-num">1:1 Support</span>
              <span className="stat-lbl">Dedicated Assistance</span>
            </div>
            <div className="stat-divider hidden sm:block"></div>
            <div className="stat-item">
              <span className="stat-num">0%</span>
              <span className="stat-lbl">Sales Push</span>
            </div>
            <div className="stat-divider hidden sm:block"></div>
            <div className="stat-item">
              <span className="stat-num">100%</span>
              <span className="stat-lbl">Private &amp; Confidential</span>
            </div>
          </div>
        </div>
      </header>

      {/* Executive Contact Desks Section */}
      <section className="talk-sec">
        <div className="oh-wrap">
          <div className="talk-sec-head">
            <span className="talk-section-tag">Executive Contact Desks</span>
            <h2>Who would you like to reach out to?</h2>
            <p>Connect with the Assistant of Dr. Anamika or the Assistant of Dr. Rajendra Patil based on your specific practice needs.</p>
          </div>

          <div className="talk-founders-container">
            <div className="talk-founders grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Assistant of Dr. Anamika Card */}
              <div
                className={`talk-fcard ${selectedFounder === 'anamika' ? 'active-founder' : ''}`}
                onClick={() => setSelectedFounder('anamika')}
              >
                <div className="fcard-badge">
                  <FiClock className="fcard-ic" /> Executive Desk
                </div>
                <div className="fcard-top">
                  <div className="av">AN</div>
                  <div>
                    <h3>Assistant of Dr. Anamika</h3>
                    <div className="role">Co-Founder &amp; Practice Lead Desk</div>
                  </div>
                </div>
                <p>
                  Contact the assistant of Dr. Anamika for cohort architecture, offer design, pricing models, practice setup, and practitioner onboarding support.
                </p>
                <div className="talk-tags">
                  <span>Cohort Architecture</span>
                  <span>Pricing &amp; Offers</span>
                  <span>Practitioner Setup</span>
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
                      <FiCheck /> Contacting Assistant of Dr. Anamika
                    </>
                  ) : (
                    'Contact Assistant of Dr. Anamika'
                  )}
                </button>
              </div>

              {/* Assistant of Dr. Rajendra Patil Card */}
              <div
                className={`talk-fcard ${selectedFounder === 'rajendra' ? 'active-founder' : ''}`}
                onClick={() => setSelectedFounder('rajendra')}
              >
                <div className="fcard-badge">
                  <FiClock className="fcard-ic" /> Executive Desk
                </div>
                <div className="fcard-top">
                  <div className="av">RP</div>
                  <div>
                    <h3>Assistant of Dr. Rajendra Patil</h3>
                    <div className="role">Co-Founder &amp; Tech/Ethics Desk</div>
                  </div>
                </div>
                <p>
                  Contact the assistant of Dr. Rajendra Patil for technical platform integration, data confidentiality, AURA AI ethics, and enterprise organizational pilots.
                </p>
                <div className="talk-tags">
                  <span>Data Confidentiality</span>
                  <span>Ethical AI AURA</span>
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
                      <FiCheck /> Contacting Assistant of Dr. Rajendra Patil
                    </>
                  ) : (
                    'Contact Assistant of Dr. Rajendra Patil'
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

          <div className="talk-ways grid grid-cols-1 md:grid-cols-3 gap-5">
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
            <div className="talk-formgrid grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8">
              <div className="form-info-col">
                <span className="form-eyebrow">
                  <FiZap className="sparkle-icon" /> Direct Access
                </span>
                <h2>Contact Us</h2>
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
                    <h3>Contact request sent!</h3>
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
                            ? 'Assistant of Dr. Anamika'
                            : selectedFounder === 'rajendra'
                            ? 'Assistant of Dr. Rajendra Patil'
                            : 'General Executive Desk'}
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
                      We will review your context and reply with 2–3 time slots within one working day.
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
                    {/* Executive Contact Desk Tabs */}
                    <div className="founder-select-group">
                      <label className="group-label">Contact Desk Preference</label>
                      <div className="founder-tabs grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          className={`ftab ${selectedFounder === 'anamika' ? 'active' : ''}`}
                          onClick={() => setSelectedFounder('anamika')}
                        >
                          Assistant of Dr. Anamika
                        </button>
                        <button
                          type="button"
                          className={`ftab ${selectedFounder === 'rajendra' ? 'active' : ''}`}
                          onClick={() => setSelectedFounder('rajendra')}
                        >
                          Assistant of Dr. Rajendra
                        </button>
                        <button
                          type="button"
                          className={`ftab ${selectedFounder === 'either' ? 'active' : ''}`}
                          onClick={() => setSelectedFounder('either')}
                        >
                          General Desk
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
                        placeholder="e.g. I run two cohorts a year and see about eight 1:1 learners. Mostly curious about learner data confidentiality."
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
                          <FiSend style={{ marginRight: '8px' }} /> Send Message
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
              The free plan is open right now. You can create your practice space in seconds and contact us whenever you're ready.
            </p>
            <div className="talk-cta-row">
              <Link to="/signup" className="talk-btn" style={{ width: 'auto', padding: '13px 28px' }}>
                Start Free Practice Space <FiArrowRight style={{ marginLeft: '8px' }} />
              </Link>
              <Link to="/learner-journey" className="talk-btn-ghost">
                See Learner Journey →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default ContactUs
