import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { FiShield } from "react-icons/fi"
import toast from "react-hot-toast"
import OHEyebrow from "./OHEyebrow"
import { apiConnector } from "../../services/apiConnector"

export default function OHPricingSection({ defaultRole = "learner", title, subtitle, hideRoleSwitcher = false, isModal = false, onSuccess }) {
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
      toast.error("Please login to subscribe to a plan.")
      navigate("/login")
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

      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: "OpenHand Wellbeing Platform",
        description: `Subscription: ${planName}`,
        order_id: order.id,
        prefill: {
          name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "",
          email: user?.email || "",
          ...(
            (() => {
              const rawPhone = user?.additionalDetails?.contactNumber || user?.contactNumber
              if (rawPhone && rawPhone !== 'null' && rawPhone !== 'undefined') {
                const trimmed = String(rawPhone).trim()
                if (trimmed.length > 0) return { contact: trimmed }
              }
              return {}
            })()
          ),
        },
        theme: {
          color: "#1F5FE0",
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

              // Refresh subscription status
              const subRes = await apiConnector("GET", "/api/v1/payments/subscription/mine", null, {
                Authorization: `Bearer ${token}`,
              })
              if (subRes?.data?.success) {
                setSubStatus(subRes.data)
                if (onSuccess) onSuccess(subRes.data)
              } else if (onSuccess) {
                onSuccess()
              }

              // Redirect based on user role
              setTimeout(() => {
                if (user?.accountType === "Practitioner" || user?.accountType === "Instructor") {
                  navigate("/practice")
                } else {
                  navigate("/app/courses")
                }
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

  const learnerPlans = [
    {
      key: "beginner",
      name: "Beginner Plan",
      price: "₹51",
      period: "/month",
      tagline: "Essential membership for individuals starting their mental health & wellbeing journey.",
      badge: "BEGINNER MEMBERSHIP",
      featured: false,
      features: [
        "Access to core free practitioner courses & library",
        "1 Monthly live Circle pass included",
        "Daily mood check-ins & guided reflection prompts",
        "Personal AI health & reflection assistant (AURA)",
        "Standard 1:1 session booking access",
        "Secure digital health record vault",
      ],
    },
    {
      key: "advance",
      name: "Advance Plan",
      price: "₹151",
      period: "/month",
      tagline: "For active wellness seekers wanting full access to courses, circles, and session discounts.",
      badge: "MOST POPULAR LEARNER CHOICE",
      featured: true,
      features: [
        "Everything in Beginner Plan",
        "Unlimited access to ALL free practitioner courses",
        "Unlimited access to live Circles",
        "15% discount on all 1:1 practitioner sessions",
        "Live in-session AURA companion & real-time insights",
        "Priority session scheduling & waitlist bypass",
      ],
    },
    {
      key: "champion",
      name: "Champion Plan",
      price: "₹1,500",
      period: "/month",
      tagline: "Complete wellbeing coverage with a free monthly Session and dedicated support.",
      badge: "CHAMPION MEMBERSHIP",
      featured: false,
      features: [
        "Everything in Advance Plan",
        "1 free 1:1 Session per month",
        "25% discount on additional Sessions",
        "Dedicated care manager & concierge support",
        "Family sharing (up to 3 sub-accounts)",
        "24/7 priority support & instant AURA access",
      ],
    },
  ]

  const practitionerPlans = [
    {
      key: "starter",
      name: "Starter",
      price: "₹999",
      period: "/month",
      tagline: "For practitioners starting and building their online practice.",
      badge: "PLATFORM ACCESS",
      featured: false,
      features: [
        "AURA Aftercare Notes — free on every plan, including free tier",
        "AURA Live Prompts panel — in-session (Starter and above)",
        "Publish 1:1 Session offers",
        "Host 1 live Circle",
        "Directory listing & booking link",
        "Razorpay direct payout integration",
      ],
    },
    {
      key: "growth",
      name: "Growth",
      price: "₹2,999",
      period: "/month",
      tagline: "Scale your practice with unlimited Circles, automations, and branded tools.",
      badge: "MOST POPULAR FOR PRACTITIONERS",
      featured: true,
      features: [
        "Everything in Starter",
        "Unlimited live Circles",
        "Unlimited offer publishing (free & paid)",
        "Automated Check-in & reflection sequences",
        "Priority directory placement & verified badge",
        "Practitioner Network & Peer Supervision Groups",
        "Free learner Memberships to gift clients",
      ],
    },
    {
      key: "master",
      name: "Master Studio",
      price: "₹5,999",
      period: "/month",
      tagline: "For established clinics and high-volume practitioners.",
      badge: "CLINIC & STUDIO",
      featured: false,
      features: [
        "Everything in Growth",
        "0% platform commission on initial earnings & direct T+2 bank payouts",
        "White-label portal & custom domain",
        "Branded app",
        "Dedicated account manager",
        "Zapier / API integration",
        "Circle analytics & learner retention intelligence",
      ],
    },
  ]

  const currentPlans = activeTab === "learner" ? learnerPlans : practitionerPlans

  return (
    <section className={isModal ? "py-6 bg-transparent" : "oh-sec py-16 bg-slate-50 border-t border-b border-slate-200"} id="pricing">
      <div className="oh-wrap max-w-[1360px] mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <OHEyebrow>{activeTab === "learner" ? "Learner Membership Plans" : "Practitioner Platform Plans"}</OHEyebrow>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight my-4">
            {title || (
              <>
                Invest in your care.{" "}
                <span className="oh-grad-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Transparent, direct pricing.
                </span>
              </>
            )}
          </h2>
          <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
            {subtitle ||
              "All payments are processed securely via Razorpay. Choose the plan tailored for your journey below."}
          </p>

          {/* User Active Plan / Trial Status Banner */}
          {token && subStatus && (
            <div
              className="max-w-xl mx-auto mt-6 p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between gap-4 shadow-sm"
              style={{
                background: subStatus.hasActiveSubscription
                  ? "#F0FDF4"
                  : subStatus.isTrialActive
                  ? "#F3E8FF"
                  : "#FEF2F2",
                borderColor: subStatus.hasActiveSubscription
                  ? "#BBF7D0"
                  : subStatus.isTrialActive
                  ? "#E9D5FF"
                  : "#FCA5A5",
                color: subStatus.hasActiveSubscription
                  ? "#166534"
                  : subStatus.isTrialActive
                  ? "#7E22CE"
                  : "#DC2626",
              }}
            >
              <div className="flex items-center gap-2">
                <FiShield size={18} />
                {subStatus.hasActiveSubscription ? (
                  <span>
                    Active Subscription: <strong>{subStatus.subscription?.planName || "Active Plan"}</strong>
                  </span>
                ) : subStatus.isTrialActive ? (
                  <span>
                    ⚡ {activeTab === "learner" ? "7-Day" : "14-Day"} Free Trial Active: <strong>{subStatus.trialDaysRemaining} days remaining</strong>
                  </span>
                ) : (
                  <span>⚠️ {activeTab === "learner" ? "7-Day" : "14-Day"} Free Trial Expired — Subscribe below to unlock all features</span>
                )}
              </div>
            </div>
          )}

          {/* Role Switcher Tabs */}
          {!hideRoleSwitcher && (
            <div className="inline-flex flex-col sm:flex-row items-center p-1.5 rounded-2xl mt-8 shadow-sm border border-slate-300 max-w-full gap-1.5" style={{ backgroundColor: '#E2E8F0' }}>
              <button
                type="button"
                onClick={() => setActiveTab("learner")}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 min-h-[44px] flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: activeTab === "learner" ? "#2563EB" : "transparent",
                  color: activeTab === "learner" ? "#FFFFFF" : "#0F172A",
                  boxShadow: activeTab === "learner" ? "0 4px 14px rgba(37, 99, 235, 0.4)" : "none",
                  transform: activeTab === "learner" ? "scale(1.02)" : "scale(1)",
                }}
              >
                🎓 Learner Plans (From ₹51/mo)
              </button>
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
                🩺 Practitioner Plans (From ₹999/mo)
              </button>
            </div>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="plans-grid grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-4">
          {currentPlans.map((plan) => {
            const isCurrentActive = subStatus?.subscription?.planKey === plan.key

            return (
              <div
                key={plan.key}
                className={`plan-card relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.featured
                    ? "bg-slate-900 text-white border-2 border-indigo-500 shadow-2xl transform md:-translate-y-3"
                    : "bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-lg"
                }`}
              >
                {plan.featured && (
                  <span className="featured-badge absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-5 rounded-full shadow-lg whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h3 className={`text-2xl font-bold mb-2 ${plan.featured ? "text-white" : "text-slate-900"}`}>
                    {plan.name}
                  </h3>
                  <p
                    className={`text-xs mb-6 min-h-[38px] font-medium leading-relaxed ${
                      plan.featured ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {plan.tagline}
                  </p>

                  <div className="price-tag text-4xl font-extrabold mb-3 tracking-tight">
                    {plan.price}
                    <small
                      className={`text-base font-medium ${plan.featured ? "text-slate-300" : "text-slate-500"}`}
                    >
                      {plan.period}
                    </small>
                  </div>

                  {!plan.featured && (
                    <div className="cut-badge bg-blue-50 text-blue-700 font-bold text-[11px] uppercase tracking-wider py-1.5 px-3 rounded-xl mb-6 inline-flex items-center gap-1.5 border border-blue-100">
                      {plan.badge}
                    </div>
                  )}
                  {plan.featured && (
                    <div className="cut-badge bg-indigo-900/60 text-sky-300 font-bold text-[11px] uppercase tracking-wider py-1.5 px-3 rounded-xl mb-6 inline-flex items-center gap-1.5 border border-indigo-500/30">
                      FULL UNLOCK + RAZORPAY SECURE
                    </div>
                  )}

                  <ul
                    className={`plan-features text-sm space-y-3 mb-8 ${
                      plan.featured ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 font-medium text-xs leading-snug">
                        <span
                          className={`font-bold text-sm ${plan.featured ? "text-sky-400" : "text-emerald-600"}`}
                        >
                          ✓
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => handlePayNow(plan.key)}
                    disabled={payingPlan === plan.key || isCurrentActive}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      borderRadius: '9999px',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '14px',
                      cursor: (payingPlan === plan.key || isCurrentActive) ? 'not-allowed' : 'pointer',
                      background: isCurrentActive
                        ? '#10B981'
                        : plan.featured
                        ? 'linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)'
                        : '#0F172A',
                      color: '#FFFFFF',
                      boxShadow: isCurrentActive
                        ? '0 4px 14px rgba(16, 185, 129, 0.3)'
                        : plan.featured
                        ? '0 10px 25px -5px rgba(99, 102, 241, 0.5)'
                        : '0 4px 14px rgba(15, 23, 42, 0.15)',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentActive && payingPlan !== plan.key) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = plan.featured
                          ? '0 15px 30px -5px rgba(99, 102, 241, 0.6)'
                          : '0 8px 20px rgba(15, 23, 42, 0.25)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentActive && payingPlan !== plan.key) {
                        e.currentTarget.style.transform = 'none'
                        e.currentTarget.style.boxShadow = plan.featured
                          ? '0 10px 25px -5px rgba(99, 102, 241, 0.5)'
                          : '0 4px 14px rgba(15, 23, 42, 0.15)'
                      }
                    }}
                  >
                    {payingPlan === plan.key
                      ? "Opening Razorpay..."
                      : isCurrentActive
                      ? "Current Active Plan ✓"
                      : `Subscribe to ${plan.name} — ${plan.price}`}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: plan.featured ? '#94A3B8' : '#64748B', fontWeight: 600, marginTop: '4px' }}>
                    <FiShield size={13} color="#10B981" /> 100% Direct Razorpay Payment
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
