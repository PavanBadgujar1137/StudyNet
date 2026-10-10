import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { setUser } from "../../slices/profileSlice"
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiVideo,
  FiCopy,
  FiDownload,
  FiExternalLink,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
  FiCheck,
} from "react-icons/fi"
import toast from "react-hot-toast"
import { apiConnector } from "../../services/apiConnector"
import PayGlocalCheckoutModal from "./PayGlocalCheckoutModal"
import { countryCodes } from "../../data/countryCodes"

// Available 30-min discovery slots
const DISCOVERY_SLOTS = [
  "11:00am",
  "11:30am",
  "12:00pm",
  "12:30pm",
  "1:00pm",
  "2:00pm",
  "2:30pm",
  "3:00pm",
  "3:30pm",
  "4:00pm",
  "4:30pm",
  "5:00pm",
]

const REFERRAL_OPTIONS = [
  "Instagram",
  "YouTube",
  "LinkedIn",
  "Twitter / X",
  "Google Search",
  "Friend / Colleague Referral",
  "Other",
]

const COMMUNITY_STRENGTH_OPTIONS = [
  "0 - 50 members",
  "50 - 200 members",
  "200 - 500 members",
  "500 - 2,000 members",
  "2,000+ members",
]

const TIMELINE_OPTIONS = [
  "Immediately",
  "Within 1-2 weeks",
  "Within 1 month",
  "Within 3 months",
  "Exploring options",
]

