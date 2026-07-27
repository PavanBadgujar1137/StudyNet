import React, { useState, useEffect, useRef, useCallback } from "react"
import { useSelector } from "react-redux"
import {
  FiGlobe,
  FiUsers,
  FiMessageSquare,
  FiSend,
  FiSearch,
  FiUser,
  FiShield,
  FiSmile,
  FiRefreshCw,
  FiCheckCheck
} from "react-icons/fi"
import {
  fetchGlobalMessages,
  sendGlobalMessage,
  fetchGroupMessages,
  sendGroupMessage,
  fetchDirectMessages,
  sendDirectMessage,
  fetchChatContacts,
} from "../../../services/operations/chatAPI"

export default function CommunityChatHub({ defaultPractitionerId = null }) {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const [activeTab, setActiveTab] = useState("global") // "global" | "circle" | "direct"
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Direct contacts list & selected contact
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  const messagesEndRef = useRef(null)

  const isPractitioner = user?.accountType === "Practitioner" || user?.accountType === "Instructor"
  const practitionerId = isPractitioner ? user?._id : defaultPractitionerId || user?.practitionerProfile

  // Auto-scroll to bottom of message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat contacts for direct messaging
  const loadContacts = useCallback(async () => {
    if (!token) return
    const contactList = await fetchChatContacts(token)
    setContacts(contactList)
    if (contactList.length > 0 && !selectedContact) {
      setSelectedContact(contactList[0])
    }
  }, [token, selectedContact])

  // Load message timeline depending on active tab
  const loadMessages = useCallback(async () => {
    if (!token) return

    if (activeTab === "global") {
      const data = await fetchGlobalMessages(token)
      setMessages(data)
    } else if (activeTab === "circle") {
      if (practitionerId) {
        const data = await fetchGroupMessages(token, practitionerId)
        setMessages(data)
      } else {
        setMessages([])
      }
    } else if (activeTab === "direct") {
      if (selectedContact?._id) {
        const data = await fetchDirectMessages(token, selectedContact._id)
        setMessages(data)
      } else {
        setMessages([])
      }
    }
    setLoading(false)
  }, [token, activeTab, practitionerId, selectedContact])

  useEffect(() => {
    setLoading(true)
    loadMessages()
    if (activeTab === "direct") {
      loadContacts()
    }
  }, [activeTab, selectedContact?._id])

  // Polling interval to fetch new messages automatically
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages()
    }, 4000)
    return () => clearInterval(interval)
  }, [loadMessages])

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputText.trim() || sending) return

    const textToSend = inputText.trim()
    setInputText("")
    setSending(true)

    let newMsg = null

    if (activeTab === "global") {
      newMsg = await sendGlobalMessage(token, textToSend)
    } else if (activeTab === "circle") {
      if (practitionerId) {
        newMsg = await sendGroupMessage(token, practitionerId, textToSend)
      }
    } else if (activeTab === "direct") {
      if (selectedContact?._id) {
        newMsg = await sendDirectMessage(token, selectedContact._id, textToSend)
      }
    }

    if (newMsg) {
      setMessages((prev) => [...prev, newMsg])
    }
    setSending(false)
  }

  const filteredContacts = contacts.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName || ""}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase()) || c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="w-full space-y-6">
      {/* Top Header Card */}
      <div className="bg-richblack-800/90 border border-richblack-700/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
                <FiGlobe size={12} /> Community Hub
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live Sync
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-richblack-5 tracking-tight">
              Community &amp; Messaging Center
            </h1>
            <p className="text-richblack-300 text-xs md:text-sm mt-1">
              Connect globally with peers, engage with your practitioner circle, or start private 1-on-1 conversations.
            </p>
          </div>

          {/* Refresh Action */}
          <button
            onClick={loadMessages}
            className="flex items-center gap-2 px-4 py-2 bg-richblack-700/80 hover:bg-richblack-700 border border-richblack-600 text-richblack-200 text-xs font-semibold rounded-xl transition-all"
            title="Refresh messages"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} size={14} />
            <span>Refresh</span>
          </button>
        </div>

        {/* 3 Main Section Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-richblack-700/60">
          <button
            onClick={() => setActiveTab("global")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === "global"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                : "bg-richblack-900/60 hover:bg-richblack-700/60 text-richblack-300 border border-richblack-700"
            }`}
          >
            <FiGlobe size={16} />
            <span>1. Global Community Chat</span>
          </button>

          <button
            onClick={() => setActiveTab("circle")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === "circle"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                : "bg-richblack-900/60 hover:bg-richblack-700/60 text-richblack-300 border border-richblack-700"
            }`}
          >
            <FiUsers size={16} />
            <span>2. Practitioner Circle Group</span>
          </button>

          <button
            onClick={() => setActiveTab("direct")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === "direct"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                : "bg-richblack-900/60 hover:bg-richblack-700/60 text-richblack-300 border border-richblack-700"
            }`}
          >
            <FiMessageSquare size={16} />
            <span>3. 1-on-1 Direct Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar (Only visible in Direct Chat mode) */}
        {activeTab === "direct" && (
          <div className="lg:col-span-1 bg-richblack-800/90 border border-richblack-700 rounded-3xl p-4 shadow-xl space-y-4 flex flex-col max-h-[600px]">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-richblack-5 flex items-center gap-2">
                <FiUsers className="text-purple-400" /> Contacts List
              </h3>
              
              {/* Search contacts */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-richblack-400" size={14} />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-richblack-900 border border-richblack-700 rounded-xl pl-9 pr-3 py-2 text-xs text-richblack-100 placeholder-richblack-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Contact Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => {
                  const isSelected = selectedContact?._id === contact._id
                  const isPract = contact.accountType === "Practitioner" || contact.accountType === "Instructor"
                  return (
                    <div
                      key={contact._id}
                      onClick={() => setSelectedContact(contact)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${
                        isSelected
                          ? "bg-purple-600/20 border-purple-500/50 shadow-md"
                          : "bg-richblack-900/60 border-richblack-700/50 hover:bg-richblack-700/50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {contact.image ? (
                          <img src={contact.image} alt={contact.firstName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          `${contact.firstName?.slice(0, 1) || "U"}${contact.lastName?.slice(0, 1) || ""}`
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-richblack-5 truncate">
                            {contact.firstName} {contact.lastName || ""}
                          </h4>
                          {isPract && (
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-medium">
                              Doctor
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-richblack-400 truncate mt-0.5">
                          {contact.email}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-4 text-center text-xs text-richblack-400">
                  No contacts found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Timeline & Input Container */}
        <div className={`${activeTab === "direct" ? "lg:col-span-3" : "lg:col-span-4"} bg-richblack-800/90 border border-richblack-700 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[600px]`}>
          
          {/* Channel Header Banner */}
          <div className="p-4 bg-richblack-900/90 border-b border-richblack-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                {activeTab === "global" && <FiGlobe size={18} />}
                {activeTab === "circle" && <FiUsers size={18} />}
                {activeTab === "direct" && <FiMessageSquare size={18} />}
              </div>

              <div>
                <h3 className="text-sm font-bold text-richblack-5">
                  {activeTab === "global" && "Global Platform Chat Room"}
                  {activeTab === "circle" && "Practitioner Circle Group Chat"}
                  {activeTab === "direct" && (selectedContact ? `Direct Chat with ${selectedContact.firstName} ${selectedContact.lastName || ""}` : "1-on-1 Private Messaging")}
                </h3>
                <p className="text-[11px] text-richblack-400">
                  {activeTab === "global" && "Public space visible to all students and practitioners"}
                  {activeTab === "circle" && "Private group channel for practitioner and enrolled clients"}
                  {activeTab === "direct" && "End-to-end encrypted direct messaging channel"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-emerald-400 font-semibold hidden sm:inline">Active Channel</span>
            </div>
          </div>

          {/* Messages Feed Body */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-radial from-richblack-900 to-richblack-950">
            {loading ? (
              <div className="h-full flex items-center justify-center text-richblack-400 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading message thread...</span>
                </div>
              </div>
            ) : messages.length > 0 ? (
              messages.map((msg) => {
                const isMine = String(msg.sender?._id || msg.sender) === String(user?._id)
                const senderName = msg.sender?.firstName
                  ? `${msg.sender.firstName} ${msg.sender.lastName || ""}`
                  : "User"
                const senderRole = msg.sender?.accountType || "Member"
                const formattedTime = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""

                return (
                  <div
                    key={msg._id || Math.random()}
                    className={`flex items-start gap-3 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {msg.sender?.image ? (
                        <img src={msg.sender.image} alt={senderName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        senderName.slice(0, 1)
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`max-w-[80%] sm:max-w-[70%] space-y-1 ${isMine ? "items-end text-right" : "items-start text-left"}`}>
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[11px] font-semibold text-richblack-300">{senderName}</span>
                        {senderRole === "Practitioner" || senderRole === "Instructor" ? (
                          <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-semibold">
                            Doctor
                          </span>
                        ) : (
                          <span className="text-[9px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-1.5 py-0.2 rounded font-medium">
                            {senderRole}
                          </span>
                        )}
                        <span className="text-[10px] text-richblack-500">{formattedTime}</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-md ${
                          isMine
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-none"
                            : "bg-richblack-700/90 border border-richblack-600 text-richblack-100 rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-richblack-400 p-8 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-richblack-800 border border-richblack-700 flex items-center justify-center text-purple-400">
                  <FiSmile size={28} />
                </div>
                <h4 className="text-sm font-bold text-richblack-200">No Messages Yet</h4>
                <p className="text-xs text-richblack-400 max-w-sm">
                  Be the first to start the conversation in this room! Type a message below to post.
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-richblack-900/90 border-t border-richblack-700 flex items-center gap-3">
            <input
              type="text"
              placeholder={
                activeTab === "global"
                  ? "Broadcast a message to the Global Community..."
                  : activeTab === "circle"
                  ? "Post a message to your Practitioner Circle..."
                  : selectedContact
                  ? `Message ${selectedContact.firstName}...`
                  : "Select a contact to message..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={activeTab === "direct" && !selectedContact}
              className="flex-1 bg-richblack-800 border border-richblack-700 rounded-xl px-4 py-3 text-xs md:text-sm text-richblack-100 placeholder-richblack-400 focus:outline-none focus:border-purple-500 transition-all disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || sending || (activeTab === "direct" && !selectedContact)}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs md:text-sm rounded-xl shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <span>Send</span>
              <FiSend size={14} />
            </button>
          </form>

        </div>

      </div>
    </div>
  )
}
