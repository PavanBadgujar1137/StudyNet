import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import {
  OHFooter,
  OHButton,
  OHEyebrow,
  OHRangeCalculator,
} from '../../components/openhand'
import { apiConnector } from '../../services/apiConnector'

export function Pricing() {
  const [openFaq, setOpenFaq] = useState(null)
  const [payingPlan, setPayingPlan] = useState(null)
  const [subStatus, setSubStatus] = useState(null)

  const { token } = useSelector(s => s.auth)

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await apiConnector('GET', '/api/v1/plans')
        if (res?.data?.success) {
          console.log('Plans loaded:', res.data.plans)
        }
      } catch (e) {
        console.warn('Using default fallback plan math:', e)
      }
    }
    async function fetchSubscriptionStatus() {
      if (!token) return
      try {
        const res = await apiConnector('GET', '/api/v1/payment/subscription/mine', null, { Authorization: `Bearer ${token}` })
        if (res?.data?.success) {
          setSubStatus(res.data)
        }
      } catch (e) {
        console.warn('Sub status fetch error:', e)
      }
    }
    fetchPlans()
    fetchSubscriptionStatus()
  }, [token])

  // Helper to load Razorpay Checkout SDK dynamically
  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  // Handle Pay Now for any plan via backend Razorpay order API
  const handlePayNow = async (planKey) => {
    try {
      setPayingPlan(planKey)
      const isLoaded = await loadRazorpaySDK()
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load. Please check your network.')
        setPayingPlan(null)
        return
      }

      // 1. Create order in backend
      const res = await apiConnector('POST', '/api/v1/plans/create-order', { planKey })
      if (!res?.data?.success) {
        toast.error(res?.data?.message || 'Could not initiate plan order')
        setPayingPlan(null)
        return
      }

      const { order, key, planName } = res.data

      // 2. Open Razorpay Checkout modal
      const options = {
        key: key || 'rzp_test_TDhFSRuAl18Gcb',
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'OpenHand Practice Platform',
        description: `Subscription: ${planName}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Verify payment signature in backend
            const verifyRes = await apiConnector('POST', '/api/v1/plans/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planKey,
            })

            if (verifyRes?.data?.success) {
              toast.success(`🎉 Payment Verified! Welcome to ${planName}.`)
            } else {
              toast.error(verifyRes?.data?.message || 'Payment verification failed.')
            }
          } catch (err) {
            console.error('Verification error:', err)
            toast.error('Payment verification failed.')
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#4F46E5',
        },
      }

      const rzpModal = new window.Razorpay(options)
      rzpModal.open()
    } catch (err) {
      console.error('PayNow error:', err)
      toast.error('Payment launch failed. Try again.')
    } finally {
      setPayingPlan(null)
    }
  }

  // Client savings calculator compute logic
  const calcCompute = (val) => {
    const sessions = val.sessionsPerMonth || 0
    const rate = val.sessionRate || 0
    const courses = val.coursesEnrolled || 0

    // Pay-as-you-go cost (without membership):
    const standalone = sessions * rate + courses * 1500

    // Starter Plan (₹999/mo + full session fee, core courses free):
    const starterCost = 999 + sessions * rate

    // Growth Plan (₹2,999/mo + 15% off sessions, all courses free):
    const growthCost = 2999 + sessions * (rate * 0.85)

    // Master Plan (₹5,999/mo + 1 free session + 25% off extra sessions, all courses free):
    const extraSessions = Math.max(0, sessions - 1)
    const masterCost = 5999 + extraSessions * (rate * 0.75)

    let bestPlan = 'Pay-As-You-Go'
    let bestCost = standalone

    if (starterCost < bestCost) { bestPlan = 'Starter Plan'; bestCost = starterCost }
    if (growthCost < bestCost) { bestPlan = 'Growth Plan'; bestCost = growthCost }
    if (masterCost < bestCost) { bestPlan = 'Master VIP Plan'; bestCost = masterCost }

    const savings = Math.max(0, standalone - bestCost)

    return {
      gross: standalone,
      fee: bestCost,
      net: savings,
      bestPlan,
    }
  }

  const calcSliders = [
    { id: 'sessionsPerMonth', label: '1:1 sessions per month', min: 0, max: 10, value: 2 },
    { id: 'sessionRate', label: 'Average practitioner session fee', min: 1000, max: 10000, step: 250, value: 2500, format: (v) => `₹${v.toLocaleString('en-IN')}` },
    { id: 'coursesEnrolled', label: 'Practitioner courses / cohorts per month', min: 0, max: 5, value: 1 },
  ]

  const faqs = [
    {
      cat: 'Membership & Access',
      q: 'How does the client membership work?',
      a: 'Your client membership grants you instant access to practitioner-led courses, live group circles, daily reflection tools, AURA AI insights, and exclusive member discounts on 1:1 sessions.',
    },
    {
      cat: 'Session Perks',
      q: 'How do 1:1 session discounts work?',
      a: 'As a Growth (15% OFF) or Master subscriber (25% OFF + 1 Free session/month), your discounts are automatically calculated and applied at checkout when booking sessions with any verified practitioner.',
    },
    {
      cat: 'Flexibility & Cancellation',
      q: 'Can I change or cancel my plan anytime?',
      a: 'Yes, you can upgrade, downgrade, or cancel your membership at any time. There are no lock-in periods, hidden charges, or cancellation penalties.',
    },
    {
      cat: 'Family Access',
      q: 'Can I share my plan with family members?',
      a: 'Yes! The Master Plan includes family sharing for up to 3 sub-accounts, allowing your family members to access courses, group circles, and wellness tools under one subscription.',
    },
    {
      cat: 'Privacy & Security',
      q: 'Is my personal reflection and session data confidential?',
      a: '100% confidential. Your check-ins, journal prompts, and AURA AI notes are end-to-end encrypted and completely private to you.',
    },
    {
      cat: 'Payments',
      q: 'What payment methods do you accept?',
      a: 'We accept all major Indian and global payment options through Razorpay — including UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Wallets.',
    },
  ]

  return (
    <div className="oh-pricing-page font-sans bg-slate-50 min-h-screen text-slate-900">

      {/* Hero */}
      <header className="oh-pricing-hero pt-14 pb-8 text-center bg-gradient-to-b from-white to-slate-50 border-b border-slate-100">
        <div className="oh-wrap max-w-5xl mx-auto px-4">
          <OHEyebrow>Transparent &amp; Fair Client Pricing</OHEyebrow>
          <h1 className="whitespace-nowrap text-center w-full mx-auto text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight my-4">
            Invest in your wellness. <span className="oh-grad-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Care built around you.</span>
          </h1>
          <p className="sub text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-6">
            Choose the client membership plan that fits your personal care journey. Unlock practitioner courses, live group circles, daily check-ins, and AURA AI guidance.
          </p>

          {/* User Trial & Subscription Status Banner */}
          {token && subStatus && (
            <div className="max-w-xl mx-auto mt-4 p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between gap-4 shadow-sm"
              style={{
                background: subStatus.hasActiveSubscription ? '#F0FDF4' : subStatus.isTrialActive ? '#F3E8FF' : '#FEF2F2',
                borderColor: subStatus.hasActiveSubscription ? '#BBF7D0' : subStatus.isTrialActive ? '#E9D5FF' : '#FCA5A5',
                color: subStatus.hasActiveSubscription ? '#166534' : subStatus.isTrialActive ? '#7E22CE' : '#DC2626',
              }}
            >
              <div>
                {subStatus.hasActiveSubscription ? (
                  <span>✨ Active Subscription: <strong>{subStatus.subscription?.planName || 'Paid Plan'}</strong></span>
                ) : subStatus.isTrialActive ? (
                  <span>⚡ 7-Day Free Trial Active: <strong>{subStatus.trialDaysRemaining} days remaining</strong></span>
                ) : (
                  <span>⚠️ 7-Day Free Trial Expired — Subscribe below to unlock all features</span>
                )}
              </div>
              <a href="#plans" className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all text-nowrap">
                {subStatus.hasActiveSubscription ? 'Switch Plan' : 'Select Plan'}
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Plans Grid */}
      <section className="oh-sec py-12" id="plans">
        <div className="oh-wrap max-w-[1360px] mx-auto px-4">
          <div className="plans-grid grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
            
            {/* Starter Plan */}
            <div className="plan-card bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Starter Plan</h3>
                <p className="who text-slate-600 text-sm mb-6 min-h-[42px] font-medium leading-relaxed">
                  For individuals starting their personal wellness &amp; mental health journey.
                </p>
                <div className="price-tag text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  ₹999<small className="text-slate-500 font-medium text-base"> /month</small>
                </div>
                <div className="cut-badge bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider py-2 px-3.5 rounded-xl mb-6 inline-flex items-center gap-2 border border-blue-100">
                  Essential Client Membership
                </div>
                <ul className="plan-features text-slate-700 text-sm space-y-3 mb-8">
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Access to core practitioner courses &amp; library</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> 1 Monthly group circle pass included</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Daily mood check-ins &amp; guided prompts</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Personal AI health &amp; reflection assistant (AURA)</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Standard 1:1 session booking access</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Secure digital health record vault</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2.5">
                <OHButton
                  onClick={() => handlePayNow('starter')}
                  disabled={payingPlan === 'starter'}
                  fullWidth
                  size="lg"
                >
                  {payingPlan === 'starter' ? 'Opening Razorpay...' : 'Subscribe to Starter — ₹999'}
                </OHButton>
              </div>
            </div>

            {/* Growth Plan (Featured) */}
            <div className="plan-card feat-card relative bg-slate-900 text-white border-2 border-indigo-500 rounded-3xl p-8 shadow-2xl transition-all flex flex-col justify-between transform -translate-y-2">
              <span className="featured-badge absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-5 rounded-full shadow-lg whitespace-nowrap">
                Most Popular Client Choice
              </span>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 mt-2">Growth Plan</h3>
                <p className="who text-slate-300 text-sm mb-6 min-h-[42px] font-normal leading-relaxed">
                  For active wellness seekers wanting full access to courses, circles, and session discounts.
                </p>
                <div className="price-tag text-4xl font-extrabold text-white mb-3 tracking-tight">
                  ₹2,999<small className="text-slate-300 font-medium text-base"> /month</small>
                </div>
                <div className="cut-badge bg-indigo-900/60 text-sky-300 font-bold text-xs uppercase tracking-wider py-2 px-3.5 rounded-xl mb-6 inline-flex items-center gap-2 border border-indigo-500/30">
                  Full Access + 15% OFF Sessions
                </div>
                <ul className="plan-features text-slate-200 text-sm space-y-3 mb-8">
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> Everything in Starter Plan</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> Unlimited access to ALL practitioner courses</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> Unlimited access to live group circles</li>
                  <li className="flex items-center gap-2.5 font-semibold text-white"><span className="text-sky-400 font-bold text-base">✓</span> <b>15% discount on all 1:1 sessions</b></li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> Live in-session AURA companion &amp; insights</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> Priority session scheduling &amp; waitlist bypass</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> Monthly companion pass for a friend</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2.5">
                <OHButton
                  onClick={() => handlePayNow('growth')}
                  disabled={payingPlan === 'growth'}
                  fullWidth
                  size="lg"
                >
                  {payingPlan === 'growth' ? 'Opening Razorpay...' : 'Subscribe to Growth — ₹2,999'}
                </OHButton>
              </div>
            </div>

            {/* Master VIP Plan */}
            <div className="plan-card bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Master VIP Plan</h3>
                <p className="who text-slate-600 text-sm mb-6 min-h-[42px] font-medium leading-relaxed">
                  For complete wellbeing coverage with dedicated care, free monthly session, and VIP perks.
                </p>
                <div className="price-tag text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  ₹5,999<small className="text-slate-500 font-medium text-base"> /month</small>
                </div>
                <div className="cut-badge bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider py-2 px-3.5 rounded-xl mb-6 inline-flex items-center gap-2 border border-emerald-100">
                  1 Free 1:1 Session + 25% OFF Extra
                </div>
                <ul className="plan-features text-slate-700 text-sm space-y-3 mb-8">
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Everything in Growth Plan</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> <b>1 Free 1:1 private session included / mo</b></li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> <b>25% discount on additional 1:1 sessions</b></li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Dedicated care manager &amp; concierge support</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Family sharing (up to 3 family sub-accounts)</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Custom wellness path &amp; biometric analytics</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> 24/7 Priority health helpline</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2.5">
                <OHButton
                  onClick={() => handlePayNow('master')}
                  disabled={payingPlan === 'master'}
                  fullWidth
                  size="lg"
                >
                  {payingPlan === 'master' ? 'Opening Razorpay...' : 'Subscribe to Master — ₹5,999'}
                </OHButton>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Client Savings Calculator */}
      <section className="oh-sec py-12" id="calculator">
        <div className="oh-wrap max-w-[1240px] mx-auto px-4">
          <div className="sec-head text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3">Calculate your monthly client savings</h2>
            <p className="text-slate-600 text-base font-medium leading-relaxed">
              Drag the sliders below to estimate your savings on 1:1 sessions, courses, and group circles with OpenHand client memberships.
            </p>
          </div>
          <OHRangeCalculator
            sliders={calcSliders}
            compute={calcCompute}
            note="Estimates based on standard standalone session & course prices vs OpenHand client membership benefits. Payment gateway charges and taxes are processed at checkout."
          />
        </div>
      </section>

      {/* Comparison Table */}
      <section className="oh-sec py-12" id="compare">
        <div className="oh-wrap max-w-[1240px] mx-auto px-4">
          <div className="sec-head text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3">Why clients choose OpenHand membership</h2>
            <p className="text-slate-600 text-base font-medium leading-relaxed">
              Compare OpenHand client subscriptions against traditional pay-as-you-go platforms and standalone sessions.
            </p>
          </div>
          
          <div className="cmp-table-wrap overflow-x-auto bg-white border border-slate-200 rounded-3xl shadow-sm">
            <table className="cmp-table w-full border-collapse text-sm min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-4 text-left font-bold text-slate-700 bg-slate-50">Feature / Benefit</th>
                  <th className="us-col p-4 text-left font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600">OpenHand Membership</th>
                  <th className="p-4 text-left font-bold text-slate-700 bg-slate-50">Standalone Pay-As-You-Go</th>
                  <th className="p-4 text-left font-bold text-slate-700 bg-slate-50">Standard Apps</th>
                  <th className="p-4 text-left font-bold text-slate-700 bg-slate-50">Traditional Offline Care</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr><td className="p-4 font-semibold text-slate-900">Monthly Subscription Starting Price</td><td className="us-col p-4 font-bold text-blue-700 bg-blue-50/70">₹999/mo</td><td className="p-4 text-slate-600">No subscription</td><td className="p-4 text-slate-600">Varies per platform</td><td className="p-4 text-slate-600">No subscription option</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Practitioner Courses Library</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Included in Growth &amp; Master</td><td className="p-4 text-slate-600">₹1,500+ / course</td><td className="p-4 text-slate-600">Pay per course</td><td className="no p-4 text-slate-400">✕ N/A</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Live Group Circles &amp; Cohorts</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Unlimited in Growth &amp; Master</td><td className="p-4 text-slate-600">₹800+ / circle</td><td className="no p-4 text-slate-400">✕ Extra charge</td><td className="no p-4 text-slate-400">✕ N/A</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">1:1 Session Discounts</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ 15%–25% OFF + 1 Free/mo on Master</td><td className="no p-4 text-slate-400">✕ 0% discount</td><td className="no p-4 text-slate-400">✕ 0% discount</td><td className="no p-4 text-slate-400">✕ Full fee always</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Personal AI Companion (AURA)</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Included in all plans</td><td className="no p-4 text-slate-400">✕ N/A</td><td className="no p-4 text-slate-400">✕ N/A</td><td className="no p-4 text-slate-400">✕ N/A</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Daily Reflection &amp; Mood Check-ins</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Included in all plans</td><td className="no p-4 text-slate-400">✕ N/A</td><td className="no p-4 text-slate-400">✕ N/A</td><td className="no p-4 text-slate-400">✕ N/A</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Family Account Sharing</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Up to 3 sub-accounts on Master</td><td className="no p-4 text-slate-400">✕ N/A</td><td className="no p-4 text-slate-400">✕ N/A</td><td className="no p-4 text-slate-400">✕ N/A</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 2-Column FAQ Grid */}
      <section className="oh-sec py-12" id="faq">
        <div className="oh-wrap max-w-[1240px] mx-auto px-4">
          <div className="sec-head text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3">Frequently asked client questions</h2>
            <p className="text-slate-600 text-base font-medium">Clear answers about client membership access, session perks, family sharing, and privacy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i
              return (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-blue-300 transition-all cursor-pointer"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                      {f.cat}
                    </span>
                    <span className="text-slate-400 font-bold text-lg">
                      {isOpen ? '−' : '+'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                    {f.q}
                  </h3>
                  <p className={`text-slate-700 text-sm leading-relaxed font-medium ${isOpen ? 'block' : 'line-clamp-2'}`}>
                    {f.a}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="oh-sec py-16 bg-gradient-to-b from-slate-50 to-white text-center border-t border-slate-200">
        <div className="oh-wrap max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Start your personal care journey today.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
            Subscribe to an OpenHand client plan or find a practitioner to get started. Switch or cancel anytime.
          </p>
          <div className="cta-row flex flex-wrap items-center justify-center gap-4">
            <OHButton href="#plans" size="lg">Choose a Client Plan</OHButton>
            <OHButton href="/find-a-practitioner" variant="ghost" size="lg">Find a Practitioner →</OHButton>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default Pricing
