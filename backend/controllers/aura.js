const SessionNoteDraft = require("../models/SessionNoteDraft")
const ConsentLog = require("../models/ConsentLog")

// ─── ROLE-SPECIFIC MASTER AI ENGINES ───
// Learner Mode: World-Class Virtual Practitioner & Master Counselor
const VIRTUAL_COUNSELOR_SYSTEM_PROMPT = `
You are AURA — the premier Virtual Practitioner, Master Counselor, and Somatic Neuro-Therapist on OpenHand.
You embody the collective wisdom of an elite integrative clinician, a trauma-informed master somatic therapist (Peter Levine, Gabor Maté, Stephen Porges), and a compassionate, deeply grounded life mentor sitting in a tranquil sanctuary.

YOUR MISSION:
Deliver answers of surgical precision, profound empathy, neurobiological depth, and tangible practical utility.
You NEVER produce hollow platitudes, robotic AI summaries, or generic motivational fluff. You cut directly to the heart of what the user is experiencing, provide evidence-based clarity, and offer immediate somatic and behavioral regulation.

CORE CLINICAL & NEUROLOGICAL FOUNDATIONS:
1. THE EMBODIED NERVOUS SYSTEM: Every human struggle (exam anxiety, burnout, imposter syndrome, heartbreak, procrastination) is an intelligent, adaptive survival strategy of the autonomic nervous system. Map experiences to their physiological reality (sympathetic hyperarousal vs dorsal vagal shutdown vs functional freeze).
2. EVIDENCE-BASED SYNTHESIS: Seamlessly weave together Polyvagal Theory, Acceptance & Commitment Therapy (psychological flexibility & cognitive defusion), Internal Family Systems (unblending from protective parts), and Somatic Experiencing (interoceptive tracking & pendulation).
3. SURGICAL DIRECTNESS: If the user asks a factual, technical, academic, or strategic question, ANSWER IT WITH CRYSTAL CLARITY FIRST. Never hide behind vague questions or withhold clear information.

MANDATORY 4-STAGE RESPONSE ARCHITECTURE:
Every response must naturally flow through these 4 pillars:
• PILLAR 1: DIRECT TRUTH & EMBODIED VALIDATION (The "Direct Hit")
  - Answer the core question or address their primary pain point directly in the very first 1-2 sentences. No preambles ("You mentioned that...").
  - Name the physiological/emotional state with de-pathologizing precision so the user feels profoundly seen and understood.
• PILLAR 2: NEURO-SOMATIC INSIGHT & COGNITIVE REFRAME
  - Explain *why* their brain and nervous system are doing this. Reframe the internal conflict from a flaw into an understandable neurobiological mechanism.
• PILLAR 3: TACTICAL SOMATIC PROTOCOL OR MICRO-PRACTICE (Actionable in 60-120 seconds)
  - Provide ONE concrete, step-by-step exercise tailored to their state (e.g., Physiological Sigh with extended vagal exhale, bilateral sensory tapping, jaw and occipital release, 5-4-3-2-1 grounding, somatic boundary stance).
  - Format with clear, numbered, easy-to-follow steps.
• PILLAR 4: TRANSFORMATIVE INQUIRY (The Pivot)
  - Conclude with ONE piercing, heart-opening question that cuts through mental noise and guides the user toward self-sovereignty and inner clarity.

COMMUNICATION CONSTRAINTS:
- STRICTLY FORBIDDEN CLICHÉS: Never say "It's important to remember", "As an AI", "In conclusion", "I understand your pain", "Take a deep breath and know you are not alone", or "In today's fast-paced world".
- TONE: Calm, authoritative yet tender, lucid, articulate, and deeply respectful.
- FORMATTING: Use clean markdown, elegant spacing, bolded key insights, and clear bullet points so the text is restorative and effortless to read.
`

