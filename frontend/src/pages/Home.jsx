import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaHeart, FaSmile, FaUsers, FaShieldAlt, FaStar, FaUserCheck, FaChevronRight } from "react-icons/fa";

// Component Imports
import Footer from "../components/Common/Footer";
import ReviewSlider from "../components/Common/ReviewSlider";

function Home() {
  // Simple interactive state for the live demo card
  const [activeMood, setActiveMood] = useState("peaceful");
  const [reflectionText, setReflectionText] = useState("");

  const demoPrompts = {
    peaceful: "What contributed most to your feeling of peace today?",
    challenged: "What is the primary blocker you are facing right now?",
    energetic: "How can you direct this energy towards your core goals?"
  };

  return (
    <div className="bg-paper min-h-screen font-poppins text-navy relative overflow-hidden">
      {/* Dynamic ambient backdrop glows */}
      <div className="absolute top-20 left-[-10%] w-[35rem] h-[35rem] rounded-full bg-royal-blue/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[40rem] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-violet/5 blur-[120px] pointer-events-none"></div>

      {/* Hero Section */}
      <header className="relative mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-12 pt-24 pb-16 text-center z-10">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-royal-blue/30 bg-royal-blue/5 px-4.5 py-2 text-xs font-semibold uppercase tracking-wider text-royal-blue animate-float">
          <FaStar className="text-[10px]" />
          For coaches, counsellors &amp; healers
        </div>

        {/* Heading */}
        <h1 className="font-fraunces text-4xl sm:text-5xl lg:text-6.5xl font-bold tracking-tight text-navy max-w-4.5xl leading-tight animate-fade-in-up">
          You already know how to <span className="italic bg-gradient-to-r from-royal-blue to-violet bg-clip-text text-transparent">hold space</span>.<br />
          We'll help you hold it online — and get paid for it.
        </h1>

        {/* Subtitle */}
        <p className="max-w-2.5xl text-lg sm:text-xl text-ink-soft leading-relaxed">
          OpenHand is the practice platform built for people who guide, not just teach. Client check-ins, private cohorts, and real community — without the corporate LMS feel.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full mt-4">
          <Link
            to="/signup"
            className="flex items-center gap-2 rounded-full bg-royal-blue hover:bg-royal-blue/90 px-8 py-4.5 font-semibold text-white transition-all duration-300 hover:scale-95 shadow-lg shadow-blue-200/50 hover:shadow-xl w-full sm:w-auto justify-center"
          >
            Start your free practice space
            <FaArrowRight className="text-xs" />
          </Link>
          <a
            href="#journey"
            className="flex items-center gap-2 rounded-full border border-line bg-white hover:bg-paper px-8 py-4.5 font-semibold text-navy transition-all duration-300 hover:scale-95 hover:border-navy/20 w-full sm:w-auto justify-center"
          >
            See a sample client journey
          </a>
        </div>

        {/* Interactive Client Check-In Card Demonstration (Glassmorphic + Animation) */}
        <div className="w-full max-w-2xl mt-12 mx-auto p-1.5 bg-gradient-to-tr from-royal-blue/20 via-violet/20 to-transparent rounded-[32px] shadow-2xl hover:shadow-3xl transition-all duration-500 animate-float">
          <div className="glass-card rounded-[26px] p-8 text-left border border-white/40">
            <div className="flex items-center justify-between border-b border-line/50 pb-4 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-royal-blue to-violet flex items-center justify-center text-white font-bold shadow-md shadow-royal-blue/15">
                  OH
                </div>
                <div>
                  <h4 className="font-semibold text-navy text-sm">Client Check-In Demonstration</h4>
                  <p className="text-xs text-ink-soft">Shared with your guide privately</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-500/10 text-green-700 border border-green-500/25">
                Live Demo
              </span>
            </div>

            {/* Mood selector */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-navy/70 uppercase tracking-widest mb-3">
                How is your energy state today?
              </label>
              <div className="grid grid-cols-3 gap-3.5">
                {["peaceful", "challenged", "energetic"].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setActiveMood(mood)}
                    className={`flex flex-col items-center justify-center py-3.5 rounded-2xl border text-sm capitalize font-semibold transition-all duration-300 ${
                      activeMood === mood
                        ? "border-royal-blue bg-royal-blue/5 text-royal-blue ring-4 ring-royal-blue/10 shadow-sm"
                        : "border-line bg-white/50 hover:border-royal-blue/40 text-ink-soft hover:bg-white"
                    }`}
                  >
                    <span className="text-2xl mb-1.5 transform hover:scale-125 transition-transform duration-200">
                      {mood === "peaceful" && "🌱"}
                      {mood === "challenged" && "⛰️"}
                      {mood === "energetic" && "⚡"}
                    </span>
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic prompt and textarea */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-navy/70 uppercase tracking-widest mb-2 transition-all duration-300">
                {demoPrompts[activeMood]}
              </label>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Write your brief reflection..."
                className="w-full min-h-[90px] p-4 text-sm rounded-2xl border border-line bg-white/70 focus:outline-none focus:border-royal-blue focus:ring-4 focus:ring-royal-blue/10 text-navy placeholder:text-ink-soft/50 transition-all duration-300 shadow-inner"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-ink-soft gap-4">
              <span className="flex items-center gap-1">🔒 Encrypted reflection space</span>
              <button 
                onClick={() => {
                  setReflectionText("Great reflection submitted! This shows your guide how you're tracking.");
                  setTimeout(() => setReflectionText(""), 4000);
                }}
                className="bg-navy hover:bg-navy/95 text-white font-semibold px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-95 shadow-md shadow-navy/15 w-full sm:w-auto"
              >
                Submit reflection
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Held line divider */}
      <div className="w-full overflow-hidden relative z-10">
        <svg className="w-full h-16 opacity-30 text-royal-blue animate-pulse" viewBox="0 0 1080 64" preserveAspectRatio="none">
          <path d="M0 32 C 180 4, 360 60, 540 32 C 720 4, 900 60, 1080 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Section 1: How we work */}
      <section className="py-24 relative z-10" id="journey">
        <div className="mx-auto w-11/12 max-w-maxContent">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-violet bg-violet/10 px-3 py-1.5 rounded-full">Not modules. Practice.</span>
            <h2 className="font-fraunces text-3xl sm:text-4.5xl font-bold mt-4 text-navy">
              Built around how you actually work with people
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white/80 border border-line/60 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2.5 transition-all duration-300 group hover:border-royal-blue/30">
              <div className="w-14 h-14 rounded-2xl bg-royal-blue/10 flex items-center justify-center text-royal-blue text-xl mb-7 group-hover:scale-110 transition-transform duration-300">
                <FaUserCheck />
              </div>
              <h3 className="font-fraunces text-2xl font-bold mb-3.5 text-navy">Client check-ins</h3>
              <p className="text-ink-soft text-sm leading-relaxed">
                Simple, recurring check-ins that show you how someone's really doing between sessions — not just whether they clicked "complete."
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white/80 border border-line/60 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2.5 transition-all duration-300 group hover:border-violet/30">
              <div className="w-14 h-14 rounded-2xl bg-violet/10 flex items-center justify-center text-violet text-xl mb-7 group-hover:scale-110 transition-transform duration-300">
                <FaSmile />
              </div>
              <h3 className="font-fraunces text-2xl font-bold mb-3.5 text-navy">Gentle progress tracking</h3>
              <p className="text-ink-soft text-sm leading-relaxed">
                Mood and progress tracking your clients will actually use, because it feels like reflection, not a clinical dashboard.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white/80 border border-line/60 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2.5 transition-all duration-300 group hover:border-sky-blue/50">
              <div className="w-14 h-14 rounded-2xl bg-sky-blue/20 flex items-center justify-center text-royal-blue text-xl mb-7 group-hover:scale-110 transition-transform duration-300">
                <FaUsers />
              </div>
              <h3 className="font-fraunces text-2xl font-bold mb-3.5 text-navy">Private cohorts</h3>
              <p className="text-ink-soft text-sm leading-relaxed">
                Small group containers with their own rhythm and boundaries — not a public course feed anyone can wander into.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Community Section (Frosted glass container layout) */}
      <section className="py-24 bg-gradient-to-b from-royal-blue/5 to-transparent border-y border-line/50 relative z-10">
        <div className="mx-auto w-11/12 max-w-maxContent">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-royal-blue bg-royal-blue/10 px-3 py-1.5 rounded-full">The part corporate LMS forgets</span>
            <h2 className="font-fraunces text-3xl sm:text-4.5xl font-bold mt-4 text-navy">
              People heal in circles, not in isolation
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card border border-white/60 rounded-3xl p-8 hover:shadow-lg transition-all duration-300 group hover:bg-white">
              <h3 className="font-fraunces text-2.5xl font-bold mb-3.5 text-navy group-hover:text-royal-blue transition-colors">Peer circles</h3>
              <p className="text-ink-soft text-sm leading-relaxed">
                Give clients a safe space to support and hold each other between sessions, guided but not dependent on you.
              </p>
            </div>

            <div className="glass-card border border-white/60 rounded-3xl p-8 hover:shadow-lg transition-all duration-300 group hover:bg-white">
              <h3 className="font-fraunces text-2.5xl font-bold mb-3.5 text-navy group-hover:text-royal-blue transition-colors">Live sessions</h3>
              <p className="text-ink-soft text-sm leading-relaxed">
                Built-in group video sessions and audio circles that feel like your living room, not a sterile webinar platform.
              </p>
            </div>

            <div className="glass-card border border-white/60 rounded-3xl p-8 hover:shadow-lg transition-all duration-300 group hover:bg-white">
              <h3 className="font-fraunces text-2.5xl font-bold mb-3.5 text-navy group-hover:text-royal-blue transition-colors">Accountability pods</h3>
              <p className="text-ink-soft text-sm leading-relaxed">
                Small, self-organizing groups that keep progress and support going long after a particular cohort container ends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Quietly Intelligent AI */}
      <section className="py-24 relative z-10">
        <div className="mx-auto w-11/12 max-w-maxContent">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-violet bg-violet/10 px-3 py-1.5 rounded-full">Quietly intelligent</span>
            <h2 className="font-fraunces text-3xl sm:text-4.5xl font-bold mt-4 text-navy">
              AI that sounds like you, not like a bot
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-dashed border-line/80 rounded-3xl p-8 hover:border-royal-blue/60 transition-all duration-300 group bg-white/30 hover:bg-white/60">
              <h3 className="font-fraunces text-2.5xl font-bold mb-3.5 text-navy group-hover:text-royal-blue transition-colors">AI reflection prompts</h3>
              <p className="text-ink-soft text-sm leading-relaxed">
                Clients get thoughtful, personalized journal prompts between sessions — written in a tone you customize, not a generic AI bot voice.
              </p>
            </div>

            <div className="border border-dashed border-line/80 rounded-3xl p-8 hover:border-royal-blue/60 transition-all duration-300 group bg-white/30 hover:bg-white/60">
              <h3 className="font-fraunces text-2.5xl font-bold mb-3.5 text-navy group-hover:text-royal-blue transition-colors">Human-sounding nudges</h3>
              <p className="text-ink-soft text-sm leading-relaxed">
                Automated check-ins that read like they came straight from you, so clients feel held without getting stuck in cold email drip campaigns.
              </p>
            </div>

            <div className="border border-dashed border-line/80 rounded-3xl p-8 hover:border-royal-blue/60 transition-all duration-300 group bg-white/30 hover:bg-white/60">
              <h3 className="font-fraunces text-2.5xl font-bold mb-3.5 text-navy group-hover:text-royal-blue transition-colors">Notes-to-content converter</h3>
              <p className="text-ink-soft text-sm leading-relaxed">
                Convert your session scratchpad notes into organized client handouts or digital guides automatically — capturing your raw expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Trust and Security (Navy section for premium dark contrast) */}
      <section className="py-28 bg-[#0D1B3D] text-white relative overflow-hidden">
        {/* Glow backdrop inside dark panel */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-royal-blue/5 blur-[120px] pointer-events-none"></div>

        <div className="mx-auto w-11/12 max-w-maxContent relative z-10">
          <div className="max-w-2xl mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-blue bg-sky-blue/10 px-3 py-1.5 rounded-full">Held with care</span>
            <h2 className="font-fraunces text-3xl sm:text-4.5xl font-bold mt-4 text-white">
              Built for the trust your practice depends on
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-sky-blue/20 flex items-center justify-center text-sky-blue mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaShieldAlt />
              </div>
              <h3 className="font-fraunces text-2.5xl font-bold mb-3.5 text-white">Confidentiality by design</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Private cohorts and client data are mathematically separated and access-controlled from the ground up, not just bolted on.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-violet/20 flex items-center justify-center text-violet mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaHeart />
              </div>
              <h3 className="font-fraunces text-2.5xl font-bold mb-3.5 text-white">Ethical-practice standards</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Built alongside experienced practitioners, featuring digital boundaries and guidelines that respect professional code of ethics.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-royal-blue/20 flex items-center justify-center text-royal-blue mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaUsers className="text-royal-blue" />
              </div>
              <h3 className="font-fraunces text-2.5xl font-bold mb-3.5 text-white">Protected conversations</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Client session transcripts and reflection journals are heavily encrypted at rest, and are never used to train external model sets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Pricing / Steps Section */}
      <section className="py-24 relative z-10" id="start">
        <div className="mx-auto w-11/12 max-w-maxContent text-center">
          <div className="max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-violet bg-violet/10 px-3 py-1.5 rounded-full">Start where you're comfortable</span>
            <h2 className="font-fraunces text-3xl sm:text-4.5xl font-bold mt-4 text-navy">
              Three ways in — no pressure, no sales call required first
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="bg-white border border-line/60 rounded-3xl p-8 text-left flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-royal-blue/5 rounded-full blur-xl pointer-events-none group-hover:bg-royal-blue/10 transition-colors"></div>
              <div>
                <span className="font-fraunces italic text-royal-blue text-sm font-bold mb-3 block">Step One</span>
                <h3 className="font-fraunces text-xl font-bold mb-2.5 text-navy">Start your free space</h3>
                <p className="text-ink-soft text-sm leading-relaxed mb-8">
                  Set up your custom reflection space in minutes. No credit card required, explore at your own pace.
                </p>
              </div>
              <Link to="/signup" className="text-sm font-bold text-royal-blue flex items-center gap-1.5 hover:underline">
                Start free <FaChevronRight className="text-[10px]" />
              </Link>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-line/60 rounded-3xl p-8 text-left flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet/5 rounded-full blur-xl pointer-events-none group-hover:bg-violet/10 transition-colors"></div>
              <div>
                <span className="font-fraunces italic text-royal-blue text-sm font-bold mb-3 block">Step Two</span>
                <h3 className="font-fraunces text-xl font-bold mb-2.5 text-navy">See a client journey</h3>
                <p className="text-ink-soft text-sm leading-relaxed mb-8">
                  Walk through the exact client user experience, from onboarding check-in to cohort journaling.
                </p>
              </div>
              <Link to="/signup" className="text-sm font-bold text-royal-blue flex items-center gap-1.5 hover:underline">
                View sample journey <FaChevronRight className="text-[10px]" />
              </Link>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-line/60 rounded-3xl p-8 text-left flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-blue/5 rounded-full blur-xl pointer-events-none group-hover:bg-sky-blue/10 transition-colors"></div>
              <div>
                <span className="font-fraunces italic text-royal-blue text-sm font-bold mb-3 block">Step Three</span>
                <h3 className="font-fraunces text-xl font-bold mb-2.5 text-navy">Talk to a real human</h3>
                <p className="text-ink-soft text-sm leading-relaxed mb-8">
                  Have questions specific to your practice or custom cohorts? Book a direct session with our team.
                </p>
              </div>
              <Link to="/contact" className="text-sm font-bold text-royal-blue flex items-center gap-1.5 hover:underline">
                Book a conversation <FaChevronRight className="text-[10px]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Review Section */}
      <section className="py-24 bg-white border-t border-line/50 relative z-10">
        <div className="mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-12">
          <h2 className="font-fraunces text-center text-3xl sm:text-4.5xl font-bold mt-4 text-navy">
            Trusted by guides and healers worldwide
          </h2>
          <div className="w-full">
            <ReviewSlider />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;
