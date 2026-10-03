import React, { useState, useMemo, useEffect, useRef } from 'react'

const CONFIG = {
  cur: '₹',
  gateway: 2, // % pass-through gateway on OpenHand
  plans: [
    {
      id: 'open',
      name: 'Open',
      monthly: 0,
      yearly: 0,
      commission: 10,
    },
    {
      id: 'pro',
      name: 'Pro',
      monthly: 999,
      yearly: 799,
      commission: 5,
      highlight: true,
    },
    {
      id: 'institution',
      name: 'Institution',
      monthly: null,
      yearly: null,
      commission: null,
    },
  ],
  simCompetitors: [
    {
      name: 'Topmate',
      note: '10% profile / 20% marketplace + ~2% gateway',
      fixed: 0,
      profile: 10,
      marketplace: 20,
      gateway: 2,
    },
    {
      name: 'TagMango',
      note: 'Basic: 10% incl. gateway',
      fixed: 0,
      profile: 10,
      marketplace: 10,
      gateway: 0,
    },
    {
      name: 'Graphy',
      note: 'Launch: ₹1,999/mo (annual) + 10%',
      fixed: 1999,
      profile: 10,
      marketplace: 10,
      gateway: 0,
    },
  ],
}

const fmt = (n) => CONFIG.cur + Math.round(n).toLocaleString('en-IN')

function useCountUp(target, ms = 450) {
  const [val, setVal] = useState(target)
  const from = useRef(target)

  useEffect(() => {
    const start = performance.now()
    const a = from.current
    let raf

    const tick = (t) => {
      const p = Math.min(1, (t - start) / ms)
      const e = 1 - Math.pow(1 - p, 3)
      setVal(a + (target - a) * e)
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        from.current = target
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])

  return Math.round(val)
}

export function OHTakeHomeSimulator({ yearly = true, className = '' }) {
  const [price, setPrice] = useState(2000)
  const [sessions, setSessions] = useState(40)
  const [mkt, setMkt] = useState(50)

  const sim = useMemo(() => {
    const gross = price * sessions
    const m = gross * (mkt / 100)
    const p = gross - m

    const oh = CONFIG.plans
      .filter((x) => x.commission !== null)
      .map((pl) => {
        const sub = yearly ? pl.yearly : pl.monthly
        return {
          plan: pl.name,
          keep: gross - gross * ((pl.commission + CONFIG.gateway) / 100) - sub,
        }
      })
      .sort((a, b) => b.keep - a.keep)[0]

    const rows = [
      { name: 'OpenHand', sub: oh.plan + ' plan', keep: oh.keep, us: true },
      ...CONFIG.simCompetitors.map((c) => ({
        name: c.name,
        sub: c.note,
        keep:
          gross -
          p * (c.profile / 100) -
          m * (c.marketplace / 100) -
          gross * (c.gateway / 100) -
          c.fixed,
      })),
    ]

    return { gross, rows, oh }
  }, [price, sessions, mkt, yearly])

  const keepAnim = useCountUp(sim.oh.keep)
  const max = Math.max(...sim.rows.map((r) => r.keep), 1)

  return (
    <section className={`py-16 bg-[#F8FAFC] border-b border-slate-200 ${className}`}>
      <style>{`
        .oh-calc-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #2563EB, #9333EA);
          outline: none;
        }
        .oh-calc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 3px solid #6366F1;
          box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.2);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .oh-calc-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 0 7px rgba(99, 102, 241, 0.25);
        }
        .oh-calc-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 3px solid #6366F1;
          box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.2);
          cursor: pointer;
        }
      `}</style>

      <div className="oh-wrap max-w-[1540px] mx-auto px-2 sm:px-4">
        <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-sm p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Sliders */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#3B82F6] mb-2 block">
                  TAKE-HOME SIMULATOR
                </span>
                <h2
                  className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight leading-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Keep more. Grow more.
                </h2>
              </div>

              {/* Slider 1: Price per session */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
                  <span>Price per session</span>
                  <span className="text-base font-black text-slate-900">{fmt(price)}</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="20000"
                  step="100"
                  value={price}
                  onChange={(e) => setPrice(+e.target.value)}
                  className="oh-calc-slider cursor-pointer"
                />
              </div>

              {/* Slider 2: Sessions per month */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
                  <span>Sessions per month</span>
                  <span className="text-base font-black text-slate-900">{sessions}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="300"
                  step="1"
                  value={sessions}
                  onChange={(e) => setSessions(+e.target.value)}
                  className="oh-calc-slider cursor-pointer"
                />
              </div>

              {/* Slider 3: Mentees coming via the platform */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
                  <span>Mentees coming via the platform</span>
                  <span className="text-base font-black text-slate-900">{mkt}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={mkt}
                  onChange={(e) => setMkt(+e.target.value)}
                  className="oh-calc-slider cursor-pointer"
                />
              </div>

              {/* Note */}
              <p className="text-xs text-slate-500 leading-relaxed font-normal pt-2">
                Monthly gross {fmt(sim.gross)}. Entry-level INR plans only, from public pricing pages. Kajabi &amp; Simply.coach price in USD and are shown in the table below.
              </p>
            </div>

            {/* Right Column: Result & Comparison Bars */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-7 lg:pl-4">
              
              {/* Top KPI Box */}
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  Your take-home on OpenHand · {sim.oh.plan}
                </span>
                <div className="text-5xl sm:text-6xl font-black text-[#1D4ED8] tracking-tight leading-none mb-2">
                  {fmt(keepAnim)}
                </div>
                <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                  <span>+ a growth partner working on bringing you more mentees</span>
                </div>
              </div>

              {/* Comparison Bars */}
              <div className="space-y-4 pt-2">
                {sim.rows.map((r) => {
                  const percentWidth = Math.max(4, Math.min(100, (r.keep / max) * 100))
                  return (
                    <div
                      key={r.name}
                      className="grid grid-cols-12 gap-3 items-center text-sm"
                    >
                      {/* Brand name and note */}
                      <div className="col-span-4 sm:col-span-3 flex flex-col pr-2">
                        <span className={`font-black text-xs sm:text-sm ${r.us ? 'text-slate-900' : 'text-slate-800'}`}>
                          {r.name}
                        </span>
                        <span className="text-[10px] text-slate-600 line-clamp-1 leading-tight font-medium">
                          {r.sub}
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="col-span-5 sm:col-span-6">
                        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300 ease-out"
                            style={{
                              width: `${percentWidth}%`,
                              background: r.us
                                ? 'linear-gradient(90deg, #1D4ED8 0%, #9333EA 100%)'
                                : '#CBD5E1',
                            }}
                          />
                        </div>
                      </div>

                      {/* Value */}
                      <div className="col-span-3 sm:col-span-3 text-right">
                        <span
                          className={`font-black text-xs sm:text-sm tabular-nums ${
                            r.us ? 'text-slate-900' : 'text-slate-700'
                          }`}
                        >
                          {fmt(r.keep)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default OHTakeHomeSimulator
