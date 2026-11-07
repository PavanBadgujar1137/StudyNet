import React, { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { FiSend, FiMessageSquare } from "react-icons/fi"
import { BsHandIndexThumb } from "react-icons/bs"

const ROLE_COLORS = {
  instructor: "text-purple-400",
  student: "text-blue-400",
  ta: "text-green-400",
}

const ROLE_LABELS = {
  instructor: "Instructor",
  student: "",
  ta: "TA",
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🔥", "👏", "🤔"]

/**
 * Real-time live class chat panel driven by Socket.io events.
 * @param {object} socket - Socket.io socket connected to /live namespace
 * @param {string} classId
 * @param {boolean} chatEnabled
 */
const LiveChat = ({ socket, classId, chatEnabled = true }) => {
  const { user } = useSelector((s) => s.profile)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [handRaised, setHandRaised] = useState(false)
  const bottomRef = useRef(null)

  const myRole =
    user?.accountType === "Instructor" ? "instructor" : "student"

  useEffect(() => {
    if (!socket) return

    const handleMessage = (msg) => {
      setMessages((prev) => [...prev.slice(-199), msg])
    }

    const handleHandRaised = ({ userId, userName }) => {
      setMessages((prev) => [
        ...prev.slice(-199),
        {
          type: "system",
          message: `✋ ${userName} raised their hand`,
          timestamp: new Date().toISOString(),
        },
      ])
    }

    socket.on("chat-message", handleMessage)
    socket.on("hand-raised", handleHandRaised)

    return () => {
      socket.off("chat-message", handleMessage)
      socket.off("hand-raised", handleHandRaised)
    }
  }, [socket])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = (text) => {
    const trimmed = (text || input).trim()
    if (!trimmed || !socket || !chatEnabled) return

    socket.emit("chat-message", {
      classId,
      userId: user?._id,
      userName: `${user?.firstName} ${user?.lastName}`,
      message: trimmed,
      role: myRole,
    })
    setInput("")
  }

  const toggleHand = () => {
    if (!socket) return
    if (handRaised) {
      socket.emit("lower-hand", { classId, userId: user?._id })
      setHandRaised(false)
    } else {
      socket.emit("raise-hand", {
        classId,
        userId: user?._id,
        userName: `${user?.firstName} ${user?.lastName}`,
      })
      setHandRaised(true)
    }
  }

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    } catch {
      return ""
    }
  }

  return (
    <div className="flex flex-col h-full bg-richblack-800 border border-richblack-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-richblack-700 bg-richblack-800">
        <FiMessageSquare className="text-purple-400" size={16} />
        <span className="text-richblack-100 font-semibold text-sm">Live Chat</span>
        {!chatEnabled && (
          <span className="ml-auto text-xs text-richblack-500">Chat disabled</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-track-richblack-800 scrollbar-thumb-richblack-600">
        {messages.length === 0 && (
          <div className="text-center text-richblack-500 text-xs py-8">
            Chat messages will appear here
          </div>
        )}
        {messages.map((msg, idx) => {
          if (msg.type === "system") {
            return (
              <div key={idx} className="text-center text-richblack-400 text-xs py-1">
                {msg.message}
              </div>
            )
          }
          const isMe = msg.userId === user?._id
          return (
            <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              {!isMe && (
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[11px] font-semibold ${ROLE_COLORS[msg.role] || "text-richblack-300"}`}>
                    {msg.userName}
                    {ROLE_LABELS[msg.role] && (
                      <span className="ml-1 px-1 py-0.5 bg-purple-500/20 rounded text-[9px] font-bold">
                        {ROLE_LABELS[msg.role]}
                      </span>
                    )}
                  </span>
                </div>
              )}
              <div className={`max-w-[85%] px-3 py-1.5 rounded-xl text-sm ${
                isMe
                  ? "bg-purple-600 text-white rounded-tr-sm"
                  : "bg-richblack-700 text-richblack-100 rounded-tl-sm"
              }`}>
                {msg.message}
              </div>
              <span className="text-[10px] text-richblack-500 mt-0.5">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Quick emojis */}
      <div className="flex items-center gap-1 px-3 pt-2 border-t border-richblack-700">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => sendMessage(emoji)}
            disabled={!chatEnabled}
            className="text-lg hover:scale-125 transition-transform disabled:opacity-40"
          >
            {emoji}
          </button>
        ))}
        {/* Raise hand — only for students */}
        {myRole === "student" && (
          <button
            onClick={toggleHand}
            className={`ml-auto p-1.5 rounded-lg transition-all ${
              handRaised
                ? "bg-yellow-500/20 text-yellow-400"
                : "text-richblack-400 hover:text-richblack-200"
            }`}
            title={handRaised ? "Lower hand" : "Raise hand"}
          >
            <BsHandIndexThumb size={16} />
          </button>
        )}
      </div>

      {/* Input */}
      {chatEnabled ? (
        <div className="flex items-center gap-2 p-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1 bg-richblack-700 border border-richblack-600 rounded-xl px-3 py-2 text-richblack-5 text-sm focus:outline-none focus:border-purple-500 placeholder:text-richblack-500"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white transition-all"
          >
            <FiSend size={16} />
          </button>
        </div>
      ) : (
        <div className="p-3 text-center text-richblack-500 text-xs">
          Chat has been disabled for this class
        </div>
      )}
    </div>
  )
}

export default LiveChat
