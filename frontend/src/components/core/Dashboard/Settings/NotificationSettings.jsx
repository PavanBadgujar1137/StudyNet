import React, { useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  FiBell,
  FiMail,
  FiMessageSquare,
  FiCheckCircle,
  FiSmartphone,
  FiSend,
  FiZap,
  FiInfo,
  FiSave,
  FiChevronDown,
  FiSearch,
  FiUsers,
  FiCalendar,
  FiVideo,
} from "react-icons/fi"
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestNotification,
} from "../../../../services/operations/SettingsAPI"
import { countryCodes } from "../../../../data/countryCodes"
import toast from "react-hot-toast"

export default function NotificationSettings() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)

  const initialPrefs = user?.notificationPreferences || {}

  // Notification Preferences State (Defaults to true for maximum traction)
  const [circleChatWhatsApp, setCircleChatWhatsApp] = useState(
    initialPrefs.circleChatWhatsApp !== false
  )
  const [circleChatEmail, setCircleChatEmail] = useState(
    initialPrefs.circleChatEmail !== false
  )
  const [sessionWhatsApp, setSessionWhatsApp] = useState(
    initialPrefs.sessionWhatsApp !== false
  )
  const [sessionEmail, setSessionEmail] = useState(
    initialPrefs.sessionEmail !== false
  )
  const [courseUpdates, setCourseUpdates] = useState(
    initialPrefs.courseUpdates !== false
  )

  // Phone number parser for WhatsApp channel
  const parsePhone = (contactStr) => {
    if (!contactStr) return { code: "+91", number: "" }
    const trimmed = String(contactStr).trim()
    const sortedCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length)
    const matched = sortedCodes.find((c) => trimmed.startsWith(c.code))
    if (matched) {
      const restDigits = trimmed.slice(matched.code.length).replace(/\D/g, "")
      const maxDigits = matched.maxDigits || matched.digits || 15
      return { code: matched.code, number: restDigits.slice(0, maxDigits) }
    }
    if (trimmed.startsWith("+")) {
      const parts = trimmed.split(" ")
      const codePart = parts[0]
      const restDigits = parts.slice(1).join("").replace(/\D/g, "")
      const known = countryCodes.find((c) => c.code === codePart)
      return { code: known ? codePart : "+91", number: restDigits.slice(0, 15) }
    }
    const digitsOnly = trimmed.replace(/\D/g, "").slice(0, 10)
    return { code: "+91", number: digitsOnly }
  }

  const existingPhone =
    user?.whatsappNumber ||
    user?.contactNumber ||
    user?.additionalDetails?.contactNumber ||
    ""

  const parsed = parsePhone(existingPhone)
  const [countryCode, setCountryCode] = useState(parsed.code)
  const [phoneNumber, setPhoneNumber] = useState(parsed.number)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchCode, setSearchCode] = useState("")

  const [saving, setSaving] = useState(false)
  const [testingWa, setTestingWa] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)

  const dropdownRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    if (token) {
      getNotificationPreferences(token).then((data) => {
        if (!isMounted || !data) return
        if (data.notificationPreferences) {
          setCircleChatWhatsApp(data.notificationPreferences.circleChatWhatsApp !== false)
          setCircleChatEmail(data.notificationPreferences.circleChatEmail !== false)
          setSessionWhatsApp(data.notificationPreferences.sessionWhatsApp !== false)
          setSessionEmail(data.notificationPreferences.sessionEmail !== false)
          setCourseUpdates(data.notificationPreferences.courseUpdates !== false)
        }
        if (data.whatsappNumber) {
          const p = parsePhone(data.whatsappNumber)
          setCountryCode(p.code)
          setPhoneNumber(p.number)
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [token])

  useEffect(() => {
    if (user?.notificationPreferences) {
      setCircleChatWhatsApp(user.notificationPreferences.circleChatWhatsApp !== false)
      setCircleChatEmail(user.notificationPreferences.circleChatEmail !== false)
      setSessionWhatsApp(user.notificationPreferences.sessionWhatsApp !== false)
      setSessionEmail(user.notificationPreferences.sessionEmail !== false)
      setCourseUpdates(user.notificationPreferences.courseUpdates !== false)
    }
    const p = parsePhone(
      user?.whatsappNumber || user?.contactNumber || user?.additionalDetails?.contactNumber || ""
    )
    setCountryCode(p.code)
    setPhoneNumber(p.number)
  }, [user])

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [])

  const filteredCountryCodes = countryCodes.filter((c) => {
    const q = searchCode.toLowerCase().trim()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
    )
  })

  const fullWhatsAppNumber = phoneNumber.trim() ? `${countryCode}${phoneNumber.trim()}` : ""

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)
    try {
      await dispatch(
        updateNotificationPreferences(token, {
          notificationPreferences: {
            circleChatWhatsApp,
            circleChatEmail,
            sessionWhatsApp,
            sessionEmail,
            courseUpdates,
          },
          whatsappNumber: fullWhatsAppNumber,
        })
      )
    } catch {
      // toast handled in SettingsAPI
    } finally {
      setSaving(false)
    }
  }

  const handleTestWhatsApp = async () => {
    if (!fullWhatsAppNumber) {
      toast.error("Please enter a valid WhatsApp phone number first.")
      return
    }
    setTestingWa(true)
    try {
      await sendTestNotification(token, "whatsapp")
    } catch {
      // handled
    } finally {
      setTestingWa(false)
    }
  }

  const handleTestEmail = async () => {
    if (!user?.email) {
      toast.error("User email not found.")
      return
    }
    setTestingEmail(true)
    try {
      await sendTestNotification(token, "email")
    } catch {
      // handled
    } finally {
      setTestingEmail(false)
    }
  }

  // Toggle Switch UI Component
  const ToggleSwitch = ({ checked, onChange, id, label }) => (
    <label
      htmlFor={id}
      style={{
        position: "relative",
        display: "inline-block",
        width: "48px",
        height: "26px",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ opacity: 0, width: 0, height: 0 }}
      />
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: checked ? "#2563EB" : "#CBD5E1",
          borderRadius: "26px",
          transition: "0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: checked ? "0 2px 8px rgba(37, 99, 235, 0.35)" : "none",
        }}
      >
        <span
          style={{
            position: "absolute",
            content: '""',
            height: "20px",
            width: "20px",
            left: checked ? "24px" : "3px",
            bottom: "3px",
            backgroundColor: "white",
            borderRadius: "50%",
            transition: "0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          }}
        />
      </span>
      <span className="sr-only" style={{ display: "none" }}>{label}</span>
    </label>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          borderRadius: "20px",
          padding: "28px 32px",
          color: "#FFFFFF",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "18px",
              }}
            >
              <FiBell />
            </span>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: "#FFFFFF" }}>
              Notification Preferences
            </h2>
          </div>
          <p style={{ color: "#94A3B8", fontSize: "14px", margin: 0, maxWidth: "600px" }}>
            Control instant alerts across WhatsApp and Email. Never miss key discussions in your Circles, session schedules, and learning updates.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            fontWeight: 700,
            fontSize: "14px",
            cursor: saving ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
            opacity: saving ? 0.7 : 1,
            transition: "all 0.15s ease",
          }}
        >
          <FiSave /> {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>

      {/* Circle Traction Callout Feature Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)",
          border: "2px solid #BFDBFE",
          borderRadius: "18px",
          padding: "20px 24px",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "#2563EB",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            flexShrink: 0,
          }}
        >
          <FiZap />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#1E3A8A", margin: 0 }}>
              Circle Traction Engine Active
            </h3>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                background: "#DBEAFE",
                color: "#1D4ED8",
                padding: "2px 8px",
                borderRadius: "20px",
              }}
            >
              Essential for Circle Growth
            </span>
          </div>
          <p style={{ color: "#3B82F6", fontSize: "13.5px", margin: 0, lineHeight: 1.55 }}>
            Small circles achieve required momentum when members receive instant notifications on WhatsApp and Email whenever someone chats. Prompt replies keep peer cohorts energized and thriving!
          </p>
        </div>
      </div>

      {/* 1. Circle Chat Notifications Card */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          padding: "26px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
          <FiUsers style={{ color: "#2563EB", fontSize: "20px" }} />
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              Circle Chat &amp; Peer Activity Notifications
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
              Alerts dispatched to you when a practitioner or peer sends a message in your enrolled Circles.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* WhatsApp Circle Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px",
              background: "#F8FAFC",
              borderRadius: "14px",
              border: "1px solid #E2E8F0",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#DCFCE7",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  flexShrink: 0,
                }}
              >
                <FiMessageSquare />
              </div>
              <div>
                <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>WhatsApp Circle Chat Alerts</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#16A34A", background: "#DCFCE7", padding: "1px 7px", borderRadius: "10px" }}>
                    Recommended
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
                  Receive an instant WhatsApp message with sender name, message preview, and a direct room access link.
                </p>
              </div>
            </div>
            <ToggleSwitch
              id="circleChatWhatsApp"
              checked={circleChatWhatsApp}
              onChange={setCircleChatWhatsApp}
              label="WhatsApp Circle Chat Alerts"
            />
          </div>

          {/* Email Circle Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px",
              background: "#F8FAFC",
              borderRadius: "14px",
              border: "1px solid #E2E8F0",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#EFF6FF",
                  color: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  flexShrink: 0,
                }}
              >
                <FiMail />
              </div>
              <div>
                <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>Email Circle Chat Notifications</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", background: "#DBEAFE", padding: "1px 7px", borderRadius: "10px" }}>
                    Active
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
                  Receive a beautifully formatted email with full context and a one-click &quot;Reply in Circle&quot; button.
                </p>
              </div>
            </div>
            <ToggleSwitch
              id="circleChatEmail"
              checked={circleChatEmail}
              onChange={setCircleChatEmail}
              label="Email Circle Chat Notifications"
            />
          </div>
        </div>
      </div>

      {/* 2. Sessions & Consultations Reminders Card */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          padding: "26px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
          <FiCalendar style={{ color: "#7C3AED", fontSize: "20px" }} />
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              1:1 &amp; Group Session Reminders
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
              Automated reminders dispatched 1 hour, 15 minutes, and 2 minutes before video calls start.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px",
              background: "#F8FAFC",
              borderRadius: "14px",
              border: "1px solid #E2E8F0",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#0F172A" }}>
                WhatsApp Session Reminders
              </div>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
                Direct room access link on WhatsApp so you can join instantly from your phone.
              </p>
            </div>
            <ToggleSwitch
              id="sessionWhatsApp"
              checked={sessionWhatsApp}
              onChange={setSessionWhatsApp}
              label="WhatsApp Session Reminders"
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px",
              background: "#F8FAFC",
              borderRadius: "14px",
              border: "1px solid #E2E8F0",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#0F172A" }}>
                Email Session Reminders
              </div>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
                Calendar-friendly email invites with clinical agendas and preparation notes.
              </p>
            </div>
            <ToggleSwitch
              id="sessionEmail"
              checked={sessionEmail}
              onChange={setSessionEmail}
              label="Email Session Reminders"
            />
          </div>
        </div>
      </div>

      {/* 3. Course Content Updates Card */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          padding: "26px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
          <FiVideo style={{ color: "#D97706", fontSize: "20px" }} />
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              Course &amp; Curriculum Video Alerts
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
              Instant notification when an instructor uploads a new video lecture to your enrolled courses.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            background: "#F8FAFC",
            borderRadius: "14px",
            border: "1px solid #E2E8F0",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#0F172A" }}>
              Video Lecture Upload Alerts (WhatsApp &amp; Email)
            </div>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
              Be the first to learn when new lesson recordings and modules are published.
            </p>
          </div>
          <ToggleSwitch
            id="courseUpdates"
            checked={courseUpdates}
            onChange={setCourseUpdates}
            label="Video Lecture Upload Alerts"
          />
        </div>
      </div>

      {/* 4. Delivery Channels & Test Verification Card */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          padding: "26px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
          <FiSmartphone style={{ color: "#10B981", fontSize: "20px" }} />
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              Alert Delivery Channels &amp; Real-Time Verification
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0" }}>
              Verify your WhatsApp phone number and registered email to test live delivery.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {/* Email Channel */}
          <div
            style={{
              padding: "18px",
              background: "#F8FAFC",
              borderRadius: "14px",
              border: "1px solid #E2E8F0",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                Registered Email
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  background: "#DCFCE7",
                  color: "#16A34A",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <FiCheckCircle size={11} /> Verified
              </span>
            </div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", wordBreak: "break-all" }}>
              {user?.email || "No email linked"}
            </div>
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={testingEmail}
              style={{
                marginTop: "auto",
                background: "#FFFFFF",
                border: "1px solid #CBD5E1",
                borderRadius: "10px",
                padding: "9px 14px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#2563EB",
                cursor: testingEmail ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.15s ease",
              }}
            >
              <FiSend size={13} /> {testingEmail ? "Sending test email..." : "Send Test Email Alert"}
            </button>
          </div>

          {/* WhatsApp Channel */}
          <div
            style={{
              padding: "18px",
              background: "#F8FAFC",
              borderRadius: "14px",
              border: "1px solid #E2E8F0",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                WhatsApp Phone Number
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  background: fullWhatsAppNumber ? "#DCFCE7" : "#FEF3C7",
                  color: fullWhatsAppNumber ? "#16A34A" : "#D97706",
                  padding: "2px 8px",
                  borderRadius: "20px",
                }}
              >
                {fullWhatsAppNumber ? "Connected" : "Action Needed"}
              </span>
            </div>

            {/* Input with country code */}
            <div style={{ display: "flex", gap: "8px", position: "relative" }}>
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    height: "42px",
                    padding: "0 10px",
                    background: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    color: "#0F172A",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>{countryCode}</span>
                  <FiChevronDown size={14} style={{ color: "#64748B" }} />
                </button>

                {isDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "48px",
                      left: 0,
                      width: "250px",
                      maxHeight: "220px",
                      overflowY: "auto",
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      zIndex: 50,
                      padding: "6px",
                    }}
                  >
                    <div style={{ padding: "4px 8px 6px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "#F1F5F9",
                          borderRadius: "8px",
                          padding: "6px 8px",
                        }}
                      >
                        <FiSearch size={13} style={{ color: "#64748B" }} />
                        <input
                          type="text"
                          placeholder="Search country..."
                          value={searchCode}
                          onChange={(e) => setSearchCode(e.target.value)}
                          style={{
                            border: "none",
                            background: "transparent",
                            outline: "none",
                            fontSize: "12px",
                            width: "100%",
                          }}
                        />
                      </div>
                    </div>
                    {filteredCountryCodes.map((c, i) => (
                      <div
                        key={`${c.code}_${i}`}
                        onClick={() => {
                          setCountryCode(c.code)
                          setIsDropdownOpen(false)
                        }}
                        style={{
                          padding: "8px 10px",
                          fontSize: "12.5px",
                          cursor: "pointer",
                          borderRadius: "6px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: c.code === countryCode ? "#EFF6FF" : "transparent",
                          color: c.code === countryCode ? "#2563EB" : "#334155",
                          fontWeight: c.code === countryCode ? 700 : 500,
                        }}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.country}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: "11.5px", color: "#64748B" }}>
                          {c.code}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="tel"
                placeholder="Mobile number (e.g. 9876543210)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d]/g, ""))}
                style={{
                  flex: 1,
                  height: "42px",
                  padding: "0 12px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  fontSize: "14px",
                  outline: "none",
                  fontWeight: 600,
                  color: "#0F172A",
                  background: "#FFFFFF",
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleTestWhatsApp}
              disabled={testingWa || !phoneNumber.trim()}
              style={{
                marginTop: "auto",
                background: "#FFFFFF",
                border: "1px solid #CBD5E1",
                borderRadius: "10px",
                padding: "9px 14px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#16A34A",
                cursor: testingWa || !phoneNumber.trim() ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                opacity: !phoneNumber.trim() ? 0.6 : 1,
                transition: "all 0.15s ease",
              }}
            >
              <FiSend size={13} /> {testingWa ? "Sending test WhatsApp..." : "Send Test WhatsApp Alert"}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Save Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "12px",
          padding: "16px 0",
        }}
      >
        <span style={{ fontSize: "13px", color: "#64748B" }}>
          Changes apply instantly to incoming Circle discussions and scheduled sessions.
        </span>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "12px",
            padding: "12px 28px",
            fontWeight: 800,
            fontSize: "14px",
            cursor: saving ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
            opacity: saving ? 0.7 : 1,
          }}
        >
          <FiSave /> {saving ? "Saving Preferences..." : "Save Notification Preferences"}
        </button>
      </div>
    </div>
  )
}
