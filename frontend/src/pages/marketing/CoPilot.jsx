import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { OHFooter } from '../../components/openhand'
import { 
  FiChevronDown, 
  FiHelpCircle 
} from 'react-icons/fi'

const FAQ_ITEMS = [
  {
    q: 'Is this replacing supervision?',
    a: "No, and we'd push back hard on anyone who framed it that way. It's a prompt in the room, not clinical oversight. Keep your supervisor.",
    badge: 'Clinical Boundaries',
  },
  {
    q: 'What if it suggests something wrong for my client?',
    a: 'You ignore it. Every suggestion has a "not now," nothing acts on its own, and dismissed suggestions teach it your boundaries. You remain the practitioner throughout.',
    badge: 'Control & Autonomy',
  },
  {
    q: 'Can I use it for notes only, without live suggestions?',
    a: "Yes — that's how most practitioners start. Post-session drafting is available on every plan, including free. The live panel is a separate switch you turn on when you're ready.",
    badge: 'Flexibility',
  },
  {
    q: 'Who can see my session data?',
    a: 'You. Not other practitioners, not your clients\' employers, not us for any purpose beyond running the service. Encrypted in transit and at rest, with retention you control.',
    badge: 'Data Privacy',
  },
  {
    q: 'What about regulated clinical practice?',
    a: "Requirements vary by jurisdiction and by the register you're on. Talk to Dr. Rajendra Patil before you switch it on — he'll walk you through what applies to you, and will tell you if it doesn't fit your practice.",
    badge: 'Compliance Guidance',
  },
]

