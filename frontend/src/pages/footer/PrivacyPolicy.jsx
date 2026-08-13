import { OHFooter, OHEyebrow } from '../../components/openhand'
import { LEGAL_FLAGS } from '../../config/productConfig'
import { 
  FiShield, 
  FiDatabase, 
  FiCpu, 
  FiGlobe, 
  FiClock, 
  FiUser, 
  FiMail,
  FiShare2,
  FiHeart
} from 'react-icons/fi'

export function PrivacyPolicy() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="font-sans bg-[#F8FAFC] min-h-screen text-[#334155] flex flex-col relative">

      {/* Modern Legal Header with Mesh Background Pattern */}
      <header className="relative bg-white border-b border-slate-200/80 py-10 sm:py-14 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
        
        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 text-center">
          <OHEyebrow>Open Hand Legal &amp; Data Notice</OHEyebrow>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight my-4 leading-tight">
            Privacy Policy
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-mono text-[#64748B] mb-6">
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">Last updated: <strong className="text-[#0F172A]">30.07.2026</strong></span>
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[#0F172A] font-bold">
              {/* LEGAL-2 fix: effective date corrected from 30.07.2028 to 30.07.2026 */}
              Effective: 30.07.2026
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-emerald-800 border border-slate-200 font-bold">India DPDP Act 2023 + GDPR</span>
          </div>

          {/* Legal Review Disclaimer Banner — toggled by LEGAL_FLAGS.privacyPolicy */}
          {!LEGAL_FLAGS.privacyPolicy && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm leading-[1.65] text-left flex items-start gap-3 shadow-sm max-w-4xl mx-auto">
              <span className="text-xl shrink-0">⚖️</span>
              <div>
                <strong className="font-bold block text-amber-950">Pending Legal Counsel Review</strong>
                This Privacy Policy document is pending formal review by qualified legal counsel.
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Layout with Sticky Nav */}
      <section className="px-4 md:px-8 py-12 max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Navigation Sidebar (4 cols) */}
        <div className="lg:col-span-4 hidden lg:block">
          <div className="sticky top-24 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm text-xs sm:text-sm space-y-1.5">
            <h3 className="text-xs font-mono uppercase font-bold text-[#2563EB] tracking-wider mb-3 px-3">On this page</h3>
            <button onClick={() => scrollToSection('note')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">A note before the legal bit</button>
            <button onClick={() => scrollToSection('applies')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">Who this policy applies to</button>
            <button onClick={() => scrollToSection('collect')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">What we collect</button>
            <button onClick={() => scrollToSection('special-category')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition flex items-center justify-between">
              <span>Special-category data</span> <span className="text-amber-600 font-bold">⚖️</span>
            </button>
            <button onClick={() => scrollToSection('how-use')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">How we use your data</button>
            <button onClick={() => scrollToSection('ai-ml')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition flex items-center justify-between">
              <span>AI and machine learning</span> <span className="text-amber-600 font-bold">⚖️</span>
            </button>
            <button onClick={() => scrollToSection('share')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">Who we share data with</button>
            <button onClick={() => scrollToSection('storage')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition flex items-center justify-between">
              <span>Where data is stored</span> <span className="text-amber-600 font-bold">⚖️</span>
            </button>
            <button onClick={() => scrollToSection('rights')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">Your rights</button>
            <button onClick={() => scrollToSection('retention')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition flex items-center justify-between">
              <span>How long we keep data</span> <span className="text-amber-600 font-bold">⚖️</span>
            </button>
            <button onClick={() => scrollToSection('children')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">Children</button>
            <button onClick={() => scrollToSection('contact')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition flex items-center justify-between">
              <span>Contact</span> <span className="text-amber-600 font-bold">⚖️</span>
            </button>
          </div>
        </div>

        {/* Policy Content Body (8 cols) */}
        <div className="lg:col-span-8 space-y-8 text-[#334155] leading-[1.65] text-sm sm:text-base">
          
          {/* Section 1: Note */}
          <div id="note" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <FiHeart className="text-red-500" /> A note before the legal bit
            </h2>
            <p className="font-medium">
              Open Hand exists to help practitioners work with people at some of their most vulnerable moments. That makes the data on our platform some of the most sensitive data anywhere on the internet. We take that seriously, and we've tried to write this policy so a real human can read it and understand what we do with your information — not just tick a compliance box.
            </p>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 border-l-4 border-l-blue-600 text-[#334155] text-xs sm:text-sm font-medium shadow-sm">
              <strong className="text-[#0F172A] block font-bold mb-1">If you'd rather skim:</strong>
              We collect what we need to run the platform, we don't sell your data, we let you take it with you when you leave, and where the law gives you rights over your data, we honor them.
            </div>
          </div>

          {/* Section 2: Who applies to */}
          <div id="applies" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <FiUser className="text-[#2563EB]" /> Who this policy applies to
            </h2>
            <p className="font-medium">This policy covers three groups of people whose data flows through Open Hand:</p>
            <ul className="space-y-2 list-disc list-inside font-medium">
              <li><strong className="text-[#0F172A]">Practitioners</strong> — coaches, therapists, healers, consultants, and their teams who use Open Hand to run their practice.</li>
              <li><strong className="text-[#0F172A]">Learners</strong> — the people practitioners work with, whose data is entered into Open Hand by their practitioner or by themselves through a learner portal.</li>
              <li><strong className="text-[#0F172A]">Visitors</strong> — anyone browsing openhand.live without an account.</li>
            </ul>
          </div>

          {/* Section 3: What we collect */}
          <div id="collect" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <FiDatabase className="text-sky-600" /> What we collect
            </h2>
            
            <div className="space-y-4 font-medium">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#2563EB] uppercase tracking-wider font-mono">From practitioners:</h3>
                <ul className="list-disc list-inside mt-2 space-y-1.5">
                  <li>Account information (name, email, phone, professional qualifications, tax details, payout information)</li>
                  <li>Content you create on the platform (courses, notes, resources, messages)</li>
                  <li>Usage data (which features you use, when, how often)</li>
                  <li>Device and technical data (IP address, browser, device type)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-indigo-700 uppercase tracking-wider font-mono">From learners (typically entered by practitioner or learner):</h3>
                <ul className="list-disc list-inside mt-2 space-y-1.5">
                  <li>Identity information (name, contact details, date of birth where required)</li>
                  <li>
                    <strong className="text-[#0F172A]">Health information ⚖️</strong> — including physical health, mental health, therapy history, medications where the practitioner requests it
                  </li>
                  <li>Financial information (for payment processing)</li>
                  <li>Session content — recordings, transcripts, notes, worksheets, messages</li>
                  <li>Progress data — assessments, mood logs, journal entries</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-sky-700 uppercase tracking-wider font-mono">From visitors:</h3>
                <ul className="list-disc list-inside mt-2 space-y-1.5">
                  <li>Standard web analytics (pages visited, referrer, general location by IP)</li>
                  <li>Information you provide in contact forms</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Special category */}
          <div id="special-category" className={`p-8 sm:p-10 rounded-3xl bg-white border ${!LEGAL_FLAGS.privacyPolicy ? 'border-amber-300' : 'border-slate-200'} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                <FiShield className="text-amber-600" /> The special-category data problem
              </h2>
              {!LEGAL_FLAGS.privacyPolicy && (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 shrink-0">⚖️ Legal Review Required</span>
              )}
            </div>
            
            <p className="font-medium">
              Health data, including mental health data, is a <strong>special category</strong> of personal data under GDPR (Article 9) and <strong>sensitive personal data</strong> under the India DPDP Act. Because Open Hand is built for practitioners whose work inherently involves this data, most information on the platform falls into these categories.
            </p>

            <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">Our approach:</h3>
            <ul className="space-y-2 list-disc list-inside font-medium">
              <li>We process this data only on the lawful basis that the learner has given <strong>explicit, informed consent</strong> to their practitioner — and the practitioner has consented, on their behalf and yours, to use Open Hand as a processor.</li>
              <li>Practitioners are the <strong>data controllers</strong> for their learner data. Open Hand is the <strong>data processor</strong>. Practitioners are responsible for obtaining valid consent from learners; Open Hand is responsible for handling the data securely and only as instructed.</li>
              <li>Session recordings, transcripts, and notes are encrypted end-to-end where technically feasible, and encrypted at rest and in transit in all cases.</li>
            </ul>

            {!LEGAL_FLAGS.privacyPolicy && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 font-medium">
                ⚖️ <em>This section describes a controller/processor architecture that must actually match how your platform is built. Have your lawyer confirm the model matches your product.</em>
              </div>
            )}
          </div>

          {/* Section 5: How we use */}
          <div id="how-use" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">How we use your data</h2>
            <ul className="list-disc list-inside space-y-1.5 font-medium">
              <li>To provide the service (running sessions, storing notes, processing payments, sending reminders)</li>
              <li>To keep the platform secure (detecting fraud and abuse)</li>
              <li>To improve the platform (analytics on how features are used)</li>
              <li>To communicate with you (service updates, security notices; marketing only if you opt in)</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h3 className="text-base sm:text-lg font-bold text-[#0F172A] pt-3">We do not:</h3>
            <ul className="list-disc list-inside space-y-1.5 text-emerald-700 font-bold">
              <li>Sell your data to anyone, ever</li>
              <li>Use learner session content to train AI models (see our AI use section)</li>
              <li>Share practitioner or learner data with advertisers</li>
            </ul>
          </div>

          {/* Section 6: AI & ML */}
          <div id="ai-ml" className={`p-8 sm:p-10 rounded-3xl bg-white border ${!LEGAL_FLAGS.privacyPolicy ? 'border-amber-300' : 'border-slate-200'} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                <FiCpu className="text-[#2563EB]" /> AI and machine learning
              </h2>
              {!LEGAL_FLAGS.privacyPolicy && (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 shrink-0">⚖️ Legal Review Required</span>
              )}
            </div>
            
            <p className="font-medium">
              Where Open Hand uses AI features (transcription, session summaries, suggested resources), we use them only on data the practitioner has explicitly chosen to run through them. <strong>Learner health data is never used to train AI models — ours or anyone else's.</strong> Where we use third-party AI providers, we contract for enterprise-grade agreements that prohibit training on your data.
            </p>

            {!LEGAL_FLAGS.privacyPolicy && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 font-medium">
                ⚖️ <em>Confirm this matches your actual AI vendor contracts before publishing.</em>
              </div>
            )}
          </div>

          {/* Section 7: Sharing */}
          <div id="share" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <FiShare2 className="text-[#2563EB]" /> Who we share data with
            </h2>
            <ul className="space-y-2 list-disc list-inside font-medium">
              <li><strong className="text-[#0F172A]">Payment processors</strong> Razorpay / Stripe — to process financial transactions</li>
              <li><strong className="text-[#0F172A]">Cloud infrastructure</strong> (Hosted infrastructure / Local Host)</li>
              <li><strong className="text-[#0F172A]">Analytics</strong> — privacy-preserving analytics only (no third-party trackers on authenticated pages)</li>
              <li><strong className="text-[#0F172A]">Law enforcement</strong> — only when legally compelled, and where legally permitted, we'll notify you first</li>
            </ul>
            <p className="text-xs sm:text-sm text-emerald-700 font-bold">We do not sell your data. We do not share it for advertising.</p>
          </div>

          {/* Section 8: Storage */}
          <div id="storage" className={`p-8 sm:p-10 rounded-3xl bg-white border ${!LEGAL_FLAGS.privacyPolicy ? 'border-amber-300' : 'border-slate-200'} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                <FiGlobe className="text-emerald-600" /> Where your data is stored
              </h2>
              {!LEGAL_FLAGS.privacyPolicy && (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 shrink-0">⚖️ Legal Review Required</span>
              )}
            </div>

            <p className="font-medium">Practitioner and learner data is stored in India.</p>

            {!LEGAL_FLAGS.privacyPolicy && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 font-medium">
                ⚖️ <em>This section must accurately reflect where you actually store data.</em>
              </div>
            )}
          </div>

          {/* Section 9: Rights */}
          <div id="rights" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">Your rights</h2>
            <p className="font-medium">Depending on where you live, you have some or all of these rights under India DPDP Act and GDPR:</p>
            <ul className="space-y-2 list-disc list-inside font-medium">
              <li><strong className="text-[#0F172A]">Access</strong> — get a copy of the data we hold about you</li>
              <li><strong className="text-[#0F172A]">Correct</strong> — fix anything that's wrong</li>
              <li><strong className="text-[#0F172A]">Delete</strong> — ask us to erase your data (subject to legal retention requirements)</li>
              <li><strong className="text-[#0F172A]">Port</strong> — get your data in a machine-readable format</li>
              <li><strong className="text-[#0F172A]">Object / withdraw consent</strong> — stop us from processing your data on certain grounds</li>
              <li><strong className="text-[#0F172A]">Complain</strong> — to your data protection authority (in India, the Data Protection Board)</li>
            </ul>
            <p className="text-xs sm:text-sm text-[#2563EB] font-bold">To exercise any of these rights, email <strong className="text-[#0F172A]">support@openhand.live</strong>. We respond within 15 days.</p>
          </div>

          {/* Section 10: Retention */}
          <div id="retention" className={`p-8 sm:p-10 rounded-3xl bg-white border ${!LEGAL_FLAGS.privacyPolicy ? 'border-amber-300' : 'border-slate-200'} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                <FiClock className="text-indigo-600" /> How long we keep data
              </h2>
              {!LEGAL_FLAGS.privacyPolicy && (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 shrink-0">⚖️ Legal Review Required</span>
              )}
            </div>

            <ul className="space-y-2 list-disc list-inside font-medium">
              <li><strong className="text-[#0F172A]">Active accounts</strong> — for as long as your account is open</li>
              <li><strong className="text-[#0F172A]">Deleted accounts</strong> — 30 days for accidental-deletion recovery, then permanent deletion (except financial records required by tax law)</li>
              <li><strong className="text-[#0F172A]">Session recordings and health data</strong> — retained per your (or your practitioner's) explicit choice, default 12 months, max 3 years</li>
              <li><strong className="text-[#0F172A]">Backups</strong> — up to 90 days after primary deletion</li>
            </ul>

            {!LEGAL_FLAGS.privacyPolicy && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 font-medium">
                ⚖️ <em>Retention periods must match your actual data lifecycle.</em>
              </div>
            )}
          </div>

          {/* Section 11: Children */}
          <div id="children" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">Children</h2>
            <p className="font-medium">
              Open Hand isn't designed for use by children under 18. Practitioners working with minors must obtain valid parental/guardian consent and are responsible for compliance with any additional protections applicable in their jurisdiction.
            </p>
          </div>

          {/* Section 12: Contact */}
          <div id="contact" className={`p-8 sm:p-10 rounded-3xl bg-white border ${!LEGAL_FLAGS.privacyPolicy ? 'border-amber-300' : 'border-slate-200'} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                <FiMail className="text-[#2563EB]" /> Contact &amp; Grievances
              </h2>
              {!LEGAL_FLAGS.privacyPolicy && (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 shrink-0">⚖️ Legal Review Required</span>
              )}
            </div>

            <p className="font-medium">For anything privacy-related, email: <strong className="text-[#2563EB]">support@openhand.live</strong></p>

            {!LEGAL_FLAGS.privacyPolicy && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 font-medium">
                ⚖️ <em>India DPDP Act requires appointing a Grievance Officer with contact details published.</em>
              </div>
            )}
          </div>

        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default PrivacyPolicy
