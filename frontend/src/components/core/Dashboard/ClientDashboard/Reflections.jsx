import React, { useState } from 'react'

export function Reflections({ practitionerName = 'Meera' }) {
  const [prompts, setPrompts] = useState([
    {
      id: 1,
      author: `Dr. ${practitionerName} Iyer`,
      time: '2 days ago',
      question: `"You said 'I should be over it by now.' Whose voice is the 'should' in?"`,
      isUnread: true,
      answer: '',
      submitted: null,
    },
    {
      id: 2,
      author: `Dr. ${practitionerName} Iyer`,
      time: '5 days ago',
      question: `"What would Sunday evening look like if it were just an evening?"`,
      isUnread: true,
      answer: '',
      submitted: null,
    },
    {
      id: 3,
      author: `Dr. ${practitionerName} Iyer`,
      time: '12 days ago',
      question: `"Name one thing this week that took less out of you than you expected."`,
      isUnread: false,
      answer: '',
      submitted: "The call with my sister. I'd been dreading it for a fortnight and it was fine. Better than fine, actually.",
      submittedTime: 'Sent to Meera · 11 days ago',
    },
  ])

  const handleAction = (id, action) => {
    setPrompts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          if (action === 'send') {
            return { ...p, submitted: p.answer || 'Answer sent to Meera', submittedTime: 'Sent to Meera · Just now', isUnread: false }
          }
          if (action === 'private') {
            return { ...p, submitted: p.answer || 'Kept in private journal', submittedTime: 'Saved privately', isUnread: false }
          }
          if (action === 'skip') {
            return { ...p, submittedTime: 'Skipped', isUnread: false }
          }
        }
        return p
      })
    )
  }

  return (
    <div id="prompts">
      <div className="hd">
        <div className="k">Reflections</div>
        <h1>Two waiting for you</h1>
        <p>Written by {practitionerName} from your own sessions. There's no deadline and no obligation — skip any that don't land.</p>
      </div>

      {prompts.map((p) => (
        <div key={p.id} className={`pr ${p.isUnread ? 'unread' : ''}`}>
          <div className="meta">
            <div className="a">MI</div>
            <b>{p.author}</b>
            <span className="t">{p.time}</span>
          </div>
          <div className="q">{p.question}</div>

          {p.submitted ? (
            <div className="ans">
              <div className="lbl">You answered</div>
              {p.submitted}
            </div>
          ) : p.submittedTime === 'Skipped' ? (
            <div className="ans" style={{ fontStyle: 'italic', opacity: 0.7 }}>You skipped this reflection.</div>
          ) : (
            <textarea
              value={p.answer}
              onChange={(e) =>
                setPrompts((prev) =>
                  prev.map((item) => (item.id === p.id ? { ...item, answer: e.target.value } : item))
                )
              }
              placeholder="Write as much or as little as you want. Or leave it — the question can just sit with you."
            />
          )}

          <div className="acts">
            {!p.submitted && p.submittedTime !== 'Skipped' && (
              <>
                <button className="btn" style={{ padding: '9px 20px', fontSize: '13.5px' }} onClick={() => handleAction(p.id, 'send')}>
                  Send to {practitionerName}
                </button>
                <button className="mini" onClick={() => handleAction(p.id, 'private')}>Keep private</button>
                <button className="mini" onClick={() => handleAction(p.id, 'skip')}>Skip this one</button>
              </>
            )}
            {p.submitted && (
              <button
                className="mini"
                onClick={() =>
                  setPrompts((prev) =>
                    prev.map((item) => (item.id === p.id ? { ...item, submitted: null } : item))
                  )
                }
              >
                Edit
              </button>
            )}
            <span className="priv">{p.submittedTime || `Only ${practitionerName} sees this`}</span>
          </div>
        </div>
      ))}

      <p className="note">Skipping prompts doesn't affect anything. Meera can see which ones you answered, never which ones you skipped and why.</p>
    </div>
  )
}

export default Reflections
