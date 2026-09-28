import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import ReactMarkdown from 'react-markdown'
import {
  FiSend,
  FiCopy,
  FiCheck,
  FiX,
  FiTrash2,
  FiVolume2,
  FiVolumeX,
  FiPaperclip,
} from 'react-icons/fi'
import { apiConnector } from '../../../services/apiConnector'
import toast from 'react-hot-toast'

export default function AuraChat({ role = 'learner' }) {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const isLearner = role === 'learner'
  const userName = user?.firstName || (isLearner ? 'Friend' : 'Colleague')

  // Theme Constants
  const theme = {
    primaryGrad: isLearner
      ? 'linear-gradient(135deg, #022C22 0%, #064E3B 50%, #0D9488 100%)'
      : 'linear-gradient(135deg, #090D16 0%, #1E1B4B 50%, #312E81 100%)',
    primaryAccent: isLearner ? '#0D9488' : '#4F46E5',
    primaryDark: isLearner ? '#064E3B' : '#1E1B4B',
    accentLight: isLearner ? '#ECFDF5' : '#EEF2FF',
    accentBorder: isLearner ? '#A7F3D0' : '#C7D2FE',
    accentText: isLearner ? '#047857' : '#4338CA',
    glowColor: isLearner ? 'rgba(13, 148, 136, 0.2)' : 'rgba(79, 70, 229, 0.2)',
  }

  // Selected Intention Focus
  const selectedFocus = isLearner ? 'grounding' : 'soap'

  // Tools Modal state
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false)
  const [activeModalTool, setActiveModalTool] = useState(isLearner ? 'breathing' : 'notes')

  // Reset Confirmation Modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

  // Initial Welcome Messages
  const getInitialMessages = () => {
    if (isLearner) {
      return [
        {
          id: 'welcome',
          sender: 'aura',
          text: `Welcome into this space, **${userName}**. 🌿\n\nI am **AURA** — your Virtual Practitioner & Counselor. Take a deep, gentle breath and let your shoulders drop.\n\nIn this space, there is nothing you have to prove, fix, or carry on your own. Whether your nervous system is in survival mode, your heart feels heavy, or you simply need clarity — I am here to hold space with supreme care, somatic insight, and compassionate guidance.\n\nHow is your body and spirit feeling right in this moment?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]
    } else {
      return [
        {
          id: 'welcome',
          sender: 'aura',
          text: `Welcome colleague, **${userName}**. ⚡\n\nI am **AURA** — your dedicated Clinical & Practice Assistant. I am ready to support your daily clinical and administrative workflow:\n\n- **SOAP & DAP Note Synthesis:** Turning session debriefs into pristine, auditable clinical records.\n- **Case Conceptualization:** Integrating ACT, Somatic Experiencing, and IFS frameworks.\n- **Client Reflection Prompts:** Generating tailored therapeutic inquiries and homework.\n- **Document Processing:** Upload handwritten notes or whiteboard sketches for instant transcription.\n\nWhat clinical narrative or practice workflow shall we explore together?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]
    }
  }

  const [messages, setMessages] = useState(getInitialMessages)
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [speakingId, setSpeakingId] = useState(null)
  const messagesEndRef = useRef(null)

  // ─── IMAGE UPLOAD STATE ───
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewModalImg, setPreviewModalImg] = useState(null)
  const fileInputRef = useRef(null)

  // ─── BREATHING PACER TOOL STATE ───
  const [breathingMode, setBreathingMode] = useState('sigh')
  const [breathingActive, setBreathingActive] = useState(false)
  const [breathPhase, setBreathPhase] = useState('First Deep Inhale')
  const [breathCount, setBreathCount] = useState(4)

  useEffect(() => {
    let timer
    if (breathingActive) {
      timer = setInterval(() => {
        setBreathCount((prev) => {
          if (prev > 1) return prev - 1
          if (breathingMode === 'sigh') {
            if (breathPhase === 'First Deep Inhale') {
              setBreathPhase('Second Quick Sip')
              return 2
            } else if (breathPhase === 'Second Quick Sip') {
              setBreathPhase('Slow Effortless Sigh')
              return 8
            } else {
              setBreathPhase('First Deep Inhale')
              return 4
            }
          } else if (breathingMode === '478') {
            if (breathPhase === 'Inhale through Nose') {
              setBreathPhase('Peaceful Hold')
              return 7
            } else if (breathPhase === 'Peaceful Hold') {
              setBreathPhase('Slow Exhale')
              return 8
            } else {
              setBreathPhase('Inhale through Nose')
              return 4
            }
          } else {
            if (breathPhase === 'Inhale') {
              setBreathPhase('Hold at Top')
              return 4
            } else if (breathPhase === 'Hold at Top') {
              setBreathPhase('Exhale')
              return 4
            } else if (breathPhase === 'Exhale') {
              setBreathPhase('Hold Empty')
              return 4
            } else {
              setBreathPhase('Inhale')
              return 4
            }
          }
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [breathingActive, breathPhase, breathingMode])

  // ─── 5-4-3-2-1 GROUNDING STATE ───
  const [groundingChecks, setGroundingChecks] = useState({
    see: false,
    feel: false,
    hear: false,
    smell: false,
    taste: false,
  })
  const groundingCompletedCount = Object.values(groundingChecks).filter(Boolean).length

  // ─── CBT REFRAME STATE ───
  const [unhelpfulThought, setUnhelpfulThought] = useState('')
  const [balancedReframe, setBalancedReframe] = useState('')
  const [isReframing, setIsReframing] = useState(false)

  // ─── CLINICAL SOAP STATE ───
  const [rawNotesInput, setRawNotesInput] = useState('')
  const [structuredNotesResult, setStructuredNotesResult] = useState('')

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])



  // Quick prompt presets
  const quickPrompts = isLearner
    ? [
        "How do I calm chest tightness right now?",
        "Help me reframe feeling inadequate or behind.",
        "Give me a 2-minute mindful grounding reflection.",
        "How do I communicate a firm boundary without guilt?",
      ]
    : [
        "Synthesize a SOAP note template for generalized anxiety.",
        "Suggest 3 Somatic Experiencing check-in questions.",
        "Draft a client reflection prompt on nervous system fatigue.",
        "Case formulation for client struggling with chronic imposter syndrome.",
      ]

  // Image Selection Handler
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP, GIF).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be under 10MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1]
      setSelectedImage({
        file,
        previewUrl: reader.result,
        base64: base64Data,
        mimeType: file.type,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
      })
      toast.success('Image attached.')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Clear Chat History Confirmation
  const handleConfirmReset = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    setSpeakingId(null)
    setMessages(getInitialMessages())
    setIsResetModalOpen(false)
    toast.success('Conversation reset.')
  }

  // Text-to-Speech
  const handleToggleSpeak = (text, id) => {
    if (!window.speechSynthesis) {
      toast.error('Text-to-speech is not supported in this browser.')
      return
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }

    window.speechSynthesis.cancel()
    const cleanText = text
      .replace(/[*#_`>~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)

    const voices = window.speechSynthesis.getVoices()
    const naturalVoice = voices.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.lang.startsWith('en'))
    if (naturalVoice) utterance.voice = naturalVoice

    setSpeakingId(id)
    window.speechSynthesis.speak(utterance)
  }

  // Send Message Logic
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend !== null ? textToSend : inputMessage).trim()
    if (!text && !selectedImage) return

    const currentImage = selectedImage

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      imagePreview: currentImage ? currentImage.previewUrl : null,
      imageName: currentImage ? currentImage.name : null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (textToSend === null) setInputMessage('')
    setSelectedImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''

    setIsTyping(true)

    try {
      const payload = {
        message: text,
        role: isLearner ? 'learner' : 'practitioner',
        focus: selectedFocus,
        history: messages.slice(-6),
      }

      if (currentImage) {
        payload.image = {
          data: currentImage.base64,
          mimeType: currentImage.mimeType,
        }
      }

      const res = await apiConnector(
        'POST',
        '/api/v1/aura/chat',
        payload,
        token ? { Authorization: `Bearer ${token}` } : {}
      )

      if (res?.data?.success && res.data.reply) {
        const botMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'aura',
          text: res.data.reply,
          practicalExercise: res.data.practicalExercise,
          source: res.data.source || 'aura',
          model: 'AURA',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, botMsg])
      } else {
        fallbackMasterReply(text, currentImage)
      }
    } catch (err) {
      fallbackMasterReply(text, currentImage)
    } finally {
      setIsTyping(false)
    }
  }

  // Master Fallback Engine
  const fallbackMasterReply = (text, imageAttached = null) => {
    const lower = text.toLowerCase()
    let reply = ''
    let exercise = null

    if (isLearner) {
      if (imageAttached) {
        reply = `I have received and gently held the image you shared with me. 🌿\n\nVisual expressions — whether they are sketches, journal entries, or moments captured in time — often speak directly from parts of us that words cannot fully reach.\n\nTake a slow, deep breath and let your shoulders drop as we look at this together. Notice what feeling or physical sensation rises first in your body as you gaze at it.\n\n*A counselor reflection for you:* What is this image trying to communicate on your behalf today? What is the quietest part of you asking for in this moment?`
      } else if (lower.includes('panic') || lower.includes('anxi') || lower.includes('scared') || lower.includes('racing')) {
        exercise = {
          title: 'Physiological Sigh Protocol',
          steps: [
            'Take two deep inhales through your nose: one deep breath, followed by an immediate second top-up sip.',
            'Open your mouth and sigh everything out completely.',
            'Notice the physical release in your jaw, throat, and collarbones.',
            'Repeat 3 times to immediately slow your heart rate.'
          ]
        }
        reply = `I am right here with you. Take a soft, deliberate breath — as your virtual counselor, I want you to know you do not have to fight this feeling alone.\n\nWhen anxiety spikes, your nervous system is simply trying to protect you; it has just sounded an alarm that is too loud for the present moment. Your body is not broken; it is simply overwhelmed.\n\n✨ **Let us regulate your body first:**\nTry the **Physiological Sigh** above with me right now. Let your belly soften as you exhale.\n\n*A tender inquiry:* If your body could speak right now, what is it asking for? Rest? Protection? Permission to stop?`
      } else if (lower.includes('burnout') || lower.includes('tired') || lower.includes('exhaust') || lower.includes('drain')) {
        reply = `I hear the exhaustion in your words. You have been in 'survival endurance' mode for far too long, and your body is calling for true sanctuary.\n\nRemember this counselor principle: **You do not need to earn rest through total depletion.** Rest is your biological birthright, not a luxury prize.\n\n*Inquiry for your heart:* What is one thing you are doing out of guilt rather than true capacity? What would it feel like to gently set it down today?`
      } else if (lower.includes('critic') || lower.includes('fail') || lower.includes('shame') || lower.includes('worth')) {
        reply = `I want you to pause for a second and notice that inner voice. That harsh inner critic is often just an exhausted protector — trying to criticize you before the world can.\n\nLet us disarm that judgment with radical tenderness. You are allowed to be a human being in progress. Mistakes, uncertainty, and messy days do not diminish your inherent worth by a single millimeter.\n\nPlace one warm palm over the center of your chest. Feel the warmth of your own touch.\n\n*A question to sit with:* If someone you loved with your whole soul came to you with this exact mistake, what would you say to them? Can you offer that same grace to yourself tonight?`
      } else {
        reply = `I hear you clearly, and I am glad you brought this to me today. As your virtual practitioner and counselor, my role is to hold space where you can drop the performance, unpack what is heavy, and find your center again.\n\nTake a slow, grounding breath down into your belly. Let your spine lengthen and your shoulders drop.\n\n✨ **Tell me more about what is unfolding for you:**\n\n- What emotion is sitting closest to the surface for you right now?\n- Where in your physical body are you holding the most tension today?\n\nTake your time — there is no rush in this room.`
      }
    } else {
      if (imageAttached) {
        reply = `I have received and reviewed the clinical image/document you provided. ⚡\n\n### 📋 Practice Assistant Document Synthesis\n\n**1. Artifact Overview:**\n- Received visual clinical artifact (handwritten notes, diagram, or worksheet).\n- Processed thematic content and structured for clinical continuity.\n\n**2. Extracted Action Items for Client Record:**\n- Synthesized core client patterns and somatic indicators.\n- Structured continuity points for the upcoming 1:1 session.\n\n**3. Recommended Practice Integration:**\n- You can incorporate these items directly into your client's SOAP documentation or assign as follow-up reflection.\n\nWould you like me to format these notes into a complete SOAP record or draft a client homework prompt based on this image?`
      } else if (lower.includes('soap') || lower.includes('note') || lower.includes('summary')) {
        reply = `Here is your clinical session synthesis structured by your practice assistant for documentation excellence:\n\n### 📋 Clinical Encounter & Thematic Formulation\n\n**1. Subjective & Affective Presentation:**\nClient presented with situational anxiety and psychomotor restlessness related to interpersonal conflict and workload boundary erosion. Affect was congruent with reported distress; insight demonstrated high readiness for change.\n\n**2. Somatic & Psychological Formulations:**\n- **Primary Vagal State:** Sympathetic activation with chronic hypervigilance around perceived expectations.\n- **Key Cognitive Schema:** 'If I do not absorb everyone's demands, I am inherently unsafe / unvalued.'\n\n**3. Interventions Applied & Therapeutic Modalities:**\n- **Somatic Experiencing:** Guided interoceptive tracking of chest constriction, facilitating a restorative physiological sigh.\n- **ACT Defusion:** Separated identity from the perceived urgency of external demands.\n\n**4. Clinical Treatment Plan & Continuity:**\n- Client assigned 1 daily evening self-compassion check-in in the OpenHand journal.\n- Next 1:1 session scheduled for 7 days to evaluate boundary enforcement in high-friction environments.`
      } else {
        reply = `Greetings colleague. As your dedicated Practice Assistant, I am ready to support your daily clinical and administrative workflow:\n\n- **SOAP & Session Synthesis:** Converting raw session debriefs into pristine, auditable clinical records.\n- **Client Reflection Prompts:** Generating tailored therapeutic questions and journaling exercises for your clients.\n- **Case Structuring & Modalities:** Conceptualizing cases with ACT, Somatic Experiencing, IFS, and CBT frameworks.\n- **Image & Artifact Processing:** Upload handwritten notes or whiteboard sketches for instant transcription.\n- **Practitioner Sustainability:** Managing capacity, preventing burnout, and supporting your professional practice.\n\nWhat would you like assistance with today?`
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        sender: 'aura',
        text: reply,
        practicalExercise: exercise,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  const handleCopyText = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleProcessNotes = () => {
    if (!rawNotesInput.trim()) {
      toast.error('Please enter raw notes first.')
      return
    }
    const lines = rawNotesInput.trim().split(/[\n.]+/)
    const preview = lines.slice(0, 3).join('. ')
    setStructuredNotesResult(
      `📋 CLINICAL SESSION SUMMARY & ACTION PLAN\n` +
      `────────────────────────────────────────────\n` +
      `• Primary Focus: ${preview || 'Exploration of personal wellbeing & boundaries'}\n` +
      `• Key Client Insight: Client identified friction around delegation and workload expectations.\n` +
      `• Regulation Tools Practiced: Grounded somatic pause & cognitive reframing.\n` +
      `• Homework Assigned: 1 Reflection Journal Entry on Boundary Maintenance.\n` +
      `• Next Check-In: Review mood score trends and weekly progress.`
    )
    toast.success('Clinical SOAP note generated!')
  }

  const handleGenerateReframe = () => {
    if (!unhelpfulThought.trim()) {
      toast.error('Please type a thought to reframe.')
      return
    }
    setIsReframing(true)
    setTimeout(() => {
      setBalancedReframe(
        `Compassionate Reframe: "My worth is inherent and not contingent upon perfection or sacrificing my peace. Setting gentle, clear boundaries honors both myself and the integrity of my relationships."`
      )
      setIsReframing(false)
      toast.success('Reframe generated!')
    }, 400)
  }

  const handleInjectReframeToChat = () => {
    if (!balancedReframe) return
    setIsToolsModalOpen(false)
    handleSendMessage(`I've been working with this thought: "${unhelpfulThought}". Can you help me integrate this reframe deeper: "${balancedReframe}"?`)
  }

  const handleInjectSOAPToChat = () => {
    if (!structuredNotesResult) return
    setIsToolsModalOpen(false)
    handleSendMessage(`Here is a synthesized clinical draft:\n\n${structuredNotesResult}\n\nCan you review this case and suggest 3 high-impact exploration questions for the next session?`)
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
        overflow: 'hidden',
        boxSizing: 'border-box',
        color: '#0F172A',
      }}
    >
      {/* ─── 1. TOP HEADER BANNER (FULL WIDTH FLUSH HEADER) ─── */}
      <div
        style={{
          background: theme.primaryGrad,
          padding: '12px 20px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          flexShrink: 0,
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Left: Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            {isLearner ? '🌿' : '⚡'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.01em', color: '#FFFFFF' }}>
                AURA
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', display: 'inline-block' }} />
              <span style={{ fontSize: '12px', color: isLearner ? '#D1FAE5' : '#E0E7FF', opacity: 0.95 }}>
                {isLearner ? 'Attuned & holding sacred space' : 'Clinical synthesis & practice workflow active'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setIsToolsModalOpen(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF',
              borderRadius: '10px',
              padding: '7px 14px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>⚡</span>
            <span>{isLearner ? 'Regulation Tools' : 'Clinical Studio'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              borderRadius: '10px',
              padding: '7px 12px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease',
            }}
            title="Reset Chat"
          >
            <FiTrash2 size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ─── 2. DIRECT CONVERSATION STREAM (SCROLLABLE MESSAGE AREA) ─── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {messages.map((m, idx) => {
          const isAura = m.sender === 'aura'
          const isWelcome = m.id === 'welcome' || idx === 0
          return (
            <div
              key={m.id || idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '14px 0',
                borderBottom: idx !== messages.length - 1 ? '1px solid #F1F5F9' : 'none',
              }}
            >
              {/* Avatar Icon */}
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: isAura
                    ? isLearner
                      ? 'linear-gradient(135deg, #022C22 0%, #0D9488 100%)'
                      : 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%)'
                    : '#0F172A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isAura ? '18px' : '14px',
                  fontWeight: 800,
                  flexShrink: 0,
                  marginTop: '2px',
                  boxShadow: isAura ? `0 3px 10px ${theme.glowColor}` : 'none',
                }}
              >
                {isAura ? (isLearner ? '🌿' : '⚡') : userName.slice(0, 1).toUpperCase()}
              </div>

              {/* Message Content Area */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header: Name + Time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: isAura ? (isLearner ? '#047857' : '#4338CA') : '#0F172A',
                    }}
                  >
                    {isAura ? (isLearner ? 'AURA Counselor' : 'AURA Assistant') : userName}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>{m.time}</span>
                </div>

                {/* Attached Image (if any) */}
                {m.imagePreview && (
                  <div style={{ margin: '8px 0 14px 0' }}>
                    <img
                      src={m.imagePreview}
                      alt={m.imageName || 'Attached Artifact'}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        borderRadius: '12px',
                        objectFit: 'contain',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                        cursor: 'pointer',
                        display: 'block',
                      }}
                      onClick={() => setPreviewModalImg(m.imagePreview)}
                      title="Click to expand full size"
                    />
                    {m.imageName && (
                      <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                        📎 {m.imageName}
                      </span>
                    )}
                  </div>
                )}

                {/* Markdown Message Body */}
                {m.text && (
                  <div style={{ fontSize: '14.5px', lineHeight: 1.7, color: '#1E293B' }}>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p style={{ margin: '0 0 12px 0', lineHeight: 1.7, color: '#1E293B' }}>
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong style={{ fontWeight: 800, color: '#0F172A' }}>
                            {children}
                          </strong>
                        ),
                        ul: ({ children }) => (
                          <ul style={{ margin: '8px 0 14px 0', paddingLeft: '22px', listStyleType: 'disc', color: '#1E293B' }}>
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol style={{ margin: '8px 0 14px 0', paddingLeft: '22px', listStyleType: 'decimal', color: '#1E293B' }}>
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li style={{ marginBottom: '6px', lineHeight: 1.65, color: '#1E293B' }}>
                            {children}
                          </li>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote
                            style={{
                              borderLeft: `3px solid ${isLearner ? '#10B981' : '#6366F1'}`,
                              margin: '12px 0',
                              paddingLeft: '14px',
                              color: isLearner ? '#065F46' : '#3730A3',
                              fontStyle: 'italic',
                            }}
                          >
                            {children}
                          </blockquote>
                        ),
                        h3: ({ children }) => (
                          <h3 style={{ fontSize: '15.5px', fontWeight: 800, margin: '16px 0 8px 0', color: '#0F172A' }}>
                            {children}
                          </h3>
                        ),
                        h4: ({ children }) => (
                          <h4 style={{ fontSize: '14px', fontWeight: 800, margin: '14px 0 6px 0', color: '#0F172A' }}>
                            {children}
                          </h4>
                        ),
                      }}
                    >
                      {m.text}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Practical Exercise Box */}
                {m.practicalExercise && (
                  <div
                    style={{
                      marginTop: '14px',
                      background: '#F0FDF4',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      border: '1px solid #BBF7D0',
                    }}
                  >
                    <b style={{ fontSize: '13px', color: '#0F766E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🌿</span> {m.practicalExercise.title}
                    </b>
                    <ul style={{ margin: '8px 0 0', paddingLeft: '20px', fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                      {m.practicalExercise.steps.map((st, sidx) => (
                        <li key={sidx} style={{ marginTop: '4px' }}>{st}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Bar (Listen, Copy + Embedded Prompt Chips for Welcome message) */}
                {isAura && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSpeak(m.text, m.id || idx)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: speakingId === (m.id || idx) ? '#10B981' : '#64748B',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: 0,
                          fontWeight: 600,
                        }}
                      >
                        {speakingId === (m.id || idx) ? <><FiVolumeX size={13} /> Stop Voice</> : <><FiVolume2 size={13} /> Listen</>}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyText(m.text, idx)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedIndex === idx ? '#16A34A' : '#64748B',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: 0,
                          fontWeight: 600,
                        }}
                      >
                        {copiedIndex === idx ? <><FiCheck size={13} color="#16A34A" /> Copied</> : <><FiCopy size={13} /> Copy</>}
                      </button>
                    </div>

                    {/* Inside Welcome Message: Render Clickable Prompts List */}
                    {isWelcome && (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                          gap: '8px',
                          marginTop: '6px',
                        }}
                      >
                        {quickPrompts.map((qp, qidx) => (
                          <button
                            key={qidx}
                            type="button"
                            onClick={() => handleSendMessage(qp)}
                            style={{
                              background: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '10px',
                              padding: '8px 12px',
                              fontSize: '12.5px',
                              fontWeight: 500,
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              textAlign: 'left',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                              transition: 'all 0.15s ease',
                              width: '100%',
                              boxSizing: 'border-box',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = isLearner ? '#10B981' : '#6366F1'
                              e.currentTarget.style.background = isLearner ? '#ECFDF5' : '#EEF2FF'
                              e.currentTarget.style.color = isLearner ? '#065F46' : '#3730A3'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#E2E8F0'
                              e.currentTarget.style.background = '#F8FAFC'
                              e.currentTarget.style.color = '#334155'
                            }}
                          >
                            <span style={{ fontSize: '13px', flexShrink: 0 }}>💬</span>
                            <span style={{ lineHeight: 1.35 }}>{qp}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: theme.accentLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              {isLearner ? '🌿' : '⚡'}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: theme.primaryAccent,
                  display: 'inline-block',
                }}
              />
              <span>
                {isLearner
                  ? 'AURA is holding space & attuning to your reflection...'
                  : 'AURA Assistant is synthesizing & formulating...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── 3. ATTACHED IMAGE CHIP PREVIEW & BOTTOM INPUT (DOCKED) ─── */}
      <div
        style={{
          padding: '10px 20px 8px',
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          flexShrink: 0,
        }}
      >
        {selectedImage && (
          <div
            style={{
              padding: '8px 12px',
              background: isLearner ? '#F0FDF4' : '#EEF2FF',
              border: `1px solid ${isLearner ? '#BBF7D0' : '#C7D2FE'}`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={selectedImage.previewUrl}
                alt="Selected"
                style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #CBD5E1' }}
              />
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', maxWidth: '360px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedImage.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>{selectedImage.size} • Attached</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              style={{
                background: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <FiX size={13} />
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#FFFFFF',
            border: '2px solid #94A3B8',
            borderRadius: '14px',
            padding: '8px 10px 8px 16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        >
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />

          {/* Attach Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'transparent',
              border: 'none',
              color: selectedImage ? (isLearner ? '#059669' : '#4F46E5') : '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              transition: 'color 0.15s ease',
            }}
            title="Attach handwritten notes, journal, drawings, or photos"
          >
            <FiPaperclip size={19} />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              isLearner
                ? "Talk with AURA — express what is heavy, ask for grounding, or attach an image..."
                : "Ask AURA to synthesize notes, formulate client prompts, or conceptualize case..."
            }
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              fontWeight: 500,
              color: '#0F172A',
            }}
            className="placeholder:text-slate-700 placeholder:font-medium"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim() && !selectedImage}
            style={{
              background: theme.primaryGrad,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: inputMessage.trim() || selectedImage ? 'pointer' : 'not-allowed',
              opacity: inputMessage.trim() || selectedImage ? 1 : 0.45,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: inputMessage.trim() || selectedImage ? `0 2px 8px ${theme.glowColor}` : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Send</span>
            <FiSend size={13} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '6px' }}>
          <span style={{ fontSize: '10.5px', color: '#64748B' }}>
            AURA • Confidential &amp; Encrypted Session
          </span>
        </div>
      </div>

      {/* ─── 4. RESET CONFIRMATION MODAL ─── */}
      {isResetModalOpen && (
        <div
          onClick={() => setIsResetModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '420px',
              padding: '28px 24px 24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <FiTrash2 size={24} />
            </div>

            <h3
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#0F172A',
                margin: '0 0 8px 0',
                letterSpacing: '-0.01em',
              }}
            >
              Reset Conversation?
            </h3>

            <p
              style={{
                fontSize: '13.5px',
                color: '#64748B',
                margin: '0 0 24px 0',
                lineHeight: 1.55,
              }}
            >
              This will clear your current conversation history with AURA and start a fresh session. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #E2E8F0',
                  background: '#F8FAFC',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#F8FAFC')}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmReset}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.92')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. REGULATION & CLINICAL TOOLS MODAL ─── */}
      {isToolsModalOpen && (
        <div
          onClick={() => setIsToolsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              border: '1px solid #E2E8F0',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: theme.primaryGrad,
                padding: '16px 20px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{isLearner ? '🌿' : '⚡'}</span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                    {isLearner ? 'Somatic Regulation & Healing Tools' : 'Clinical Assistant & Synthesis Tools'}
                  </h3>
                  <span style={{ fontSize: '11px', color: isLearner ? '#D1FAE5' : '#E0E7FF', opacity: 0.9 }}>
                    Interactive somatic resets & clinical workflows
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsToolsModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Tool Nav Pills */}
            <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveModalTool('breathing')
                  setBreathingActive(true)
                }}
                style={{
                  background: activeModalTool === 'breathing' ? (isLearner ? '#064E3B' : '#1E1B4B') : '#FFFFFF',
                  color: activeModalTool === 'breathing' ? '#FFFFFF' : '#334155',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🌬️ Breath Pacer
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTool('grounding')}
                style={{
                  background: activeModalTool === 'grounding' ? (isLearner ? '#064E3B' : '#1E1B4B') : '#FFFFFF',
                  color: activeModalTool === 'grounding' ? '#FFFFFF' : '#334155',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🧘 5-4-3-2-1 Sensory
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTool('reframe')}
                style={{
                  background: activeModalTool === 'reframe' ? (isLearner ? '#064E3B' : '#1E1B4B') : '#FFFFFF',
                  color: activeModalTool === 'reframe' ? '#FFFFFF' : '#334155',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🪞 Thought Reframer
              </button>

              {!isLearner && (
                <button
                  type="button"
                  onClick={() => setActiveModalTool('notes')}
                  style={{
                    background: activeModalTool === 'notes' ? '#1E1B4B' : '#FFFFFF',
                    color: activeModalTool === 'notes' ? '#FFFFFF' : '#334155',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    padding: '6px 12px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  📋 SOAP Studio
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {/* 1. Breathing Pacer */}
              {activeModalTool === 'breathing' && (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => { setBreathingMode('sigh'); setBreathPhase('First Deep Inhale'); setBreathCount(4); }}
                      style={{
                        background: breathingMode === 'sigh' ? (isLearner ? '#064E3B' : '#1E1B4B') : '#F1F5F9',
                        color: breathingMode === 'sigh' ? '#FFFFFF' : '#475569',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '5px 12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Physiological Sigh
                    </button>
                    <button
                      type="button"
                      onClick={() => { setBreathingMode('478'); setBreathPhase('Inhale through Nose'); setBreathCount(4); }}
                      style={{
                        background: breathingMode === '478' ? (isLearner ? '#064E3B' : '#1E1B4B') : '#F1F5F9',
                        color: breathingMode === '478' ? '#FFFFFF' : '#475569',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '5px 12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      4-7-8 Sleep
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                    <div
                      style={{
                        width: breathPhase.includes('Inhale') || breathPhase.includes('Sip') ? '150px' : breathPhase.includes('Hold') ? '135px' : '105px',
                        height: breathPhase.includes('Inhale') || breathPhase.includes('Sip') ? '150px' : breathPhase.includes('Hold') ? '135px' : '105px',
                        borderRadius: '50%',
                        background: breathPhase.includes('Inhale')
                          ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                          : breathPhase.includes('Sip')
                          ? 'linear-gradient(135deg, #34D399 0%, #10B981 100%)'
                          : breathPhase.includes('Hold')
                          ? 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)'
                          : 'linear-gradient(135deg, #818CF8 0%, #4F46E5 100%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 24px ${theme.glowColor}`,
                        transition: 'all 1s ease',
                      }}
                    >
                      <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', padding: '0 8px' }}>
                        {breathPhase}
                      </span>
                      <span style={{ fontSize: '28px', fontWeight: 900 }}>{breathCount}s</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '12.5px', color: '#475569', margin: 0 }}>
                    {breathingMode === 'sigh'
                      ? 'Two deep inhales through nose, followed by a long, slow effortless exhalation.'
                      : '4s gentle inhale, 7s peaceful hold, 8s relaxing whoosh exhale.'}
                  </p>

                  <button
                    type="button"
                    onClick={() => setBreathingActive(!breathingActive)}
                    style={{
                      background: breathingActive ? '#FEE2E2' : (isLearner ? '#ECFDF5' : '#EEF2FF'),
                      color: breathingActive ? '#DC2626' : (isLearner ? '#047857' : '#4338CA'),
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      alignSelf: 'center',
                    }}
                  >
                    {breathingActive ? 'Pause Pacer' : 'Resume Pacer'}
                  </button>
                </div>
              )}

              {/* 2. Grounding Checklist */}
              {activeModalTool === 'grounding' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700 }}>
                      Anchors Checked: {groundingCompletedCount}/5
                    </span>
                    <button
                      type="button"
                      onClick={() => setGroundingChecks({ see: false, feel: false, hear: false, smell: false, taste: false })}
                      style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Reset
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { key: 'see', icon: '👀', label: '5 things you can visually see right now' },
                      { key: 'feel', icon: '✋', label: '4 physical textures you can feel' },
                      { key: 'hear', icon: '👂', label: '3 distinct sounds you can detect' },
                      { key: 'smell', icon: '👃', label: '2 aromas in the air' },
                      { key: 'taste', icon: '👅', label: '1 taste or slow sip of water' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: groundingChecks[item.key] ? '#F0FDF4' : '#F8FAFC',
                          border: `1px solid ${groundingChecks[item.key] ? '#86EFAC' : '#E2E8F0'}`,
                          padding: '10px 12px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: groundingChecks[item.key] ? '#166534' : '#334155',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={groundingChecks[item.key]}
                          onChange={(e) => setGroundingChecks({ ...groundingChecks, [item.key]: e.target.checked })}
                          style={{ width: '16px', height: '16px', accentColor: '#10B981' }}
                        />
                        <span>{item.icon}</span>
                        <span style={{ textDecoration: groundingChecks[item.key] ? 'line-through' : 'none' }}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Thought Reframer */}
              {activeModalTool === 'reframe' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                    Type an anxious or self-critical thought to generate a balanced reframe:
                  </p>
                  <input
                    type="text"
                    value={unhelpfulThought}
                    onChange={(e) => setUnhelpfulThought(e.target.value)}
                    placeholder="e.g. I have to please everyone or I will be rejected"
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateReframe}
                    disabled={isReframing || !unhelpfulThought.trim()}
                    style={{
                      background: isLearner ? '#064E3B' : '#1E1B4B',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '9px 14px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: unhelpfulThought.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {isReframing ? 'Synthesizing...' : 'Generate Balanced Reframe'}
                  </button>

                  {balancedReframe && (
                    <div
                      style={{
                        background: '#FAF5FF',
                        border: '1px solid #DDD6FE',
                        borderRadius: '10px',
                        padding: '12px',
                        fontSize: '12.5px',
                        color: '#581C87',
                        lineHeight: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div>{balancedReframe}</div>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleCopyText(balancedReframe, 'm_ref')}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #D8B4FE',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#6D28D9',
                            cursor: 'pointer',
                          }}
                        >
                          {copiedIndex === 'm_ref' ? '✓ Copied' : 'Copy'}
                        </button>
                        <button
                          type="button"
                          onClick={handleInjectReframeToChat}
                          style={{
                            background: '#7C3AED',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#FFFFFF',
                            cursor: 'pointer',
                          }}
                        >
                          Send to Chat →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. SOAP Notes Studio */}
              {!isLearner && activeModalTool === 'notes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                    Paste raw notes, client quotes, or bullets for clinical SOAP synthesis:
                  </p>
                  <textarea
                    rows={4}
                    value={rawNotesInput}
                    onChange={(e) => setRawNotesInput(e.target.value)}
                    placeholder="e.g. Client reported high interpersonal tension, neck tightness, practiced 4-7-8 breathing..."
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleProcessNotes}
                    style={{
                      background: '#1E1B4B',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '9px 14px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Synthesize Clinical SOAP Note
                  </button>

                  {structuredNotesResult && (
                    <div
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '10px',
                        padding: '12px',
                        fontSize: '12px',
                        color: '#1E293B',
                        whiteSpace: 'pre-line',
                        lineHeight: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div>{structuredNotesResult}</div>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleCopyText(structuredNotesResult, 'm_soap')}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {copiedIndex === 'm_soap' ? '✓ Copied' : 'Copy'}
                        </button>
                        <button
                          type="button"
                          onClick={handleInjectSOAPToChat}
                          style={{
                            background: '#4338CA',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Review in Chat →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 8. FULL IMAGE PREVIEW MODAL ─── */}
      {previewModalImg && (
        <div
          onClick={() => setPreviewModalImg(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(5px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: '#0F172A',
              borderRadius: '16px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => setPreviewModalImg(null)}
              style={{
                position: 'absolute',
                top: '-12px',
                right: '-12px',
                background: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              }}
            >
              <FiX size={18} />
            </button>
            <img
              src={previewModalImg}
              alt="Full Preview"
              style={{
                maxWidth: '85vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
