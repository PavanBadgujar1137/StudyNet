import React, { useState, useEffect } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiArrowRight,
  FiZap,
  FiCheck,
  FiExternalLink,
  FiArrowLeft,
  FiAward,
} from "react-icons/fi"
import toast from "react-hot-toast"
import { apiConnector } from "../../services/apiConnector"
import PayGlocalCheckoutModal from "../../components/openhand/PayGlocalCheckoutModal"
import OHFooter from "../../components/openhand/OHFooter"

// Available Time Slots for Onboarding Calls
const TIME_SLOTS = [
  "10:00 AM - 10:45 AM IST",
  "11:30 AM - 12:15 PM IST",
  "02:00 PM - 02:45 PM IST",
  "03:30 PM - 04:15 PM IST",
  "05:00 PM - 05:45 PM IST",
  "06:30 PM - 07:15 PM IST",
]

const MODALITIES = [
  "Psychology & Mental Health",
  "Executive & Career Coaching",
  "Mindfulness & Meditation",
  "Yoga & Somatic Movement",
  "Nutrition & Wellness",
  "Alternative & Holistic Healing",
  "Relationship & Family Counseling",
  "Other Healing Practice",
]

export default function ScheduleSubscriptionCall() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)

  const planKey = searchParams.get("plan") || "pro_yearly"

  // Generate next 14 business/calendar dates
  const generateDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 14; i++) {
      const d = new Date()
      d.setDate(today.getDate() + i)
      const dateString = d.toISOString().split("T")[0]
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" })
      const monthName = d.toLocaleDateString("en-US", { month: "short" })
      const dayNum = d.getDate()
      dates.push({
        dateString,
        dayName,
        monthName,
        dayNum,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      })
    }
    return dates
  }

  const availableDates = generateDates()

  // Form State
  const [selectedDate, setSelectedDate] = useState(availableDates[0]?.dateString)
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1])
  const [formData, setFormData] = useState({
    name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
    email: user?.email || "",
    phone: user?.contactNumber || "",
    modality: MODALITIES[0],
    goals: "",
  })

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: prev.email || user.email || "",
        phone: prev.phone || user.contactNumber || "",
      }))
    }
  }, [user])

  // Payment & Modal State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [payglocalOrderData, setPayglocalOrderData] = useState(null)
  const [isPayglocalOpen, setIsPayglocalOpen] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(null)

  // Plan Details
  const planInfo = {
    name: "Pro Plan (Yearly)",
    price: 9588,
    monthlyEquivalent: 799,
    commission: "5%",
    features: [
      "Everything in Open — commission drops to 5%",
      "Monthly growth review with an OpenHand mentor",
      "Priority mentee matching & featured placement",
      "Visibility campaigns: spotlights & collaborations",
      "AI session notes & client progress insights",
      "Automated 72-Hour PayGlocal salary payouts to Bank/UPI",
      "Built-in HD Session Room & custom domain",
    ],
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Generate Google Calendar Link
  const buildGoogleCalendarUrl = (dateStr, timeSlot) => {
    const startTimeMatch = timeSlot?.match(/(\d+):(\d+)\s*(AM|PM)/i)
    let startHour = 11
    let startMinute = 30
    if (startTimeMatch) {
      let h = parseInt(startTimeMatch[1], 10)
      const m = parseInt(startTimeMatch[2], 10)
      const meridiem = startTimeMatch[3].toUpperCase()
      if (meridiem === "PM" && h < 12) h += 12
      if (meridiem === "AM" && h === 12) h = 0
      startHour = h
      startMinute = m
    }
    const cleanDate = (dateStr || "").replace(/-/g, "")
    const pad = (n) => String(n).padStart(2, "0")
    const startDateStr = `${cleanDate}T${pad(startHour)}${pad(startMinute)}00`
    const endHour = startMinute + 45 >= 60 ? startHour + 1 : startHour
    const endMinute = (startMinute + 45) % 60
    const endDateStr = `${cleanDate}T${pad(endHour)}${pad(endMinute)}00`

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: "OpenHand Practitioner Onboarding & Guiding Call",
      dates: `${startDateStr}/${endDateStr}`,
      details: `1-on-1 Guiding & Onboarding session for OpenHand Pro Yearly Subscription with OpenHand Connect Team.\nPractitioner: ${formData.name}\nEmail: ${formData.email}\nGoogle Meet link will be provided by OpenHand via email.`,
      location: "Google Meet",
      ctz: "Asia/Kolkata",
    })
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  // Handle Form Submission -> Initialize PayGlocal
  const handleProceedToPayment = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Please enter your full name")
      return
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }
    if (!selectedDate) {
      toast.error("Please select a date for your call")
      return
    }
    if (!selectedSlot) {
      toast.error("Please select a time slot for your call")
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading("Initializing PayGlocal Gateway...")

    try {
      const payload = {
        planKey: "pro_yearly",
        scheduledDate: selectedDate,
        scheduledTimeSlot: selectedSlot,
        timezone: "Asia/Kolkata (IST)",
        modality: formData.modality,
        goals: formData.goals,
        practitionerName: formData.name.trim(),
        practitionerEmail: formData.email.trim(),
        practitionerPhone: formData.phone.trim(),
      }

      const res = await apiConnector(
        "POST",
        "/api/v1/plans/subscribe-and-schedule",
        payload,
        token ? { Authorization: `Bearer ${token}` } : null
      )

      if (!res?.data?.success || !res?.data?.order) {
        toast.error(res?.data?.message || "Failed to initialize payment.", { id: toastId })
        setIsSubmitting(false)
        return
      }

      toast.dismiss(toastId)
      setPayglocalOrderData({
        ...res.data,
        planKey: "pro_yearly",
        prefill: {
          name: formData.name,
          email: formData.email,
          contactNumber: formData.phone,
        },
      })
      setIsPayglocalOpen(true)
    } catch (err) {
      console.error("Order initialization error:", err)
      toast.error("Payment initialization failed. Please try again.", { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle PayGlocal Payment Success & Verification
  const handlePayGlocalSuccess = async (response) => {
    const verifyToastId = toast.loading("Verifying payment with PayGlocal...")
    try {
      const googleCalendarUrl = buildGoogleCalendarUrl(selectedDate, selectedSlot)

      const verifyPayload = {
        payglocal_order_id: response.payglocal_order_id || response.merchantTxnId,
        payglocal_payment_id: response.payglocal_payment_id || response.gid,
        payglocal_gid: response.payglocal_gid || response.gid,
        signature: response.signature,
        planKey: "pro_yearly",
        scheduledDate: selectedDate,
        scheduledTimeSlot: selectedSlot,
        timezone: "Asia/Kolkata (IST)",
        modality: formData.modality,
        goals: formData.goals,
        practitionerName: formData.name,
        practitionerEmail: formData.email,
        practitionerPhone: formData.phone,
        googleCalendarEventUrl: googleCalendarUrl,
      }

      const verifyRes = await apiConnector(
        "POST",
        "/api/v1/plans/verify-subscription-and-schedule",
        verifyPayload,
        token ? { Authorization: `Bearer ${token}` } : null
      )

      if (verifyRes?.data?.success) {
        toast.success("Payment verified! Onboarding call scheduled 🎉", { id: verifyToastId })
        setBookingConfirmed({
          ...verifyRes.data.scheduleCall,
          googleCalendarUrl,
        })
      } else {
        toast.error(verifyRes?.data?.message || "Payment verification failed", { id: verifyToastId })
      }
    } catch (err) {
      console.error("Verification error:", err)
      toast.error("Payment verification failed. Please contact support.", { id: verifyToastId })
    } finally {
      setIsPayglocalOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-inter text-slate-800">
      {/* Top Banner Navigation */}
      <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/pricing" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition">
            <FiArrowLeft /> Back to Pricing
          </Link>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <FiShield className="text-blue-600" /> PayGlocal Verified Gateway
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Step Progression */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider mb-3">
            <FiCalendar className="text-indigo-600" /> Practitioner Yearly Onboarding
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-outfit">
            Book a Call &amp; Take Subscription
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Reserve your 1-on-1 strategy call with our OpenHand growth team via Google Calendar, complete your 1-time yearly subscription with PayGlocal, and unlock full practitioner features.
          </p>
        </div>

        {/* ─── SUCCESS SCREEN WHEN CALL + SUBSCRIPTION IS COMPLETED ─── */}
        {bookingConfirmed ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-6 shadow-sm">
              <FiCheckCircle />
            </div>

            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
              Confirmed &amp; Activated
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-outfit">
              You're All Set, {formData.name || "Practitioner"}!
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Your 1-Year Pro Plan subscription (₹9,588) has been activated via PayGlocal, and your 1-on-1 guiding call has been reserved.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8 space-y-3">
              <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">Scheduled Date</span>
                <span className="font-bold text-slate-900">{bookingConfirmed.scheduledDate}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">Time Slot</span>
                <span className="font-bold text-slate-900">{bookingConfirmed.scheduledTimeSlot}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">Practitioner Email</span>
                <span className="font-bold text-slate-900">{formData.email}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">Plan Activated</span>
                <span className="font-bold text-indigo-600">Pro Plan (1 Year Validity)</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1">
                <span className="text-slate-500 font-medium">Payout Guarantee</span>
                <span className="font-bold text-emerald-600">Automated 72-Hour PayGlocal Settlements</span>
              </div>
            </div>

            {/* Google Calendar Quick Add Button */}
            {bookingConfirmed.googleCalendarUrl && (
              <a
                href={bookingConfirmed.googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-white border-2 border-blue-600 text-blue-600 font-bold text-sm hover:bg-blue-50 transition flex items-center justify-center gap-2 mb-4"
              >
                <FiCalendar className="text-lg" /> Add Event to Google Calendar <FiExternalLink />
              </a>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-800 text-left mb-8 leading-relaxed">
              <strong>📞 What happens next?</strong><br />
              1. A confirmation receipt has been sent to <b>{formData.email}</b>.<br />
              2. Our OpenHand Connect Team has received your booking in the Admin Panel.<br />
              3. We will send you your official <b>Google Meet Call Link</b> via email prior to your scheduled time.<br />
              4. You can start setting up your services, packages, and profile on your Practitioner dashboard!
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate(token ? "/practice" : "/login")}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg hover:opacity-95 transition"
              >
                Go to Practitioner Dashboard →
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          /* ─── BOOKING & PAYMENT INTERFACE ─── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Calendar & Booking Form (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Step 1: Google Calendar Date Picker */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 font-outfit">
                      Select Date (Google Calendar)
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Asia/Kolkata (IST)</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                  {availableDates.map((item) => {
                    const isSelected = selectedDate === item.dateString
                    return (
                      <button
                        key={item.dateString}
                        type="button"
                        onClick={() => setSelectedDate(item.dateString)}
                        className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300"
                            : "bg-slate-50 hover:bg-blue-50/60 border-slate-200 text-slate-700"
                        }`}
                      >
                        <span className={`text-[11px] font-bold uppercase ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                          {item.dayName}
                        </span>
                        <span className="text-lg font-extrabold my-0.5">{item.dayNum}</span>
                        <span className={`text-[10px] font-medium ${isSelected ? "text-blue-200" : "text-slate-500"}`}>
                          {item.monthName}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Step 2: Time Slot Selector */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-outfit">
                    Choose Time Slot
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedSlot === slot
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 px-4 rounded-xl border text-left font-semibold text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? "bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-300 font-bold"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FiClock className={isSelected ? "text-blue-600" : "text-slate-400"} />
                          <span>{slot}</span>
                        </div>
                        {isSelected && <FiCheck className="text-blue-600 text-base" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Step 3: Practitioner Details Form */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-outfit">
                    Practitioner Information
                  </h3>
                </div>

                <form onSubmit={handleProceedToPayment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Full Name *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Dr. / Coach Full Name"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                        Email Address *
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="doctor@example.com"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                        Phone / WhatsApp
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Primary Healing / Coaching Modality
                    </label>
                    <select
                      name="modality"
                      value={formData.modality}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {MODALITIES.map((mod) => (
                        <option key={mod} value={mod}>
                          {mod}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      What would you like to achieve in this onboarding call?
                    </label>
                    <textarea
                      name="goals"
                      rows={3}
                      value={formData.goals}
                      onChange={handleInputChange}
                      placeholder="e.g. Discuss mentee discovery, setting up group webinars, pricing packages..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Submission CTA for mobile */}
                  <div className="pt-2 block lg:hidden">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-base shadow-xl hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>
                        {isSubmitting ? "Initializing PayGlocal..." : `Confirm Schedule & Pay ₹9,588 via PayGlocal →`}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Order Summary & PayGlocal Checkout Trigger (5 Cols) */}
            <div className="lg:col-span-5 sticky top-8 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                    Annual Practitioner Plan
                  </span>
                  <span className="text-xs font-semibold text-slate-500">1-Year Pass</span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 font-outfit mb-1">
                  {planInfo.name}
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  A dedicated growth partner working with your practice every month.
                </p>

                {/* Pricing Block */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-4xl font-black text-slate-900 tracking-tight">₹9,588</span>
                    <span className="text-xs font-bold text-slate-500">/ 1-time yearly</span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    Equivalent to <strong className="text-slate-900">₹799/month</strong> billed annually.
                  </div>
                </div>

                {/* Scheduled Call Info Review */}
                <div className="border border-blue-100 bg-blue-50/50 rounded-2xl p-4 mb-6 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-blue-900">
                    <FiCalendar className="text-blue-600 text-sm shrink-0" />
                    <span>Your Selected Schedule:</span>
                  </div>
                  <div className="pl-6 text-slate-700 space-y-1">
                    <div><b>Date:</b> {selectedDate}</div>
                    <div><b>Slot:</b> {selectedSlot}</div>
                    <div><b>Platform:</b> Google Meet (Link sent via Email)</div>
                  </div>
                </div>

                {/* Features Included List */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Features Unlocked Immediately:
                  </h4>
                  <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                    {planInfo.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-black">
                          ✓
                        </span>
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 72-Hour Payout & Tax Guarantee Callout */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 mb-6 text-xs text-emerald-900 leading-relaxed">
                  <div className="font-extrabold flex items-center gap-1.5 text-emerald-800 mb-1">
                    <FiAward className="text-emerald-600 text-sm" /> 72-Hour Automated Payouts
                  </div>
                  Learners pay 100% of course &amp; session fees to OpenHand. Your earnings are automatically disbursed to your bank or UPI within <b>72 hours</b> via PayGlocal, with a transparent 5% platform fee and applicable tax deduction.
                </div>

                {/* Payment Submit Button */}
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl text-white font-extrabold text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                    boxShadow: "0 10px 24px rgba(79, 70, 229, 0.35)",
                  }}
                >
                  <span>
                    {isSubmitting ? "Initializing PayGlocal..." : `Confirm Schedule & Pay ₹9,588 →`}
                  </span>
                </button>

                <div className="mt-4 text-center">
                  <span className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
                    <FiShield className="text-emerald-600" /> Secure international checkout powered by PayGlocal
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* PayGlocal Checkout Modal */}
      <PayGlocalCheckoutModal
        isOpen={isPayglocalOpen}
        onClose={() => setIsPayglocalOpen(false)}
        orderData={payglocalOrderData}
        onSuccess={handlePayGlocalSuccess}
        onError={(err) => {
          console.error("PayGlocal modal error:", err)
          toast.error("PayGlocal payment did not complete.")
        }}
      />

      <OHFooter />
    </div>
  )
}
