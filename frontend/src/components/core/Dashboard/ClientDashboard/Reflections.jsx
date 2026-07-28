import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { apiConnector } from '../../../../services/apiConnector'
import toast from 'react-hot-toast'

export function Reflections({ practitionerName = 'your instructor', dashboardData, onReflectionUpdate }) {
  const { token } = useSelector((state) => state.auth)
  const [prompts, setPrompts] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)

  const instructorTitle = practitionerName ? (practitionerName.includes('Instructor') ? practitionerName : `Dr. ${practitionerName}`) : 'your instructor'

  const fetchPrompts = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await apiConnector('GET', '/api/v1/reflections', null, {
        Authorization: `Bearer ${token}`,
      })
      if (res?.data?.success && res?.data?.prompts) {
        setPrompts(res.data.prompts)
      }
    } catch (err) {
      console.error('Fetch reflection prompts error:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  const handleAction = async (promptId, action, isPrivate = false) => {
    if (!token) return
    const answerText = answers[promptId] || ''

    try {
      const res = await apiConnector(
        'POST',
        '/api/v1/reflections/answer',
        { promptId, answerText, action, isPrivate },
        { Authorization: `Bearer ${token}` }
      )

      if (res?.data?.success) {
        toast.success(res.data.message || 'Saved')
        fetchPrompts()
        if (onReflectionUpdate) onReflectionUpdate()
      }
    } catch (err) {
      toast.error('Failed to submit reflection')
    }
  }

  const pendingCount = prompts.filter((p) => p.status === 'pending').length

  return (
    <div id="prompts">
      <div className="hd">
        <div className="k">Reflections</div>
        <h1>{pendingCount > 0 ? `${pendingCount} prompt(s) waiting for you` : 'Your Reflection Journal'}</h1>
        <p>Written by {instructorTitle} from your sessions. There's no deadline — skip any that don't land.</p>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>Loading reflection prompts...</div>
      ) : prompts.length === 0 ? (
        <div className="card" style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>No active reflection prompts assigned yet. Your reflection journal notes will appear here.</div>
      ) : (
        prompts.map((p) => (
          <div key={p._id} className={`pr ${p.status === 'pending' ? 'unread' : ''}`}>
            <div className="meta">
              <div className="a">{instructorTitle.slice(0, 2).toUpperCase()}</div>
              <b>{instructorTitle}</b>
              <span className="t">{new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="q">"{p.promptText}"</div>

            {p.status === 'answered' ? (
              <div className="ans">
                <div className="lbl">You answered</div>
                {p.answerText}
              </div>
            ) : p.status === 'skipped' ? (
              <div className="ans" style={{ fontStyle: 'italic', opacity: 0.7 }}>You skipped this reflection.</div>
            ) : (
              <textarea
                value={answers[p._id] || ''}
                onChange={(e) => setAnswers({ ...answers, [p._id]: e.target.value })}
                placeholder="Write as much or as little as you want. Or leave it — the question can just sit with you."
              />
            )}

            <div className="acts">
              {p.status === 'pending' && (
                <>
                  <button
                    className="btn"
                    style={{ padding: '9px 20px', fontSize: '13.5px' }}
                    onClick={() => handleAction(p._id, 'answer', false)}
                  >
                    Send to Instructor
                  </button>
                  <button className="mini" onClick={() => handleAction(p._id, 'answer', true)}>Keep private</button>
                  <button className="mini" onClick={() => handleAction(p._id, 'skip')}>Skip this one</button>
                </>
              )}
              <span className="priv">
                {p.status === 'answered'
                  ? p.isPrivate ? 'Saved privately' : `Shared with ${instructorTitle}`
                  : p.status === 'skipped' ? 'Skipped' : `Only ${instructorTitle} sees this`}
              </span>
            </div>
          </div>
        ))
      )}

      <p className="note">Skipping prompts doesn't affect anything. Your instructor can see which ones you answered, never which ones you skipped and why.</p>
    </div>
  )
}

export default Reflections
