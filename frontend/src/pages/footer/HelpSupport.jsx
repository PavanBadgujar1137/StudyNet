import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { OHFooter, OHEyebrow } from '../../components/openhand'
import {
  FiMessageSquare,
  FiMail,
  FiAlertCircle,
  FiPhoneCall,
  FiX,
  FiCheck,
  FiUsers,
  FiArrowRight,
  FiClock,
  FiCheckSquare,
  FiHeadphones
} from 'react-icons/fi'

export function HelpSupport() {
  const [chatOpen, setChatOpen] = useState(false)
  const [emergencyModal, setEmergencyModal] = useState(false)
  const [emailModal, setEmailModal] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const reachChannels = [
    {
      title: 'In-app Live Chat',
      speed: 'Fastest Response',
      desc: 'Available directly inside your practitioner or learner dashboard for live technical assistance.',
      icon: FiMessageSquare,
      ctaText: 'Launch Chat',
      action: () => setChatOpen(true)
    },
    {
      title: 'Email Support Desk',
      speed: 'Within 1 Business Day',
      desc: 'Write to support@openhand.live for account management, billing, or complex setup questions.',
      icon: FiMail,
      ctaText: 'Send Email',
      action: () => setEmailModal(true)
    },
    {
      title: 'Practitioner Community',
      speed: 'Peer Discussions',
      desc: 'Ask fellow practitioners for workflow advice, best practices, and modality handling.',
      icon: FiUsers,
      ctaText: 'Ask Community',
      to: '/community'
    }
  ]

  const responseTimes = [
    { label: 'Live-Session Emergencies', sla: 'First response within 15 minutes, 24/7' },
    { label: 'Payment & Payout Issues', sla: 'Same business day turnaround' },
    { label: 'General Account Queries', sla: 'Within 1 business day guaranteed' },
    { label: 'Feature Requests & Feedback', sla: 'Within 3 business days with a human response' }
  ]

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (emailMsg.trim()) {
      setEmailSent(true)
      setTimeout(() => {
        setEmailSent(false)
        setEmailSubject('')
        setEmailMsg('')
        setEmailModal(false)
      }, 3000)
    }
  }

  return (
    <div className="font-sans bg-[#F8FAFC] min-h-screen text-[#334155] flex flex-col relative">

      {/* Modern Hero Section */}
      <header className="relative bg-white border-b border-slate-200/80 py-10 sm:py-14 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
            <OHEyebrow>Practitioner Support Desk</OHEyebrow>

            <h1 className="text-center text-[clamp(20px,4.2vw,52px)] leading-tight max-w-full mx-auto my-4 font-black tracking-tight text-[#0F172A]">
              <span className="block whitespace-nowrap">Real human support,</span>
              <span className="text-[#2563EB] block whitespace-nowrap">whenever you or your learners need it.</span>
            </h1>

            <p className="text-[#475569] text-base sm:text-lg max-w-3xl mx-auto font-medium leading-[1.65] mb-8">
              We built Open Hand for practitioners whose work depends on presence. When something breaks — a video call won't connect, a payment fails, or a learner can't log in — you don't have time for chatbot loops.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 my-6">
              <button
                onClick={() => setChatOpen(true)}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-md transition-all hover:scale-[1.02]"
              >
                <FiMessageSquare className="text-lg" /> Live Chat Support
              </button>
              <button
                onClick={() => setEmailModal(true)}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-md transition-all hover:scale-[1.02]"
              >
                <FiMail className="text-lg" /> Email Support Desk
              </button>
              <button
                onClick={() => setEmergencyModal(true)}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-md transition-all hover:scale-[1.02]"
              >
                <FiAlertCircle className="text-lg" /> Crisis &amp; Helplines
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Support Channels Section */}
      <section className="px-4 md:px-8 py-12 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">Direct Support Channels</h2>
            <p className="text-sm text-[#475569] mt-1 font-medium">Choose how you'd like to get in touch with our team.</p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-[#0F172A] border border-slate-200 self-start sm:self-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Support Team Online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reachChannels.map((ch, idx) => {
            const Icon = ch.icon
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    {/* Clean Slate Icon Container for Maximum Icon Visibility */}
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#2563EB] text-xl font-bold group-hover:scale-110 transition-transform">
                      <Icon />
                    </div>
                    {/* Neutral Badge */}
                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 text-[#0F172A] border border-slate-200">
                      {ch.speed}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-2">{ch.title}</h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-[1.65] font-medium">{ch.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  {ch.to ? (
                    <Link
                      to={ch.to}
                      className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-[#0F172A] border border-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      {ch.ctaText} <FiArrowRight className="text-[#2563EB]" />
                    </Link>
                  ) : (
                    <button
                      onClick={ch.action}
                      className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-[#0F172A] border border-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                    >
                      {ch.ctaText} <FiArrowRight className="text-[#2563EB]" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Guaranteed SLA Section */}
      <section className="px-4 md:px-8 py-6 max-w-[1440px] mx-auto w-full">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <FiClock className="text-2xl text-[#2563EB]" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">Our Response-Time Commitment</h2>
          </div>
          <p className="text-sm sm:text-base text-[#475569] mb-8 font-medium">
            We don't do auto-responder quiet windows. Here are our guaranteed maximum turnaround times:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {responseTimes.map((rt, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200/80 flex items-center justify-center text-[#2563EB] text-sm shrink-0">
                    <FiCheckSquare />
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A]">{rt.label}</h3>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#475569]">{rt.sla}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notice for Learners of Practitioners */}
      <section className="px-4 md:px-8 py-6 max-w-[1440px] mx-auto w-full">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 border-l-4 border-l-blue-600 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-2">For learners working with an Open Hand practitioner</h3>
          <p className="text-xs sm:text-sm text-[#334155] leading-[1.65] font-medium">
            If you're a learner using Open Hand to work with a practitioner, we provide technical assistance (logging in, session link issues, payment setup). For anything regarding your session content, scheduling changes, or practice policies, please contact your practitioner directly.
          </p>
        </div>
      </section>

      {/* Emergency Crisis Helpline Modal Overlay */}
      {emergencyModal && (
        <div className="fixed inset-0 z-[1000] bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-lg w-full relative shadow-2xl">
            <button
              onClick={() => setEmergencyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold p-2 cursor-pointer"
            >
              <FiX />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 text-2xl font-bold mb-4">
              <FiPhoneCall />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] mb-2">Emergency &amp; Crisis Helplines</h3>
            <p className="text-xs sm:text-sm text-red-700 font-bold mb-4">
              Open Hand is a practice management platform and does not provide immediate crisis intervention. If you or your learner are in distress:
            </p>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                <strong className="text-[#0F172A] block font-bold">India (KIRAN Mental Health Helpline):</strong>
                <span className="text-[#2563EB] font-mono font-bold text-sm">1800-599-0019</span> (24/7 Toll Free)
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                <strong className="text-[#0F172A] block font-bold">India Tele-MANAS:</strong>
                <span className="text-[#2563EB] font-mono font-bold text-sm">14416</span> or <span className="text-[#2563EB] font-mono font-bold text-sm">1800-891-4416</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                <strong className="text-[#0F172A] block font-bold">International (iCall &amp; Vandrevala):</strong>
                <span className="text-[#2563EB] font-mono font-bold text-sm">+91 9999 666 555</span>
              </div>
            </div>

            <button
              onClick={() => setEmergencyModal(false)}
              className="w-full mt-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold text-sm transition"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* In-App Live Chat Modal Drawer */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 z-[1000] w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
          <div className="p-4 bg-[#0F172A] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center text-white text-sm font-bold">
                <FiHeadphones />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Open Hand Live Support</h4>
                <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  ● Agent available (Avg ~3 min)
                </p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-slate-300 hover:text-white p-1 text-lg cursor-pointer"
            >
              <FiX />
            </button>
          </div>

          <div className="p-5 space-y-3 max-h-80 overflow-y-auto bg-[#F8FAFC] text-xs">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-[#334155]">
              Hello! 👋 Welcome to Open Hand Support. How can we help with your practice or learner portal today?
            </div>
          </div>

          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message here..."
              className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-blue-600"
            />
            <button className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold shrink-0">
              Send
            </button>
          </div>
        </div>
      )}

      {/* Email Support Modal */}
      {emailModal && (
        <div className="fixed inset-0 z-[1000] bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setEmailModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold p-2 cursor-pointer"
            >
              <FiX />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#2563EB] text-xl font-bold mb-4">
              <FiMail />
            </div>
            <h3 className="text-2xl font-black text-[#0F172A]">Send Email Ticket</h3>
            <p className="text-xs text-[#475569] mt-1 font-medium">Guaranteed response within 1 business day.</p>

            <form onSubmit={handleEmailSubmit} className="mt-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. Account configuration question"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-[#0F172A] focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Message</label>
                <textarea
                  rows={4}
                  value={emailMsg}
                  onChange={(e) => setEmailMsg(e.target.value)}
                  placeholder="Describe your issue or question in detail..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-[#0F172A] focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold transition shadow"
              >
                Submit Ticket
              </button>
            </form>

            {emailSent && (
              <p className="text-xs text-emerald-700 font-bold mt-3 text-center flex items-center justify-center gap-1">
                <FiCheck /> Ticket sent! We'll reply shortly.
              </p>
            )}
          </div>
        </div>
      )}

      <OHFooter />
    </div>
  )
}

export default HelpSupport
