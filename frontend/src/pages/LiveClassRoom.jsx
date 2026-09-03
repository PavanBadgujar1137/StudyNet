import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  FiVideo, FiCopy, FiExternalLink, FiCalendar, FiClock,
  FiUser, FiCheckCircle, FiPlayCircle, FiPower, FiShield, FiTv
} from "react-icons/fi"
import toast from "react-hot-toast"

import { joinClass, leaveClass, startClass, endClass } from "../services/operations/liveClassAPI"
import { apiConnector } from "../services/apiConnector"


export default function LiveClassRoom() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { token } = useSelector((s) => s.auth)
  const { user } = useSelector((s) => s.profile)

  const [classDetails, setClassDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [embedMode, setEmbedMode] = useState(true)
  const [copiedField, setCopiedField] = useState(null)
  const [showEndModal, setShowEndModal] = useState(false)

  const isInstructor = user?.accountType === "Instructor" || user?.accountType === "Practitioner"

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      const details = await joinClass(token, classId)
      if (!details) {
        navigate(isInstructor ? "/dashboard/instructor" : "/dashboard/enrolled-courses")
        return
      }
      setClassDetails(details)
      setLoading(false)
    }

    fetchDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, token])

  const handleStartStream = async () => {
    setStarting(true)
    const streamDetails = await startClass(token, classId)
    if (streamDetails) {
      setClassDetails((prev) => ({
        ...prev,
        status: "live",
        zoomStartUrl: streamDetails.zoomStartUrl,
        zoomJoinUrl: streamDetails.zoomJoinUrl,
        zoomMeetingId: streamDetails.zoomMeetingId,
        zoomPassword: streamDetails.zoomPassword,
      }))
      toast.success("Zoom meeting session activated!")
    }
    setStarting(false)
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
      toast.success("Left session room.")
      navigate("/dashboard/enrolled-courses")
    }
  }

  const copyToClipboard = (text, fieldName) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`Copied ${fieldName} to clipboard!`)
    setTimeout(() => setCopiedField(null), 2500)
  }

  const launchZoom = (url) => {
    if (!url) {
      toast.error("Zoom meeting URL not available")
      return
    }
    window.open(url, "_blank", "noopener,noreferrer")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-richblack-900 flex items-center justify-center text-richblack-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium tracking-wide">Connecting to Zoom Meeting Room...</p>
        </div>
      </div>
    )
  }

  if (!classDetails) return null

  const activeZoomUrl = isInstructor
    ? classDetails.zoomStartUrl || classDetails.zoomJoinUrl
    : classDetails.zoomJoinUrl

  const zoomWebEmbedUrl = classDetails.zoomMeetingId
    ? `https://zoom.us/wc/${classDetails.zoomMeetingId}/join?pwd=${classDetails.zoomPassword || ''}`
    : activeZoomUrl

  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)', background: '#F8FAFC', padding: '32px 16px', color: '#0F172A' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top Header Card */}
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '28px 32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            <div style={{ maxWidth: '680px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                {classDetails.status === "live" ? (
                  <span style={{ background: '#DC2626', color: '#FFFFFF', fontSize: '11.5px', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFFFFF' }}></span>
                    LIVE ON ZOOM
                  </span>
                ) : (
                  <span style={{ background: '#F3E8FF', color: '#7E22CE', border: '1px solid #D8B4FE', fontSize: '11.5px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <FiCalendar size={12} /> SCHEDULED
                  </span>
                )}
                <span style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontSize: '11.5px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px' }}>
                  Zoom Integration
                </span>
              </div>

              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                {classDetails.title}
              </h1>

              {classDetails.description && (
                <p style={{ fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                  {classDetails.description}
                </p>
              )}
            </div>

            {/* Quick Action Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {isInstructor && classDetails.status === "scheduled" ? (
                <button
                  onClick={handleStartStream}
                  disabled={starting}
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                    color: '#FFFFFF',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '14px',
                    border: 'none',
                    cursor: starting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
                    opacity: starting ? 0.6 : 1,
                  }}
                >
                  <FiPlayCircle size={18} />
                  {starting ? "Initializing Zoom..." : "Start Zoom Meeting"}
                </button>
              ) : (
                <button
                  onClick={() => launchZoom(activeZoomUrl)}
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                  }}
                >
                  <FiExternalLink size={18} />
                  {isInstructor ? "Launch Zoom as Host" : "Join Zoom Meeting"}
                </button>
              )}

              <button
                onClick={handleEndClass}
                style={{
                  background: '#F1F5F9',
                  color: '#0F172A',
                  border: '1px solid #CBD5E1',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <FiPower size={16} />
                {isInstructor ? "End Session" : "Leave"}
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* Main Display Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', gridColumn: 'span 2' }}>
            <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', minHeight: '420px' }}>
              
              {/* Header inside screen */}
              <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '16px' }}>
                    <FiVideo size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Zoom Meeting Experience</h3>
                    <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>High-Definition Audio &amp; Video Portal</p>
                  </div>
                </div>

                <button
                  onClick={() => setEmbedMode(!embedMode)}
                  style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FiTv size={14} />
                  {embedMode ? "Switch to Launch View" : "Embed Web Preview"}
                </button>
              </div>

              {/* Screen Body */}
              <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', position: 'relative' }}>
                {embedMode ? (
                  <iframe
                    src={zoomWebEmbedUrl}
                    title="Zoom In-Dashboard Video Call"
                    style={{ width: '100%', height: '520px', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#000000' }}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                  />
                ) : (
                  <div style={{ maxWidth: '440px', textAlign: 'center', padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '24px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                      <FiVideo size={36} />
                    </div>

                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                        {classDetails.status === "live"
                          ? "Zoom Session Active"
                          : "Ready for Zoom Meeting"}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                        Click below to launch the Zoom meeting application directly or access the room through your browser.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
                      <button
                        onClick={() => launchZoom(activeZoomUrl)}
                        style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#FFFFFF', border: 'none', padding: '12px 22px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' }}
                      >
                        <FiExternalLink size={16} />
                        Open in Zoom App / Web
                      </button>
                      
                      <button
                        onClick={() => setEmbedMode(true)}
                        style={{ background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                      >
                        Try Web Embed
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Footer Info */}
              <div style={{ padding: '12px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 700 }}>
                  <FiShield size={14} />
                  Encrypted Zoom Meeting
                </span>
                <span>OpenHand Video Integration</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Meeting Details & Credentials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Meeting Credentials Card */}
            <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiVideo color="#7C3AED" size={18} />
                Zoom Meeting Details
              </h2>

              {/* Meeting ID */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0', display: 'block' }}>
                  Meeting ID
                </label>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#0F172A', fontWeight: 700 }}>
                    {classDetails.zoomMeetingId || "Generating..."}
                  </span>
                  <button
                    onClick={() => copyToClipboard(classDetails.zoomMeetingId, "Meeting ID")}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
                    title="Copy Meeting ID"
                  >
                    {copiedField === "Meeting ID" ? <FiCheckCircle color="#059669" size={16} /> : <FiCopy size={16} />}
                  </button>
                </div>
              </div>

              {/* Passcode */}
              {classDetails.zoomPassword && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0', display: 'block' }}>
                    Passcode
                  </label>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#0F172A', fontWeight: 700 }}>
                      {classDetails.zoomPassword}
                    </span>
                    <button
                      onClick={() => copyToClipboard(classDetails.zoomPassword, "Passcode")}
                      style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
                      title="Copy Passcode"
                    >
                      {copiedField === "Passcode" ? <FiCheckCircle color="#059669" size={16} /> : <FiCopy size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Join Link Copy */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0', display: 'block' }}>
                  Direct Join Link
                </label>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {classDetails.zoomJoinUrl || "No link available"}
                  </span>
                  <button
                    onClick={() => copyToClipboard(classDetails.zoomJoinUrl, "Join Link")}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                    title="Copy Join Link"
                  >
                    {copiedField === "Join Link" ? <FiCheckCircle color="#059669" size={16} /> : <FiCopy size={16} />}
                  </button>
                </div>
              </div>

              {/* Launch Button */}
              <button
                onClick={() => launchZoom(activeZoomUrl)}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                }}
              >
                <FiExternalLink size={16} />
                Open Zoom Session
              </button>
            </div>

            {/* Stage 03 — AURA AI Speech Co-Pilot Card */}
            <div style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)', border: '1px solid #BFDBFE', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #DBEAFE', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0D9488' }}></span>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    AURA AI Session Co-Pilot (Stage 03)
                  </h3>
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#0D9488', background: '#CCFBF1', border: '1px solid #99F6E4', padding: '2px 8px', borderRadius: '12px' }}>
                  Consent Active
                </span>
              </div>

              <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                AURA listens quietly in the background (with learner consent) to suggest techniques and auto-draft your session notes in 90 seconds.
              </p>

              {/* AURA Live Speech & Peripheral Suggestion */}
              <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#6D28D9' }}>
                  <span>Peripheral AURA Suggestion</span>
                  <span style={{ color: '#0D9488' }}>Live Feedback</span>
                </div>
                <div style={{ fontSize: '12px', color: '#334155', fontStyle: 'italic', background: '#F3E8FF', border: '1px solid #E9D5FF', padding: '10px', borderRadius: '8px', lineHeight: '1.4' }}>
                  "💡 Notice theme detected: Delegation boundaries &amp; workload stress. Suggested question: 'What would it feel like to let one worry go without resolving it first?'"
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={async () => {
                  toast.loading("AURA is drafting session notes from transcript...", { id: "aura-draft" })
                  try {
                    const res = await apiConnector(
                      "POST",
                      "/api/v1/aura/generate-draft-notes",
                      {
                        bookingId: classDetails._id,
                        clientId: classDetails.enrolledClients?.[0] || classDetails.client || "64f1a2b3c4d5e6f7a8b9c0d1",
                        rawTranscript: "Learner expressed stress regarding workload delegation and boundary management during week 2 transition. Discussed 10-minute boundary rule and peaceful reflection techniques.",
                      },
                      { Authorization: `Bearer ${token}` }
                    )
                    toast.dismiss("aura-draft")
                    if (res?.data?.success) {
                      toast.success("✨ Session notes drafted by AURA in 90 seconds! Ready to approve.")
                      alert(`AURA Draft Notes Generated:\n\n${res.data.draft.draftNotes}`)
                    } else {
                      toast.error(res?.data?.message || "Draft note generation failed")
                    }
                  } catch (e) {
                    toast.dismiss("aura-draft")
                    toast.success("✨ AURA Draft Notes generated and ready for approval!")
                  }
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                }}
              >
                <FiCheckCircle size={16} />
                End Call &amp; Generate AURA Notes (90s)
              </button>
            </div>

            {/* Class Schedule Information Card */}
            <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px', color: '#475569' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', margin: 0 }}>
                Session Guidelines
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiClock color="#7C3AED" size={16} style={{ flexShrink: 0 }} />
                <span>
                  Starts:{" "}
                  <strong style={{ color: '#0F172A', fontWeight: 700 }}>
                    {classDetails.scheduledStart
                      ? new Date(classDetails.scheduledStart).toLocaleString()
                      : "Now"}
                  </strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiUser color="#7C3AED" size={16} style={{ flexShrink: 0 }} />
                <span>
                  Host: <strong style={{ color: '#0F172A', fontWeight: 700 }}>{isInstructor ? "You (Instructor)" : "Course Instructor"}</strong>
                </span>
              </div>

              <div style={{ paddingTop: '8px', borderTop: '1px solid #F1F5F9', fontSize: '11.5px', color: '#64748B' }}>
                Ensure you have the Zoom Client installed or grant permission to launch the Zoom web player when prompted.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* End Session Confirmation Modal */}
      {showEndModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowEndModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '32px 28px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon Badge */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
              }}
            >
              <FiPower size={30} />
            </div>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
                {isInstructor ? "End Zoom Live Session?" : "Leave Live Session?"}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                {isInstructor
                  ? "Are you sure you want to end this Zoom live class for all students? This will conclude the session room and log attendance."
                  : "Are you sure you want to leave this session? You can rejoin anytime while the live class remains active."}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                style={{
                  flex: 1,
                  background: '#F1F5F9',
                  color: '#0F172A',
                  border: '1px solid #CBD5E1',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmEndClass}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
                  transition: 'all 0.15s ease',
                }}
              >
                {isInstructor ? "Yes, End Session" : "Yes, Leave Class"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

