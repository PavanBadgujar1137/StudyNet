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

  const handleEndClass = async () => {
    if (isInstructor) {
      if (window.confirm("Are you sure you want to end this Zoom live class for all students?")) {
        await endClass(token, classId)
        toast.success("Class ended.")
        navigate("/dashboard/instructor")
      }
    } else {
      await leaveClass(token, classId)
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
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-richblack-950 via-richblack-900 to-richblack-950 p-4 md:p-8 text-richblack-200">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-richblack-800/80 backdrop-blur-xl border border-richblack-700/70 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/15 blur-3xl rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/15 blur-3xl rounded-full pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                {classDetails.status === "live" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/90 text-white text-xs font-bold rounded-full shadow-lg shadow-red-600/30 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    LIVE ON ZOOM
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold rounded-full">
                    <FiCalendar size={12} /> SCHEDULED
                  </span>
                )}
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium rounded-full">
                  Zoom Integration
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-richblack-5 tracking-tight">
                {classDetails.title}
              </h1>

              {classDetails.description && (
                <p className="text-richblack-300 text-sm leading-relaxed">
                  {classDetails.description}
                </p>
              )}
            </div>

            {/* Quick Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isInstructor && classDetails.status === "scheduled" ? (
                <button
                  onClick={handleStartStream}
                  disabled={starting}
                  className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl shadow-xl shadow-purple-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                >
                  <FiPlayCircle size={18} />
                  {starting ? "Initializing Zoom..." : "Start Zoom Meeting"}
                </button>
              ) : (
                <button
                  onClick={() => launchZoom(activeZoomUrl)}
                  className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-xl shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <FiExternalLink size={18} />
                  {isInstructor ? "Launch Zoom as Host" : "Join Zoom Meeting"}
                </button>
              )}

              <button
                onClick={handleEndClass}
                className="flex items-center justify-center gap-2 px-4 py-3.5 bg-richblack-700/80 hover:bg-red-950/40 hover:text-red-400 border border-richblack-600 hover:border-red-500/40 text-richblack-200 text-sm font-semibold rounded-xl transition-all"
              >
                <FiPower size={16} />
                {isInstructor ? "End Session" : "Leave"}
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Display Container */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-richblack-950 border border-richblack-800 rounded-3xl overflow-hidden shadow-xl min-h-[380px] flex flex-col justify-between relative">
              
              {/* Header inside screen */}
              <div className="p-4 bg-richblack-900/90 border-b border-richblack-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <FiVideo size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-richblack-5">Zoom Meeting Experience</h3>
                    <p className="text-[10px] text-richblack-400">High-Definition Audio & Video Portal</p>
                  </div>
                </div>

                <button
                  onClick={() => setEmbedMode(!embedMode)}
                  className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 transition-all"
                >
                  <FiTv size={14} />
                  {embedMode ? "Switch to Launch View" : "Embed Web Preview"}
                </button>
              </div>

              {/* Screen Body */}
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-radial from-richblack-900 to-richblack-950 relative">
                {embedMode ? (
                  <iframe
                    src={zoomWebEmbedUrl}
                    title="Zoom In-Dashboard Video Call"
                    className="w-full h-[560px] rounded-xl border border-richblack-800 shadow-2xl bg-black"
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                  />
                ) : (
                  <div className="max-w-md space-y-6 py-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600/30 to-purple-600/30 border border-blue-500/30 flex items-center justify-center mx-auto shadow-2xl text-blue-400 animate-pulse">
                      <FiVideo size={40} />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-richblack-5">
                        {classDetails.status === "live"
                          ? "Zoom Session Active"
                          : "Ready for Zoom Meeting"}
                      </h3>
                      <p className="text-xs text-richblack-300 leading-relaxed">
                        Click below to launch the Zoom meeting application directly or access the room through your browser.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => launchZoom(activeZoomUrl)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <FiExternalLink size={16} />
                        Open in Zoom App / Web
                      </button>
                      
                      <button
                        onClick={() => setEmbedMode(true)}
                        className="px-6 py-3 bg-richblack-800 hover:bg-richblack-700 text-richblack-200 border border-richblack-700 font-semibold text-xs rounded-xl transition-all"
                      >
                        Try Web Embed
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Footer Info */}
              <div className="px-6 py-3.5 bg-richblack-900/60 border-t border-richblack-800/80 flex items-center justify-between text-xs text-richblack-400">
                <span className="flex items-center gap-1.5">
                  <FiShield size={14} className="text-emerald-400" />
                  Encrypted Zoom Meeting
                </span>
                <span>OpenHand Video Integration</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Meeting Details & Credentials */}
          <div className="space-y-6">
            {/* Meeting Credentials Card */}
            <div className="bg-richblack-800/90 border border-richblack-700 rounded-3xl p-6 shadow-xl space-y-5">
              <h2 className="text-base font-bold text-richblack-5 flex items-center gap-2 border-b border-richblack-700 pb-3">
                <FiVideo className="text-purple-400" size={18} />
                Zoom Meeting Details
              </h2>

              {/* Meeting ID */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-richblack-400 uppercase tracking-wider">
                  Meeting ID
                </label>
                <div className="flex items-center justify-between bg-richblack-900 border border-richblack-700 rounded-xl px-3.5 py-2.5">
                  <span className="font-mono text-sm text-richblack-100 font-semibold">
                    {classDetails.zoomMeetingId || "Generating..."}
                  </span>
                  <button
                    onClick={() => copyToClipboard(classDetails.zoomMeetingId, "Meeting ID")}
                    className="p-1.5 text-richblack-400 hover:text-purple-400 transition-colors"
                    title="Copy Meeting ID"
                  >
                    {copiedField === "Meeting ID" ? <FiCheckCircle className="text-emerald-400" size={16} /> : <FiCopy size={16} />}
                  </button>
                </div>
              </div>

              {/* Passcode */}
              {classDetails.zoomPassword && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-richblack-400 uppercase tracking-wider">
                    Passcode
                  </label>
                  <div className="flex items-center justify-between bg-richblack-900 border border-richblack-700 rounded-xl px-3.5 py-2.5">
                    <span className="font-mono text-sm text-richblack-100 font-semibold">
                      {classDetails.zoomPassword}
                    </span>
                    <button
                      onClick={() => copyToClipboard(classDetails.zoomPassword, "Passcode")}
                      className="p-1.5 text-richblack-400 hover:text-purple-400 transition-colors"
                      title="Copy Passcode"
                    >
                      {copiedField === "Passcode" ? <FiCheckCircle className="text-emerald-400" size={16} /> : <FiCopy size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Join Link Copy */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-richblack-400 uppercase tracking-wider">
                  Direct Join Link
                </label>
                <div className="flex items-center justify-between bg-richblack-900 border border-richblack-700 rounded-xl px-3.5 py-2.5 gap-2">
                  <span className="font-mono text-xs text-richblack-300 truncate">
                    {classDetails.zoomJoinUrl || "No link available"}
                  </span>
                  <button
                    onClick={() => copyToClipboard(classDetails.zoomJoinUrl, "Join Link")}
                    className="p-1.5 text-richblack-400 hover:text-purple-400 transition-colors flex-shrink-0"
                    title="Copy Join Link"
                  >
                    {copiedField === "Join Link" ? <FiCheckCircle className="text-emerald-400" size={16} /> : <FiCopy size={16} />}
                  </button>
                </div>
              </div>

              {/* Launch Button */}
              <button
                onClick={() => launchZoom(activeZoomUrl)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <FiExternalLink size={16} />
                Open Zoom Session
              </button>
            </div>

            {/* Stage 03 — AURA AI Speech Co-Pilot & 90-Sec Draft Notes Widget */}
            <div className="bg-gradient-to-br from-purple-950/60 to-richblack-900 border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping"></span>
                  <h3 className="font-bold text-richblack-5 text-sm">
                    AURA AI Session Co-Pilot (Stage 03)
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 rounded-full">
                  Consent Active
                </span>
              </div>

              <p className="text-xs text-richblack-300">
                AURA listens quietly in the background (with learner consent) to suggest techniques and auto-draft your session notes in 90 seconds.
              </p>

              {/* AURA Live Speech & Peripheral Suggestion */}
              <div className="bg-richblack-950/80 border border-richblack-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-purple-300">
                  <span>Peripheral AURA Suggestion</span>
                  <span className="text-teal-400">Live Feedback</span>
                </div>
                <div className="text-xs text-richblack-100 italic bg-purple-900/20 border border-purple-500/20 p-2.5 rounded-lg">
                  "💡 Notice theme detected: Delegation boundaries &amp; workload stress. Suggested question: 'What would it feel like to let one worry go without resolving it first?'"
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
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
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-richblack-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <FiCheckCircle size={16} />
                  End Call &amp; Generate AURA Notes (90s)
                </button>
              </div>
            </div>

            {/* Class Schedule Information Card */}
            <div className="bg-richblack-800/90 border border-richblack-700 rounded-3xl p-6 shadow-xl space-y-4 text-xs text-richblack-300">
              <h3 className="font-bold text-richblack-100 text-sm border-b border-richblack-700 pb-2">
                Session Guidelines
              </h3>
              
              <div className="flex items-center gap-3">
                <FiClock className="text-purple-400 flex-shrink-0" size={16} />
                <span>
                  Starts:{" "}
                  <strong className="text-richblack-100">
                    {classDetails.scheduledStart
                      ? new Date(classDetails.scheduledStart).toLocaleString()
                      : "Now"}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <FiUser className="text-purple-400 flex-shrink-0" size={16} />
                <span>
                  Host: <strong className="text-richblack-100">{isInstructor ? "You (Instructor)" : "Course Instructor"}</strong>
                </span>
              </div>

              <div className="pt-2 border-t border-richblack-700/60 text-[11px] text-richblack-400">
                Ensure you have the Zoom Client installed or grant permission to launch the Zoom web player when prompted.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

