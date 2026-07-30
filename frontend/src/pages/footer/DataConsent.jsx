import React from 'react'
import { OHFooter, OHEyebrow, BubbleField } from '../../components/openhand'
import { 
  FiShield, 
  FiUserCheck, 
  FiVideo, 
  FiDownload, 
  FiTrash2, 
  FiMail
} from 'react-icons/fi'

export function DataConsent() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="font-sans bg-[#F8FAFC] min-h-screen text-[#334155] flex flex-col relative">
      <BubbleField density="low" zone="fullscreen" />
      {/* Modern Header Banner */}
      <header className="relative bg-white border-b border-slate-200/80 py-10 sm:py-14 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
        
        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 text-center">
          <OHEyebrow>Data &amp; Consent Policy</OHEyebrow>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight my-4 leading-tight">
            Consent isn't a checkbox. <br className="hidden sm:inline" />
            <span className="text-[#2563EB]">Here's how we treat it that way.</span>
          </h1>

          <p className="text-[#475569] text-base sm:text-lg max-w-4xl mx-auto font-medium leading-[1.65] mb-6">
            Most platforms bury consent inside a Privacy Policy no one reads. Given the nature of the work Open Hand supports — where confidentiality, informed consent, and boundaries are fundamental — we've given consent its dedicated policy.
          </p>

          {/* Legal Disclaimer Banner */}
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
            <h3 className="text-xs font-mono uppercase font-bold text-[#2563EB] tracking-wider mb-3 px-3">Topics</h3>
            <button onClick={() => scrollToSection('why-exists')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">Why this page exists</button>
            <button onClick={() => scrollToSection('consent-practitioners')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">Consent from practitioners</button>
            <button onClick={() => scrollToSection('consent-clients')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition flex items-center justify-between">
              <span>Consent from clients</span> <span className="text-amber-600 font-bold">⚖️</span>
            </button>
            <button onClick={() => scrollToSection('recording-consent')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">Session recording consent</button>
            <button onClick={() => scrollToSection('withdrawing')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">Withdrawing consent</button>
            <button onClick={() => scrollToSection('portability')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">Data portability</button>
            <button onClick={() => scrollToSection('deletion')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition flex items-center justify-between">
              <span>Data deletion</span> <span className="text-amber-600 font-bold">⚖️</span>
            </button>
            <button onClick={() => scrollToSection('special-protections')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">Special protections</button>
            <button onClick={() => scrollToSection('contact-consent')} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100 text-[#334155] font-semibold transition">Contact</button>
          </div>
        </div>

        {/* Content Body (8 cols) */}
        <div className="lg:col-span-8 space-y-8 text-[#334155] leading-[1.65] text-sm sm:text-base">

          {/* Why this page exists */}
          <div id="why-exists" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 font-medium">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">Why this page exists</h2>
            <p>
              This page explains: what consent we ask for, from whom, when, why, and how you can change it at any point during your practice journey on Open Hand.
            </p>
          </div>

          {/* Consent from practitioners */}
          <div id="consent-practitioners" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-medium">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <FiUserCheck className="text-[#2563EB]" /> Consent from practitioners
            </h2>
            <p>When you sign up as a practitioner, you consent to account processing, payment processing, and service communications.</p>
          </div>

          {/* Consent from clients */}
          <div id="consent-clients" className="p-8 sm:p-10 rounded-3xl bg-white border border-amber-300 shadow-sm space-y-4 font-medium">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                <FiShield className="text-amber-600" /> Consent from clients
              </h2>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 shrink-0">⚖️ Legal Review Required</span>
            </div>
            <p>Practitioners are responsible for obtaining valid informed consent from clients prior to logging personal notes or data.</p>
          </div>

          {/* Session recording consent */}
          <div id="recording-consent" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-medium">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <FiVideo className="text-[#2563EB]" /> Session recording consent
            </h2>
            <p>Recording sessions requires per-session explicit consent with clear on-screen notifications.</p>
          </div>

          {/* Withdrawing consent */}
          <div id="withdrawing" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-medium">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">Withdrawing consent</h2>
            <p>Clients or practitioners can withdraw non-essential consent at any time via settings or emailing support.</p>
          </div>

          {/* Data portability */}
          <div id="portability" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-medium">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <FiDownload className="text-emerald-600" /> Data portability
            </h2>
            <p>Full export tools are provided to practitioners to download notes, clients, and financial histories in standard CSV/JSON format.</p>
          </div>

          {/* Data deletion */}
          <div id="deletion" className="p-8 sm:p-10 rounded-3xl bg-white border border-amber-300 shadow-sm space-y-4 font-medium">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
                <FiTrash2 className="text-red-600" /> Data deletion
              </h2>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 shrink-0">⚖️ Legal Review Required</span>
            </div>
            <p>Account deletion removes user data following a 30-day recovery grace period.</p>
          </div>

          {/* Special protections */}
          <div id="special-protections" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-medium">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">Special protections</h2>
            <p>Specific protections apply for minor accounts, deceased user data, and crisis situations.</p>
          </div>

          {/* Contact */}
          <div id="contact-consent" className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-medium">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <FiMail className="text-[#2563EB]" /> Contact
            </h2>
            <p>Consent inquiries: <strong className="text-[#2563EB]">connect@zwiebelai.in</strong></p>
          </div>

        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default DataConsent
