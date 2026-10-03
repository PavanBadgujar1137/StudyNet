import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import {
  FiShield,
  FiHeart,
  FiBookOpen,
  FiUsers,
  FiHome,
} from "react-icons/fi"
import { HiSparkles } from "react-icons/hi"
import toast from "react-hot-toast"
import OHEyebrow from "./OHEyebrow"
import { apiConnector } from "../../services/apiConnector"



export default function OHPricingSection({
  defaultRole = "practitioner",
  role,
  onRoleChange,
  title,
  subtitle,
  hideRoleSwitcher = false,
  isModal = false,
  onSuccess,
}) {
  const [internalTab, setInternalTab] = useState(defaultRole) // "learner" | "practitioner"
  const activeTab = role !== undefined ? role : internalTab

  const handleTabChange = (newTab) => {
    setInternalTab(newTab)
    if (onRoleChange) {
      onRoleChange(newTab)
    }
  }

  const [billingCycle, setBillingCycle] = useState("monthly") // "monthly" | "yearly"
  const [payingPlan, setPayingPlan] = useState(null)

  useEffect(() => {
    if (role === undefined) {
      setInternalTab(defaultRole)
    }
  }, [defaultRole, role])

  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()

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
              if (subRes?.data?.success && onSuccess) {
                onSuccess(subRes.data)
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
    <section className={isModal ? "py-6 bg-transparent" : "bg-white border-b border-slate-200/80"} id="pricing" style={isModal ? {} : { paddingTop: "44px", paddingBottom: "64px" }}>
      <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-5xl mx-auto mb-2">
          
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
                We don't just host your practice. <br />
                <span className="italic font-bold" style={{ color: "#2563EB" }}>
                  We grow it with you.
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
                Other platforms just give you tools. OpenHand actively brings you mentees, builds your reach, and grows your practice — for a flat 10%, with ₹0 to start.
              </p>

              {/* 3 Metric Highlights as Points */}
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-6 max-w-3xl mx-auto">
                <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm sm:text-[15px]">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-xs font-black shrink-0">
                    ✓
                  </span>
                  <span><strong className="text-slate-900 font-extrabold">₹0</strong> to start</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm sm:text-[15px]">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center text-xs font-black shrink-0">
                    ✓
                  </span>
                  <span><strong className="text-slate-900 font-extrabold">10%</strong> flat, every channel</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm sm:text-[15px]">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-[#7C3AED] flex items-center justify-center text-xs font-black shrink-0">
                    ✓
                  </span>
                  <span><strong className="text-slate-900 font-extrabold">1</strong> growth partner, every plan</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <OHEyebrow>100% Free for Learners</OHEyebrow>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight my-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                OpenHand is{" "}
                <span className="italic font-bold" style={{ color: "#2563EB" }}>
                  100% Completely Free
                </span>{" "}
                for Learners
              </h2>
              <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed max-w-3xl mx-auto">
                No subscriptions. No credit card required. Register, log in, and access practitioner free courses, live circles, daily check-ins, and AURA AI freely.
              </p>
            </>
          )}

          {/* Role Switcher Tabs */}
          {!hideRoleSwitcher && (
            <div className="inline-flex flex-col sm:flex-row items-center p-1.5 rounded-2xl mt-5 shadow-sm border border-slate-300 max-w-full gap-1.5" style={{ backgroundColor: "#E2E8F0" }}>
              <button
                type="button"
                onClick={() => handleTabChange("practitioner")}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 min-h-[44px] flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: activeTab === "practitioner" ? "#0F172A" : "transparent",
                  color: activeTab === "practitioner" ? "#FFFFFF" : "#0F172A",
                  boxShadow: activeTab === "practitioner" ? "0 4px 14px rgba(15, 23, 42, 0.4)" : "none",
                  transform: activeTab === "practitioner" ? "scale(1.02)" : "scale(1)",
                }}
              >
                🩺 For Practitioners
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("learner")}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 min-h-[44px] flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: activeTab === "learner" ? "#2563EB" : "transparent",
                  color: activeTab === "learner" ? "#FFFFFF" : "#0F172A",
                  boxShadow: activeTab === "learner" ? "0 4px 14px rgba(37, 99, 235, 0.35)" : "none",
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
          <div className="max-w-5xl mx-auto pt-4">
            <div className="bg-white rounded-[28px] sm:rounded-[32px] border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row">
              {/* Left Panel: Vibrant Gradient Hero */}
              <div
                className="w-full md:w-[350px] lg:w-[370px] shrink-0 p-8 sm:p-10 flex flex-col justify-between text-white"
                style={{
                  background: "linear-gradient(150deg, #372ba8 0%, #204de8 45%, #0066ff 100%)",
                }}
              >
                <div>
                  {/* Pill Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold text-white bg-white/20 backdrop-blur-sm">
                    <span className="text-xs font-black">✓</span>
                    <span>Free forever</span>
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl sm:text-[26px] font-bold text-white mt-7 mb-2 tracking-tight">
                    OpenHand Learner
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-3xl sm:text-4xl font-bold text-white leading-none">₹</span>
                    <span className="text-7xl sm:text-8xl font-black text-white tracking-tight leading-none">0</span>
                  </div>

                  {/* Previous Price Strikethrough */}
                  <div className="text-sm font-medium text-white/80 mt-1 mb-8">
                    Was <span className="line-through">₹999/month</span>
                  </div>
                </div>

                {/* CTA Action */}
                <button
                  type="button"
                  onClick={() => navigate(token ? "/app/courses" : "/signup")}
                  className="w-full bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-900 font-extrabold text-base py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Join free</span>
                  <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>

              {/* Right Panel: Features List */}
              <div className="flex-1 p-8 sm:p-10 lg:p-12 bg-white flex flex-col justify-center">
                <div className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase mb-7">
                  INCLUDED IN YOUR MEMBERSHIP
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
                  {[
                    {
                      title: "All practitioner courses",
                      desc: "Watch and finish any course",
                      icon: FiBookOpen,
                    },
                    {
                      title: "Live group circles",
                      desc: "Join small, guided groups",
                      icon: FiUsers,
                    },
                    {
                      title: "AURA AI companion",
                      desc: "Reflect privately, anytime",
                      icon: HiSparkles,
                    },
                    {
                      title: "Daily mood check-ins",
                      desc: "See how you’re growing",
                      icon: FiHeart,
                    },
                    {
                      title: "Private digital vault",
                      desc: "Your notes, kept secure",
                      icon: FiShield,
                    },
                    {
                      title: "Family sharing",
                      desc: "Add up to 3 family members",
                      icon: FiHome,
                    },
                  ].map((item, idx) => {
                    const Icon = item.icon
                    return (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0 text-xl">
                          <Icon />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-[15px] leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-slate-400 text-xs sm:text-[13px] font-normal mt-0.5 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ─── NEW PRACTITIONER PRICING 3-CARDS WITH MONTHLY / YEARLY TOGGLE ─── */
          <div className="pt-0">
            
            {/* Top Monthly / Yearly Toggle Pill */}
            <div className="flex items-center justify-center mt-3 mb-8">
              <div className="inline-flex items-center p-1.5 rounded-full bg-white border border-slate-200 shadow-sm gap-1">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                    billingCycle === "monthly"
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-900 bg-transparent"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    billingCycle === "yearly"
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-900 bg-transparent"
                  }`}
                >
                  <span>Yearly</span>
                  <span className={`text-[11px] font-extrabold ${billingCycle === "yearly" ? "text-blue-100" : "text-indigo-600 font-black"}`}>
                    save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* 3 Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch w-full max-w-[1540px] mx-auto">
              
              {/* Card 1: Open */}
              <div className="bg-white rounded-[28px] p-7 sm:p-9 flex flex-col justify-between border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 mb-1.5 font-outfit">
                    Open
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 min-h-[36px] leading-relaxed font-medium">
                    Start your practice. We start bringing mentees.
                  </p>

                  <div className="mt-5 mb-1 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">₹0</span>
                    <span className="text-sm font-bold text-slate-500">/ month</span>
                  </div>
                  <div className="text-xs text-slate-800 mb-7 font-bold">
                    <strong className="text-slate-900 font-extrabold">10%</strong> per booking · every channel
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(token ? "/dashboard" : "/signup?role=practitioner")}
                    className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer mb-8 hover:bg-blue-100 active:scale-[0.98]"
                    style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #DBEAFE" }}
                  >
                    <span>Start free →</span>
                  </button>

                  <ul className="space-y-3.5 text-xs sm:text-[13px] text-slate-700 font-medium">
                    {[
                      "Flat 10% on every booking — your link or ours",
                      "Growth Hand onboarding: profile & positioning review",
                      "Listed in OpenHand mentee discovery",
                      "1:1, group sessions, webinars & packages",
                      "Built-in HD Session Room",
                      "Verified Practitioner badge",
                      "72-hour working day payouts (UPI / bank)",
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "9999px",
                            backgroundColor: "#3B82F6",
                            color: "#FFFFFF",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                          </svg>
                        </span>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card 2: Pro (Most Chosen) */}
              <div
                className="bg-white rounded-[28px] p-7 sm:p-9 flex flex-col justify-between relative shadow-xl transform lg:-translate-y-1"
                style={{ border: "2px solid #6366F1" }}
              >
                {/* Floating "Most chosen" Badge */}
                <span
                  style={{
                    position: "absolute",
                    top: "-14px",
                    right: "24px",
                    background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "4px 14px",
                    borderRadius: "9999px",
                    boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Most chosen
                </span>

                <div>
                  <h3 className="text-3xl font-black text-slate-900 mb-1.5 font-outfit">
                    Pro
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 min-h-[36px] leading-relaxed font-medium">
                    A growth partner working on your practice every month.
                  </p>

                  <div className="mt-5 mb-1 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                      {billingCycle === "yearly" ? "₹799" : "₹999"}
                    </span>
                    <span className="text-sm font-bold text-slate-500">
                      {billingCycle === "yearly" ? "/ month, billed yearly" : "/ month"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-800 mb-7 font-bold">
                    <strong className="text-slate-900 font-extrabold">5%</strong> per booking · every channel
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePayNow(billingCycle === "yearly" ? "pro_yearly" : "pro_monthly")}
                    disabled={payingPlan === (billingCycle === "yearly" ? "pro_yearly" : "pro_monthly")}
                    className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer mb-8 text-white shadow-lg hover:opacity-95 active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                      boxShadow: "0 10px 24px rgba(79, 70, 229, 0.35)",
                    }}
                  >
                    <span>
                      {payingPlan === (billingCycle === "yearly" ? "pro_yearly" : "pro_monthly")
                        ? "Opening Razorpay..."
                        : "Grow with Pro →"}
                    </span>
                  </button>

                  <ul className="space-y-3.5 text-xs sm:text-[13px] text-slate-700 font-medium">
                    {[
                      "Everything in Open — commission drops to 5%",
                      "Monthly growth review with an OpenHand mentor",
                      "Priority mentee matching & featured placement",
                      "Visibility campaigns: spotlights, collaborations, events",
                      "Programs, cohorts & memberships",
                      "AI session notes & client progress insights",
                      "Custom domain & white-label booking page",
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "9999px",
                            backgroundColor: "#3B82F6",
                            color: "#FFFFFF",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                          </svg>
                        </span>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card 3: Institution */}
              <div className="bg-white rounded-[28px] p-7 sm:p-9 flex flex-col justify-between border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 mb-1.5 font-outfit">
                    Institution
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 min-h-[36px] leading-relaxed font-medium">
                    Academies, colleges &amp; coaching firms.
                  </p>

                  <div className="mt-5 mb-1 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Custom</span>
                  </div>
                  <div className="text-xs text-slate-800 mb-7 font-bold">
                    Custom commission
                  </div>

                  <Link
                    to="/contact-us"
                    className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer mb-8 hover:bg-slate-200 active:scale-[0.98]"
                    style={{ backgroundColor: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0" }}
                  >
                    <span>Talk to us →</span>
                  </Link>

                  <ul className="space-y-3.5 text-xs sm:text-[13px] text-slate-700 font-medium">
                    {[
                      "Everything in Pro",
                      "Custom commission — as low as 0%",
                      "Dedicated growth & success manager",
                      "Multi-practitioner teams & roles",
                      "LMS, certification & cohort workflows",
                      "API, SSO & data export",
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "9999px",
                            backgroundColor: "#3B82F6",
                            color: "#FFFFFF",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1.5 4 3.8 6.3 8.5 1.5" />
                          </svg>
                        </span>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </section>
  )
}
