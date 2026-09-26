/**
 * OpenHand · AURA — "You hold the space. AURA holds the thread."
 * Single-file React page.
 * Fonts: Geist, Geist Mono, Instrument Serif (Google Fonts, loaded at runtime).
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { OHFooter } from "../../components/openhand";
import logoIcon from "../../assets/Logo/Logo-Icon.png";

/* ─────────────────────────── data ─────────────────────────── */

const SESSION_SCRIPT = [
  { k: "line", who: "Coach", text: "Last time you wanted to be seen for your strategy work. Where did that land this week?" },
  { k: "line", who: "Learner", text: "I pitched the idea… and then let my manager present it.", tag: "Visibility" },
  { k: "thread", text: "“Letting others present” has surfaced in 3 of your last 4 sessions." },
  { k: "line", who: "Coach", text: "What made handing it over feel safer?" },
  { k: "line", who: "Learner", text: "If it failed, it wouldn't be my name on it.", tag: "Fear of judgement" },
  { k: "suggest", text: "You might explore: what would “my name on it” look like at a size that feels safe?" },
  { k: "line", who: "Learner", text: "Maybe I present just the first five minutes at the next review.", tag: "Commitment" },
  { k: "action", text: "Action noticed — present the opening 5 min at next review." },
];

const NOTE = {
  takeaways: [
    "Pattern of handing visible work to others — 3rd occurrence",
    "Named the fear directly: ownership = exposure to judgement",
  ],
  actions: ["Present opening 5 minutes at next quarterly review", "Journal one ‘seen’ moment each day"],
  followup: "Revisit how the 5-minute presentation felt — Session 5",
};

const SESSIONS = [
  { id: 1, label: "S1", date: "Jun 04", note: "Wants a move into strategy" },
  { id: 2, label: "S2", date: "Jun 18", note: "Overwhelm — saying yes to everything" },
  { id: 3, label: "S3", date: "Jul 02", note: "Skipped the leadership offsite" },
  { id: 4, label: "S4", date: "Jul 16", note: "Let manager present the pitch" },
  { id: 5, label: "S5", date: "Jul 30", note: "Declined an extra project — first ‘no’" },
  { id: 6, label: "S6", date: "Aug 13", note: "Presented for 5 minutes. Hands shook. Did it." },
];

const THEMES = [
  { name: "Visibility", color: "#0C6DFF", in: [1, 3, 4, 6] },
  { name: "Confidence", color: "#4F2FE0", in: [2, 4, 5, 6] },
  { name: "Boundaries", color: "#9137EF", in: [2, 5] },
  { name: "Career move", color: "#E0A21B", in: [1, 5, 6] },
];

const ALWAYS = [
  ["Asks first", "Explicit verbal and digital consent from your learner before a single word is heard."],
  ["Stops instantly", "Consent withdrawn mid-sentence? Listening ends in that moment."],
  ["Stays on your screen", "Suggestions appear only to you. Never shared, never shown."],
  ["Encrypts everything", "End-to-end, with retention windows you control."],
  ["Lets you leave", "One-click export. One-click permanent wipe."],
];

const NEVER = [
  ["Speak to your learner", "No voice, no pop-ups, no presence on their screen."],
  ["Diagnose or prescribe", "It never replaces clinical or professional judgement."],
  ["Message on your behalf", "Nothing reaches a learner without your explicit approval."],
  ["Record without consent", "No live, revocable consent — no audio. Ever."],
  ["Train public models", "Your sessions never feed external public AI models."],
];

const TRUST = [
  {
    name: "Notes",
    line: "Start here. AURA listens with consent, then drafts aftercare notes in ~90 seconds. You edit, you approve.",
    on: ["Consent-gated listening", "~90s note drafts", "You approve every word"],
  },
  {
    name: "Memory",
    line: "Let AURA connect sessions. Recurring themes surface in a quiet prep brief before you begin.",
    on: ["Everything in Notes", "Cross-session threads", "Pre-session brief"],
  },
  {
    name: "Live panel",
    line: "When you trust it: gentle, private prompts on your screen while you coach. Ignore them freely.",
    on: ["Everything in Memory", "Private in-session prompts", "One-tap mute"],
  },
];

/* ─────────────────────────── hooks ─────────────────────────── */

function useInView(ref, threshold = 0.25) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return seen;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".au .rv");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─────────────────────────── the living thread (infinity) ─────────────────────────── */

function lemniscate(a = 250, cx = 300, cy = 170, n = 260, from = 0, to = Math.PI * 2) {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const t = from + (to - from) * (i / n);
    const s = Math.sin(t), c = Math.cos(t), k = 1 + s * s;
    d += `${i ? "L" : "M"}${(cx + (a * c) / k).toFixed(1)} ${(cy + (a * 1.3 * s * c) / k).toFixed(1)}`;
  }
  return d;
}
const LOOP_D = lemniscate();
const OVER_D = lemniscate(250, 300, 170, 60, Math.PI / 2 - 0.5, Math.PI / 2 + 0.5);
const loopPoint = (t, a = 250, cx = 300, cy = 170) => {
  const s = Math.sin(t), c = Math.cos(t), k = 1 + s * s;
  return [cx + (a * c) / k, cy + (a * 1.3 * s * c) / k];
};
const LOOP_NODES = [0.35, 1.05, 2.1, 3.5, 4.2, 5.3].map((t, i) => ({ id: i + 1, p: loopPoint(t) }));

function InfinityThread({ live = true, mini = false, uid = "a" }) {
  const g = (n) => `${n}-${uid}`;
  return (
    <svg className={`thread-svg ${live ? "" : "off"} ${mini ? "mini" : ""}`} viewBox="0 0 600 340" aria-hidden="true">
      <defs>
        <linearGradient id={g("rib")} x1="40" y1="0" x2="560" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={mini ? "#FFFFFF" : "#0C6DFF"} />
          <stop offset=".42" stopColor={mini ? "#E0E7FF" : "#2F3BE0"} />
          <stop offset=".7" stopColor={mini ? "#EDE9FE" : "#5B2FE0"} />
          <stop offset="1" stopColor={mini ? "#F5F3FF" : "#9137EF"} />
        </linearGradient>
        <linearGradient id={g("shade")} x1="0" y1="40" x2="0" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#1D21A9" stopOpacity={mini ? 0 : 0.35} />
        </linearGradient>
        <filter id={g("blur")} x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="18" /></filter>
        <filter id={g("glow")} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {/* soft coloured shadow */}
      {!mini && <path d={LOOP_D} fill="none" stroke={`url(#${g("rib")})`} strokeWidth="40" opacity=".35" filter={`url(#${g("blur")})`} transform="translate(0 22)" />}
      {/* ribbon */}
      <path className="rib" d={LOOP_D} fill="none" stroke={`url(#${g("rib")})`} strokeWidth={mini ? 18 : 34} strokeLinecap="round" />
      <path d={LOOP_D} fill="none" stroke={`url(#${g("shade")})`} strokeWidth={mini ? 18 : 34} strokeLinecap="round" />
      {/* over-under crossing, like the mark */}
      <path d={OVER_D} fill="none" stroke={mini ? "transparent" : "var(--cut)"} strokeWidth="46" strokeLinecap="butt" />
      <path d={OVER_D} fill="none" stroke={`url(#${g("rib")})`} strokeWidth={mini ? 18 : 34} strokeLinecap="butt" />
      <path d={OVER_D} fill="none" stroke={`url(#${g("shade")})`} strokeWidth={mini ? 18 : 34} strokeLinecap="butt" />
      {/* inner highlight */}
      <path d={LOOP_D} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2" transform="translate(0 -9)" />

      {/* light travelling the thread */}
      <path className="comet c1" d={LOOP_D} pathLength="1" fill="none" stroke="#fff" strokeWidth={mini ? 7 : 9} strokeLinecap="round" filter={`url(#${g("glow")})`} />
      <path className="comet c2" d={LOOP_D} pathLength="1" fill="none" stroke="#fff" strokeWidth={mini ? 4 : 5} strokeLinecap="round" filter={`url(#${g("glow")})`} />

      {/* session beads */}
      {!mini && LOOP_NODES.map((n, i) => (
        <g key={n.id} className="bead" style={{ animationDelay: `${i * 0.55}s` }}>
          <circle cx={n.p[0]} cy={n.p[1]} r="11" fill="#fff" />
          <circle cx={n.p[0]} cy={n.p[1]} r="5" fill={i < 3 ? "#0C6DFF" : "#9137EF"} />
        </g>
      ))}
    </svg>
  );
}

