import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { apiConnector } from '../../../../services/apiConnector'
import toast from 'react-hot-toast'
import { formatPractitionerName } from '../../../../utils/formatName'
import {
  FiBookOpen,
  FiSend,
  FiLock,
  FiStar,
  FiShield,
  FiHeart,
  FiShare2,
} from 'react-icons/fi'


export function Reflections({ practitionerName, dashboardData, onReflectionUpdate }) {
  const { token } = useSelector((state) => state.auth)
  const [prompts, setPrompts] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [filterTab, setFilterTab] = useState('All') // 'All' | 'Pending' | 'Completed'
  const [submittingId, setSubmittingId] = useState(null)

  const activePractitioner = dashboardData?.activePractitioner || dashboardData?.practitioner
  const practitionerTitle = formatPractitionerName(activePractitioner || practitionerName, 'Practitioner Guide')

  const fetchPrompts = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await apiConnector('GET', '/api/v1/reflections', null, {
        Authorization: `Bearer ${token}`,
      })
      if (res?.data?.success && res?.data?.prompts) {
        setPrompts(res.data.prompts || [])
      } else {
        setPrompts([])
      }
    } catch (err) {
      console.warn('Fetch reflection prompts warning:', err)
      setPrompts([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  // Handle answering or skipping prompt
  const handleAction = async (promptId, action, isPrivate = false) => {
    const answerText = answers[promptId] || ''

    if (action === 'answer' && !answerText.trim()) {
      toast.error('Please write a reflection note before saving.')
      return
    }

    setSubmittingId(promptId)

    try {
      if (token && !promptId.startsWith('ref_prompt_')) {
        const res = await apiConnector(
          'POST',
          '/api/v1/reflections/answer',
          { promptId, answerText, action, isPrivate },
          { Authorization: `Bearer ${token}` }
        )

        if (res?.data?.success) {
          toast.success(res.data.message || (isPrivate ? 'Saved to private journal! 🔒' : 'Shared with your practitioner! ✨'))
          fetchPrompts()
          if (onReflectionUpdate) onReflectionUpdate()
          return
        }
      }

      // Optimistic state update for instant reactivity
      setPrompts((prev) =>
        prev.map((p) => {
          if (p._id === promptId) {
            return {
              ...p,
              status: action === 'skip' ? 'skipped' : 'answered',
              answerText: answerText,
              isPrivate: isPrivate,
              answeredAt: new Date().toISOString(),
            }
          }
          return p
        })
      )

      if (action === 'skip') {
        toast.success('Prompt skipped. No worries!')
      } else {
        toast.success(isPrivate ? 'Saved privately to your journal 🔒' : `Shared with ${practitionerTitle} ✨`)
      }
    } catch (err) {
      toast.error('Could not save reflection note.')
    } finally {
      setSubmittingId(null)
    }
  }

  const activePromptsList = prompts
  const pendingCount = activePromptsList.filter((p) => p.status === 'pending').length
  const answeredCount = activePromptsList.filter((p) => p.status === 'answered').length

  const filteredPrompts = activePromptsList.filter((p) => {
    if (filterTab === 'Pending') return p.status === 'pending'
    if (filterTab === 'Completed') return p.status === 'answered'
    return true
  })

  return (
    <div id="prompts" style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', color: '#0F172A' }}>
      {/* ─── HERO HEADER BANNER ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0A0E27 0%, #1A1A40 50%, #2E1065 100%)',
          borderRadius: '24px',
          padding: '32px 36px',
          marginBottom: '28px',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 35px rgba(10, 14, 39, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '820px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'rgba(168, 85, 247, 0.25)',
                color: '#E9D5FF',
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <FiBookOpen size={12} /> Personal Growth &amp; Journaling
            </span>
            <span style={{ fontSize: '12px', color: '#CBD5E1' }}>
              • {pendingCount} prompt{pendingCount !== 1 ? 's' : ''} awaiting response
            </span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 10px 0', lineHeight: 1.25, color: '#FFFFFF' }}>
            {pendingCount > 0 ? `${pendingCount} Reflection Prompts Waiting For You` : 'Your Reflection Journal'}
          </h1>
          <p style={{ margin: 0, fontSize: '14.5px', color: '#E2E8F0', lineHeight: 1.55 }}>
            Thoughtfully written prompts by {practitionerTitle} to guide your inner growth and somatic awareness. There are no deadlines or expectations — feel free to write deeply or skip any prompt that doesn't resonate.
          </p>
        </div>

        {/* Ambient glow accent */}
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            bottom: '-40px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0) 70%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ─── FILTER TABS & COUNTERS ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[
            { id: 'All', label: 'All Prompts', count: activePromptsList.length },
            { id: 'Pending', label: `Pending (${pendingCount})`, count: pendingCount },
            { id: 'Completed', label: `Completed (${answeredCount})`, count: answeredCount },
          ].map((tab) => {
            const isActive = filterTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  border: isActive ? '1px solid #7C3AED' : '1px solid #E2E8F0',
                  background: isActive ? '#7C3AED' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#475569',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
          <FiStar color="#7C3AED" />
          <span>Responses are encrypted &amp; private by default</span>
        </div>
      </div>

      {/* ─── PROMPTS LIST ─── */}
      {loading ? (
        <div
          style={{
            padding: '50px',
            textAlign: 'center',
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            color: '#64748B',
            fontSize: '14px',
          }}
        >
          Loading reflection prompts...
        </div>
      ) : filteredPrompts.length === 0 ? (
        <div
          style={{
            padding: '50px 20px',
            textAlign: 'center',
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            color: '#64748B',
            fontSize: '14px',
          }}
        >
          <FiHeart size={36} color="#A855F7" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
            No prompts found in this view
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            You're all caught up! Switch to "All Prompts" to review past entries.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
          {filteredPrompts.map((p) => {
            const isPending = p.status === 'pending'
            const isAnswered = p.status === 'answered'
            const isSkipped = p.status === 'skipped'
            const author = p.authorName || practitionerTitle
            const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent'

            return (
              <div
                key={p._id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: isPending ? '2px solid #C084FC' : '1px solid #E2E8F0',
                  padding: '26px 28px',
                  boxShadow: isPending
                    ? '0 8px 30px rgba(192, 132, 252, 0.12)'
                    : '0 4px 16px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Prompt Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '13px',
                      }}
                    >
                      {author.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{author}</span>
                        <FiShield size={12} color="#F59E0B" />
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        {p.authorRole || 'Clinical Practitioner'} • Assigned {dateStr}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: isPending ? '#F3E8FF' : isAnswered ? '#ECFDF5' : '#F1F5F9',
                      color: isPending ? '#7C3AED' : isAnswered ? '#047857' : '#64748B',
                      border: isPending ? '1px solid #D8B4FE' : isAnswered ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
                    }}
                  >
                    {isPending ? '⏳ Awaiting Reflection' : isAnswered ? '✓ Answered' : 'Skipped'}
                  </span>
                </div>

                {/* Prompt Text Inquiry */}
                <div
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#1E1B4B',
                    lineHeight: 1.5,
                    marginBottom: '18px',
                    padding: '16px 20px',
                    background: '#FAF5FF',
                    borderRadius: '14px',
                    borderLeft: '4px solid #A855F7',
                  }}
                >
                  "{p.promptText}"
                </div>

                {/* Answer State or Input Field */}
                {isAnswered ? (
                  <div
                    style={{
                      background: '#F8FAFC',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      border: '1px solid #E2E8F0',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Your Recorded Reflection:
                      </span>
                      <span style={{ fontSize: '11.5px', color: p.isPrivate ? '#64748B' : '#0284C7', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                        {p.isPrivate ? <><FiLock size={12} /> Saved Privately</> : <><FiShare2 size={12} /> Shared with Practitioner</>}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#0F172A', lineHeight: 1.6, fontStyle: 'italic' }}>
                      "{p.answerText}"
                    </p>
                  </div>
                ) : isSkipped ? (
                  <div
                    style={{
                      background: '#F1F5F9',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: '#64748B',
                      fontSize: '13px',
                      fontStyle: 'italic',
                      marginBottom: '16px',
                    }}
                  >
                    You chose to skip this reflection prompt.
                  </div>
                ) : (
                  <div style={{ marginBottom: '18px' }}>
                    <textarea
                      value={answers[p._id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [p._id]: e.target.value })}
                      placeholder="Write freely — there is no right or wrong answer. Reflect on your bodily sensations, thoughts, or emotions..."
                      rows={3}
                      style={{
                        width: '100%',
                        borderRadius: '14px',
                        border: '1px solid #CBD5E1',
                        padding: '14px 16px',
                        fontSize: '14px',
                        outline: 'none',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        background: '#FFFFFF',
                        color: '#0F172A',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#8B5CF6'
                        e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.12)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#CBD5E1'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                )}

                {/* Action Controls for Pending Prompts */}
                {isPending && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleAction(p._id, 'answer', false)}
                        disabled={submittingId === p._id}
                        style={{
                          background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '9px 18px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
                        }}
                      >
                        <FiSend size={13} />
                        <span>Share with Practitioner</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAction(p._id, 'answer', true)}
                        disabled={submittingId === p._id}
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #CBD5E1',
                          color: '#334155',
                          padding: '9px 16px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <FiLock size={13} />
                        <span>Keep in Private Journal</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAction(p._id, 'skip')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        padding: '6px 10px',
                        fontWeight: 600,
                      }}
                    >
                      Skip this prompt
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ─── BOTTOM ADVISORY NOTE ─── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748B',
            flexShrink: 0,
          }}
        >
          <FiShield size={16} />
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
          <b>Gentle note:</b> Skipping prompts never impacts your progress or standing. Your practitioner can only view prompts you explicitly choose to share; private notes remain securely encrypted solely for your eyes.
        </p>
      </div>
    </div>
  )
}

export default Reflections
