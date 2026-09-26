import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import {
  FiShield,
  FiArrowRight,
  FiHeart,
  FiBookOpen,
  FiUsers,
  FiMessageSquare,
} from "react-icons/fi"
import { HiSparkles } from "react-icons/hi"
import toast from "react-hot-toast"
import OHEyebrow from "./OHEyebrow"
import { apiConnector } from "../../services/apiConnector"

const INCLUDED_PRACTITIONER_FEATURES = [
  {
    title: "0% commission",
    desc: "You keep 100% of every session and programme fee.",
  },
  {
    title: "Clients pay you directly",
    desc: "Through your own UPI, bank account or payment link. OpenHand never holds your money.",
  },
  {
    title: "Verified practitioner profile",
    desc: "Credential-checked profile with a verified badge.",
  },
  {
    title: "Priority directory placement",
    desc: "Be found first by clients searching OpenHand.",
  },
  {
    title: "Unlimited 1:1 session offers",
    desc: "With your own personal booking link.",
  },
  {
    title: "Unlimited live Circles",
    desc: "Run group sessions and communities without limits.",
  },
  {
    title: "Unlimited offers, free and paid",
    desc: "Workshops, programmes, discovery calls and more.",
  },
  {
    title: "AURA Aftercare Notes",
    desc: "Structured session notes your clients can return to.",
  },
  {
    title: "Check-in & reflection sequences",
    desc: "Automated follow-ups that keep clients progressing between sessions.",
  },
  {
    title: "Gift learner memberships",
    desc: "Offer complimentary memberships to your clients.",
  },
  {
    title: "Practitioner Network",
    desc: "Peer Supervision Groups with fellow verified practitioners.",
  },
  {
    title: "Circle analytics",
    desc: "See attendance, engagement and client retention at a glance.",
  },
]

