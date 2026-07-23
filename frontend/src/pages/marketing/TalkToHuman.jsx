import React, { useState } from 'react'
import {
  OHNav,
  OHFooter,
  OHButton,
  OHEyebrow,
  OHCard,
} from '../../components/openhand'
import { apiConnector } from '../../services/apiConnector'
import toast from 'react-hot-toast'
import './TalkToHuman.css'

export function TalkToHuman() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    workType: 'Life or executive coaching',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      toast.error('Add your name and email so we can reply.')
      return
    }

    setLoading(true)
    try {
      const res = await apiConnector('POST', '/api/v1/reach/contact', {
        name: formData.name,
        email: formData.email,
        workType: formData.workType,
        message: formData.message,
        meetingType: 'Requested Call',
      })

      if (res?.data?.success) {
        setSubmitted(true)
        toast.success('Conversation request sent!')
      }
    } catch (err) {
      console.error('Talk to human submit error:', err)
      toast.error('Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="oh-t2h-page">

      {/* Hero */}
      <header className="oh-talk-hero">
        <div className="oh-wrap">
          <OHEyebrow>Step three of three</OHEyebrow>
          <h1>
            Talk to <span className="oh-grad-text">a real human.</span>
          </h1>
          <p className="sub">
            Not a chatbot, not an SDR reading a script. One of the two people who built this, for twenty-five minutes, about your practice specifically.
          </p>
        </div>
      </header>

      {/* Founders */}
      <section className="oh-sec">
        <div className="oh-wrap">
          <div className="founders-grid">
            <OHCard surface="white" pad="lg" className="founder-card">
              <div className="founder-av">AN</div>
              <h3>Dr. Anamika</h3>
              <div className="founder-role">Co-founder · IIT Bombay</div>
              <p>Talk to Anamika if your questions are about the practice itself — how to shape a cohort, what to charge, whether your material works as a six-week container or a self-paced program.</p>
            </OHCard>

            <OHCard surface="white" pad="lg" className="founder-card">
              <div className="founder-av">RP</div>
              <h3>Dr. Rajendra Patil</h3>
              <div className="founder-role">Co-founder</div>
              <p>Talk to Rajendra if your questions are about the harder edges — client confidentiality, ethical use of the in-session co-pilot, working with organisations, or moving an existing caseload across.</p>
            </OHCard>
          </div>
        </div>
      </section>

      {/* Three Ways */}
      <section className="oh-sec">
        <div className="oh-wrap">
          <div className="sec-head">
            <h2>Three conversations we actually have</h2>
            <p>Pick whichever is closest. We'll adjust once we're talking.</p>
          </div>

          <div className="oh-grid-3">
            <OHCard surface="white" pad="lg" className="way-card">
              <span className="dur-tag">25 minutes</span>
              <h3>"I'm not sure this fits my practice"</h3>
              <p>You work in a specific way — somatic, narrative, faith-based, group-only — and you've been burned by tools that assumed you sell courses.</p>
              <ul>
                <li>We look at your actual format</li>
                <li>We'll tell you if we're wrong for you</li>
                <li>No deck, no demo unless you ask</li>
              </ul>
            </OHCard>

            <OHCard surface="white" pad="lg" className="way-card">
              <span className="dur-tag">40 minutes</span>
              <h3>"I have clients already — how do I move?"</h3>
              <p>You're running on WhatsApp, Google Meet, a spreadsheet, and a payment link. It works, and it's exhausting.</p>
              <ul>
                <li>Migration mapped step by step</li>
                <li>Your existing clients, moved for you</li>
                <li>Nothing goes live until you say so</li>
              </ul>
            </OHCard>

            <OHCard surface="white" pad="lg" className="way-card">
              <span className="dur-tag">45 minutes</span>
              <h3>"We want this for our employees"</h3>
              <p>You're an HR or people lead. Your EAP exists, nobody uses it, and you need something people will actually open.</p>
              <ul>
                <li>Pilot scoped for one team first</li>
                <li>Reporting that respects confidentiality</li>
                <li>Practitioner panel, or bring your own</li>
              </ul>
            </OHCard>
          </div>
        </div>
      </section>

      {/* Real Form Section */}
      <section className="oh-sec" id="book">
        <div className="oh-wrap">
          <OHCard surface="navy" pad="lg" className="talk-form-card">
            <div className="form-two-col">
              <div className="form-info">
                <h2>Book a conversation</h2>
                <p className="form-sub">Tell us roughly where you are. We'll send two or three times that work, in your timezone.</p>
                <div className="assure-list">
                  <div className="assure-item">
                    <span className="chk">✓</span>
                    <p>A founder joins the call. Every time — not "someone from the team."</p>
                  </div>
                  <div className="assure-item">
                    <span className="chk">✓</span>
                    <p>If OpenHand isn't right for your practice, we'll say so and point you elsewhere.</p>
                  </div>
                  <div className="assure-item">
                    <span className="chk">✓</span>
                    <p>No follow-up sequence. One reply from us, then it's your move.</p>
                  </div>
                </div>
              </div>

              <div className="form-fields-wrap">
                {submitted ? (
                  <div className="submitted-success">
                    <h3>Thanks, {formData.name.split(' ')[0]}.</h3>
                    <p>We'll send two or three times to <strong>{formData.email}</strong> within one working day.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="talk-form">
                    <div className="field-group">
                      <label htmlFor="name">Your name</label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Dr. Anamika"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="field-group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="you@practice.in"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="field-group">
                      <label htmlFor="workType">What kind of work do you do?</label>
                      <select id="workType" value={formData.workType} onChange={handleChange}>
                        <option>Life or executive coaching</option>
                        <option>Counselling or psychotherapy</option>
                        <option>Relationship or family work</option>
                        <option>Wellness, healing or somatic practice</option>
                        <option>Organisational / employee wellbeing</option>
                        <option>Something else</option>
                      </select>
                    </div>

                    <div className="field-group">
                      <label htmlFor="message">Anything we should know before the call?</label>
                      <textarea
                        id="message"
                        rows="3"
                        placeholder="I run two cohorts a year and see about eight 1:1 clients. Mostly worried about client data."
                        value={formData.message}
                        onChange={handleChange}
                      />
                    </div>

                    <OHButton type="submit" disabled={loading} fullWidth size="lg">
                      {loading ? 'Sending request…' : 'Request a time'}
                    </OHButton>

                    <p className="fineprint-text">We reply within one working day. Your details stay with us — no lists, no resale.</p>
                  </form>
                )}
              </div>
            </div>
          </OHCard>
        </div>
      </section>

      {/* FAQ */}
      <section className="oh-sec">
        <div className="oh-wrap narrow">
          <div className="sec-head"><h2>Before you ask us</h2></div>
          <div className="faq-list">
            <div className="q-item">
              <h3>Do I have to talk to anyone to start?</h3>
              <p>No. The free plan opens without a call, a card, or a demo. This page exists for people who want a human first — not as a gate in front of the product.</p>
            </div>
            <div className="q-item">
              <h3>Is my client data safe if I move here?</h3>
              <p>Client records are encrypted, access-controlled per practitioner, and never used to train external models. Bring this up on the call — Rajendra will walk you through exactly where data sits and what you can delete.</p>
            </div>
            <div className="q-item">
              <h3>What if I already use TagMango, Topmate or my own site?</h3>
              <p>Plenty of practitioners run both for a while. We'll help you move your calendar, your offers, and your existing clients without a hard cutover date.</p>
            </div>
            <div className="q-item">
              <h3>Can I turn the in-session co-pilot off?</h3>
              <p>Yes, entirely, at the account level or per session. It's opt-in for you and separately consented by your client. Sessions run perfectly well without it.</p>
            </div>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default TalkToHuman