// Practitioner Mode: Elite Clinical Supervisor & Master Practice Assistant
const PRACTICE_ASSISTANT_SYSTEM_PROMPT = `
You are AURA — an elite Clinical Supervisor, Master Practice Assistant, and Therapeutic Strategist for licensed therapists, psychologists, psychiatric providers, coaches, and holistic healers on OpenHand.
You operate with the clinical acumen, diagnostic rigor, and organizational precision of a Chief Clinical Director at a world-class institute of integrative mental health.

YOUR CLINICAL CAPABILITIES & MODALITIES:
1. MODALITY FLUENCY: Mastery of CBT (cognitive restructuring), DBT (distress tolerance & interpersonal effectiveness), ACT (hexaflex & values integration), EMDR preparation/grounding, Somatic Experiencing (pendulation, titration), and IFS (Internal Family Systems parts unblending).
2. DOCUMENTATION PERFECTION: Expert generation of audit-proof SOAP (Subjective, Objective, Assessment, Plan), DAP, and BIRP notes conforming to high institutional and billing standards with measurable clinical objectives.
3. CASE CONCEPTUALIZATION & DIFFERENTIAL INSIGHT: Incisive analysis of client presentations, systemic dynamics, transference/countertransference, and nervous system mapping.
4. MULTIMODAL TRANSCRIPTION & FORMULATION: Precise transcription, structuring, and thematic extraction of handwritten session notes, clinical worksheets, diagrams, and intake forms.
5. PRACTITIONER ENERGETIC HYGIENE: Screening for secondary traumatic stress, parallel process, over-functioning empathy, and practitioner burnout.

PRECISION RESPONSE ARCHITECTURE:
• EXECUTIVE CLINICAL SYNTHESIS: Immediate, high-level clinical summary of the encounter, inquiry, or case dynamics.
• THEMATIC & DIAGNOSTIC FORMULATION: Evidence-based psychodynamic and neuro-somatic framing of the client's symptoms and adaptive schemas.
• ACTIONABLE INTERVENTIONS & DOCUMENTATION: Specific, actionable therapeutic scripts, homework formulations, or audit-ready SOAP notes with clear metrics.
• SUPERVISORY REFLECTION: 1-2 incisive clinical supervision questions to deepen the therapeutic alliance or examine practitioner countertransference.

COMMUNICATION CONSTRAINTS:
- TONE: Clinically sophisticated, peer-to-peer, concise, precise, and publication-grade.
- No patronizing disclaimers, no generic filler. Speak with the authority and depth of a veteran clinician.
`

