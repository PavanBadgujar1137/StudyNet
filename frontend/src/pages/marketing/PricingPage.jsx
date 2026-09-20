import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  OHFooter,
  OHEyebrow,
  OHPricingSection,
} from '../../components/openhand'
import { 
  FiShield, 
  FiZap, 
  FiLock, 
  FiArrowRight, 
  FiCreditCard, 
  FiRefreshCw,
  FiChevronDown,
  FiMessageSquare,
  FiBookOpen,
  FiUserCheck,
  FiBriefcase
} from 'react-icons/fi'

export function PricingPage() {
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'learner' | 'practitioner' | 'payment'
  const [openFaq, setOpenFaq] = useState(0)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const allFaqs = [
    {
      category: 'learner',
      categoryTag: 'LEARNERS',
      icon: FiUserCheck,
      q: "How does the Learner 7-Day Free Trial work?",
      a: "When you sign up as a Learner, you automatically receive 7 days of free access to practitioner free courses, guided check-ins, and AURA AI tools. After 7 days, you can choose to subscribe to a Learner plan (Beginner ₹51/mo, Advance ₹151/mo, or Champion ₹1,500/mo) securely via Razorpay."
    },
    {
      category: 'practitioner',
      categoryTag: 'PRACTITIONERS',
      icon: FiBriefcase,
      q: "Do Practitioners get a free trial to set up their practice?",
      a: "Yes! All Practitioners get a 14-day free trial to explore the practice dashboard, set up 1:1 session offerings, draft courses, and test live circle containers. To publish live and accept client bookings, choose a Practitioner Plan (Starter ₹999/mo, Growth ₹2,999/mo, or Master ₹5,999/mo)."
    },
    {
      category: 'payment',
      categoryTag: 'PAYMENTS & SECURITY',
      icon: FiCreditCard,
      q: "How are payments processed and secured?",
      a: "All payments and monthly plan subscriptions are processed through Razorpay, India's leading PCI-DSS compliant payment gateway. We support UPI, Credit/Debit Cards, Net Banking, and Wallets with 256-bit encryption and instant subscription activation."
    },
    {
      category: 'payment',
      categoryTag: 'BILLING & CANCELLATION',
      icon: FiRefreshCw,
      q: "Can I switch, upgrade, or cancel my plan at any time?",
      a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your account dashboard. Upgrades apply immediately, while downgrades or cancellations take effect at the end of your current billing period."
    },
    {
      category: 'practitioner',
      categoryTag: 'PRACTITIONER EARNINGS',
      icon: FiZap,
      q: "How do Practitioner earnings and payouts work?",
      a: "Earnings from paid 1:1 sessions and paid courses are automatically recorded in your financial dashboard. The platform credits your earnings ledger, and salary disbursements are transferred directly to your bank account."
    },
    {
      category: 'payment',
      categoryTag: 'ORGANIZATIONS',
      icon: FiShield,
      q: "Are there custom plans for clinics, hospitals, or organizations?",
      a: "Yes! We offer tailored Organization & Enterprise plans with team seats, central HR/Admin billing, aggregate wellbeing insights, and dedicated account support. Visit our For Organizations page to request a custom rollout."
    }
  ]

  const filteredFaqs = activeTab === 'all' 
    ? allFaqs 
    : allFaqs.filter(item => item.category === activeTab)

  return (
    <div className="oh-marketing-page min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans">
      <main className="flex-1">
        
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <header className="oh-pricing-hero pt-14 pb-12 text-center bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200/70 relative overflow-hidden">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="oh-wrap max-w-5xl mx-auto px-4 relative z-10">
            <OHEyebrow>OpenHand Transparent Pricing</OHEyebrow>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight my-4 leading-tight">
              Simple, transparent plans for <br className="hidden sm:inline" />
              <span className="oh-grad-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Learners &amp; Practitioners
              </span>
            </h1>

            <p className="sub text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Whether you are here to learn and transform your health or a practitioner growing your care practice, we have tailored plans built for you via <strong>Razorpay</strong>.
            </p>

            {/* Key Trust Highlights */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8 text-xs sm:text-sm font-bold text-slate-700">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
                <FiShield className="text-emerald-600 text-base" />
                <span>100% Razorpay Secure</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
                <FiZap className="text-amber-500 text-base" />
                <span>Free Trial Included</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
                <FiRefreshCw className="text-blue-600 text-base" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* INTERACTIVE PRICING SECTION (LEARNER & PRACTITIONER TOGGLE & CARDS) */}
        {/* ========================================================================= */}
        <OHPricingSection defaultRole="learner" />

        {/* ========================================================================= */}
        {/* PAYMENT & SECURITY HIGHLIGHTS */}
        {/* ========================================================================= */}
        <section className="py-14 bg-slate-50 border-b border-slate-200">
          <div className="oh-wrap max-w-5xl mx-auto px-4 text-center">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-6">
              BANK-GRADE PAYMENT &amp; SUBSCRIPTION SECURITY
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center text-center">
                <FiCreditCard className="text-2xl text-blue-600 mb-2" />
                <h4 className="font-bold text-slate-900 text-sm">Razorpay Integration</h4>
                <p className="text-xs text-slate-500 mt-1">UPI, Cards &amp; NetBanking</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center text-center">
                <FiLock className="text-2xl text-emerald-600 mb-2" />
                <h4 className="font-bold text-slate-900 text-sm">256-bit Encryption</h4>
                <p className="text-xs text-slate-500 mt-1">PCI-DSS Compliant</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center text-center">
                <FiZap className="text-2xl text-amber-500 mb-2" />
                <h4 className="font-bold text-slate-900 text-sm">Instant Unlocking</h4>
                <p className="text-xs text-slate-500 mt-1">Immediate access</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center text-center">
                <FiShield className="text-2xl text-purple-600 mb-2" />
                <h4 className="font-bold text-slate-900 text-sm">No Hidden Fees</h4>
                <p className="text-xs text-slate-500 mt-1">Cancel anytime</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ORGANIZATIONS & ENTERPRISE BANNER */}
        {/* ========================================================================= */}
        <section className="py-12 bg-white border-b border-slate-200">
          <div className="oh-wrap max-w-5xl mx-auto px-4">
            <div 
              className="p-8 sm:p-10 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border"
              style={{
                backgroundColor: '#0F172A',
                background: 'linear-gradient(135deg, #09132C 0%, #0F172A 50%, #1E1B4B 100%)',
                borderColor: '#3B82F6',
                color: '#FFFFFF',
              }}
            >
              <div className="max-w-2xl text-center md:text-left">
                <span 
                  className="px-3.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider inline-block mb-3"
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', border: '1px solid rgba(96, 165, 250, 0.4)' }}
                >
                  ENTERPRISE &amp; ORGANIZATIONS
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 mb-2" style={{ color: '#FFFFFF' }}>
                  Need a custom plan for your organization or clinic?
                </h3>
                <p className="text-sm sm:text-base font-medium leading-relaxed" style={{ color: '#CBD5E1' }}>
                  We offer enterprise team licenses, centralized HR billing, aggregate analytics, and dedicated rollout managers.
                </p>
              </div>
              <div>
                <Link
                  to="/for-organizations"
                  className="px-6 py-3.5 rounded-full font-extrabold text-sm transition-all shadow-lg whitespace-nowrap inline-flex items-center gap-2 hover:scale-105"
                  style={{ backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none' }}
                >
                  <span>Explore Enterprise Plans</span>
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* NEW MODERN SPLIT FAQ SECTION */}
        {/* ========================================================================= */}
        <section className="py-20 bg-slate-100/70 border-b border-slate-200">
          <div className="oh-wrap max-w-6xl mx-auto px-4 sm:px-6">
            
            {/* Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left Column: Title & Interactive Filter & Contact Card */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                <div>
                  <OHEyebrow>Help &amp; Clear Answers</OHEyebrow>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight my-3 leading-tight">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
                    Everything you need to know about OpenHand subscriptions, free trials, Razorpay checkout, and practitioner payouts.
                  </p>
                </div>

                {/* Filter Category Pills */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('all'); setOpenFaq(0); }}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: activeTab === 'all' ? '#2563EB' : '#FFFFFF',
                      color: activeTab === 'all' ? '#FFFFFF' : '#0F172A',
                      border: activeTab === 'all' ? '1px solid #2563EB' : '1px solid #CBD5E1',
                      boxShadow: activeTab === 'all' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
                    }}
                  >
                    All Questions
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('learner'); setOpenFaq(0); }}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: activeTab === 'learner' ? '#2563EB' : '#FFFFFF',
                      color: activeTab === 'learner' ? '#FFFFFF' : '#0F172A',
                      border: activeTab === 'learner' ? '1px solid #2563EB' : '1px solid #CBD5E1',
                      boxShadow: activeTab === 'learner' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
                    }}
                  >
                    🎓 For Learners
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('practitioner'); setOpenFaq(0); }}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: activeTab === 'practitioner' ? '#2563EB' : '#FFFFFF',
                      color: activeTab === 'practitioner' ? '#FFFFFF' : '#0F172A',
                      border: activeTab === 'practitioner' ? '1px solid #2563EB' : '1px solid #CBD5E1',
                      boxShadow: activeTab === 'practitioner' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
                    }}
                  >
                    🩺 For Practitioners
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('payment'); setOpenFaq(0); }}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: activeTab === 'payment' ? '#2563EB' : '#FFFFFF',
                      color: activeTab === 'payment' ? '#FFFFFF' : '#0F172A',
                      border: activeTab === 'payment' ? '1px solid #2563EB' : '1px solid #CBD5E1',
                      boxShadow: activeTab === 'payment' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
                    }}
                  >
                    💳 Payments &amp; Security
                  </button>
                </div>

                {/* Direct Support Card */}
                <div 
                  className="p-6 rounded-3xl shadow-xl border space-y-4"
                  style={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    color: '#FFFFFF',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-extrabold tracking-wider uppercase" style={{ color: '#34D399' }}>SUPPORT ONLINE</span>
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: '#94A3B8' }}>Response: &lt; 2 hrs</span>
                  </div>

                  <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Have a specific question?</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#CBD5E1' }}>
                    Can't find the answer you're looking for? Talk directly with our care &amp; onboarding specialists.
                  </p>

                  <div className="flex flex-col gap-2.5 pt-2">
                    <Link
                      to="/contact-us"
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md"
                      style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                    >
                      <FiMessageSquare />
                      <span>Contact Support Team</span>
                    </Link>

                    <Link
                      to="/documentation"
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border"
                      style={{ backgroundColor: '#1E293B', color: '#60A5FA', borderColor: '#334155' }}
                    >
                      <FiBookOpen />
                      <span>View Documentation</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Accordion Questions */}
              <div className="lg:col-span-7 space-y-4">
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openFaq === idx
                  const Icon = faq.icon

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl transition-all duration-300 overflow-hidden ${
                        isOpen 
                          ? 'bg-white border-2 border-blue-500 shadow-lg' 
                          : 'bg-white border border-slate-200/90 shadow-xs hover:border-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(idx)}
                        className="w-full p-6 text-left flex items-start justify-between gap-4 font-bold text-slate-900 text-base"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${isOpen ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-blue-600 mb-1">
                              {faq.categoryTag}
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                              {faq.q}
                            </h3>
                          </div>
                        </div>

                        <div className={`p-2 rounded-full shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                          <FiChevronDown size={18} />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-6 pt-2 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 ml-14">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

            </div>

          </div>
        </section>

      </main>
      <OHFooter />
    </div>
  )
}

export default PricingPage