function ThreadStage() {
  const [live, setLive] = useState(true);
  const ref = useRef(null);
  const move = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--rx", `${((e.clientY - r.top) / r.height - 0.5) * -10}deg`);
    el.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 14}deg`);
  };
  const leave = () => { ref.current?.style.setProperty("--rx", "0deg"); ref.current?.style.setProperty("--ry", "0deg"); };
  return (
    <div className="stage-wrap rv">
      <div className={`stage ${live ? "" : "is-silent"}`} ref={ref} onPointerMove={move} onPointerLeave={leave}>
        <div className="stage-3d">
          <div className="orbit o1" aria-hidden="true" /><div className="orbit o2" aria-hidden="true" />
          <InfinityThread live={live} />
          <div className="gcard gc1">
            <span className="gdot" /><div><b>AURA is listening</b><small>Consent granted · <Clock running={live} /></small></div>
          </div>
          <div className="gcard gc2">
            <span className="gic">∞</span><div><b>Thread noticed</b><small>“Visibility” · 3rd session in a row</small></div>
          </div>
          <div className="gcard gc3">
            <span className="gic ok">✓</span><div><b>Aftercare note drafted</b><small>87 seconds · awaiting your approval</small></div>
          </div>
        </div>
      </div>
      <div className="consent-row">
        <button className={`consent ${live ? "on" : ""}`} onClick={() => setLive((v) => !v)} aria-pressed={live} type="button">
          <span className="knob" />
          <span className="consent-l">Learner consent</span>
          <span className="consent-v">{live ? "Granted" : "Withdrawn"}</span>
        </button>
        <span className="orb-hint" role="status" aria-live="polite">{live ? "Try it — withdraw consent." : "AURA is silent. Nothing is being heard."}</span>
      </div>
    </div>
  );
}

const Icon = ({ name }) => {
  const p = { fill: "none", stroke: "url(#ig)", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
      <defs><linearGradient id="ig" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0C6DFF" /><stop offset="1" stopColor="#9137EF" /></linearGradient></defs>
      {name === "brain" && <g {...p}><path d="M24 9c-3-3-9-2-10 3-4 0-7 4-5 8-3 2-3 7 0 9-1 4 2 8 6 8 1 4 6 5 9 2V9z" /><path d="M24 9c3-3 9-2 10 3 4 0 7 4 5 8 3 2 3 7 0 9 1 4-2 8-6 8-1 4-6 5-9 2" /><path d="M24 16h-5m5 8h-7m7 8h-5M24 20h6m-6 8h8" /></g>}
      {name === "spark" && <g {...p}><path d="M24 8c1.5 8 4.5 11 12 13-7.5 2-10.5 5-12 13-1.5-8-4.5-11-12-13 7.5-2 10.5-5 12-13z" /><path d="M10 8v6M7 11h6M38 34v6M35 37h6M39 7v4M37 9h4" /></g>}
      {name === "chat" && <g {...p}><path d="M9 11h30a3 3 0 013 3v17a3 3 0 01-3 3H22l-8 6v-6H9a3 3 0 01-3-3V14a3 3 0 013-3z" /><path d="M17 22.5h.01M24 22.5h.01M31 22.5h.01" strokeWidth="3" /></g>}
      {name === "shield" && <g {...p}><path d="M24 6l15 5v11c0 10-6.5 17-15 20C15.5 39 9 32 9 22V11l15-5z" /><rect x="18" y="22" width="12" height="9" rx="2" /><path d="M20.5 22v-3a3.5 3.5 0 017 0v3" /></g>}
    </svg>
  );
};

/* ─────────────────────────── small pieces ─────────────────────────── */

const Logo = ({ size = 32 }) => <img className="mark" src={logoIcon} alt="OpenHand" width={size} height={Math.round(size * 0.95)} />;

function Tilt({ className = "", children }) {
  const ref = useRef(null);
  const move = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 8}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 10}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };
  const leave = () => {
    if (!ref.current) return;
    ref.current.style.setProperty("--rx", "0deg");
    ref.current.style.setProperty("--ry", "0deg");
  };
  return <div ref={ref} className={`tilt ${className}`} onPointerMove={move} onPointerLeave={leave}>{children}</div>;
}

function Clock({ running }) {
  const [s, setS] = useState(862);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setS((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const f = (n) => String(n).padStart(2, "0");
  return <span className="mono">{f(Math.floor(s / 3600))}:{f(Math.floor(s / 60) % 60)}:{f(s % 60)}</span>;
}

const FEATURES = [
  { icon: "brain", t: "Understands your context", d: "Carries every thread across sessions" },
  { icon: "spark", t: "Suggests smartly", d: "Private prompts, only on your screen" },
  { icon: "chat", t: "Supports instantly", d: "Aftercare notes drafted in ~90s" },
  { icon: "shield", t: "Protects confidentiality", d: "Consent-gated, encrypted, never sold" },
];

function Hero() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow rv"><span className="pulse" /> Meet OpenHand AURA</p>
          <h1 className="rv">
            Every great coach deserves an <span className="grad">intelligent partner.</span>
          </h1>
          <p className="tagline rv">Present when invited. <span>Never interrupting.</span></p>
          <p className="lede rv">
            AURA sits quietly beside you — listening only with your learner’s consent, holding the thread across
            every session, and drafting aftercare notes in about ninety seconds. You stay fully human.
          </p>
          <div className="cta-row rv">
            <Link className="btn btn-prime" to="/signup">Experience AURA free <span aria-hidden>→</span></Link>
            <a className="btn btn-ghost" href="#vows">Our ethical vows</a>
          </div>
          <ul className="chips rv">
            <li>Consent-first</li><li>0% public AI training</li><li>~90s notes</li><li>Free on every plan</li>
          </ul>
        </div>
        <ThreadStage />
      </section>

      <section className="features rv" aria-label="What AURA does">
        {FEATURES.map((f) => (
          <div className="feat" key={f.t}>
            <span className="feat-ic"><Icon name={f.icon} /></span>
            <h3>{f.t}</h3>
            <p>{f.d}</p>
          </div>
        ))}
      </section>
    </>
  );
}

function Marquee() {
  const words = ["It listens", "It remembers", "It suggests", "It writes", "It never speaks to your learner", "It asks first", "It forgets on command"];
  const row = words.map((w, i) => <span key={i}>{w}<b>✦</b></span>);
  return <div className="marquee" aria-hidden="true"><div className="track">{row}{row}</div></div>;
}

function LiveSession() {
  const ref = useRef(null);
  const inView = useInView(ref, 0.3);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | live | drafting | done
  const [secs, setSecs] = useState(0);
  const feedRef = useRef(null);

  const start = () => { setStep(0); setSecs(0); setPhase("live"); };
  useEffect(() => { if (inView && phase === "idle") start(); }, [inView]); // eslint-disable-line

  useEffect(() => {
    if (phase !== "live") return;
    if (step >= SESSION_SCRIPT.length) { const t = setTimeout(() => setPhase("drafting"), 900); return () => clearTimeout(t); }
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 500 : 1500);
    return () => clearTimeout(t);
  }, [phase, step]);

  useEffect(() => {
    if (phase !== "drafting") return;
    const id = setInterval(() => setSecs((s) => {
      if (s >= 87) { clearInterval(id); setPhase("done"); return 87; }
      return s + 3;
    }), 70);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => { const f = feedRef.current; if (f) f.scrollTo({ top: f.scrollHeight, behavior: "smooth" }); }, [step]);

  const shown = SESSION_SCRIPT.slice(0, step);
  const lines = shown.filter((e) => e.k === "line");
  const privates = shown.filter((e) => e.k !== "line");
  const tags = [...new Set(lines.filter((l) => l.tag).map((l) => l.tag))];

  return (
    <section className="block" id="session" ref={ref}>
      <div className="head rv">
        <p className="eyebrow">A session, re-imagined</p>
        <h2>Watch AURA work <em className="serif">quietly.</em></h2>
        <p className="sub">A simulated session. Your learner sees nothing but you. You see the thread.</p>
      </div>

      <div className="os rv">
        <div className="os-bar">
          <span className="lights"><i /><i /><i /></span>
          <span className="mono os-title">Session 4 · Career transition · R.</span>
          <span className={`os-live ${phase === "live" ? "on" : ""}`}>{phase === "live" ? "● Live" : phase === "idle" ? "Ready" : "Ended"}</span>
        </div>

        <div className="os-body">
          <div className="pane transcript" ref={feedRef}>
            <p className="pane-l mono">Conversation</p>
            {lines.map((l, i) => (
              <div key={i} className={`msg ${l.who === "Coach" ? "coach" : "learner"}`}>
                <span className="who mono">{l.who}</span>
                <p>{l.text}</p>
                {l.tag && <span className="tag">{l.tag}</span>}
              </div>
            ))}
            {phase === "live" && <div className="typing"><i /><i /><i /></div>}
          </div>

          <div className="pane private">
            <p className="pane-l mono"><span className="lock">◉</span> Only you see this</p>
            {tags.length > 0 && <div className="threads">{tags.map((t) => <span key={t} className="tag glow">{t}</span>)}</div>}
            {privates.map((p, i) => (
              <div key={i} className={`card-p ${p.k}`}>
                <span className="mono k">{p.k === "thread" ? "Thread" : p.k === "suggest" ? "Gentle prompt" : "Action"}</span>
                <p>{p.text}</p>
              </div>
            ))}
            {privates.length === 0 && <p className="empty">AURA stays out of your way until something is worth your glance.</p>}
          </div>
        </div>

        {(phase === "drafting" || phase === "done") && (
          <div className="note">
            <div className="note-head">
              <span className="mono">Aftercare note · draft</span>
              <span className="mono timer">{phase === "done" ? `Drafted in ${secs}s` : `Drafting… ${secs}s`}</span>
            </div>
            <div className="bar"><i style={{ width: `${(secs / 87) * 100}%` }} /></div>
            {phase === "done" && (
              <div className="note-grid">
                <div><h4>Key takeaways</h4><ul>{NOTE.takeaways.map((x) => <li key={x}>{x}</li>)}</ul></div>
                <div><h4>Action items</h4><ul>{NOTE.actions.map((x) => <li key={x}>{x}</li>)}</ul></div>
                <div><h4>Follow up</h4><p>{NOTE.followup}</p>
                  <div className="note-btns"><Link to="/signup" className="btn btn-prime sm">Approve</Link><button type="button" className="btn btn-ghost sm">Edit</button></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="center rv"><button type="button" className="btn btn-ghost sm" onClick={start}>↻ Replay session</button></div>
    </section>
  );
}

function Capabilities() {
  const items = [
    { k: "01", t: "It listens", d: "Ambient, consent-gated, and silent. No bots joining calls, no awkward pauses.", viz: "wave" },
    { k: "02", t: "It remembers", d: "Every session builds on the last. Patterns surface before you have to hunt for them.", viz: "mem" },
    { k: "03", t: "It suggests", d: "A private whisper on your screen — a question, a thread, a follow-up. Take it or leave it.", viz: "sug" },
    { k: "04", t: "It writes", d: "Structured aftercare notes in ~90 seconds. Takeaways, actions, follow-ups. You approve.", viz: "doc" },
  ];
  return (
    <section className="block">
      <div className="head rv">
        <p className="eyebrow">Four quiet superpowers</p>
        <h2>Less admin. More <em className="serif">presence.</em></h2>
      </div>
      <div className="bento">
        {items.map((it, i) => (
          <Tilt key={it.k} className={`bento-c rv c${i}`}>
            <span className="mono k">{it.k}</span>
            <div className={`viz ${it.viz}`} aria-hidden="true">
              {it.viz === "wave" && Array.from({ length: 28 }, (_, j) => <i key={j} style={{ animationDelay: `${j * 0.06}s` }} />)}
              {it.viz === "mem" && ["Career transition", "Improve confidence", "Follow up next month"].map((x, j) => <span key={x} style={{ animationDelay: `${j * 0.4}s` }}>{x}</span>)}
              {it.viz === "sug" && <span className="whisper">“How about exploring a new perspective?”</span>}
              {it.viz === "doc" && <><b /><b /><b /><b /></>}
            </div>
            <h3>{it.t}</h3>
            <p>{it.d}</p>
          </Tilt>
        ))}
      </div>
    </section>
  );
}

function ThreadMap() {
  const [active, setActive] = useState("Visibility");
  const [hover, setHover] = useState(null);
  const W = 1000, H = 320;
  const pos = (id) => {
    const x = 80 + ((id - 1) / (SESSIONS.length - 1)) * (W - 160);
    const y = H / 2 + Math.sin(id * 1.3) * 52;
    return [x, y];
  };
  const theme = THEMES.find((t) => t.name === active);
  const path = (ids) => ids.reduce((d, id, i) => {
    const [x, y] = pos(id);
    if (i === 0) return `M${x},${y}`;
    const [px, py] = pos(ids[i - 1]);
    const mx = (px + x) / 2;
    return `${d} C${mx},${py - 110} ${mx},${y - 110} ${x},${y}`;
  }, "");

  return (
    <section className="block">
      <div className="head rv">
        <p className="eyebrow">Thread memory</p>
        <h2>Every session, a thread.<br />Every thread, a <em className="serif grad">story.</em></h2>
        <p className="sub">Pick a theme to see how it travels through a learner’s journey. (Illustrative example.)</p>
      </div>
      <div className="threadmap rv">
        <div className="theme-pills" role="tablist">
          {THEMES.map((t) => (
            <button key={t.name} type="button" role="tab" aria-selected={active === t.name}
              className={`pill ${active === t.name ? "on" : ""}`} style={{ "--c": t.color }} onClick={() => setActive(t.name)}>
              <i />{t.name}<small>{t.in.length}×</small>
            </button>
          ))}
        </div>
        <div className="svg-wrap">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${active} appears in ${theme.in.length} sessions`}>
            <defs>
              <filter id="glow"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <path d={SESSIONS.map((s, i) => `${i ? "L" : "M"}${pos(s.id).join(",")}`).join(" ")} stroke="rgba(13,24,69,.18)" strokeDasharray="3 7" fill="none" />
            <path key={active} className="thread-path" d={path(theme.in)} stroke={theme.color} strokeWidth="2.5" fill="none" filter="url(#glow)" pathLength="1" />
            {SESSIONS.map((s) => {
              const [x, y] = pos(s.id), on = theme.in.includes(s.id);
              return (
                <g key={s.id} className="node" onPointerEnter={() => setHover(s.id)} onPointerLeave={() => setHover(null)} tabIndex="0" onFocus={() => setHover(s.id)} onBlur={() => setHover(null)}>
                  <circle cx={x} cy={y} r={on ? 22 : 14} fill={on ? theme.color : "#E7E9F8"} opacity={on ? 0.18 : 1} />
                  <circle cx={x} cy={y} r={on ? 9 : 6} fill={on ? theme.color : "#B9BFE6"} />
                  <text x={x} y={y + 50} textAnchor="middle" className="svg-l">{s.label} · {s.date}</text>
                </g>
              );
            })}
          </svg>
          <div className="map-note" aria-live="polite">
            {hover ? <><span className="mono">{SESSIONS[hover - 1].label}</span> {SESSIONS[hover - 1].note}</> : <>Hover a session to read its moment.</>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Manifesto() {
  const ref = useRef(null);
  const [p, setP] = useState(0);
  const text = "The most powerful moment in coaching is the one where you forget to take notes. AURA exists so you can.";
  const words = text.split(" ");
  useEffect(() => {
    const on = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const v = 1 - (r.top + r.height * 0.4) / window.innerHeight;
      setP(Math.max(0, Math.min(1, v * 1.4)));
    };
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <section className="manifesto" ref={ref}>
      <p className="serif">
        {words.map((w, i) => <span key={i} className={i / words.length < p ? "lit" : ""} style={{ opacity: i / words.length < p ? 1 : 0.14 }}>{w} </span>)}
      </p>
    </section>
  );
}

function Vows() {
  return (
    <section className="block" id="vows">
      <div className="head rv">
        <p className="eyebrow">Ethical architecture</p>
        <h2>Built around the <em className="serif">boundary,</em><br />not the shortcut.</h2>
      </div>
      <div className="vows">
        <div className="vow-col rv">
          <p className="vow-h always mono">AURA always</p>
          {ALWAYS.map(([t, d]) => <div className="vow" key={t}><span className="ic ok">✓</span><div><h4>{t}</h4><p>{d}</p></div></div>)}
        </div>
        <div className="vow-col rv">
          <p className="vow-h never mono">AURA never</p>
          {NEVER.map(([t, d]) => <div className="vow" key={t}><span className="ic no">✕</span><div><h4>{t}</h4><p>{d}</p></div></div>)}
        </div>
      </div>
    </section>
  );
}

function TrustDial() {
  const [lvl, setLvl] = useState(0);
  return (
    <section className="block">
      <div className="head rv">
        <p className="eyebrow">Adopt at your own pace</p>
        <h2>Start with the notes.<br />Add the panel <em className="serif grad">when you trust it.</em></h2>
      </div>
      <div className="dial rv">
        <div className="dial-track" role="radiogroup" aria-label="Trust level">
          <div className="dial-fill" style={{ width: `${(lvl / 2) * 100}%` }} />
          {TRUST.map((t, i) => (
            <button key={t.name} type="button" role="radio" aria-checked={lvl === i} className={`stop ${i <= lvl ? "on" : ""}`}
              style={{ left: `${(i / 2) * 100}%` }} onClick={() => setLvl(i)}>
              <i /><span>{t.name}</span>
            </button>
          ))}
        </div>
        <div className="dial-card" key={lvl}>
          <p className="dial-line">{TRUST[lvl].line}</p>
          <ul>{TRUST[lvl].on.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="final-wrap" id="start">
      <div className="final rv">
        <div className="final-loop"><InfinityThread mini uid="f" /></div>
        <h2>Coach like the future<br /><em className="serif">already arrived.</em></h2>
        <p className="sub">Post-session notes are free on every practitioner plan. Nothing switches on until you do.</p>
        <div className="cta-row center">
          <Link className="btn btn-white" to="/signup">Start your free practice space <span aria-hidden>→</span></Link>
          <a className="btn btn-outline-w" href="mailto:connect@openhand.live?subject=AURA%20Ethics%20Desk">Ask our Ethics Desk</a>
        </div>
      </div>
    </section>
  );
}

function Band() {
  return (
    <section className="band">
      <svg className="band-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 50 C240 90 480 0 720 30 C960 60 1200 10 1440 40 L1440 80 L0 80Z" />
      </svg>
      <div className="band-in">
        <span className="band-heart" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="30" height="30"><path fill="url(#hg)" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 3.1 4.5 6.9 4.5c2.1 0 3.6 1.2 5.1 3 1.5-1.8 3-3 5.1-3 3.8 0 6 3.8 4.5 7.3C19.5 16.4 12 21 12 21z"/><defs><linearGradient id="hg" x1="0" x2="1"><stop offset="0" stopColor="#4F46E5"/><stop offset="1" stopColor="#8B5CF6"/></linearGradient></defs></svg>
        </span>
        <p className="band-line">Built for coaches.<br />Designed for <em>impact.</em></p>
        <span className="band-tag">#OpenHand</span>
        <span className="band-logo"><Logo size={42} /></span>
      </div>
    </section>
  );
}

/* ─────────────────────────── main page component ─────────────────────────── */

export function CoPilot() {
  const rootRef = useRef(null);
  useReveal();

  useEffect(() => {
    const id = "au-fonts";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Outfit:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap";
      document.head.appendChild(l);
    }
    const on = (e) => {
      rootRef.current?.style.setProperty("--x", `${e.clientX}px`);
      rootRef.current?.style.setProperty("--y", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", on);
    return () => window.removeEventListener("pointermove", on);
  }, []);

  return (
    <div className="au" ref={rootRef}>
      <style>{CSS}</style>
      <div className="bg" aria-hidden="true">
        <i className="a1" />
        <i className="a2" />
        <i className="a3" />
        <div className="grid" />
        <div className="spot" />
        <div className="grain" />
      </div>

      <main>
        <Hero />
        <Marquee />
        <LiveSession />
        <Capabilities />
        <ThreadMap />
        <Manifesto />
        <Vows />
        <TrustDial />
        <FinalCTA />
      </main>

      <Band />

      {/* Official OpenHand Platform Footer preserved as requested */}
      <OHFooter />
    </div>
  );
}

export default CoPilot;

/* ─────────────────────────── styles · OpenHand brand theme ─────────────────────────── */

const CSS = `
@property --a{syntax:'<angle>';initial-value:0deg;inherits:false}
.au{--bg:#FAFBFF;--cut:#FAFBFF;--ink:#0D1845;--mute:#4A5378;--dim:#8A91B4;--line:#E3E6F6;--card:#FFFFFF;
--blue:#0C6DFF;--blue2:#0052F0;--indigo:#1D21A9;--violet:#5B2FE0;--purple:#9137EF;--navy:#0B1238;
--brand:linear-gradient(100deg,#0C6DFF 0%,#2F3BE0 45%,#5B2FE0 70%,#9137EF 100%);
--shadow:0 1px 2px rgba(13,24,69,.04),0 12px 40px -12px rgba(29,33,169,.18);
--sans:'Geist',ui-sans-serif,system-ui,sans-serif;--display:'Outfit',var(--sans);--serif:'Instrument Serif',Georgia,serif;--mono:'Geist Mono',ui-monospace,monospace;
position:relative;min-height:100vh;background:var(--bg);color:var(--ink);font-family:var(--sans);overflow-x:hidden;-webkit-font-smoothing:antialiased}
.au *{box-sizing:border-box}.au a{color:inherit;text-decoration:none}.au button{font:inherit;color:inherit;cursor:pointer}
.au ::selection{background:rgba(12,109,255,.18)}
.au main{position:relative;z-index:1}
.au h1,.au h2,.au h3,.au h4,.band-line,.tagline{font-family:var(--display)}
.au .serif{font-family:var(--serif);font-style:italic;font-weight:400;letter-spacing:-.01em}
.au .mono{font-family:var(--mono);letter-spacing:.02em}
.au .grad{background:var(--brand);background-size:160% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sheen 7s ease-in-out infinite}
@keyframes sheen{50%{background-position:100% 0}}

/* background: airy brand light */
.bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.bg>i{position:absolute;border-radius:50%;filter:blur(90px)}
.bg .a1{width:48vw;height:48vw;right:-8vw;top:-14vw;background:radial-gradient(circle,rgba(12,109,255,.22),transparent 65%);animation:drift 24s ease-in-out infinite}
.bg .a2{width:42vw;height:42vw;right:18vw;top:18vh;background:radial-gradient(circle,rgba(145,55,239,.18),transparent 65%);animation:drift 30s ease-in-out infinite reverse}
.bg .a3{width:40vw;height:40vw;left:-12vw;bottom:-18vw;background:radial-gradient(circle,rgba(91,47,224,.12),transparent 65%);animation:drift 34s ease-in-out infinite}
.bg .grid{position:absolute;inset:0;background-image:radial-gradient(rgba(29,33,169,.16) 1px,transparent 1.3px);background-size:26px 26px;mask-image:radial-gradient(ellipse at 70% 10%,#000 5%,transparent 55%);-webkit-mask-image:radial-gradient(ellipse at 70% 10%,#000 5%,transparent 55%)}
.bg .spot{position:absolute;inset:0;background:radial-gradient(420px circle at var(--x,60%) var(--y,20%),rgba(91,47,224,.07),transparent 60%)}
.bg .grain{position:absolute;inset:-50%;opacity:.025;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
@keyframes drift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-4vw,4vh) scale(1.1)}}

/* reveal */
.au .rv{opacity:0;transform:translateY(24px);filter:blur(6px);transition:opacity 1s cubic-bezier(.2,.7,.2,1),transform 1s cubic-bezier(.2,.7,.2,1),filter 1s}
.au .rv.in{opacity:1;transform:none;filter:none}

/* travelling brand-light border */
.features,.os,.dial-card,.threadmap{position:relative}
.features:after,.os:after,.dial-card:after,.threadmap:after{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.5px;pointer-events:none;
background:conic-gradient(from var(--a),transparent 0 60%,#0C6DFF 72%,#5B2FE0 82%,#9137EF 88%,transparent 96%);
-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:ang 8s linear infinite}
@keyframes ang{to{--a:360deg}}

/* buttons */
.btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:10px;height:52px;padding:0 26px;border-radius:999px;font-size:15px;font-weight:600;border:1px solid transparent;transition:transform .3s,box-shadow .3s,background .3s;white-space:nowrap}
.btn.sm{height:40px;padding:0 18px;font-size:14px}
.btn-prime,.btn-glass{background:var(--brand);color:#fff;box-shadow:0 10px 30px -10px rgba(47,59,224,.7),0 0 0 1px rgba(255,255,255,.2) inset}
.btn-prime:before,.btn-glass:before{content:"";position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.5),transparent);transform:skewX(-20deg);animation:shine 5s ease-in-out infinite}
@keyframes shine{0%,65%{left:-60%}100%{left:130%}}
.btn-prime:hover,.btn-glass:hover{transform:translateY(-2px);box-shadow:0 16px 40px -10px rgba(91,47,224,.8)}
.btn-ghost{background:#fff;border-color:var(--line);color:var(--ink);box-shadow:var(--shadow)}.btn-ghost:hover{border-color:#C9CEF2;transform:translateY(-2px)}
.btn-white{background:#fff;color:var(--indigo)}.btn-white:hover{transform:translateY(-2px);box-shadow:0 14px 40px -12px rgba(0,0,0,.4)}
.btn-outline-w{border-color:rgba(255,255,255,.5);color:#fff}.btn-outline-w:hover{background:rgba(255,255,255,.12)}

/* button colour must beat .au a{color:inherit} */
.au .btn-prime,.au .btn-glass,.au .btn-outline-w{color:#fff}.au .btn-white{color:#1D21A9}.au .btn-ghost{color:var(--ink)}.au .os .btn-ghost{color:#fff}

/* hero */
.hero{display:grid;grid-template-columns:.95fr 1.05fr;align-items:center;gap:30px;max-width:1300px;margin:0 auto;padding:48px 32px 50px}
.eyebrow{display:inline-flex;align-items:center;gap:10px;font-family:var(--mono);font-size:12px;text-transform:uppercase;letter-spacing:.16em;color:var(--violet);margin:0 0 20px;padding:7px 14px 7px 10px;border-radius:999px;background:#fff;border:1px solid var(--line);box-shadow:var(--shadow)}
.pulse{width:8px;height:8px;border-radius:50%;background:var(--blue);animation:pulse 2s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(12,109,255,.5)}70%{box-shadow:0 0 0 10px rgba(12,109,255,0)}100%{box-shadow:0 0 0 0 rgba(12,109,255,0)}}
.hero h1{font-size:clamp(38px,4.5vw,66px);line-height:1.02;letter-spacing:-.035em;font-weight:600;margin:0 0 20px}
.hero h1 .grad{font-weight:700}
.tagline{font-size:clamp(19px,1.7vw,24px);font-weight:500;margin:0 0 14px;color:var(--ink)}.tagline span{color:var(--violet)}
.lede{font-size:17px;line-height:1.65;color:var(--mute);max-width:520px;margin:0 0 30px}
.cta-row{display:flex;gap:12px;flex-wrap:wrap}.cta-row.center{justify-content:center}
.chips{list-style:none;display:flex;flex-wrap:wrap;gap:8px;padding:0;margin:30px 0 0}
.chips li{font-size:13px;font-weight:500;color:var(--mute);padding:7px 13px;border-radius:999px;background:#fff;border:1px solid var(--line)}
.chips li:before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--brand);margin-right:8px;vertical-align:1px}

/* stage · living infinity */
.stage-wrap{display:flex;flex-direction:column;align-items:center;gap:18px;width:100%}
.stage{position:relative;width:100%;aspect-ratio:1.25/1;perspective:1100px}
.stage-3d{position:absolute;inset:0;transform:rotateX(var(--rx,0)) rotateY(var(--ry,0));transform-style:preserve-3d;transition:transform .6s cubic-bezier(.2,.7,.2,1)}
.orbit{position:absolute;left:50%;top:50%;border-radius:50%;border:1.5px dashed rgba(91,47,224,.18);transform:translate(-50%,-50%);animation:spinO 60s linear infinite}
.o1{width:92%;aspect-ratio:1.9}.o2{width:70%;aspect-ratio:2.4;border-style:solid;border-color:rgba(12,109,255,.1);animation-direction:reverse;animation-duration:80s}
@keyframes spinO{to{transform:translate(-50%,-50%) rotate(360deg)}}
.thread-svg{position:absolute;left:3%;right:3%;top:18%;width:94%;height:auto;overflow:visible;transform:translateZ(40px);transition:filter 1s,opacity 1s}
.thread-svg .comet{stroke-dasharray:.07 .93;animation:run 5.5s linear infinite}
.thread-svg .c2{stroke-dasharray:.03 .97;animation-duration:5.5s;animation-delay:-2.75s;opacity:.8}
@keyframes run{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
.thread-svg .bead{animation:bead 3.3s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.thread-svg .bead circle:first-child{filter:drop-shadow(0 3px 6px rgba(29,33,169,.35))}
@keyframes bead{50%{transform:scale(1.18)}}
.thread-svg.off{filter:saturate(.1) brightness(1.15);opacity:.55}.thread-svg.off .comet{animation-play-state:paused;opacity:0}
.gcard{position:absolute;display:flex;align-items:center;gap:12px;padding:12px 16px 12px 12px;border-radius:18px;background:rgba(255,255,255,.82);border:1px solid rgba(227,230,246,.95);
backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 20px 50px -18px rgba(29,33,169,.35);animation:float 6s ease-in-out infinite;transition:opacity .8s,filter .8s}
.gcard b{display:block;font-family:var(--display);font-size:14.5px;font-weight:600}.gcard small{display:block;font-size:12.5px;color:var(--mute);margin-top:2px}
.gcard small .mono{font-size:12px}
.gc1{left:0;top:2%;transform:translateZ(90px)}.gc2{right:0;top:6%;animation-delay:-2s;transform:translateZ(70px)}.gc3{left:22%;bottom:4%;animation-delay:-4s;transform:translateZ(110px)}
@keyframes float{50%{translate:0 -10px}}
.gdot{width:34px;height:34px;border-radius:12px;background:rgba(16,185,129,.12);display:grid;place-items:center;position:relative}
.gdot:after{content:"";width:10px;height:10px;border-radius:50%;background:#10B981;box-shadow:0 0 0 4px rgba(16,185,129,.2);animation:pulseG 1.8s infinite}
@keyframes pulseG{50%{box-shadow:0 0 0 8px rgba(16,185,129,0)}}
.gic{width:34px;height:34px;border-radius:12px;display:grid;place-items:center;color:#fff;font-weight:700;background:var(--brand);box-shadow:0 6px 16px -6px rgba(91,47,224,.8)}
.gic.ok{background:linear-gradient(135deg,#0C6DFF,#2F3BE0)}
.stage.is-silent .gcard{opacity:.35;filter:grayscale(1)}
.stage.is-silent .gdot:after{background:#94A3B8;animation:none;box-shadow:none}
.consent-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:center}
.consent{display:flex;align-items:center;gap:12px;padding:7px 18px 7px 7px;border-radius:999px;border:1px solid var(--line);background:#fff;box-shadow:var(--shadow)}
.consent .knob{width:46px;height:26px;border-radius:999px;background:#E3E6F6;position:relative;transition:background .4s}
.consent .knob:after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(13,24,69,.25);transition:left .45s cubic-bezier(.5,1.6,.4,1)}
.consent.on .knob{background:var(--brand)}.consent.on .knob:after{left:23px}
.consent-l{font-size:13px;color:var(--mute)}.consent-v{font-weight:600;font-size:14px}
.orb-hint{font-size:13px;color:var(--dim)}

/* features strip */
.features{z-index:1;max-width:1236px;width:calc(100% - 64px);margin:10px auto 0;display:grid;grid-template-columns:repeat(4,1fr);border-radius:28px;background:#fff;box-shadow:var(--shadow);border:1px solid var(--line)}
.feat{padding:30px 24px;text-align:center;position:relative;transition:background .4s}
.feat+.feat:before{content:"";position:absolute;left:0;top:24%;bottom:24%;width:1px;background:linear-gradient(180deg,transparent,#D7DBF3,transparent)}
.feat:hover{background:radial-gradient(circle at 50% 30%,rgba(12,109,255,.06),transparent 70%)}
.feat-ic{display:inline-grid;place-items:center;width:64px;height:64px;border-radius:20px;margin-bottom:14px;background:linear-gradient(135deg,#EEF4FF,#F3EEFF);border:1px solid #E6E3FB;transition:transform .4s}
.feat:hover .feat-ic{transform:translateY(-4px) rotate(-4deg)}
.feat h3{margin:0 0 6px;font-size:17.5px;font-weight:600}.feat p{margin:0;font-size:14px;color:var(--mute);line-height:1.5}

/* marquee */
.marquee{margin-top:100px;margin-bottom:32px;overflow:hidden;padding:24px 0;background:var(--brand);transform:rotate(-3deg) scale(1.05);box-shadow:0 20px 45px -15px rgba(29,33,169,.45)}
.track{display:flex;width:max-content;animation:mq 44s linear infinite}
.track span{font-family:var(--display);font-weight:500;font-size:clamp(22px,2.6vw,36px);color:#fff;padding:0 26px;display:flex;align-items:center;gap:52px;white-space:nowrap}
.track b{font-size:.55em;opacity:.7}
@keyframes mq{to{transform:translateX(-50%)}}

/* sections */
.block{max-width:1200px;margin:0 auto;padding:120px 32px 30px;position:relative}
.head{text-align:center;max-width:800px;margin:0 auto 52px}
.head .eyebrow{margin-bottom:18px}
.head h2,.final h2{font-size:clamp(34px,4.4vw,60px);line-height:1.05;letter-spacing:-.035em;font-weight:600;margin:0}
.head .serif{background:var(--brand);-webkit-background-clip:text;background-clip:text;color:transparent;padding-right:.08em}
.sub{color:var(--mute);font-size:17px;line-height:1.6;margin:16px auto 0;max-width:560px}
.center{text-align:center;margin-top:26px}

/* session demo: navy device on a light page */
.os{overflow:hidden;border-radius:28px;background:linear-gradient(180deg,#121A4D,#0B1238);color:#FFFFFF;box-shadow:0 50px 120px -40px rgba(29,33,169,.6)}
.os>*{position:relative;z-index:1}
.os p{color:#FFFFFF!important}
.os-bar{display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.14)}
.lights{display:flex;gap:6px}.lights i{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.28)}
.os-title{font-size:13px;color:#E2E8F0!important;flex:1;font-weight:600}
.os-live{font-family:var(--mono);font-size:12px;color:#CBD5E1!important;font-weight:600}.os-live.on{color:#FDA4AF!important;animation:blink 1.4s infinite}
@keyframes blink{50%{opacity:.45}}
.os-body{display:grid;grid-template-columns:1.35fr 1fr;min-height:400px}
.pane{padding:22px;max-height:440px;overflow:auto;scrollbar-width:none}.pane::-webkit-scrollbar{display:none}
.pane-l{font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#93C5FD!important;margin:0 0 16px}
.private{border-left:1px solid rgba(255,255,255,.14);background:linear-gradient(180deg,rgba(91,47,224,.24),transparent 70%)}
.lock{color:#93C5FD!important}
.msg{max-width:88%;margin-bottom:14px;animation:rise .6s cubic-bezier(.2,.7,.2,1) both}
.msg .who{font-size:11.5px;font-weight:700;color:#93C5FD!important;display:block;margin-bottom:5px;letter-spacing:.04em}
.msg p{margin:0;padding:13px 18px;border-radius:16px;font-size:15px;line-height:1.55;color:#FFFFFF!important;font-weight:500}
.msg.coach p{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);border-top-left-radius:4px;color:#FFFFFF!important;box-shadow:0 4px 16px rgba(0,0,0,.25)}
.msg.learner{margin-left:auto;text-align:right}
.msg.learner p{background:linear-gradient(135deg,#0C6DFF,#5B2FE0);border:1px solid rgba(255,255,255,.25);border-top-right-radius:4px;text-align:left;box-shadow:0 10px 30px -10px rgba(12,109,255,.9);color:#FFFFFF!important}
.tag{display:inline-block;margin-top:7px;font-family:var(--mono);font-size:11.5px;font-weight:600;padding:4px 12px;border-radius:999px;background:rgba(147,197,253,.2);color:#BFDBFE!important;border:1px solid rgba(147,197,253,.4)}
.tag.glow{margin:0 6px 6px 0;animation:rise .5s both}
.typing{display:flex;gap:4px;padding:8px 2px}.typing i{width:6px;height:6px;border-radius:50%;background:#93C5FD;animation:bob 1s infinite}.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}
@keyframes bob{50%{transform:translateY(-4px);opacity:.4}}
@keyframes rise{from{opacity:0;transform:translateY(10px)}}
.threads{margin-bottom:12px}
.card-p{padding:14px 16px;border-radius:14px;margin-bottom:12px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);animation:rise .6s both}
.card-p .k{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.14em}
.card-p p{margin:6px 0 0;font-size:14.5px;line-height:1.55;color:#FFFFFF!important;font-weight:500}
.card-p.thread{border-color:rgba(96,165,250,.5);background:rgba(12,109,255,.2)}
.card-p.thread .k{color:#93C5FD!important}
.card-p.suggest{border-color:rgba(196,181,253,.55);background:rgba(145,55,239,.25)}
.card-p.suggest .k{color:#DDD6FE!important}
.card-p.action{border-color:rgba(252,211,77,.55);background:rgba(245,158,11,.2)}
.card-p.action .k{color:#FDE68A!important}
.empty{color:#94A3B8!important;font-size:14.5px;line-height:1.6}
.note{border-top:1px solid rgba(255,255,255,.14);padding:22px;background:rgba(255,255,255,.06);animation:rise .6s both}
.note-head{display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:#E2E8F0!important}
.timer{color:#93C5FD!important;font-weight:700}
.bar{height:4px;border-radius:4px;background:rgba(255,255,255,.14);margin:12px 0 20px;overflow:hidden}.bar i{display:block;height:100%;background:var(--brand);transition:width .1s}
.note-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;animation:rise .6s both}
.note-grid h4{margin:0 0 10px;font-size:15px;font-weight:700;color:#FFFFFF!important}
.note-grid ul{margin:0;padding-left:18px}
.note-grid li{font-size:14px;line-height:1.55;color:#F1F5F9!important;margin:0 0 6px;font-weight:500}
.note-grid p{font-size:14px;line-height:1.55;color:#F1F5F9!important;margin:0 0 6px;font-weight:500}
.note-btns{display:flex;gap:8px;margin-top:14px}
.os .btn-ghost{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.24);color:#FFFFFF!important;box-shadow:none;font-weight:600}
.os .btn-ghost:hover{background:rgba(255,255,255,.24)}

/* capability bento */
.bento{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;perspective:1200px}
.tilt{transform:rotateX(var(--rx,0)) rotateY(var(--ry,0));transition:transform .5s cubic-bezier(.2,.7,.2,1),opacity 1s,filter 1s;transform-style:preserve-3d}
.bento-c{position:relative;padding:26px;border-radius:26px;border:1px solid var(--line);background:#fff;box-shadow:var(--shadow);min-height:350px;display:flex;flex-direction:column;overflow:hidden}
.bento-c:before{content:"";position:absolute;inset:0;border-radius:inherit;background:radial-gradient(380px circle at var(--mx,50%) var(--my,0%),rgba(12,109,255,.08),transparent 50%);opacity:0;transition:opacity .4s;pointer-events:none}
.bento-c:hover:before{opacity:1}
.bento-c.c1{background:linear-gradient(160deg,#0C6DFF,#2F3BE0 60%,#4423CC);color:#fff;border:0}
.bento-c.c1 p,.bento-c.c1 .k{color:rgba(255,255,255,.78)}
.bento-c .k{font-size:12px;color:var(--dim)}
.bento-c h3{font-size:23px;letter-spacing:-.02em;margin:auto 0 8px;font-weight:600}
.bento-c p{margin:0;color:var(--mute);font-size:14.5px;line-height:1.55}
.viz{height:130px;display:flex;align-items:center;justify-content:center;margin:18px 0}
.viz.wave{gap:4px}.viz.wave i{width:4px;height:20%;border-radius:4px;background:linear-gradient(180deg,#0C6DFF,#9137EF);animation:wv 1.2s ease-in-out infinite}
@keyframes wv{50%{height:90%}}
.viz.mem{flex-direction:column;gap:8px}.viz.mem span{font-size:12.5px;font-weight:500;padding:8px 14px;border-radius:12px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);color:#fff;animation:fl 4s ease-in-out infinite}
@keyframes fl{50%{transform:translateX(8px) translateZ(30px)}}
.viz.sug .whisper{font-family:var(--serif);font-style:italic;font-size:21px;line-height:1.3;text-align:center;color:var(--violet);padding:16px;border-radius:16px;background:linear-gradient(135deg,#F3EEFF,#EEF4FF);border:1px solid #E1DBFA;transform:translateZ(40px)}
.viz.doc{flex-direction:column;align-items:stretch;gap:9px;padding:0 10px}.viz.doc b{height:9px;border-radius:9px;background:linear-gradient(90deg,#9137EF,rgba(12,109,255,.1));animation:ln 3s ease-in-out infinite;transform-origin:left}
.viz.doc b:nth-child(2){width:80%;animation-delay:.2s}.viz.doc b:nth-child(3){width:92%;animation-delay:.4s}.viz.doc b:nth-child(4){width:60%;animation-delay:.6s}
@keyframes ln{0%{transform:scaleX(0)}40%,100%{transform:scaleX(1)}}

/* thread map */
.threadmap{border-radius:28px;border:1px solid var(--line);background:#fff;box-shadow:var(--shadow);padding:26px}
.threadmap>*{position:relative;z-index:1}
.theme-pills{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.pill{display:flex;align-items:center;gap:8px;padding:9px 16px;border-radius:999px;border:1px solid var(--line);background:#fff;font-size:14px;font-weight:500;color:var(--mute);transition:all .3s}
.pill i{width:8px;height:8px;border-radius:50%;background:var(--c)}.pill small{font-family:var(--mono);color:var(--dim)}
.pill.on{color:var(--ink);border-color:var(--c);background:color-mix(in srgb,var(--c) 8%,#fff);box-shadow:0 8px 20px -10px var(--c)}
.svg-wrap{position:relative}.svg-wrap svg{width:100%;height:auto;display:block;overflow:visible}
.thread-path{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.6s cubic-bezier(.6,0,.2,1) forwards}
@keyframes draw{to{stroke-dashoffset:0}}
.node{cursor:pointer;outline:none}.node circle{transition:all .5s}.svg-l{fill:var(--dim);font-family:var(--mono);font-size:13px}
.map-note{text-align:center;color:var(--mute);font-size:15px;min-height:24px}.map-note .mono{color:var(--blue);margin-right:6px}

/* manifesto: navy full-bleed moment */
.manifesto{max-width:none;margin:120px 0 0;padding:150px 32px;background:radial-gradient(ellipse at 20% 0%,rgba(12,109,255,.35),transparent 55%),radial-gradient(ellipse at 90% 100%,rgba(145,55,239,.35),transparent 55%),#0B1238}
.manifesto p{max-width:1080px;margin:0 auto;font-size:clamp(32px,5vw,70px);line-height:1.12;text-align:center;color:#fff!important}
.manifesto span{transition:opacity .5s,text-shadow .5s}
.manifesto span.lit{text-shadow:0 0 30px rgba(143,181,255,.55)}

/* vows */
.vows{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.vow-col{border-radius:28px;border:1px solid var(--line);padding:26px;background:#fff;box-shadow:var(--shadow)}
.vow-h{font-size:12px;text-transform:uppercase;letter-spacing:.16em;margin:0 0 12px;font-weight:500}.vow-h.always{color:var(--blue)}.vow-h.never{color:#E11D48}
.vow{display:flex;gap:16px;padding:16px 10px;border-top:1px solid var(--line);border-radius:14px;transition:background .3s}.vow:hover{background:#F6F7FF}
.vow h4{margin:0 0 4px;font-size:17px;font-weight:600}.vow p{margin:0;color:var(--mute);font-size:14.5px;line-height:1.5}
.ic{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:700}
.ic.ok{background:var(--brand);color:#fff}.ic.no{background:#FFF1F3;color:#E11D48;border:1px solid #FECDD6}

/* trust dial */
.dial{max-width:820px;margin:0 auto}
.dial-track{position:relative;height:6px;background:#E3E6F6;border-radius:6px;margin:20px 40px 70px}
.dial-fill{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:var(--brand);transition:width .6s cubic-bezier(.2,.7,.2,1)}
.stop{position:absolute;top:50%;transform:translate(-50%,-50%);background:none;border:0;padding:0;display:flex;flex-direction:column;align-items:center}
.stop i{width:24px;height:24px;border-radius:50%;background:#fff;border:2px solid #CFD4EF;transition:all .4s}
.stop.on i{border:6px solid #5B2FE0;box-shadow:0 0 0 6px rgba(91,47,224,.15)}
.stop span{position:absolute;top:34px;white-space:nowrap;font-size:14px;font-weight:500;color:var(--dim)}.stop.on span{color:var(--ink)}
.dial-card{border-radius:26px;border:1px solid var(--line);background:#fff;box-shadow:var(--shadow);padding:30px;animation:rise .5s both}
.dial-card>*{position:relative;z-index:1}
.dial-line{font-size:20px;line-height:1.5;margin:0 0 18px;font-family:var(--display)}
.dial-card ul{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:8px}
.dial-card li{font-size:13px;font-weight:500;padding:7px 12px;border-radius:999px;background:linear-gradient(135deg,#EEF4FF,#F3EEFF);color:var(--indigo);border:1px solid #E1DFFA}

/* final CTA */
.final-wrap{padding:120px 32px 40px;max-width:1236px;margin:0 auto}
.final{position:relative;overflow:hidden;text-align:center;padding:70px 32px 76px;border-radius:40px;color:#fff;
background:radial-gradient(ellipse at 15% 0%,rgba(255,255,255,.18),transparent 45%),linear-gradient(120deg,#0052F0 0%,#2F3BE0 40%,#5B2FE0 70%,#9137EF 100%);box-shadow:0 50px 120px -40px rgba(47,59,224,.8)}
.final:before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.18) 1px,transparent 1.3px);background-size:24px 24px;mask-image:radial-gradient(ellipse at 50% 30%,#000,transparent 70%);-webkit-mask-image:radial-gradient(ellipse at 50% 30%,#000,transparent 70%)}
.final>*{position:relative}
.final-loop{width:260px;height:150px;margin:0 auto 10px;position:relative}
.final-loop .thread-svg{position:absolute;inset:0;top:0;left:0;width:100%;transform:none}
.final h2 .serif{color:#fff;font-size:1.05em}
.final .sub{color:rgba(255,255,255,.82);margin-bottom:32px}

/* band */
.band{position:relative;z-index:1;margin-top:60px;background:linear-gradient(90deg,#EEF3FF,#F2EEFF)}
.band-wave{position:absolute;left:0;right:0;top:-59px;width:100%;height:60px;display:block}.band-wave path{fill:#EFF1FF}
.band-in{max-width:1200px;margin:0 auto;padding:30px 32px 38px;display:flex;align-items:center;gap:24px;flex-wrap:wrap}
.band-heart{width:70px;height:70px;border-radius:50%;display:grid;place-items:center;background:#fff;box-shadow:0 0 0 2px #D8D2FB,0 10px 30px -10px rgba(47,59,224,.5)}
.band-line{margin:0;font-size:clamp(20px,2.2vw,28px);line-height:1.3;font-weight:600;flex:1;color:var(--ink)}
.band-line em{font-style:normal;background:var(--brand);-webkit-background-clip:text;background-clip:text;color:transparent}
.band-tag{font-family:var(--display);font-weight:600;font-size:21px;background:var(--brand);-webkit-background-clip:text;background-clip:text;color:transparent}
.band-logo{padding-left:22px;border-left:1px solid rgba(13,24,69,.12);display:flex}

/* responsive */
@media (max-width:1000px){
  .hero{grid-template-columns:1fr;padding-top:36px}
  .stage{max-width:640px}
  .bento,.features{grid-template-columns:1fr 1fr}
  .feat:nth-child(3):before{display:none}
}
@media (max-width:720px){
  .hero,.block,.final-wrap{padding-left:16px;padding-right:16px}
  .block{padding-top:96px}
  .features{width:calc(100% - 32px)}.feat{padding:22px 12px}.feat h3{font-size:15px}.feat p{font-size:13px}
  .stage{aspect-ratio:1/1}.stage-wrap{margin-top:24px}
  .thread-svg{top:28%}
  .gcard{padding:8px 11px 8px 8px;gap:8px;border-radius:14px}.gcard b{font-size:12.5px}.gcard small{font-size:11px}
  .gdot,.gic{width:28px;height:28px;border-radius:9px}
  .gc1{top:0}.gc2{top:14%}.gc3{left:6%;bottom:2%}
  .consent-l{display:none}
  .os-body{grid-template-columns:1fr}.private{border-left:0;border-top:1px solid rgba(255,255,255,.08)}
  .note-grid,.vows,.bento{grid-template-columns:1fr}
  .bento-c{min-height:290px}
  .manifesto{padding:110px 20px}
  .dial-track{margin:20px 30px 70px}
  .track span{gap:30px;padding:0 14px}
  .final{padding:56px 20px;border-radius:30px}.final-loop{width:200px;height:116px}
  .band-in{padding:22px 16px 30px;gap:16px}.band-logo{display:none}.band-line{flex:1 1 60%;font-size:20px}.band-heart{width:56px;height:56px}
}
@media (prefers-reduced-motion:reduce){
  .au *,.au *:before,.au *:after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}
  .au .rv{opacity:1;transform:none;filter:none}
}
`;