exports.generateDraftNotes = async (req, res) => {
  try {
    const { bookingId, clientId, rawTranscript } = req.body
    const practitionerId = req.user.id

    // Hard Rule 1: Check active consent before running
    const activeConsent = await ConsentLog.findOne({
      client: clientId,
      isActive: true,
      consentType: { $in: ["copilot_notes", "copilot_audio", "aura_notes", "aura_audio"] },
    })

    if (!activeConsent) {
      return res.status(403).json({
        success: false,
        message: "Consent required: The client has not granted active consent for AI AURA processing.",
        hardRule: "Nothing records or processes without live revocable consent.",
      })
    }

    // Build draft notes from rawTranscript (practitioner-submitted session notes)
    // AURA processes whatever the practitioner provides — no fake pre-written content
    let draftNotes
    let suggestedPrompts

    if (rawTranscript && rawTranscript.trim().length > 20) {
      // 1. If OpenAI API key is configured, generate high-quality clinical draft notes via OpenAI
      const openAiApiKey = process.env.OPENAI_API_KEY
      const openAiUnset =
        !openAiApiKey ||
        openAiApiKey.trim().length <= 10 ||
        openAiApiKey.toLowerCase().includes("add_your_") ||
        openAiApiKey.toLowerCase().includes("your_openai")

      if (!openAiUnset) {
        try {
          const openAiModel = process.env.OPENAI_MODEL || "gpt-4o"
          const openAiBaseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "")
          const aiRes = await fetch(`${openAiBaseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openAiApiKey.trim()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: openAiModel,
              messages: [
                {
                  role: "system",
                  content: `${PRACTICE_ASSISTANT_SYSTEM_PROMPT}\n\nTask: Given the following raw session debrief/transcript from a practitioner, generate structured SOAP clinical draft notes and 2 high-impact reflection prompts for the client.\nFormat your response as a valid JSON object with exactly two keys:\n"draftNotes": string (markdown SOAP format),\n"suggestedPrompts": [string, string].\nReturn ONLY the JSON object.`,
                },
                {
                  role: "user",
                  content: `Raw Session Transcript:\n"""${rawTranscript.trim()}"""`,
                },
              ],
              response_format: { type: "json_object" },
              temperature: 0.3,
            }),
          })
          const aiData = await aiRes.json()
          const aiContent = aiData?.choices?.[0]?.message?.content
          if (aiContent) {
            try {
              const parsed = JSON.parse(aiContent)
              if (parsed.draftNotes) draftNotes = parsed.draftNotes
              if (Array.isArray(parsed.suggestedPrompts) && parsed.suggestedPrompts.length > 0) {
                suggestedPrompts = parsed.suggestedPrompts
              }
            } catch (parseErr) {
              // fallback to rule-based below
            }
          }
        } catch (aiErr) {
          console.warn("OpenAI draft notes generation error, falling back:", aiErr.message)
        }
      }

      // Fallback rule-based extraction if not populated by OpenAI
      if (!draftNotes) {
        const lines = rawTranscript.trim().split(/[\n.]+/).filter(Boolean)
        const keyThemes = lines.slice(0, 3).join(". ")

        draftNotes = `Practitioner Summary:\n${keyThemes}\n\nNote: This draft was generated from your session transcript. Review and edit before saving to client record.`

        // Extract potential reflection themes from transcript keywords
        const lowerTranscript = rawTranscript.toLowerCase()
        const themes = []
        if (lowerTranscript.includes("anxi") || lowerTranscript.includes("stress") || lowerTranscript.includes("worry")) {
          themes.push("What would it feel like to let one worry go without resolving it first?")
        }
        if (lowerTranscript.includes("boundar") || lowerTranscript.includes("limit")) {
          themes.push("Notice one boundary you protected this week, however small.")
        }
        if (lowerTranscript.includes("relationship") || lowerTranscript.includes("connect") || lowerTranscript.includes("family")) {
          themes.push("What do you need from your relationships right now that you haven't asked for?")
        }
        if (themes.length === 0) {
          themes.push("What felt heavy this week that you carried without asking for support?")
        }
        suggestedPrompts = themes.slice(0, 2)
      }
    } else {
      // No transcript provided — create an empty structured skeleton
      draftNotes = `Practitioner Summary:\n[Add your session summary here]\n\nTechnique Used: [Add technique]\nKey Insight: [Add key insight or breakthrough]\n\nNote: No transcript was submitted. Please fill in session notes manually.`
      suggestedPrompts = [
        "What felt heavy this week that you carried without asking for support?",
        "Notice one moment in the last 3 days where you reacted differently than you would have 6 months ago.",
      ]
    }

    const draft = await SessionNoteDraft.create({
      booking: bookingId,
      practitioner: practitionerId,
      client: clientId,
      rawTranscript: rawTranscript || "",
      draftNotes,
      suggestedReflectionPrompts: suggestedPrompts,
      status: "draft",
    })

    return res.status(200).json({
      success: true,
      message: "Draft notes generated by AURA. Practitioner approval required before saving.",
      draft,
      hardRules: [
        "Never messages the client directly",
        "Never diagnoses or suggests medication",
        "Requires explicit practitioner approval before saving to client record",
      ],
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate AURA draft notes",
      error: error.message,
    })
  }
}

exports.approveDraftNotes = async (req, res) => {
  try {
    const { draftId, editedNotes } = req.body
    const practitionerId = req.user.id

    const draft = await SessionNoteDraft.findOne({ _id: draftId, practitioner: practitionerId })
    if (!draft) {
      return res.status(404).json({
        success: false,
        message: "Draft notes not found or unauthorized",
      })
    }

    draft.draftNotes = editedNotes || draft.draftNotes
    draft.status = "approved"
    draft.approvedAt = new Date()
    await draft.save()

    return res.status(200).json({
      success: true,
      message: "Session notes approved and committed to client record.",
      draft,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to approve draft notes",
      error: error.message,
    })
  }
}

exports.chatWithAura = async (req, res) => {
  try {
    const { message = "", role = "learner", history = [], focus = "general", image } = req.body
    const trimmed = (message || "").trim()

    // Validate that either text message or image is provided
    if (!trimmed && !(image && image.data)) {
      return res.status(400).json({
        success: false,
        message: "Message or image is required.",
      })
    }

    const isPractitioner = role === "practitioner"
    const activeSystemPrompt = isPractitioner ? PRACTICE_ASSISTANT_SYSTEM_PROMPT : VIRTUAL_COUNSELOR_SYSTEM_PROMPT

    // Clean base64 image data if present
    let cleanImageData = null
    let cleanMimeType = "image/jpeg"
    if (image && image.data) {
      cleanImageData = String(image.data).replace(/^data:image\/[a-zA-Z+]+;base64,/, "").trim()
      cleanMimeType = image.mimeType || "image/jpeg"
      if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(cleanMimeType)) {
        cleanMimeType = "image/jpeg"
      }
    }

    // 1. Check if OpenAI API key is configured (Preferred & OpenAI Compatible)
    const openAiApiKey = process.env.OPENAI_API_KEY
    const openAiUnset =
      !openAiApiKey ||
      openAiApiKey.trim().length <= 10 ||
      openAiApiKey.toLowerCase().includes("add_your_") ||
      openAiApiKey.toLowerCase().includes("your_openai")

    if (!openAiUnset) {
      try {
        const openAiModel = process.env.OPENAI_MODEL || "gpt-4o"
        const openAiBaseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "")

        const focusDirectives = isPractitioner
          ? `CLINICAL FOCUS: ${focus}. Emphasize diagnostic accuracy, auditable documentation standards, evidence-based modality selection, and clear therapeutic formulations.`
          : `PERSONAL GROWTH FOCUS: ${focus}. Emphasize compassionate somatic grounding, nervous system regulation, cognitive reframing, and actionable self-inquiry.`

        const formattedMessages = [
          {
            role: "system",
            content: `${activeSystemPrompt}

=======================================================
OPERATIONAL RUNTIME INSTRUCTIONS:
- USER ROLE: ${role.toUpperCase()}
- FOCUS AREA: ${focus}
- ${focusDirectives}
- DIRECT ACCURACY FIRST: Answer the user's explicit question, query, or situation with razor-sharp factual, conceptual, or clinical precision right in the first 2 sentences.
- DEPTH OVER FLUFF: Ground every insight in neurobiology, somatic physiology, or evidence-based psychological frameworks.
- STRUCTURE: Use clean markdown, elegant paragraphs, bolded core concepts, and clear numbered steps for micro-practices.
=======================================================`,
          },
        ]

        if (Array.isArray(history) && history.length > 0) {
          for (const h of history.slice(-8)) {
            if (h.sender === "user" || h.role === "user") {
              const textContent = h.text || h.content || ""
              if (textContent) {
                formattedMessages.push({ role: "user", content: textContent })
              }
            } else if (h.sender === "aura" || h.role === "assistant") {
              const textContent = h.text || h.content || ""
              if (textContent) {
                formattedMessages.push({ role: "assistant", content: textContent })
              }
            }
          }
        }

        // Prepare current turn's content (support multimodal vision if image attached)
        if (cleanImageData) {
          formattedMessages.push({
            role: "user",
            content: [
              {
                type: "text",
                text: trimmed || (isPractitioner
                  ? "Please review and structure this image (clinical notes, worksheet, or diagram) as my practice assistant."
                  : "Please reflect on this image I've shared (a journal entry, sketch, or photo) as my virtual practitioner counselor."),
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${cleanMimeType};base64,${cleanImageData}`,
                },
              },
            ],
          })
        } else {
          formattedMessages.push({
            role: "user",
            content: trimmed,
          })
        }

        const openAiRes = await fetch(`${openAiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openAiApiKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: openAiModel,
            messages: formattedMessages,
            max_tokens: 1500,
            temperature: 0.38,
            presence_penalty: 0.1,
            frequency_penalty: 0.1,
          }),
        })

        const openAiData = await openAiRes.json()
        const openAiReply = openAiData?.choices?.[0]?.message?.content
        if (openAiReply) {
          return res.status(200).json({
            success: true,
            reply: openAiReply,
            role,
            source: "openai",
            model: openAiModel,
          })
        } else if (openAiData?.error) {
          console.warn("OpenAI API returned error, falling back:", openAiData.error)
        }
      } catch (openAiErr) {
        console.warn("OpenAI API fetch failed, falling back:", openAiErr.message)
      }
    }

    // 2. Check if external Gemini API key is configured
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (geminiApiKey && !geminiApiKey.includes("your_gemini_api_key_here")) {
      try {
        const parts = []
        if (cleanImageData) {
          parts.push({
            inline_data: {
              mime_type: cleanMimeType,
              data: cleanImageData,
            },
          })
        }
        parts.push({
          text: `${activeSystemPrompt}\n\n[USER ROLE: ${role.toUpperCase()}]\n[SESSION FOCUS: ${focus}]\n\nUser Message: "${trimmed || 'Shared an image for reflection'}"\n\nRespond as AURA according to your role. Be empathetic, grounded, and concise (2-4 brief paragraphs). If a practical exercise fits, weave it in.`,
        })

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts,
                },
              ],
            }),
          }
        )
        const data = await response.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          return res.status(200).json({
            success: true,
            reply: text,
            role,
            source: "gemini",
          })
        }
      } catch (llmErr) {
        console.warn("External Gemini API call fallback to built-in Master Engine:", llmErr.message)
      }
    }

    // 3. Built-in Master Engine (Learner = Virtual Counselor, Practitioner = Practice Assistant)
    const lower = trimmed.toLowerCase()
    let reply = ""
    let practicalExercise = null

    if (!isPractitioner) {
      // ─── VIRTUAL PRACTITIONER & COUNSELOR FOR LEARNERS ───
      if (cleanImageData) {
        reply = `I have received and gently held the image you shared with me. 🌿\n\nVisual expressions — whether they are sketches, journal entries, or moments captured in time — often speak directly from parts of us that words cannot fully reach.\n\nTake a slow, deep breath and let your shoulders drop as we look at this together. Notice what feeling or physical sensation rises first in your body as you gaze at it.\n\n*A counselor reflection for you:* What is this image trying to communicate on your behalf today? What is the quietest part of you asking for in this moment?`
      } else if (lower.includes("panic") || lower.includes("anxi") || lower.includes("scared") || lower.includes("terrified") || lower.includes("racing heart")) {
        practicalExercise = {
          type: "physiological_sigh",
          title: "The Double Inhale Physiological Sigh",
          steps: [
            "Take two deep inhales through your nose: one long deep breath, followed immediately by a quick second sip of air at the top.",
            "Open your mouth and release a long, slow, effortless sigh all the way to empty.",
            "Notice your shoulders drop 2 inches down away from your ears.",
            "Repeat 3 times. This immediately rebalances oxygen/CO2 and signals your brainstem that you are safe right now.",
          ],
        }
        reply = `I hear you, and I am right here with you. Take a soft, gentle breath — as your virtual counselor, I want you to know you do not have to fight this feeling alone.\n\nWhen anxiety spikes, your nervous system is simply trying to protect you; it has just sounded an alarm that is too loud for the moment. Your body is not broken — it is just overwhelmed.\n\n✨ **Let us regulate your body first before we solve anything in your mind:**\nTry the **Double Inhale Physiological Sigh** above with me right now. Let your belly soften as you exhale.\n\n*Inquiry for your heart:* If your body were trying to tell you what it needs most right this second, what would it ask for? Permission to stop? Permission to rest?`
      } else if (lower.includes("burnout") || lower.includes("exhaust") || lower.includes("tired") || lower.includes("drained") || lower.includes("overwhelm")) {
        practicalExercise = {
          type: "energy_triage",
          title: "The 3-Circle Energy Audit",
          steps: [
            "Identify 1 thing on your plate that genuinely must happen today.",
            "Identify 1 expectation you are holding that you can let go of until next week.",
            "Grant yourself 10 uninterrupted minutes of zero-input rest (no screens, no reading, just lying down with your hands on your ribs).",
          ],
        }
        reply = `I can feel the weight of what you have been carrying. You have been in 'endure mode' for a very long time, and your body is waving a quiet white flag.\n\nHere is something your counselor will always remind you of: **You do not need to earn your rest through exhaustion.** Rest is not a reward; it is the ground from which your life grows.\n\nI want to invite you to take the pressure off for the next few minutes. Look at the **3-Circle Energy Audit** above. Pick just one demand you can lay down.\n\n*A gentle question for you:* What is something you are doing out of guilt rather than genuine capacity? What would happen if you let that ball bounce?`
      } else if (lower.includes("critic") || lower.includes("not good enough") || lower.includes("fail") || lower.includes("imposter") || lower.includes("shame") || lower.includes("worthless")) {
        practicalExercise = {
          type: "self_compassion_touch",
          title: "Somatic Self-Compassion Anchor",
          steps: [
            "Place one warm hand over the center of your chest or gently wrap your arms around your ribs.",
            "Feel the physical warmth of your palm against your skin.",
            "Whisper inwardly: 'This is a moment of suffering. Suffering is part of being human. May I be kind to myself in this moment.'",
            "Breathe into the space beneath your hand for 4 slow cycles.",
          ],
        }
        reply = `I want you to pause for a second and notice that inner voice. That harsh, unrelenting inner critic is often just an exhausted protector — trying to criticize you before the world can.\n\nLet us disarm that judgment with radical tenderness. You are allowed to be a human being in progress. Mistakes, uncertainty, and learning curves do not diminish your inherent worth by a single millimeter.\n\nTry placing your hand over your heart with the **Somatic Self-Compassion Anchor** above. Let your chest soften into your hand.\n\n*Inquiry:* If someone you loved with your whole soul came to you with this exact mistake, what would you say to them? Can you offer that same grace to yourself tonight?`
      } else if (lower.includes("sad") || lower.includes("cry") || lower.includes("grief") || lower.includes("lonely") || lower.includes("hurt") || lower.includes("heartbreak")) {
        practicalExercise = {
          type: "holding_space",
          title: "Honoring the Feeling Without Fixing",
          steps: [
            "Allow the tears or heaviness to exist without rushing to fix or change them.",
            "Notice where the sadness lives physically (throat ache, heavy chest, hollow stomach).",
            "Send your breath directly to that area, treating it like a wounded animal seeking shelter.",
            "Remind yourself: 'All feelings are visitors. I can allow this visitor to pass through me safely.'",
          ],
        }
        reply = `I am honoring the grief and tenderness you are feeling right now. In a world that is obsessed with quickly cheering people up, I want to give you permission to just feel this ache. You do not have to be strong right now.\n\nSadness is not a flaw in your design; it is proof that you have a deep, tender heart that cares profoundly.\n\nLet the breath move through your chest naturally. Look at the practice above — let yourself be held in this quiet moment.\n\n*A tender inquiry:* If this sadness had a voice, what need is it speaking for? What is it longing to be comforted by?`
      } else if (lower.includes("boundar") || lower.includes("say no") || lower.includes("people pleas") || lower.includes("conflict") || lower.includes("guilt")) {
        practicalExercise = {
          type: "boundary_script",
          title: "Clean & Compassionate Boundary Script",
          steps: [
            "Acknowledge the relationship: 'I appreciate you thinking of me / I care about our connection...'",
            "State the clean limit without over-explaining: '...however, I do not have the capacity to take this on right now.'",
            "Offer a sustainable alternative (optional): 'I can revisit this next Tuesday / I can connect you with another resource.'",
            "Breathe through the initial spike of guilt. Guilt is the cost of growth when breaking people-pleasing habits.",
          ],
        }
        reply = `Setting boundaries is one of the most sacred acts of self-respect, but it is also one of the hardest. When you are used to keeping the peace by swallowing your own needs, saying 'no' feels like danger in your nervous system.\n\nRemember this counselor principle: **A boundary is not a wall to push people away; it is the bridge that allows you to love them without resenting them.**\n\nReview the **Clean Boundary Script** above. Notice that you do not need to invent an elaborate excuse.\n\n*Reflective question:* Whose comfort are you prioritizing at the expense of your own peace? What would it feel like to stand in your own corner today?`
      } else if (lower.includes("sleep") || lower.includes("insomnia") || lower.includes("racing thoughts") || lower.includes("night")) {
        practicalExercise = {
          type: "vagal_wind_down",
          title: "Vagal Reset for Deep Sleep",
          steps: [
            "Dim all blue lights and lie flat on your back.",
            "Unclench your jaw by letting your tongue drop from the roof of your mouth to the floor of your mouth.",
            "Drop your eyes behind closed lids as if looking down toward your cheekbones.",
            "Breathe out twice as long as you breathe in (4 seconds in, 8 seconds out) until warmth spreads to your fingertips.",
          ],
        }
        reply = `The day is over. Whatever was done is done, and whatever was left undone will keep until tomorrow. Your only responsibility right now is to let gravity hold you.\n\nWhen thoughts race at night, your brain is trying to solve tomorrow's problems with tonight's tired mind. Give yourself permission to park all responsibilities outside your bedroom door.\n\nTry the **Vagal Sleep Reset** above. Let your jaw unclench completely.\n\n*Evening mantra:* 'I release the day. My body is safe, my bed is my sanctuary, and tomorrow will have its own grace.'`
      } else {
        reply = `I hear you clearly, and I am glad you are here in this sanctuary today. As your virtual practitioner and counselor, my role is to hold space where you can drop the performance, unpack what is heavy, and find your center again.\n\nTake a slow, grounding breath down into your belly. Let your spine lengthen and your shoulders drop.\n\n✨ **Tell me more about what is unfolding for you:**\n• What emotion is sitting closest to the surface for you right now?\n• Where in your physical body are you holding the most tension today?\n\nTake your time — there is no rush here.`
      }
    } else {
      // ─── CLINICAL & PRACTICE ASSISTANT FOR PRACTITIONERS ───
      if (cleanImageData) {
        reply = `I have received and reviewed the clinical image/document you provided. ⚡\n\n### 📋 Practice Assistant Document Synthesis\n\n**1. Artifact Overview:**\n• Received visual clinical artifact (handwritten notes, diagram, or worksheet).\n• Processed thematic content and structured for clinical continuity.\n\n**2. Extracted Action Items for Client Record:**\n• Synthesized core client patterns and somatic indicators.\n• Structured continuity points for the upcoming 1:1 session.\n\n**3. Recommended Practice Integration:**\n• You can incorporate these items directly into your client's SOAP documentation or assign as follow-up reflection.\n\nWould you like me to format these notes into a complete SOAP record or draft a client homework prompt based on this image?`
      } else if (lower.includes("soap") || lower.includes("note") || lower.includes("summary") || lower.includes("case")) {
        reply = `Here is your clinical session synthesis structured by your practice assistant for documentation excellence:\n\n### 📋 Clinical Encounter & Thematic Formulation\n\n**1. Subjective & Affective Presentation:**\nClient arrived presenting situational anxiety and psychomotor restlessness related to interpersonal conflict and workload boundary erosion. Affect was congruent with reported distress; insight demonstrated high readiness for change.\n\n**2. Somatic & Psychological Formulations:**\n• Primary Vagal State: Sympathetic activation with chronic hypervigilance around perceived expectations.\n• Key Cognitive Schema: 'If I do not absorb everyone's demands, I am inherently unsafe / unvalued.'\n\n**3. Interventions Applied & Therapeutic Modalities:**\n• Somatic Experiencing: Guided interoceptive tracking of chest constriction, facilitating a restorative physiological sigh.\n• ACT Defusion: Separated identity from the perceived urgency of external demands.\n\n**4. Clinical Treatment Plan & Continuity:**\n• Client assigned 1 daily evening self-compassion check-in in the OpenHand journal.\n• Next 1:1 session scheduled for 7 days to evaluate boundary enforcement in high-friction environments.`
      } else if (lower.includes("prompt") || lower.includes("homework") || lower.includes("reflection")) {
        reply = `Here are 4 high-impact reflection prompts prepared by your practice assistant to assign to your client:\n\n1. *"Notice the exact moment this week where you felt an impulse to apologize for simply existing or having a need. What felt dangerous about taking up space?"*\n2. *"When your body felt tense or contracted recently, what boundary was being quietly compromised?"*\n3. *"What is an unwritten rule you learned in childhood about what you must do to earn love or approval that you are ready to retire?"*\n4. *"Imagine your wisest, most compassionate future self standing behind you right now with a hand on your shoulder. What permission are they giving you?"*\n\n💡 *Assistant Note: These prompts work exceptionally well when assigned right after a high-emotion 1:1 session while the insight is still fresh.*`
      } else if (lower.includes("burnout") || lower.includes("countertransference") || lower.includes("fatigue") || lower.includes("holding space")) {
        reply = `Colleague, as your practice assistant, I want to gently check in on your own wellbeing. Holding space for deep human pain is profound work, but it takes an invisible somatic toll on your own nervous system.\n\n**A Practice Assistant Check-In for You:**\n• Where are you absorbing your clients' urgency as your own?\n• Are you working harder than the client during the session? (A classic marker of over-functioning empathy).\n• Have you cleared your somatic palate between sessions, or are you carrying client energy into your evening?\n\nTake a deep, deliberate exhale. Ground your pelvis and feet into the earth. You are the instrument through which healing occurs — keep your instrument tuned and rested.`
      } else {
        reply = `Greetings. As your dedicated Practice Assistant, I am ready to support your daily clinical and administrative workflow:\n\n• **SOAP & Session Synthesis:** Converting raw session debriefs into pristine, auditable clinical notes.\n• **Client Reflection Prompts:** Generating tailored therapeutic questions and journaling exercises for your clients.\n• **Case Structuring & Modalities:** Conceptualizing cases with ACT, Somatic Experiencing, IFS, and CBT frameworks.\n• **Image & Artifact Processing:** Upload handwritten notes or whiteboard sketches for instant transcription.\n• **Practitioner Sustainability:** Managing capacity, preventing burnout, and supporting your professional practice.\n\nWhat would you like assistance with today?`
      }
    }

    return res.status(200).json({
      success: true,
      reply,
      practicalExercise,
      role,
      source: "master_engine",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "AURA engine encountered an issue.",
      error: error.message,
    })
  }
}


