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
  FiImage,
  FiX,
  FiDownload,
  FiFileText,
  FiFilm,
  FiMusic,
  FiMaximize2,
  FiArchive,
} from "react-icons/fi"
import {
  fetchGlobalMessages,
  sendGlobalMessage,
  fetchGroupMessages,
  sendGroupMessage,
  fetchDirectMessages,
  sendDirectMessage,
  fetchChatContacts,
  presignChatMedia,
} from "../../../services/operations/chatAPI"
import { apiConnector } from "../../../services/apiConnector"
import { toast } from "react-hot-toast"
import { mediaUrl } from "../../../utils/mediaUrl"
import { formatFileSize, processImageForUpload } from "../../../utils/imageProcessing"

// Helper to determine media classification
const getFileCategory = (mimetype = "", filename = "") => {
  const mime = (mimetype || "").toLowerCase()
  const name = (filename || "").toLowerCase()

  if (mime.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|svg|bmp|heic|heif)$/i.test(name)) {
    return "image"
  }
  if (mime.startsWith("video/") || /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(name)) {
    return "video"
  }
  if (mime.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(name)) {
    return "audio"
  }
  if (/\.(zip|rar|7z|tar|gz)$/i.test(name) || mime.includes("zip") || mime.includes("compressed")) {
    return "archive"
  }
  if (/\.(pdf)$/i.test(name) || mime.includes("pdf")) {
    return "pdf"
  }
  return "document"
}

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

  // Media Staging & Upload State
  const [stagedFiles, setStagedFiles] = useState([]) // [{ id, file, name, size, type, category, previewUrl }]
  const [uploadProgress, setUploadProgress] = useState({}) // { [fileId]: percent }
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // Lightbox Preview Modal State
  const [lightboxMedia, setLightboxMedia] = useState(null) // { url, name, category }

  // Direct contacts list & selected contact
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Dynamic Practitioner Circles List & Selected Circle
  const [userCircles, setUserCircles] = useState([])
  const [selectedCircle, setSelectedCircle] = useState(null)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)

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

  // Handle stage selected files
  const handleStageFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return

    const maxSizeBytes = 3 * 1024 * 1024 * 1024 // 3 GB
    const newItems = []

    Array.from(fileList).forEach((file) => {
      if (file.size > maxSizeBytes) {
        toast.error(`"${file.name}" exceeds the 3 GB upload limit!`)
        return
      }

      const category = getFileCategory(file.type, file.name)
      let previewUrl = null
      if (category === "image" || category === "video") {
        try {
          previewUrl = URL.createObjectURL(file)
        } catch {
          previewUrl = null
        }
      }

      newItems.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        category,
        previewUrl,
      })
    })

    if (newItems.length > 0) {
      setStagedFiles((prev) => [...prev, ...newItems])
    }
  }

  const removeStagedFile = (id) => {
    setStagedFiles((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return prev.filter((item) => item.id !== id)
    })
    setUploadProgress((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  // Direct S3 Upload with XHR Progress
  const uploadStagedFileToS3 = async (item) => {
    let uploadableFile = item.file

    // Process image for cross-platform Apple/HEIC compatibility
    if (item.category === "image") {
      uploadableFile = await processImageForUpload(item.file)
    }

    const presignData = await presignChatMedia(token, {
      fileName: uploadableFile.name,
      fileType: uploadableFile.type || "application/octet-stream",
      fileSize: uploadableFile.size,
    })

    if (!presignData?.uploadUrl) {
      throw new Error(`Failed to get presigned upload URL for ${item.name}`)
    }

    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("PUT", presignData.uploadUrl, true)
      xhr.setRequestHeader("Content-Type", uploadableFile.type || "application/octet-stream")

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          setUploadProgress((prev) => ({ ...prev, [item.id]: percent }))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`S3 upload error ${xhr.status}`))
        }
      }

      xhr.onerror = () => reject(new Error(`Network error while uploading ${item.name}`))
      xhr.send(uploadableFile)
    })

    return {
      name: uploadableFile.name,
      url: presignData.fileUrl,
      s3Key: presignData.s3Key,
      fileType: presignData.fileType || uploadableFile.type,
      mimetype: presignData.fileType || uploadableFile.type,
      size: uploadableFile.size,
      uploadedAt: new Date(),
    }
  }

  // Send message submit handler (supports text + media up to 3 GB)
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault()
    if ((!inputText.trim() && stagedFiles.length === 0) || sending || isUploadingMedia) return

    const textToSend = inputText.trim()
    setSending(true)

    let uploadedAttachments = []

    if (stagedFiles.length > 0) {
      setIsUploadingMedia(true)
      try {
        const uploadPromises = stagedFiles.map((item) => uploadStagedFileToS3(item))
        uploadedAttachments = await Promise.all(uploadPromises)
      } catch (uploadErr) {
        console.error("Attachment upload failed:", uploadErr)
        toast.error("Failed to upload attached files. Please check network connection.")
        setIsUploadingMedia(false)
        setSending(false)
        return
      }
      setIsUploadingMedia(false)
    }

    let success = false
    if (activeTab === "global") {
      success = await sendGlobalMessage(token, textToSend, uploadedAttachments)
    } else if (activeTab === "circle") {
      const circleId = selectedCircle?._id || userCircles[0]?._id
      if (circleId) {
        success = await sendGroupMessage(token, circleId, textToSend, uploadedAttachments)
      } else {
        toast.error("Please join or select a Circle first!")
      }
    } else if (activeTab === "direct") {
      if (selectedContact?._id) {
        success = await sendDirectMessage(token, selectedContact._id, textToSend, uploadedAttachments)
      } else {
        toast.error("Please select a contact for direct messaging!")
      }
    }

    setSending(false)
    if (success) {
      setInputText("")
      // Clean up staging
      stagedFiles.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
      })
      setStagedFiles([])
      setUploadProgress({})
      loadMessages()
    } else {
      toast.error("Message could not be sent")
    }
  }

  // Drag and Drop handlers for entire chat zone
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleStageFiles(e.dataTransfer.files)
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
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        display: "flex",
        height: "calc(100vh - 145px)",
        width: "calc(100% + 72px)",
        margin: "-28px -36px -60px -36px",
        background: "#FFFFFF",
        borderRadius: "0px",
        border: "none",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* DRAG OVERLAY */}
      {isDraggingOver && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(37, 99, 235, 0.92)",
            color: "#FFFFFF",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            backdropFilter: "blur(4px)",
            pointerEvents: "none",
          }}
        >
          <FiPaperclip size={48} className="animate-bounce" />
          <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>Drop files here to share in chat</h2>
          <p style={{ fontSize: "14px", opacity: 0.9, margin: 0 }}>
            Supports high-resolution images, 4K videos, audio notes, and files up to 3 GB
          </p>
        </div>
      )}

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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FFFFFF", position: "relative" }}>
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
        <div style={{ flex: 1, padding: "20px", overflowY: "auto", background: "#F8FAFC", display: "flex", flexDirection: "column", gap: "14px" }}>
          {displayedMessages.length > 0 ? (
            displayedMessages.map((msg, index) => {
              const isMine = String(msg.sender?._id || msg.sender) === String(user?._id)
              const senderName = msg.sender?.firstName
                ? `${msg.sender.firstName} ${msg.sender.lastName || ""}`
                : "Member"
              const isPract =
                msg.sender?.accountType === "Practitioner" ||
                msg.sender?.accountType === "Instructor"

              const hasAttachments = Array.isArray(msg.attachments) && msg.attachments.length > 0

              return (
                <div
                  key={msg._id || index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMine ? "flex-end" : "flex-start",
                  }}
                >
                  <div style={{ fontSize: "11px", color: "#64748B", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
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
                      maxWidth: "75%",
                      padding: "10px 12px",
                      borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: isMine ? "linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)" : "#FFFFFF",
                      color: isMine ? "#FFFFFF" : "#0F172A",
                      fontSize: "13.5px",
                      lineHeight: 1.45,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                      border: isMine ? "none" : "1px solid #E2E8F0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {/* Render Rich Attachments */}
                    {hasAttachments && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {msg.attachments.map((att, attIdx) => {
                          const category = getFileCategory(att.mimetype || att.fileType, att.name)
                          const finalUrl = mediaUrl(att.url)

                          if (category === "image") {
                            return (
                              <div
                                key={attIdx}
                                style={{
                                  position: "relative",
                                  borderRadius: "10px",
                                  overflow: "hidden",
                                  cursor: "pointer",
                                  maxHeight: "340px",
                                  background: "#000",
                                }}
                                onClick={() => setLightboxMedia({ url: finalUrl, name: att.name, category: "image" })}
                              >
                                <img
                                  src={finalUrl}
                                  alt={att.name || "Chat image"}
                                  style={{
                                    width: "100%",
                                    maxHeight: "340px",
                                    objectFit: "cover",
                                    display: "block",
                                    transition: "transform 0.2s ease",
                                  }}
                                  loading="lazy"
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: "6px",
                                    right: "6px",
                                    background: "rgba(0,0,0,0.6)",
                                    color: "#FFF",
                                    borderRadius: "6px",
                                    padding: "2px 6px",
                                    fontSize: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "3px",
                                  }}
                                >
                                  <FiMaximize2 size={10} /> View
                                </div>
                              </div>
                            )
                          }

                          if (category === "video") {
                            return (
                              <div key={attIdx} style={{ borderRadius: "10px", overflow: "hidden", background: "#000" }}>
                                <video
                                  src={finalUrl}
                                  controls
                                  preload="metadata"
                                  style={{ width: "100%", maxHeight: "320px", display: "block", borderRadius: "10px" }}
                                />
                                <div style={{ padding: "4px 8px", fontSize: "11px", color: isMine ? "rgba(255,255,255,0.85)" : "#64748B", display: "flex", justifyContent: "space-between" }}>
                                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</span>
                                  {att.size && <span>{formatFileSize(att.size)}</span>}
                                </div>
                              </div>
                            )
                          }

                          if (category === "audio") {
                            return (
                              <div
                                key={attIdx}
                                style={{
                                  padding: "8px 10px",
                                  borderRadius: "10px",
                                  background: isMine ? "rgba(255,255,255,0.15)" : "#F1F5F9",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", fontWeight: 700 }}>
                                  <FiMusic size={14} />
                                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name || "Voice / Audio Clip"}</span>
                                </div>
                                <audio src={finalUrl} controls preload="metadata" style={{ width: "100%", height: "32px" }} />
                              </div>
                            )
                          }

                          // Document / ZIP / PDF / Others
                          return (
                            <div
                              key={attIdx}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "10px",
                                padding: "10px 12px",
                                borderRadius: "10px",
                                background: isMine ? "rgba(255,255,255,0.18)" : "#F8FAFC",
                                border: isMine ? "1px solid rgba(255,255,255,0.25)" : "1px solid #E2E8F0",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                                <div
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "8px",
                                    background: isMine ? "#FFFFFF" : "#EFF6FF",
                                    color: isMine ? "#2563EB" : "#2563EB",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  {category === "archive" ? <FiArchive size={18} /> : <FiFileText size={18} />}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div
                                    style={{
                                      fontSize: "12.5px",
                                      fontWeight: 700,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      color: isMine ? "#FFFFFF" : "#0F172A",
                                    }}
                                  >
                                    {att.name}
                                  </div>
                                  <div style={{ fontSize: "10.5px", color: isMine ? "rgba(255,255,255,0.8)" : "#64748B" }}>
                                    {formatFileSize(att.size)}
                                  </div>
                                </div>
                              </div>

                              <a
                                href={finalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={att.name}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  background: isMine ? "#FFFFFF" : "#2563EB",
                                  color: isMine ? "#2563EB" : "#FFFFFF",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  textDecoration: "none",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  flexShrink: 0,
                                }}
                              >
                                <FiDownload size={12} /> Download
                              </a>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Text / Caption Content */}
                    {msg.content && msg.content.trim() !== "" && (
                      <div style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748B", fontSize: "13px" }}>
              <FiMessageSquare size={32} style={{ color: "#CBD5E1", marginBottom: "8px" }} />
              <p style={{ margin: 0, fontWeight: 700 }}>No messages in this chat yet.</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>Share notes, files up to 3 GB, or start the conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* STAGED ATTACHMENT PREVIEW TRAY */}
        {stagedFiles.length > 0 && (
          <div
            style={{
              padding: "10px 16px",
              background: "#F1F5F9",
              borderTop: "1px solid #E2E8F0",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              maxHeight: "140px",
              overflowY: "auto",
            }}
          >
            {stagedFiles.map((item) => {
              const progress = uploadProgress[item.id] || 0
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#FFFFFF",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    position: "relative",
                    overflow: "hidden",
                    maxWidth: "240px",
                  }}
                >
                  {/* Thumbnail / Icon */}
                  {item.category === "image" && item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      style={{ width: "32px", height: "32px", objectFit: "cover", borderRadius: "4px" }}
                    />
                  ) : item.category === "video" ? (
                    <div style={{ width: "32px", height: "32px", borderRadius: "4px", background: "#FEF3C7", color: "#B45309", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FiFilm size={16} />
                    </div>
                  ) : item.category === "audio" ? (
                    <div style={{ width: "32px", height: "32px", borderRadius: "4px", background: "#E0E7FF", color: "#4338CA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FiMusic size={16} />
                    </div>
                  ) : (
                    <div style={{ width: "32px", height: "32px", borderRadius: "4px", background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FiFileText size={16} />
                    </div>
                  )}

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: "10px", color: "#64748B" }}>
                      {formatFileSize(item.size)}
                      {progress > 0 && ` • ${progress}%`}
                    </div>
                  </div>

                  {!isUploadingMedia && (
                    <button
                      type="button"
                      onClick={() => removeStagedFile(item.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#94A3B8",
                        cursor: "pointer",
                        padding: "2px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <FiX size={14} />
                    </button>
                  )}

                  {/* Individual Upload Progress Bar overlay */}
                  {progress > 0 && progress < 100 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        height: "3px",
                        background: "#2563EB",
                        width: `${progress}%`,
                        transition: "width 0.15s ease",
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Chat Input Bar */}
        <form
          onSubmit={handleSendMessage}
          style={{ padding: "12px 18px", borderTop: "1px solid #E2E8F0", background: "#FFFFFF", display: "flex", gap: "8px", alignItems: "center" }}
        >
          {/* Hidden File Pickers */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => {
              handleStageFiles(e.target.files)
              e.target.value = null
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={(e) => {
              handleStageFiles(e.target.files)
              e.target.value = null
            }}
          />

          {/* Quick Image/Video Picker Button */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            title="Attach Photos or Videos"
            style={{
              background: "#F8FAFC",
              border: "1px solid #CBD5E1",
              borderRadius: "10px",
              padding: "10px",
              cursor: "pointer",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s ease",
            }}
          >
            <FiImage size={17} />
          </button>

          {/* Generic Document/File Picker Button (Up to 3GB) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Any File / Document / ZIP (up to 3 GB)"
            style={{
              background: "#F8FAFC",
              border: "1px solid #CBD5E1",
              borderRadius: "10px",
              padding: "10px",
              cursor: "pointer",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s ease",
            }}
          >
            <FiPaperclip size={17} />
          </button>

          <input
            type="text"
            placeholder={
              activeTab === "global"
                ? "Send a message or drop files..."
                : activeTab === "circle"
                ? `Message ${selectedCircle?.name || "this Circle"}...`
                : `Message ${selectedContact ? selectedContact.firstName : "contact"}...`
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending || isUploadingMedia}
            style={{
              flex: 1,
              padding: "11px 16px",
              borderRadius: "12px",
              border: "1px solid #CBD5E1",
              fontSize: "13.5px",
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={(sending || isUploadingMedia) || (!inputText.trim() && stagedFiles.length === 0)}
            style={{
              padding: "11px 20px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "13.5px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: (sending || isUploadingMedia) || (!inputText.trim() && stagedFiles.length === 0) ? 0.6 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            <FiSend size={14} />
            {isUploadingMedia ? "Uploading..." : sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>

      {/* LIGHTBOX MODAL FOR IMAGES */}
      {lightboxMedia && (
        <div
          onClick={() => setLightboxMedia(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.9)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ position: "absolute", top: "-40px", right: "0", display: "flex", gap: "10px" }}>
              <a
                href={lightboxMedia.url}
                target="_blank"
                rel="noopener noreferrer"
                download={lightboxMedia.name}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "#FFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                }}
              >
                <FiDownload size={13} /> Download
              </a>
              <button
                onClick={() => setLightboxMedia(null)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "#FFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FiX size={16} />
              </button>
            </div>

            <img
              src={lightboxMedia.url}
              alt={lightboxMedia.name || "Preview"}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: "12px",
                objectFit: "contain",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
            />
            {lightboxMedia.name && (
              <span style={{ color: "#E2E8F0", fontSize: "13px", fontWeight: 600 }}>{lightboxMedia.name}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

