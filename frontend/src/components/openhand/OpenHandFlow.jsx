import React from "react";
import logoMark from "../../assets/Logo/openhand-mark.png"; // exact OpenHand infinity-hand mark (transparent, colour-boosted)

/**
 * OpenHand — "Scattered in. One practice out." flow block
 * Left: scattered tools drift INTO the OpenHand core.
 * Right: what learners & practitioners get flows OUT.
 * Self-contained styles. Respects prefers-reduced-motion.
 */

const IN = [
  ["📹", "a video call link"], ["🗓️", "a booking app"], ["💳", "a payment link"], ["💬", "WhatsApp groups"],
  ["📝", "Google Forms"], ["📊", "Excel trackers"], ["🎓", "a certificate maker"], ["✉️", "an email tool"],
  ["🗒️", "a notes app"], ["👥", "a community app"], ["🧾", "an invoicing tool"], ["🔗", "a link-in-bio page"],
];

const OUT = [
  { who: "learner", items: ["a guide who gets you", "a 1:1 in three taps", "a 6-week Circle", "daily check-ins"] },
  { who: "practitioner", items: ["a practice at one link", "payouts on autopilot", "AURA session notes", "org & EAP seats"] },
  { who: "both", items: ["growth you can track", "a peer pod", "a verified profile", "whatever you've been putting off"] },
];

const rowsIn = [IN.slice(0, 4), IN.slice(4, 8), IN.slice(8, 12)];
const yIn = [70, 180, 290];   // row centres (px in a 360 tall stage)
const yOut = [70, 180, 290];

