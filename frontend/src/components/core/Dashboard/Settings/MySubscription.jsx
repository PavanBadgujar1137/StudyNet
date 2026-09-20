import React from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  FiCheckCircle,
  FiZap,
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiArrowRight,
  FiShield,
  FiAward
} from "react-icons/fi"

const PLAN_DETAILS = {
  // Practitioner Plans
  master: {
    name: "Master VIP Plan",
    price: "₹5,999 / month",
    type: "Practitioner VIP Tier",
    badgeColor: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
    textColor: "#C084FC",
    features: [
      "VIP clinic profile & multi-practitioner support",
      "Unlimited live group circles & custom cohorts",
      "Unlimited course publishing (free & paid pricing)",
      "Automated client check-in & reflection sequences",
      "Zero platform commission on all booking transactions",
      "Dedicated account manager & 24/7 technical support"
    ]
  },
  growth: {
    name: "Growth Plan",
    price: "₹2,999 / month",
    type: "Practitioner Growth Tier",
    badgeColor: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    textColor: "#60A5FA",
    features: [
      "Everything in Starter Plan",
      "Unlimited live group circles & custom cohorts",
      "Unlimited course publishing (free & paid pricing)",
      "Automated client check-in & reflection sequences",
      "Priority directory placement & verified badge"
    ]
  },
  starter: {
    name: "Starter Plan",
    price: "₹999 / month",
    type: "Practitioner Starter Tier",
    badgeColor: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    textColor: "#34D399",
    features: [
      "Publish 1:1 session offers & free/paid courses",
      "Host 1 live private group circle",
      "Standard directory listing & client booking link",
      "Client mood check-in tracking & notes",
      "Razorpay direct payment gateway integration"
    ]
  },
  // Learner Plans
  champion: {
    name: "Champion Plan",
    price: "₹1,500 / month",
    type: "Learner VIP Tier",
    badgeColor: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    textColor: "#FBBF24",
    features: [
      "Everything in Advance Plan",
      "1 Free 1:1 private session included per month",
      "25% discount on all additional 1:1 practitioner sessions",
      "Dedicated personal care manager & concierge support",
      "24/7 Priority health helpline & instant AURA access"
    ]
  },
  advance: {
    name: "Advance Plan",
    price: "₹151 / month",
    type: "Learner Advance Tier",
    badgeColor: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
    textColor: "#818CF8",
    features: [
      "Everything in Beginner Plan",
      "Unlimited access to ALL free practitioner courses",
      "Unlimited access to live group circles",
      "15% discount on all 1:1 practitioner sessions",
      "Live in-session AURA companion & real-time insights"
    ]
  },
  beginner: {
    name: "Beginner Plan",
    price: "₹51 / month",
    type: "Learner Starter Tier",
    badgeColor: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
    textColor: "#38BDF8",
    features: [
      "Access to core free practitioner courses & library",
      "1 Monthly live group circle pass included",
      "Daily mood check-ins & guided reflection prompts",
      "Personal AI health & reflection assistant (AURA)",
      "Secure digital health record vault"
    ]
  },
  trial: {
    name: "14-Day Free Trial",
    price: "Free Access",
    type: "Trial Pass",
    badgeColor: "linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)",
    textColor: "#C084FC",
    features: [
      "Full preview access to platform features",
      "Explore practitioner directory & courses",
      "AURA AI assistant trial session",
      "Live circle pass preview"
    ]
  }
}

