import React from 'react'
import {
  OHFooter,
  OHEyebrow,
  OHPricingSection,
} from '../../components/openhand'

export function PricingPage() {
  return (
    <div className="oh-marketing-page min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans">
      <main className="flex-1">
        {/* Pricing Hero */}
        <header className="oh-pricing-hero pt-14 pb-8 text-center bg-gradient-to-b from-white to-slate-50 border-b border-slate-100">
          <div className="oh-wrap max-w-5xl mx-auto px-4">
            <OHEyebrow>OpenHand Transparent Pricing</OHEyebrow>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight my-4">
              Simple, transparent plans for <span className="oh-grad-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Learners &amp; Practitioners</span>
            </h1>
            <p className="sub text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Whether you are here to learn and transform your health or a practitioner growing your care practice, we have tailored plans built for you via <strong>Razorpay</strong>.
            </p>
          </div>
        </header>

        {/* Pricing Section Component */}
        <OHPricingSection defaultRole="learner" />

        {/* Pricing FAQ Section */}
        <section className="py-16 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2 text-base">How does the Learner 14-Day Free Trial work?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Upon registration, all Learners receive 14 days of free access to practitioner free courses and platform tools. After 14 days, you can choose to subscribe to a Learner plan (Beginner ₹51, Advance ₹151, or Champion ₹1,500) via Razorpay.
                </p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2 text-base">Do Practitioners get a free trial?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Yes! Practitioners get a 14-day free trial upon registration to explore clinical tools, set up 1:1 session offers, build courses, and test live circles. To publish live to learners, practitioners can subscribe to a Practitioner Plan (Starter ₹999, Growth ₹2,999, or Master ₹5,999).
                </p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2 text-base">How do Paid Courses &amp; Sessions work?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Practitioners can set custom prices for paid courses and 1:1 sessions. Learners pay for paid courses or sessions directly via Razorpay, and earnings are credited to the practitioner's salary ledger in the Admin portal.
                </p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2 text-base">How are Practitioner Salary Payouts processed?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  All platform payments go directly to the Admin via Razorpay. Admin views total sales and pending salary owed for each practitioner, and disbursements are sent directly to practitioner bank accounts.
                </p>
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