export default function OpenHandFlow({ logoSrc = logoMark }) {
  return (
    <section className="ohf">
      <style>{CSS}</style>
      <div className="ohf-wrap">
        <h2>Stop juggling twelve tabs.<br /><span>Hold it all in one <em className="ohf-nw">open hand.</em></span></h2>
        <p className="ohf-sub">Everything you were stitching together — held in one place, under your name.</p>

        <div className="ohf-stage">
          {/* connectors */}
          <svg className="ohf-lines" viewBox="0 0 1200 360" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="ohf-in" x1="0" x2="1"><stop offset="0" stopColor="#0B6BFF" stopOpacity="0" /><stop offset="1" stopColor="#0B6BFF" /></linearGradient>
              <linearGradient id="ohf-out" x1="0" x2="1"><stop offset="0" stopColor="#8E3FF3" /><stop offset="1" stopColor="#8E3FF3" stopOpacity="0" /></linearGradient>
            </defs>
            {yIn.map((y, i) => {
              const d = `M330 ${y} C 420 ${y}, 420 180, 470 180`;
              return (
                <g key={"i" + i}>
                  <path d={d} className="ohf-path in" />
                  <circle r="3.5" className="ohf-dot in"><animateMotion dur="2.4s" begin={`${i * 0.5}s`} repeatCount="indefinite" path={d} /></circle>
                </g>
              );
            })}
            {yOut.map((y, i) => {
              const d = `M730 180 C 780 180, 780 ${y}, 870 ${y}`;
              return (
                <g key={"o" + i}>
                  <path d={d} className="ohf-path out" />
                  <circle r="3.5" className="ohf-dot out"><animateMotion dur="2.4s" begin={`${0.3 + i * 0.5}s`} repeatCount="indefinite" path={d} /></circle>
                </g>
              );
            })}
          </svg>

          {/* IN */}
          <span className="ohf-mlabel">What you juggle today</span>
          <div className="ohf-side ohf-left">
            {rowsIn.map((row, r) => (
              <div className="ohf-row" key={r}>
                <div className="ohf-track" style={{ animationDuration: `${26 + r * 5}s` }}>
                  {[...row, ...row, ...row, ...row].map(([ic, t], i) => (
                    <span className="ohf-chip in" key={i}><i>{ic}</i>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <span className="ohf-vline in" aria-hidden="true"><i /></span>

          {/* CORE — exact OpenHand mark */}
          <div className="ohf-core" style={{ "--logo": `url(${logoSrc})` }}>
            <span className="ohf-aura" />
            <span className="ohf-ring r1" /><span className="ohf-ring r2" /><span className="ohf-ring r3" />
            <div className="ohf-glass">
              <img src={logoSrc} alt="" aria-hidden="true" className="ohf-mark-glow" />
              <img src={logoSrc} alt="OpenHand" className="ohf-mark" />
              <span className="ohf-mark-shine" aria-hidden="true" />
            </div>
            <span className="ohf-word">Open<b>Hand</b></span>
          </div>

          <span className="ohf-vline out" aria-hidden="true"><i /></span>
          <span className="ohf-mlabel out">What you get with OpenHand</span>

          {/* OUT */}
          <div className="ohf-side ohf-right">
            {OUT.map((row, r) => (
              <div className="ohf-row" key={r}>
                <div className="ohf-track" style={{ animationDuration: `${28 + r * 4}s` }}>
                  {[...row.items, ...row.items, ...row.items, ...row.items].map((t, i) => (
                    <span className={`ohf-chip out ${row.who}`} key={i}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ohf-legend">
          <span><i className="learner" />For learners</span>
          <span><i className="practitioner" />For practitioners</span>
          <span><i className="both" />For both</span>
        </div>
      </div>
    </section>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Inter:wght@400;500;600&display=swap');
.ohf{--ink:#0E0B3D;--muted:#5D5A82;--blue:#0B6BFF;--violet:#8E3FF3;--line:rgba(14,11,61,.09);
  position:relative;overflow:hidden;padding:88px 0 72px;font-family:Inter,system-ui,sans-serif;color:var(--ink);
  background:radial-gradient(600px 380px at 18% 60%,rgba(11,107,255,.10),transparent 70%),radial-gradient(600px 380px at 82% 60%,rgba(142,63,243,.12),transparent 70%),#FAFAFF}
.ohf *{box-sizing:border-box}
.ohf-wrap{max-width:1280px;margin:0 auto;padding:0 20px;text-align:center}
.ohf h2{font-family:'Playfair Display',Georgia,serif;font-weight:900;font-size:clamp(2.2rem,4.8vw,3.6rem);line-height:1.1;letter-spacing:-.02em;margin:0;color:#0F172A}
.ohf h2 span{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;color:#2563EB;background:none;-webkit-background-clip:unset;background-clip:unset}
.ohf-sub{font-family:Inter,system-ui,sans-serif;color:#475569;font-size:1.1rem;font-weight:400;line-height:1.6;margin:16px auto 0;max-width:620px}

.ohf-stage{position:relative;height:360px;margin-top:56px;display:grid;grid-template-columns:1fr 300px 1fr;align-items:center}
.ohf-lines{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.ohf-path{fill:none;stroke-width:1.5;stroke-dasharray:3 7;animation:ohf-dash 1.2s linear infinite}
.ohf-path.in{stroke:url(#ohf-in)}.ohf-path.out{stroke:url(#ohf-out)}
@keyframes ohf-dash{to{stroke-dashoffset:-20}}
.ohf-dot.in{fill:#0B6BFF;filter:drop-shadow(0 0 5px #0B6BFF)}.ohf-dot.out{fill:#8E3FF3;filter:drop-shadow(0 0 5px #8E3FF3)}

.ohf-side{position:relative;height:100%;display:flex;flex-direction:column;justify-content:space-between;padding:48px 0;overflow:hidden;z-index:1}
.ohf-left{-webkit-mask:linear-gradient(90deg,transparent,#000 12%,#000 62%,transparent 94%);mask:linear-gradient(90deg,transparent,#000 12%,#000 62%,transparent 94%)}
.ohf-right{-webkit-mask:linear-gradient(90deg,transparent 6%,#000 38%,#000 88%,transparent);mask:linear-gradient(90deg,transparent 6%,#000 38%,#000 88%,transparent)}
.ohf-row{overflow:hidden}
.ohf-track{display:flex;gap:12px;width:max-content;animation:ohf-slide linear infinite}
@keyframes ohf-slide{from{transform:translateX(-50%)}to{transform:translateX(0)}}

.ohf-chip{display:inline-flex;align-items:center;gap:8px;white-space:nowrap;padding:11px 18px;border-radius:14px;font-size:.92rem;font-weight:500}
.ohf-chip.in{color:var(--muted);background:rgba(255,255,255,.75);border:1px dashed rgba(14,11,61,.18);backdrop-filter:blur(8px)}
.ohf-chip.in i{font-style:normal;filter:grayscale(1);opacity:.75}
.ohf-chip.out{color:var(--ink);background:#fff;border:1px solid transparent;
  background:linear-gradient(#fff,#fff) padding-box,linear-gradient(90deg,var(--c1),var(--c2)) border-box;box-shadow:0 8px 22px -12px var(--c2)}
.ohf-chip.out svg{color:var(--c2)}
.ohf-chip.learner{--c1:#5AA0FF;--c2:#0B6BFF}
.ohf-chip.practitioner{--c1:#B37BFF;--c2:#8E3FF3}
.ohf-chip.both{--c1:#0B6BFF;--c2:#8E3FF3}

.ohf-core{position:relative;justify-self:center;width:280px;height:180px;display:grid;place-items:center;z-index:2}
.ohf-aura{position:absolute;inset:-30px -10px;border-radius:50%;background:conic-gradient(from 0deg,#0B6BFF,#3F3BEA,#9A45F6,#C04BFF,#0B6BFF);filter:blur(42px);opacity:.42;animation:ohf-spin 9s linear infinite}
@keyframes ohf-spin{to{transform:rotate(360deg)}}
.ohf-ring{position:absolute;border-radius:50%;border:1.5px solid rgba(63,59,234,.25)}
.ohf-ring.r1{inset:-8px -14px;animation:ohf-pulse 3.2s ease-out infinite}
.ohf-ring.r2{inset:-34px -44px;border-color:rgba(110,60,240,.16);animation:ohf-pulse 3.2s 1.1s ease-out infinite}
.ohf-ring.r3{inset:-62px -78px;border-color:rgba(110,60,240,.09)}
@keyframes ohf-pulse{0%{transform:scale(.9);opacity:1}100%{transform:scale(1.25);opacity:0}}
.ohf-glass{position:relative;width:100%;height:150px;border-radius:999px;display:grid;place-items:center;
  background:linear-gradient(rgba(255,255,255,.82),rgba(255,255,255,.66)) padding-box,linear-gradient(120deg,#0B6BFF,#9A45F6) border-box;border:2px solid transparent;
  backdrop-filter:blur(16px) saturate(1.4);box-shadow:0 30px 70px -20px rgba(63,59,234,.55),0 0 0 8px rgba(255,255,255,.55),inset 0 2px 0 rgba(255,255,255,.9)}
.ohf-mark,.ohf-mark-glow{position:absolute;width:224px;height:auto;left:50%;top:50%;transform:translate(-50%,-50%)}
.ohf-mark{filter:saturate(1.25) drop-shadow(0 6px 14px rgba(63,59,234,.35));animation:ohf-float 5s ease-in-out infinite}
.ohf-mark-glow{filter:blur(16px) saturate(1.8);opacity:.75;animation:ohf-glow 5s ease-in-out infinite}
@keyframes ohf-float{50%{transform:translate(-50%,calc(-50% - 4px))}}
@keyframes ohf-glow{50%{opacity:1;transform:translate(-50%,-50%) scale(1.06)}}
.ohf-mark-shine{position:absolute;width:224px;aspect-ratio:560/249;left:50%;top:50%;transform:translate(-50%,-50%);animation:ohf-float 5s ease-in-out infinite;
  -webkit-mask:var(--logo) center/contain no-repeat;mask:var(--logo) center/contain no-repeat;
  background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.85) 50%,transparent 65%) 0 0/300% 100% no-repeat;animation:ohf-float 5s ease-in-out infinite,ohf-shine 3.6s ease-in-out infinite}
@keyframes ohf-shine{0%{background-position:100% 0}60%,100%{background-position:0 0}}
.ohf-word{position:absolute;top:calc(100% + 14px);font-family:Sora,Inter,sans-serif;font-weight:700;font-size:1.15rem;letter-spacing:-.01em;color:#0E0B3D;white-space:nowrap}
.ohf-word b{background:linear-gradient(90deg,#3F3BEA,#9A45F6);-webkit-background-clip:text;background-clip:text;color:transparent}
.ohf-legend{display:flex;justify-content:center;gap:22px;margin-top:22px;font-size:.84rem;color:var(--muted)}
.ohf-legend span{display:inline-flex;align-items:center;gap:7px}
.ohf-legend i{width:10px;height:10px;border-radius:50%}
.ohf-legend .learner{background:#0B6BFF}.ohf-legend .practitioner{background:#8E3FF3}.ohf-legend .both{background:linear-gradient(90deg,#0B6BFF,#8E3FF3)}

.ohf-mlabel,.ohf-vline{display:none}
.ohf h2,.ohf-sub{text-wrap:balance}
.ohf-nw{white-space:nowrap}
@media (max-width:820px){
  .ohf{padding:60px 0 48px;background:radial-gradient(420px 300px at 50% 30%,rgba(11,107,255,.10),transparent 70%),radial-gradient(420px 300px at 50% 75%,rgba(142,63,243,.12),transparent 70%),#FAFAFF}
  .ohf-wrap{padding:0 16px}
  .ohf h2{font-size:clamp(1.65rem,7.4vw,2.3rem);line-height:1.12}
  .ohf-sub{font-size:.95rem;margin-top:12px}
  .ohf-stage{height:auto;grid-template-columns:1fr;gap:0;margin:32px -16px 0;justify-items:center}
  .ohf-lines{display:none}
  .ohf-side{width:100%;padding:0;gap:8px}
  .ohf-left,.ohf-right{-webkit-mask:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);mask:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)}
  .ohf-chip{font-size:.8rem;padding:8px 12px;border-radius:12px}
  .ohf-track{gap:8px}
  .ohf-mlabel{display:block;margin:0 0 12px;font-size:.68rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#0B6BFF}
  .ohf-mlabel.out{color:#8E3FF3;margin-top:4px}
  .ohf-vline{display:block;position:relative;width:2px;height:40px;margin:10px 0;border-radius:2px;overflow:hidden}
  .ohf-vline.in{background:repeating-linear-gradient(to bottom,rgba(11,107,255,.5) 0 3px,transparent 3px 8px)}
  .ohf-vline.out{background:repeating-linear-gradient(to bottom,rgba(142,63,243,.5) 0 3px,transparent 3px 8px)}
  .ohf-vline i{position:absolute;left:-2px;width:6px;height:6px;border-radius:50%;animation:ohf-drop 1.6s linear infinite}
  .ohf-vline.in i{background:#0B6BFF;box-shadow:0 0 8px #0B6BFF}.ohf-vline.out i{background:#8E3FF3;box-shadow:0 0 8px #8E3FF3;animation-delay:.8s}
  .ohf-core{width:200px;height:118px;margin:14px 0 34px}
  .ohf-glass{height:104px;box-shadow:0 18px 40px -16px rgba(63,59,234,.5),0 0 0 6px rgba(255,255,255,.6),inset 0 2px 0 rgba(255,255,255,.9)}
  .ohf-mark,.ohf-mark-glow,.ohf-mark-shine{width:152px}
  .ohf-mark-glow{filter:blur(12px) saturate(1.6);opacity:.55}
  .ohf-aura{inset:-10px 10px;filter:blur(30px);opacity:.28}
  .ohf-ring.r1{inset:-6px -10px}.ohf-ring.r2{inset:-18px -26px}.ohf-ring.r3{display:none}
  .ohf-word{top:calc(100% + 8px);font-size:1rem}
  .ohf-legend{flex-wrap:wrap;gap:8px 16px;margin-top:22px;font-size:.78rem}
}
@keyframes ohf-drop{from{top:-6px}to{top:100%}}
@media (prefers-reduced-motion:reduce){.ohf *{animation:none!important}.ohf-dot{display:none}}
`;
