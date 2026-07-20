import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  HMSRoomProvider,
  useHMSActions,
  useHMSStore,
  selectIsConnectedToRoom,
  selectPeers,
  selectLocalPeer,
} from "@100mslive/react-sdk"
import { io } from "socket.io-client"
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneCall,
  FiMessageSquare, FiUsers, FiActivity,
} from "react-icons/fi"
import toast from "react-hot-toast"

import { SOCKET_BASE_URL } from "../services/apis"
import { joinClass, leaveClass, startClass, endClass } from "../services/operations/liveClassAPI"
import LiveChat from "../components/core/LiveClass/LiveChat"
import AttendeeList from "../components/core/LiveClass/AttendeeList"

// ── Inside Room Component (HMS Enabled context) ─────────────────────────────────
const RoomStage = ({ classDetails, hmsToken, socket }) => {
  const navigate = useNavigate()
  const hmsActions = useHMSActions()
  const isConnected = useHMSStore(selectIsConnectedToRoom)
  const peers = usePeers()
  const localPeer = useHMSStore(selectLocalPeer)
  const { user } = useSelector((s) => s.profile)
  const { token } = useSelector((s) => s.auth)

  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [sidebarTab, setSidebarTab] = useState("chat") // chat | users

  const isInstructor = user?.accountType === "Instructor"

  useEffect(() => {
    if (hmsToken && !isConnected && user) {
      hmsActions.join({
        userName: `${user.firstName} ${user.lastName}`,
        authToken: hmsToken,
      })
    }

    return () => {
      if (isConnected) {
        hmsActions.leave()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hmsToken, isConnected])

  const toggleMic = async () => {
    await hmsActions.setLocalAudioEnabled(!micOn)
    setMicOn(!micOn)
  }

  const toggleCam = async () => {
    await hmsActions.setLocalVideoEnabled(!camOn)
    setCamOn(!camOn)
  }

  const handleEndClass = async () => {
    if (isInstructor) {
      if (window.confirm("End the live class session for all students?")) {
        await endClass(token, classDetails._id)
        await hmsActions.leave()
        navigate("/dashboard/instructor")
      }
    } else {
      await leaveClass(token, classDetails._id)
      await hmsActions.leave()
      navigate("/dashboard/enrolled-courses")
    }
  }

  // Find instructor stream
  const instructorPeer = peers.find((p) => p.roleName === "instructor")
  const activeStreamPeer = instructorPeer || localPeer

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-80px)] p-4 max-w-7xl mx-auto">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col bg-richblack-950 border border-richblack-800 rounded-2xl overflow-hidden relative">
        {/* Video Screen */}
        <div className="flex-1 flex items-center justify-center bg-black relative">
          {activeStreamPeer && activeStreamPeer.videoTrack ? (
            <VideoTile peer={activeStreamPeer} />
          ) : (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto animate-pulse">
                <FiActivity size={32} />
              </div>
              <p className="text-richblack-300 text-sm">
                {isInstructor ? "Prepare your camera/microphone to go live" : "Waiting for the instructor to start streaming..."}
              </p>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
              🔴 LIVE
            </span>
            <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-richblack-200 text-xs rounded-full">
              {classDetails.title}
            </span>
          </div>
        </div>

        {/* Control Bar */}
        <div className="bg-richblack-900 border-t border-richblack-800 px-6 py-4 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={toggleMic}
              className={`p-3 rounded-xl transition-all ${
                micOn ? "bg-richblack-700 hover:bg-richblack-600 text-richblack-100" : "bg-red-600 text-white"
              }`}
            >
              {micOn ? <FiMic size={18} /> : <FiMicOff size={18} />}
            </button>
            <button
              onClick={toggleCam}
              className={`p-3 rounded-xl transition-all ${
                camOn ? "bg-richblack-700 hover:bg-richblack-600 text-richblack-100" : "bg-red-600 text-white"
              }`}
            >
              {camOn ? <FiVideo size={18} /> : <FiVideoOff size={18} />}
            </button>
          </div>

          <button
            onClick={handleEndClass}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all"
          >
            <FiPhoneCall size={16} /> {isInstructor ? "End Class" : "Leave Class"}
          </button>
        </div>
      </div>

      {/* Right Sidebar (Chat & Users) */}
      <div className="w-full lg:w-80 flex flex-col h-full gap-4">
        {/* Tab Selector */}
        <div className="flex bg-richblack-800 border border-richblack-700 p-1 rounded-xl">
          <button
            onClick={() => setSidebarTab("chat")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              sidebarTab === "chat" ? "bg-richblack-700 text-purple-400" : "text-richblack-400 hover:text-richblack-200"
            }`}
          >
            <FiMessageSquare size={14} /> Chat
          </button>
          <button
            onClick={() => setSidebarTab("users")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              sidebarTab === "users" ? "bg-richblack-700 text-purple-400" : "text-richblack-400 hover:text-richblack-200"
            }`}
          >
            <FiUsers size={14} /> Users
          </button>
        </div>

        {/* Sidebar Component */}
        <div className="flex-1 h-0 min-h-0">
          {sidebarTab === "chat" ? (
            <LiveChat socket={socket} classId={classDetails._id} />
          ) : (
            <AttendeeList socket={socket} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Helper Video Tile Component ──────────────────────────────────────────────
const VideoTile = ({ peer }) => {
  const hmsActions = useHMSActions()
  const videoRef = React.useRef(null)

  useEffect(() => {
    const videoElem = videoRef.current
    if (videoElem && peer.videoTrack) {
      hmsActions.attachVideo(peer.videoTrack, videoElem)
    }
    return () => {
      if (videoElem && peer.videoTrack) {
        hmsActions.detachVideo(peer.videoTrack)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peer.videoTrack])

  return (
    <video
      ref={videoRef}
      autoPlay
      muted={peer.isLocal}
      playsInline
      className="w-full h-full object-contain rounded-xl"
    />
  )
}

// Custom hook to select peers from HMS Store
function usePeers() {
  return useHMSStore(selectPeers)
}

// ── Main Page Component (Outer wrapper) ───────────────────────────────────────
export default function LiveClassRoom() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { token } = useSelector((s) => s.auth)
  const { user } = useSelector((s) => s.profile)

  const [classDetails, setClassDetails] = useState(null)
  const [hmsToken, setHmsToken] = useState(null)
  const [socket, setSocket] = useState(null)
  const [starting, setStarting] = useState(false)

  // 1. Initial Load & Join authorization
  useEffect(() => {
    const initSession = async () => {
      // Connect real-time socket
      const socketClient = io(`${SOCKET_BASE_URL}/live`, {
        transports: ["websocket"],
      })
      setSocket(socketClient)

      // Fetch class details from API
      const details = await joinClass(token, classId)
      if (!details) {
        navigate("/dashboard/enrolled-courses")
        return
      }

      setClassDetails(details)
      setHmsToken(details.hmsToken)

      // Socket Join event
      socketClient.emit("join-room", {
        classId: details.classId,
        userId: user?._id,
        userName: `${user?.firstName} ${user?.lastName}`,
        role: user?.accountType === "Instructor" ? "instructor" : "student",
      })

      // Listen for socket events
      socketClient.on("class-ended", () => {
        toast("The class session has been ended.")
        navigate(user?.accountType === "Instructor" ? "/dashboard/instructor" : "/dashboard/enrolled-courses")
      })
    }

    initSession()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, token])

  // Instructor Action: Trigger LIVE state
  const handleStartStream = async () => {
    setStarting(true)
    const streamDetails = await startClass(token, classId)
    if (streamDetails) {
      setHmsToken(streamDetails.hmsToken)
      setClassDetails((prev) => ({ ...prev, status: "live" }))
    }
    setStarting(false)
  }

  if (!classDetails) {
    return (
      <div className="min-h-screen bg-richblack-900 flex items-center justify-center text-richblack-300">
        <div className="flex flex-col items-center gap-3">
          <FiActivity size={32} className="animate-spin text-purple-400" />
          <p>Connecting to Live Class Room...</p>
        </div>
      </div>
    )
  }

  // Instructor setup state (before clicking "Start Stream")
  if (user?.accountType === "Instructor" && classDetails.status === "scheduled") {
    return (
      <div className="min-h-screen bg-richblack-900 flex items-center justify-center p-4">
        <div className="bg-richblack-800 border border-richblack-700 p-8 rounded-2xl max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
            <FiVideo size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-richblack-5">{classDetails.title}</h2>
            <p className="text-richblack-400 text-xs mt-1.5">
              Ready to go live? Students will be notified when you click start.
            </p>
          </div>
          <button
            onClick={handleStartStream}
            disabled={starting}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            {starting ? "Starting Room..." : "Start Streaming Now"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <HMSRoomProvider>
      <RoomStage classDetails={classDetails} hmsToken={hmsToken} socket={socket} />
    </HMSRoomProvider>
  )
}
