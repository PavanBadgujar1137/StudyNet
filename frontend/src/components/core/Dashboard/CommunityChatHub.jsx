import React, { useState, useEffect, useRef, useCallback } from "react"
import { useSelector } from "react-redux"
import {
  FiGlobe,
  FiUsers,
  FiMessageSquare,
  FiSend,
  FiSearch,
  FiRefreshCw,
  FiPaperclip,
  FiSmile,
  FiX,
  FiStar,
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
import { toast } from "react-hot-toast"

const QUICK_EMOJIS = ["👍", "❤️", "🔥", "🚀", "👏", "💡", "💯", "✨"]

const STARTER_PROMPTS = [
  { icon: "👋", label: "Say Hello", text: "Hello everyone! Happy to connect with the community today." },
  { icon: "❓", label: "Ask a Question", text: "Does anyone have recommendations for setting up a daily study routine?" },
  { icon: "💡", label: "Share an Insight", text: "Just completed a great session! Consistency really makes all the difference." },
]

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

  // Filter messages search term inside chat
  const [msgFilter, setMsgFilter] = useState("")
  const [showMsgSearch, setShowMsgSearch] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const messagesEndRef = useRef(null)

  const isPractitioner =
    user?.accountType === "Practitioner" || user?.accountType === "Instructor"
  const practitionerId = isPractitioner
    ? user?._id
    : defaultPractitionerId || user?.practitionerProfile

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
    loadMessages()
    if (activeTab === "direct") {
      loadContacts()
    }
  }, [loadMessages, loadContacts, activeTab])

  // Periodic auto-refresh every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      loadMessages()
    }, 5000)
    return () => clearInterval(timer)
  }, [loadMessages])

  // Send message submit handler
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault()
    if (!inputText.trim() || sending) return

    const textToSend = inputText.trim()
    setInputText("")
    setSending(true)

    let success = false
    if (activeTab === "global") {
      success = await sendGlobalMessage(token, textToSend)
    } else if (activeTab === "circle") {
      if (practitionerId) {
        success = await sendGroupMessage(token, practitionerId, textToSend)
      }
    } else if (activeTab === "direct") {
      if (selectedContact?._id) {
        success = await sendDirectMessage(token, selectedContact._id, textToSend)
      }
    }

    setSending(false)
    if (success) {
      loadMessages()
    } else {
      toast.error("Message could not be sent")
    }
  }

  // Quick emoji insertion
  const handleQuickEmojiClick = (emoji) => {
    setInputText((prev) => prev + " " + emoji)
  }

  // Filtered contacts list
  const filteredContacts = contacts.filter((c) => {
    const fullName = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase()
    const email = (c.email || "").toLowerCase()
    const term = searchTerm.toLowerCase()
    return fullName.includes(term) || email.includes(term)
  })

  // Filtered messages inside conversation
  const displayedMessages = messages.filter((m) => {
    if (!msgFilter.trim()) return true
    const text = (m.content || "").toLowerCase()
    const sender = `${m.sender?.firstName || ""} ${m.sender?.lastName || ""}`.toLowerCase()
    const query = msgFilter.toLowerCase()
    return text.includes(query) || sender.includes(query)
  })

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 145px)",
        width: "calc(100% + 72px)",
        margin: "-28px -36px -60px -36px",
        background: "#FFFFFF",
        borderRadius: "0px",
        border: "none",
        overflow: "hidden",
      }}
    >
      {/* COMMUNITY HUB SIDEBAR (Placed right next to Main Navigation Sidebar) */}
      <div
        style={{
          width: "270px",
          background: "#F8FAFC",
          borderRight: "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: "16px", borderBottom: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#64748B", letterSpacing: "0.5px" }}>
            Community Channels
          </div>
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: "4px 0 0 0" }}>
            Chat Hub
          </h2>
        </div>

        {/* Channels List */}
        <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "4px", borderBottom: "1px solid #E2E8F0" }}>
          <button
            onClick={() => setActiveTab("global")}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              background: activeTab === "global" ? "#2563EB" : "transparent",
              color: activeTab === "global" ? "#FFFFFF" : "#334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FiGlobe size={15} />
              <span># global-lounge</span>
            </div>
            <span style={{ fontSize: "9px", padding: "2px 5px", borderRadius: "4px", background: activeTab === "global" ? "rgba(255,255,255,0.2)" : "#E2E8F0", color: activeTab === "global" ? "#FFF" : "#64748B" }}>
              Public
            </span>
          </button>

          <button
            onClick={() => setActiveTab("circle")}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              background: activeTab === "circle" ? "#2563EB" : "transparent",
              color: activeTab === "circle" ? "#FFFFFF" : "#334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FiUsers size={15} />
              <span># practitioner-circle</span>
            </div>
            <span style={{ fontSize: "9px", padding: "2px 5px", borderRadius: "4px", background: activeTab === "circle" ? "rgba(255,255,255,0.2)" : "#E2E8F0", color: activeTab === "circle" ? "#FFF" : "#64748B" }}>
              Cohort
            </span>
          </button>

          <button
            onClick={() => setActiveTab("direct")}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              background: activeTab === "direct" ? "#2563EB" : "transparent",
              color: activeTab === "direct" ? "#FFFFFF" : "#334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FiMessageSquare size={15} />
              <span># direct-messages</span>
            </div>
            <span style={{ fontSize: "9px", padding: "2px 5px", borderRadius: "4px", background: activeTab === "direct" ? "rgba(255,255,255,0.2)" : "#E2E8F0", color: activeTab === "direct" ? "#FFF" : "#64748B" }}>
              1-on-1
            </span>
          </button>
        </div>

        {/* Direct Contacts List */}
        <div style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#64748B", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>Direct Contacts</span>
            <span style={{ background: "#DBEAFE", color: "#1D4ED8", padding: "1px 6px", borderRadius: "6px", fontSize: "10px" }}>
              {filteredContacts.length}
            </span>
          </div>

          <div style={{ position: "relative", marginBottom: "8px" }}>
            <FiSearch style={{ position: "absolute", left: "8px", top: "8px", color: "#94A3B8" }} size={12} />
            <input
              type="text"
              placeholder="Search member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                background: "#FFFFFF",
                border: "1px solid #CBD5E1",
                borderRadius: "8px",
                paddingLeft: "28px",
                paddingRight: "8px",
                paddingTop: "6px",
                paddingBottom: "6px",
                fontSize: "12px",
                color: "#0F172A",
                outline: "none",
              }}
            />
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => {
                const isSelected = activeTab === "direct" && selectedContact?._id === contact._id
                const isPract =
                  contact.accountType === "Practitioner" ||
                  contact.accountType === "Instructor"

                return (
                  <div
                    key={contact._id}
                    onClick={() => {
                      setActiveTab("direct")
                      setSelectedContact(contact)
                    }}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: isSelected ? "#EFF6FF" : "transparent",
                      border: isSelected ? "1px solid #93C5FD" : "1px solid transparent",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          background: "#2563EB",
                          color: "#FFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "11px",
                        }}
                      >
                        {contact.image ? (
                          <img
                            src={contact.image}
                            alt={contact.firstName}
                            style={{ width: "100%", height: "100%", borderRadius: "8px", objectFit: "cover" }}
                          />
                        ) : (
                          `${contact.firstName?.slice(0, 1) || "U"}`
                        )}
                      </div>
                      <span style={{ position: "absolute", bottom: "-1px", right: "-1px", width: "7px", height: "7px", background: "#22C55E", border: "1.5px solid #FFF", borderRadius: "50%" }}></span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {contact.firstName} {contact.lastName || ""}
                        </span>
                        {isPract && (
                          <span style={{ fontSize: "8px", background: "#FEF3C7", color: "#92400E", padding: "1px 4px", borderRadius: "4px", fontWeight: 800 }}>
                            GUIDE
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "10px", color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                        {contact.email}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div style={{ padding: "12px", textAlign: "center", fontSize: "11px", color: "#94A3B8" }}>
                No contacts found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT MAIN WORKSPACE (Chat Feed & Input) */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FFFFFF" }}>
        {/* Active Title Header */}
        <div
          style={{
            padding: "12px 18px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#F8FAFC",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A" }}>
              {activeTab === "global" && "# global-lounge"}
              {activeTab === "circle" && "# practitioner-circle"}
              {activeTab === "direct" &&
                (selectedContact
                  ? `Direct: ${selectedContact.firstName} ${selectedContact.lastName || ""}`
                  : "Direct Chat Thread")}
            </span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#15803D", background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "2px 8px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#22C55E" }}></span> Live
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={() => setShowMsgSearch((prev) => !prev)}
              style={{ padding: "6px 12px", background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", color: "#334155", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <FiSearch size={13} /> Filter
            </button>
            <button
              onClick={loadMessages}
              style={{ padding: "6px 12px", background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", color: "#334155", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <FiRefreshCw className={loading ? "animate-spin text-blue-600" : ""} size={13} /> Sync
            </button>
          </div>
        </div>

        {/* Filter Drawer */}
        {showMsgSearch && (
          <div style={{ padding: "8px 16px", background: "#EFF6FF", borderBottom: "1px solid #BFDBFE", display: "flex", alignItems: "center", gap: "8px" }}>
            <FiSearch style={{ color: "#2563EB" }} size={14} />
            <input
              type="text"
              placeholder="Filter messages by text or sender..."
              value={msgFilter}
              onChange={(e) => setMsgFilter(e.target.value)}
              style={{ flex: 1, background: "#FFFFFF", border: "1px solid #93C5FD", borderRadius: "6px", padding: "6px 10px", fontSize: "12px", color: "#0F172A", outline: "none" }}
            />
            {msgFilter && (
              <button onClick={() => setMsgFilter("")} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer" }}>
                <FiX size={14} />
              </button>
            )}
          </div>
        )}

        {/* Messages Stream Scroll Container */}
        <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", background: "#F8FAFC" }}>
          {loading ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#64748B" }}>
              Loading messages...
            </div>
          ) : displayedMessages.length > 0 ? (
            displayedMessages.map((msg) => {
              const isMine =
                String(msg.sender?._id || msg.sender) === String(user?._id)
              const senderName = msg.sender?.firstName
                ? `${msg.sender.firstName} ${msg.sender.lastName || ""}`
                : "Community Member"
              const senderRole = msg.sender?.accountType || "Student"
              const formattedTime = msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""
              const isDoc =
                senderRole === "Practitioner" || senderRole === "Instructor"

              return (
                <div
                  key={msg._id || Math.random()}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "6px",
                          background: isDoc ? "#D97706" : "#2563EB",
                          color: "#FFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "11px",
                        }}
                      >
                        {msg.sender?.image ? (
                          <img src={msg.sender.image} alt={senderName} style={{ width: "100%", height: "100%", borderRadius: "6px", objectFit: "cover" }} />
                        ) : (
                          senderName.slice(0, 1)
                        )}
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F172A" }}>
                        {senderName}
                      </span>
                      {isDoc ? (
                        <span style={{ fontSize: "9px", fontWeight: 800, background: "#FEF3C7", color: "#92400E", padding: "1px 6px", borderRadius: "4px" }}>
                          Practitioner
                        </span>
                      ) : (
                        <span style={{ fontSize: "9px", fontWeight: 700, background: "#EFF6FF", color: "#1D4ED8", padding: "1px 6px", borderRadius: "4px" }}>
                          {senderRole}
                        </span>
                      )}
                      {isMine && (
                        <span style={{ fontSize: "8px", fontWeight: 800, background: "#F1F5F9", color: "#475569", padding: "1px 4px", borderRadius: "4px" }}>
                          YOU
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "10px", color: "#94A3B8", fontFamily: "monospace" }}>
                      {formattedTime}
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#1E293B", lineHeight: 1.4, paddingLeft: "30px" }}>
                    {msg.content}
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <FiStar size={24} />
              </div>
              <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", marginBottom: "4px" }}>
                Welcome to #{activeTab === "global" ? "global-lounge" : activeTab === "circle" ? "practitioner-circle" : "direct-messages"}
              </h4>
              <p style={{ fontSize: "12px", color: "#64748B", maxWidth: "360px", lineHeight: 1.4, marginBottom: "16px" }}>
                No messages posted yet. Tap a prompt below to start the conversation!
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px", width: "100%", maxWidth: "420px" }}>
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputText(prompt.text)}
                    style={{ padding: "10px", background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "10px", textAlign: "left", cursor: "pointer" }}
                  >
                    <div style={{ fontSize: "16px", marginBottom: "2px" }}>{prompt.icon}</div>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#0F172A" }}>{prompt.label}</div>
                    <div style={{ fontSize: "9px", color: "#64748B" }}>Tap to insert</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Composition Dock */}
        <div style={{ position: "relative", padding: "12px 16px", background: "#FFFFFF", borderTop: "1px solid #E2E8F0" }}>
          {/* Popover Emoji Picker Grid */}
          {showEmojiPicker && (
            <div
              style={{
                position: "absolute",
                bottom: "56px",
                left: "48px",
                background: "#FFFFFF",
                border: "1px solid #CBD5E1",
                borderRadius: "12px",
                padding: "10px",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "6px",
                zIndex: 50,
                width: "180px",
              }}
            >
              {QUICK_EMOJIS.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleQuickEmojiClick(emoji)
                    setShowEmojiPicker(false)
                  }}
                  style={{
                    padding: "6px",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => toast("Attachments coming soon!", { icon: "📎" })}
              style={{ padding: "8px 12px", background: "#F1F5F9", border: "1px solid #CBD5E1", borderRadius: "8px", color: "#475569", cursor: "pointer" }}
              title="Attach file"
            >
              <FiPaperclip size={15} />
            </button>

            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              style={{
                padding: "8px 12px",
                background: showEmojiPicker ? "#EFF6FF" : "#F1F5F9",
                border: showEmojiPicker ? "1px solid #93C5FD" : "1px solid #CBD5E1",
                borderRadius: "8px",
                color: showEmojiPicker ? "#2563EB" : "#475569",
                cursor: "pointer",
              }}
              title="Add Emoji"
            >
              <FiSmile size={15} />
            </button>

            <input
              type="text"
              placeholder={
                activeTab === "global"
                  ? "Message #global-lounge..."
                  : activeTab === "circle"
                  ? "Message #practitioner-circle..."
                  : selectedContact
                  ? `Message ${selectedContact.firstName}...`
                  : "Select a contact..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={activeTab === "direct" && !selectedContact}
              style={{ flex: 1, background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#0F172A", outline: "none" }}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || sending || (activeTab === "direct" && !selectedContact)}
              style={{
                padding: "8px 18px",
                background: "linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "13px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                opacity: !inputText.trim() || sending || (activeTab === "direct" && !selectedContact) ? 0.5 : 1,
              }}
            >
              <span>Send</span>
              <FiSend size={13} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
