import React, { useState, useEffect, useRef, useCallback } from "react"
import { useSelector } from "react-redux"
import {
  FiGlobe,
  FiUsers,
  FiMessageSquare,
  FiSend,
  FiSearch,
  FiRefreshCw,
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
import { apiConnector } from "../../../services/apiConnector"
import { toast } from "react-hot-toast"



export default function CommunityChatHub({ defaultPractitionerId = null }) {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const [activeTab, setActiveTab] = useState("global") // "global" | "circle" | "direct"
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState("")
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [msgFilter, setMsgFilter] = useState("")

  // Direct contacts list & selected contact
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Dynamic Practitioner Circles List & Selected Circle
  const [userCircles, setUserCircles] = useState([])
  const [selectedCircle, setSelectedCircle] = useState(null)

  const messagesEndRef = useRef(null)

  const isPractitioner =
    user?.accountType === "Practitioner" || user?.accountType === "Instructor"

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
    setContacts(contactList || [])
    if (contactList?.length > 0 && !selectedContact) {
      setSelectedContact(contactList[0])
    }
  }, [token, selectedContact])

  // Load User Circles (For Practitioner: circles created by them; For Client: circles joined by them)
  const loadUserCircles = useCallback(async () => {
    try {
      const res = await apiConnector("GET", "/api/v1/circle/all")
      if (res?.data?.success) {
        const allCircles = res.data.circles || []
        let filtered = []

        if (isPractitioner) {
          filtered = allCircles.filter(
            (c) =>
              String(c.practitioner?._id || c.practitioner) === String(user?._id)
          )
        } else {
          filtered = allCircles.filter((c) =>
            (c.members || []).some(
              (m) => String(m._id || m) === String(user?._id)
            )
          )
        }

        setUserCircles(filtered)
        if (filtered.length > 0 && !selectedCircle) {
          setSelectedCircle(filtered[0])
        }
      }
    } catch (err) {
      console.error("Error loading user circles in chat:", err)
    }
  }, [isPractitioner, user?._id, selectedCircle])

  // Load message timeline depending on active tab
  const loadMessages = useCallback(async () => {
    if (!token) return

    if (activeTab === "global") {
      const data = await fetchGlobalMessages(token)
      setMessages(data || [])
    } else if (activeTab === "circle") {
      const circleId = selectedCircle?._id || userCircles[0]?._id
      if (circleId) {
        const data = await fetchGroupMessages(token, circleId)
        setMessages(data || [])
      } else {
        setMessages([])
      }
    } else if (activeTab === "direct") {
      if (selectedContact?._id) {
        const data = await fetchDirectMessages(token, selectedContact._id)
        setMessages(data || [])
      } else {
        setMessages([])
      }
    }
    setLoading(false)
  }, [token, activeTab, selectedCircle, userCircles, selectedContact])

  useEffect(() => {
    loadUserCircles()
  }, [loadUserCircles])

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
      const circleId = selectedCircle?._id || userCircles[0]?._id
      if (circleId) {
        success = await sendGroupMessage(token, circleId, textToSend)
      } else {
        toast.error("Please join or select a Circle first!")
      }
    } else if (activeTab === "direct") {
      if (selectedContact?._id) {
        success = await sendDirectMessage(token, selectedContact._id, textToSend)
      } else {
        toast.error("Please select a contact for direct messaging!")
      }
    }

    setSending(false)
    if (success) {
      loadMessages()
    } else {
      toast.error("Message could not be sent")
    }
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
      {/* COMMUNITY HUB SIDEBAR */}
      <div
        style={{
          width: "280px",
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

        {/* Primary Channels Tabs */}
        <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "4px", borderBottom: "1px solid #E2E8F0" }}>
          {/* # global-lounge */}
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

          {/* # practitioner-circle */}
          <button
            onClick={() => {
              setActiveTab("circle")
              loadUserCircles()
            }}
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
              {userCircles.length} Circle(s)
            </span>
          </button>

          {/* # direct-messages */}
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

        {/* Dynamic Sidebar Sub-list (Circles or Direct Contacts) */}
        <div style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", minHeight: 0 }}>
          {activeTab === "circle" ? (
            /* Practitioners / Joined Circles Sub-List */
            <>
              <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#64748B", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>{isPractitioner ? "Your Created Circles" : "Your Joined Circles"}</span>
                <span style={{ background: "#DBEAFE", color: "#1D4ED8", padding: "1px 6px", borderRadius: "6px", fontSize: "10px" }}>
                  {userCircles.length}
                </span>
              </div>

              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
                {userCircles.length > 0 ? (
                  userCircles.map((circle) => {
                    const isSelected = selectedCircle?._id === circle._id
                    return (
                      <div
                        key={circle._id}
                        onClick={() => setSelectedCircle(circle)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          background: isSelected ? "#EFF6FF" : "#FFFFFF",
                          border: isSelected ? "1px solid #93C5FD" : "1px solid #E2E8F0",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)",
                            color: "#FFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "12px",
                          }}
                        >
                          👥
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {circle.name}
                          </div>
                          <div style={{ fontSize: "10.5px", color: "#64748B" }}>
                            {circle.seatsFilledCount || circle.members?.length || 1} members
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div style={{ padding: "16px", textTransform: "none", fontSize: "12px", color: "#64748B", textAlign: "center", background: "#FFFFFF", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                    {isPractitioner
                      ? "No circles created yet. Click 'Open a new circle' in Circles section to start!"
                      : "You haven't joined any circles yet. Click 'Join this Circle' on the My Circle tab!"}
                  </div>
                )}
              </div>
            </>
          ) : activeTab === "direct" ? (
            /* Direct Messaging Contacts List */
            <>
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
                    const isSelected = selectedContact?._id === contact._id
                    const isPract =
                      contact.accountType === "Practitioner" ||
                      contact.accountType === "Instructor"

                    return (
                      <div
                        key={contact._id}
                        onClick={() => setSelectedContact(contact)}
                        style={{
                          padding: "8px 10px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          background: isSelected ? "#EFF6FF" : "#FFFFFF",
                          border: isSelected ? "1px solid #93C5FD" : "1px solid #E2E8F0",
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
                          <div style={{ fontSize: "10.5px", color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {contact.email}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div style={{ padding: "16px", fontSize: "12px", color: "#64748B", textAlign: "center" }}>
                    No contacts found.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Global Lounge Overview */
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textTransform: "none", color: "#64748B", fontSize: "12px", textAlign: "center", padding: "12px" }}>
              <FiGlobe size={24} style={{ color: "#2563EB", marginBottom: "8px" }} />
              <p style={{ margin: 0, fontWeight: 600 }}>Public Global Lounge</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#94A3B8" }}>Open community space for all clients &amp; practitioners.</p>
            </div>
          )}
        </div>
      </div>

      {/* CHAT MAIN CONVERSATION PANEL */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FFFFFF" }}>
        {/* Chat Top Bar */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: "6px" }}>
              {activeTab === "global" && <>🌐 # global-lounge</>}
              {activeTab === "circle" && (
                <>👥 {selectedCircle ? selectedCircle.name : "Practitioner Circle"}</>
              )}
              {activeTab === "direct" && (
                <>💬 1:1 Direct Chat: {selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName || ""}` : "Select Contact"}</>
              )}
            </h3>
            <span style={{ fontSize: "11.5px", color: "#64748B" }}>
              {activeTab === "global" && "Open community lounge for all registered clients and verified practitioners."}
              {activeTab === "circle" && (selectedCircle?.topic || "Confidential group chat for Circle members.")}
              {activeTab === "direct" && (selectedContact?.email || "1-on-1 private messaging channel.")}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={loadMessages}
              style={{ background: "#F1F5F9", border: "none", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", color: "#475569", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}
            >
              <FiRefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {/* Messages List Area */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto", background: "#F8FAFC", display: "flex", flexDirection: "column", gap: "12px" }}>
          {displayedMessages.length > 0 ? (
            displayedMessages.map((msg, index) => {
              const isMine = String(msg.sender?._id || msg.sender) === String(user?._id)
              const senderName = msg.sender?.firstName
                ? `${msg.sender.firstName} ${msg.sender.lastName || ""}`
                : "Member"
              const isPract =
                msg.sender?.accountType === "Practitioner" ||
                msg.sender?.accountType === "Instructor"

              return (
                <div
                  key={msg._id || index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMine ? "flex-end" : "flex-start",
                  }}
                >
                  <div style={{ fontSize: "11px", color: "#64748B", marginBottom: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontWeight: 700, color: "#334155" }}>{senderName}</span>
                    {isPract && (
                      <span style={{ fontSize: "8px", background: "#FEF3C7", color: "#92400E", padding: "1px 4px", borderRadius: "4px", fontWeight: 800 }}>
                        PRACTITIONER
                      </span>
                    )}
                    <span>• {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>

                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "10px 14px",
                      borderRadius: isMine ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      background: isMine ? "linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)" : "#FFFFFF",
                      color: isMine ? "#FFFFFF" : "#0F172A",
                      fontSize: "13.5px",
                      lineHeight: 1.45,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      border: isMine ? "none" : "1px solid #E2E8F0",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748B", fontSize: "13px" }}>
              <FiMessageSquare size={32} style={{ color: "#CBD5E1", marginBottom: "8px" }} />
              <p style={{ margin: 0, fontWeight: 700 }}>No messages in this chat yet.</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>Be the first to say hello!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={handleSendMessage}
          style={{ padding: "14px 20px", borderTop: "1px solid #E2E8F0", background: "#FFFFFF", display: "flex", gap: "10px", alignItems: "center" }}
        >
          <input
            type="text"
            placeholder={
              activeTab === "global"
                ? "Send a message to global lounge..."
                : activeTab === "circle"
                ? `Message ${selectedCircle?.name || "this Circle"}...`
                : `Message ${selectedContact ? selectedContact.firstName : "contact"}...`
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px solid #CBD5E1",
              fontSize: "14px",
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            style={{
              padding: "12px 22px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: sending || !inputText.trim() ? 0.6 : 1,
            }}
          >
            <FiSend size={15} /> {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  )
}
