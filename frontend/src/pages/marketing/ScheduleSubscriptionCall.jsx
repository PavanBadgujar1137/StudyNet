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
  FiCheck,
  FiExternalLink,
  FiArrowLeft,
  FiVideo,
  FiCopy,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiGlobe,
} from "react-icons/fi"
import toast from "react-hot-toast"
import { apiConnector } from "../../services/apiConnector"
import PayGlocalCheckoutModal from "../../components/openhand/PayGlocalCheckoutModal"
import OHFooter from "../../components/openhand/OHFooter"

// Categorized Time Slots for Google Calendar Onboarding
const TIME_SLOTS = [
  { time: "10:00 AM - 10:45 AM", period: "Morning" },
  { time: "11:30 AM - 12:15 PM", period: "Morning" },
  { time: "02:00 PM - 02:45 PM", period: "Afternoon" },
  { time: "03:30 PM - 04:15 PM", period: "Afternoon" },
  { time: "05:00 PM - 05:45 PM", period: "Evening" },
  { time: "06:30 PM - 07:15 PM", period: "Evening" },
]

const TIMEZONES = [
  { id: "Asia/Kolkata", label: "Asia/Kolkata (IST, UTC+5:30)", abbr: "IST" },
  { id: "America/New_York", label: "America/New_York (EST, UTC-5)", abbr: "EST" },
  { id: "America/Los_Angeles", label: "America/Los_Angeles (PST, UTC-8)", abbr: "PST" },
  { id: "Europe/London", label: "Europe/London (GMT/BST, UTC+0)", abbr: "GMT" },
  { id: "Asia/Dubai", label: "Asia/Dubai (GST, UTC+4)", abbr: "GST" },
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

const currentSysYear = new Date().getFullYear()
const YEAR_OPTIONS = [currentSysYear, currentSysYear + 1, currentSysYear + 2]
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export default function ScheduleSubscriptionCall() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)

  // Timezone State
  const [selectedTimezone, setSelectedTimezone] = useState(TIMEZONES[0].id)

  // Real-time Today date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Default selected date to tomorrow
  const getTomorrowDateStr = () => {
    const tmr = new Date()
    tmr.setDate(tmr.getDate() + 1)
    const y = tmr.getFullYear()
    const m = String(tmr.getMonth() + 1).padStart(2, "0")
    const d = String(tmr.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  // Google Calendar Month Navigation & Grid State
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const tmr = new Date()
    tmr.setDate(tmr.getDate() + 1)
    return new Date(tmr.getFullYear(), tmr.getMonth(), 1)
  })

  const currentYear = calendarMonth.getFullYear()
  const currentMonthIndex = calendarMonth.getMonth()
  const currentMonthName = calendarMonth.toLocaleDateString("en-US", { month: "long" })

  const [selectedDate, setSelectedDate] = useState(getTomorrowDateStr())
  const [selectedSlot, setSelectedSlot] = useState("11:30 AM - 12:15 PM")

  const handlePrevMonth = () => {
    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const prevMonthDate = new Date(currentYear, currentMonthIndex - 1, 1)
    if (prevMonthDate < minMonth) return

    setCalendarMonth(prevMonthDate)

    // Keep selectedDate in sync with the new month
    const py = prevMonthDate.getFullYear()
    const pm = prevMonthDate.getMonth()
    let pd = 1
    if (py === today.getFullYear() && pm === today.getMonth()) {
      pd = today.getDate() + 1
    }
    const pad = (n) => String(n).padStart(2, "0")
    setSelectedDate(`${py}-${pad(pm + 1)}-${pad(pd)}`)
  }

  const handleNextMonth = () => {
    const nextMonthDate = new Date(currentYear, currentMonthIndex + 1, 1)
    setCalendarMonth(nextMonthDate)

    const ny = nextMonthDate.getFullYear()
    const nm = nextMonthDate.getMonth()
    const pad = (n) => String(n).padStart(2, "0")
    setSelectedDate(`${ny}-${pad(nm + 1)}-01`)
  }

  const handleMonthSelect = (newMonthIndex) => {
    if (currentYear === today.getFullYear() && newMonthIndex < today.getMonth()) {
      return
    }
    const newDate = new Date(currentYear, newMonthIndex, 1)
    setCalendarMonth(newDate)

    const pad = (n) => String(n).padStart(2, "0")
    let targetDay = 1
    if (currentYear === today.getFullYear() && newMonthIndex === today.getMonth()) {
      targetDay = today.getDate() + 1
    }
    setSelectedDate(`${currentYear}-${pad(newMonthIndex + 1)}-${pad(targetDay)}`)
  }

  const handleYearSelect = (newYear) => {
    let targetMonth = currentMonthIndex
    if (newYear === today.getFullYear() && targetMonth < today.getMonth()) {
      targetMonth = today.getMonth()
    }
    const newDate = new Date(newYear, targetMonth, 1)
    setCalendarMonth(newDate)

    const pad = (n) => String(n).padStart(2, "0")
    let targetDay = 1
    if (newYear === today.getFullYear() && targetMonth === today.getMonth()) {
      targetDay = today.getDate() + 1
    }
    setSelectedDate(`${newYear}-${pad(targetMonth + 1)}-${pad(targetDay)}`)
  }

  const getCalendarMonthGrid = () => {
    const firstDayIndex = new Date(currentYear, currentMonthIndex, 1).getDay() // 0 = Sun
    const totalDaysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, currentMonthIndex, 0).getDate()

    const grid = []

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      grid.push({
        dayNum: daysInPrevMonth - i,
        isCurrentMonth: false,
        isPast: true,
        dateString: null,
      })
    }

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const d = new Date(currentYear, currentMonthIndex, day)
      d.setHours(0, 0, 0, 0)
      const dateString = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const isPast = d < today
      const isToday = d.getTime() === today.getTime()

      grid.push({
        dayNum: day,
        isCurrentMonth: true,
        isPast,
        isToday,
        dateString,
      })
    }

    // Next month padding to fill a complete 35 or 42 grid
    const remainingCells = (7 - (grid.length % 7)) % 7
    for (let day = 1; day <= remainingCells; day++) {
      grid.push({
        dayNum: day,
        isCurrentMonth: false,
        isPast: true,
        dateString: null,
      })
    }

    return grid
  }

  // Format date nicely for human display
  const formatSelectedDateHuman = (dateStr) => {
    if (!dateStr) return "Select a date"
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

  // Form State
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

  // Plan Details (Matching Exact Specs & Image)
  const planInfo = {
    name: "Pro Plan (1 Year Validity)",
    price: 9588,
    monthlyEquivalent: 799,
    commission: "5%",
    features: [
      "Everything in Open — commission drops to 5%",
      "Monthly growth review with an OpenHand mentor",
      "Priority mentee matching & featured placement",
      "Visibility campaigns: spotlights, collaborations, events",
      "Programs, cohorts & memberships",
      "AI session notes & client progress insights",
      "Custom domain & white-label booking page",
    ],
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Generate Real Google Calendar Add Event URL
  const buildGoogleCalendarUrl = (dateStr, timeSlot, meetLink = "") => {
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

    const effectiveMeet = meetLink || "https://meet.google.com"

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: "OpenHand Practitioner Onboarding & Guiding Strategy Call",
      dates: `${startDateStr}/${endDateStr}`,
      details: `1-on-1 Practitioner Onboarding Strategy Session for OpenHand Pro Yearly Plan.\n\n📹 Google Meet Conference Room: ${effectiveMeet}\nPractitioner: ${formData.name}\nEmail: ${formData.email}\nOpenHand Connect Team: connect@openhand.live`,
      location: effectiveMeet,
      add: formData.email,
      ctz: selectedTimezone || "Asia/Kolkata",
    })
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  // Dynamic Browser Download of Native .ICS Calendar Invite File
  const downloadIcsFile = (dateStr, timeSlot, meetLink = "") => {
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

    const effectiveMeet = meetLink || "https://meet.google.com"

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//OpenHand//Practitioner Onboarding//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `UID:openhand-call-${Date.now()}@openhand.live`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART:${startDateStr}`,
      `DTEND:${endDateStr}`,
      "SUMMARY:OpenHand Practitioner Onboarding & Guiding Strategy Call",
      `DESCRIPTION:1-on-1 Practitioner Onboarding Strategy Session for OpenHand Pro Yearly Plan.\\n\\nGoogle Meet Room: ${effectiveMeet}\\nPractitioner: ${formData.name}\\nEmail: ${formData.email}`,
      `LOCATION:${effectiveMeet}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder: OpenHand Guiding Call in 15 minutes",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n")

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    const link = document.createElement("a")
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute("download", `openhand-onboarding-call-${cleanDate}.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Google Calendar (.ics) invite downloaded! Open to add to calendar.")
  }

  // Handle Form Submission -> Initialize PayGlocal Order
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
      const activeTzObj = TIMEZONES.find((t) => t.id === selectedTimezone) || TIMEZONES[0]
      const formattedSlot = `${selectedSlot} ${activeTzObj.abbr}`

      const payload = {
        planKey: "pro_yearly",
        scheduledDate: selectedDate,
        scheduledTimeSlot: formattedSlot,
        timezone: activeTzObj.label,
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

  // Handle PayGlocal Payment Success & Backend Verification
  const handlePayGlocalSuccess = async (response) => {
    const verifyToastId = toast.loading("Verifying transaction with PayGlocal Gateway...")
    try {
      const activeTzObj = TIMEZONES.find((t) => t.id === selectedTimezone) || TIMEZONES[0]
      const formattedSlot = `${selectedSlot} ${activeTzObj.abbr}`

      const verifyPayload = {
        payglocal_order_id: response.payglocal_order_id || response.merchantTxnId,
        payglocal_payment_id: response.payglocal_payment_id || response.gid,
        payglocal_gid: response.payglocal_gid || response.gid,
        signature: response.signature,
        planKey: "pro_yearly",
        scheduledDate: selectedDate,
        scheduledTimeSlot: formattedSlot,
        timezone: activeTzObj.label,
        modality: formData.modality,
        goals: formData.goals,
        practitionerName: formData.name,
        practitionerEmail: formData.email,
        practitionerPhone: formData.phone,
      }

      const verifyRes = await apiConnector(
        "POST",
        "/api/v1/plans/verify-subscription-and-schedule",
        verifyPayload,
        token ? { Authorization: `Bearer ${token}` } : null
      )

      if (verifyRes?.data?.success) {
        toast.success("Payment verified! Onboarding call scheduled 🎉", { id: verifyToastId })
        const confirmedCall = verifyRes.data.scheduleCall || {}
        const meetLink = confirmedCall.googleMeetLink || `https://meet.google.com/ohp-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 5)}`
        const calendarUrl = buildGoogleCalendarUrl(selectedDate, formattedSlot, meetLink)

        setBookingConfirmed({
          ...confirmedCall,
          googleMeetLink: meetLink,
          googleCalendarUrl: calendarUrl,
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

  const activeTzObj = TIMEZONES.find((t) => t.id === selectedTimezone) || TIMEZONES[0]

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-800"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}
    >
      {/* Main Container with generous top padding to avoid floating Navbar collision */}
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
        <div className="text-center max-w-5xl mx-auto mb-10">
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
              marginBottom: "12px",
            }}
          >
            PRACTITIONER YEARLY ONBOARDING
          </span>
          <h1
            className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight my-2 leading-[1.15] text-[#0F172A] whitespace-normal md:whitespace-nowrap"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Book an Onboarding Call &amp; Take Subscription
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            Schedule your 1-on-1 strategy call, activate Pro via PayGlocal, and unlock full practitioner privileges.
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

            <h2
              className="text-2xl sm:text-3xl font-black text-slate-900 mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              You're All Set, {formData.name || "Practitioner"}!
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Your 1-Year Pro Plan subscription (₹9,588) has been activated via PayGlocal, and your 1-on-1 strategy call has been reserved.
            </p>

            {/* Dedicated Google Meet Link Box */}
            {bookingConfirmed.googleMeetLink && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <FiVideo className="text-blue-600" /> Dedicated Google Meet Room Link
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    ● Active &amp; Ready
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={bookingConfirmed.googleMeetLink}
                    className="flex-1 bg-white border border-blue-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-800 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(bookingConfirmed.googleMeetLink)
                      toast.success("Google Meet link copied to clipboard!")
                    }}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <FiCopy /> Copy
                  </button>
                  <a
                    href={bookingConfirmed.googleMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <FiExternalLink /> Join Meet
                  </a>
                </div>
              </div>
            )}

            {/* Google Calendar Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {bookingConfirmed.googleCalendarUrl && (
                <a
                  href={bookingConfirmed.googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <FiCalendar className="text-base" /> Add to Google Calendar <FiExternalLink />
                </a>
              )}
              <button
                type="button"
                onClick={() => downloadIcsFile(bookingConfirmed.scheduledDate, bookingConfirmed.scheduledTimeSlot, bookingConfirmed.googleMeetLink)}
                className="py-3.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <FiDownload className="text-base" /> Download .ICS Invite
              </button>
            </div>

            {/* Schedule Details Table */}
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
                <span className="text-slate-500 font-medium">Payment Gateway</span>
                <span className="font-bold text-emerald-600">PayGlocal Verified</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-800 text-left mb-8 leading-relaxed">
              <strong>📞 What happens next?</strong><br />
              1. A confirmation receipt with your Google Meet link has been sent to <b>{formData.email}</b>.<br />
              2. Our OpenHand Connect Team has received your booking in the Admin Panel.<br />
              3. You can join directly at your scheduled time via Google Meet.<br />
              4. You can start setting up your services, packages, and profile on your Practitioner dashboard!
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate(token ? "/practice" : "/login")}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg hover:opacity-95 transition cursor-pointer"
              >
                Go to Practitioner Dashboard →
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition cursor-pointer"
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
              
              {/* Step 1: Authentic Google Calendar Appointment Scheduler Card */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/70 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* Authentic Google Calendar SVG Icon */}
                    <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center p-2 flex-shrink-0">
                      <svg viewBox="0 0 48 48" className="w-full h-full">
                        <rect x="6" y="10" width="36" height="32" rx="4" fill="#FFFFFF" stroke="#4285F4" strokeWidth="3" />
                        <path d="M6 18H42" stroke="#4285F4" strokeWidth="3" />
                        <rect x="14" y="5" width="4" height="8" rx="2" fill="#EA4335" />
                        <rect x="30" y="5" width="4" height="8" rx="2" fill="#EA4335" />
                        <circle cx="16" cy="26" r="2.5" fill="#4285F4" />
                        <circle cx="24" cy="26" r="2.5" fill="#FBBC05" />
                        <circle cx="32" cy="26" r="2.5" fill="#34A853" />
                        <circle cx="16" cy="34" r="2.5" fill="#34A853" />
                        <circle cx="24" cy="34" r="2.5" fill="#4285F4" />
                        <circle cx="32" cy="34" r="2.5" fill="#EA4335" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          1
                        </span>
                        <h3
                          className="text-base sm:text-lg font-black text-slate-900 tracking-tight"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          Google Calendar Scheduling
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ● Real-time Sync
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        45-Min 1-on-1 Strategy Session · Dedicated Google Meet Room Auto-Linked
                      </p>
                    </div>
                  </div>

                  {/* Timezone Switcher */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 self-start sm:self-auto shadow-xs">
                    <FiGlobe className="text-slate-400 text-xs flex-shrink-0" />
                    <select
                      value={selectedTimezone}
                      onChange={(e) => setSelectedTimezone(e.target.value)}
                      className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz.id} value={tz.id}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Two-Column Scheduler Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  
                  {/* Left Column (7 cols): Month Date Picker */}
                  <div className="md:col-span-7 p-5 sm:p-6">
                    {/* Month Navigator Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5">
                        {/* Professional Month Selector: Clean Neutral Styling (No Blue Box) */}
                        <div className="relative inline-flex items-center">
                          <select
                            value={currentMonthIndex}
                            onChange={(e) => handleMonthSelect(Number(e.target.value))}
                            className="text-xs sm:text-sm font-bold text-slate-800 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/90 rounded-md pl-2 pr-5 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition appearance-none"
                            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                            title="Select Month"
                          >
                            {MONTH_NAMES.map((name, idx) => {
                              const isPastMonth = currentYear === today.getFullYear() && idx < today.getMonth()
                              return (
                                <option key={name} value={idx} disabled={isPastMonth}>
                                  {name}
                                </option>
                              )
                            })}
                          </select>
                          <FiChevronDown className="absolute right-1 text-slate-500 pointer-events-none text-xs" />
                        </div>

                        {/* Professional Year Selector: Clean Neutral Styling (No Blue Box) */}
                        <div className="relative inline-flex items-center">
                          <select
                            value={currentYear}
                            onChange={(e) => handleYearSelect(Number(e.target.value))}
                            className="text-xs sm:text-sm font-bold text-slate-800 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/90 rounded-md pl-2 pr-5 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition appearance-none"
                            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                            title="Select Year"
                          >
                            {YEAR_OPTIONS.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                          <FiChevronDown className="absolute right-1 text-slate-500 pointer-events-none text-xs" />
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-blue-600 transition cursor-pointer shadow-xs"
                          title="Previous Month"
                        >
                          <FiChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-blue-600 transition cursor-pointer shadow-xs"
                          title="Next Month"
                        >
                          <FiChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Weekday Row */}
                    <div className="grid grid-cols-7 gap-1 text-center py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                        <span key={dayName}>{dayName}</span>
                      ))}
                    </div>

                    {/* Month Days Grid */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-1">
                      {getCalendarMonthGrid().map((cell, idx) => {
                        if (!cell.isCurrentMonth) {
                          return (
                            <div
                              key={idx}
                              className="h-9 w-9 sm:h-10 sm:w-10 mx-auto flex items-center justify-center text-slate-200 text-xs select-none"
                            >
                              {cell.dayNum}
                            </div>
                          )
                        }

                        const isSelected = selectedDate === cell.dateString
                        const isDisabled = cell.isPast

                        return (
                          <div key={idx} className="flex flex-col items-center justify-center py-0.5">
                            <button
                              type="button"
                              disabled={isDisabled}
                              onClick={() => !isDisabled && setSelectedDate(cell.dateString)}
                              className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition cursor-pointer ${
                                isSelected
                                  ? "bg-[#1A73E8] text-white font-bold shadow-md shadow-blue-500/25 scale-105"
                                  : isDisabled
                                  ? "text-slate-300 cursor-not-allowed bg-transparent"
                                  : cell.isToday
                                  ? "border-2 border-[#1A73E8] text-[#1A73E8] font-bold hover:bg-blue-50"
                                  : "text-slate-700 hover:bg-blue-50 hover:text-[#1A73E8]"
                              }`}
                            >
                              {cell.dayNum}
                            </button>
                            {!isDisabled && !isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />
                            )}
                            {cell.isToday && !isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1" />
                            )}
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-transparent mt-1" />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Calendar Footer Status */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Available date with open slots
                      </span>
                      <span className="font-bold text-slate-800">
                        Selected: <span className="text-[#1A73E8]">{formatSelectedDateHuman(selectedDate)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Column (5 cols): Time Slots for Chosen Day */}
                  <div className="md:col-span-5 p-5 sm:p-6 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="mb-3.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Available Times
                        </span>
                        <h4
                          className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5"
                          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                        >
                          {formatSelectedDateHuman(selectedDate)}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Timezone: {activeTzObj.abbr} · 45 Mins Duration
                        </span>
                      </div>

                      {/* Slots List */}
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {TIME_SLOTS.map((slotObj) => {
                          const slot = slotObj.time
                          const isSelected = selectedSlot === slot
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`w-full py-2.5 px-3 rounded-xl border text-left font-semibold text-xs flex items-center justify-between transition cursor-pointer ${
                                isSelected
                                  ? "bg-[#1A73E8] border-[#1A73E8] text-white shadow-xs font-bold"
                                  : "bg-white border-slate-200 text-slate-700 hover:border-[#1A73E8] hover:text-[#1A73E8] hover:bg-blue-50/40"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <FiClock className={isSelected ? "text-white" : "text-slate-400"} />
                                <span>{slot}</span>
                              </div>
                              {isSelected ? (
                                <FiCheck className="text-white text-sm" />
                              ) : (
                                <span className="text-[10px] text-slate-400 font-normal">
                                  {slotObj.period}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Google Meet Auto-Link Notice */}
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-[11px] text-slate-600">
                      <FiVideo className="text-blue-600 flex-shrink-0" />
                      <span>Dedicated Google Meet room auto-generated.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Practitioner Details Form */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <h3
                    className="text-lg sm:text-xl font-black text-slate-900 tracking-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
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
                        placeholder="e.g. Dr. Maya Sharma"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          placeholder="doctor@clinic.com"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                        Contact Number (WhatsApp)
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Practice Modality
                    </label>
                    <select
                      name="modality"
                      value={formData.modality}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {MODALITIES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      What are your growth goals? (Optional)
                    </label>
                    <textarea
                      name="goals"
                      rows={3}
                      value={formData.goals}
                      onChange={handleInputChange}
                      placeholder="e.g. Expand private 1:1 sessions, launch a 6-week cohort, or transition offline practice online."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base shadow-lg hover:shadow-xl active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>
                      {isSubmitting ? "Connecting PayGlocal Gateway..." : "Proceed to PayGlocal Payment (₹9,588/yr) →"}
                    </span>
                  </button>
                  <p className="text-center text-[11px] text-slate-500 mt-2">
                    🔒 Secured by PayGlocal India · 3D-Secure 2.0 Authorization
                  </p>
                </form>
              </div>
            </div>

            {/* Right Column: Plan Summary Card (5 Cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-500 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-blue-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl shadow-sm">
                  Pro Annual Plan
                </div>

                <div className="mb-4">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                    Subscription Tier
                  </span>
                  <h3
                    className="text-2xl font-black text-slate-900"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Pro Plan (1 Year Validity)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    A growth partner working on your practice every month.
                  </p>
                </div>

                {/* Price Display */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">
                      ₹799
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      / month, billed yearly
                    </span>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <span>1-Time Yearly Payment:</span>
                    <strong className="text-sm font-extrabold">₹9,588</strong>
                  </div>
                </div>

                {/* Scheduled Call Info */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 mb-6 text-xs text-blue-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-blue-800">
                    <FiCalendar className="text-blue-600" /> Reserved Google Calendar Slot:
                  </div>
                  <div className="font-semibold text-slate-800">
                    📅 {formatSelectedDateHuman(selectedDate)}
                  </div>
                  <div className="font-semibold text-slate-800">
                    ⏰ {selectedSlot} {activeTzObj.abbr}
                  </div>
                </div>

                {/* Exact Features List */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Features Included with Pro:
                  </h4>
                  <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                    {planInfo.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                          ✓
                        </span>
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* PayGlocal Security Seal */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <FiShield className="text-blue-600 text-sm" /> 256-Bit TLS Secured
                  </span>
                  <span className="font-bold text-blue-600">
                    PayGlocal India
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* PayGlocal Interactive 3D Secure Checkout Modal */}
      <PayGlocalCheckoutModal
        isOpen={isPayglocalOpen}
        onClose={() => setIsPayglocalOpen(false)}
        orderData={payglocalOrderData}
        onSuccess={handlePayGlocalSuccess}
        onDismiss={() => {
          setIsPayglocalOpen(false)
          toast.error("PayGlocal payment session closed.")
        }}
      />

      <OHFooter />
    </div>
  )
}
