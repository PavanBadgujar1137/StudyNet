import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  OHFooter,
  OHEyebrow,
  OHNeverDoSection,
} from '../../components/openhand'
import {
  FiArrowRight,
  FiCheck,
} from 'react-icons/fi'
import openHandMeetAuraSvg from '../../assets/Images/OpenHand_Meet_AURA_High_Resolution.svg'

export function CoPilot() {
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const handleTrySession = (e) => {
    if (token && user) {
      e.preventDefault()
      const isPractitioner = user?.accountType === 'Practitioner' || user?.accountType === 'Instructor'
      if (isPractitioner) {
        navigate('/practice/dashboard')
      } else {
        navigate('/app/journey')
      }
    }
  }

  return (
    <div className="oh-aura-page font-sans bg-slate-50 min-h-screen text-slate-900 relative">

      {/* ─── Hero Header ───────────────────────────────────────────── */}
      <header className="pt-16 pb-6 text-center bg-gradient-to-b from-white via-blue-50/20 to-slate-50">
        <div className="oh-wrap max-w-5xl mx-auto px-4">
          <OHEyebrow>AURA — Consent-First AI Session Companion</OHEyebrow>

          <h1
            className="text-center w-full mx-auto text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight my-4 leading-[1.15]"
            style={{ color: '#0F172A' }}
          >
            You Coach. AURA Supports.{' '}
            <span className="block sm:inline" style={{ color: '#2563EB' }}>
              Greater Impact.
            </span>
          </h1>

          <p
            className="text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-8"
            style={{ color: '#334155' }}
          >
            OpenHand's ambient session AI listens quietly beside you, notices recurring threads across sessions, and drafts clinical-grade aftercare notes in ~90 seconds — while keeping your presence 100% human, private, and held.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-2">
            <Link
              to="/signup"
              onClick={handleTrySession}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-base shadow-lg transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
              }}
            >
              <span>Experience AURA Free</span>
              <FiArrowRight className="text-lg" />
            </Link>
            <a
              href="#ethics"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-base transition-all shadow-sm"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                border: '1px solid #CBD5E1'
              }}
            >
              Ethical Boundaries ↓
            </a>
          </div>

        </div>
      </header>

      {/* ─── High-Resolution Meet AURA Banner Showcase ──────────────── */}
      <section className="py-8 sm:py-14 bg-white relative border-b border-slate-200/70" id="showcase">
        <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
          <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
            <img
              src={openHandMeetAuraSvg}
              alt="Meet AURA — Always with you. Your AI Coaching Companion"
              className="w-full h-auto max-w-[1360px] object-contain block select-none mx-auto"
              loading="eager"
            />
          </div>


        </div>
      </section>

      {/* ─── Ethical Rails: Always vs Never ────────────────────────── */}
      <section className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/80" id="ethics">
        <div className="oh-wrap max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <OHEyebrow>Ethical Architecture</OHEyebrow>
            <h2
              className="text-3xl sm:text-4xl font-black tracking-tight mt-3 mb-2"
              style={{ color: '#0F172A' }}
            >
              Built Around the Boundary, Not the Shortcut
            </h2>
            <p
              className="text-sm sm:text-base font-medium leading-relaxed"
              style={{ color: '#475569' }}
            >
              Most AI-in-care platforms fail on clinical boundaries. We hardcoded our strict privacy standards directly into the product engine before writing a single line of feature code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Left Card: What AURA Always Does */}
            <div className="rounded-2xl bg-white border border-slate-200 p-7 sm:p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
                    style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857' }}
                  >
                    <FiCheck />
                  </div>
                  <div>
                    <span
                      className="text-[11px] font-black uppercase tracking-wider block"
                      style={{ color: '#047857' }}
                    >
                      Guaranteed Standard
                    </span>
                    <h3
                      className="text-xl font-black"
                      style={{ color: '#0F172A' }}
                    >
                      What AURA Always Does
                    </h3>
                  </div>
                </div>

                <ul className="space-y-4 text-sm sm:text-base font-medium" style={{ color: '#334155' }}>
                  <li className="flex items-start gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
                      style={{ backgroundColor: '#D1FAE5', color: '#047857' }}
                    >
                      ✓
                    </span>
                    <span>Asks your learner's explicit verbal &amp; digital permission before listening starts.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
                      style={{ backgroundColor: '#D1FAE5', color: '#047857' }}
                    >
                      ✓
                    </span>
                    <span>Stops instantly the millisecond consent is withdrawn — mid-sentence if needed.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
                      style={{ backgroundColor: '#D1FAE5', color: '#047857' }}
                    >
                      ✓
                    </span>
                    <span>Shows suggestions only to you, on your private screen, never shared with anyone.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
                      style={{ backgroundColor: '#D1FAE5', color: '#047857' }}
                    >
                      ✓
                    </span>
                    <span>Encrypts all session data end-to-end with practitioner-controlled retention windows.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
                      style={{ backgroundColor: '#D1FAE5', color: '#047857' }}
                    >
                      ✓
                    </span>
                    <span>Gives you 1-click export and permanent data wipeout whenever you choose.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 text-xs font-semibold" style={{ color: '#64748B' }}>
                Full compliance with HIPAA &amp; GDPR data minimization protocols.
              </div>
            </div>

            {/* Right Card: What AURA Will Never Do */}
            <OHNeverDoSection
              title="What AURA will never do"
              subtitle="Ethical boundaries hardcoded into our engine and legal agreements:"
              items={[
                "Speaks to your learner or appears on their screen at any point.",
                "Diagnoses, prescribes medication, or replaces clinical judgement.",
                "Sends a message or note to a learner without your explicit approval.",
                "Records session audio without live, revocable learner consent.",
                "Feeds your session content or notes to external public AI models."
              ]}
              variant="light"
            />

          </div>
        </div>
      </section>



      {/* ─── Closing Call To Action ─────────────────────────────────── */}
      <section
        className="py-16 sm:py-20 text-center relative overflow-hidden"
        style={{ backgroundColor: '#0F172A' }}
      >
        <div className="oh-wrap max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <h2
            className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight"
            style={{ color: '#FFFFFF' }}
          >
            Start with the notes.{' '}
            <span className="block" style={{ color: '#60A5FA' }}>
              Add the panel when you trust it.
            </span>
          </h2>
          <p
            className="text-base sm:text-lg max-w-2xl mx-auto mb-8 font-medium leading-relaxed"
            style={{ color: '#E2E8F0' }}
          >
            Post-session note drafting is included free on every practitioner plan. You never have to switch on anything you're not ready for.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              onClick={handleTrySession}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-extrabold text-base shadow-xl hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.5)'
              }}
            >
              Start Your Free Practice Space →
            </Link>
            <Link
              to="/contact-us"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-base transition-all inline-flex items-center justify-center"
              style={{
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255, 255, 255, 0.4)'
              }}
            >
              Ask Our Ethics Desk
            </Link>
          </div>
        </div>
      </section>

      {/* Global OpenHand Footer */}
      <OHFooter />
    </div>
  )
}

export default CoPilot
