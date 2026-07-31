import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { OHFooter, OHEyebrow, BubbleField } from '../../components/openhand'
import { 
  FiBook, 
  FiSearch, 
  FiUserCheck, 
  FiUsers, 
  FiVideo, 
  FiLayers, 
  FiDollarSign, 
  FiShare2, 
  FiGrid, 
  FiAlertCircle, 
  FiArrowRight, 
  FiMessageCircle, 
  FiHelpCircle,
  FiChevronRight,
  FiX,
  FiBookmark,
  FiAward
} from 'react-icons/fi'

export function Documentation() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedDoc, setSelectedDoc] = useState(null)

  const docCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: FiUserCheck,
      desc: 'Initial setup guides for your profile, booking, payments, and learner onboarding.',
      items: [
        { title: 'Setting up your practitioner profile', snippet: 'Configure your bio, avatar, modalities, and public directory visibility settings.', details: 'Your practitioner profile is the front door to your practice on Open Hand. Head to Settings > Profile to upload a high-resolution headshot, write your bio in plain human language, select up to 5 core modalities (e.g. somatic coaching, CBT, spiritual direction), and set your public directory listing visibility.' },
        { title: 'Configuring your booking calendar', snippet: 'Sync Google/Outlook calendars, define available slots, buffer times, and session durations.', details: 'Connect your personal or work calendar via OAuth under Settings > Calendar Sync. Open Hand automatically prevents double booking, applies custom buffer times between back-to-back sessions, and lets you configure custom session lengths (30m, 50m, 90m).' },
        { title: 'Connecting your payment account', snippet: 'Integrate Stripe or Razorpay to process learner payments, subscriptions, and auto-payouts.', details: 'We support Stripe Connect for global accounts and Razorpay for Indian Rupees & regional cards. Funds are deposited directly to your bank account on a rolling 2-day payout schedule with 0% platform fee on your first ₹25,000 processed.' },
        { title: 'Inviting your first learner', snippet: 'Send secure email invitations, customized welcome notes, and portal access setup.', details: 'In your Practitioner Dashboard, click "+ Invite Learner". Input their email and select whether to assign a pre-session intake reflection or send a direct 1:1 booking link.' },
        { title: 'Setting up your first course or program', snippet: 'Create self-paced or cohort-based programs with video modules, reflections, and resources.', details: 'Build structured 6-week containers or self-paced courses. Combine video lessons with reflection check-ins and downloadable workbooks.' }
      ]
    },
    {
      id: 'working-with-learners',
      title: 'Working with Learners',
      icon: FiUsers,
      desc: 'Learner management tools, progress tracking, private notes, and boundary controls.',
      items: [
        { title: 'Learner profiles and history', snippet: 'Centralized record of past sessions, notes, active packages, and communication log.', details: 'View complete longitudinal history for each learner including session attendance, private SOAP notes, assigned worksheets, and billing status.' },
        { title: 'Progress notes (private and shared)', snippet: 'Write HIPAA/GDPR compliant SOAP notes with private clinician mode or learner-shared view.', details: 'All notes are encrypted at rest with AES-256. Switch between Private Clinician Notes (never visible to learners) and Shared Action Summaries.' },
        { title: 'Session preparation and follow-up', snippet: 'Send pre-session prompts, agendas, and automated post-session action item checklists.', details: 'Automate gentle check-in notifications 15 minutes before calls and deliver key action points immediately after calls.' },
        { title: 'Sharing resources and worksheets', snippet: 'Attach PDFs, audio guides, interactive forms, and reflections directly to learner portals.', details: 'Upload workbooks, meditation audio files, and reflection prompts to learner portals with view & download tracking.' },
        { title: 'Learner permissions and boundaries', snippet: 'Define messaging hours, portal access limits, and emergency contact visibility.', details: 'Set quiet hours for learner messaging and display clear emergency resources on learner portals.' }
      ]
    },
    {
      id: 'running-sessions',
      title: 'Running Sessions',
      icon: FiVideo,
      desc: 'Live video/audio classroom, async messages, summaries, and recording controls.',
      items: [
        { title: '1-on-1 live sessions', snippet: 'HD WebRTC video rooms with built-in whiteboard, shared notes, and screen sharing.', details: 'Launch low-latency zero-download WebRTC video calls directly inside the Open Hand browser dashboard.' },
        { title: 'Group sessions and cohorts', snippet: 'Host interactive group cohorts with breakout rooms, group chat, and shared screen.', details: 'Host up to 50 participants per video cohort with interactive screen sharing, chat moderation, and recording options.' },
        { title: 'Async video and audio messages', snippet: 'Exchange voice notes and quick video updates with learners between scheduled live sessions.', details: 'Send 2-minute voice or video check-ins between weekly calls to keep learner momentum active.' },
        { title: 'Recording sessions (and when not to)', snippet: 'Configure all-party consent prompts, cloud recording storage, and encryption rules.', details: 'Requires explicit on-screen learner consent before recording starts. Cloud recordings are encrypted per-tenant.' },
        { title: 'Session summaries and transcripts', snippet: 'Generate AI-assisted key takeaways, action items, and searchable audio transcripts.', details: 'Optionally process session audio through AURA for instant key takeaways and action points without manual scribbling.' }
      ]
    },
    {
      id: 'courses-programs',
      title: 'Courses & Programs',
      icon: FiLayers,
      desc: 'Build self-paced or live cohort curricula with structured modules and reflections.',
      items: [
        { title: 'Building a self-paced program', snippet: 'Structure video lessons, downloadable workbooks, and automated module drip schedules.', details: 'Create evergreen learning content with drip-release modules based on sign-up date or custom calendar dates.' },
        { title: 'Structuring modules, lessons, and check-ins', snippet: 'Combine video, text, quizzes, and reflection prompts into cohesive learning paths.', details: 'Organize course units with reflection prompts that require learner responses before unlocking next modules.' },
        { title: 'Assigning worksheets and reflections', snippet: 'Automate weekly journal assignments and review learner submissions in dashboard.', details: 'Track completion rates and comment on learner journal submissions directly in your practitioner hub.' },
        { title: 'Certificates and completion tracking', snippet: 'Issue verified completion badges and track individual learner progress across modules.', details: 'Automatically issue downloadable PDF completion certificates when learners finish 100% of course requirements.' }
      ]
    },
    {
      id: 'money',
      title: 'Money & Financials',
      icon: FiDollarSign,
      desc: 'Rates, packages, sliding scale spots, refunds, payout schedules, and tax reports.',
      items: [
        { title: 'Setting your rates', snippet: 'Configure hourly rates, package discounts, and currency selection for learner checkout.', details: 'Set custom currency options (INR ₹, USD $, EUR €) and offer single session or multi-session bundle pricing.' },
        { title: 'Sliding scale and pro-bono spots', snippet: 'Reserve dedicated sliding-scale slots with automated application forms.', details: 'Allocate sliding-scale slots with custom discount codes or income-verified checkout links.' },
        { title: 'Packages and subscriptions', snippet: 'Set up recurring monthly learner retainers or multi-session package bundles.', details: 'Charge learners monthly subscriptions with automated invoice generation and failed payment retries.' },
        { title: 'Refunds and disputes', snippet: 'Process instant learner refunds directly from payment ledger and resolve chargebacks.', details: 'Issue full or partial refunds directly to original payment methods from your payment transactions log.' },
        { title: 'Payout schedules and tax documents', snippet: 'View rolling payout cycles, download 1099/GST tax summaries and invoice histories.', details: 'Export annual transaction logs, GST/VAT breakdowns, and 1099 summaries for accounting.' }
      ]
    },
    {
      id: 'community-referrals',
      title: 'Community & Referrals',
      icon: FiShare2,
      desc: 'Grow your practice through peer networking, supervision, and public directory listing.',
      items: [
        { title: 'Getting listed in the practitioner directory', snippet: 'Optimize your public profile, specialty tags, and learner review verification.', details: 'Get discovered by prospective learners browsing the Open Hand directory by modality and specialty.' },
        { title: 'Peer supervision groups', snippet: 'Join small, closed cohorts of 4-6 practitioners for monthly confidential case consultation.', details: 'Connect with experienced peers for monthly clinical case reviews in confidential closed pods.' },
        { title: 'Referral network', snippet: 'Connect with complementary practitioners to send and receive qualified learner referrals.', details: 'Refer learners whose needs fall outside your scope to vetted Open Hand colleagues.' }
      ]
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: FiGrid,
      desc: 'Connect Open Hand with your external calendar, video, payment, and automation tools.',
      items: [
        { title: 'Google Calendar, Outlook, iCal', snippet: 'Two-way calendar synchronization to automatically block off booked Open Hand sessions.', details: 'Two-way sync prevents scheduling conflicts across all your personal and professional calendars.' },
        { title: 'Zoom, Google Meet (fallback options)', snippet: 'Configure custom external video fallback links for low-bandwidth connections.', details: 'Set backup external video meeting links if a learner experiences local bandwidth bottlenecks.' },
        { title: 'Stripe, Razorpay', snippet: 'Direct gateway connection for localized regional currencies and instant payouts.', details: 'Process credit cards, debit cards, UPI, netbanking, and Apple Pay/Google Pay.' },
        { title: 'Zapier / API', snippet: 'Connect Open Hand webhooks to 5,000+ apps for custom automated workflows.', details: 'Trigger webhooks on new bookings, session completions, or learner payments to update CRM tools.' }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: FiAlertCircle,
      desc: 'Step-by-step resolution guides for common technical or access questions.',
      items: [
        { title: 'Video/audio issues in sessions', snippet: 'Browser permission checks, camera/microphone diagnostics, and network troubleshooting.', details: 'Ensure browser permissions allow camera/microphone access (chrome://settings/content/camera).' },
        { title: 'Payment failures', snippet: 'Diagnosing declined cards, authentication errors, and retrying failed transactions.', details: 'Check card 3D Secure authentication status or retry via secondary payment gateway.' },
        { title: 'Learner can\'t log in', snippet: 'Password reset walkthroughs, magic link dispatching, and email verification checks.', details: 'Resend password reset emails or dispatch magic link directly from learner profile.' },
        { title: 'Email not sending', snippet: 'Checking spam filters, updating whitelist settings, and verifying domain delivery status.', details: 'Ensure support@openhand.com is added to learner email contact list or check spam folder.' }
      ]
    }
  ]

  const filteredCategories = docCategories.map(cat => {
    const matchesCategory = activeCategory === 'all' || activeCategory === cat.id
    if (!matchesCategory) return null

    const items = cat.items.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (searchTerm && items.length === 0) return null

    return { ...cat, items }
  }).filter(Boolean)

  return (
    <div className="font-sans bg-[#F8FAFC] min-h-screen text-[#334155] flex flex-col relative">
      <BubbleField density="low" zone="fullscreen" />
      {/* Modern Knowledge Base Hero with Mesh Pattern */}
      <header className="relative bg-white border-b border-slate-200/80 py-10 sm:py-14 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
        
        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <OHEyebrow>Practitioner Documentation Hub</OHEyebrow>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight my-4 leading-tight">
              Everything you need to run your practice — <br className="hidden sm:inline" />
              <span className="text-[#2563EB]">organized the way you actually work.</span>
            </h1>

            <p className="text-[#475569] text-base sm:text-lg max-w-3xl mx-auto font-medium leading-[1.65] mb-8">
              Open Hand's documentation is written for human guides, not software engineers. Clear walkthroughs, feature setup, and quick troubleshooting guides at your fingertips.
            </p>

            {/* Interactive Search Bar Box */}
            <div className="max-w-2xl mx-auto relative shadow-lg rounded-2xl">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2563EB] text-xl" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search guides, setup instructions, troubleshooting..."
                className="w-full pl-14 pr-12 py-4 rounded-2xl bg-white border border-slate-200 text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 text-sm sm:text-base font-medium transition"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${activeCategory === 'all' ? 'bg-[#2563EB] text-white shadow-md scale-105' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
              >
                All Topics ({docCategories.reduce((acc, curr) => acc + curr.items.length, 0)})
              </button>
              {docCategories.map(cat => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 ${activeCategory === cat.id ? 'bg-[#2563EB] text-white shadow-md scale-105' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
                  >
                    <Icon className={activeCategory === cat.id ? 'text-white' : 'text-[#2563EB]'} /> {cat.title}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area: Category Blocks with Modern Cards */}
      <section className="px-4 md:px-8 py-12 max-w-[1440px] mx-auto w-full space-y-10">
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm max-w-xl mx-auto">
            <FiHelpCircle className="text-5xl text-[#2563EB] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#0F172A]">No documentation guides found</h3>
            <p className="text-sm text-[#475569] mt-2 font-medium">Try searching for different terms like "calendar", "billing", or "learner invitation".</p>
            <button 
              onClick={() => { setSearchTerm(''); setActiveCategory('all'); }} 
              className="mt-6 px-6 py-2.5 rounded-xl bg-[#2563EB] text-white font-bold text-sm shadow"
            >
              Reset Search &amp; Filters
            </button>
          </div>
        ) : (
          filteredCategories.map(cat => {
            const CatIcon = cat.icon
            return (
              <div key={cat.id} className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#2563EB] text-xl font-bold">
                      <CatIcon />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">{cat.title}</h2>
                      <p className="text-xs sm:text-sm text-[#64748B] font-medium">{cat.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
                    {cat.items.length} Guides Available
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {cat.items.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedDoc(item)}
                      className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 hover:border-blue-400 hover:bg-white transition-all duration-200 group cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono text-[#2563EB] font-bold mb-2">
                          <span className="inline-flex items-center gap-1"><FiBookmark /> Guide #{idx + 1}</span>
                          <span className="text-slate-400 group-hover:text-[#2563EB] transition"><FiChevronRight /></span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-[#0F172A] group-hover:text-[#2563EB] transition mb-2">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#475569] leading-[1.65]">{item.snippet}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-[#2563EB] group-hover:underline">
                        <span>Read full guide</span>
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </section>

      {/* High Contrast Light Bottom Assistance CTA */}
      <section className="px-4 md:px-8 py-8 max-w-[1440px] mx-auto w-full mb-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-blue-50/80 border-2 border-blue-200 text-[#0F172A] flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-xs font-mono font-extrabold mb-3">
              <FiAward /> DIRECT ASSISTANCE DESK
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A]">Can't find the guide you're looking for?</h3>
            <p className="text-sm sm:text-base text-[#334155] mt-2 font-semibold leading-[1.6]">
              Our support engineers and peer practitioner community are online and ready to walk you through any custom setup.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link 
              to="/community" 
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-xs sm:text-sm font-bold text-[#0F172A] border border-slate-300 shadow-sm flex items-center gap-2 transition"
            >
              <FiUsers /> Ask Community
            </Link>
            <Link 
              to="/help-support" 
              className="px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-xs sm:text-sm font-bold text-white shadow-md flex items-center gap-2 transition"
            >
              <FiMessageCircle /> Contact Support <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Guide Detail Modal Popup */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[1000] bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-xl w-full relative shadow-2xl">
            <button 
              onClick={() => setSelectedDoc(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold p-2 cursor-pointer"
            >
              <FiX />
            </button>
            
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] text-2xl font-bold mb-4">
              <FiBook />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] mb-2">{selectedDoc.title}</h3>
            <p className="text-xs sm:text-sm text-[#2563EB] font-bold mb-4">{selectedDoc.snippet}</p>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-xs sm:text-sm text-[#334155] leading-[1.7] space-y-3 font-medium">
              <strong className="text-[#0F172A] block font-bold text-sm">Step-by-Step Instructions:</strong>
              <p>{selectedDoc.details}</p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <span className="text-xs text-[#64748B] font-mono font-medium">Open Hand Documentation v2.4</span>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-xs sm:text-sm font-bold text-white transition shadow"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      <OHFooter />
    </div>
  )
}

export default Documentation
