import React, { useState } from "react";
import { FaGraduationCap, FaCheckCircle, FaBookOpen, FaPlayCircle, FaFire, FaMedal } from "react-icons/fa";

const sampleCourses = [
  {
    id: "web-dev",
    title: "Full-Stack Web Development",
    instructor: "Dr. Alex Rivera",
    progress: 88,
    totalModules: 14,
    completedModules: 12,
    badge: "Mastery Badge",
    color: "#2563EB",
    lessons: ["React Hooks & Context", "Express.js REST APIs", "MongoDB Schema Design", "JWT Auth Systems"],
  },
  {
    id: "data-science",
    title: "Python Data Science & AI",
    instructor: "Prof. Sarah Chen",
    progress: 94,
    totalModules: 18,
    completedModules: 17,
    badge: "AI Practitioner",
    color: "#7C3AED",
    lessons: ["Pandas Data Analysis", "Neural Networks Intro", "Scikit-Learn Models", "Data Visualization"],
  },
  {
    id: "ui-ux",
    title: "Modern UI/UX & Design Systems",
    instructor: "Elena Vance",
    progress: 100,
    totalModules: 10,
    completedModules: 10,
    badge: "Certified Designer",
    color: "#10B981",
    lessons: ["Glassmorphism & Design Tokens", "Figma Auto-Layout", "User Journey Mapping", "Usability Testing"],
  },
];

const quizQuestion = {
  question: "Which hook in React is primarily used for managing side-effects like data fetching?",
  options: [
    { text: "useState()", correct: false, explain: "useState is used for local component state." },
    { text: "useEffect()", correct: true, explain: "Correct! useEffect handles side effects after rendering." },
    { text: "useContext()", correct: false, explain: "useContext provides global context values." },
    { text: "useReducer()", correct: false, explain: "useReducer handles complex state transitions." },
  ],
};

const AnalyticsGraph = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const [selectedCourse, setSelectedCourse] = useState(sampleCourses[0]);
  const [quizAnswer, setQuizAnswer] = useState(null);

  return (
    <div className="glass-neon-card rounded-3xl p-6 md:p-8 w-full max-w-4xl mx-auto shadow-2xl relative overflow-hidden border border-white/60 text-left">
      {/* Ambient background glow */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[90px] pointer-events-none opacity-20 transition-all duration-700"
        style={{ backgroundColor: selectedCourse.color }}
      />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-line/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: selectedCourse.color }} />
            <span className="text-xs font-bold uppercase tracking-widest text-ink-soft">
              Interactive Learning Hub
            </span>
          </div>
          <h3 className="font-fraunces text-2xl font-bold text-navy">
            Student Course Mastery &amp; Progress
          </h3>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-1.5 bg-paper/80 p-1.5 rounded-2xl border border-line">
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "courses"
                ? "bg-white text-navy shadow-sm border border-line font-bold"
                : "text-ink-soft hover:text-navy"
            }`}
          >
            <FaBookOpen /> Enrolled Courses
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "quiz"
                ? "bg-white text-navy shadow-sm border border-line font-bold"
                : "text-ink-soft hover:text-navy"
            }`}
          >
            <FaGraduationCap /> Live Knowledge Quiz
          </button>
        </div>
      </div>

      {activeTab === "courses" ? (
        <div>
          {/* Course selector tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {sampleCourses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCourse(c)}
                className={`p-4 rounded-2xl border transition-all duration-300 text-left flex items-start gap-3 ${
                  selectedCourse.id === c.id
                    ? "bg-white border-royal-blue text-navy ring-2 ring-royal-blue/20 shadow-md scale-[1.02]"
                    : "bg-white/60 border-line text-ink-soft hover:bg-white"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 font-bold text-base shadow-sm"
                  style={{ backgroundColor: c.color }}
                >
                  {c.progress}%
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-ink-soft truncate">{c.instructor}</div>
                  <div className="text-sm font-bold text-navy truncate">{c.title}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Active Course Card Details */}
          <div className="bg-white/80 rounded-2xl p-6 border border-line shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-royal-blue/10 text-royal-blue mb-2">
                  <FaMedal /> {selectedCourse.badge}
                </div>
                <h4 className="font-fraunces text-xl font-bold text-navy">{selectedCourse.title}</h4>
                <p className="text-xs font-medium text-slate-500 mt-1">Instructor: {selectedCourse.instructor}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-500">Overall Mastery</div>
                  <div className="text-2xl font-extrabold text-navy">{selectedCourse.progress}%</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                  <FaCheckCircle />
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-5 p-0.5 border border-slate-200">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${selectedCourse.progress}%`,
                  backgroundColor: selectedCourse.color,
                }}
              />
            </div>

            {/* Recent Lessons Completed */}
            <div className="mt-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block mb-2">
                Recent Modules Completed ({selectedCourse.completedModules}/{selectedCourse.totalModules})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedCourse.lessons.map((lesson, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-navy">
                    <FaPlayCircle className="text-royal-blue text-sm shrink-0" />
                    <span className="truncate">{lesson}</span>
                    <FaCheckCircle className="text-emerald-500 ml-auto shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Interactive Quiz Tab */
        <div className="bg-white/80 rounded-2xl p-6 border border-line shadow-sm text-left">
          <div className="flex items-center justify-between mb-4 border-b border-line/60 pb-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-violet bg-violet/10 px-3 py-1 rounded-full">
              Interactive Quiz Demo
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <FaFire /> 5-Day Learning Streak
            </span>
          </div>

          <h4 className="font-fraunces text-lg font-bold text-navy mb-4">
            {quizQuestion.question}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {quizQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setQuizAnswer(idx)}
                className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all duration-200 ${
                  quizAnswer === idx
                    ? opt.correct
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20"
                      : "bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20"
                    : "bg-slate-50 border-slate-200 text-navy hover:bg-white hover:border-royal-blue/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{opt.text}</span>
                  {quizAnswer === idx && (
                    <span>{opt.correct ? "✓ Correct" : "✕ Try again"}</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {quizAnswer !== null && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium border animate-fade-in-up ${
                quizQuestion.options[quizAnswer].correct
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {quizQuestion.options[quizAnswer].explain}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsGraph;
