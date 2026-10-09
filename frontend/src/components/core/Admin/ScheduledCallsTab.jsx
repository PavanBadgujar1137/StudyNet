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

  // Details Modal
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

  // Submit Call Link & Dispatch Email
  const handleSendCallLink = async (e) => {
    e.preventDefault()
    if (!googleMeetLink.trim()) {
      toast.error("Please enter a valid Google Meet link")
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
        toast.success(res.data.message || "Google Meet link sent via email!", { id: toastId })
        setActiveCallModal(null)
        fetchCalls()
      } else {
        toast.error(res?.data?.message || "Failed to send link", { id: toastId })
      }
    } catch (err) {
      console.error("handleSendCallLink error:", err)
      toast.error("Failed to send call link email", { id: toastId })
    } finally {
      setIsSending(false)
    }
  }

  // Update Call Status (e.g. mark completed)
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
          <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>Total Booked Calls</div>
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
          <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>Call Links Sent via Email</div>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "20px 24px", border: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              <FiCheckCircle />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>Done</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#059669" }}>{stats.completed}</div>
          <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>Guiding Completed</div>
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
            <FiRefreshCw className="animate-spin" /> Loading scheduled calls...
          </div>
        ) : calls.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}>
            <FiCalendar size={40} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: "#475569" }}>No Scheduled Calls Found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Practitioner onboarding calls booked with PayGlocal will appear here.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  <th style={{ padding: "12px 16px", color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Practitioner</th>
                  <th style={{ padding: "12px 16px", color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Contact Details</th>
                  <th style={{ padding: "12px 16px", color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Plan &amp; Amount</th>
                  <th style={{ padding: "12px 16px", color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Schedule Slot</th>
                  <th style={{ padding: "12px 16px", color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "12px 16px", color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Google Meet Link</th>
                  <th style={{ padding: "12px 16px", color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => {
                  const isScheduled = call.status === "scheduled"
                  const isLinkSent = call.status === "call_link_sent"
                  const isCompleted = call.status === "completed"

                  return (
                    <tr
                      key={call._id}
                      style={{ borderBottom: "1px solid #F1F5F9", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Practitioner Column */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                            {call.practitionerName?.[0] || "P"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0F172A" }}>{call.practitionerName}</div>
                            <div style={{ fontSize: 11, color: "#64748B" }}>{call.modality || "General Practice"}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ color: "#0F172A", fontWeight: 500 }}>{call.practitionerEmail}</div>
                        {call.practitionerPhone && (
                          <div style={{ fontSize: 11, color: "#64748B" }}>{call.practitionerPhone}</div>
                        )}
                      </td>

                      {/* Plan & Amount */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 700, color: "#2563EB" }}>{call.planName}</div>
                        <div style={{ fontSize: 11, color: "#10B981", fontWeight: 600 }}>
                          ₹{Number(call.amountPaid || 9588).toLocaleString("en-IN")} · PayGlocal Paid
                        </div>
                      </td>

                      {/* Schedule Slot */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 700, color: "#0F172A" }}>{call.scheduledDate}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>{call.scheduledTimeSlot}</div>
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: "14px 16px" }}>
                        {isScheduled && (
                          <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#FEF3C7", color: "#B45309", border: "1px solid #FDE68A", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D97706" }} />
                            Needs Meet Link
                          </span>
                        )}
                        {isLinkSent && (
                          <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563EB" }} />
                            Link Sent via Email
                          </span>
                        )}
                        {isCompleted && (
                          <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#ECFDF5", color: "#047857", border: "1px solid #A7F3D0", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669" }} />
                            Guiding Done
                          </span>
                        )}
                      </td>

                      {/* Google Meet Link Info */}
                      <td style={{ padding: "14px 16px" }}>
                        {call.googleMeetLink ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <a
                              href={call.googleMeetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#2563EB", fontWeight: 600, fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
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
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => handleOpenSendLinkModal(call)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              border: "none",
                              background: isScheduled ? "#2563EB" : "#EFF6FF",
                              color: isScheduled ? "#FFFFFF" : "#1D4ED8",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <FiSend size={12} />
                            {call.googleMeetLink ? "Resend Link" : "Send Meet Link"}
                          </button>

                          {!isCompleted ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(call._id, "completed")}
                              title="Mark as Completed"
                              style={{
                                padding: "6px 10px",
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 600,
                                border: "1px solid #E2E8F0",
                                background: "#FFFFFF",
                                color: "#059669",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <FiCheck size={12} /> Done
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(call._id, "call_link_sent")}
                              title="Re-open Call"
                              style={{
                                padding: "6px 10px",
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: 600,
                                border: "1px solid #E2E8F0",
                                background: "#FFFFFF",
                                color: "#64748B",
                                cursor: "pointer",
                              }}
                            >
                              Re-open
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setViewDetailsModal(call)}
                            title="View Practitioner Notes"
                            style={{
                              padding: "6px 10px",
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 600,
                              border: "1px solid #E2E8F0",
                              background: "#F8FAFC",
                              color: "#475569",
                              cursor: "pointer",
                            }}
                          >
                            Notes
                          </button>
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

      {/* ─── MODAL: SEND GOOGLE MEET LINK VIA EMAIL ─── */}
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
                    Send Google Meet Link via Email
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
                <div><b>Session Date:</b> {activeCallModal.scheduledDate}</div>
                <div><b>Time Slot:</b> {activeCallModal.scheduledTimeSlot}</div>
                <div><b>Plan:</b> {activeCallModal.planName} (₹{activeCallModal.amountPaid})</div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Google Meet Call URL *
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abcd-efg"
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
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Notes / Instructions for Practitioner (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Please join 2 mins early with your positioning notes..."
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
                    background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                  }}
                >
                  {isSending ? "Dispatching Email..." : "Send Link via Email →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: VIEW PRACTITIONER GOALS / NOTES ─── */}
      {viewDetailsModal && (
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
              maxWidth: 480,
              padding: 24,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
                Practitioner Call Goals &amp; Context
              </h3>
              <button
                type="button"
                onClick={() => setViewDetailsModal(null)}
                style={{ border: "none", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 20 }}
              >
                <FiX />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
              <div>
                <span style={{ color: "#64748B", fontWeight: 600 }}>Practitioner:</span>{" "}
                <b>{viewDetailsModal.practitionerName}</b>
              </div>
              <div>
                <span style={{ color: "#64748B", fontWeight: 600 }}>Modality:</span>{" "}
                <b>{viewDetailsModal.modality || "General Practice"}</b>
              </div>
              <div>
                <span style={{ color: "#64748B", fontWeight: 600 }}>Goals / Expectations for Call:</span>
                <div style={{ marginTop: 6, padding: 12, background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0", color: "#334155", fontStyle: viewDetailsModal.goals ? "normal" : "italic" }}>
                  {viewDetailsModal.goals || "No specific goals mentioned."}
                </div>
              </div>

              {viewDetailsModal.adminNotes && (
                <div>
                  <span style={{ color: "#64748B", fontWeight: 600 }}>Admin Call Notes:</span>
                  <div style={{ marginTop: 6, padding: 12, background: "#FEF3C7", borderRadius: 10, border: "1px solid #FDE68A", color: "#92400E" }}>
                    {viewDetailsModal.adminNotes}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button
                type="button"
                onClick={() => setViewDetailsModal(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "1px solid #E2E8F0",
                  background: "#F8FAFC",
                  color: "#0F172A",
                  fontWeight: 600,
                  fontSize: 12,
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
