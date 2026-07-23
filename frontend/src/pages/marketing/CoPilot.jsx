import React from 'react'
import {
  OHNav,
  OHFooter,
  OHButton,
  OHEyebrow,
  OHCard,
  OHCardTitle,
  OHCardBody,
  OHConsentGate,
} from '../../components/openhand'
import './CoPilot.css'

export function CoPilot() {
  return (
    <div className="oh-copilot-page">

      {/* Hero */}
      <header className="oh-copilot-hero">
        <div className="oh-wrap">
          <OHEyebrow>AI Co-Pilot</OHEyebrow>
          <h1>
            AI that sounds like you, <span className="oh-grad-text">not like a bot.</span>
          </h1>
          <p className="sub">
            Post-session notes, personalized reflection prompts, and live in-session suggestions — built strictly to ethical coaching standards.
          </p>
          <div className="cta-row">
            <OHButton href="/start-free" size="lg">Try notes-only mode free</OHButton>
            <OHButton href="#rails" variant="ghost" size="lg">Read our always/never rails →</OHButton>
          </div>
        </div>
      </header>

      {/* Section 1: Architecture Diagram */}
      <section className="oh-sec">
        <div className="oh-wrap">
          <div className="sec-head">
            <h2>How the Co-Pilot Pipeline Works</h2>
            <p>Every step requires explicit consent and practitioner approval before saving to client records.</p>
          </div>
          <OHCard surface="navy" pad="lg" className="arch-card">
            <div className="pipeline-steps">
              <div className="pipe-step">
                <span className="pipe-num">1</span>
                <h4>Live Session Audio</h4>
                <p>Encrypted audio stream during 1:1 or circle call.</p>
              </div>
              <div className="pipe-arrow">→</div>

              <div className="pipe-step">
                <span className="pipe-num">2</span>
                <h4>Consent Gate</h4>
                <p>Live, revocable consent check against ConsentLog.</p>
              </div>
              <div className="pipe-arrow">→</div>

              <div className="pipe-step">
                <span className="pipe-num">3</span>
                <h4>Speech to Text</h4>
                <p>Private transcription with zero model training retention.</p>
              </div>
              <div className="pipe-arrow">→</div>

              <div className="pipe-step">
                <span className="pipe-num">4</span>
                <h4>Claude Context Pipeline</h4>
                <p>Enriched with your modality notes &amp; session summaries.</p>
              </div>
              <div className="pipe-arrow">→</div>

              <div className="pipe-step">
                <span className="pipe-num">5</span>
                <h4>Practitioner Review</h4>
                <p>Suggestions rendered ONLY on your screen for approval.</p>
              </div>
            </div>
          </OHCard>
        </div>
      </section>

      {/* Section 2: 4 Things It Does */}
      <section className="oh-sec">
        <div className="oh-wrap">
          <div className="sec-head">
            <h2>Four ways the co-pilot supports your practice</h2>
          </div>
          <div className="oh-grid-2">
            <OHCard surface="white" pad="lg">
              <OHCardTitle>1. Post-Session Notes Drafting</OHCardTitle>
              <OHCardBody>
                Generates clinical summary drafts immediately after your call. Edit, adjust, and approve before anything is saved to the client timeline.
              </OHCardBody>
            </OHCard>

            <OHCard surface="white" pad="lg">
              <OHCardTitle>2. Personalized Reflection Prompts</OHCardTitle>
              <OHCardBody>
                Drafts 2-3 tailored reflection prompts for your client based on what emerged during session — sent only after you click approve.
              </OHCardBody>
            </OHCard>

            <OHCard surface="white" pad="lg">
              <OHCardTitle>3. Live In-Session Suggestions</OHCardTitle>
              <OHCardBody>
                Real-time prompts on your screen highlighting cross-session patterns or matching modalities when a client hits a recurring block.
              </OHCardBody>
            </OHCard>

            <OHCard surface="white" pad="lg">
              <OHCardTitle>4. Notes-to-Content Converter</OHCardTitle>
              <OHCardBody>
                Transforms recurring session themes into anonymized circle prompts or program section outlines in your voice.
              </OHCardBody>
            </OHCard>
          </div>
        </div>
      </section>

      {/* Section 3: Always / Never Rails */}
      <section className="oh-sec oh-sec-dark" id="rails">
        <div className="oh-wrap">
          <OHEyebrow dark>Hard Ethical Rails</OHEyebrow>
          <h2 className="oh-sec-title dark">What the Co-Pilot will ALWAYS and NEVER do</h2>

          <div className="rails-two-col">
            <OHCard surface="navy" pad="lg" className="rail-box">
              <h3 className="always-title">✓ ALWAYS</h3>
              <ul className="rail-list">
                <li>Requires explicit, revocable client consent before session recording starts</li>
                <li>Renders suggestions exclusively on the practitioner's screen</li>
                <li>Requires practitioner approval before any note or prompt is saved</li>
                <li>Routes any crisis language signal to a human escalation path immediately</li>
                <li>Encrypts all data at rest and in transit with zero external model training</li>
              </ul>
            </OHCard>

            <OHCard surface="navy" pad="lg" className="rail-box">
              <h3 className="never-title">✗ NEVER</h3>
              <ul className="rail-list">
                <li>Never messages or contacts a client directly without practitioner approval</li>
                <li>Never diagnoses medical conditions or suggests psychiatric medications</li>
                <li>Never overrides a practitioner's decision or dismisses a note edit</li>
                <li>Never records audio or transcribes when consent is revoked</li>
                <li>Never sells or shares transcript data with third party ad networks</li>
              </ul>
            </OHCard>
          </div>
        </div>
      </section>

      {/* Section 4: Live Consent Gate Interactive Preview */}
      <section className="oh-sec">
        <div className="oh-wrap narrow">
          <div className="sec-head text-center">
            <h2>Live Consent Gate Mockup</h2>
            <p>Here is exact consent UI your clients experience before any session with co-pilot active.</p>
          </div>
          <OHConsentGate
            clientName="Demo Client (Ananya)"
            activeConsents={['copilot_notes']}
            onGrant={(type) => alert(`Demo mode: Granted consent for ${type}`)}
            onRevoke={(type) => alert(`Demo mode: Revoked consent for ${type}`)}
          />
        </div>
      </section>

      {/* Section 5: Co-Pilot FAQ */}
      <section className="oh-sec">
        <div className="oh-wrap narrow">
          <div className="sec-head"><h2>Co-Pilot Frequently Asked Questions</h2></div>
          <div className="faq-list">
            <div className="q-item">
              <h3>Do I have to use the live in-session co-pilot?</h3>
              <p>No. Notes-only mode ships as the default (lowest risk). You can disable live suggestions entirely or turn off co-pilot for specific clients.</p>
            </div>
            <div className="q-item">
              <h3>What happens if a client revokes consent mid-session?</h3>
              <p>Recording and transcription stop immediately. Any temporary buffer is wiped instantly, and no post-session notes draft will be generated.</p>
            </div>
            <div className="q-item">
              <h3>Is my voice data used to train AI models?</h3>
              <p>Never. OpenHand uses zero-retention API endpoints with Anthropic Claude — audio and text are processed strictly in-memory for your session and never stored by model providers.</p>
            </div>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default CoPilot