export function CoPilot() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx)
  }

  return (
    <div className="copilot-page">
      {/* Hero */}
      <header className="copilot-hero">
        <div className="oh-wrap">
          <div className="copilot-hgrid">
            <div>
              <span className="copilot-eyebrow">Powered by AURA</span>
              <h1>
                You can't listen properly <span className="copilot-grad-text">and take notes.</span>
              </h1>
              <p>
                So don't. AURA listens alongside you — with your client's explicit consent — and hands you the next question, the technique that fits, and the thread you'd otherwise have missed. Your client never sees a word of it.
              </p>
              <div className="copilot-cta-row">
                <Link to="/start-free" className="copilot-btn">Try it in a session</Link>
                <a href="#how" className="copilot-btn-ghost">See how it works →</a>
              </div>
            </div>

            <div className="copilot-panel">
              <div className="copilot-ptop">
                <span className="copilot-live">
                  <i /> Live
                </span>
                <span className="t">Session 3 · 24:16</span>
              </div>
              <div className="copilot-pbody">
                <div className="copilot-sug">
                  <div className="k">Try asking</div>
                  <p>"You said 'I should be over it by now' — whose voice is the 'should' in?"</p>
                  <div className="act">
                    <span className="copilot-chip">Use</span>
                    <span className="copilot-chip">Not now</span>
                  </div>
                </div>
                <div className="copilot-sug">
                  <div className="k">Pattern across sessions</div>
                  <p>Third time work has come up right after family. Worth naming the link?</p>
                  <div className="act">
                    <span className="copilot-chip">Flag for notes</span>
                  </div>
                </div>
                <div className="copilot-sug">
                  <div className="k">Technique that fits</div>
                  <p>Two-chair work — she's holding both sides of this herself. Script ready.</p>
                  <div className="act">
                    <span className="copilot-chip">Open script</span>
                    <span className="copilot-chip">Save</span>
                  </div>
                </div>
              </div>
              <div className="copilot-pfoot">Visible only to you · Client consented at 00:00</div>
            </div>
          </div>
        </div>
      </header>

      {/* Section 1: Architecture Diagram */}
      <section className="copilot-sec" id="how">
        <div className="oh-wrap">
          <div className="copilot-sec-head">
            <h2>What happens between the words and the panel</h2>
            <p>No black box. Here's the whole path, including the two points where it stops if consent isn't there.</p>
          </div>
          <div className="copilot-arch">
            <svg
              className="copilot-archsvg"
              viewBox="0 0 900 370"
              role="img"
              aria-label="Architecture diagram showing session audio flowing through a consent gate to transcription, then to AURA Engine with practitioner context, producing practitioner-only suggestions and post-session drafts"
            >
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1E40AF" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
                <marker
                  id="a1"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto"
                >
                  <path
                    d="M1 1L9 5L1 9"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </marker>
                <marker
                  id="a2"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto"
                >
                  <path
                    d="M1 1L9 5L1 9"
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </marker>
              </defs>

              {/* ROW 1: Left to Right Flow */}
              {/* 1. Live Session */}
              <rect x="20" y="40" width="160" height="66" rx="14" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
              <text x="100" y="66" textAnchor="middle" className="lbl">Live session</text>
              <text x="100" y="86" textAnchor="middle" className="sm">You and your client</text>

              <path d="M 180 73 H 238" stroke="#2563EB" strokeWidth="2" markerEnd="url(#a1)" fill="none" />

              {/* 2. Consent Gate */}
              <rect x="244" y="30" width="160" height="86" rx="14" fill="#FFF1F2" stroke="#E11D48" strokeWidth="2" strokeDasharray="6 4" />
              <text x="324" y="52" textAnchor="middle" className="gate">CONSENT GATE</text>
              <text x="324" y="73" textAnchor="middle" className="lbl" fontSize="12" fill="#9F1239">Client must accept</text>
              <text x="324" y="91" textAnchor="middle" className="sm" fill="#BE123C">Revocable mid-session</text>
              <text x="324" y="105" textAnchor="middle" className="sm" fill="#BE123C">No consent → stops here</text>

              <path d="M 404 73 H 456" stroke="#2563EB" strokeWidth="2" markerEnd="url(#a1)" fill="none" />

              {/* 3. Speech to Text */}
              <rect x="462" y="40" width="160" height="66" rx="14" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
              <text x="542" y="66" textAnchor="middle" className="lbl">Speech to text</text>
              <text x="542" y="86" textAnchor="middle" className="sm">Encrypted, rolling window</text>

              <path d="M 622 73 H 682" stroke="#2563EB" strokeWidth="2" markerEnd="url(#a1)" fill="none" />

              {/* 4. AURA AI Box */}
              <rect x="688" y="40" width="192" height="66" rx="14" fill="url(#ag)" shadow="0 10px 25px rgba(37,99,235,0.3)" />
              <text x="784" y="66" textAnchor="middle" className="lbl-white">AURA</text>
              <text x="784" y="86" textAnchor="middle" className="sm-white">Reasons over the thread</text>

              {/* ROW 2 & FEEDBACK LOOPS */}

              {/* 5. Your Context (bottom right) */}
              <rect x="700" y="240" width="168" height="70" rx="14" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="2" />
              <text x="784" y="265" textAnchor="middle" className="lbl">Your context</text>
              <text x="784" y="283" textAnchor="middle" className="sm">Your method notes</text>
              <text x="784" y="297" textAnchor="middle" className="sm">Prior session summaries</text>

              {/* Upward Arrow: Your Context -> AURA */}
              <path d="M 784 240 V 114" stroke="#7C3AED" strokeWidth="2" markerEnd="url(#a2)" fill="none" />

              {/* Downward Arrow: AURA -> Practitioner Panel */}
              <path d="M 710 106 V 170 H 530 V 232" stroke="#2563EB" strokeWidth="2" markerEnd="url(#a1)" fill="none" />

              {/* 6. Practitioner-only panel */}
              <rect x="425" y="240" width="210" height="70" rx="14" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
              <text x="530" y="266" textAnchor="middle" className="lbl">Practitioner-only panel</text>
              <text x="530" y="286" textAnchor="middle" className="sm">Client's screen never shows this</text>

              <path d="M 425 275 H 360" stroke="#2563EB" strokeWidth="2" markerEnd="url(#a1)" fill="none" />

              {/* 7. You Decide */}
              <rect x="195" y="240" width="160" height="70" rx="14" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
              <text x="275" y="266" textAnchor="middle" className="lbl">You decide</text>
              <text x="275" y="286" textAnchor="middle" className="sm">Use it, or ignore it</text>

              <path d="M 195 275 H 176" stroke="#7C3AED" strokeWidth="2" markerEnd="url(#a2)" fill="none" />

              {/* 8. After the Session */}
              <rect x="20" y="240" width="150" height="70" rx="14" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="2" />
              <text x="95" y="265" textAnchor="middle" className="lbl">After the session</text>
              <text x="95" y="283" textAnchor="middle" className="sm">Draft notes + prompts</text>
              <text x="95" y="297" textAnchor="middle" className="sm">Nothing sends unapproved</text>

              {/* Caption */}
              <text x="450" y="348" textAnchor="middle" className="sm" fontSize="11.5" fill="#475569" fontWeight="600">
                Session content is encrypted in transit and at rest, retained only as long as you choose, and is not used to train external models.
              </text>
            </svg>
          </div>
          <p className="copilot-note">
            This describes the intended architecture. Implementation details — transcription provider, retention windows, regional data residency — should be confirmed against your final build and reviewed by legal counsel before launch.
          </p>
        </div>
      </section>

      {/* Section 2: Four Things */}
      <section className="copilot-sec">
        <div className="oh-wrap">
          <div className="copilot-sec-head">
            <h2>Four things it does, and what they look like</h2>
          </div>
          <div className="copilot-grid2">
            <div className="copilot-card">
              <div className="n">01</div>
              <h3>Hands you the next question</h3>
              <p>Not a script to read out. A prompt in your peripheral vision — the question a good supervisor might have nudged you toward, arriving while it's still useful.</p>
              <div className="ex">"You said 'I should be over it by now' — whose voice is the 'should' in?"</div>
            </div>
            <div className="copilot-card">
              <div className="n">02</div>
              <h3>Remembers across sessions</h3>
              <p>The connective memory that makes a client feel genuinely held — without you rereading six sets of notes before every call.</p>
              <div className="ex">"She mentioned her sister in week two. She's circling it again."</div>
            </div>
            <div className="copilot-card">
              <div className="n">03</div>
              <h3>Offers a technique that fits</h3>
              <p>Matched to how you actually work — you tell it your modality once, and it stops suggesting things you'd never do.</p>
              <div className="ex">"Two-chair work — she's holding both sides herself. Full script ready."</div>
            </div>
            <div className="copilot-card">
              <div className="n">04</div>
              <h3>Writes the aftermath</h3>
              <p>Session notes, the next set of reflection prompts, and a plan for next time — drafted the moment you hang up. You edit, you approve, you send.</p>
              <div className="ex">Draft ready in ~90 seconds. Approve, edit, or delete entirely.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Rails (Always/Never) */}
      <section className="copilot-sec">
        <div className="oh-wrap">
          <div className="copilot-rails">
            <h2>What it will never do</h2>
            <p>Most AI-in-therapy products fail on the boundary, not the capability. So we wrote ours down and built the product around it rather than the other way round.</p>
            <div className="copilot-railgrid">
              <div className="copilot-rail does">
                <h3>It always</h3>
                <ul>
                  <li>Asks your client's permission, out loud, before anything is heard</li>
                  <li>Stops the instant consent is withdrawn — mid-sentence if needed</li>
                  <li>Shows only to you, on your screen, never shared</li>
                  <li>Routes any crisis signal to a human escalation path</li>
                  <li>Logs everything it did, for you to export or delete</li>
                </ul>
              </div>
              <div className="copilot-rail never">
                <h3>It never</h3>
                <ul>
                  <li>Speaks to your client, or appears on their screen</li>
                  <li>Diagnoses, or suggests medication</li>
                  <li>Sends a message on your behalf without approval</li>
                  <li>Records without live, revocable consent</li>
                  <li>Feeds your session content to external model training</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: What your client actually sees */}
      <section className="copilot-sec py-16 bg-white border-t border-b border-slate-200">
        <div className="oh-wrap max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="copilot-gatebox">
            {/* Left Column: Title, Subtitle & Explanation */}
            <div className="flex flex-col gap-5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider w-fit">
                Client Experiential Consent
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight" style={{ color: '#0F172A' }}>
                What your client actually sees
              </h2>

              <p className="text-base sm:text-lg font-bold text-slate-800 leading-snug" style={{ color: '#1E293B' }}>
                One screen, once, at the start. Plain language, no dark patterns, and "no" costs them nothing.
              </p>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 flex flex-col gap-3 mt-2 shadow-sm">
                <h3 className="text-lg font-extrabold text-slate-900" style={{ color: '#0F172A' }}>
                  Consent, done properly
                </h3>
                <p className="text-sm font-semibold text-slate-700 leading-relaxed" style={{ color: '#334155' }}>
                  Buried checkboxes don't count as consent — not ethically and probably not legally. The client is asked in the room, in words they understand, and told exactly what happens either way.
                </p>
                <p className="text-sm font-semibold text-slate-700 leading-relaxed" style={{ color: '#334155' }}>
                  If they decline, the session runs completely normally. You lose the panel; they lose nothing. Most practitioners tell us the conversation itself builds trust.
                </p>
              </div>
            </div>

            {/* Right Column: Live Interactive Consent Modal Preview */}
            <div className="copilot-gatecard shadow-2xl">
              <div className="head">
                <div className="dot">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  </svg>
                </div>
                <h3>Before we begin</h3>
              </div>
              <div className="msg">
                <b>Meera would like to use a private assistant this session.</b>
                It listens and suggests ideas to her only — you'll never see it, and it never speaks to you. Nothing is shared with anyone else. You can turn it off at any moment, including halfway through.
              </div>
              <div className="copilot-gbtns">
                <button className="y" onClick={() => alert("Consent accepted in preview mode.")}>That's fine</button>
                <button className="nn" onClick={() => alert("Consent declined in preview mode.")}>Not today</button>
              </div>
              <p className="copilot-gnote">Either answer is completely fine. The session is the same.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: FAQ - 2-Column Grid with Solid High-Contrast Colors */}
      <section className="copilot-sec py-16 bg-slate-50">
        <div className="oh-wrap max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-100/80 border border-blue-300 text-blue-800 text-xs font-extrabold uppercase tracking-wider mb-3">
              <FiHelpCircle className="text-blue-700 text-base" /> Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight" style={{ color: '#0F172A' }}>
              The questions practitioners ask us
            </h2>
            <p className="text-slate-700 text-base font-semibold mt-2" style={{ color: '#334155' }}>
              Everything you need to know about how AURA operates within your clinical boundaries.
            </p>
          </div>

          {/* 2-Column Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1240px] mx-auto">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div
                  key={idx}
                  onClick={() => toggleFaq(idx)}
                  className={`group rounded-2xl border transition-all duration-300 cursor-pointer p-6 flex flex-col justify-between ${
                    isOpen
                      ? 'bg-white border-blue-600 shadow-xl shadow-blue-600/10 ring-2 ring-blue-600'
                      : 'bg-white border-slate-300 hover:border-blue-500 hover:shadow-lg'
                  }`}
                  style={{ backgroundColor: '#FFFFFF', borderColor: isOpen ? '#2563EB' : '#CBD5E1' }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                          style={{
                            backgroundColor: isOpen ? '#2563EB' : '#F1F5F9',
                            color: isOpen ? '#FFFFFF' : '#1E293B',
                            border: isOpen ? 'none' : '1px solid #CBD5E1'
                          }}
                        >
                          0{idx + 1}
                        </span>

                        {item.badge && (
                          <span 
                            className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md"
                            style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen ? 'bg-blue-100 text-blue-700 rotate-180' : 'bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700'
                      }`}>
                        <FiChevronDown className="text-base" />
                      </div>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 mb-2 leading-snug" style={{ color: '#0F172A' }}>
                      {item.q}
                    </h3>

                    {isOpen && (
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed pt-3 border-t border-slate-200 mt-3" style={{ color: '#1E293B' }}>
                        {item.a}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* Closing CTA */}
      <section className="copilot-close">
        <div className="oh-wrap">
          <h2>Start with the notes. Add the panel when you trust it.</h2>
          <p>Post-session drafting is on the free plan. You never have to switch on anything you're not ready for.</p>
          <div className="copilot-cta-row">
            <Link to="/start-free" className="copilot-btn">Start your free practice space</Link>
            <Link to="/talk-to-human" className="copilot-btn-ghost">Ask us the hard questions →</Link>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default CoPilot

