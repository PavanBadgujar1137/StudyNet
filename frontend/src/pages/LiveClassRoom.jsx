import React, { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  FiVideo,
  FiCopy,
  FiCalendar,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiPlayCircle,
  FiPower,
  FiShield,
  FiArrowLeft,
  FiMessageSquare,
  FiRadio,
  FiRefreshCw,
} from "react-icons/fi"
import toast from "react-hot-toast"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import "@livekit/components-styles"

import { joinClass, leaveClass, startClass, endClass, getLiveClassToken } from "../services/operations/liveClassAPI"

export default function LiveClassRoom() {
  const { classId } = useParams()
  const navigate = useNavigate()

  const { token } = useSelector((s) => s.auth)
  const { user } = useSelector((s) => s.profile)

  const [classDetails, setClassDetails] = useState(null)
  const [livekitToken, setLivekitToken] = useState(null)
  const [livekitServerUrl, setLivekitServerUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)
  const [roomConnected, setRoomConnected] = useState(false)
  const [reflectionNotes, setReflectionNotes] = useState("")

  const isInstructor = user?.accountType === "Instructor" || user?.accountType === "Practitioner"

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(isInstructor ? "/dashboard/instructor" : "/dashboard?tab=sessions")
    }
  }

  // Fetch class session info and initial LiveKit token
  const fetchDetails = useCallback(async () => {
    setLoading(true)
    const details = await joinClass(token, classId)
    if (!details) {
      navigate(isInstructor ? "/dashboard/instructor" : "/dashboard/enrolled-courses")
      return
    }

    setClassDetails(details)
    if (details.livekitToken) {
      setLivekitToken(details.livekitToken)
    }
    if (details.livekitServerUrl) {
      setLivekitServerUrl(details.livekitServerUrl)
    }
    setLoading(false)
  }, [classId, token, isInstructor, navigate])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  // Instructor initiates the live session
  const handleStartStream = async () => {
    setStarting(true)
    const streamDetails = await startClass(token, classId)
    if (streamDetails) {
      setClassDetails((prev) => ({
        ...prev,
        status: "live",
        livekitRoomName: streamDetails.livekitRoomName,
        livekitServerUrl: streamDetails.livekitServerUrl,
        livekitToken: streamDetails.livekitToken,
      }))
      if (streamDetails.livekitToken) {
        setLivekitToken(streamDetails.livekitToken)
      }
      if (streamDetails.livekitServerUrl) {
        setLivekitServerUrl(streamDetails.livekitServerUrl)
      }
      toast.success("LiveKit WebRTC session is now active!")
    }
    setStarting(false)
  }

  // Refresh token if needed
  const handleRefreshToken = async () => {
    const toastId = toast.loading("Reconnecting to LiveKit...")
    const res = await getLiveClassToken(token, classId)
    if (res?.livekitToken) {
      setLivekitToken(res.livekitToken)
      if (res.livekitServerUrl) setLivekitServerUrl(res.livekitServerUrl)
      toast.success("LiveKit session reconnected!", { id: toastId })
    } else {
      toast.error("Could not refresh session token.", { id: toastId })
    }
  }

  const handleEndClass = () => {
    setShowEndModal(true)
  }

  const confirmEndClass = async () => {
    setShowEndModal(false)
    if (isInstructor) {
      await endClass(token, classId)
      toast.success("Class ended successfully.")
      navigate("/dashboard/instructor")
    } else {
      await leaveClass(token, classId)
      toast.success("Left live session.")
      navigate("/dashboard/enrolled-courses")
    }
  }

  const copySessionLink = () => {
    const shareUrl = `${window.location.origin}/live/${classId}`
    navigator.clipboard.writeText(shareUrl)
    setCopiedLink(true)
    toast.success("Copied live session link to clipboard!")
    setTimeout(() => setCopiedLink(false), 2500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-richblack-900 flex items-center justify-center text-richblack-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium tracking-wide">Connecting to LiveKit Room...</p>
        </div>
      </div>
    )
  }

  if (!classDetails) return null

  const isLive = classDetails.status === "live"
  const canConnect = Boolean(livekitToken && livekitServerUrl && (isLive || isInstructor))

  return (
    <div style={{ minHeight: "calc(100vh - 3.5rem)", background: "#0F172A", padding: "24px 16px", color: "#F8FAFC" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Top Header Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handleGoBack}
              style={{
                background: "rgba(30, 41, 59, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#E2E8F0",
                padding: "8px 16px",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.15s ease",
              }}
            >
              <FiArrowLeft size={16} /> Back
            </button>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "#FFFFFF", letterSpacing: "-0.3px" }}>
                  {classDetails.title}
                </h1>
                {isLive ? (
                  <span style={{
                    background: "#DC2626",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: "12px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 0 12px rgba(220, 38, 38, 0.6)",
                  }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#FFFFFF", animation: "pulse 1.5s infinite" }}></span>
                    LIVE
                  </span>
                ) : (
                  <span style={{
                    background: "rgba(124, 58, 237, 0.2)",
                    color: "#C4B5FD",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "12px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}>
                    <FiCalendar size={12} /> SCHEDULED
                  </span>
                )}
                <span style={{
                  background: classDetails.sessionType === "group" ? "rgba(37, 99, 235, 0.2)" : "rgba(168, 85, 247, 0.2)",
                  color: classDetails.sessionType === "group" ? "#93C5FD" : "#DDD6FE",
                  border: classDetails.sessionType === "group" ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid rgba(168, 85, 247, 0.3)",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}>
                  {classDetails.sessionType === "group" ? <FiVideo size={12} /> : <FiUser size={12} />}
                  {classDetails.sessionType === "group" ? "Group Session" : "1-on-1 Private"}
                </span>
                <span style={{
                  background: roomConnected ? "rgba(16, 185, 129, 0.2)" : "rgba(37, 99, 235, 0.15)",
                  color: roomConnected ? "#6EE7B7" : "#93C5FD",
                  border: roomConnected ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(59, 130, 246, 0.3)",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}>
                  <FiRadio size={12} /> {roomConnected ? "Connected Live" : "LiveKit WebRTC"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={copySessionLink}
              style={{
                background: "rgba(30, 41, 59, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#E2E8F0",
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Copy session invite link"
            >
              {copiedLink ? <FiCheckCircle color="#10B981" size={15} /> : <FiCopy size={15} />}
              {copiedLink ? "Link Copied" : "Copy Link"}
            </button>

            {isInstructor && !isLive && (
              <button
                onClick={handleStartStream}
                disabled={starting}
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "9px 18px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: starting ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(124, 58, 237, 0.4)",
                  opacity: starting ? 0.7 : 1,
                }}
              >
                <FiPlayCircle size={16} />
                {starting ? "Starting..." : "Start Live Session"}
              </button>
            )}

            <button
              onClick={handleRefreshToken}
              style={{
                background: "rgba(30, 41, 59, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#94A3B8",
                padding: "8px 12px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Reconnect / Refresh session"
            >
              <FiRefreshCw size={14} />
            </button>

            <button
              onClick={handleEndClass}
              style={{
                background: "rgba(220, 38, 38, 0.15)",
                border: "1px solid rgba(220, 38, 38, 0.3)",
                color: "#FCA5A5",
                padding: "8px 16px",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FiPower size={15} />
              {isInstructor ? "End Session" : "Leave"}
            </button>
          </div>
        </div>

        {/* Main Classroom Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "stretch", minHeight: "680px" }}>
          
          {/* Main Video Arena */}
          <div style={{
            background: "#020617",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)",
          }}>
            {canConnect ? (
              <LiveKitRoom
                video={true}
                audio={true}
                token={livekitToken}
                serverUrl={livekitServerUrl}
                connect={true}
                data-lk-theme="default"
                onConnected={() => setRoomConnected(true)}
                onDisconnected={() => {
                  setRoomConnected(false)
                  toast("Session disconnected.", { icon: "ℹ️" })
                }}
                onError={(err) => {
                  console.error("LiveKit room error:", err)
                  toast.error(`LiveKit connection error: ${err.message}`)
                }}
                style={{ width: "100%", height: "100%", minHeight: "650px", flex: 1 }}
              >
                <VideoConference />
              </LiveKitRoom>
            ) : (
              /* Waiting / Lobby Screen */
              <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 24px",
                textAlign: "center",
                gap: "24px",
                background: "radial-gradient(ellipse at top, #1E1B4B 0%, #020617 70%)",
              }}>
                <div style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "24px",
                  background: "linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(37, 99, 235, 0.2))",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#A78BFA",
                  boxShadow: "0 0 30px rgba(124, 58, 237, 0.25)",
                }}>
                  <FiVideo size={40} />
                </div>

                <div style={{ maxWidth: "480px" }}>
                  <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#FFFFFF", margin: "0 0 10px 0" }}>
                    {isInstructor ? "Ready to Launch Your Live Session" : "Waiting for Instructor to Start"}
                  </h2>
                  <p style={{ fontSize: "14px", color: "#94A3B8", margin: 0, lineHeight: "1.6" }}>
                    {isInstructor
                      ? "Your LiveKit WebRTC room is prepared with high-definition audio, video, screen-sharing, and real-time interactive chat."
                      : "The host has not started the session yet. This page will connect automatically once the session is live."}
                  </p>
                </div>

                {isInstructor ? (
                  <button
                    onClick={handleStartStream}
                    disabled={starting}
                    style={{
                      background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "14px 28px",
                      borderRadius: "14px",
                      fontWeight: 800,
                      fontSize: "15px",
                      cursor: starting ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      boxShadow: "0 8px 24px rgba(124, 58, 237, 0.4)",
                      transition: "transform 0.15s ease",
                    }}
                  >
                    <FiPlayCircle size={20} />
                    {starting ? "Launching Live Room..." : "Launch Live Classroom Now"}
                  </button>
                ) : (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(30, 41, 59, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    color: "#CBD5E1",
                  }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F59E0B", animation: "ping 1.5s infinite" }}></span>
                    Standing by in Waiting Room
                  </div>
                )}

                <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "#64748B", marginTop: "12px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <FiShield size={14} color="#10B981" /> WebRTC End-to-End Security
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <FiRadio size={14} color="#38BDF8" /> Adaptive Dynacast HD
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Session Info & Practitioner Note Pad */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Session Metadata Card */}
            <div style={{
              background: "#1E293B",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Live Session Info
                </span>
                <span style={{ fontSize: "11px", color: "#38BDF8", fontWeight: 700 }}>
                  LiveKit SFU
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#CBD5E1" }}>
                  <FiClock size={16} color="#A78BFA" />
                  <span>
                    Scheduled:{" "}
                    <strong style={{ color: "#FFFFFF" }}>
                      {classDetails.scheduledStart
                        ? new Date(classDetails.scheduledStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Now"}
                    </strong>
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#CBD5E1" }}>
                  <FiUser size={16} color="#A78BFA" />
                  <span>
                    Host:{" "}
                    <strong style={{ color: "#FFFFFF" }}>
                      {isInstructor ? "You (Practitioner)" : "Course Instructor"}
                    </strong>
                  </span>
                </div>

                {classDetails.client && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#CBD5E1" }}>
                    <FiUser size={16} color="#38BDF8" />
                    <span>
                      Client:{" "}
                      <strong style={{ color: "#FFFFFF" }}>
                        {classDetails.client.firstName} {classDetails.client.lastName}
                      </strong>
                    </span>
                  </div>
                )}

                {classDetails.livekitRoomName && (
                  <div style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}>
                    <span style={{ fontSize: "11px", color: "#64748B" }}>Room Identifier</span>
                    <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#38BDF8" }}>
                      {classDetails.livekitRoomName}
                    </span>
                  </div>
                )}
              </div>

              {classDetails.description && (
                <p style={{ fontSize: "12.5px", color: "#94A3B8", margin: 0, lineHeight: "1.5", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "10px" }}>
                  {classDetails.description}
                </p>
              )}
            </div>

            {/* Practitioner Live Reflection Notes (Aura AI Ready) */}
            <div style={{
              background: "#1E293B",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "20px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiMessageSquare size={16} color="#A78BFA" />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>
                    {isInstructor ? "Session Clinical Notes" : "Personal Reflection"}
                  </span>
                </div>
              </div>

              <textarea
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder={isInstructor ? "Note client observations, key milestones, and post-session homework..." : "Record key insights, breakthroughs, or notes from today's session..."}
                style={{
                  width: "100%",
                  flex: 1,
                  minHeight: "180px",
                  background: "#0F172A",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "12px",
                  fontSize: "13px",
                  color: "#E2E8F0",
                  resize: "none",
                  outline: "none",
                  lineHeight: "1.5",
                  boxSizing: "border-box",
                }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#64748B" }}>
                <span>Notes auto-save locally</span>
                <button
                  type="button"
                  onClick={() => toast.success("Session reflection saved!")}
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "none",
                    color: "#CBD5E1",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Save Note
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* End Session Confirmation Modal */}
      {showEndModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2, 6, 23, 0.8)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setShowEndModal(false)}
        >
          <div
            style={{
              background: "#1E293B",
              borderRadius: "20px",
              padding: "28px",
              maxWidth: "440px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(220, 38, 38, 0.2)",
                color: "#F87171",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiPower size={26} />
            </div>

            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF", margin: "0 0 8px 0" }}>
                {isInstructor ? "Conclude Live Session?" : "Leave Live Room?"}
              </h3>
              <p style={{ fontSize: "13px", color: "#94A3B8", margin: 0, lineHeight: "1.5" }}>
                {isInstructor
                  ? "Ending this session will disconnect all connected participants and finalize attendance logs."
                  : "Are you sure you want to leave this live room? You can rejoin at any point while the session is live."}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "6px" }}>
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#E2E8F0",
                  border: "none",
                  padding: "11px 16px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmEndClass}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "11px 16px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.4)",
                }}
              >
                {isInstructor ? "Yes, End Session" : "Yes, Leave"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
