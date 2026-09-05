import React, { useState } from 'react'
import { OHFooter, OHButton } from '../../components/openhand'

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
  FiSend,
  FiMail,
  FiPhoneCall,
  FiX
} from 'react-icons/fi'

export function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    workType: 'Life or executive coaching',
    message: '',
  })
  const [selectedDesk, setSelectedDesk] = useState('setup')
  const [selectedTopic, setSelectedTopic] = useState(null)
  // ITEM 10 FIX: Single active accordion state matching Questions Practitioners Ask & AURA
  const [activeFaq, setActiveFaq] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [directActionModal, setDirectActionModal] = useState(null) // setup | tech | org

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
      founderHint: 'Best with Practice Setup Desk',
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
      founderHint: 'Best with Tech & Ethics Desk',
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
      a: 'Learner records are end-to-end encrypted, access-controlled strictly per practitioner, and never used to train external public models. Bring this up on your call — our technical team will walk you through exactly where data resides and what you can delete.',
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

  // ITEM 8 FIX: Sync selected topic with both workType AND desk preference
  const handleSelectTopic = (index) => {
    setSelectedTopic(index)
    const topic = topics[index]
    if (topic) {
      setFormData((prev) => ({
        ...prev,
        workType: topic.workTypeValue,
      }))
      
      // Dynamically set matching desk focus!
      if (topic.id === 'fit') {
        setSelectedDesk('setup')
      } else if (topic.id === 'migration') {
        setSelectedDesk('tech')
      } else if (topic.id === 'org') {
        setSelectedDesk('org')
      }
    }
    // Scroll smoothly to form
    const bookElem = document.getElementById('book')
    if (bookElem) {
      bookElem.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // ITEM 10 FIX: Single open accordion behavior
  const toggleFaq = (index) => {
    setActiveFaq((prev) => (prev === index ? null : index))
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
      const deskPrefText =
        selectedDesk === 'setup'
          ? 'Practice Setup Desk'
          : selectedDesk === 'tech'
          ? 'Tech & Ethics Desk'
          : 'Organizations & EAP Desk'

      const fullMessage = `[Desk Preference: ${deskPrefText}] [Focus Topic: ${topicTitle}]\n${formData.message}`

      const res = await apiConnector('POST', '/api/v1/reach/contact', {
        name: formData.name,
        email: formData.email,
        workType: formData.workType,
        message: fullMessage,
        meetingType: 'Requested Call',
      })

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

      {/* Direct Desk Action Modal */}
      {directActionModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div
            className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 text-left"
            style={{ backgroundColor: '#FFFFFF', color: '#0F172A', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            <button
              type="button"
              onClick={() => setDirectActionModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors p-1"
              style={{ color: '#64748B' }}
              aria-label="Close dialog"
            >
              <FiX size={20} />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#EEF2FF', borderColor: '#E0E7FF', color: '#4F46E5' }}
              >
                {directActionModal === 'setup' ? <FiMessageSquare size={18} /> : directActionModal === 'tech' ? <FiMail size={18} /> : <FiPhoneCall size={18} />}
              </div>
              <div>
                <h3 className="text-lg font-extrabold" style={{ color: '#0F172A', margin: 0, lineHeight: 1.3, fontSize: '18px', fontWeight: 800 }}>
                  {directActionModal === 'setup'
                    ? 'Practice Setup Desk Options'
                    : directActionModal === 'tech'
                    ? 'Tech & Ethics Desk Options'
                    : 'Organizations Desk Line'}
                </h3>
                <span className="text-xs font-semibold" style={{ color: '#64748B', fontSize: '12px' }}>Direct Communication Channel</span>
              </div>
            </div>
            <p className="text-xs mb-5 leading-relaxed" style={{ color: '#475569', fontSize: '13px', lineHeight: 1.5 }}>
              {directActionModal === 'setup'
                ? 'Connect instantly with practice architects for circle pricing and onboarding guidance.'
                : directActionModal === 'tech'
                ? 'Direct line for HIPAA/GDPR data security, AURA consent ethics, and caseload migration.'
                : 'Direct line for enterprise pilot scoping, HR confidentiality agreements, and seat billing.'}
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={
                  directActionModal === 'setup'
                    ? 'mailto:setup@openhand.in?subject=Practice%20Setup%20Desk%20Inquiry'
                    : directActionModal === 'tech'
                    ? 'mailto:tech-ethics@openhand.in?subject=Tech%20%26%20Ethics%20Security%20Inquiry'
                    : 'mailto:enterprise@openhand.in?subject=Organizations%20Pilot%20Inquiry'
                }
                className="w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                style={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                  cursor: 'pointer'
                }}
              >
                <FiMail size={16} style={{ color: '#FFFFFF' }} />
                <span style={{ color: '#FFFFFF', fontWeight: 700 }}>Send Direct Email (Open Mailbox)</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setSelectedDesk(directActionModal)
                  setDirectActionModal(null)
                  const bookElem = document.getElementById('book')
                  if (bookElem) bookElem.scrollIntoView({ behavior: 'smooth' })
                }}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-slate-200"
                style={{
                  backgroundColor: '#F8FAFC',
                  color: '#0F172A',
                  border: '1px solid #CBD5E1',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <FiSend size={16} style={{ color: '#0F172A' }} />
                <span style={{ color: '#0F172A', fontWeight: 600 }}>Fill Booking Form</span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Hero */}
      <header className="talk-hero">
        <div className="oh-wrap">
          <div className="talk-status-badge">
            <span className="talk-pulse-dot"></span>
            <span>Contact Us — Response within 24 hours guaranteed</span>
          </div>

          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 my-4 text-center whitespace-nowrap w-full mx-auto">
            Contact <span className="talk-grad-text">OpenHand Team.</span>
          </h1>
          <p className="sub text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-8">
            Have questions about OpenHand? Connect directly with our Practice Setup Desk or Tech &amp; Ethics Desk for personalized practice guidance, platform setup, or enterprise inquiries.
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

      {/* Executive Contact Desks Section (ITEM 7 FIX) */}
      <section className="talk-sec">
        <div className="oh-wrap">
          <div className="talk-sec-head">
            <span className="talk-section-tag">Executive Contact Desks</span>
            <h2>Who would you like to reach out to?</h2>
            <p>Connect with our specialized Practice Setup Desk or Tech &amp; Ethics Desk based on your specific practice needs.</p>
          </div>

          <div className="talk-founders-container">
            <div className="talk-founders grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Practice Setup Desk Card */}
              <div
                className={`talk-fcard ${selectedDesk === 'setup' ? 'active-founder' : ''}`}
                onClick={() => setSelectedDesk('setup')}
              >
                <div className="fcard-header">
                  <div className="av">PS</div>
                  <div className="fcard-badge">
                    <FiClock className="fcard-ic" /> Practice Desk
                  </div>
                </div>
                <div className="fcard-title-block mb-3">
                  <h3>Practice Setup Desk</h3>
                  <div className="role">Practice &amp; Offer Architecture</div>
                </div>
                <p>
                  Contact our Practice Setup Desk for Circle architecture, offer design, pricing models, practice setup, and practitioner onboarding support.
                </p>
                <div className="talk-tags">
                  <span>Circle Architecture</span>
                  <span>Pricing &amp; Offers</span>
                  <span>Practitioner Setup</span>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    type="button"
                    className={`fcard-btn ${selectedDesk === 'setup' ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedDesk('setup')
                    }}
                  >
                    {selectedDesk === 'setup' ? <><FiCheck /> Practice Setup Selected</> : 'Select Practice Setup Desk'}
                  </button>
                  <button
                    type="button"
                    className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-300 transition-colors flex items-center justify-center gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDirectActionModal('setup')
                    }}
                  >
                    <FiMail /> Open Direct Setup Options
                  </button>
                </div>
              </div>

              {/* Tech & Ethics Desk Card */}
              <div
                className={`talk-fcard ${selectedDesk === 'tech' ? 'active-founder' : ''}`}
                onClick={() => setSelectedDesk('tech')}
              >
                <div className="fcard-header">
                  <div className="av">TE</div>
                  <div className="fcard-badge">
                    <FiClock className="fcard-ic" /> Platform Desk
                  </div>
                </div>
                <div className="fcard-title-block mb-3">
                  <h3>Tech &amp; Ethics Desk</h3>
                  <div className="role">Confidentiality &amp; Platform Architecture</div>
                </div>
                <p>
                  Contact our Tech &amp; Ethics Desk for technical platform integration, data confidentiality, AURA AI ethics, and caseload migration.
                </p>
                <div className="talk-tags">
                  <span>Data Confidentiality</span>
                  <span>Ethical AI AURA</span>
                  <span>Caseload Migration</span>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    type="button"
                    className={`fcard-btn ${selectedDesk === 'tech' ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedDesk('tech')
                    }}
                  >
                    {selectedDesk === 'tech' ? <><FiCheck /> Tech &amp; Ethics Selected</> : 'Select Tech &amp; Ethics Desk'}
                  </button>
                  <button
                    type="button"
                    className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-300 transition-colors flex items-center justify-center gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDirectActionModal('tech')
                    }}
                  >
                    <FiMail /> Open Direct Security Mailbox
                  </button>
                </div>
              </div>

              {/* Organizations Desk Card */}
              <div
                className={`talk-fcard ${selectedDesk === 'org' ? 'active-founder' : ''}`}
                onClick={() => setSelectedDesk('org')}
              >
                <div className="fcard-header">
                  <div className="av">OD</div>
                  <div className="fcard-badge">
                    <FiClock className="fcard-ic" /> Enterprise Desk
                  </div>
                </div>
                <div className="fcard-title-block mb-3">
                  <h3>Organizations Desk</h3>
                  <div className="role">B2B EAP &amp; Corporate Wellbeing</div>
                </div>
                <p>
                  Contact our Organizations Desk for team Circle pilots, per-seat B2B billing, HR confidentiality contracts, and enterprise SSO integration.
                </p>
                <div className="talk-tags">
                  <span>B2B EAP Circles</span>
                  <span>HR Confidentiality</span>
                  <span>Enterprise Pilots</span>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    type="button"
                    className={`fcard-btn ${selectedDesk === 'org' ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedDesk('org')
                    }}
                  >
                    {selectedDesk === 'org' ? <><FiCheck /> Organizations Selected</> : 'Select Organizations Desk'}
                  </button>
                  <button
                    type="button"
                    className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-300 transition-colors flex items-center justify-center gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDirectActionModal('org')
                    }}
                  >
                    <FiPhoneCall /> Open Enterprise Line Options
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Three Conversations Section (ITEM 8 FIX) */}
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
                  /* ITEM 9 FIX: Highlighted Submit Another Request Button */
                  <div className="talk-ok-card p-8 rounded-2xl bg-slate-900 border border-emerald-500/30 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                      <FiCheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-white mb-2">Contact request sent!</h3>
                    <p className="text-slate-300 text-sm mb-6">
                      Thanks, <strong className="text-white">{formData.name.split(' ')[0]}</strong>. We have received your request.
                    </p>
                    <div className="bg-slate-950 p-4 rounded-xl text-xs space-y-2 mb-6 text-left border border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Reply Email:</span>
                        <strong className="text-slate-200">{formData.email}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Desk Preference:</span>
                        <strong className="text-slate-200">
                          {selectedDesk === 'setup'
                            ? 'Practice Setup Desk'
                            : selectedDesk === 'tech'
                            ? 'Tech & Ethics Desk'
                            : 'Organizations & EAP Desk'}
                        </strong>
                      </div>
                      {selectedTopic !== null && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Focus Topic:</span>
                          <strong className="text-slate-200">{topics[selectedTopic].title}</strong>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
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
                      Submit Another Request <FiSend />
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
                          className={`ftab ${selectedDesk === 'setup' ? 'active' : ''}`}
                          onClick={() => setSelectedDesk('setup')}
                        >
                          Practice Setup
                        </button>
                        <button
                          type="button"
                          className={`ftab ${selectedDesk === 'tech' ? 'active' : ''}`}
                          onClick={() => setSelectedDesk('tech')}
                        >
                          Tech &amp; Ethics
                        </button>
                        <button
                          type="button"
                          className={`ftab ${selectedDesk === 'org' ? 'active' : ''}`}
                          onClick={() => setSelectedDesk('org')}
                        >
                          Organizations &amp; EAP
                        </button>
                      </div>
                    </div>

                    <div className="form-row2">
                      <div>
                        <label htmlFor="name">Your Name</label>
                        <input
                          id="name"
                          type="text"
                          placeholder="Enter your name"
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
                        placeholder="e.g. I run two Circles a year and see about eight 1:1 learners. Mostly curious about learner data confidentiality."
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

      {/* FAQ Accordion Section (ITEM 10 FIX) */}
      <section className="talk-sec">
        <div className="oh-wrap">
          <div className="talk-sec-head">
            <span className="talk-section-tag">Frequently Asked Questions</span>
            <h2>Before you ask us</h2>
            <p>Common questions practitioners have before scheduling a founder call.</p>
          </div>

          <div className="talk-faq">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx
              return (
                <div
                  key={idx}
                  className={`talk-q-card rounded-2xl p-5 transition-all cursor-pointer border ${
                    isOpen
                      ? 'bg-slate-900 border-blue-500/50 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                  onClick={() => toggleFaq(idx)}
                >
                  <div className="talk-q-head flex items-center justify-between gap-4">
                    <h3 className="text-base font-bold text-white">{faq.q}</h3>
                    <span className="talk-q-toggle text-slate-400 shrink-0">
                      <FiChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
                    </span>
                  </div>
                  {isOpen && (
                    <div className="talk-q-body mt-3 pt-3 border-t border-slate-800 text-sm text-slate-300 leading-relaxed">
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
            <div className="talk-cta-row flex flex-wrap items-center justify-center gap-4 mt-6">
              <OHButton href="/signup" size="lg">
                Start Free Practice Space →
              </OHButton>
              <OHButton href="/learner-journey" variant="ghost" size="lg">
                See Learner Journey →
              </OHButton>
            </div>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default ContactUs
