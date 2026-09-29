import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  OHFooter,
  OHEyebrow,
  OHPricingSection,
  OHTakeHomeSimulator,
  OHCompareTable,
} from '../../components/openhand'
import {
  FiZap,
  FiRefreshCw,
  FiChevronDown,
  FiMessageSquare,
  FiBookOpen,
  FiBriefcase,
  FiUserCheck,
  FiCreditCard,
} from 'react-icons/fi'

export function PricingPage() {
  const [pricingRole, setPricingRole] = useState('practitioner') // 'practitioner' | 'learner'
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'learner' | 'practitioner' | 'payment'
  const [openFaq, setOpenFaq] = useState(0)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const allFaqs = [
    {
      category: 'practitioner',
      categoryTag: 'OPENHAND DIFFERENCE',
      icon: FiBriefcase,
      q: "How is OpenHand different from a marketplace or course tool?",
      a: "Marketplaces list you and wait. Course tools give you software and leave growth to you. OpenHand is a growth partner — we work with you to position your practice, bring you the right mentees and make your name known."
    },
    {
      category: 'practitioner',
      categoryTag: 'FREE OPEN PLAN',
      icon: FiZap,
      q: "Is the Open plan really free?",
      a: "Yes. No card, no setup fee, no monthly charge. You pay a flat commission only when you earn."
    },
    {
      category: 'practitioner',
      categoryTag: 'COMMISSION & BOOKINGS',
      icon: FiUserCheck,
      q: "Do you charge more for mentees you bring me?",
      a: "No. One flat rate on every booking — whether it came from your own link or from OpenHand."
    },
    {
      category: 'payment',
      categoryTag: 'PAYMENT GATEWAY',
      icon: FiCreditCard,
      q: "What about payment gateway charges?",
      a: "Gateway fees are passed through at cost and shown on every payout statement. No hidden margin."
    },
    {
      category: 'payment',
      categoryTag: 'BILLING & PLANS',
      icon: FiRefreshCw,
      q: "Can I switch plans anytime?",
      a: "Yes. Upgrade or downgrade in one click; changes apply from your next billing cycle."
    }
  ]

  const filteredFaqs = activeTab === 'all' 
    ? allFaqs 
    : allFaqs.filter(item => item.category === activeTab)

  return (
    <div className="oh-marketing-page min-h-screen bg-white text-slate-800 flex flex-col justify-between font-sans">
      <main className="flex-1">
        
        {/* ========================================================================= */}
        {/* INTERACTIVE PRICING SECTION (LEARNER FREE SHOWCASE & PRACTITIONER PLANS) */}
        {/* ========================================================================= */}
        <OHPricingSection
          role={pricingRole}
          onRoleChange={setPricingRole}
          defaultRole="practitioner"
        />

        {/* ========================================================================= */}
        {/* PRACTITIONER EXCLUSIVE SECTIONS (SHOWN ONLY WHEN PRACTITIONER TAB IS ACTIVE) */}
        {/* ========================================================================= */}
        {pricingRole === 'practitioner' && (
          <>
            {/* GROWTH HAND — 4-STEP SECTION UNDER PRICING BOXES */}
            <section className="py-14 bg-[#F5F6FF] border-b border-slate-200">
              <div className="oh-wrap max-w-[1540px] mx-auto px-2 sm:px-4">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-10">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#4F46E5] mb-3 block">
                    THE OPENHAND DIFFERENCE
                  </span>
                  <h2
                    className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight leading-tight mb-4"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Hand-holding, not just hosting.
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
                    Every plan includes <strong>Growth Hand</strong> — our hands-on programme that works on getting you mentees, not just taking bookings.
                  </p>
                </div>

                {/* 4 Steps Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    {
                      num: "01",
                      title: "Position",
                      desc: "We sharpen your profile, niche and offers so the right mentees instantly get why you.",
                    },
                    {
                      num: "02",
                      title: "Get discovered",
                      desc: "Your practice is matched to mentees actively looking for your expertise — not left to wait.",
                    },
                    {
                      num: "03",
                      title: "Get known",
                      desc: "Spotlights, collaborations and events that build your name beyond your own followers.",
                    },
                    {
                      num: "04",
                      title: "Grow & retain",
                      desc: "Regular reviews of your bookings and retention, with clear next steps to strengthen your practice.",
                    },
                  ].map((step, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
                      <span
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-white text-xs font-extrabold mb-4"
                        style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
                      >
                        {step.num}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mb-2">{step.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed font-medium">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* TAKE-HOME SIMULATOR (CALCULATOR WITH COMPETITOR COMPARISONS) */}
            <OHTakeHomeSimulator />

            {/* SIDE BY SIDE COMPARISON TABLE */}
            <OHCompareTable />
          </>
        )}

        {/* ========================================================================= */}
        {/* NEW MODERN SPLIT FAQ SECTION */}
        {/* ========================================================================= */}
        <section className="py-20 bg-slate-50/80 border-b border-slate-200">
          <div className="oh-wrap max-w-[1540px] mx-auto px-2 sm:px-4">
            
            {/* Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left Column: Title & Interactive Filter & Contact Card */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                <div>
                  <OHEyebrow>Help &amp; Clear Answers</OHEyebrow>
                  <h2
                    className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight my-3 leading-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
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
                    💳 Payments &amp; Gateway
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
