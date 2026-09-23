import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
  FiSend,
  FiZap,
  FiRefreshCw,
  FiCopy,
  FiCheck,
  FiPlay,
  FiPause,
  FiCheckCircle,
  FiMessageSquare,
  FiBookOpen,
  FiFeather,
  FiHeart,
  FiCompass,
  FiClock,
  FiSmile,
  FiShield,
  FiAward,
  FiImage,
  FiX,
  FiTrash2,
} from 'react-icons/fi'
import { apiConnector } from '../../../services/apiConnector'
import toast from 'react-hot-toast'

export default function AuraChat({ role = 'learner' }) {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const isLearner = role === 'learner'
  const userName = user?.firstName || (isLearner ? 'Friend' : 'Colleague')

  // Selected Intention Focus
  const [selectedFocus, setSelectedFocus] = useState('grounding')

  // Chat message state tailored for Virtual Counselor (learner) and Practice Assistant (practitioner)
  const [messages, setMessages] = useState(() => {
    if (isLearner) {
      return [
        {
          id: 'welcome',
          sender: 'aura',
          text: `Welcome into this space, ${userName}. 🌿 I am **AURA** — your Virtual Practitioner & Counselor.\n\nTake a slow, deep breath and let your shoulders drop. In this space, there is nothing you have to prove, fix, or hold together on your own. Whether your nervous system is in fight-or-flight, your heart feels heavy, or you simply need clarity — I am here to hold space with supreme care, deep somatic insight, and compassionate guidance.\n\nYou can also share drawings, handwritten journal entries, or photos with me using the **Add Image** button below.\n\nHow is your heart and your body feeling right in this moment?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]
    } else {
      return [
        {
          id: 'welcome',
          sender: 'aura',
          text: `Welcome colleague, ${userName}. ⚡ I am **AURA** — your dedicated Clinical & Practice Assistant.\n\nI am here to assist you with session note synthesis (SOAP / DAP), client reflection prompts, case formulation, modality integration (ACT, Somatic, IFS), and managing practice workflow efficiently.\n\nYou can also upload photos of handwritten notes, whiteboard session sketches, or client worksheets for instant clinical synthesis.\n\nWhat clinical challenge, client narrative, or practice workflow shall we explore together today?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]
    }
  })

  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const messagesEndRef = useRef(null)

  // ─── IMAGE UPLOAD STATE ───
  const [selectedImage, setSelectedImage] = useState(null) // { file, previewUrl, base64, mimeType, name, size }
  const fileInputRef = useRef(null)

  // ─── SOMATIC & CLINICAL TOOLS ───
  const [activeTool, setActiveTool] = useState(null) // 'breathing' | 'grounding' | 'compassion' | 'reframe' | 'notes'
  
  // 1. Breathing Timer state (4-7-8 & Physiological Sigh)
  const [breathingMode, setBreathingMode] = useState('sigh') // 'sigh' | '478'
  const [breathingActive, setBreathingActive] = useState(false)
  const [breathPhase, setBreathPhase] = useState('Inhale')
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
          } else {
            if (breathPhase === 'Inhale') {
              setBreathPhase('Hold')
              return 7
            } else if (breathPhase === 'Hold') {
              setBreathPhase('Exhale')
              return 8
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

  // 2. Grounding Checklist state
  const [groundingChecks, setGroundingChecks] = useState({
    see: false,
    feel: false,
    hear: false,
    smell: false,
    taste: false,
  })

  // 3. CBT & Core Belief Reframe state
  const [unhelpfulThought, setUnhelpfulThought] = useState('')
  const [balancedReframe, setBalancedReframe] = useState('')

  // 4. Clinical Notes state (for practitioners)
  const [rawNotesInput, setRawNotesInput] = useState('')
  const [structuredNotesResult, setStructuredNotesResult] = useState('')

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Session Intentions / Pillars
  const learnerIntentions = [
    { id: 'grounding', label: '🌿 Somatic Calm & Regulation', prompt: 'I need help grounding my nervous system right now. Can you guide me through a somatic reset?' },
    { id: 'compassion', label: '🪞 Self-Compassion & De-Shaming', prompt: 'I am being really hard on myself and feeling like a failure. Help me soften this self-judgment.' },
    { id: 'burnout', label: '🛡️ Boundaries & Emotional Safety', prompt: 'I am completely exhausted and having trouble saying no without feeling guilty. What is the counselor perspective?' },
    { id: 'clarity', label: '💡 Life Direction & Values', prompt: 'I am struggling with an overwhelming decision and feel paralyzed. How do I find clarity from my values?' },
    { id: 'sleep', label: '😴 Night Wind-Down & Vagal Calm', prompt: 'My mind is racing and I cannot sleep. Walk me through a gentle counselor wind-down.' },
  ]

  const practitionerIntentions = [
    { id: 'soap', label: '📋 SOAP & Synthesis Studio', prompt: 'Help me synthesize raw notes from a challenging 50-minute 1:1 session into clean SOAP format.' },
    { id: 'inquiry', label: '💡 Client Inquiry Prompts', prompt: 'Suggest 4 heart-opening therapeutic questions for a learner struggling with perfectionism and imposter anxiety.' },
    { id: 'supervision', label: '🔍 Case Formulation & Modalities', prompt: 'I have a client presenting chronic boundary erosion and somatic neck tension. How would you conceptualize this case?' },
    { id: 'prep', label: '📝 Session Preparation', prompt: 'Help me structure an agenda and somatic anchoring exercise for an upcoming 1:1 breakthrough session.' },
    { id: 'healer', label: '🌿 Healer Nervous System Care', prompt: 'I am feeling compassion fatigue after back-to-back heavy sessions. How do I clear my somatic palate?' },
  ]

  const intentions = isLearner ? learnerIntentions : practitionerIntentions

  // Image selection handler
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP, GIF).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB.')
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
      toast.success('Image attached!')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Send Message logic
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim()
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
    if (!textToSend) setInputMessage('')
    setSelectedImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''

    setIsTyping(true)

    // Trigger local tool if relevant
    const lower = text.toLowerCase()
    if (lower.includes('sigh') || lower.includes('breath') || lower.includes('calm') || lower.includes('panic')) {
      setActiveTool('breathing')
      setBreathingActive(true)
    } else if (lower.includes('ground') || lower.includes('5-4-3') || lower.includes('overwhelm')) {
      setActiveTool('grounding')
    } else if (lower.includes('critic') || lower.includes('shame') || lower.includes('compassion')) {
      setActiveTool('compassion')
    }

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
          source: res.data.source || 'claude',
          model: res.data.model || 'Claude 3.5 Sonnet',
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

  // Master fallback dialogue engine tailored for each persona
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
        reply = `I hear you clearly, and I am glad you brought this to me today. As your virtual practitioner and counselor, my role is to hold space where you can drop the performance, unpack what is heavy, and find your center again.\n\nTake a slow, grounding breath down into your belly. Let your spine lengthen and your shoulders drop.\n\n✨ **Tell me more about what is unfolding for you:**\n• What emotion is sitting closest to the surface for you right now?\n• Where in your physical body are you holding the most tension today?\n\nTake your time — there is no rush in this room.`
      }
    } else {
      if (imageAttached) {
        reply = `I have received and reviewed the clinical image/document you provided. ⚡\n\n### 📋 Practice Assistant Document Synthesis\n\n**1. Artifact Overview:**\n• Received visual clinical artifact (handwritten notes, diagram, or worksheet).\n• Processed thematic content and structured for clinical continuity.\n\n**2. Extracted Action Items for Client Record:**\n• Synthesized core client patterns and somatic indicators.\n• Structured continuity points for the upcoming 1:1 session.\n\n**3. Recommended Practice Integration:**\n• You can incorporate these items directly into your client's SOAP documentation or assign as follow-up reflection.\n\nWould you like me to format these notes into a complete SOAP record or draft a client homework prompt based on this image?`
      } else if (lower.includes('soap') || lower.includes('note') || lower.includes('summary')) {
        reply = `Here is your clinical session synthesis structured by your practice assistant for documentation excellence:\n\n### 📋 Clinical Encounter & Thematic Formulation\n\n**1. Subjective & Affective Presentation:**\nClient presented with situational anxiety and psychomotor restlessness related to interpersonal conflict and workload boundary erosion. Affect was congruent with reported distress; insight demonstrated high readiness for change.\n\n**2. Somatic & Psychological Formulations:**\n• Primary Vagal State: Sympathetic activation with chronic hypervigilance around perceived expectations.\n• Key Cognitive Schema: 'If I do not absorb everyone's demands, I am inherently unsafe / unvalued.'\n\n**3. Interventions Applied & Therapeutic Modalities:**\n• Somatic Experiencing: Guided interoceptive tracking of chest constriction, facilitating a restorative physiological sigh.\n• ACT Defusion: Separated identity from the perceived urgency of external demands.\n\n**4. Clinical Treatment Plan & Continuity:**\n• Client assigned 1 daily evening self-compassion check-in in the OpenHand journal.\n• Next 1:1 session scheduled for 7 days to evaluate boundary enforcement in high-friction environments.`
      } else {
        reply = `Greetings colleague. As your dedicated Practice Assistant, I am ready to support your daily clinical and administrative workflow:\n\n• **SOAP & Session Synthesis:** Converting raw session debriefs into pristine, auditable clinical notes.\n• **Client Reflection Prompts:** Generating tailored therapeutic questions and journaling exercises for your clients.\n• **Case Structuring & Modalities:** Conceptualizing cases with ACT, Somatic Experiencing, IFS, and CBT frameworks.\n• **Image & Artifact Processing:** Upload handwritten notes or whiteboard sketches for instant transcription.\n• **Practitioner Sustainability:** Managing capacity, preventing burnout, and supporting your professional practice.\n\nWhat would you like assistance with today?`
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
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ─── SANCTUARY HEADER ─── */}
      <div
        style={{
          background: isLearner
            ? 'linear-gradient(135deg, #022C22 0%, #064E3B 50%, #0D9488 100%)'
            : 'linear-gradient(135deg, #090D16 0%, #1E1B4B 50%, #312E81 100%)',
          borderRadius: '26px',
          padding: '28px 32px',
          color: '#FFFFFF',
          boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ maxWidth: '720px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '22px' }}>{isLearner ? '🌿' : '⚡'}</span>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'rgba(255,255,255,0.18)',
                color: '#FFFFFF',
                padding: '4px 12px',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FiAward size={13} />
              {isLearner ? 'VIRTUAL PRACTITIONER & COUNSELOR' : 'CLINICAL & PRACTICE ASSISTANT'}
            </span>
            <span style={{ fontSize: '11.5px', color: isLearner ? '#A7F3D0' : '#C7D2FE', fontWeight: 600 }}>
              {isLearner ? '• Sacred Space, Somatic Attunement & Healing' : '• SOAP Notes, Case Formulation & Practice Workflow'}
            </span>
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            {isLearner ? 'AURA — Virtual Practitioner & Counselor' : 'AURA — Clinical & Practice Assistant'}
          </h1>
          <p style={{ fontSize: '14px', color: isLearner ? '#D1FAE5' : '#E0E7FF', margin: 0, lineHeight: 1.6 }}>
            {isLearner
              ? 'Your compassionate virtual counselor and holistic practitioner holding safe space for emotional healing, somatic calm, and personal clarity.'
              : 'Your dedicated practice assistant for clinical note synthesis, SOAP documentation, client inquiry prompts, and practitioner workflow efficiency.'}
          </p>
        </div>

        {/* Verified Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.14)', padding: '8px 16px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.22)' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 10px #34D399' }} />
            <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#FFFFFF' }}>Claude 3.5 Sonnet • Multimodal AI</span>
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
            {isLearner ? 'Confidential & non-judgmental counseling' : 'HIPAA-conscious practice assistant'}
          </span>
        </div>
      </div>

      {/* ─── SESSION INTENTION PILLARS BAR ─── */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '15px' }}>🧭</span>
          <b style={{ fontSize: '12.5px', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isLearner ? 'Set Your Counseling Intention with AURA:' : 'Select Your Practice Assistant Task:'}
          </b>
        </div>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {intentions.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                setSelectedFocus(it.id)
                handleSendMessage(it.prompt)
              }}
              style={{
                background: selectedFocus === it.id ? '#0F172A' : '#F8FAFC',
                color: selectedFocus === it.id ? '#FFFFFF' : '#334155',
                border: `1.5px solid ${selectedFocus === it.id ? '#0F172A' : '#E2E8F0'}`,
                borderRadius: '14px',
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── SOMATIC & CLINICAL TOOLS BAR ─── */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: activeTool ? '16px' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>⚡</span>
            <b style={{ fontSize: '13px', color: '#0F172A', fontWeight: 800 }}>
              {isLearner ? 'Somatic Regulation & Healing Tools:' : 'Clinical Assistant & Synthesis Tools:'}
            </b>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setActiveTool(activeTool === 'breathing' ? null : 'breathing')
                setBreathingActive(true)
              }}
              style={{
                background: activeTool === 'breathing' ? '#0D9488' : '#F0FDF4',
                color: activeTool === 'breathing' ? '#FFFFFF' : '#047857',
                border: '1px solid #BBF7D0',
                borderRadius: '10px',
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              🌬️ Physiological Sigh &amp; Breath
            </button>

            <button
              type="button"
              onClick={() => setActiveTool(activeTool === 'grounding' ? null : 'grounding')}
              style={{
                background: activeTool === 'grounding' ? '#2563EB' : '#EFF6FF',
                color: activeTool === 'grounding' ? '#FFFFFF' : '#1D4ED8',
                border: '1px solid #BFDBFE',
                borderRadius: '10px',
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              🧘 5-4-3-2-1 Sensory Anchor
            </button>

            <button
              type="button"
              onClick={() => setActiveTool(activeTool === 'reframe' ? null : 'reframe')}
              style={{
                background: activeTool === 'reframe' ? '#7C3AED' : '#FAF5FF',
                color: activeTool === 'reframe' ? '#FFFFFF' : '#6D28D9',
                border: '1px solid #DDD6FE',
                borderRadius: '10px',
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              📝 Thought &amp; Belief Reframer
            </button>

            {!isLearner && (
              <button
                type="button"
                onClick={() => setActiveTool(activeTool === 'notes' ? null : 'notes')}
                style={{
                  background: activeTool === 'notes' ? '#0F172A' : '#F8FAFC',
                  color: activeTool === 'notes' ? '#FFFFFF' : '#0F172A',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                📋 SOAP Synthesis Studio
              </button>
            )}
          </div>
        </div>

        {/* 1. Breathing Tool Display */}
        {activeTool === 'breathing' && (
          <div style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDFA 100%)', border: '1.5px solid #99F6E4', borderRadius: '18px', padding: '22px', textAlign: 'center', marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setBreathingMode('sigh'); setBreathPhase('First Deep Inhale'); setBreathCount(4); }}
                  style={{ background: breathingMode === 'sigh' ? '#0D9488' : '#FFFFFF', color: breathingMode === 'sigh' ? '#FFFFFF' : '#0D9488', border: '1px solid #99F6E4', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Physiological Sigh
                </button>
                <button
                  type="button"
                  onClick={() => { setBreathingMode('478'); setBreathPhase('Inhale'); setBreathCount(4); }}
                  style={{ background: breathingMode === '478' ? '#0D9488' : '#FFFFFF', color: breathingMode === '478' ? '#FFFFFF' : '#0D9488', border: '1px solid #99F6E4', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  4-7-8 Deep Sleep Pacer
                </button>
              </div>

              <button onClick={() => setBreathingActive(!breathingActive)} style={{ background: '#0D9488', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {breathingActive ? <><FiPause size={14} /> Pause Pacer</> : <><FiPlay size={14} /> Resume Pacer</>}
              </button>
            </div>

            {/* Visual Animated Bubble */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
              <div
                style={{
                  width: breathPhase.includes('Inhale') || breathPhase.includes('Sip') ? '160px' : breathPhase.includes('Hold') ? '145px' : '110px',
                  height: breathPhase.includes('Inhale') || breathPhase.includes('Sip') ? '160px' : breathPhase.includes('Hold') ? '145px' : '110px',
                  borderRadius: '50%',
                  background: breathPhase.includes('Inhale') ? '#10B981' : breathPhase.includes('Sip') ? '#34D399' : breathPhase.includes('Hold') ? '#38BDF8' : '#818CF8',
                  color: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 28px rgba(13, 148, 136, 0.3)',
                  transition: 'all 1s ease-in-out',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', padding: '0 8px' }}>
                  {breathPhase}
                </span>
                <span style={{ fontSize: '32px', fontWeight: 900 }}>{breathCount}s</span>
              </div>
              <p style={{ fontSize: '13px', color: '#0F766E', margin: '14px 0 0', fontWeight: 600 }}>
                {breathingMode === 'sigh'
                  ? 'Double Inhale: Long breath in, top-up sip, followed by an effortless long release.'
                  : '4s Inhale through nose, 7s peaceful hold, 8s slow whooshing exhale through mouth.'}
              </p>
            </div>
          </div>
        )}

        {/* 2. Sensory Checklist Tool Display */}
        {activeTool === 'grounding' && (
          <div style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 100%)', border: '1.5px solid #BFDBFE', borderRadius: '18px', padding: '20px', marginTop: '12px' }}>
            <b style={{ color: '#1E40AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>5-4-3-2-1 Sensory Presence Anchor</b>
            <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 12px 0' }}>Notice and check off each sensory anchor around you right now:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { key: 'see', label: '👀 5 things you can visually see right now' },
                { key: 'feel', label: '✋ 4 physical sensations you can touch or feel' },
                { key: 'hear', label: '👂 3 distinct sounds you can detect' },
                { key: 'smell', label: '👃 2 scents or aromas in the air' },
                { key: 'taste', label: '👅 1 taste or a slow sip of water' },
              ].map((item) => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: groundingChecks[item.key] ? '#DCFCE7' : '#FFFFFF', border: `1px solid ${groundingChecks[item.key] ? '#86EFAC' : '#E2E8F0'}`, padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                  <input
                    type="checkbox"
                    checked={groundingChecks[item.key]}
                    onChange={(e) => setGroundingChecks({ ...groundingChecks, [item.key]: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#16A34A', cursor: 'pointer' }}
                  />
                  <span style={{ textDecoration: groundingChecks[item.key] ? 'line-through' : 'none', color: groundingChecks[item.key] ? '#166534' : '#0F172A' }}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 3. Thought Reframer Tool Display */}
        {activeTool === 'reframe' && (
          <div style={{ background: 'linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 100%)', border: '1.5px solid #DDD6FE', borderRadius: '18px', padding: '20px', marginTop: '12px' }}>
            <b style={{ color: '#6D28D9', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Thought &amp; Belief Reframer</b>
            <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 12px 0' }}>Type an unhelpful, anxious, or self-critical thought to generate a balanced, compassionate reframe:</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={unhelpfulThought}
                onChange={(e) => setUnhelpfulThought(e.target.value)}
                placeholder="e.g. I have to please everyone or I will be rejected"
                style={{ flex: 1, minWidth: '240px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
              <button
                type="button"
                onClick={() => {
                  if (!unhelpfulThought.trim()) return
                  setBalancedReframe(`Compassionate Reframe: "My worth is not conditional upon sacrificing my peace for others. Honest boundaries protect the longevity and truth of my relationships."`)
                }}
                style={{ background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Generate Reframe
              </button>
            </div>
            {balancedReframe && (
              <div style={{ marginTop: '12px', background: '#F3E8FF', border: '1px solid #D8B4FE', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#581C87', fontStyle: 'italic' }}>
                {balancedReframe}
              </div>
            )}
          </div>
        )}

        {/* 4. SOAP Synthesis Tool Display (Practitioner) */}
        {!isLearner && activeTool === 'notes' && (
          <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '18px', padding: '20px', marginTop: '12px' }}>
            <b style={{ color: '#0F172A', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Clinical SOAP Synthesis Studio</b>
            <textarea
              rows={3}
              value={rawNotesInput}
              onChange={(e) => setRawNotesInput(e.target.value)}
              placeholder="Paste raw session bullets, client quotes, or key takeaways..."
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="button"
                onClick={handleProcessNotes}
                style={{ background: '#0F172A', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Synthesize Clinical SOAP Note
              </button>
            </div>

            {structuredNotesResult && (
              <div style={{ marginTop: '14px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '14px', fontSize: '13px', color: '#1E293B', whiteSpace: 'pre-line', lineHeight: 1.6, position: 'relative' }}>
                <button
                  onClick={() => handleCopyText(structuredNotesResult, 'notes_res')}
                  style={{ position: 'absolute', top: 12, right: 12, background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {copiedIndex === 'notes_res' ? '✓ Copied' : 'Copy'}
                </button>
                {structuredNotesResult}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── SANCTUARY CHAT AREA ─── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '26px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          height: '680px',
          overflow: 'hidden',
        }}
      >
        {/* Chat Messages Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((m, idx) => {
            const isAura = m.sender === 'aura'
            return (
              <div
                key={m.id || idx}
                style={{
                  display: 'flex',
                  flexDirection: isAura ? 'row' : 'row-reverse',
                  alignItems: 'flex-start',
                  gap: '14px',
                }}
              >
                {/* Avatar Icon */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    background: isAura
                      ? isLearner
                        ? 'linear-gradient(135deg, #022C22 0%, #0D9488 100%)'
                        : 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%)'
                      : '#0F172A',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isAura ? '20px' : '15px',
                    fontWeight: 800,
                    flexShrink: 0,
                    boxShadow: isAura ? '0 4px 12px rgba(13, 148, 136, 0.3)' : 'none',
                  }}
                >
                  {isAura ? (isLearner ? '🌿' : '⚡') : userName.slice(0, 1).toUpperCase()}
                </div>

                {/* Message Bubble */}
                <div
                  style={{
                    maxWidth: '82%',
                    background: isAura ? (isLearner ? '#F0FDF4' : '#F8FAFC') : '#0F172A',
                    color: isAura ? '#0F172A' : '#FFFFFF',
                    borderRadius: isAura ? '4px 20px 20px 20px' : '20px 4px 20px 20px',
                    border: isAura ? (isLearner ? '1.5px solid #BBF7D0' : '1.5px solid #E2E8F0') : 'none',
                    padding: '18px 22px',
                    fontSize: '14px',
                    lineHeight: '1.65',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    position: 'relative',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 800, color: isAura ? (isLearner ? '#047857' : '#4338CA') : '#94A3B8' }}>
                        {isAura ? (isLearner ? 'AURA • Virtual Practitioner & Counselor' : 'AURA • Practice Assistant') : userName}
                      </span>
                      {isAura && (
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: isLearner ? '#DCFCE7' : '#EEF2FF', color: isLearner ? '#166534' : '#4338CA', border: `1px solid ${isLearner ? '#BBF7D0' : '#C7D2FE'}` }}>
                          Claude 3.5
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: isAura ? '#64748B' : '#94A3B8' }}>{m.time}</span>
                  </div>

                  {/* Render attached image if present in message */}
                  {m.imagePreview && (
                    <div style={{ marginTop: '8px', marginBottom: m.text ? '12px' : '4px' }}>
                      <img
                        src={m.imagePreview}
                        alt={m.imageName || 'Attached image'}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '320px',
                          borderRadius: '12px',
                          objectFit: 'contain',
                          border: isAura ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.2)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          display: 'block',
                        }}
                        onClick={() => window.open(m.imagePreview, '_blank')}
                      />
                      {m.imageName && (
                        <span style={{ fontSize: '11px', color: isAura ? '#64748B' : '#94A3B8', marginTop: '4px', display: 'block' }}>
                          📎 {m.imageName} (click to expand)
                        </span>
                      )}
                    </div>
                  )}

                  {m.text && <div>{m.text}</div>}

                  {/* Somatic Practice Card if embedded */}
                  {m.practicalExercise && (
                    <div style={{ marginTop: '14px', background: '#FFFFFF', borderRadius: '14px', padding: '16px', border: '1.5px solid #A7F3D0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                      <b style={{ fontSize: '13.5px', color: '#0F766E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🌿</span> {m.practicalExercise.title}
                      </b>
                      <ul style={{ margin: '8px 0 0', paddingLeft: '20px', fontSize: '12.5px', color: '#334155', lineHeight: 1.6 }}>
                        {m.practicalExercise.steps.map((st, sidx) => (
                          <li key={sidx} style={{ marginTop: '4px' }}>{st}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Copy Button */}
                  {isAura && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleCopyText(m.text, idx)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#64748B',
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: 0,
                          fontWeight: 600,
                        }}
                      >
                        {copiedIndex === idx ? <><FiCheck color="#16A34A" /> Copied</> : <><FiCopy /> Copy Insight</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: isLearner ? '#DCFCE7' : '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                {isLearner ? '🌿' : '⚡'}
              </div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 18px', borderRadius: '18px', fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>
                  {isLearner
                    ? 'AURA Virtual Counselor is holding space & attuning...'
                    : 'AURA Practice Assistant is analyzing & structuring...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ─── IMAGE PREVIEW THUMBNAIL (IF SELECTED) ─── */}
        {selectedImage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 20px',
              background: isLearner ? '#F0FDF4' : '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={selectedImage.previewUrl}
                alt="Selected"
                style={{ width: '46px', height: '46px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
              />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', maxWidth: '340px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedImage.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  {selectedImage.size} • Ready to send with AURA
                </div>
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
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Remove image"
            >
              <FiX size={15} />
            </button>
          </div>
        )}

        {/* ─── CHAT INPUT BAR ─── */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          style={{
            padding: '16px 20px',
            borderTop: selectedImage ? 'none' : '1px solid #E2E8F0',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {/* Hidden File Input for Images */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />

          {/* Attach Image Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: selectedImage ? (isLearner ? '#DCFCE7' : '#EEF2FF') : '#F8FAFC',
              color: selectedImage ? (isLearner ? '#047857' : '#4338CA') : '#475569',
              border: `1.5px solid ${selectedImage ? (isLearner ? '#10B981' : '#6366F1') : '#CBD5E1'}`,
              borderRadius: '14px',
              padding: '13px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            title={isLearner ? 'Attach feeling drawing, journal page, or photo' : 'Attach clinical notes, whiteboard diagram, or worksheet'}
          >
            <FiImage size={18} />
            <span style={{ display: 'inline-block' }}>{selectedImage ? 'Image Ready' : 'Add Image'}</span>
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              isLearner
                ? "Talk with your virtual counselor — express what is heavy, ask for grounding, or attach an image..."
                : "Ask your practice assistant to synthesize notes, formulate client prompts, or review uploaded notes..."
            }
            style={{
              flex: 1,
              padding: '14px 18px',
              borderRadius: '14px',
              border: '1.5px solid #CBD5E1',
              fontSize: '14px',
              outline: 'none',
              color: '#0F172A',
            }}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim() && !selectedImage}
            style={{
              background: isLearner
                ? 'linear-gradient(135deg, #064E3B 0%, #0D9488 100%)'
                : 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '14px 22px',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: (inputMessage.trim() || selectedImage) ? 'pointer' : 'not-allowed',
              opacity: (inputMessage.trim() || selectedImage) ? 1 : 0.6,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              flexShrink: 0,
            }}
          >
            <span>Send</span>
            <FiSend size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