export default function CalendlyDiscoveryModal({
  isOpen = true,
  onClose,
  isEmbedded = false,
  planKey = "pro_yearly",
  planPrice = 9588,
  planName = "Pro Plan (1 Year Validity)",
}) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Real today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Current year/month state for calendar navigation
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  // Selected date & slot state
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 2)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })

  const [selectedSlot, setSelectedSlot] = useState("11:00am")
  const [timeSlotWindow, setTimeSlotWindow] = useState("11:00am - 11:30am")

  // Step state: 1 = date_time, 2 = questions, 3 = confirmed
  const [step, setStep] = useState(1)

  // Questionnaire form data
  const [showAddGuests, setShowAddGuests] = useState(false)
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91")
  const [formData, setFormData] = useState({
    name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
    email: user?.email || "",
    guests: "",
    whatsappNumber: user?.contactNumber ? String(user.contactNumber).trim() : "",
    socialProfileLink: "",
    referralSource: "",
    courseSellingStatus: "",
    otherPlatforms: "",
    paidCommunityStrength: "",
    timelineToMove: "",
    callExpectations: "",
  })

  useEffect(() => {
    if (user) {
      let rawContact = user.contactNumber ? String(user.contactNumber).trim() : ""
      if (rawContact) {
        const sortedCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length)
        const matched = sortedCodes.find((c) => rawContact.startsWith(c.code))
        if (matched) {
          setSelectedCountryCode(matched.code)
          rawContact = rawContact.slice(matched.code.length).trim()
        }
      }
      setFormData((prev) => ({
        ...prev,
        name: prev.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: prev.email || user.email || "",
        whatsappNumber: prev.whatsappNumber || rawContact,
      }))
    }
  }, [user])

  // Payment states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [payglocalOrderData, setPayglocalOrderData] = useState(null)
  const [isPayglocalOpen, setIsPayglocalOpen] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(null)

  // Calendar month helpers
  const year = currentMonth.getFullYear()
  const monthIndex = currentMonth.getMonth()
  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long" })

  const handlePrevMonth = () => {
    const prev = new Date(year, monthIndex - 1, 1)
    if (prev < new Date(today.getFullYear(), today.getMonth(), 1)) return
    setCurrentMonth(prev)
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, monthIndex + 1, 1))
  }

  // Generate calendar days grid (Mon - Sun)
  const getDaysGrid = () => {
    const firstDayOfWeek = new Date(year, monthIndex, 1).getDay()
    const startOffset = (firstDayOfWeek + 6) % 7
    const totalDays = new Date(year, monthIndex + 1, 0).getDate()

    const days = []
    for (let i = 0; i < startOffset; i++) {
      days.push({ dayNum: null, dateStr: null, isPast: true })
    }

    for (let d = 1; d <= totalDays; d++) {
      const dt = new Date(year, monthIndex, d)
      dt.setHours(0, 0, 0, 0)
      const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      const isPast = dt < today
      const isToday = dt.getTime() === today.getTime()

      days.push({
        dayNum: d,
        dateStr,
        isPast,
        isToday,
      })
    }

    return days
  }

  // Format date for human reading
  const formatHumanDate = (dateStr) => {
    if (!dateStr) return ""
    const parts = dateStr.split("-").map(Number)
    if (parts.length < 3) return dateStr
    const [y, m, d] = parts
    const dt = new Date(y, m - 1, d)
    return dt.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format short date header
  const formatShortDateHeader = (dateStr) => {
    if (!dateStr) return ""
    const parts = dateStr.split("-").map(Number)
    if (parts.length < 3) return dateStr
    const [y, m, d] = parts
    const dt = new Date(y, m - 1, d)
    return dt.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  const computeSlotWindow = (slot) => {
    const match = slot.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i)
    if (!match) return `${slot} - 30 min`
    let h = parseInt(match[1], 10)
    let m = parseInt(match[2], 10)
    const ampm = match[3].toLowerCase()

    let endM = m + 30
    let endH = h
    let endAmpm = ampm
    if (endM >= 60) {
      endM -= 60
      endH += 1
      if (endH === 12 && ampm === "am") endAmpm = "pm"
      if (endH > 12) endH -= 12
    }
    const endStr = `${endH}:${String(endM).padStart(2, "0")}${endAmpm}`
    return `${slot} - ${endStr}`
  }

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot)
    const windowStr = computeSlotWindow(slot)
    setTimeSlotWindow(windowStr)
  }

  const handleProceedToQuestions = () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot first")
      return
    }
    setStep(2)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Calendar URL builder
  const buildGoogleCalendarUrl = (dateStr, slotStr, meetLink) => {
    const match = (slotStr || "").match(/(\d{1,2}):(\d{2})\s*(am|pm)/i)
    let h = 11
    let min = 0
    if (match) {
      let hr = parseInt(match[1], 10)
      const mn = parseInt(match[2], 10)
      const mer = match[3].toUpperCase()
      if (mer === "PM" && hr < 12) hr += 12
      if (mer === "AM" && hr === 12) hr = 0
      h = hr
      min = mn
    }
    const cleanDate = (dateStr || "").replace(/-/g, "")
    const pad = (n) => String(n).padStart(2, "0")
    const startStr = `${cleanDate}T${pad(h)}${pad(min)}00`
    const endMin = min + 30 >= 60 ? min + 30 - 60 : min + 30
    const endH = min + 30 >= 60 ? h + 1 : h
    const endStr = `${cleanDate}T${pad(endH)}${pad(endMin)}00`

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: "30 Minute Discovery Call - StudyNet",
      dates: `${startStr}/${endStr}`,
      details: `30 Minute Discovery Call for ${planName}.\n\nGoogle Meet Room: ${meetLink}\nName: ${formData.name}\nEmail: ${formData.email}\nWhatsApp: ${formData.whatsappNumber}`,
      location: meetLink,
      add: formData.email,
      ctz: "Asia/Kolkata",
    })
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  // ICS File Download
  const downloadIcsFile = (dateStr, slotStr, meetLink) => {
    const cleanDate = (dateStr || "").replace(/-/g, "")
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//StudyNet//Discovery Call//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `UID:discovery-call-${Date.now()}@studynet.live`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART:${cleanDate}T110000`,
      `DTEND:${cleanDate}T113000`,
      "SUMMARY:30 Minute Discovery Call - StudyNet",
      `DESCRIPTION:30 Minute Discovery Call for ${planName}.\\n\\nGoogle Meet: ${meetLink}\\nPractitioner: ${formData.name}`,
      `LOCATION:${meetLink}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n")

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    const link = document.createElement("a")
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute("download", `discovery-call-${cleanDate}.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Calendar (.ics) invite downloaded!")
  }

  // Handle Submit & Proceed to Payment
  const handleSubmitAndPay = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Please enter your name")
      return
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }
    if (!formData.whatsappNumber.trim()) {
      toast.error("Please enter your WhatsApp number with country code")
      return
    }
    if (!formData.socialProfileLink.trim()) {
      toast.error("Please provide your social profile link")
      return
    }
    if (!formData.referralSource) {
      toast.error("Please let us know how you heard about us")
      return
    }
    if (!formData.courseSellingStatus.trim()) {
      toast.error("Please mention your course/workshop status")
      return
    }
    if (!formData.otherPlatforms.trim()) {
      toast.error("Please mention other platforms you use or write 'None'")
      return
    }
    if (!formData.paidCommunityStrength) {
      toast.error("Please select your current paid community strength")
      return
    }
    if (!formData.timelineToMove) {
      toast.error("Please select your preferred timeline to move")
      return
    }

    const rawPhone = formData.whatsappNumber.trim()
    const effectiveFullPhone = rawPhone.startsWith("+")
      ? rawPhone
      : `${selectedCountryCode} ${rawPhone}`.trim()

    setIsSubmitting(true)
    const toastId = toast.loading("Initializing payment order...")

    try {
      const payload = {
        planKey,
        scheduledDate: selectedDate,
        scheduledTimeSlot: `${timeSlotWindow} IST`,
        timezone: "India Standard Time",
        practitionerName: formData.name.trim(),
        practitionerEmail: formData.email.trim(),
        practitionerPhone: effectiveFullPhone,
        whatsappNumber: effectiveFullPhone,
        socialProfileLink: formData.socialProfileLink.trim(),
        referralSource: formData.referralSource,
        courseSellingStatus: formData.courseSellingStatus.trim(),
        otherPlatforms: formData.otherPlatforms.trim(),
        paidCommunityStrength: formData.paidCommunityStrength,
        timelineToMove: formData.timelineToMove,
        callExpectations: formData.callExpectations.trim(),
        guests: formData.guests.trim(),
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
        planKey,
        planName,
        prefill: {
          name: formData.name,
          email: formData.email,
          contactNumber: effectiveFullPhone,
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

  // Handle Payment Success
  const handlePaymentSuccess = async (response) => {
    const verifyToastId = toast.loading("Verifying payment transaction...")
    try {
      const rawPhone = formData.whatsappNumber.trim()
      const effectiveFullPhone = rawPhone.startsWith("+")
        ? rawPhone
        : `${selectedCountryCode} ${rawPhone}`.trim()

      const verifyPayload = {
        payglocal_order_id: response.payglocal_order_id || response.merchantTxnId,
        payglocal_payment_id: response.payglocal_payment_id || response.gid,
        payglocal_gid: response.payglocal_gid || response.gid,
        signature: response.signature,
        planKey,
        scheduledDate: selectedDate,
        scheduledTimeSlot: `${timeSlotWindow} IST`,
        timezone: "India Standard Time",
        practitionerName: formData.name.trim(),
        practitionerEmail: formData.email.trim(),
        practitionerPhone: effectiveFullPhone,
        whatsappNumber: effectiveFullPhone,
        socialProfileLink: formData.socialProfileLink.trim(),
        referralSource: formData.referralSource,
        courseSellingStatus: formData.courseSellingStatus.trim(),
        otherPlatforms: formData.otherPlatforms.trim(),
        paidCommunityStrength: formData.paidCommunityStrength,
        timelineToMove: formData.timelineToMove,
        callExpectations: formData.callExpectations.trim(),
        guests: formData.guests.trim(),
      }

      const verifyRes = await apiConnector(
        "POST",
        "/api/v1/plans/verify-subscription-and-schedule",
        verifyPayload,
        token ? { Authorization: `Bearer ${token}` } : null
      )

      if (verifyRes?.data?.success) {
        toast.success("Payment verified! Subscription active & Discovery Call booked 🎉", {
          id: verifyToastId,
        })
        if (verifyRes.data.user) {
          dispatch(setUser(verifyRes.data.user))
        }

        const confirmedCall = verifyRes.data.scheduleCall || {}
        const rawMeetLink = confirmedCall.googleMeetLink || null
        const isRealMeet = rawMeetLink && !rawMeetLink.includes("ohp-") && rawMeetLink.startsWith("http")
        const meetLink = isRealMeet ? rawMeetLink : null
        const calendarUrl = buildGoogleCalendarUrl(selectedDate, timeSlotWindow, meetLink || "")

        setBookingConfirmed({
          ...confirmedCall,
          googleMeetLink: meetLink,
          googleCalendarUrl: calendarUrl,
        })
        setStep(3)
      } else {
        toast.error(verifyRes?.data?.message || "Payment verification failed", { id: verifyToastId })
      }
    } catch (err) {
      console.error("Verification error:", err)
      toast.error("Payment verification failed. Contact support.", { id: verifyToastId })
    } finally {
      setIsPayglocalOpen(false)
    }
  }

  if (!isOpen) return null

  const calendarDays = getDaysGrid()

  // Inner card modal content
  const content = (
    <div
      className="relative w-full max-w-[1180px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 transition-all"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Prominent Clean Close Button at Top-Right */}
      {!isEmbedded && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 z-30 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition shadow-sm cursor-pointer"
        >
          <FiX className="text-xl" />
        </button>
      )}

      {/* Two Column Layout — Generous Spacing with No Cramping */}
      <div className="flex flex-col lg:flex-row min-h-[620px]">
        {/* ─── LEFT COLUMN (Our Brand Touch: OpenHand Discovery & Strategy) ─── */}
        <div className="w-full lg:w-[36%] p-7 sm:p-9 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between bg-gradient-to-b from-white to-slate-50/70">
          <div>
            {/* Back button when on step 2 */}
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 text-[#3B75EB] font-bold text-xs hover:bg-[#EEF4FF] transition mb-5 shadow-sm cursor-pointer"
              >
                <FiArrowLeft className="text-sm" />
                <span>Change Date &amp; Time</span>
              </button>
            )}

            {/* Brand Eyebrow Badge - Soft Blue */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#EEF4FF] text-[#2563EB] border border-[#BFDBFE] mb-3">
              <span>🌟 Discovery &amp; Strategy Call</span>
            </div>

            <h2 className="text-2xl sm:text-[28px] font-black text-[#0F172A] tracking-tight leading-tight">
              30 Minute Discovery Call
            </h2>

            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 mt-2.5 mb-5">
              <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                <FiClock className="text-[#3B75EB] text-sm" /> 30 min
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#EEF4FF] px-2.5 py-1 rounded-md text-[#2563EB] font-bold border border-[#BFDBFE]">
                1-on-1 Video Session
              </span>
            </div>

            {/* If slot is selected (Step 2 or 3), show selected date pill */}
            {step >= 2 && (
              <div className="mb-6 p-4 rounded-2xl bg-[#EEF4FF] border border-[#BFDBFE] text-slate-800">
                <div className="text-[11px] font-extrabold text-[#2563EB] uppercase tracking-wider mb-1">
                  Selected Session Time
                </div>
                <div className="flex items-center gap-2 font-bold text-sm text-[#0F172A]">
                  <FiCalendar className="text-[#3B75EB] text-base shrink-0" />
                  <span>{timeSlotWindow}</span>
                </div>
                <div className="text-xs font-semibold text-slate-600 mt-0.5 pl-6">
                  {formatHumanDate(selectedDate)}
                </div>
              </div>
            )}

            {/* Value Proposition & Guidance points */}
            <div className="space-y-3.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed font-medium">
              <p className="text-slate-800 font-semibold">
                Glad to have you here! Let's tailor OpenHand to scale your workshops, cohorts, and 1:1 sessions.
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#EEF4FF] text-[#3B75EB] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    <FiCheck />
                  </span>
                  <span><strong>Launch &amp; Migration:</strong> Review your courses, pricing &amp; client workflows</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#EEF4FF] text-[#3B75EB] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    <FiCheck />
                  </span>
                  <span><strong>Platform Walkthrough:</strong> Full demonstration of all practitioner tools</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#EEF4FF] text-[#3B75EB] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    <FiCheck />
                  </span>
                  <span><strong>Automated Payouts:</strong> Direct 72-hour UPI/bank settlement setup</span>
                </div>
              </div>

              <div className="pt-2 text-[#3B75EB] font-bold text-xs sm:text-sm">
                Book your call to understand how we create magic together 🚀
              </div>
            </div>
          </div>

          {/* Assurance & Plan Information Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Included with:</span>
              <span className="font-extrabold text-white bg-[#4F86F7] hover:bg-[#3B75EB] px-3 py-1 rounded-lg shadow-sm shadow-blue-400/20 text-xs">
                {planName}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <FiShield className="text-emerald-600 text-sm" />
              <span>Verified PayGlocal Gateway • Instant Confirmation</span>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN (Wide, Breathing Calendar & Slots) ─── */}
        <div className="w-full lg:w-[64%] p-7 sm:p-9 lg:p-10 flex flex-col justify-start bg-white overflow-y-auto max-h-[85vh]">
          {/* ─────────── STEP 1: SELECT DATE & TIME ─────────── */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                  Select a Date &amp; Time
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Choose a date on the calendar, then select a preferred 30-minute time slot.
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Spacious Calendar View */}
                <div className="w-full md:w-[58%]">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-5 px-1 bg-slate-50 py-2.5 px-3 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="w-9 h-9 rounded-xl hover:bg-white text-slate-700 flex items-center justify-center transition shadow-none hover:shadow-sm"
                      aria-label="Previous month"
                    >
                      <FiChevronLeft className="text-xl" />
                    </button>
                    <div className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                      {monthName} {year}
                    </div>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="w-9 h-9 rounded-xl hover:bg-white text-slate-700 flex items-center justify-center transition shadow-none hover:shadow-sm"
                      aria-label="Next month"
                    >
                      <FiChevronRight className="text-xl" />
                    </button>
                  </div>

                  {/* Day Names Row */}
                  <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>

                  {/* Days Grid with Generous Cell Size */}
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {calendarDays.map((cell, idx) => {
                      if (!cell.dayNum) {
                        return <div key={idx} className="h-10 w-10 sm:h-11 sm:w-11" />
                      }

                      const isSelected = selectedDate === cell.dateStr
                      const isPast = cell.isPast

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isPast}
                          onClick={() => setSelectedDate(cell.dateStr)}
                          className={`relative h-10 w-10 sm:h-11 sm:w-11 mx-auto rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-[#4F86F7] text-white shadow-md shadow-blue-400/30 font-bold scale-105"
                              : isPast
                              ? "text-slate-300 cursor-not-allowed opacity-60"
                              : "text-slate-700 hover:bg-[#EEF4FF] hover:text-[#3B75EB] hover:scale-105 cursor-pointer"
                          }`}
                        >
                          {cell.dayNum}
                          {/* Dot for today if not selected */}
                          {cell.isToday && !isSelected && (
                            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#4F86F7]" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Slots Column — Generous Width & Comfortable Tap Targets */}
                <div className="w-full md:w-[42%] border-t md:border-t-0 md:border-l border-slate-200 md:pl-7 pt-5 md:pt-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-xs sm:text-sm font-bold text-[#0F172A]">
                        {formatShortDateHeader(selectedDate)}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        30 min slots
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1.5">
                      {DISCOVERY_SLOTS.map((slot) => {
                        const isSlotActive = selectedSlot === slot
                        if (isSlotActive) {
                          return (
                            <div key={slot} className="grid grid-cols-2 gap-2 transition-all">
                              <button
                                type="button"
                                className="py-3 px-3 rounded-xl text-xs sm:text-sm font-bold border-2 border-[#5B8DEF] bg-[#EEF4FF] text-[#2563EB] text-center"
                              >
                                {slot}
                              </button>
                              <button
                                type="button"
                                onClick={handleProceedToQuestions}
                                className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#4F86F7] hover:bg-[#3B75EB] text-white shadow-md shadow-blue-400/25 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                              >
                                <span>Next</span>
                                <span className="text-base font-bold">&rarr;</span>
                              </button>
                            </div>
                          )
                        }

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleSelectSlot(slot)}
                            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold border border-[#BFDBFE] text-[#3B75EB] hover:bg-[#EEF4FF] hover:border-[#60A5FA] transition-all text-center cursor-pointer"
                          >
                            {slot}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Summary row with Next button below the slots */}
                  <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="pr-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Selected Slot
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800">
                        {selectedSlot} <span className="text-slate-400 font-normal">({timeSlotWindow})</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleProceedToQuestions}
                      className="py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold bg-[#4F86F7] hover:bg-[#3B75EB] text-white shadow-md shadow-blue-400/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                    >
                      <span>Next</span>
                      <span className="text-base font-bold">&rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────── STEP 2: DISCOVERY QUESTIONNAIRE ─────────── */}
          {step === 2 && (
            <div>
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                  Enter Details
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Tell us a bit about your practice so we can make the virtual call highly valuable.
                </p>
              </div>

              <form onSubmit={handleSubmitAndPay} className="space-y-5 text-xs sm:text-sm">
                {/* Row 1: Name & Email Side-by-Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition"
                    />
                  </div>
                </div>

                {/* Add Guests Toggle */}
                <div>
                  {!showAddGuests ? (
                    <button
                      type="button"
                      onClick={() => setShowAddGuests(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-blue-600 text-blue-600 text-xs font-bold hover:bg-blue-50 transition cursor-pointer"
                    >
                      <span>+ Add guests</span>
                    </button>
                  ) : (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Guest Email(s)
                      </label>
                      <input
                        type="text"
                        name="guests"
                        value={formData.guests}
                        onChange={handleInputChange}
                        placeholder="guest1@example.com, guest2@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition"
                      />
                    </div>
                  )}
                </div>

                {/* Row 2: WhatsApp Number & Social Profile Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Your WhatsApp number with country code? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:border-[#4F86F7] focus-within:ring-2 focus-within:ring-blue-100 transition bg-white">
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                        className="bg-slate-50 px-2 py-2.5 text-slate-800 text-xs sm:text-sm font-bold border-r border-slate-200 outline-none cursor-pointer max-w-[130px] sm:max-w-[145px] truncate"
                        aria-label="Select Country Code"
                      >
                        {countryCodes.map((c, i) => (
                          <option key={`${c.code}-${c.name}-${i}`} value={c.code}>
                            {c.flag || "🌐"} {c.code} ({c.name})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        name="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={handleInputChange}
                        required
                        placeholder="9876543210"
                        className="w-full px-3.5 py-2.5 outline-none text-slate-800 text-sm font-medium bg-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Your Social Profile Link? (Instagram/YouTube/LinkedIn/Twitter){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="socialProfileLink"
                      value={formData.socialProfileLink}
                      onChange={handleInputChange}
                      required
                      placeholder="https://instagram.com/yourhandle or linkedin.com/in/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition"
                    />
                  </div>
                </div>

                {/* Row 3: How they heard & Paid community strength */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      How did you got to know about us? <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="referralSource"
                      value={formData.referralSource}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm bg-white transition cursor-pointer"
                    >
                      <option value="">Select...</option>
                      {REFERRAL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      What is the strength of your current paid community? <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="paidCommunityStrength"
                      value={formData.paidCommunityStrength}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm bg-white transition cursor-pointer"
                    >
                      <option value="">Select...</option>
                      {COMMUNITY_STRENGTH_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4: Timeline to move & Platforms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Within what timeline would you be willing to move if it is a fit?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="timelineToMove"
                      value={formData.timelineToMove}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm bg-white transition cursor-pointer"
                    >
                      <option value="">Select...</option>
                      {TIMELINE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Do you sell courses/workshops or are planning to launch? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="courseSellingStatus"
                      value={formData.courseSellingStatus}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Yes, actively running / Planning to launch"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition"
                    />
                  </div>
                </div>

                {/* Other platforms */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Are you using any other platform for your courses and workshops? Mention them <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="otherPlatforms"
                    value={formData.otherPlatforms}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Zoom, Teachable, Kajabi, None"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition"
                  />
                </div>

                {/* Call expectations */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    What are your expectations from the virtual call? Is there any specific feature-set that you are looking for?
                  </label>
                  <textarea
                    rows={3}
                    name="callExpectations"
                    value={formData.callExpectations}
                    onChange={handleInputChange}
                    placeholder="Tell us what you'd like to achieve or any specific workflows you need..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition"
                  />
                </div>

                {/* Submit & Pay Button - Soft Blue Gradient */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base text-white transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #4F86F7 0%, #3B75EB 100%)",
                      boxShadow: "0 8px 24px rgba(79, 134, 247, 0.32)",
                    }}
                  >
                    {isSubmitting ? (
                      "Initializing PayGlocal..."
                    ) : (
                      <>
                        <span>Submit Booking and Pay ₹{Number(planPrice).toLocaleString("en-IN")}</span>
                        <span className="text-lg">&rarr;</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ─────────── STEP 3: BOOKING CONFIRMED SCREEN ─────────── */}
          {step === 3 && bookingConfirmed && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4 shadow-sm">
                <FiCheckCircle />
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                Discovery Call Confirmed!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                Your 1-Year <strong className="text-[#3B75EB]">{planName}</strong> is active and your
                30-Minute Discovery Session has been booked.
              </p>

              {/* Session Details Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left mb-6 space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Scheduled Date:</span>
                  <span className="font-bold text-slate-900">{formatHumanDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Time Slot:</span>
                  <span className="font-bold text-slate-900">{timeSlotWindow} (IST)</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Practitioner:</span>
                  <span className="font-bold text-slate-900">{formData.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">WhatsApp / Email:</span>
                  <span className="font-bold text-slate-900">
                    {formData.whatsappNumber} • {formData.email}
                  </span>
                </div>
              </div>

              {/* Google Meet Link or Scheduled Notice */}
              {bookingConfirmed.googleMeetLink &&
              !bookingConfirmed.googleMeetLink.includes("ohp-") &&
              bookingConfirmed.googleMeetLink.startsWith("http") ? (
                <div className="bg-[#EEF4FF] border border-[#BFDBFE] rounded-2xl p-5 mb-6 text-center">
                  <div className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
                    <FiVideo className="text-base text-[#3B75EB]" />
                    <span>Dedicated Google Meet Conference Room</span>
                  </div>
                  <div className="my-3">
                    <a
                      href={bookingConfirmed.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#4F86F7] hover:bg-[#3B75EB] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-blue-400/25 transition"
                    >
                      <span>Join Google Meet Room</span>
                      <FiExternalLink />
                    </a>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-[#2563EB] font-medium">
                    <span className="truncate max-w-[280px]">
                      {bookingConfirmed.googleMeetLink}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(bookingConfirmed.googleMeetLink)
                        toast.success("Google Meet link copied to clipboard!")
                      }}
                      className="hover:text-blue-900 cursor-pointer"
                      title="Copy Link"
                    >
                      <FiCopy />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-blue-50/90 border border-blue-200 rounded-2xl p-5 mb-6 text-center shadow-xs">
                  <div className="w-11 h-11 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center mx-auto mb-2.5 text-xl">
                    <FiVideo />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    Google Meet Conference Room
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto mb-2">
                    Your host is setting up your dedicated Google Meet room. You will receive the direct room link on your WhatsApp (<strong>{formData.whatsappNumber}</strong>) &amp; Email (<strong>{formData.email}</strong>) prior to the call.
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#2563EB] bg-blue-100/70 px-3 py-1 rounded-full">
                    <FiClock className="text-xs" />
                    <span>Automated reminders 1 hour &amp; 5 minutes before your slot</span>
                  </div>
                </div>
              )}

              {/* Calendar Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                {bookingConfirmed.googleCalendarUrl && (
                  <a
                    href={bookingConfirmed.googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs sm:text-sm font-bold text-slate-700 transition"
                  >
                    <FiCalendar className="text-[#3B75EB]" />
                    <span>Add to Google Calendar</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() =>
                    downloadIcsFile(selectedDate, timeSlotWindow, bookingConfirmed.googleMeetLink)
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs sm:text-sm font-bold text-slate-700 transition cursor-pointer"
                >
                  <FiDownload className="text-emerald-600" />
                  <span>Download .ICS Invite</span>
                </button>
              </div>

              <div className="bg-emerald-50 text-emerald-800 text-xs p-3.5 rounded-xl border border-emerald-200">
                📩 Confirmation email and WhatsApp message dispatched to{" "}
                <strong>{formData.email}</strong> &amp; <strong>{formData.whatsappNumber}</strong>. We will remind you 1 hour and 5 minutes prior to the session!
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose()
                    navigate("/practice")
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Go to Practitioner Dashboard &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PayGlocal Checkout Modal */}
      <PayGlocalCheckoutModal
        isOpen={isPayglocalOpen}
        onClose={() => setIsPayglocalOpen(false)}
        orderData={payglocalOrderData}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )

  // If embedded in a dedicated page
  if (isEmbedded) {
    return <div className="w-full flex justify-center py-6 px-3">{content}</div>
  }

  // If rendered as overlay modal — High z-index above floating navbar
  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-900/70 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose()
      }}
    >
      <div className="w-full flex items-center justify-center py-6 sm:py-10 my-auto">
        {content}
      </div>
    </div>
  )
}
