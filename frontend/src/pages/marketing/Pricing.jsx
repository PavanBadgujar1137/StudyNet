import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'react-hot-toast'
import {
  OHFooter,
  OHButton,
  OHEyebrow,
  OHCard,
  OHBreakevenChart,
  OHRangeCalculator,
} from '../../components/openhand'
import { apiConnector } from '../../services/apiConnector'

export function Pricing() {
  const [openFaq, setOpenFaq] = useState(null)
  const [payingPlan, setPayingPlan] = useState(null)

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
    fetchPlans()
  }, [])

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

      const { order, key, amount, planName } = res.data

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

  // Breakeven chart functions
  const breakevenPlans = [
    { name: 'Starter (₹999 + 8%)', color: '#2563EB', fn: (gross) => 999 + gross * 0.08 },
    { name: 'Growth (₹2,999 + 5%)', color: '#7C3AED', fn: (gross) => 2999 + gross * 0.05 },
    { name: 'Master (₹5,999 flat)', color: '#0D1B3D', fn: () => 5999 },
  ]

  // Calculator compute logic
  const calcCompute = (val) => {
    const clients = val.cIn || 0
    const price = val.pIn || 0
    const seats = val.sIn || 0
    const seatPrice = val.qIn || 0
    const members = val.mIn || 0

    const gross = clients * price + seats * seatPrice + members * 799
    const starter = 999 + gross * 0.08
    const growth = 2999 + gross * 0.05
    const master = 5999

    let bestPlan = 'Starter'
    let cost = starter
    if (growth < cost) { bestPlan = 'Growth'; cost = growth }
    if (master < cost) { bestPlan = 'Master'; cost = master }

    return {
      gross,
      fee: cost,
      net: gross - cost,
      bestPlan,
    }
  }

  const calcSliders = [
    { id: 'cIn', label: '1:1 clients per month', min: 0, max: 60, value: 12 },
    { id: 'pIn', label: 'Average session price', min: 500, max: 15000, step: 250, value: 2500, format: (v) => `₹${v.toLocaleString('en-IN')}` },
    { id: 'sIn', label: 'Circle seats sold per month', min: 0, max: 40, value: 0 },
    { id: 'qIn', label: 'Circle seat price', min: 2000, max: 60000, step: 1000, value: 15000, format: (v) => `₹${v.toLocaleString('en-IN')}` },
    { id: 'mIn', label: 'Monthly members', min: 0, max: 300, value: 0 },
  ]

  const faqs = [
    {
      cat: 'Billing & Fees',
      q: 'Is there a trial available?',
      a: "Yes. There's no time limit to explore. Practitioners can start on Starter or upgrade anytime to Growth or Master to unlock advanced tools and lower fees.",
    },
    {
      cat: 'Payouts',
      q: 'When does money reach my bank?',
      a: 'Two working days after the session or purchase, straight to your bank account — not to a platform wallet you have to withdraw from.',
    },
    {
      cat: 'Tax & Compliance',
      q: 'What about GST?',
      a: 'Invoices are generated GST-ready automatically. Whether you charge GST depends on your registration and turnover — that is a conversation for your accountant, not us.',
    },
    {
      cat: 'Flexibility',
      q: 'Can I downgrade or switch plans anytime?',
      a: 'Any time, effective the next billing cycle. Nothing is deleted, no data is lost, and your clients do not notice any interruption.',
    },
    {
      cat: 'Data Ownership',
      q: 'What happens to my client data if I leave?',
      a: 'You export everything — client records, notes, session history — and we delete our copy permanently on request. Your practice is 100% yours.',
    },
    {
      cat: 'Automatic Switch Alerts',
      q: 'Will you alert me when I should switch plans?',
      a: "Yes. We automatically email you the exact month your commission math crosses ₹2,999 and recommend upgrading to Growth so you save money.",
    },
  ]

  return (
    <div className="oh-pricing-page font-sans bg-slate-50 min-h-screen text-slate-900">

      {/* Hero */}
      <header className="oh-pricing-hero pt-14 pb-8 text-center bg-gradient-to-b from-white to-slate-50 border-b border-slate-100">
        <div className="oh-wrap max-w-5xl mx-auto px-4">
          <OHEyebrow>Transparent &amp; Fair Pricing</OHEyebrow>
          <h1 className="whitespace-nowrap text-center w-full mx-auto text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight my-4">
            Pay us <span className="oh-grad-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">only when you get paid.</span>
          </h1>
          <p className="sub text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            No setup fee. No hidden lock-in. Choose the plan that fits your stage, pay seamlessly via Razorpay, and switch anytime.
          </p>
        </div>
      </header>

      {/* Plans Grid */}
      <section className="oh-sec py-12" id="plans">
        <div className="oh-wrap max-w-[1360px] mx-auto px-4">
          <div className="plans-grid grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
            
            {/* Starter */}
            <div className="plan-card bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Starter</h3>
                <p className="who text-slate-600 text-sm mb-6 min-h-[42px] font-medium leading-relaxed">
                  For practitioners testing whether an online practice works at all.
                </p>
                <div className="price-tag text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  ₹999<small className="text-slate-500 font-medium text-base"> /month</small>
                </div>
                <div className="cut-badge bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider py-2 px-3.5 rounded-xl mb-6 inline-flex items-center gap-2 border border-blue-100">
                  Flat ₹999/mo + 8% fee
                </div>
                <ul className="plan-features text-slate-700 text-sm space-y-3 mb-8">
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Unlimited 1:1 sessions</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> One private circle</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> UPI, cards, net banking, Stripe</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Client check-ins &amp; reflection prompts</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Post-session AURA notes</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Listed in the practitioner directory</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2.5">
                <OHButton
                  onClick={() => handlePayNow('starter')}
                  disabled={payingPlan === 'starter'}
                  fullWidth
                  size="lg"
                >
                  {payingPlan === 'starter' ? 'Opening Razorpay...' : 'Pay ₹999 Now'}
                </OHButton>
              </div>
            </div>

            {/* Growth (Featured) */}
            <div className="plan-card feat-card relative bg-slate-900 text-white border-2 border-indigo-500 rounded-3xl p-8 shadow-2xl transition-all flex flex-col justify-between transform -translate-y-2">
              <span className="featured-badge absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-5 rounded-full shadow-lg whitespace-nowrap">
                Most Popular Practitioner Choice
              </span>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 mt-2">Growth</h3>
                <p className="who text-slate-300 text-sm mb-6 min-h-[42px] font-normal leading-relaxed">
                  For practitioners past ₹40,000/month who want the fee to stop stinging.
                </p>
                <div className="price-tag text-4xl font-extrabold text-white mb-3 tracking-tight">
                  ₹2,999<small className="text-slate-300 font-medium text-base"> /month</small>
                </div>
                <div className="cut-badge bg-indigo-900/60 text-sky-300 font-bold text-xs uppercase tracking-wider py-2 px-3.5 rounded-xl mb-6 inline-flex items-center gap-2 border border-indigo-500/30">
                  Flat ₹2,999/mo + 5% fee
                </div>
                <ul className="plan-features text-slate-200 text-sm space-y-3 mb-8">
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> Everything in Starter</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> Unlimited circles &amp; cohorts</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> Recurring memberships</li>
                  <li className="flex items-center gap-2.5 font-semibold text-white"><span className="text-sky-400 font-bold text-base">✓</span> <b>Live in-session AURA</b></li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> WhatsApp reminders &amp; broadcasts</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> GST-ready invoices</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-sky-400 font-bold text-base">✓</span> Priority placement in directory</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2.5">
                <OHButton
                  onClick={() => handlePayNow('growth')}
                  disabled={payingPlan === 'growth'}
                  fullWidth
                  size="lg"
                >
                  {payingPlan === 'growth' ? 'Opening Razorpay...' : 'Pay ₹2,999 Now'}
                </OHButton>
              </div>
            </div>

            {/* Master */}
            <div className="plan-card bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Master</h3>
                <p className="who text-slate-600 text-sm mb-6 min-h-[42px] font-medium leading-relaxed">
                  For established practices running multiple cohorts under their own brand.
                </p>
                <div className="price-tag text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  ₹5,999<small className="text-slate-500 font-medium text-base"> /month</small>
                </div>
                <div className="cut-badge bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider py-2 px-3.5 rounded-xl mb-6 inline-flex items-center gap-2 border border-emerald-100">
                  0% — you keep 100% of earnings
                </div>
                <ul className="plan-features text-slate-700 text-sm space-y-3 mb-8">
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Everything in Growth</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Your own branded app (iOS + Android)</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Custom domain</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Team seats for associate practitioners</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Advanced client analytics</li>
                  <li className="flex items-center gap-2.5 font-medium"><span className="text-emerald-600 font-bold text-base">✓</span> Named support contact</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2.5">
                <OHButton
                  onClick={() => handlePayNow('master')}
                  disabled={payingPlan === 'master'}
                  fullWidth
                  size="lg"
                >
                  {payingPlan === 'master' ? 'Opening Razorpay...' : 'Pay ₹5,999 Now'}
                </OHButton>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Breakeven Chart */}
      <section className="oh-sec py-12" id="breakeven">
        <div className="oh-wrap max-w-[1240px] mx-auto px-4">
          <div className="sec-head text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3">Where each plan stops making sense</h2>
            <p className="text-slate-600 text-base font-medium leading-relaxed">
              The lines cross twice. Below ₹30,000/month Starter wins. Above ₹1,00,000 you should be on Master. Here's the arithmetic, drawn.
            </p>
          </div>
          <OHCard surface="white" pad="lg" className="chart-card bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-1">What you pay OpenHand, by monthly earnings</h3>
            <p className="hint-text text-slate-500 text-sm mb-6">Lower is better. Where two lines cross is where you should switch plans.</p>
            <OHBreakevenChart plans={breakevenPlans} maxGross={200000} />
            <p className="disclaim-text text-xs text-slate-500 mt-6 max-w-2xl">Illustrative model. Payment gateway charges and GST are separate and depend on your registration status.</p>
          </OHCard>
        </div>
      </section>

      {/* Calculator */}
      <section className="oh-sec py-12" id="calculator">
        <div className="oh-wrap max-w-[1240px] mx-auto px-4">
          <div className="sec-head text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3">Calculate your exact earnings</h2>
            <p className="text-slate-600 text-base font-medium leading-relaxed">
              Drag the sliders below to see your net income after OpenHand fees and find your recommended plan automatically.
            </p>
          </div>
          <OHRangeCalculator
            sliders={calcSliders}
            compute={calcCompute}
            note="Illustrative only — this is arithmetic, not a projection. Assumes ₹799/month membership pricing. Payment gateway charges and GST are additional; check with your accountant."
          />
        </div>
      </section>

      {/* Comparison Table */}
      <section className="oh-sec py-12" id="compare">
        <div className="oh-wrap max-w-[1240px] mx-auto px-4">
          <div className="sec-head text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3">How we compare</h2>
            <p className="text-slate-600 text-base font-medium leading-relaxed">
              Honest version: on fees alone, we're mid-market. We're not trying to be the cheapest — we're the only one built for people whose clients disclose things that matter.
            </p>
          </div>
          
          <div className="cmp-table-wrap overflow-x-auto bg-white border border-slate-200 rounded-3xl shadow-sm">
            <table className="cmp-table w-full border-collapse text-sm min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-4 text-left font-bold text-slate-700 bg-slate-50">Feature / Capability</th>
                  <th className="us-col p-4 text-left font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600">OpenHand</th>
                  <th className="p-4 text-left font-bold text-slate-700 bg-slate-50">TagMango</th>
                  <th className="p-4 text-left font-bold text-slate-700 bg-slate-50">Topmate</th>
                  <th className="p-4 text-left font-bold text-slate-700 bg-slate-50">AppX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr><td className="p-4 font-semibold text-slate-900">Starter tier price</td><td className="us-col p-4 font-bold text-blue-700 bg-blue-50/70">₹999/mo + 8%</td><td className="p-4 text-slate-600">10%</td><td className="p-4 text-slate-600">No subscription fee</td><td className="p-4 text-slate-600">Varies by plan</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Zero-commission plan</td><td className="us-col p-4 font-bold text-blue-700 bg-blue-50/70">₹5,999/mo (Master)</td><td className="p-4 text-slate-600">Higher tiers + setup fee</td><td className="p-4 text-slate-400">—</td><td className="p-4 text-slate-600">Custom</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">UPI / Indian payments</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Yes</td><td className="yes p-4 font-semibold text-slate-700">✓ Yes</td><td className="yes p-4 font-semibold text-slate-700">✓ Yes</td><td className="yes p-4 font-semibold text-slate-700">✓ Yes</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Courses &amp; cohorts</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Yes</td><td className="yes p-4 font-semibold text-slate-700">✓ Yes</td><td className="yes p-4 font-semibold text-slate-700">✓ Yes</td><td className="yes p-4 font-semibold text-slate-700">✓ Yes</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Branded mobile app</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ On Master</td><td className="yes p-4 text-slate-600">On enterprise</td><td className="no p-4 text-slate-400">✕ No</td><td className="yes p-4 text-slate-600">Core offering</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Client check-ins &amp; mood tracking</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Yes</td><td className="no p-4 text-slate-400">✕ No</td><td className="no p-4 text-slate-400">✕ No</td><td className="no p-4 text-slate-400">✕ No</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Consent-gated session recording</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Yes</td><td className="no p-4 text-slate-400">✕ No</td><td className="no p-4 text-slate-400">✕ No</td><td className="no p-4 text-slate-400">✕ No</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Live in-session AI AURA</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Yes</td><td className="no p-4 text-slate-400">✕ No</td><td className="no p-4 text-slate-400">✕ No</td><td className="no p-4 text-slate-400">✕ No</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">Clinician-founded</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Two doctors</td><td className="no p-4 text-slate-400">✕ No</td><td className="no p-4 text-slate-400">✕ No</td><td className="no p-4 text-slate-400">✕ No</td></tr>
                <tr><td className="p-4 font-semibold text-slate-900">B2B employee wellbeing</td><td className="us-col yes p-4 font-bold text-blue-700 bg-blue-50/70">✓ Yes</td><td className="no p-4 text-slate-400">✕ No</td><td className="no p-4 text-slate-400">✕ No</td><td className="no p-4 text-slate-400">✕ No</td></tr>
              </tbody>
            </table>
          </div>
          <p className="disclaim-text text-xs text-slate-500 mt-4 leading-relaxed max-w-4xl">
            Comparison compiled from publicly available information in July 2026. Competitor pricing and features change frequently — check each provider's own site before making a decision. We'd rather you verify than take our word for it.
          </p>
        </div>
      </section>

      {/* 2-Column FAQ Grid */}
      <section className="oh-sec py-12" id="faq">
        <div className="oh-wrap max-w-[1240px] mx-auto px-4">
          <div className="sec-head text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3">Questions people actually ask</h2>
            <p className="text-slate-600 text-base font-medium">Clear answers about billing, payouts, taxes, data control, and plan upgrades.</p>
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
            Start on Starter. Switch when the maths says so.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
            We'll email you the month your commission passes ₹2,999 and tell you to upgrade. Yes, really.
          </p>
          <div className="cta-row flex flex-wrap items-center justify-center gap-4">
            <OHButton href="/start-free" size="lg">Start your practice space</OHButton>
            <OHButton href="/talk-to-human" variant="ghost" size="lg">Talk to a real human →</OHButton>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default Pricing