export default function MySubscription() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.profile)

  const isPractitioner =
    user?.accountType === "Practitioner" || user?.accountType === "Instructor"
  
  const rawPlanKey = (user?.activePlan || "trial").toLowerCase()
  const planInfo = PLAN_DETAILS[rawPlanKey] || {
    name: `${user?.activePlan?.toUpperCase() || "ACTIVE"} PLAN`,
    price: "Active Plan",
    type: isPractitioner ? "Practitioner Tier" : "Learner Tier",
    badgeColor: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    textColor: "#60A5FA",
    features: ["Access to core platform features and services"]
  }

  const trialExpiresAt = user?.trialExpiresAt ? new Date(user.trialExpiresAt) : null
  const isLifetime = trialExpiresAt && trialExpiresAt.getFullYear() > 2050
  
  const now = new Date()
  let daysRemaining = 0
  let isExpired = false

  if (isLifetime) {
    daysRemaining = "Unlimited Lifetime Access"
  } else if (trialExpiresAt) {
    const diffMs = trialExpiresAt.getTime() - now.getTime()
    if (diffMs > 0) {
      daysRemaining = `${Math.ceil(diffMs / (1000 * 60 * 60 * 24))} Days Remaining`
    } else {
      isExpired = true
      daysRemaining = "Expired"
    }
  } else {
    daysRemaining = "Active"
  }

  const formattedDate = isLifetime
    ? "Lifetime Membership (No Renewal Required)"
    : trialExpiresAt
    ? trialExpiresAt.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : "Active Subscription"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Active Subscription Banner */}
      <div
        style={{
          background: "#0F172A",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "28px",
          color: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
            pointerEvents: "none"
          }}
        />

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span
                style={{
                  background: planInfo.badgeColor,
                  color: "#FFFFFF",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                {isLifetime ? "LIFETIME VIP" : isExpired ? "EXPIRED" : "ACTIVE PLAN"}
              </span>
              <span style={{ color: "#94A3B8", fontSize: "13px", fontWeight: 600 }}>
                {planInfo.type}
              </span>
            </div>

            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#FFFFFF", margin: "4px 0 8px", letterSpacing: "-0.02em" }}>
              {planInfo.name}
            </h2>

            <p style={{ color: "#94A3B8", fontSize: "14px", margin: 0 }}>
              {isPractitioner
                ? "Manage your practice tools, live circle capacity, and platform publishing status."
                : "Enjoy full access to courses, live circles, and AURA AI co-pilot insights."}
            </p>
          </div>

          <button
            onClick={() => navigate("/pricing")}
            style={{
              background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
              color: "#FFFFFF",
              border: "none",
              padding: "12px 20px",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
              transition: "transform 0.15s ease"
            }}
          >
            <FiZap /> Upgrade / Change Plan <FiArrowRight />
          </button>
        </div>

        {/* Subscription Meta Details Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)"
          }}
        >
          {/* Price */}
          <div style={{ background: "rgba(255, 255, 255, 0.04)", borderRadius: "14px", padding: "14px 16px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94A3B8", fontSize: "12px", fontWeight: 600 }}>
              <FiCreditCard style={{ color: "#818CF8" }} /> Membership Fee
            </div>
            <div style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: 800, marginTop: "4px" }}>
              {planInfo.price}
            </div>
          </div>

          {/* Expiration / Renewal Date */}
          <div style={{ background: "rgba(255, 255, 255, 0.04)", borderRadius: "14px", padding: "14px 16px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94A3B8", fontSize: "12px", fontWeight: 600 }}>
              <FiCalendar style={{ color: "#34D399" }} /> Next Renewal / Expiration
            </div>
            <div style={{ color: "#FFFFFF", fontSize: "15px", fontWeight: 700, marginTop: "4px" }}>
              {formattedDate}
            </div>
          </div>

          {/* Days Remaining */}
          <div style={{ background: "rgba(255, 255, 255, 0.04)", borderRadius: "14px", padding: "14px 16px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94A3B8", fontSize: "12px", fontWeight: 600 }}>
              <FiClock style={{ color: "#FBBF24" }} /> Plan Status
            </div>
            <div style={{ color: isLifetime ? "#34D399" : isExpired ? "#F87171" : "#818CF8", fontSize: "15px", fontWeight: 800, marginTop: "4px" }}>
              {daysRemaining}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Features Included */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          border: "1px solid #E2E8F0",
          padding: "28px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <FiAward style={{ fontSize: "20px", color: "#4F46E5" }} />
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
            Features Included in Your Plan
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
          {planInfo.features.map((feat, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                background: "#F8FAFC",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #E2E8F0"
              }}
            >
              <FiCheckCircle style={{ color: "#10B981", fontSize: "16px", flexShrink: 0, marginTop: "2px" }} />
              <span style={{ color: "#334155", fontSize: "13px", fontWeight: 600 }}>
                {feat}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "#EFF6FF",
            borderRadius: "14px",
            border: "1px solid #BFDBFE",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FiShield style={{ color: "#1D4ED8", fontSize: "20px" }} />
            <div>
              <div style={{ color: "#1E40AF", fontWeight: 700, fontSize: "14px" }}>Need more features or team access?</div>
              <div style={{ color: "#3B82F6", fontSize: "12px" }}>Compare all plans and switch anytime instantly.</div>
            </div>
          </div>

          <button
            onClick={() => navigate("/pricing")}
            style={{
              background: "#1D4ED8",
              color: "#FFFFFF",
              border: "none",
              padding: "8px 16px",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer"
            }}
          >
            View All Plans
          </button>
        </div>
      </div>
    </div>
  )
}
