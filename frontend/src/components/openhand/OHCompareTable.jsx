import React from 'react'

const CONFIG = {
  platforms: ['OpenHand', 'Topmate', 'TagMango', 'Graphy', 'Kajabi', 'Simply.coach'],
  compare: [
    { f: 'Starting price', v: ['₹0', '₹0', '₹0', '₹1,999/mo*', '$143/mo*', '$9/mo'] },
    { f: 'Fee on entry plan', v: ['10% flat', '10% / 20% mkt', '10% incl. PG', '10% or ₹10', '2.9% + $0.30', 'Not listed'] },
    { f: 'We actively bring you mentees', v: [true, 'Marketplace (20%)', null, null, null, null] },
    { f: 'Hands-on growth mentoring', v: ['Every plan', null, '₹30,000/mo plan', null, null, 'Onboarding call'] },
    { f: 'Built for 1:1 coaching practice', v: [true, true, 'Courses-first', 'Courses-first', 'Courses-first', true] },
    { f: 'Built-in session room', v: [true, null, 'Zoom (Advanced)', null, null, null] },
    { f: 'Clients on entry plan', v: ['Unlimited', 'Not listed', '200 students', 'Unlimited', '2,500 contacts', '3 coachees'] },
  ],
  compareNote: '* billed annually. Sources: public pricing pages of topmate.io, tagmango.com, graphy.com, kajabi.com, simply.coach — checked 26 Sep 2026. "—" means not listed on their pricing page, not necessarily unavailable.',
}

function CellValue({ val }) {
  if (val === true) {
    return (
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold shadow-sm"
        style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}
        aria-label="Yes"
      >
        ✓
      </span>
    )
  }
  if (val === null || val === false) {
    return <span className="text-slate-300 font-medium text-lg leading-none">—</span>
  }
  return <span className="font-semibold text-slate-700">{val}</span>
}

export function OHCompareTable({ className = '' }) {
  return (
    <section className={`py-16 bg-white border-b border-slate-200 ${className}`}>
      <div className="oh-wrap max-w-[1540px] mx-auto px-2 sm:px-4">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#4F46E5] mb-2 block">
            SIDE BY SIDE
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            More than a marketplace. More than a course tool.
          </h2>
        </div>

        {/* Comparison Table Container */}
        <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[860px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">
                  <th className="py-4 px-6 text-slate-400 bg-white sticky left-0 z-10 font-bold">
                    FEATURE
                  </th>
                  {CONFIG.platforms.map((platform, idx) => {
                    const isUs = idx === 0
                    return (
                      <th
                        key={platform}
                        className={`py-4 px-4 text-center ${
                          isUs
                            ? 'text-[#4338CA] font-black bg-indigo-50/60'
                            : 'text-slate-600 font-bold'
                        }`}
                      >
                        {platform}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {CONFIG.compare.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                    {/* Feature label */}
                    <td className="py-4 px-6 font-bold text-slate-900 bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.04)]">
                      {row.f}
                    </td>

                    {/* Platform values */}
                    {row.v.map((val, cIdx) => {
                      const isUs = cIdx === 0
                      return (
                        <td
                          key={cIdx}
                          className={`py-4 px-4 text-center align-middle ${
                            isUs ? 'bg-indigo-50/60 font-black text-slate-900' : 'text-slate-600'
                          }`}
                        >
                          <CellValue val={val} />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-slate-400 mt-4 px-2 leading-relaxed text-center sm:text-left">
          {CONFIG.compareNote}
        </p>

      </div>
    </section>
  )
}

export default OHCompareTable
