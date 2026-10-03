import React, { useState } from 'react'
import { OHFooter, OHEyebrow } from '../../components/openhand'
import {
  FiCheckCircle,
  FiBell,
  FiRss,
  FiRefreshCw,
  FiX,
  FiActivity,
  FiZap,
  FiShield,
  FiServer,
  FiClock,
  FiMail,
  FiMessageSquare
} from 'react-icons/fi'

export function PlatformStatus() {
  const [subscribeModal, setSubscribeModal] = useState(false)
  const [subscribeMethod, setSubscribeMethod] = useState('email')
  const [contactVal, setContactVal] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (contactVal.trim()) {
      setSubscribed(true)
      setTimeout(() => {
        setSubscribed(false)
        setContactVal('')
        setSubscribeModal(false)
      }, 3000)
    }
  }

  const services = [
    {
      name: 'Live video & audio sessions',
      desc: 'WebRTC video streams, audio sync, screen share, and session recording infrastructure',
      status: 'Operational',
      uptime: 99.99,
      latency: '28 ms',
      icon: FiZap
    },
    {
      // 4.7: renamed from "LMS & Learning Engine" — contradicted the homepage "0% Corporate LMS Clutter" claim
      name: 'Circles & Sessions Engine',
      desc: 'Circles, reflection check-ins, session scheduling, and learning resource delivery',
      status: 'Operational',
      uptime: 99.97,
      latency: '34 ms',
      icon: FiServer
    },
    {
      name: 'Learner Management & Portal',
      desc: 'Learner profiles, private/shared progress notes, booking calendar, and learner portal',
      status: 'Operational',
      uptime: 100.0,
      latency: '22 ms',
      icon: FiShield
    },
    {
      name: 'Payments, Invoices & Payouts',
      desc: 'Checkout forms, recurring subscriptions, invoice generation, Razorpay/Stripe payouts',
      status: 'Operational',
      uptime: 99.98,
      latency: '45 ms',
      icon: FiActivity
    },
    {
      name: 'Notifications & Alerts',
      desc: 'Email dispatchers, SMS alerts, in-app updates, and web push notification engine',
      status: 'Operational',
      uptime: 99.95,
      latency: '19 ms',
      icon: FiBell
    },
    {
      name: 'Mobile Apps & Sync Bridge',
      desc: 'iOS and Android mobile web portals & practitioner sync channels',
      status: 'Operational',
      uptime: 99.94,
      latency: '31 ms',
      icon: FiRefreshCw
    },
    {
      name: 'Website & Core Dashboard',
      desc: 'Practitioner admin dashboard, learner web portal, and public directory index',
      status: 'Operational',
      uptime: 100.0,
      latency: '16 ms',
      icon: FiCheckCircle
    }
  ]

  const pastIncidents = [
    {
      date: 'July 24, 2026',
      title: 'Payment Webhook Delivery Delay',
      duration: '14 minutes',
      status: 'Resolved',
      summary: 'A brief bottleneck in our webhooks worker queue delayed subscription confirmation emails for a subset of payment transactions. All queued webhooks were replayed without data loss.',
      fix: 'Increased memory allocation and autoscale instances on the primary event bridge worker pool.'
    },
    {
      date: 'June 18, 2026',
      title: 'Scheduled Database Indexing & Optimization',
      duration: '22 minutes',
      status: 'Completed Maintenance',
      summary: 'Planned database table optimization for session transcript queries. Platform remained operational with zero downtime.',
      fix: 'Database query throughput optimized by 34% post-indexing.'
    },
    {
      date: 'May 09, 2026',
      title: 'Transient Audio Sync Lag in High-Capacity Group Sessions',
      duration: '18 minutes',
      status: 'Resolved',
      summary: 'Some practitioners running Circles with >25 concurrent video streams experienced brief audio latency spikes.',
      fix: 'Deployed adaptive bitrate dynamic routing across secondary WebRTC edge clusters.'
    }
  ]

  return (
    <div className="font-sans bg-[#F8FAFC] min-h-screen text-[#334155] flex flex-col relative">

      {/* Modern Top Hero Section */}
      <header className="relative bg-white border-b border-slate-200/80 py-10 sm:py-14 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
            <OHEyebrow>Live Infrastructure &amp; Health</OHEyebrow>

            <h1 className="text-center text-[clamp(20px,4.2vw,52px)] leading-tight max-w-full mx-auto my-4 font-black tracking-tight text-[#0F172A]">
              <span className="block whitespace-nowrap">A live look at what's running,</span>
              <span className="text-[#2563EB] block whitespace-nowrap">what isn't, and what we're fixing.</span>
            </h1>

            <p className="text-[#475569] text-base sm:text-lg max-w-3xl mx-auto font-medium leading-[1.65] mb-8">
              Your practice runs on Open Hand. When something on our end slows down or breaks, we owe you a straight answer about what's happening — not a spinning wheel and silence.
            </p>
          </div>

          {/* Clean Neutral Hero Banner with Left Accent Border */}
          <div className="max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 border-l-4 border-l-emerald-500 text-[#0F172A] shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 text-center md:text-left">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-2xl shadow-sm">
                    <FiCheckCircle />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-ping" />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[#0F172A] text-xs font-mono font-bold mb-1">
                    SYSTEM STATUS • OPERATIONAL
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">All Systems Operational</h2>
                  <p className="text-sm text-[#475569] mt-1 font-medium">
                    All 7 core services responding normally. Rolling 90-day platform uptime: <strong className="text-emerald-700 font-bold">99.98%</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs sm:text-sm font-bold text-[#0F172A] border border-slate-200 shadow-sm flex items-center gap-2 transition"
                >
                  <FiRefreshCw className="text-[#2563EB]" /> Refresh Status
                </button>
                <button
                  onClick={() => setSubscribeModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-xs sm:text-sm font-bold text-white shadow-sm flex items-center gap-2 transition"
                >
                  <FiBell /> Subscribe to Alerts
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Section: Interactive Grid of Service Health Indicators */}
      <section className="px-4 md:px-8 py-12 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">Core Services Status</h2>
            <p className="text-sm text-[#475569] mt-1 font-medium">Real-time health telemetry across primary production clusters.</p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-[#0F172A] border border-slate-200 self-start sm:self-auto">
            ● 7 / 7 Services Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => {
            const Icon = srv.icon
            return (
              <div
                key={srv.name}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#2563EB] text-lg font-bold group-hover:scale-110 transition-transform">
                      <Icon />
                    </div>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-emerald-700 border border-slate-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {srv.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0F172A] mb-1.5">{srv.name}</h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-[1.65] mb-4 font-medium">{srv.desc}</p>
                </div>

                <div>
                  {/* Uptime Progress Bar Visual */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#64748B] font-semibold">90-Day Uptime</span>
                      <span className="text-emerald-700 font-bold">{srv.uptime}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${srv.uptime}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B] font-mono font-semibold">
                    <span>Edge Response</span>
                    <span className="text-[#0F172A] font-bold">{srv.latency}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Historical Uptime Metrics Dashboard */}
      <section className="px-4 md:px-8 py-6 max-w-[1440px] mx-auto w-full">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <FiClock className="text-2xl text-[#2563EB]" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">Performance &amp; Reliability Telemetry</h2>
          </div>
          <p className="text-sm sm:text-base text-[#475569] leading-[1.65] max-w-4xl font-medium">
            We publish rolling uptime records calculated directly from real practitioner and learner sessions, not synthetic idle check pings.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-8">
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-center">
              <p className="text-xs sm:text-sm text-[#64748B] font-semibold">90-Day Uptime</p>
              <p className="text-2xl sm:text-4xl font-black text-emerald-700 mt-2">99.98%</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-center">
              <p className="text-xs sm:text-sm text-[#64748B] font-semibold">30-Day Uptime</p>
              <p className="text-2xl sm:text-4xl font-black text-emerald-700 mt-2">100.0%</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-center">
              <p className="text-xs sm:text-sm text-[#64748B] font-semibold">Avg API Response</p>
              <p className="text-2xl sm:text-4xl font-black text-[#2563EB] mt-2">42 ms</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-center">
              <p className="text-xs sm:text-sm text-[#64748B] font-semibold">Mean Time to Resolve</p>
              <p className="text-2xl sm:text-4xl font-black text-purple-700 mt-2">16 mins</p>
            </div>
          </div>
        </div>
      </section>

      {/* Incident Log Timeline */}
      <section className="px-4 md:px-8 py-10 max-w-[1440px] mx-auto w-full mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">Past Incidents &amp; Maintenance Log</h2>
        <p className="text-sm sm:text-base text-[#475569] mb-8 font-medium">
          Transparent history of past events, root cause analysis, and deployed fixes.
        </p>

        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8 ml-2">
          {pastIncidents.map((inc, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Node Icon */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-white border-4 border-[#2563EB] group-hover:scale-125 transition-transform" />

              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="text-xs sm:text-sm font-mono text-[#64748B] font-bold">{inc.date}</span>
                  <div className="flex items-center gap-2">
                    {/* Clean Neutral Badge instead of blue box */}
                    <span className="text-xs px-3 py-1 rounded-lg bg-slate-100 text-[#0F172A] border border-slate-200 font-semibold font-mono">
                      Duration: {inc.duration}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-lg bg-slate-100 text-emerald-700 border border-slate-200 font-bold">
                      {inc.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-2">{inc.title}</h3>
                <p className="text-sm sm:text-base text-[#334155] leading-[1.65] mb-4 font-medium">{inc.summary}</p>

                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-xs sm:text-sm text-[#475569]">
                  <strong className="text-[#2563EB] font-bold">Deployed Resolution: </strong> {inc.fix}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subscribe Modal Popup */}
      {subscribeModal && (
        <div className="fixed inset-0 z-[1000] bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md w-full relative shadow-2xl text-center">
            <button
              onClick={() => setSubscribeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold p-2 cursor-pointer"
            >
              <FiX />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-[#2563EB]">
              <FiBell className="text-2xl" />
            </div>
            <h2 className="text-2xl font-black text-[#0F172A]">Subscribe to Status Alerts</h2>
            <p className="text-xs sm:text-sm text-[#475569] mt-2 leading-[1.6] font-medium">
              Get notified instantly whenever a new incident is opened or a resolution is deployed.
            </p>

            <div className="flex justify-center items-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => setSubscribeMethod('email')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${subscribeMethod === 'email' ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}
              >
                <FiMail /> Email
              </button>
              <button
                type="button"
                onClick={() => setSubscribeMethod('sms')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${subscribeMethod === 'sms' ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}
              >
                <FiMessageSquare /> SMS
              </button>
              <button
                type="button"
                onClick={() => setSubscribeMethod('rss')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${subscribeMethod === 'rss' ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}
              >
                <FiRss /> RSS Feed
              </button>
            </div>

            <form onSubmit={handleSubscribe} className="mt-5 space-y-3">
              {subscribeMethod === 'rss' ? (
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-mono text-[#2563EB] text-center select-all font-bold">
                  https://openhand.live/status/rss.xml
                </div>
              ) : (
                <>
                  <input
                    type={subscribeMethod === 'email' ? 'email' : 'tel'}
                    value={contactVal}
                    onChange={(e) => setContactVal(e.target.value)}
                    placeholder={subscribeMethod === 'email' ? 'your.name@practice.com' : '+1 (555) 000-0000'}
                    className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-slate-200 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition"
                  >
                    Subscribe Now
                  </button>
                </>
              )}
            </form>

            {subscribed && (
              <p className="text-xs sm:text-sm text-emerald-700 font-bold mt-4 flex items-center justify-center gap-1.5">
                <FiCheckCircle /> Subscribed successfully!
              </p>
            )}
          </div>
        </div>
      )}

      <OHFooter />
    </div>
  )
}

export default PlatformStatus
