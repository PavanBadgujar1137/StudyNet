import React from "react"
import { Link, useSearchParams } from "react-router-dom"
import { FiArrowLeft, FiShield, FiCalendar } from "react-icons/fi"
import CalendlyDiscoveryModal from "../../components/openhand/CalendlyDiscoveryModal"
import OHFooter from "../../components/openhand/OHFooter"

export default function ScheduleSubscriptionCall() {
  const [searchParams] = useSearchParams()
  const planParam = searchParams.get("plan") || "pro_yearly"

  const planName = planParam === "pro_yearly" ? "Pro Plan (1 Year Validity)" : "Pro Plan"
  const planPrice = 9588

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-800"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}
    >
      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
        {/* Breadcrumb Navigation & Security Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            <FiArrowLeft className="text-base" /> Back to Pricing
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <FiShield className="text-blue-600" /> PayGlocal Verified Gateway
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FiCalendar className="text-emerald-600" /> Google Calendar &amp; Meet
            </span>
          </div>
        </div>

        {/* Hero Title Section */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <span
            style={{
              color: "#2563EB",
              backgroundColor: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: "9999px",
              padding: "5px 16px",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "10px",
            }}
          >
            PRACTITIONER YEARLY SUBSCRIPTION &amp; ONBOARDING
          </span>
          <h1
            className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight my-2 leading-[1.15] text-[#0F172A]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Book a Discovery Call &amp; Take Subscription
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            Select your slot, answer discovery questions, complete subscription payment, and receive instant Google Meet access.
          </p>
        </div>

        {/* Calendly Discovery Call Widget (Images 1, 2, 3, 4) */}
        <div className="w-full flex justify-center">
          <CalendlyDiscoveryModal
            isOpen={true}
            isEmbedded={true}
            planKey={planParam}
            planPrice={planPrice}
            planName={planName}
          />
        </div>
      </main>

      {/* Footer */}
      <OHFooter />
    </div>
  )
}
