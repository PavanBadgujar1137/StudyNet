import React, { useState, useEffect, useCallback } from "react"
import { useSelector } from "react-redux"
import {
  FiCalendar,
  FiVideo,
  FiCheckCircle,
  FiSearch,
  FiRefreshCw,
  FiSend,
  FiCheck,
  FiX,
  FiExternalLink,
  FiCopy,
  FiAlertCircle,
  FiBell,
  FiMessageSquare,
  FiGlobe,
  FiUsers,
  FiClock,
  FiInfo,
} from "react-icons/fi"
import toast from "react-hot-toast"
import { apiConnector } from "../../../services/apiConnector"

export default function ScheduledCallsTab() {
  const { token } = useSelector((state) => state.auth)

  const [calls, setCalls] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pendingCallLinks: 0,
    linksSent: 0,
    completed: 0,
  })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Modal State for Sending Call Link
  const [activeCallModal, setActiveCallModal] = useState(null)
  const [googleMeetLink, setGoogleMeetLink] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [isSending, setIsSending] = useState(false)

  // Full Discovery Questionnaire Modal
  const [viewDetailsModal, setViewDetailsModal] = useState(null)

  // Fetch Scheduled Calls
  const fetchCalls = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (statusFilter !== "all") queryParams.append("status", statusFilter)
      if (searchQuery.trim()) queryParams.append("search", searchQuery.trim())

      const res = await apiConnector(
        "GET",
        `/api/v1/admin/scheduled-calls?${queryParams.toString()}`,
        null,
        { Authorization: `Bearer ${token}` }
      )

      if (res?.data?.success) {
        setCalls(res.data.calls || [])
        if (res.data.stats) setStats(res.data.stats)
      } else {
        toast.error(res?.data?.message || "Failed to load calls")
      }
    } catch (err) {
      console.error("fetchCalls error:", err)
      toast.error("Failed to load scheduled calls")
    } finally {
      setLoading(false)
    }
  }, [token, statusFilter, searchQuery])

  useEffect(() => {
    fetchCalls()
  }, [fetchCalls])

  // Open "Send Call Link" Modal
  const handleOpenSendLinkModal = (call) => {
    setActiveCallModal(call)
    setGoogleMeetLink(call.googleMeetLink || "")
    setAdminNotes(call.adminNotes || "")
  }

  // Submit Call Link & Dispatch Email + WhatsApp
  const handleSendCallLink = async (e) => {
    e.preventDefault()
    if (!googleMeetLink.trim()) {
      toast.error("Please enter a valid Google Meet link")
      return
    }

    const cleanLink = googleMeetLink.trim()
    if (!cleanLink.startsWith("http://") && !cleanLink.startsWith("https://")) {
      toast.error("Please enter a valid URL starting with https://")
      return
    }
    if (cleanLink.includes("ohp-")) {
      toast.error("Invalid meeting code format. Please create a real room on Google Meet.")
      return
    }

    setIsSending(true)
    const toastId = toast.loading(`Sending Google Meet link to ${activeCallModal.practitionerEmail}...`)

    try {
      const res = await apiConnector(
        "POST",
        "/api/v1/admin/send-call-link",
        {
          callId: activeCallModal._id,
          googleMeetLink: googleMeetLink.trim(),
          adminNotes: adminNotes.trim(),
        },
        { Authorization: `Bearer ${token}` }
      )

      if (res?.data?.success) {
        toast.success(res.data.message || "Google Meet link sent via Email & WhatsApp!", { id: toastId })
        setActiveCallModal(null)
        fetchCalls()
      } else {
        toast.error(res?.data?.message || "Failed to send link", { id: toastId })
      }
    } catch (err) {
      console.error("handleSendCallLink error:", err)
      toast.error("Failed to send call link", { id: toastId })
    } finally {
      setIsSending(false)
    }
  }

  // Update Call Status
  const handleUpdateStatus = async (callId, newStatus) => {
    const toastId = toast.loading(`Updating call status to ${newStatus}...`)
    try {
      const res = await apiConnector(
        "PATCH",
        `/api/v1/admin/scheduled-calls/${callId}/status`,
        { status: newStatus },
        { Authorization: `Bearer ${token}` }
      )

      if (res?.data?.success) {
        toast.success(`Call marked as ${newStatus}!`, { id: toastId })
        fetchCalls()
      } else {
        toast.error(res?.data?.message || "Failed to update status", { id: toastId })
      }
    } catch (err) {
      console.error("handleUpdateStatus error:", err)
      toast.error("Failed to update status", { id: toastId })
    }
  }

  // Trigger Manual Reminder (1hour, 5min, instant_meet)
  const handleTriggerReminder = async (callId, type) => {
    const label = type === "1hour" ? "1-Hour Reminder" : type === "5min" ? "5-Minute Reminder" : "Instant Meet Link"
    const toastId = toast.loading(`Dispatching ${label} via Email & WhatsApp...`)
    try {
      const res = await apiConnector(
        "POST",
        `/api/v1/admin/scheduled-calls/${callId}/send-reminder`,
        { type },
        { Authorization: `Bearer ${token}` }
      )
      if (res?.data?.success) {
        toast.success(res.data.message || `${label} sent!`, { id: toastId })
        fetchCalls()
      } else {
        toast.error(res?.data?.message || "Failed to trigger reminder", { id: toastId })
      }
    } catch (err) {
      console.error("handleTriggerReminder error:", err)
      toast.error("Failed to trigger reminder", { id: toastId })
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 4 KPI Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "20px 24px", border: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              <FiCalendar />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Total</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0F172A" }}>{stats.total}</div>
          <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>Total Discovery Calls</div>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "20px 24px", border: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              <FiAlertCircle />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#D97706", textTransform: "uppercase" }}>Action Required</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#D97706" }}>{stats.pendingCallLinks}</div>
          <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>Needs Google Meet Link</div>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "20px 24px", border: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              <FiVideo />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#4F46E5", textTransform: "uppercase" }}>Delivered</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#4F46E5" }}>{stats.linksSent}</div>
          <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>Meet Links Sent</div>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "20px 24px", border: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              <FiCheckCircle />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>Done</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#059669" }}>{stats.completed}</div>
          <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>Calls Completed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 16, border: "1px solid #E2E8F0", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        {/* Status Tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "all", label: `All Calls (${stats.total})` },
            { id: "scheduled", label: `Needs Meet Link (${stats.pendingCallLinks})` },
            { id: "call_link_sent", label: `Link Sent (${stats.linksSent})` },
            { id: "completed", label: `Completed (${stats.completed})` },
          ].map((tab) => {
            const isActive = statusFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  border: isActive ? "1px solid #2563EB" : "1px solid #E2E8F0",
                  background: isActive ? "#EFF6FF" : "#F8FAFC",
                  color: isActive ? "#2563EB" : "#64748B",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Search Input & Refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", minWidth: 260 }}>
            <FiSearch style={{ position: "absolute", left: 12, top: 11, color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Search practitioner, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: 10,
                border: "1px solid #E2E8F0",
                fontSize: 12,
                outline: "none",
                background: "#F8FAFC",
              }}
            />
          </div>

          <button
            type="button"
            onClick={fetchCalls}
            title="Refresh"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "1px solid #E2E8F0",
              background: "#F8FAFC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748B",
            }}
          >
            <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: "#64748B", gap: 10 }}>
            <FiRefreshCw className="animate-spin" /> Loading discovery calls...
          </div>
        ) : calls.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}>
            <FiCalendar size={40} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: "#475569" }}>No Discovery Calls Found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Practitioner calls booked through pricing plans will appear here.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  <th style={{ padding: "12px 16px", color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Practitioner</th>
                  <th style={{ padding: "12px 16px", color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Contact &amp; Social</th>
                  <th style={{ padding: "12px 16px", color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Plan &amp; Paid</th>
                  <th style={{ padding: "12px 16px", color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Schedule Slot</th>
                  <th style={{ padding: "12px 16px", color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Reminders</th>
                  <th style={{ padding: "12px 16px", color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Google Meet Room</th>
                  <th style={{ padding: "12px 16px", color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => {
                  const isScheduled = call.status === "scheduled"
                  const isCompleted = call.status === "completed"
                  const phone = call.whatsappNumber || call.practitionerPhone || ""

                  return (
                    <tr
                      key={call._id}
                      style={{ borderBottom: "1px solid #F1F5F9", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Practitioner Column with 'Info' Option */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                            {call.practitionerName?.[0] || "P"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span>{call.practitionerName}</span>
                              <button
                                type="button"
                                onClick={() => setViewDetailsModal(call)}
                                title="View All Discovery Information & Questionnaire Answers"
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  border: "1px solid #BFDBFE",
                                  background: "#EFF6FF",
                                  color: "#2563EB",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  transition: "all 0.15s",
                                }}
                              >
                                <FiInfo size={11} /> Info
                              </button>
                            </div>
                            <div style={{ fontSize: 11, color: "#64748B" }}>
                              {call.paidCommunityStrength ? `Community: ${call.paidCommunityStrength}` : call.modality || "Discovery Call"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details & Social */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ color: "#0F172A", fontWeight: 600 }}>{call.practitionerEmail}</div>
                        {phone && (
                          <div style={{ fontSize: 11, color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                            <span>WhatsApp: {phone}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(phone)
                                toast.success("WhatsApp number copied!")
                              }}
                              style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8" }}
                              title="Copy WhatsApp"
                            >
                              <FiCopy size={11} />
                            </button>
                          </div>
                        )}
                        {call.socialProfileLink && (
                          <div style={{ fontSize: 11, marginTop: 2 }}>
                            <a
                              href={call.socialProfileLink.startsWith("http") ? call.socialProfileLink : `https://${call.socialProfileLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#2563EB", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}
                            >
                              Profile Link <FiExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Plan & Amount */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 700, color: "#2563EB" }}>{call.planName}</div>
                        <div style={{ fontSize: 11, color: "#10B981", fontWeight: 700 }}>
                          ₹{Number(call.amountPaid || 9588).toLocaleString("en-IN")} · Paid
                        </div>
                      </td>

                      {/* Schedule Slot */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 700, color: "#0F172A" }}>{call.scheduledDate}</div>
                        <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>{call.scheduledTimeSlot}</div>
                      </td>

                      {/* Automated Reminder Tracking Badges */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 12,
                              fontSize: 10,
                              fontWeight: 700,
                              background: call.reminder1HourSent ? "#ECFDF5" : "#F1F5F9",
                              color: call.reminder1HourSent ? "#059669" : "#64748B",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              width: "fit-content",
                            }}
                          >
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: call.reminder1HourSent ? "#10B981" : "#94A3B8" }} />
                            1h: {call.reminder1HourSent ? "Sent" : "Pending"}
                          </span>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 12,
                              fontSize: 10,
                              fontWeight: 700,
                              background: call.reminder5MinSent ? "#ECFDF5" : "#F1F5F9",
                              color: call.reminder5MinSent ? "#059669" : "#64748B",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              width: "fit-content",
                            }}
                          >
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: call.reminder5MinSent ? "#10B981" : "#94A3B8" }} />
                            5m: {call.reminder5MinSent ? "Sent" : "Pending"}
                          </span>
                        </div>
                      </td>

                      {/* Google Meet Link Info */}
                      <td style={{ padding: "14px 16px" }}>
                        {call.googleMeetLink && !call.googleMeetLink.includes("ohp-") ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <a
                              href={call.googleMeetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#2563EB", fontWeight: 700, fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                            >
                              <FiVideo /> Join Meet <FiExternalLink size={11} />
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(call.googleMeetLink)
                                toast.success("Meet link copied to clipboard!")
                              }}
                              title="Copy Link"
                              style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8" }}
                            >
                              <FiCopy size={13} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "#94A3B8", fontSize: 12, fontStyle: "italic" }}>Not assigned yet</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {/* Send / Update Meet Link */}
                          <button
                            type="button"
                            onClick={() => handleOpenSendLinkModal(call)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 700,
                              border: "none",
                              background: isScheduled ? "#2563EB" : "#EFF6FF",
                              color: isScheduled ? "#FFFFFF" : "#1D4ED8",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <FiSend size={11} />
                            {call.googleMeetLink ? "Update Meet" : "Send Meet"}
                          </button>

                          {/* Quick Trigger 1h Reminder */}
                          <button
                            type="button"
                            onClick={() => handleTriggerReminder(call._id, "1hour")}
                            title="Send 1-Hour Reminder (Email + WhatsApp)"
                            style={{
                              padding: "5px 8px",
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 600,
                              border: "1px solid #E2E8F0",
                              background: "#FFFFFF",
                              color: "#475569",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <FiClock size={11} /> 1h
                          </button>

                          {/* Quick Trigger 5m Reminder */}
                          <button
                            type="button"
                            onClick={() => handleTriggerReminder(call._id, "5min")}
                            title="Send 5-Minute Reminder (Email + WhatsApp)"
                            style={{
                              padding: "5px 8px",
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 600,
                              border: "1px solid #E2E8F0",
                              background: "#FFFFFF",
                              color: "#059669",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <FiBell size={11} /> 5m
                          </button>

                          {/* View Full Questionnaire & Info */}
                          <button
                            type="button"
                            onClick={() => setViewDetailsModal(call)}
                            title="View Full Discovery Questionnaire & Booking Info"
                            style={{
                              padding: "5px 10px",
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 700,
                              border: "1px solid #BFDBFE",
                              background: "#EFF6FF",
                              color: "#2563EB",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <FiInfo size={12} /> Info
                          </button>

                          {/* Mark Done / Reopen */}
                          {!isCompleted ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(call._id, "completed")}
                              title="Mark as Completed"
                              style={{
                                padding: "5px 8px",
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: 600,
                                border: "1px solid #E2E8F0",
                                background: "#FFFFFF",
                                color: "#059669",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              <FiCheck size={11} /> Done
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(call._id, "call_link_sent")}
                              title="Re-open Call"
                              style={{
                                padding: "5px 8px",
                                borderRadius: 8,
                                fontSize: 10,
                                fontWeight: 600,
                                border: "1px solid #E2E8F0",
                                background: "#FFFFFF",
                                color: "#64748B",
                                cursor: "pointer",
                              }}
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── MODAL: SEND / UPDATE GOOGLE MEET LINK ─── */}
      {activeCallModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 20,
              width: "100%",
              maxWidth: 520,
              padding: 24,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #F1F5F9", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  <FiVideo />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
                    Send Working Google Meet Link
                  </h3>
                  <div style={{ fontSize: 12, color: "#64748B" }}>
                    To: {activeCallModal.practitionerName} ({activeCallModal.practitionerEmail})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveCallModal(null)}
                style={{ border: "none", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 20 }}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSendCallLink} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 12, border: "1px solid #E2E8F0", fontSize: 12 }}>
                <div><b>Date:</b> {activeCallModal.scheduledDate} &bull; <b>Slot:</b> {activeCallModal.scheduledTimeSlot}</div>
                <div><b>WhatsApp:</b> {activeCallModal.whatsappNumber || activeCallModal.practitionerPhone || "—"}</div>
                <div><b>Plan:</b> {activeCallModal.planName} (₹{activeCallModal.amountPaid})</div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                    Working Google Meet Call URL *
                  </label>
                  <button
                    type="button"
                    onClick={() => window.open("https://meet.google.com/new", "_blank")}
                    title="Opens Google Meet in a new tab to create an instant real meeting room"
                    style={{
                      background: "#EFF6FF",
                      border: "1px solid #BFDBFE",
                      color: "#2563EB",
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <FiVideo size={12} />
                    <span>+ Create Room on Google Meet</span>
                    <FiExternalLink size={10} />
                  </button>
                </div>
                <input
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={googleMeetLink}
                  onChange={(e) => setGoogleMeetLink(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
                  <span style={{ fontSize: 11, color: "#64748B" }}>
                    Click &ldquo;+ Create Room&rdquo; to launch Google Meet, copy your new link, and paste here.
                  </span>
                  {googleMeetLink.trim() && (
                    <button
                      type="button"
                      onClick={() => window.open(googleMeetLink.trim(), "_blank")}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#2563EB",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <FiExternalLink size={11} /> Test Link
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Notes / Instructions for Practitioner (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Please join 2 mins early with your course materials..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setActiveCallModal(null)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "1px solid #E2E8F0",
                    background: "#FFFFFF",
                    color: "#64748B",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                  }}
                >
                  {isSending ? "Dispatching..." : "Send via Email & WhatsApp →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: FULL DISCOVERY QUESTIONNAIRE & BOOKING INFO ─── */}
      {viewDetailsModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewDetailsModal(null)
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              width: "100%",
              maxWidth: 820,
              maxHeight: "90vh",
              overflowY: "auto",
              overflowX: "hidden",
              padding: "24px 28px",
              boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
              border: "1px solid #E2E8F0",
              boxSizing: "border-box",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, borderBottom: "1px solid #F1F5F9", paddingBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  <FiInfo />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0F172A" }}>
                      {viewDetailsModal.practitionerName}
                    </h3>
                    <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" }}>
                      {viewDetailsModal.planName || "Pro Plan (Yearly)"}
                    </span>
                    <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}>
                      ₹{Number(viewDetailsModal.amountPaid || 9588).toLocaleString("en-IN")} Paid
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                    Scheduled: <strong style={{ color: "#0F172A" }}>{viewDetailsModal.scheduledDate}</strong> at <strong style={{ color: "#0F172A" }}>{viewDetailsModal.scheduledTimeSlot}</strong> ({viewDetailsModal.timezone || "IST"})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewDetailsModal(null)}
                style={{ border: "none", background: "#F1F5F9", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", cursor: "pointer", fontSize: 18 }}
              >
                <FiX />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginBottom: 18 }}>
              <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "10px 14px", border: "1px solid #E2E8F0", minWidth: 0, overflow: "hidden" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Gateway / Order</span>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", marginTop: 3, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, minWidth: 0 }}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "#1E293B",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      minWidth: 0,
                      display: "block",
                    }}
                    title={viewDetailsModal.payglocalOrderId || viewDetailsModal.paymentGateway || "PayGlocal"}
                  >
                    {viewDetailsModal.payglocalOrderId || viewDetailsModal.paymentGateway || "PayGlocal"}
                  </span>
                  {viewDetailsModal.payglocalOrderId && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(viewDetailsModal.payglocalOrderId)
                        toast.success("Order ID copied!")
                      }}
                      style={{ border: "none", background: "transparent", color: "#94A3B8", cursor: "pointer", flexShrink: 0, padding: 0 }}
                      title="Copy Order ID"
                    >
                      <FiCopy size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "10px 14px", border: "1px solid #E2E8F0", minWidth: 0, overflow: "hidden" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px" }}>1-Hour Reminder</span>
                <div style={{ fontSize: 12, fontWeight: 700, color: viewDetailsModal.reminder1HourSent ? "#059669" : "#D97706", marginTop: 3, display: "flex", alignItems: "center", gap: 6, minWidth: 0, whiteSpace: "nowrap" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: viewDetailsModal.reminder1HourSent ? "#10B981" : "#F59E0B", flexShrink: 0 }} />
                  <span>{viewDetailsModal.reminder1HourSent ? "Sent (Email + WhatsApp)" : "Scheduled / Pending"}</span>
                </div>
              </div>

              <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "10px 14px", border: "1px solid #E2E8F0", minWidth: 0, overflow: "hidden" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px" }}>5-Min Reminder</span>
                <div style={{ fontSize: 12, fontWeight: 700, color: viewDetailsModal.reminder5MinSent ? "#059669" : "#D97706", marginTop: 3, display: "flex", alignItems: "center", gap: 6, minWidth: 0, whiteSpace: "nowrap" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: viewDetailsModal.reminder5MinSent ? "#10B981" : "#F59E0B", flexShrink: 0 }} />
                  <span>{viewDetailsModal.reminder5MinSent ? "Sent (Email + WhatsApp)" : "Scheduled / Pending"}</span>
                </div>
              </div>
            </div>

            {/* Google Meet Room Card */}
            <div style={{ background: "#EEF2FF", padding: "14px 18px", borderRadius: 14, border: "1px solid #C7D2FE", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#3730A3", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                    <FiVideo /> Working Google Meet Conference Room
                  </div>
                  <div style={{ fontSize: 13, color: "#2563EB", fontWeight: 700, marginTop: 4 }}>
                    {viewDetailsModal.googleMeetLink || "Not assigned yet"}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {viewDetailsModal.googleMeetLink && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(viewDetailsModal.googleMeetLink)
                          toast.success("Google Meet link copied!")
                        }}
                        style={{ background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <FiCopy size={12} /> Copy
                      </button>
                      <a
                        href={viewDetailsModal.googleMeetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ background: "#2563EB", color: "#FFFFFF", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        Join Meet <FiExternalLink size={12} />
                      </a>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const cur = viewDetailsModal
                      setViewDetailsModal(null)
                      handleOpenSendLinkModal(cur)
                    }}
                    style={{ background: "#FFFFFF", border: "1px solid #2563EB", color: "#2563EB", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    Edit / Re-send
                  </button>
                </div>
              </div>
            </div>

            {/* 11 Questionnaire Responses Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
              {/* Group 1: Contact Details */}
              <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 13, borderBottom: "1px solid #F1F5F9", paddingBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <FiUsers /> 1. Contact &amp; Communication Details
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
                {/* 1. Name */}
                <div style={{ background: "#F8FAFC", padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0", minWidth: 0, overflow: "hidden" }}>
                  <span style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Full Name</span>
                  <div style={{ fontWeight: 700, color: "#0F172A", marginTop: 2, wordBreak: "break-word" }}>{viewDetailsModal.practitionerName}</div>
                </div>

                {/* 2. Email */}
                <div style={{ background: "#F8FAFC", padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0", minWidth: 0, overflow: "hidden" }}>
                  <span style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Email Address</span>
                  <div style={{ fontWeight: 700, color: "#0F172A", marginTop: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, minWidth: 0 }}>
                    <a href={`mailto:${viewDetailsModal.practitionerEmail}`} style={{ color: "#2563EB", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{viewDetailsModal.practitionerEmail}</a>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(viewDetailsModal.practitionerEmail)
                        toast.success("Email copied!")
                      }}
                      style={{ border: "none", background: "transparent", color: "#94A3B8", cursor: "pointer", flexShrink: 0 }}
                      title="Copy Email"
                    >
                      <FiCopy size={12} />
                    </button>
                  </div>
                </div>

                {/* 3. WhatsApp Number */}
                <div style={{ background: "#F8FAFC", padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0", minWidth: 0, overflow: "hidden" }}>
                  <span style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>WhatsApp Number</span>
                  <div style={{ fontWeight: 700, color: "#059669", marginTop: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, minWidth: 0 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{viewDetailsModal.whatsappNumber || viewDetailsModal.practitionerPhone || "—"}</span>
                    {(viewDetailsModal.whatsappNumber || viewDetailsModal.practitionerPhone) && (
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(viewDetailsModal.whatsappNumber || viewDetailsModal.practitionerPhone)
                            toast.success("WhatsApp number copied!")
                          }}
                          style={{ border: "none", background: "transparent", color: "#94A3B8", cursor: "pointer" }}
                          title="Copy Number"
                        >
                          <FiCopy size={12} />
                        </button>
                        <a
                          href={`https://wa.me/${String(viewDetailsModal.whatsappNumber || viewDetailsModal.practitionerPhone).replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#059669", fontSize: 11, fontWeight: 700, textDecoration: "none" }}
                        >
                          Open Chat &rarr;
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Social Profile Link */}
                <div style={{ background: "#F8FAFC", padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0", minWidth: 0, overflow: "hidden" }}>
                  <span style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Social Profile Link</span>
                  <div style={{ marginTop: 2, minWidth: 0, overflow: "hidden" }}>
                    {viewDetailsModal.socialProfileLink ? (
                      <a
                        href={viewDetailsModal.socialProfileLink.startsWith("http") ? viewDetailsModal.socialProfileLink : `https://${viewDetailsModal.socialProfileLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#2563EB", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, wordBreak: "break-all" }}
                      >
                        {viewDetailsModal.socialProfileLink} <FiExternalLink size={12} style={{ flexShrink: 0 }} />
                      </a>
                    ) : (
                      <span style={{ color: "#94A3B8" }}>—</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Guests */}
              {viewDetailsModal.guests && (Array.isArray(viewDetailsModal.guests) ? viewDetailsModal.guests.length > 0 : Boolean(viewDetailsModal.guests)) && (
                <div style={{ background: "#F8FAFC", padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0", minWidth: 0, overflow: "hidden" }}>
                  <span style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Invited Guests</span>
                  <div style={{ color: "#0F172A", fontWeight: 600, marginTop: 2, wordBreak: "break-word" }}>
                    {Array.isArray(viewDetailsModal.guests) ? viewDetailsModal.guests.join(", ") : viewDetailsModal.guests}
                  </div>
                </div>
              )}

              {/* Group 2: Practice & Community Details */}
              <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 13, borderBottom: "1px solid #F1F5F9", paddingBottom: 6, marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <FiGlobe /> 2. Practice &amp; Business Profile
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
                {/* 5. How did they find us */}
                <div style={{ background: "#F8FAFC", padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0", minWidth: 0, overflow: "hidden" }}>
                  <span style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>How did they get to know about us?</span>
                  <div style={{ fontWeight: 700, color: "#0F172A", marginTop: 2, wordBreak: "break-word" }}>
                    {viewDetailsModal.referralSource || "—"}
                  </div>
                </div>

                {/* 6. Course / Workshop Status */}
                <div style={{ background: "#F8FAFC", padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0", minWidth: 0, overflow: "hidden" }}>
                  <span style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Sells courses/workshops or planning to launch?</span>
                  <div style={{ fontWeight: 700, color: "#0F172A", marginTop: 2, wordBreak: "break-word" }}>
                    {viewDetailsModal.courseSellingStatus || "—"}
                  </div>
                </div>

                {/* 7. Other Platforms Used */}
                <div style={{ background: "#F8FAFC", padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0", minWidth: 0, overflow: "hidden" }}>
                  <span style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Other platforms currently used</span>
                  <div style={{ fontWeight: 700, color: "#0F172A", marginTop: 2, wordBreak: "break-word" }}>
                    {viewDetailsModal.otherPlatforms || "None / —"}
                  </div>
                </div>

                {/* 8. Strength of current paid community */}
                <div style={{ background: "#F8FAFC", padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0", minWidth: 0, overflow: "hidden" }}>
                  <span style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Strength of current paid community</span>
                  <div style={{ fontWeight: 800, color: "#2563EB", marginTop: 2, wordBreak: "break-word" }}>
                    {viewDetailsModal.paidCommunityStrength || "—"}
                  </div>
                </div>

                {/* 9. Timeline to move */}
                <div style={{ background: "#F8FAFC", padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0", minWidth: 0, overflow: "hidden" }}>
                  <span style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Timeline to move if it is a fit</span>
                  <div style={{ fontWeight: 700, color: "#0F172A", marginTop: 2, wordBreak: "break-word" }}>
                    {viewDetailsModal.timelineToMove || "—"}
                  </div>
                </div>
              </div>

              {/* Group 3: Virtual Call Expectations */}
              <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 13, borderBottom: "1px solid #F1F5F9", paddingBottom: 6, marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <FiMessageSquare /> 3. Expectations from Virtual Call
              </div>

              <div style={{ background: "#F8FAFC", padding: "12px 16px", borderRadius: 10, border: "1px solid #E2E8F0", minWidth: 0, overflow: "hidden" }}>
                <span style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Specific feature-set / goals looking for:</span>
                <div style={{ color: "#0F172A", marginTop: 4, lineHeight: 1.6, fontWeight: 500, wordBreak: "break-word", fontStyle: viewDetailsModal.callExpectations || viewDetailsModal.goals ? "normal" : "italic" }}>
                  {viewDetailsModal.callExpectations || viewDetailsModal.goals || "No specific expectations entered."}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div style={{ marginTop: 22, paddingTop: 14, borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleTriggerReminder(viewDetailsModal._id, "1hour")}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#FFFFFF", color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  <FiClock size={12} /> Trigger 1h Reminder
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerReminder(viewDetailsModal._id, "5min")}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#FFFFFF", color: "#059669", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  <FiBell size={12} /> Trigger 5m Reminder
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewDetailsModal(null)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  border: "1px solid #E2E8F0",
                  background: "#0F172A",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
