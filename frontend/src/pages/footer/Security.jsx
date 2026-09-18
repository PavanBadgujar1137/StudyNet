import { OHFooter, OHEyebrow } from '../../components/openhand'
import { LEGAL_FLAGS } from '../../config/productConfig'
import { 
  FiLock, 
  FiKey, 
  FiAward, 
  FiAlertTriangle, 
  FiEye, 
  FiMail
} from 'react-icons/fi'

export function Security() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="font-sans bg-[#F8FAFC] min-h-screen text-[#334155] flex flex-col relative">

      {/* Modern Header Banner */}
      <header className="relative bg-white border-b border-slate-200/80 py-10 sm:py-14 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
        
        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 text-center">
          <OHEyebrow>Platform Security &amp; Compliance</OHEyebrow>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight my-4 leading-tight">
            Security &amp; Encryption
          </h1>

          {!LEGAL_FLAGS.security && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto my-4 text-left flex items-center gap-3">
              <span className="text-xl shrink-0">⚖️</span>
              <div>
                <strong className="font-bold block text-amber-950">Pending Technical &amp; Legal Review</strong>
                Security &amp; compliance claims on this page are pending formal review by qualified legal counsel.
              </div>
            </div>
          )}

          <p className="text-[#475569] text-base sm:text-lg max-w-4xl mx-auto font-medium leading-[1.65] mb-6">
            Open Hand hosts sensitive practitioner and learner data. We treat it with maximum security. Data is encrypted in transit and at rest. Access is strictly permissioned.
          </p>
        </div>
      </header>

      {/* Main Grid Layout */}
      <section className="px-4 md:px-8 py-12 max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Navigation Sidebar (4 cols) */}
        <div className="lg:col-span-4 hidden lg:block">
          <div className="sticky top-24 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm text-xs sm:text-sm space-y-1.5">
            <h3 className="text-xs font-mono uppercase font-bold text-[#2563EB] tracking-wider mb-3 px-3">Security Topics</h3>
            <button onClick={() => scrollToSection('short-version')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">The short version</button>
            <button onClick={() => scrollToSection('how-protect')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">How we protect data</button>
            <button onClick={() => scrollToSection('certifications')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">Certifications &amp; standards</button>
            <button onClick={() => scrollToSection('your-role')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">Your role in security</button>
            <button onClick={() => scrollToSection('incident-response')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">If something goes wrong</button>
            <button onClick={() => scrollToSection('legal-requests')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">Legal requests for data</button>
            <button onClick={() => scrollToSection('disclosure')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">Responsible disclosure</button>
            <button onClick={() => scrollToSection('contact-security')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">Security contacts</button>
          </div>
        </div>

        {/* Content Body (8 cols) */}
        <div className="lg:col-span-8 space-y-8 text-[#334155] leading-[1.65] text-sm sm:text-base font-medium">

          {/* Short version */}
          <div id="short-version" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">The short version</h2>
            <p>
              Data is encrypted in transit (TLS 1.2+) and at rest (AES-256). Access is role-restricted and monitored.
            </p>
          </div>

          {/* How we protect data */}
          <div id="how-protect" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                <FiLock className="text-[#2563EB]" /> How we protect data
              </h2>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs sm:text-sm font-bold text-[#2563EB] uppercase tracking-wider font-mono flex items-center gap-2">
                <FiKey /> Encryption Standards:
              </h3>
              <ul className="list-disc list-inside space-y-1.5">
                <li>TLS 1.2 or higher for all transit data</li>
                <li>AES-256 encryption at rest</li>
                <li>Per-tenant encryption keys for session recordings &amp; transcripts</li>
              </ul>
            </div>
          </div>

          {/* Certifications and standards */}
          <div id="certifications" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <FiAward className="text-amber-600" /> Certifications and standards
            </h2>
            <p>Designed in alignment with ISO 27001 &amp; SOC 2 security frameworks and HIPAA/GDPR privacy principles.</p>
          </div>

          {/* Your role in security */}
          <div id="your-role" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">Your role in security</h2>
            <p>Use strong unique passwords, enable 2FA, and log out of shared devices.</p>
          </div>

          {/* Incident response */}
          <div id="incident-response" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                <FiAlertTriangle className="text-amber-600" /> Incident response
              </h2>
            </div>
            <p>72-hour breach notification process under applicable data protection laws.</p>
          </div>

          {/* Legal requests for data */}
          <div id="legal-requests" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                <FiEye className="text-[#2563EB]" /> Legal requests for data
              </h2>
            </div>
            <p>We comply only with legally valid and properly scoped court orders.</p>
          </div>

          {/* Responsible disclosure */}
          <div id="disclosure" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">Responsible disclosure</h2>
            <p>Security researchers can report findings to <a href="mailto:connect@openhand.live" style={{ color: '#2563EB', fontWeight: 700 }}>connect@openhand.live</a>.</p>
          </div>

          {/* Security Contacts */}
          <div id="contact-security" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs sm:text-sm">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2 mb-2">
              <FiMail className="text-[#2563EB]" /> Security Contacts
            </h2>
            <p><strong className="text-[#0F172A]">Urgent incidents:</strong> <span className="text-red-600 font-mono font-bold">connect@openhand.live</span></p>
            <p><strong className="text-[#0F172A]">Security desk:</strong> <span className="text-[#2563EB] font-mono font-bold">connect@openhand.live</span></p>
          </div>

        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default Security
