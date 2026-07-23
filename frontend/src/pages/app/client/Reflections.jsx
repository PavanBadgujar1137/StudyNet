import React, { useEffect, useState } from 'react'
import { OHButton } from '../../../components/openhand'
import { apiConnector } from '../../../services/apiConnector'
import toast from 'react-hot-toast'

export function Reflections({ clientName = 'Priya', practitionerName = 'Dr. Meera Iyer' }) {
  const [prompts, setPrompts] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadPrompts() {
      try {
        const res = await apiConnector('GET', '/api/v1/reflections')
        if (res?.data?.success) {
          setPrompts(res.data.prompts)
        }
      } catch (err) {
        console.warn('Reflections fetch error:', err)
      }
    }
    loadPrompts()
  }, [])

  const handleAction = async (promptId, action, isPrivate = false) => {
    const text = answers[promptId] || ''
    setLoading(true)
    try {
      const res = await apiConnector('POST', '/api/v1/reflections/answer', {
        promptId,
        answerText: text,
        action, // "answer" or "skip"
        isPrivate,
      })

      if (res?.data?.success) {
        toast.success(action === 'skip' ? 'Prompt skipped' : 'Reflection saved!')
        setPrompts((prev) =>
          prev.map((p) => (p._id === promptId ? res.data.prompt : p))
        )
      }
    } catch (err) {
      console.error('Answer reflection error:', err)
      toast.error('Failed to submit reflection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tab-view-reflections">
      <div className="tab-hd">
        <div className="k">Reflections</div>
        <h1>Prompts for you</h1>
        <p>Written by {practitionerName} from your own sessions. There's no deadline and no obligation — skip any that don't land.</p>
      </div>

      {prompts.map((p) => {
        const isAnswered = p.status === 'answered'
        const isSkipped = p.status === 'skipped'
        if (isSkipped) return null

        return (
          <div key={p._id} className={`pr ${!isAnswered ? 'unread' : ''}`}>
            <div className="meta">
              <div className="a">MI</div>
              <b>{practitionerName}</b>
              <span className="t">{new Date(p.createdAt).toLocaleDateString('en-IN')}</span>
            </div>

            <div className="q">"{p.promptText}"</div>

            {isAnswered ? (
              <div className="ans">
                <div className="lbl">You answered {p.isPrivate && '(Private)'}</div>
                {p.answerText}
              </div>
            ) : (
              <textarea
                value={answers[p._id] || ''}
                onChange={(e) => setAnswers({ ...answers, [p._id]: e.target.value })}
                placeholder="Write as much or as little as you want. Or leave it — the question can just sit with you."
              />
            )}

            {!isAnswered ? (
              <div className="acts">
                <OHButton
                  size="sm"
                  disabled={loading}
                  onClick={() => handleAction(p._id, 'answer', false)}
                >
                  Send to Meera
                </OHButton>
                <button
                  type="button"
                  className="mini"
                  disabled={loading}
                  onClick={() => handleAction(p._id, 'answer', true)}
                >
                  Keep private
                </button>
                <button
                  type="button"
                  className="mini"
                  disabled={loading}
                  onClick={() => handleAction(p._id, 'skip', true)}
                >
                  Skip this one
                </button>
                <span className="priv">Only Meera sees this</span>
              </div>
            ) : (
              <div className="acts">
                <span className="priv">
                  {p.isPrivate ? 'Kept private' : `Sent to ${practitionerName}`} · {new Date(p.answeredAt || p.updatedAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
          </div>
        )
      })}

      <p className="note" style={{ marginTop: 24 }}>
        Skipping prompts doesn't affect anything. {practitionerName} can see which ones you answered, never which ones you skipped and why.
      </p>
    </div>
  )
}

export default Reflections