export default function OHPricingSection({
  defaultRole = "practitioner",
  title,
  subtitle,
  hideRoleSwitcher = false,
  isModal = false,
  onSuccess,
}) {
  const [activeTab, setActiveTab] = useState(defaultRole) // "learner" | "practitioner"
  const [payingPlan, setPayingPlan] = useState(null)
  const [subStatus, setSubStatus] = useState(null)

  useEffect(() => {
    setActiveTab(defaultRole)
  }, [defaultRole])

  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      apiConnector("GET", "/api/v1/payments/subscription/mine", null, {
        Authorization: `Bearer ${token}`,
      })
        .then((res) => {
          if (res?.data?.success) {
            setSubStatus(res.data)
          }
        })
        .catch(() => {})
    }
  }, [token])

  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayNow = async (planKey) => {
    if (!token) {
      toast.error("Please login or sign up to join as a practitioner.")
      navigate("/signup")
      return
    }

    setPayingPlan(planKey)
    const toastId = toast.loading("Initializing Razorpay Gateway...")

    try {
      const isLoaded = await loadRazorpaySDK()
      if (!isLoaded) {
        toast.error("Failed to load Razorpay SDK. Please check your network connection.", { id: toastId })
        setPayingPlan(null)
        return
      }

      // Create Razorpay Order
      const res = await apiConnector(
        "POST",
        "/api/v1/plans/create-order",
        { planKey },
        { Authorization: `Bearer ${token}` }
      )

      if (!res?.data?.success || !res?.data?.order) {
        toast.error(res?.data?.message || "Failed to create payment order.", { id: toastId })
        setPayingPlan(null)
        return
      }

      const { order, key, planName } = res.data
      toast.dismiss(toastId)

      const isRealRazorpayOrder =
        typeof order?.id === "string" &&
        /^order_[A-Za-z0-9]{14,}$/.test(order.id) &&
        !order.id.includes("sub") &&
        !order.id.includes("pract") &&
        !order.id.includes("mock") &&
        !order.id.includes("fake")

      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "OpenHand Wellbeing Platform",
        description: `Subscription: ${planName}`,
        ...(isRealRazorpayOrder ? { order_id: order.id } : {}),
        prefill: {
          name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
          email: user?.email || "",
          ...(user?.contactNumber ? { contact: String(user.contactNumber).trim() } : {}),
        },
        theme: {
          color: "#2563EB",
        },
        handler: async (response) => {
          const verifyToastId = toast.loading("Verifying payment with Razorpay...")
          try {
            const verifyRes = await apiConnector(
              "POST",
              "/api/v1/plans/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planKey: planKey,
              },
              { Authorization: `Bearer ${token}` }
            )

            if (verifyRes?.data?.success) {
              toast.success(verifyRes.data.message || `Payment Successful! ${planName} Activated 🎉`, {
                id: verifyToastId,
              })

              const subRes = await apiConnector("GET", "/api/v1/payments/subscription/mine", null, {
                Authorization: `Bearer ${token}`,
              })
              if (subRes?.data?.success) {
                setSubStatus(subRes.data)
                if (onSuccess) onSuccess(subRes.data)
              } else if (onSuccess) {
                onSuccess()
              }

              setTimeout(() => {
                navigate("/practice")
              }, 1200)
            } else {
              toast.error(verifyRes?.data?.message || "Payment verification failed", { id: verifyToastId })
            }
          } catch (err) {
            console.error("Verification error:", err)
            toast.error("Payment verification error. Contact support if debited.", { id: verifyToastId })
          } finally {
            setPayingPlan(null)
          }
        },
        modal: {
          ondismiss: () => {
            setPayingPlan(null)
            toast.error("Payment window closed.")
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error("PayNow Error:", err)
      toast.error("Payment initialization failed.", { id: toastId })
      setPayingPlan(null)
    }
  }

  return (
    <section className={isModal ? "py-6 bg-transparent" : "oh-sec py-16 bg-slate-50 border-t border-b border-slate-200"} id="pricing">
      <div className="oh-wrap max-w-[1360px] mx-auto px-4">
        
        {/* Header */}
        <div className="text-center max-w-5xl mx-auto mb-10">
          
          {activeTab === "practitioner" ? (
            <>
              <span
                style={{
                  color: "#2563EB",
                  backgroundColor: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  borderRadius: "9999px",
                  padding: "6px 18px",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  display: "inline-block",
                  marginBottom: "14px",
                }}
              >
                FOR COACHES, THERAPISTS &amp; HEALING PRACTITIONERS
              </span>

              <h1 
                className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight my-3 leading-[1.15]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Build your practice on OpenHand. <br />
                <span style={{ color: "#2563EB" }}>
                  Keep every rupee you earn.
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
                One flat membership. Zero commission on your sessions. Your clients pay you directly, and OpenHand never stands between you and your income.
              </p>

              {/* 3 Green Dots Strip */}
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-5 text-xs sm:text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "9999px",
                      backgroundColor: "#059669",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  0% commission, always
                </span>
                <span className="flex items-center gap-2">
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "9999px",
                      backgroundColor: "#059669",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  Direct payments to you
                </span>
                <span className="flex items-center gap-2">
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "9999px",
                      backgroundColor: "#059669",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  Verified practitioners only
                </span>
              </div>
            </>
          ) : (
            <>
              <OHEyebrow>100% Free for Learners</OHEyebrow>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight my-4">
                OpenHand is{" "}
                <span className="oh-grad-text bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  100% Completely Free
                </span>{" "}
                for Learners
              </h2>
              <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                No subscriptions. No credit card required. Register, log in, and access practitioner free courses, live circles, daily check-ins, and AURA AI freely.
              </p>
            </>
          )}

          {/* User Active Plan / Status Banner */}
          {token && subStatus && (
            <div
              className="max-w-xl mx-auto mt-6 p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between gap-4 shadow-sm"
              style={{
                background: subStatus.isFreeLearner
                  ? "#F0FDF4"
                  : subStatus.hasActiveSubscription
                  ? "#F0FDF4"
                  : subStatus.isTrialActive
                  ? "#F3E8FF"
                  : "#FEF2F2",
                borderColor: subStatus.isFreeLearner
                  ? "#BBF7D0"
                  : subStatus.hasActiveSubscription
                  ? "#BBF7D0"
                  : subStatus.isTrialActive
                  ? "#E9D5FF"
                  : "#FCA5A5",
                color: subStatus.isFreeLearner
                  ? "#166534"
                  : subStatus.hasActiveSubscription
                  ? "#166534"
                  : subStatus.isTrialActive
                  ? "#7E22CE"
                  : "#DC2626",
              }}
            >
              <div className="flex items-center gap-2">
                <FiShield size={18} />
                {subStatus.isFreeLearner ? (
                  <span>
                    🎓 <strong>Free Learner Account:</strong> You have 100% free unlimited access to the entire platform!
                  </span>
                ) : subStatus.hasActiveSubscription ? (
                  <span>
                    Active Subscription: <strong>{subStatus.subscription?.planName || "Active Plan"}</strong>
                  </span>
                ) : subStatus.isTrialActive ? (
                  <span>
                    ⚡ 14-Day Free Trial Active: <strong>{subStatus.trialDaysRemaining} days remaining</strong>
                  </span>
                ) : (
                  <span>⚠️ 14-Day Free Trial Expired — Subscribe below to unlock all practice features</span>
                )}
              </div>
            </div>
          )}

          {/* Role Switcher Tabs */}
          {!hideRoleSwitcher && (
            <div className="inline-flex flex-col sm:flex-row items-center p-1.5 rounded-2xl mt-8 shadow-sm border border-slate-300 max-w-full gap-1.5" style={{ backgroundColor: "#E2E8F0" }}>
              <button
                type="button"
                onClick={() => setActiveTab("practitioner")}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 min-h-[44px] flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: activeTab === "practitioner" ? "#0F172A" : "transparent",
                  color: activeTab === "practitioner" ? "#FFFFFF" : "#0F172A",
                  boxShadow: activeTab === "practitioner" ? "0 4px 14px rgba(15, 23, 42, 0.4)" : "none",
                  transform: activeTab === "practitioner" ? "scale(1.02)" : "scale(1)",
                }}
              >
                🩺 For Practitioners (0% Commission)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("learner")}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 min-h-[44px] flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: activeTab === "learner" ? "#10B981" : "transparent",
                  color: activeTab === "learner" ? "#FFFFFF" : "#0F172A",
                  boxShadow: activeTab === "learner" ? "0 4px 14px rgba(16, 185, 129, 0.4)" : "none",
                  transform: activeTab === "learner" ? "scale(1.02)" : "scale(1)",
                }}
              >
                🎓 For Learners (100% Free Forever)
              </button>
            </div>
          )}
        </div>

        {/* ─── LEARNER 100% FREE SHOWCASE CARD ─── */}
        {activeTab === "learner" ? (
          <div className="max-w-4xl mx-auto pt-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 relative overflow-hidden" style={{ border: "2px solid #10B981" }}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "#ECFDF5",
                      color: "#047857",
                      fontWeight: 800,
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "6px 16px",
                      borderRadius: "9999px",
                      border: "1px solid #A7F3D0",
                      marginBottom: "12px",
                    }}
                  >
                    <HiSparkles /> 100% FREE FOR ALL LEARNERS
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    Unlimited Platform Access
                  </h3>
                  <p className="text-slate-600 font-medium text-sm sm:text-base mt-2">
                    Every learner account is completely free forever. No monthly membership fees, no surprise paywalls.
                  </p>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: "48px", fontWeight: 900, color: "#059669", lineHeight: 1 }}>₹0</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>
                    Free Forever
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                {[
                  { title: "Free Course Access", desc: "Watch and complete all practitioner free video courses without limits.", icon: FiBookOpen },
                  { title: "Live Circles & Cohorts", desc: "Join small-group wellbeing and peer support circles hosted by practitioners.", icon: FiUsers },
                  { title: "Daily Mood Check-ins", desc: "Track daily reflections, feelings, and wellbeing momentum.", icon: FiHeart },
                  { title: "AURA AI Companion", desc: "Consent-first AI reflection assistant and aftercare notes companion.", icon: HiSparkles },
                  { title: "1:1 Session Bookings", desc: "Connect directly with verified licensed practitioners & therapists.", icon: FiMessageSquare },
                  { title: "Secure Health Records", desc: "Encrypted personal reflections, notes, and digital vault.", icon: FiShield },
                ].map((feat, idx) => {
                  const Icon = feat.icon
                  return (
                    <div key={idx} className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "12px",
                          background: "#D1FAE5",
                          color: "#047857",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: "18px",
                        }}
                      >
                        <Icon />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{feat.title}</h4>
                        <p className="text-slate-600 text-xs leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-100">
                {token ? (
                  <button
                    type="button"
                    onClick={() => navigate("/app/courses")}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer font-extrabold text-sm px-8 py-3.5 rounded-full text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <span>Go to Courses Library</span>
                    <FiArrowRight size={18} />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate("/signup")}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer font-extrabold text-sm px-8 py-3.5 rounded-full text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-all"
                    >
                      <span>Create Free Account</span>
                      <FiArrowRight size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="w-full sm:w-auto flex items-center justify-center cursor-pointer font-bold text-sm px-8 py-3.5 rounded-full text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all"
                    >
                      <span>Learner Login</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ─── PRACTITIONER PRICING 3-CARDS + 12-FEATURES GRID ─── */
          <div className="pt-2">
            
            {/* 3 Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch max-w-7xl mx-auto">
              
              {/* Card 1: Monthly Practitioner Pro */}
              <div className="bg-white rounded-3xl p-7 sm:p-8 flex flex-col justify-between border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div>
                  <div className="text-[11px] font-extrabold tracking-widest text-slate-500 uppercase mb-2">
                    MONTHLY
                  </div>
                  <h3 
                    className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Practitioner Pro
                  </h3>
                  <p className="text-xs text-slate-500 min-h-[34px] leading-relaxed">
                    The complete practitioner toolkit, billed month to month.
                  </p>

                  <div className="mt-4 mb-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">₹6,000</span>
                    <span className="text-sm font-semibold text-slate-500 ml-1">/month</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-6 font-medium">
                    ₹72,000 billed across 12 months
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePayNow("pro_monthly")}
                    disabled={payingPlan === "pro_monthly"}
                    className="w-full py-3.5 px-6 rounded-full font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mb-8 hover:opacity-90"
                    style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}
                  >
                    <span>{payingPlan === "pro_monthly" ? "Opening Razorpay..." : "Join as a Practitioner →"}</span>
                  </button>

                  <ul className="space-y-3.5 text-xs text-slate-700 font-medium">
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "#059669",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>0% commission. Keep 100% of your fees</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "#059669",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>Clients pay you directly</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "#059669",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>Verified profile &amp; priority placement</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "#059669",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>Unlimited sessions, Circles and offers</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "#059669",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>AURA Aftercare Notes &amp; client sequences</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-4 mt-8 text-center text-xs font-semibold text-slate-500">
                  0% commission · You keep 100%
                </div>
              </div>

              {/* Card 2: Annual Practitioner Pro (Best Value) */}
              <div
                className="bg-white rounded-3xl p-7 sm:p-8 flex flex-col justify-between relative shadow-xl transform lg:-translate-y-2"
                style={{ border: "2px solid #2563EB" }}
              >
                {/* Floating "Best value" Badge */}
                <span
                  style={{
                    position: "absolute",
                    top: "-14px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#2563EB",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    padding: "4px 16px",
                    borderRadius: "9999px",
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Best value
                </span>

                <div>
                  <div className="text-[11px] font-extrabold tracking-widest text-slate-500 uppercase mb-2">
                    ANNUAL
                  </div>
                  <h3 
                    className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Practitioner Pro
                  </h3>
                  <p className="text-xs text-slate-500 min-h-[34px] leading-relaxed">
                    The same complete toolkit, with a year of extras.
                  </p>

                  <div className="mt-4 mb-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">₹50,000</span>
                    <span className="text-sm font-semibold text-slate-500 ml-1">/year</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-6 font-medium">
                    Works out to ₹4,167/month · <span style={{ color: "#2563EB", fontWeight: 800 }}>Save ₹22,000</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePayNow("pro_annual")}
                    disabled={payingPlan === "pro_annual"}
                    className="w-full py-3.5 px-6 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer mb-8 text-white hover:opacity-95"
                    style={{ backgroundColor: "#2563EB", boxShadow: "0 10px 24px rgba(37, 99, 235, 0.28)" }}
                  >
                    <span>{payingPlan === "pro_annual" ? "Opening Razorpay..." : "Join for the Year →"}</span>
                  </button>

                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 mb-3">
                    EVERYTHING IN MONTHLY, PLUS
                  </div>

                  <ul className="space-y-3.5 text-xs text-slate-700 font-medium">
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "#059669",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>About 3.5 months free every year</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "#059669",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>Your price locked for 12 months</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "#059669",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>Featured Spotlight in the directory</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "#059669",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>Concierge onboarding: we set up your profile and first offers</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-4 mt-8 text-center text-xs font-semibold text-slate-500">
                  0% commission · You keep 100%
                </div>
              </div>

              {/* Card 3: White Label Master Studio */}
              <div
                className="rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-2xl text-white relative"
                style={{ backgroundColor: "#0F172A", border: "1px solid #1E293B" }}
              >
                <div>
                  <div className="text-[11px] font-extrabold tracking-widest text-slate-300 uppercase mb-2">
                    WHITE LABEL
                  </div>
                  <h3 
                    className="text-2xl sm:text-3xl font-bold text-white mb-1"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Master Studio
                  </h3>
                  <p className="text-xs text-slate-300 min-h-[34px] leading-relaxed">
                    Your own coaching platform, powered by OpenHand.
                  </p>

                  <div className="mt-4 mb-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white">Tailored</span>
                  </div>
                  <div className="text-xs text-slate-300 mb-6 font-medium">
                    Priced around your studio's size and needs
                  </div>

                  <Link
                    to="/contact-us"
                    className="w-full py-3.5 px-6 rounded-full font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mb-8 hover:bg-slate-100"
                    style={{ backgroundColor: "#FFFFFF", color: "#0F172A" }}
                  >
                    <span>Talk to Us →</span>
                  </Link>

                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-300 mb-3">
                    EVERYTHING IN PRACTITIONER PRO, PLUS
                  </div>

                  <ul className="space-y-3.5 text-xs text-slate-200 font-medium">
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "rgba(255, 255, 255, 0.18)",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>Your brand and your domain, with no OpenHand branding</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "rgba(255, 255, 255, 0.18)",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>Branded mobile app with your name and logo</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "rgba(255, 255, 255, 0.18)",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>Add your team of coaches under one studio</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "rgba(255, 255, 255, 0.18)",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>Run your own programmes, cohorts and certifications</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "rgba(255, 255, 255, 0.18)",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>Connect your own payment account. Money goes straight to you</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "rgba(255, 255, 255, 0.18)",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>Zapier &amp; API integration</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "rgba(255, 255, 255, 0.18)",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>Dedicated account manager</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          backgroundColor: "rgba(255, 255, 255, 0.18)",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                        </svg>
                      </span>
                      <span>White-glove migration of your existing clients</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-dashed border-slate-700 pt-4 mt-8 text-center text-xs font-semibold text-slate-400">
                  White label · 0% commission
                </div>
              </div>

            </div>

            {/* ─── 12-Item Feature Breakdown Section (Screenshot 2) ─── */}
            <div 
              className="mt-16 sm:mt-20 rounded-[32px] p-6 sm:p-12 shadow-xs max-w-7xl mx-auto"
              style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}
            >
              <div className="text-center max-w-3xl mx-auto mb-10">
                <h3 
                  className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Every Practitioner Pro membership includes
                </h3>
                <p className="text-slate-600 text-sm sm:text-base font-medium mt-2">
                  Monthly or annual, you get the full toolkit from day one.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {INCLUDED_PRACTITIONER_FEATURES.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3.5 hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <span
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "9999px",
                        backgroundColor: "#059669",
                        color: "#FFFFFF",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      <svg width="12" height="9" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                      </svg>
                    </span>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm mb-1 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-slate-600 text-xs leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </section>
  )
}
