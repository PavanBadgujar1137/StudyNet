import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaGraduationCap,
  FaBookOpen,
  FaUsers,
  FaShieldAlt,
  FaStar,
  FaChevronRight,
  FaMagic,
  FaCheckCircle,
  FaAward
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

// Component Imports
import Footer from "../components/Common/Footer";
import ReviewSlider from "../components/Common/ReviewSlider";
import DynamicCanvasBg from "../components/Common/DynamicCanvasBg";
import AnalyticsGraph from "../components/core/HomePage/AnalyticsGraph";

// Generated Images Imports
import cohortCircleImg from "../assets/Images/learning_classroom_preview.png";

function Home() {
  // Interactive demo quiz state
  const [selectedDemoOption, setSelectedDemoOption] = useState(null);
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    if (selectedDemoOption === null) return;
    setSubmittedQuiz(true);
  };

  return (
    <div className="bg-paper min-h-screen font-sans text-navy relative overflow-hidden">
      {/* Interactive Ambient Canvas */}
      <DynamicCanvasBg />

      {/* Hero Section */}
      <header className="relative mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-10 pt-20 pb-16 text-center z-10">
        {/* Glowing Eyebrow Badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-royal-blue/30 bg-white/80 backdrop-blur-md px-5 py-2 text-xs font-bold uppercase tracking-widest text-royal-blue shadow-lg shadow-royal-blue/10 animate-float-slow">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-royal-blue opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-royal-blue"></span>
          </span>
          <FaStar className="text-violet text-xs" />
          The Next-Gen Online Learning Platform for Students &amp; Instructors
        </div>

        {/* Dynamic Animated Gradient Heading */}
        <h1 className="font-sans text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-navy max-w-5xl leading-[1.12] animate-fade-in-up">
          Unlock your true potential through{" "}
          <span className="italic bg-gradient-to-r from-royal-blue via-violet to-pink-500 bg-clip-text text-transparent animate-gradient-text">
            interactive mastery
          </span>
          .<br />
          Learn, build projects, and get certified online.
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl text-lg sm:text-xl text-slate-600 font-medium leading-relaxed">
          OpenHand provides world-class educational tools for students and instructors. HD video streaming, progress tracking, interactive quizzes, and verified skill certificates.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full mt-4">
          <Link
            to="/signup"
            className="btn-shimmer flex items-center gap-3 rounded-full bg-gradient-to-r from-royal-blue via-blue-600 to-violet hover:opacity-95 px-9 py-5 text-base font-bold text-white transition-all duration-300 hover:scale-105 shadow-xl shadow-royal-blue/30 animate-neon-pulse w-full sm:w-auto justify-center"
          >
            Explore Courses Free
            <FaArrowRight className="text-sm" />
          </Link>
          <a
            href="#journey"
            className="flex items-center gap-2.5 rounded-full border border-royal-blue/30 bg-white/90 hover:bg-white px-9 py-5 text-base font-bold text-navy transition-all duration-300 hover:scale-105 hover:border-royal-blue shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
          >
            See Student Journey
            <FaChevronRight className="text-xs text-royal-blue" />
          </a>
        </div>

        {/* Interactive Knowledge Quiz Demo Card */}
        <div className="w-full max-w-2xl mt-14 mx-auto p-1.5 animated-gradient-border shadow-2xl transition-all duration-500 animate-float-slow">
          <div className="glass-neon-card rounded-[26px] p-8 text-left border border-white">
            <div className="flex items-center justify-between border-b border-line/60 pb-5 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-royal-blue to-violet flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-royal-blue/20">
                  OH
                </div>
                <div>
                  <h4 className="font-fraunces font-bold text-navy text-base">Interactive Quiz &amp; Skill Demo</h4>
                  <p className="text-xs font-medium text-ink-soft">Test your knowledge right from the home page</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Demo
              </span>
            </div>

            <form onSubmit={handleDemoSubmit} className="mb-5">
              <label className="block text-xs font-bold text-navy/70 uppercase tracking-widest mb-3">
                Sample Question: What is the primary purpose of state management in React?
              </label>
              <div className="space-y-2.5 mb-5">
                {[
                  "To manage and update dynamic component data",
                  "To style raw HTML elements with CSS",
                  "To compile JavaScript code into machine code"
                ].map((option, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => { setSelectedDemoOption(idx); setSubmittedQuiz(false); }}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs font-semibold transition-all duration-200 flex items-center justify-between ${
                      selectedDemoOption === idx
                        ? "border-royal-blue bg-royal-blue/10 text-royal-blue ring-2 ring-royal-blue/20 shadow-sm"
                        : "border-line bg-white/80 hover:bg-white text-navy"
                    }`}
                  >
                    <span>{option}</span>
                    <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                      {selectedDemoOption === idx && "✓"}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs text-ink-soft">
                <span className="flex items-center gap-1.5 font-semibold">
                  <FaGraduationCap className="text-royal-blue" /> Interactive student assessment
                </span>
                <button
                  type="submit"
                  disabled={selectedDemoOption === null}
                  className="btn-shimmer bg-navy hover:bg-navy/90 text-white font-bold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-md shadow-navy/20 disabled:opacity-50"
                >
                  Check Answer
                </button>
              </div>
            </form>

            {submittedQuiz && (
              <div className={`p-4 rounded-2xl border text-xs font-bold animate-fade-in-up flex items-center gap-2 ${
                selectedDemoOption === 0
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}>
                <FaCheckCircle className="text-base shrink-0" />
                {selectedDemoOption === 0
                  ? "Excellent! State management allows components to hold and re-render dynamic data seamlessly."
                  : "Not quite — option 1 is correct. State management maintains dynamic UI state across components."}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Wave Divider */}
      <div className="w-full overflow-hidden relative z-10 my-4">
        <svg className="w-full h-16 opacity-40 text-royal-blue animate-pulse" viewBox="0 0 1080 64" preserveAspectRatio="none">
          <path d="M0 32 C 180 4, 360 60, 540 32 C 720 4, 900 60, 1080 32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Section 1: Core Educational Pillars */}
      <section className="py-20 relative z-10" id="journey">
        <div className="mx-auto w-11/12 max-w-maxContent">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-violet bg-violet/15 px-4 py-2 rounded-full border border-violet/30">
              Modern Educational Experience
            </span>
            <h2 className="font-fraunces text-3xl sm:text-5xl font-extrabold mt-4 text-navy">
              Built for deep learning, retention, and skill growth
            </h2>
            <p className="mt-4 text-slate-600 font-medium text-lg">
              Discover how OpenHand combines video lectures, structured course paths, and interactive assessments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-neon-card rounded-3xl p-8 text-left group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-royal-blue/20 to-blue-500/20 flex items-center justify-center text-royal-blue text-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <FaBookOpen />
              </div>
              <h3 className="font-fraunces text-2xl font-bold mb-3 text-navy group-hover:text-royal-blue transition-colors">
                HD Video Curriculum
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Crystal-clear video lessons with section breakdowns, downloadable resources, and completion checkmarks.
              </p>
            </div>

            <div className="glass-neon-card rounded-3xl p-8 text-left group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet/20 to-pink-500/20 flex items-center justify-center text-violet text-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <FaGraduationCap />
              </div>
              <h3 className="font-fraunces text-2xl font-bold mb-3 text-navy group-hover:text-violet transition-colors">
                Progress &amp; Quizzes
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Track completion percentages across all enrolled courses and test understanding with interactive knowledge checks.
              </p>
            </div>

            <div className="glass-neon-card rounded-3xl p-8 text-left group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-blue/30 to-royal-blue/20 flex items-center justify-center text-royal-blue text-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <FaAward />
              </div>
              <h3 className="font-fraunces text-2xl font-bold mb-3 text-navy group-hover:text-royal-blue transition-colors">
                Verified Certificates
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Earn verifiable certificates of completion upon finishing course requirements to highlight your skill credentials.
              </p>
            </div>
          </div>

          {/* Interactive Classroom Image Showcase */}
          <div className="mt-16 glass-neon-card rounded-3xl p-8 md:p-12 border border-white flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-royal-blue bg-royal-blue/10 px-3.5 py-1.5 rounded-full">
                Interactive Learning Classroom
              </span>
              <h3 className="font-fraunces text-3xl font-extrabold text-navy mt-4 mb-4">
                Rich video playback player with lesson notes &amp; quizzes
              </h3>
              <p className="text-slate-600 text-base leading-relaxed font-medium mb-6">
                Students can stream lecture videos, follow Along with detailed curricula, mark lessons completed, and generate certificates automatically.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 text-sm font-bold text-royal-blue hover:text-violet transition-colors"
              >
                Join OpenHand as a student <FaArrowRight className="text-xs" />
              </Link>
            </div>
            <div className="md:w-1/2 rounded-2xl overflow-hidden shadow-2xl border border-white/60 group">
              <img
                src={cohortCircleImg}
                alt="OpenHand Classroom Video Learning Interface"
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Student Mastery & Progress Showcase */}
      <section className="py-20 bg-gradient-to-b from-royal-blue/5 via-violet/5 to-transparent border-y border-line/60 relative z-10">
        <div className="mx-auto w-11/12 max-w-maxContent text-center">
          <div className="max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-royal-blue bg-white px-4 py-2 rounded-full border border-royal-blue/20 shadow-sm">
              Educational Progress Tracker
            </span>
            <h2 className="font-fraunces text-3xl sm:text-5xl font-extrabold mt-4 text-navy">
              Track course mastery interactively
            </h2>
            <p className="mt-3 text-slate-600 font-medium text-base">
              Explore how students track their course progress, complete modules, and test their skills.
            </p>
          </div>

          {/* Interactive Learning Progress Component */}
          <AnalyticsGraph />

          {/* Platform Stat Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
            <div className="glass-neon-card rounded-2xl p-6 text-center">
              <div className="font-fraunces text-3xl font-extrabold text-royal-blue">50,000+</div>
              <div className="text-xs font-bold text-ink-soft uppercase tracking-wider mt-1">Enrolled Students</div>
            </div>
            <div className="glass-neon-card rounded-2xl p-6 text-center">
              <div className="font-fraunces text-3xl font-extrabold text-violet">99.2%</div>
              <div className="text-xs font-bold text-ink-soft uppercase tracking-wider mt-1">Course Completion</div>
            </div>
            <div className="glass-neon-card rounded-2xl p-6 text-center">
              <div className="font-fraunces text-3xl font-extrabold text-emerald-600">1,200+</div>
              <div className="text-xs font-bold text-ink-soft uppercase tracking-wider mt-1">Active Courses</div>
            </div>
            <div className="glass-neon-card rounded-2xl p-6 text-center">
              <div className="font-fraunces text-3xl font-extrabold text-amber-500">4.9 / 5</div>
              <div className="text-xs font-bold text-ink-soft uppercase tracking-wider mt-1">Student Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Smart Educational Features */}
      <section className="py-20 relative z-10">
        <div className="mx-auto w-11/12 max-w-maxContent">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-violet bg-violet/15 px-4 py-2 rounded-full border border-violet/30">
              Smart Educational Tools
            </span>
            <h2 className="font-fraunces text-3xl sm:text-5xl font-extrabold mt-4 text-navy">
              Intelligent features designed for learners and instructors
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-neon-card rounded-3xl p-8 text-left border border-dashed border-royal-blue/30 group">
              <div className="w-14 h-14 rounded-2xl bg-royal-blue/15 flex items-center justify-center text-royal-blue text-xl mb-6 group-hover:rotate-12 transition-transform duration-300">
                <FaMagic />
              </div>
              <h3 className="font-fraunces text-2xl font-bold mb-3 text-navy group-hover:text-royal-blue transition-colors">
                Instant Quiz Feedback
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Get immediate explanations and guidance for quiz responses to reinforce key concepts.
              </p>
            </div>

            <div className="glass-neon-card rounded-3xl p-8 text-left border border-dashed border-violet/30 group">
              <div className="w-14 h-14 rounded-2xl bg-violet/15 flex items-center justify-center text-violet text-xl mb-6 group-hover:rotate-12 transition-transform duration-300">
                <HiSparkles />
              </div>
              <h3 className="font-fraunces text-2xl font-bold mb-3 text-navy group-hover:text-violet transition-colors">
                Automated Certificates
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Receive official certificates upon finishing 100% of course lectures and requirements.
              </p>
            </div>

            <div className="glass-neon-card rounded-3xl p-8 text-left border border-dashed border-sky-blue/40 group">
              <div className="w-14 h-14 rounded-2xl bg-sky-blue/20 flex items-center justify-center text-royal-blue text-xl mb-6 group-hover:rotate-12 transition-transform duration-300">
                <FaShieldAlt />
              </div>
              <h3 className="font-fraunces text-2xl font-bold mb-3 text-navy group-hover:text-royal-blue transition-colors">
                Protected Content
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Secure Cloudinary video hosting and JWT authenticated enrollment guards for premium course materials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Security & Platform Trust */}
      <section className="py-24 bg-navy text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[45rem] rounded-full bg-royal-blue/15 blur-[140px] pointer-events-none"></div>

        <div className="mx-auto w-11/12 max-w-maxContent relative z-10">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-sky-blue bg-sky-blue/15 px-4 py-2 rounded-full border border-sky-blue/30">
              Trusted Infrastructure
            </span>
            <h2 className="font-fraunces text-3xl sm:text-5xl font-extrabold mt-4 text-white">
              Built for secure learning and authentic education
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-dark-neon rounded-3xl p-8 text-left group">
              <div className="w-14 h-14 rounded-2xl bg-sky-blue/20 flex items-center justify-center text-sky-blue text-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaShieldAlt />
              </div>
              <h3 className="font-fraunces text-2xl font-bold mb-3 text-white">Encrypted &amp; Guarded</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                End-to-end user authentication, Razorpay sandboxed payments, and role-based student/instructor permissions.
              </p>
            </div>

            <div className="glass-dark-neon rounded-3xl p-8 text-left group">
              <div className="w-14 h-14 rounded-2xl bg-violet/20 flex items-center justify-center text-violet text-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaGraduationCap />
              </div>
              <h3 className="font-fraunces text-2xl font-bold mb-3 text-white">Educational Excellence</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                Designed with curriculum best practices to optimize engagement, video playback, and practical knowledge retention.
              </p>
            </div>

            <div className="glass-dark-neon rounded-3xl p-8 text-left group">
              <div className="w-14 h-14 rounded-2xl bg-royal-blue/20 flex items-center justify-center text-sky-blue text-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaUsers />
              </div>
              <h3 className="font-fraunces text-2xl font-bold mb-3 text-white">Global Student Community</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                Connect with thousands of active learners, post course reviews, and share learning achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Steps to Start */}
      <section className="py-20 relative z-10" id="start">
        <div className="mx-auto w-11/12 max-w-maxContent text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-violet bg-violet/15 px-4 py-2 rounded-full border border-violet/30">
              Start Learning Today
            </span>
            <h2 className="font-fraunces text-3xl sm:text-5xl font-extrabold mt-4 text-navy">
              Three simple steps to start your educational journey
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glass-neon-card rounded-3xl p-8 text-left flex flex-col justify-between group">
              <div>
                <span className="font-fraunces italic text-royal-blue text-base font-bold mb-2 block">Step 01</span>
                <h3 className="font-fraunces text-2xl font-bold mb-3 text-navy">Create your account</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium mb-8">
                  Sign up as a Student or Instructor with email OTP verification.
                </p>
              </div>
              <Link to="/signup" className="text-sm font-bold text-royal-blue flex items-center gap-2 hover:underline">
                Create Account <FaChevronRight className="text-[10px]" />
              </Link>
            </div>

            <div className="glass-neon-card rounded-3xl p-8 text-left flex flex-col justify-between group">
              <div>
                <span className="font-fraunces italic text-violet text-base font-bold mb-2 block">Step 02</span>
                <h3 className="font-fraunces text-2xl font-bold mb-3 text-navy">Enroll in courses</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium mb-8">
                  Browse top categories in Web Dev, Data Science, and UI/UX Design.
                </p>
              </div>
              <Link to="/signup" className="text-sm font-bold text-violet flex items-center gap-2 hover:underline">
                Explore Catalog <FaChevronRight className="text-[10px]" />
              </Link>
            </div>

            <div className="glass-neon-card rounded-3xl p-8 text-left flex flex-col justify-between group">
              <div>
                <span className="font-fraunces italic text-emerald-600 text-base font-bold mb-2 block">Step 03</span>
                <h3 className="font-fraunces text-2xl font-bold mb-3 text-navy">Earn certificates</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium mb-8">
                  Complete video lectures, pass quizzes, and download verified certificates.
                </p>
              </div>
              <Link to="/contact" className="text-sm font-bold text-emerald-600 flex items-center gap-2 hover:underline">
                Get Started <FaChevronRight className="text-[10px]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-white border-t border-line/60 relative z-10">
        <div className="mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-12">
          <h2 className="font-fraunces text-center text-3xl sm:text-5xl font-extrabold text-navy">
            Loved by thousands of students &amp; instructors
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
