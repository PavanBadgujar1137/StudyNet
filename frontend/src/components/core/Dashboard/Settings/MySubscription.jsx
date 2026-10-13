import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { apiConnector } from "../../../../services/apiConnector"
import { setUser } from "../../../../slices/profileSlice"
import {
  FiCheckCircle,
  FiZap,
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiArrowRight,
  FiAward,
  FiHeart
} from "react-icons/fi"

const PRACTITIONER_PLANS = {
  pro_monthly: {
    name: "Pro Plan (Monthly)",
    price: "₹999 / month",
    type: "Practitioner Pro Tier",
    badgeColor: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
    textColor: "#818CF8",
    features: [
      "Everything in Open — commission drops to 5%",
      "Monthly growth review with an OpenHand mentor",
      "Priority mentee matching & featured placement",
      "Visibility campaigns: spotlights, collaborations, events",
      "AI session notes & client progress insights",
    ],
  },
  pro_yearly: {
    name: "Pro Plan (Yearly)",
    price: "₹799 / month (₹9,588/year)",
    type: "Practitioner Pro Annual Tier",
    badgeColor: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
    textColor: "#818CF8",
    features: [
      "Everything in Open — commission drops to 5%",
      "Monthly growth review with an OpenHand mentor",
      "Priority mentee matching & featured placement",
      "Visibility campaigns: spotlights, collaborations, events",
      "Programs, cohorts & memberships",
      "AI session notes & client progress insights",
      "Custom domain & white-label booking page",
    ],
  },
  pro: {
    name: "Pro Plan",
    price: "₹799 / month, billed yearly",
    type: "Practitioner Pro Tier",
    badgeColor: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
    textColor: "#818CF8",
    features: [
      "Everything in Open — commission drops to 5%",
      "Monthly growth review with an OpenHand mentor",
      "Priority mentee matching & featured placement",
      "Visibility campaigns: spotlights, collaborations, events",
      "Programs, cohorts & memberships",
      "AI session notes & client progress insights",
      "Custom domain & white-label booking page",
    ],
  },
  open: {
    name: "Open Plan",
    price: "₹0 / month",
    type: "Practitioner Free Tier",
    badgeColor: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    textColor: "#34D399",
    features: [
      "Flat 10% on every booking — your link or ours",
      "Growth Hand onboarding: profile & positioning review",
      "Listed in OpenHand mentee discovery",
      "1:1, group sessions, webinars & packages",
      "Built-in HD Session Room",
      "Custom domain",
      "Verified Practitioner badge",
      "72-hour working day payouts (UPI / bank)",
    ],
  },
  institution: {
    name: "Custom Plan",
    price: "Custom Pricing",
    type: "Enterprise / Custom Tier",
    badgeColor: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    textColor: "#94A3B8",
    features: [
      "Everything in Pro",
      "Custom commission — as low as 0%",
      "Dedicated growth & success manager",
      "Multi-practitioner teams & roles",
      "LMS, certification & cohort workflows",
      "White Label Play Store And IOS Store APP",
    ],
  },
  starter: {
    name: "Pro Plan",
    price: "₹999 / month",
    type: "Practitioner Pro Tier",
    badgeColor: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
    textColor: "#818CF8",
    features: [
      "Everything in Open — commission drops to 5%",
      "Priority mentee matching & featured placement",
      "AI session notes & client progress insights",
    ],
  },
  growth: {
    name: "Pro Plan",
    price: "₹799 / month, billed yearly",
    type: "Practitioner Pro Tier",
    badgeColor: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
    textColor: "#818CF8",
    features: [
      "Everything in Open — commission drops to 5%",
      "Priority mentee matching & featured placement",
      "AI session notes & client progress insights",
    ],
  },
  master: {
    name: "Pro Plan (Yearly)",
    price: "₹799 / month (₹9,588/year)",
    type: "Practitioner Pro Annual Tier",
    badgeColor: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
    textColor: "#818CF8",
    features: [
      "Everything in Open — commission drops to 5%",
      "Priority mentee matching & featured placement",
      "AI session notes & client progress insights",
    ],
  },
  trial: {
    name: "14-Day Free Trial",
    price: "Free Setup Trial",
    type: "Practitioner Trial",
    badgeColor: "linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)",
    textColor: "#C084FC",
    features: [
      "Full preview access to practice cockpit",
      "Set up 1:1 session offerings",
      "Test live circle containers",
      "Draft courses and upload materials"
    ]
  }
}

