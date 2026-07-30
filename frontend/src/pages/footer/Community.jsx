import React, { useState } from 'react'
import { OHFooter, OHEyebrow, BubbleField } from '../../components/openhand'
import { 
  FiUsers, 
  FiMessageSquare, 
  FiVideo, 
  FiUserCheck, 
  FiAward, 
  FiFolder, 
  FiShield, 
  FiHeart, 
  FiArrowRight, 
  FiAlertTriangle,
  FiCheckCircle,
  FiX
} from 'react-icons/fi'

export function Community() {
  const [joinedModal, setJoinedModal] = useState(false)
  const [reportModal, setReportModal] = useState(false)
  const [reportText, setReportText] = useState('')
  const [reportedSubmitted, setReportSubmitted] = useState(false)

  const offerings = [
    {
      title: 'Practitioner Forum',
      desc: 'Questions, wins, work-in-progress. Moderated, kind, and free.',
      tag: 'Discussions & Advice',
      icon: FiMessageSquare,
      color: 'bg-slate-100 border-slate-200 text-[#2563EB]'
    },
    {
      title: 'Monthly Practitioner Circles',
      desc: 'Live video meetups organized by modality (somatic, cognitive, coaching, energy work, spiritual direction) and by career stage (first year, growing, seasoned).',
      tag: 'Live Meetups',
      icon: FiVideo,
      color: 'bg-slate-100 border-slate-200 text-[#2563EB]'
    },
    {
      title: 'Peer Supervision Groups',
      desc: 'Small, closed cohorts of 4–6 practitioners meeting monthly to discuss cases in confidence.',
      tag: 'Closed Cohorts',
      icon: FiUserCheck,
      color: 'bg-slate-100 border-slate-200 text-[#2563EB]'
    },
    {
      title: 'AMAs & Craft Talks',
      desc: 'Sessions with experienced practitioners on the parts of the work that don\'t get talked about: money, boundaries, ethics, endings.',
      tag: 'Expert Sessions',
      icon: FiAward,
      color: 'bg-slate-100 border-slate-200 text-[#2563EB]'
    },
    {
      title: 'Resource Library',
      desc: 'Templates, intake forms, informed-consent examples, and worksheets contributed by the community.',
      tag: 'Shared Templates',
      icon: FiFolder,
      color: 'bg-slate-100 border-slate-200 text-[#2563EB]'
    }
  ]

  const principles = [
    {
      num: '01',
      title: 'This is a space for practitioners, not clients.',
      desc: 'If you\'re seeking help for yourself, we\'ll gladly point you to our verified practitioner directory.'
    },
    {
      num: '02',
      title: 'Confidentiality is non-negotiable.',
      desc: 'Never post identifiable client information. Anonymize case discussions; when in doubt, don\'t post.'
    },
    {
      num: '03',
      title: 'Disagree with the idea, not the person.',
      desc: 'Different modalities, different training, different philosophies — all welcome. Contempt isn\'t.'
    },
    {
      num: '04',
      title: 'No selling to peers.',
      desc: 'Sharing your work when relevant is fine. Cold-pitching community members isn\'t.'
    },
    {
      num: '05',
      title: 'Take care of yourself.',
      desc: 'Practitioner burnout is real. Step back when you need to. We\'ll be here when you return.'
    }
  ]

  const handleReportSubmit = (e) => {
    e.preventDefault()
    if (reportText.trim()) {
      setReportSubmitted(true)
      setTimeout(() => {
        setReportSubmitted(false)
        setReportText('')
        setReportModal(false)
      }, 3000)
    }
  }

  return (
    <div className="font-sans bg-[#F8FAFC] min-h-screen text-[#334155] flex flex-col relative">
      <BubbleField density="low" zone="fullscreen" />
      {/* Modern Hero Section with Subtle Pattern */}
      <header className="relative bg-white border-b border-slate-200/80 py-10 sm:py-14 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
        
        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <OHEyebrow>Open Hand Practitioner Network</OHEyebrow>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight my-4 leading-tight">
              Practitioners helping practitioners. <br className="hidden sm:inline" />
              <span className="text-[#2563EB]">Real conversation, zero pretense.</span>
            </h1>

            <p className="text-[#475569] text-base sm:text-lg max-w-3xl mx-auto font-medium leading-[1.65] mb-6">
              The people best qualified to help you run your practice well are the people doing it every day. The Open Hand community is a space for coaches, therapists, healers, and consultants to support each other.
            </p>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 border-l-4 border-l-blue-600 max-w-2xl mx-auto text-xs sm:text-sm text-[#334155] font-semibold flex items-center justify-center gap-3 shadow-sm mb-8">
              <FiHeart className="text-red-500 shrink-0 text-base" />
              <span>We built this space because the loneliest part of running a solo practice is everything around the client work.</span>
            </div>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <button 
                onClick={() => setJoinedModal(true)}
                className="px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-md flex items-center gap-2 transition"
              >
                <FiUsers /> Join Community
              </button>
              <a 
                href="#principles" 
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#0F172A] font-bold text-sm sm:text-base border border-slate-200 flex items-center gap-2 transition shadow-sm"
              >
                <FiShield className="text-[#2563EB]" /> Community Guidelines
              </a>
              <button 
                onClick={() => setReportModal(true)}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#475569] font-bold text-sm sm:text-base border border-slate-200 flex items-center gap-2 transition shadow-sm"
              >
                <FiAlertTriangle className="text-amber-500" /> Report Concern
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Section: Community Offerings Grid */}
      <section className="px-4 md:px-8 py-12 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">Community Channels &amp; Spaces</h2>
            <p className="text-sm text-[#475569] mt-1 font-medium">Structured cohorts, forums, and peer supervision groups.</p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200 self-start sm:self-auto">
            1,200+ Active Members
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offerings.map((item, idx) => {
            const Icon = item.icon
            return (
              <div 
                key={idx}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className={`w-12 h-12 rounded-2xl border ${item.color} flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform`}>
                      <Icon />
                    </div>
                    <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-[1.65]">{item.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setJoinedModal(true)} 
                    className="text-xs sm:text-sm font-bold text-[#2563EB] hover:text-blue-700 flex items-center gap-1 transition group-hover:translate-x-1"
                  >
                    Enter Channel <FiArrowRight />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Modern Principles Cards Section */}
      <section id="principles" className="px-4 md:px-8 py-8 max-w-[1440px] mx-auto w-full mb-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#2563EB] text-xl font-bold">
              <FiShield />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">Community Standards &amp; Principles</h2>
              <p className="text-xs sm:text-sm text-[#64748B] font-medium">Five commitments every member honors to maintain a safe, respectful practitioner environment.</p>
            </div>
          </div>

          <div className="space-y-4">
            {principles.map((pr) => (
              <div key={pr.num} className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 hover:border-blue-300 transition flex gap-5 items-start">
                <span className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-[#0F172A] font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  {pr.num}
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A] mb-1">{pr.title}</h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-[1.65] font-medium">{pr.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Community Modal */}
      {joinedModal && (
        <div className="fixed inset-0 z-[1000] bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md w-full text-center relative shadow-2xl">
            <button 
              onClick={() => setJoinedModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold p-2 cursor-pointer"
            >
              <FiX />
            </button>
            <FiCheckCircle className="text-5xl text-emerald-600 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A]">Welcome to the Community!</h3>
            <p className="text-xs sm:text-sm text-[#475569] mt-2 leading-[1.6] font-medium">
              You are now connected to the Open Hand practitioner network. Access circles, peer supervision cohorts, and the template library directly from your dashboard.
            </p>
            <button 
              onClick={() => setJoinedModal(false)}
              className="mt-6 w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm sm:text-base transition shadow"
            >
              Continue to Community Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Report Concern Modal */}
      {reportModal && (
        <div className="fixed inset-0 z-[1000] bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-lg w-full relative shadow-2xl">
            <button 
              onClick={() => setReportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold p-2 cursor-pointer"
            >
              <FiX />
            </button>
            <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] flex items-center gap-2">
              <FiAlertTriangle className="text-amber-500" /> Report a Community Concern
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
              All reports are confidentially reviewed by Open Hand community moderators within 24 hours.
            </p>

            {reportedSubmitted ? (
              <div className="p-6 mt-4 text-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                <FiCheckCircle className="text-3xl mx-auto mb-2 text-emerald-600" />
                <p className="text-sm font-bold">Report Submitted</p>
                <p className="text-xs sm:text-sm text-[#475569] mt-1 font-medium">Thank you for helping keep our practitioner space safe and respectful.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="mt-4 space-y-4">
                <textarea 
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Describe the issue or rule violation in detail..."
                  rows={4}
                  className="w-full p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  required
                />
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setReportModal(false)} 
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs sm:text-sm font-bold text-[#0F172A]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-xs sm:text-sm font-bold text-white shadow"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <OHFooter />
    </div>
  )
}

export default Community
