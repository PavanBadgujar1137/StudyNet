import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OHNav, OHFooter, OHButton, OHEyebrow, OHCard } from '../components/openhand'
import toast from 'react-hot-toast'
import './PractitionerOnboarding.css'

export function PractitionerOnboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    handle: '',
    credentials: '',
    bio: '',
    offerTitle: '',
    offerType: 'session',
    offerPrice: 2500,
    panNumber: '',
    accountNumber: '',
    ifsc: '',
  })

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleNext = async (e) => {
    e?.preventDefault()
    if (step === 1 && !formData.handle) {
      toast.error("Please claim a unique handle for your practice link.")
      return
    }
    if (step === 2 && !formData.offerTitle) {
      toast.error("Please name your first offer.")
      return
    }
    if (step < 4) {
      setStep((prev) => prev + 1)
    } else {
      toast.success("Practice space set up! Your profile is submitted for verification.")
      navigate('/practice/dashboard')
    }
  }

  return (
    <div className="oh-onboarding-page">

      <main className="oh-wrap onboarding-content">
        <div className="onboarding-header">
          <OHEyebrow>Practitioner Setup</OHEyebrow>
          <h1>Set up your practice space</h1>
          <p className="sub">Four quick steps to launch your space on openhand.live</p>
        </div>

        {/* 4-Step Ribbon Progress */}
        <div className="ribbon-bar" role="progressbar" aria-valuenow={step} aria-valuemin="1" aria-valuemax="4">
          {[
            { n: 1, label: 'Claim handle', time: '~3 mins' },
            { n: 2, label: 'Add first offer', time: '~6 mins' },
            { n: 3, label: 'Connect payout', time: '~5 mins' },
            { n: 4, label: 'Share link', time: '~1 min' },
          ].map((s) => (
            <div key={s.n} className={`ribbon-step ${step >= s.n ? 'active' : ''}`}>
              <div className="step-circle">{s.n}</div>
              <div className="step-info">
                <span className="step-label">{s.label}</span>
                <span className="step-time">{s.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Step Cards */}
        <OHCard surface="white" pad="lg" className="step-form-card">
          {step === 1 && (
            <form onSubmit={handleNext} className="step-body">
              <h2>Step 1: Claim your space handle</h2>
              <p>Your unique booking URL where clients find your profile and book sessions.</p>
              
              <div className="form-group">
                <label htmlFor="handle">Your practice handle</label>
                <div className="input-handle-prefix">
                  <span>openhand.live/</span>
                  <input
                    id="handle"
                    name="handle"
                    type="text"
                    value={formData.handle}
                    onChange={handleChange}
                    placeholder="dr-meera"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="credentials">Credentials & Specialities</label>
                <input
                  id="credentials"
                  name="credentials"
                  type="text"
                  value={formData.credentials}
                  onChange={handleChange}
                  placeholder="e.g. Clinical Psychologist · 12 yrs"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio description</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Two or three sentences describing what you help people with..."
                />
              </div>

              <div className="btn-row">
                <OHButton type="submit">Continue to Add Offer →</OHButton>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNext} className="step-body">
              <h2>Step 2: Add your first offer</h2>
              <p>A single 1:1 session, a circle, or a self-paced program. You can add more later.</p>

              <div className="form-group">
                <label htmlFor="offerType">Offer format</label>
                <select id="offerType" name="offerType" value={formData.offerType} onChange={handleChange}>
                  <option value="session">1:1 Session (Paid per booking)</option>
                  <option value="circle">Circle (Live cohort, capped seats)</option>
                  <option value="program">Program (Self-paced video modules)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="offerTitle">Offer title</label>
                <input
                  id="offerTitle"
                  name="offerTitle"
                  type="text"
                  value={formData.offerTitle}
                  onChange={handleChange}
                  placeholder="e.g. 50-Minute Therapy Consultation"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="offerPrice">Price (₹ INR)</label>
                <input
                  id="offerPrice"
                  name="offerPrice"
                  type="number"
                  value={formData.offerPrice}
                  onChange={handleChange}
                  min="0"
                  step="100"
                />
              </div>

              <div className="btn-row">
                <OHButton variant="ghost" onClick={() => setStep(1)}>← Back</OHButton>
                <OHButton type="submit">Continue to Payouts →</OHButton>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleNext} className="step-body">
              <h2>Step 3: Connect payout bank details</h2>
              <p>Direct T+2 settlements to your bank via Razorpay & Stripe. No platform wallets.</p>

              <div className="form-group">
                <label htmlFor="panNumber">PAN Card Number</label>
                <input
                  id="panNumber"
                  name="panNumber"
                  type="text"
                  value={formData.panNumber}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="accountNumber">Bank Account Number</label>
                <input
                  id="accountNumber"
                  name="accountNumber"
                  type="password"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="91823901823"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ifsc">IFSC Code</label>
                <input
                  id="ifsc"
                  name="ifsc"
                  type="text"
                  value={formData.ifsc}
                  onChange={handleChange}
                  placeholder="HDFC0001234"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="btn-row">
                <OHButton variant="ghost" onClick={() => setStep(2)}>← Back</OHButton>
                <OHButton type="submit">Complete Setup →</OHButton>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="step-body finish-step">
              <h2>🎉 Your practice link is live!</h2>
              <p className="lead-link">openhand.live/{formData.handle || 'yourname'}</p>

              <p className="notice-box">
                🛡 Your profile has been submitted to the Admin verification queue. Your verified credential badge will activate as soon as verification completes!
              </p>

              <div className="btn-row">
                <OHButton onClick={() => navigate('/practice/dashboard')}>
                  Go to Practitioner Dashboard →
                </OHButton>
              </div>
            </div>
          )}
        </OHCard>
      </main>

      <OHFooter />
    </div>
  )
}

export default PractitionerOnboarding