export default function MySubscription() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const [subData, setSubData] = useState(null)

  useEffect(() => {
    let isMounted = true
    const fetchSub = async () => {
      try {
        if (!token) return
        const res = await apiConnector("GET", "/api/v1/payments/subscription/mine", null, {
          Authorization: `Bearer ${token}`,
        })
        if (res?.data?.success && isMounted) {
          setSubData(res.data)
          if (res.data.trialExpiresAt && user) {
            const serverExpiry = new Date(res.data.trialExpiresAt).getTime()
            const localExpiry = user.trialExpiresAt ? new Date(user.trialExpiresAt).getTime() : 0
            if (serverExpiry !== localExpiry || (res.data.effectivePlan && res.data.effectivePlan !== user.activePlan)) {
              dispatch(
                setUser({
                  ...user,
                  trialExpiresAt: res.data.trialExpiresAt,
                  activePlan: res.data.effectivePlan || user.activePlan,
                })
              )
            }
          }
        }
      } catch (err) {
        // Silently use local state
      }
    }
    fetchSub()
    return () => {
      isMounted = false
    }
  }, [token, dispatch, user])

  const isPractitioner =
    user?.accountType === "Practitioner" || user?.accountType === "Instructor"

  // ─── LEARNER VIEW (100% FREE FOREVER) ───
  if (!isPractitioner) {
    const learnerFeatures = [
      "Unlimited access to all practitioner free video courses",
      "Join and participate in peer growth & support Circles",
      "Daily mood check-ins & guided reflection journal",
      "Personal health & reflection companion tools",
      "Direct 1:1 session bookings with verified practitioners",
      "Encrypted digital health record & notes vault",
      "Zero subscriptions or credit card needed — 100% Free Forever",
    ]

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Active Free Account Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            padding: "28px",
            color: "#FFFFFF",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 25px -5px rgba(6, 78, 59, 0.3)"
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    color: "#FFFFFF",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                >
                  100% FREE LIFETIME
                </span>
                <span style={{ color: "#A7F3D0", fontSize: "13px", fontWeight: 600 }}>
                  Learner Account
                </span>
              </div>

              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#FFFFFF", margin: "4px 0 8px", letterSpacing: "-0.02em" }}>
                Free Learner Account
              </h2>

              <p style={{ color: "#D1FAE5", fontSize: "14px", margin: 0, maxWidth: "600px" }}>
                Your account is 100% free with no subscription for enrollment. You only pay directly with PayGlocal when booking specific practitioner courses, 1-on-1 sessions, or circle offerings.
              </p>
            </div>

            <button
              onClick={() => navigate("/app/courses")}
              style={{
                background: "#FFFFFF",
                color: "#065F46",
                border: "none",
                padding: "12px 20px",
                borderRadius: "12px",
                fontWeight: 800,
                fontSize: "14px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
                transition: "transform 0.15s ease"
              }}
            >
              <FiHeart /> Explore Free Courses <FiArrowRight />
            </button>
          </div>

          {/* Details Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255, 255, 255, 0.15)"
            }}
          >
            {/* Price */}
            <div style={{ background: "rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#A7F3D0", fontSize: "12px", fontWeight: 600 }}>
                <FiCreditCard /> Monthly Fee
              </div>
              <div style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: 800, marginTop: "4px" }}>
                ₹0 (Free Forever)
              </div>
            </div>

            {/* Status */}
            <div style={{ background: "rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#A7F3D0", fontSize: "12px", fontWeight: 600 }}>
                <FiClock /> Account Status
              </div>
              <div style={{ color: "#FFFFFF", fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>
                Active Forever ✓
              </div>
            </div>

            {/* Renewal */}
            <div style={{ background: "rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#A7F3D0", fontSize: "12px", fontWeight: 600 }}>
                <FiCalendar /> Renewal Date
              </div>
              <div style={{ color: "#FFFFFF", fontSize: "15px", fontWeight: 700, marginTop: "4px" }}>
                No Renewal Required
              </div>
            </div>
          </div>
        </div>

        {/* Free Features Included */}
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
            <FiAward style={{ fontSize: "20px", color: "#059669" }} />
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              Features Unlocked in Your Free Account
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
            {learnerFeatures.map((feat, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  background: "#F0FDF4",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid #BBF7D0"
                }}
              >
                <FiCheckCircle style={{ color: "#10B981", fontSize: "16px", flexShrink: 0, marginTop: "2px" }} />
                <span style={{ color: "#166534", fontSize: "13px", fontWeight: 600 }}>
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─── PRACTITIONER VIEW ───
  let rawPlanKey = (subData?.effectivePlan || user?.activePlan || "open").toLowerCase()
  if (rawPlanKey === "trial" || rawPlanKey === "none") rawPlanKey = "open"

  const planInfo = PRACTITIONER_PLANS[rawPlanKey] || {
    name: `${user?.activePlan?.toUpperCase() || "ACTIVE"} PLAN`,
    price: "Active Plan",
    type: "Practitioner Tier",
    badgeColor: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    textColor: "#60A5FA",
    features: ["Access to practice cockpit and booking management"]
  }

  const isYearlyPlan =
    rawPlanKey === "pro_yearly" ||
    rawPlanKey === "master" ||
    rawPlanKey === "pro_annual" ||
    subData?.subscription?.planKey === "pro_yearly"

  // 1. Determine active expiration date
  let expiryDate = null
  if (subData?.subscription?.endDate) {
    expiryDate = new Date(subData.subscription.endDate)
  } else if (subData?.subscriptionEndDate) {
    expiryDate = new Date(subData.subscriptionEndDate)
  } else if (user?.trialExpiresAt) {
    expiryDate = new Date(user.trialExpiresAt)
  }

  const now = new Date()

  // 2. Safeguard for yearly subscription:
  // If user is on a yearly plan, but expiryDate is within 45 days from creation (e.g. old 14-day trial default),
  // heal it to 1 full year from start/creation date
  if (isYearlyPlan && expiryDate) {
    const creationTime = user?.createdAt ? new Date(user.createdAt).getTime() : now.getTime()
    const diffFromCreation = (expiryDate.getTime() - creationTime) / (1000 * 60 * 60 * 24)
    if (diffFromCreation < 45) {
      const healedDate = new Date(creationTime)
      healedDate.setFullYear(healedDate.getFullYear() + 1)
      expiryDate = healedDate
    }
  }

  const isLifetime = expiryDate && expiryDate.getFullYear() > 2050
  
  let daysRemaining = "Active"
  let isExpired = false

  if (rawPlanKey === "open") {
    daysRemaining = "Active"
  } else if (isLifetime) {
    daysRemaining = "Unlimited Lifetime Access"
  } else if (expiryDate) {
    const diffMs = expiryDate.getTime() - now.getTime()
    if (diffMs > 0) {
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      daysRemaining = `${days} Days Remaining`
    } else {
      isExpired = true
      daysRemaining = "Expired"
    }
  } else {
    daysRemaining = "Active"
  }

  const formattedDate = rawPlanKey === "open"
    ? "No Renewal Required"
    : isLifetime
    ? "Lifetime Membership (No Renewal Required)"
    : expiryDate
    ? expiryDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : "Active Subscription"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Active Subscription Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #080D1B 0%, #0F172A 50%, #1E1B4B 100%)",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "32px",
          color: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px -10px rgba(8, 13, 27, 0.4)",
        }}
      >
        {/* Ambient Glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <span
                style={{
                  background: planInfo.badgeColor,
                  color: "#FFFFFF",
                  padding: "4px 14px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)"
                }}
              >
                {isLifetime ? "LIFETIME VIP" : isExpired ? "EXPIRED" : "ACTIVE PLAN"}
              </span>
              <span style={{ color: "#A5B4FC", fontSize: "13px", fontWeight: 700 }}>
                {planInfo.type}
              </span>
            </div>

            <h2 style={{ fontSize: "30px", fontWeight: 800, color: "#FFFFFF", margin: "4px 0 8px", letterSpacing: "-0.025em" }}>
              {planInfo.name}
            </h2>

            <p style={{ color: "#94A3B8", fontSize: "14px", margin: 0, maxWidth: "560px", lineHeight: 1.5 }}>
              Manage your practice tools, live circle capacity, and platform publishing status.
            </p>
          </div>

          <button
            onClick={() => navigate("/schedule-call?plan=pro_yearly")}
            className="oh-profile-btn-primary"
            style={{ padding: "14px 24px", fontSize: "14px" }}
          >
            <FiZap size={16} /> Book a Call &amp; Take Subscription <FiArrowRight size={16} />
          </button>
        </div>

        {/* Subscription Meta Details Grid */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginTop: "28px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)"
          }}
        >
          {/* Price */}
          <div style={{ background: "rgba(255, 255, 255, 0.04)", borderRadius: "16px", padding: "16px 18px", border: "1px solid rgba(255, 255, 255, 0.08)", backdropFilter: "blur(4px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94A3B8", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <FiCreditCard style={{ color: "#818CF8" }} size={15} /> Platform Fee
            </div>
            <div style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: 800, marginTop: "6px", letterSpacing: "-0.01em" }}>
              {planInfo.price}
            </div>
          </div>

          {/* Expiration / Renewal Date */}
          <div style={{ background: "rgba(255, 255, 255, 0.04)", borderRadius: "16px", padding: "16px 18px", border: "1px solid rgba(255, 255, 255, 0.08)", backdropFilter: "blur(4px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94A3B8", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <FiCalendar style={{ color: "#34D399" }} size={15} /> Next Renewal / Expiry
            </div>
            <div style={{ color: "#FFFFFF", fontSize: "16px", fontWeight: 700, marginTop: "6px" }}>
              {formattedDate}
            </div>
          </div>

          {/* Days Remaining */}
          <div style={{ background: "rgba(255, 255, 255, 0.04)", borderRadius: "16px", padding: "16px 18px", border: "1px solid rgba(255, 255, 255, 0.08)", backdropFilter: "blur(4px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94A3B8", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <FiClock style={{ color: "#FBBF24" }} size={15} /> Plan Status
            </div>
            <div style={{ color: isLifetime ? "#34D399" : isExpired ? "#F87171" : "#818CF8", fontSize: "16px", fontWeight: 800, marginTop: "6px" }}>
              {daysRemaining}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Features Included */}
      <div className="oh-profile-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiAward size={18} />
              </span>
              Features Included in Your Practitioner Plan
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
              Everything enabled with your current practice status
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
          {planInfo.features.map((feat, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                background: "#F8FAFC",
                padding: "14px 16px",
                borderRadius: "14px",
                border: "1px solid #E2E8F0",
                transition: "all 0.15s ease"
              }}
            >
              <FiCheckCircle style={{ color: "#10B981", fontSize: "18px", flexShrink: 0, marginTop: "1px" }} />
              <span style={{ color: "#1E293B", fontSize: "13.5px", fontWeight: 600, lineHeight: 1.45 }}>
                {feat}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
