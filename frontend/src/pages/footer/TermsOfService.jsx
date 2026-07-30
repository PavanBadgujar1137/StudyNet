import React from 'react'
import { OHFooter, OHEyebrow } from '../../components/openhand'
import { 
  FiUserCheck, 
  FiShield, 
  FiAlertTriangle, 
  FiDollarSign, 
  FiGlobe, 
  FiMail 
} from 'react-icons/fi'

export function TermsOfService() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="font-sans bg-[#F8FAFC] min-h-screen text-[#334155] flex flex-col">
      {/* Modern Header Banner */}
      <header className="relative bg-white border-b border-slate-200/80 py-10 sm:py-14 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
        
        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 text-center">
          <OHEyebrow>Open Hand Terms &amp; Conditions</OHEyebrow>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight my-4 leading-tight">
            Terms of Service
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-mono text-[#64748B] mb-6">
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">Last updated: <strong className="text-[#0F172A]">30.07.2026</strong></span>
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[#0F172A] font-bold">Effective: 30.07.2028</span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-emerald-800 border border-slate-200 font-bold">Jurisdiction: India / Pune</span>
          </div>

          {/* Legal Disclaimer Callout Banner */}
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm leading-[1.65] text-left flex items-start gap-3 shadow-sm max-w-4xl mx-auto">
            <span className="text-xl shrink-0">⚖️</span>
            <div>
              <strong className="font-bold block text-amber-950">Legal Review Template Notice</strong>
              Content below is a content template only and is not formal legal advice. Passages marked with <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 font-bold">⚖️</span> require qualified legal counsel review before publishing.
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <section className="px-4 md:px-8 py-12 max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Navigation Sidebar (4 cols) */}
        <div className="lg:col-span-4 hidden lg:block">
          <div className="sticky top-24 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm text-xs sm:text-sm space-y-1.5">
            <h3 className="text-xs font-mono uppercase font-bold text-[#2563EB] tracking-wider mb-3 px-3">Sections</h3>
            <button onClick={() => scrollToSection('plain-lang')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">The plain-language version</button>
            <button onClick={() => scrollToSection('sec-1')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition flex items-center justify-between">
              <span>1. Who can use Open Hand</span> <span className="text-amber-600 font-bold">⚖️</span>
            </button>
            <button onClick={() => scrollToSection('sec-2')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">2. What Open Hand is (and isn't)</button>
            <button onClick={() => scrollToSection('sec-3')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">3. Your account</button>
            <button onClick={() => scrollToSection('sec-4')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">4. Acceptable use</button>
            <button onClick={() => scrollToSection('sec-5')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">5. Content</button>
            <button onClick={() => scrollToSection('sec-6')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition flex items-center justify-between">
              <span>6. Payments and refunds</span> <span className="text-amber-600 font-bold">⚖️</span>
            </button>
            <button onClick={() => scrollToSection('sec-7')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">7. Termination</button>
            <button onClick={() => scrollToSection('sec-8')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition flex items-center justify-between">
              <span>8. Disclaimers</span> <span className="text-amber-600 font-bold">⚖️</span>
            </button>
            <button onClick={() => scrollToSection('sec-9')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition flex items-center justify-between">
              <span>9. Limitation of liability</span> <span className="text-amber-600 font-bold">⚖️</span>
            </button>
            <button onClick={() => scrollToSection('sec-10')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">10. Governing law & disputes</button>
            <button onClick={() => scrollToSection('sec-11')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">11. Changes to terms</button>
            <button onClick={() => scrollToSection('sec-12')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">12. Contact</button>
          </div>
        </div>

        {/* Content Body (8 cols) */}
        <div className="lg:col-span-8 space-y-8 text-[#334155] leading-[1.65] text-sm sm:text-base">

          {/* Plain Language Summary */}
          <div id="plain-lang" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 border-l-4 border-l-blue-600 space-y-3 shadow-sm font-medium">
            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A]">The plain-language version</h2>
            <p className="text-[#334155] leading-[1.65]">
              By using Open Hand, you're agreeing to a few things: use the platform for legitimate practice work; be honest about your qualifications; treat your clients with the care and confidentiality they deserve; and pay your bills. In return, we'll do our best to keep the platform running, keep your data safe, and be straight with you when we can't. Here are the details.
            </p>
          </div>

          {/* 1. Who can use */}
          <div id="sec-1" className="p-8 sm:p-10 rounded-3xl bg-white border border-amber-300 shadow-sm space-y-4 font-medium">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                <FiUserCheck className="text-[#2563EB]" /> 1. Who can use Open Hand
              </h2>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 shrink-0">⚖️ Legal Review Required</span>
            </div>
            
            <p>
              Open Hand is a platform for qualified practitioners — coaches, therapists, healers, counselors, consultants, and adjacent professions — to deliver services to clients.
            </p>

            <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">By creating a practitioner account, you confirm that:</h3>
            <ul className="list-disc list-inside space-y-1.5">
              <li>You are at least 18 years old</li>
              <li>You hold any qualifications, licenses, or registrations required to practice your profession in your jurisdiction</li>
              <li>You will comply with the professional ethics code applicable to your practice</li>
              <li>You are not currently barred, suspended, or under investigation by a regulatory body in a way that would affect your ability to practice</li>
            </ul>

            <p className="font-bold text-[#0F172A]">
              Open Hand does not verify practitioner qualifications. We ask you to represent them accurately. Misrepresenting qualifications is a material breach of terms.
            </p>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900">
              ⚖️ <em>This clause balances platform representation with legal liability.</em>
            </div>
          </div>

          {/* 2. What Open Hand is */}
          <div id="sec-2" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-medium">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">2. What Open Hand is (and isn't)</h2>
            <p>
              Open Hand is a software platform. We provide tools for practitioners to run their practice. We are not a party to the practitioner-client relationship. We do not:
            </p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Provide therapy, coaching, or health advice directly</li>
              <li>Match clients to practitioners or vouch for individual clinical outcomes</li>
              <li>Take responsibility for the clinical judgment of practitioners</li>
            </ul>
          </div>

          {/* 3. Your account */}
          <div id="sec-3" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-medium">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">3. Your account</h2>
            <p>You're responsible for:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Keeping your login credentials secure (use a strong password; enable 2FA)</li>
              <li>Everything that happens within your account dashboard</li>
              <li>Notifying us immediately if you suspect unauthorized account access</li>
            </ul>
          </div>

          {/* 4. Acceptable use */}
          <div id="sec-4" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-medium">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">4. Acceptable use</h2>
            <p>You agree not to use Open Hand to:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Break any local or international law</li>
              <li>Harm, harass, or exploit clients or other users</li>
              <li>Impersonate credentials or professional qualifications</li>
              <li>Upload malicious code, or attempt to breach platform security</li>
              <li>Scrape, reverse-engineer, or resell platform components</li>
            </ul>
          </div>

          {/* 5. Content */}
          <div id="sec-5" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-medium">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">5. Content</h2>
            <p>
              <strong className="text-[#0F172A]">Your content stays yours.</strong> You retain ownership of everything you upload to Open Hand — your courses, notes, and client records.
            </p>
            <p>
              You grant us a limited license to store, process, display, and transmit your content solely to operate the platform service for you.
            </p>
          </div>

          {/* 6. Payments and refunds */}
          <div id="sec-6" className="p-8 sm:p-10 rounded-3xl bg-white border border-amber-300 shadow-sm space-y-4 font-medium">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                <FiDollarSign className="text-emerald-600" /> 6. Payments and refunds
              </h2>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 shrink-0">⚖️ Legal Review Required</span>
            </div>

            <ul className="list-disc list-inside space-y-1.5">
              <li><strong className="text-[#0F172A]">Subscription fees</strong> are billed monthly in advance</li>
              <li><strong className="text-[#0F172A]">Transaction fees</strong> on client payments are deducted at payout</li>
              <li><strong className="text-[#0F172A]">Refunds</strong> — subscription fees are refundable within 5 days of initial purchase</li>
            </ul>
          </div>

          {/* 7. Termination */}
          <div id="sec-7" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-medium">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">7. Termination</h2>
            <p>
              You can close your account at any time from your dashboard. You have 30 days to export your data before permanent deletion.
            </p>
          </div>

          {/* 8. Disclaimers */}
          <div id="sec-8" className="p-8 sm:p-10 rounded-3xl bg-white border border-amber-300 shadow-sm space-y-4 font-medium">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                <FiAlertTriangle className="text-amber-600" /> 8. Disclaimers
              </h2>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 shrink-0">⚖️ Legal Review Required</span>
            </div>
            <p>Open Hand is provided "as is." Nothing on the platform constitutes medical, legal, or financial advice.</p>
          </div>

          {/* 9. Limitation of liability */}
          <div id="sec-9" className="p-8 sm:p-10 rounded-3xl bg-white border border-amber-300 shadow-sm space-y-4 font-medium">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                <FiShield className="text-red-600" /> 9. Limitation of liability
              </h2>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 shrink-0">⚖️ Legal Review Required</span>
            </div>
            <p>Total liability is limited to fees paid to Open Hand in the preceding 12 months.</p>
          </div>

          {/* 10. Governing law */}
          <div id="sec-10" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-medium">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <FiGlobe className="text-[#2563EB]" /> 10. Governing law and disputes
            </h2>
            <p>Governed by the laws of India / Pune courts.</p>
          </div>

          {/* 11. Changes */}
          <div id="sec-11" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-medium">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">11. Changes to these terms</h2>
            <p>We provide 30 days prior notice for material modifications.</p>
          </div>

          {/* 12. Contact */}
          <div id="sec-12" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-medium">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <FiMail className="text-[#2563EB]" /> 12. Contact
            </h2>
            <p>Legal inquiries: <strong className="text-[#2563EB]">legal@openhand.com</strong></p>
          </div>

        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default TermsOfService
