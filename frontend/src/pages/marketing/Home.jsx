import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { OHFooter, OpenHandFlow, OHBrandStrap } from '../../components/openhand'
import learnerIllustration from '../../assets/Images/illustration_path.svg'
import websiteIllustration from '../../assets/Images/website_illustration.svg'
import auraImage from '../../assets/Images/Gemini_Generated_Image_pqsldtpqsldtpqsl.png'
import {
  FiArrowRight,
  FiSearch,
  FiStar,
} from 'react-icons/fi'
import { getAllCourses } from '../../services/operations/courseAPI'
import { apiConnector } from '../../services/apiConnector'

// Fallback Dummy data for course marquees
const FREE_COURSES = [
  { id: 'f1', title: "Mindfulness Basics", instructor: "Dr. Emily Chen", category: "Wellness", tag: "FREE", color: "from-blue-500 to-cyan-400" },
  { id: 'f2', title: "Overcoming Burnout 101", instructor: "Michael Ross", category: "Career", tag: "FREE", color: "from-emerald-500 to-teal-400" },
  { id: 'f3', title: "Effective Leadership Essentials", instructor: "Amanda Waller", category: "Leadership", tag: "FREE", color: "from-indigo-500 to-blue-500" },
  { id: 'f4', title: "Starting Your Practice Journey", instructor: "OpenHand Team", category: "Practice", tag: "FREE", color: "from-purple-500 to-pink-500" },
  { id: 'f5', title: "Sleep Hygiene 101", instructor: "Sarah Jenkins", category: "Health", tag: "FREE", color: "from-amber-500 to-orange-400" },
];

const PAID_COURSES = [
  { id: 'p1', title: "Advanced CBT Techniques", instructor: "Dr. Gregory House", price: "₹2,499", category: "Therapy", color: "from-rose-500 to-red-500" },
  { id: 'p2', title: "Mastering 1:1 Sessions", instructor: "Laura Roslin", price: "₹1,999", category: "Coaching", color: "from-fuchsia-600 to-purple-600" },
  { id: 'p3', title: "Corporate EAP Mastery", instructor: "Tom Wambsgans", price: "₹4,999", category: "Corporate", color: "from-blue-600 to-indigo-600" },
  { id: 'p4', title: "Million-Dollar Practice", instructor: "Kendall Roy", price: "₹9,999", category: "Business", color: "from-emerald-600 to-green-600" },
  { id: 'p5', title: "Trauma Recovery Deep Dive", instructor: "Dr. Wendy Rhoades", price: "₹3,499", category: "Specialized", color: "from-violet-600 to-purple-600" },
];

const COLORS = [
  "from-blue-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-indigo-500 to-blue-500",
  "from-purple-500 to-pink-500",
  "from-amber-500 to-orange-400",
  "from-rose-500 to-red-500",
  "from-fuchsia-600 to-purple-600",
  "from-emerald-600 to-green-600"
];

const getGradient = (id) => {
  if (!id) return COLORS[0];
  const num = String(id).charCodeAt(String(id).length - 1) || 0;
  return COLORS[num % COLORS.length];
};

const CourseCard = ({ course }) => {
  const gradient = getGradient(course._id || course.id)
  const categoryName = typeof course.category === 'object' ? course.category?.name : course.category
  const instructorName = typeof course.instructor === 'object' 
    ? `${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}`.trim()
    : course.instructor

  return (
    <div 
      className="w-[280px] sm:w-[320px] shrink-0 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
      onClick={() => window.location.href = `/courses/${course._id || course.id}`}
    >
      <div 
        className={`h-28 sm:h-32 w-full flex items-center justify-center relative p-4 group-hover:opacity-90 transition-opacity bg-gradient-to-br ${gradient}`}
        style={course.thumbnail ? { backgroundImage: `url(${course.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {!course.thumbnail && (
          <span className="text-white font-black text-xl text-center opacity-95 line-clamp-2">{categoryName || 'Course'}</span>
        )}
        {course.thumbnail && (
          <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/30" />
        )}
        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-extrabold text-white border border-white/30 tracking-wider">
          {course.price === 0 || course.tag === 'FREE' ? 'FREE' : `₹${course.price}`}
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <h4 className="font-bold text-slate-900 text-base sm:text-lg mb-1.5 truncate group-hover:text-blue-600 transition-colors">{course.courseName || course.title}</h4>
        <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">By {instructorName || 'Expert'}</p>
      </div>
    </div>
  )
};

export function Home() {
  const navigate = useNavigate()
  
  // Hero Dual-Role Toggle: 'learner' | 'practitioner'
  const [heroRole, setHeroRole] = useState('learner')

  // Real-time courses state
  const [freeCourses, setFreeCourses] = useState([])
  const [paidCourses, setPaidCourses] = useState([])

  // Top Practitioners of the Month
  const [topPractitioners, setTopPractitioners] = useState([])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await getAllCourses()
        if (courses) {
          const free = courses.filter(c => c.price === 0)
          const paid = courses.filter(c => c.price > 0)
          setFreeCourses(free)
          setPaidCourses(paid)
        }
      } catch (err) {
        console.error("Failed to fetch courses for marquee:", err)
      }
    }
    const fetchTopPractitioners = async () => {
      try {
        const res = await apiConnector('GET', '/api/v1/practitioners/top-of-month')
        if (res?.data?.success) {
          setTopPractitioners(res.data.practitioners)
        }
      } catch (err) {
        console.error("Failed to fetch top practitioners:", err)
      }
    }
    fetchCourses()
    fetchTopPractitioners()
  }, [])

  // Learner Hero interactive state
  const [learnerQuery, setLearnerQuery] = useState('')

  // Practitioner Hero interactive state
  const [claimHandle, setClaimHandle] = useState('yourname')

  const handleLearnerSearch = (e) => {
    e?.preventDefault()
    if (learnerQuery.trim()) {
      navigate(`/find-a-practitioner?search=${encodeURIComponent(learnerQuery.trim())}`)
    } else {
      navigate('/find-a-practitioner')
    }
  }

  const handleClaimPage = (e) => {
    e?.preventDefault()
    const clean = claimHandle.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    navigate(`/signup?handle=${clean || 'practice'}&role=practitioner`)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ========================================================================= */}
      {/* 1. DUAL-ROLE INTERACTIVE HERO SECTION                                     */}
      {/* ========================================================================= */}
      <section className="relative pt-24 pb-16 sm:pt-28 lg:pt-32 lg:pb-24 overflow-hidden bg-white border-b border-slate-200/80">
        <div className="relative max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Toggle Switcher: Centered Glowing Bubble [ I want to grow ] [ I guide others ] */}
          <div className="flex justify-center items-center mb-10">
            <div
              className="relative inline-flex items-center p-1.5 rounded-full transition-all duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1.5px solid rgba(145, 55, 239, 0.4)",
                boxShadow:
                  "0 0 28px -4px rgba(12, 109, 255, 0.35), 0 0 36px -6px rgba(145, 55, 239, 0.4), 0 10px 30px -10px rgba(47, 59, 224, 0.25)",
              }}
            >
              <button
                type="button"
                onClick={() => setHeroRole('learner')}
                className="relative px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer select-none"
                style={
                  heroRole === 'learner'
                    ? {
                        background:
                          "linear-gradient(100deg, #0C6DFF 0%, #2F3BE0 45%, #5B2FE0 70%, #9137EF 100%)",
                        color: "#FFFFFF",
                        boxShadow:
                          "0 4px 18px -2px rgba(47, 59, 224, 0.7), 0 0 14px 0 rgba(145, 55, 239, 0.55)",
                        transform: "scale(1.02)",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "#4A5378",
                        transform: "scale(1)",
                      }
                }
              >
                I want to grow
              </button>
              <button
                type="button"
                onClick={() => setHeroRole('practitioner')}
                className="relative px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer select-none"
                style={
                  heroRole === 'practitioner'
                    ? {
                        background:
                          "linear-gradient(100deg, #0C6DFF 0%, #2F3BE0 45%, #5B2FE0 70%, #9137EF 100%)",
                        color: "#FFFFFF",
                        boxShadow:
                          "0 4px 18px -2px rgba(47, 59, 224, 0.7), 0 0 14px 0 rgba(145, 55, 239, 0.55)",
                        transform: "scale(1.02)",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "#4A5378",
                        transform: "scale(1)",
                      }
                }
              >
                I guide others
              </button>
            </div>
          </div>

          {/* Hero Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* ─── LEFT COLUMN: COPY & INTERACTIVE INPUT ─── */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {heroRole === 'learner' ? (
                <>
                  {/* Eyebrow */}
                  <span
                    style={{
                      color: "#2563EB",
                      backgroundColor: "#EFF6FF",
                      border: "1px solid #BFDBFE",
                      borderRadius: "9999px",
                      padding: "5px 16px",
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      display: "inline-block",
                    }}
                  >
                    FOR LEARNERS
                  </span>

                  {/* Headline */}
                  <h1
                    className="text-4xl sm:text-6xl lg:text-[68px] font-black tracking-tight leading-[1.08]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F172A' }}
                  >
                    Find the guide who{' '}
                    <span className="italic font-bold" style={{ color: '#2563EB' }}>
                      gets you.
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-none lg:whitespace-nowrap" style={{ color: '#475569' }}>
                    Book 1:1 sessions or join a Circle with verified coaches, counsellors and mentors.
                  </p>

                  {/* Search Bar Input */}
                  <form
                    onSubmit={handleLearnerSearch}
                    className="flex flex-col sm:flex-row items-center p-2 rounded-2xl sm:rounded-full bg-white border border-slate-200 shadow-md max-w-xl gap-2 mt-4"
                  >
                    <div className="flex items-center gap-3 w-full px-4 py-2 sm:py-0">
                      <FiSearch className="text-slate-400 shrink-0" size={20} />
                      <input
                        type="text"
                        value={learnerQuery}
                        onChange={(e) => setLearnerQuery(e.target.value)}
                        placeholder="What would you like help with?"
                        className="w-full text-sm sm:text-base font-medium placeholder-slate-400 bg-transparent focus:outline-none"
                        style={{ color: '#0F172A' }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-7 py-3 rounded-full text-white font-bold text-sm whitespace-nowrap shadow-md hover:bg-blue-700 transition-all cursor-pointer"
                      style={{ backgroundColor: '#2563EB', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' }}
                    >
                      Find a guide
                    </button>
                  </form>

                  {/* Suggestion Topic Cylinder Pills (Always Visible Big Cylinder Boxes) */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '12px',
                      paddingTop: '16px',
                    }}
                  >
                    {['Burnout', 'Career change', 'Anxiety at work', 'Leadership', 'Parenting'].map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => {
                          setLearnerQuery(topic)
                          navigate(`/find-a-practitioner?search=${encodeURIComponent(topic)}`)
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px 22px',
                          borderRadius: '9999px',
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #D0D5DD',
                          color: '#1E293B',
                          fontSize: '15px',
                          fontWeight: 600,
                          lineHeight: '1.4',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.18s ease-in-out',
                          outline: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#2563EB'
                          e.currentTarget.style.color = '#2563EB'
                          e.currentTarget.style.backgroundColor = '#F0F7FF'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15)'
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#D0D5DD'
                          e.currentTarget.style.color = '#1E293B'
                          e.currentTarget.style.backgroundColor = '#FFFFFF'
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Eyebrow */}
                  <span
                    style={{
                      color: "#2563EB",
                      backgroundColor: "#EFF6FF",
                      border: "1px solid #BFDBFE",
                      borderRadius: "9999px",
                      padding: "5px 16px",
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      display: "inline-block",
                    }}
                  >
                    FOR PRACTITIONERS
                  </span>

                  {/* Headline */}
                  <h1
                    className="text-4xl sm:text-6xl lg:text-[68px] font-black tracking-tight leading-[1.08]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F172A' }}
                  >
                    Your whole practice, <br />
                    <span className="italic font-bold" style={{ color: '#2563EB' }}>
                      one link.
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-base sm:text-xl font-normal leading-relaxed max-w-xl" style={{ color: '#475569' }}>
                    Sessions, Circles, check-ins and payouts in one place — without the corporate LMS feel. Set up free.
                  </p>

                  {/* Handle Claim Input */}
                  <form
                    onSubmit={handleClaimPage}
                    className="flex flex-col sm:flex-row items-center p-2 rounded-2xl sm:rounded-full bg-white border border-slate-200 shadow-md max-w-xl gap-2 mt-4"
                  >
                    <div className="flex items-center w-full px-4 py-2 sm:py-0 text-sm sm:text-base font-semibold" style={{ color: '#64748B' }}>
                      <span>openhand.live/</span>
                      <input
                        type="text"
                        value={claimHandle}
                        onChange={(e) => setClaimHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        placeholder="yourname"
                        className="w-full text-sm sm:text-base font-bold placeholder-slate-400 bg-transparent focus:outline-none ml-0.5"
                        style={{ color: '#0F172A' }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-7 py-3 rounded-full text-white font-bold text-sm whitespace-nowrap shadow-md hover:bg-blue-700 transition-all cursor-pointer"
                      style={{ backgroundColor: '#2563EB', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' }}
                    >
                      Claim your page
                    </button>
                  </form>

                  {/* Feature Checklist Pills (Always Visible Big Cylinder Boxes) */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '12px',
                      paddingTop: '16px',
                    }}
                  >
                    {['1:1 bookings', 'Sell Your Courses', 'Workshops', 'Circles', 'AURA AI'].map((pill) => (
                      <span
                        key={pill}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px 22px',
                          borderRadius: '9999px',
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #D0D5DD',
                          color: '#1E293B',
                          fontSize: '15px',
                          fontWeight: 600,
                          lineHeight: '1.4',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.18s ease-in-out',
                        }}
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </>
              )}

            </div>

            {/* ─── RIGHT COLUMN: LIVE INTERACTIVE WIDGET ─── */}
            <div className="lg:col-span-5 flex justify-center">
              
              {heroRole === 'learner' ? (
                /* Learner Hero Illustration */
                <div className="w-full max-w-lg lg:max-w-xl flex items-center justify-center">
                  <div className="relative w-full bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-xl transition-all hover:shadow-2xl overflow-hidden group animate-heartbeat">
                    <img
                      src={learnerIllustration}
                      alt="Find the Guide Who Gets You"
                      className="w-full h-auto object-contain rounded-2xl transform transition-transform duration-300"
                    />
                  </div>
                </div>
              ) : (
                /* Practitioner Hero Illustration */
                <div className="w-full max-w-lg lg:max-w-xl flex items-center justify-center">
                  <div className="relative w-full bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-xl transition-all hover:shadow-2xl overflow-hidden group animate-heartbeat">
                    <img
                      src={websiteIllustration}
                      alt="OpenHand Practitioner Platform"
                      className="w-full h-auto object-contain rounded-2xl transform transition-transform duration-300"
                    />
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FLOATING CONTINUOUS SCROLLING BRAND MARQUEE STRAP                      */}
      {/* ========================================================================= */}
      <OHBrandStrap />

      {/* ========================================================================= */}
      {/* 2.5 OPENHAND FLOW: SCATTERED IN. ONE PRACTICE OUT                         */}
      {/* ========================================================================= */}
      <OpenHandFlow />

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS: ONE PLATFORM, TWO JOURNEYS (Screenshot 4)               */}
      {/* ========================================================================= */}
      <section className="py-20 lg:py-24 bg-white border-b border-slate-200/80" id="how-it-works">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span
              style={{
                color: "#2563EB",
                backgroundColor: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: "9999px",
                padding: "5px 16px",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "inline-block",
                marginBottom: "12px",
              }}
            >
              HOW IT WORKS
            </span>
            <h2 
              className="text-3xl sm:text-5xl font-black tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F172A' }}
            >
              One platform, two journeys
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Card 1: Learners Journey */}
            <div className="bg-[#F8FAFC] rounded-3xl p-8 sm:p-10 border border-slate-200 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex justify-center mb-8">
                  <span 
                    className="inline-block px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider"
                    style={{ color: '#1E40AF', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}
                  >
                    FOR LEARNERS
                  </span>
                </div>

                <div className="space-y-7">
                  <div className="flex items-start gap-4">
                    <span 
                      className="w-8 h-8 rounded-full font-extrabold flex items-center justify-center shrink-0 mt-0.5 text-sm shadow-xs"
                      style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                    >
                      1
                    </span>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg mb-1" style={{ color: '#0F172A' }}>
                        Tell us what's going on
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: '#475569' }}>
                        A 2-minute check-in — no clinical forms.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span 
                      className="w-8 h-8 rounded-full font-extrabold flex items-center justify-center shrink-0 mt-0.5 text-sm shadow-xs"
                      style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                    >
                      2
                    </span>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg mb-1" style={{ color: '#0F172A' }}>
                        Pick a guide or a Circle
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: '#475569' }}>
                        Compare verified profiles, prices and next slots.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span 
                      className="w-8 h-8 rounded-full font-extrabold flex items-center justify-center shrink-0 mt-0.5 text-sm shadow-xs"
                      style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                    >
                      3
                    </span>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg mb-1" style={{ color: '#0F172A' }}>
                        Grow between sessions
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: '#475569' }}>
                        Gentle check-ins and peer pods keep momentum.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10">
                <Link
                  to="/find-a-practitioner"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-sm shadow-md hover:bg-blue-700 transition-all"
                  style={{ backgroundColor: '#2563EB', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' }}
                >
                  Find your guide
                </Link>
              </div>
            </div>

            {/* Card 2: Practitioners Journey */}
            <div 
              className="rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xl"
              style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', color: '#FFFFFF' }}
            >
              <div>
                <div className="flex justify-center mb-8">
                  <span 
                    className="inline-block px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider"
                    style={{ color: '#E2E8F0', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    FOR PRACTITIONERS
                  </span>
                </div>

                <div className="space-y-7">
                  <div className="flex items-start gap-4">
                    <span 
                      className="w-8 h-8 rounded-full font-extrabold flex items-center justify-center shrink-0 mt-0.5 text-sm shadow-xs"
                      style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                    >
                      1
                    </span>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg mb-1" style={{ color: '#FFFFFF' }}>
                        Claim your page
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: '#CBD5E1' }}>
                        openhand.live/yourname — live in minutes, free.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span 
                      className="w-8 h-8 rounded-full font-extrabold flex items-center justify-center shrink-0 mt-0.5 text-sm shadow-xs"
                      style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                    >
                      2
                    </span>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg mb-1" style={{ color: '#FFFFFF' }}>
                        Add your offers
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: '#CBD5E1' }}>
                        1:1s, Circles, check-ins, resources, org seats.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span 
                      className="w-8 h-8 rounded-full font-extrabold flex items-center justify-center shrink-0 mt-0.5 text-sm shadow-xs"
                      style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                    >
                      3
                    </span>
                    <div>
                      <h4 className="font-extrabold text-base sm:text-lg mb-1" style={{ color: '#FFFFFF' }}>
                        Get booked &amp; paid
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed font-medium" style={{ color: '#CBD5E1' }}>
                        Calendar sync, UPI/cards, AURA notes, referrals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10">
                <Link
                  to="/signup?role=practitioner"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-sm shadow-md hover:bg-slate-100 transition-all cursor-pointer"
                  style={{ backgroundColor: '#FFFFFF', color: '#0F172A', fontWeight: 800 }}
                >
                  Start your free practice
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>
      {/* ========================================================================= */}
      {/* 4.5 PRACTITIONER OF THE MONTH                                             */}
      {/* ========================================================================= */}
      {topPractitioners.length > 0 && (
        <section className="py-20 bg-slate-50 border-b border-slate-200/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-slate-50 to-slate-50 pointer-events-none" />
          <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4" style={{ color: '#D97706', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                <FiStar className="fill-amber-500" /> Practitioner of the Month
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                Honoring our top guides
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                Meet the practitioners who have made the most profound impact in our community this month.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
              {topPractitioners.map((practitioner, idx) => (
                <div key={practitioner._id} className="w-full sm:w-[320px] bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center group cursor-pointer" onClick={() => navigate(practitioner.handle ? `/handle/${practitioner.handle}` : `/find-a-practitioner`)}>
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-50 shadow-inner group-hover:scale-105 transition-transform duration-300">
                      {practitioner.image ? (
                        <img src={practitioner.image} alt={practitioner.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-black">
                          {practitioner.firstName?.[0]}{practitioner.lastName?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md border border-white">
                      Rank {practitioner.practitionerOfTheMonthRank}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">
                    Dr. {practitioner.firstName} {practitioner.lastName}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mb-4">
                    {practitioner.specialties?.[0] || 'Integrative Health'}
                  </p>
                  <div className="w-full h-px bg-slate-100 mb-4" />
                  <span className="text-amber-600 font-bold text-sm flex items-center gap-2">
                    View Profile <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ========================================================================= */}
      {/* 5. AURA · CONSENT-FIRST AI (Screenshot 6)                                */}
      {/* ========================================================================= */}
      <section 
        className="py-20 overflow-hidden relative" 
        id="aura"
        style={{ backgroundColor: '#040825', color: '#FFFFFF' }}
      >
        {/* Glow ambient */}
        <div className="absolute -top-24 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left text */}
            <div className="lg:col-span-7 space-y-6">
              <span
                style={{
                  color: "#93C5FD",
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  border: "1px solid rgba(147, 197, 253, 0.4)",
                  borderRadius: "9999px",
                  padding: "5px 16px",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  display: "inline-block",
                }}
              >
                AURA · CONSENT-FIRST AI
              </span>
              
              <h2 
                className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFFFFF' }}
              >
                AI that sounds like you — and only listens when invited.
              </h2>

              <p className="text-sm sm:text-base font-normal leading-relaxed max-w-xl" style={{ color: '#CBD5E1' }}>
                Reflection prompts, session-note drafts and between-session nudges, tuned to your practice voice. Learners opt in, every time.
              </p>

              <div>
                <Link
                  to="/aura"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg cursor-pointer hover:bg-slate-100"
                  style={{ backgroundColor: '#FFFFFF', color: '#0F172A', fontWeight: 800 }}
                >
                  <span>Meet AURA</span>
                  <FiArrowRight style={{ color: '#0F172A' }} />
                </Link>
              </div>

              {/* 4 Points in 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-2.5 hover:bg-white/15 transition-all">
                  <span className="text-base sm:text-lg">✨</span>
                  <span className="text-xs sm:text-sm font-bold leading-snug" style={{ color: '#FFFFFF' }}>Reflection prompts in your voice</span>
                </div>
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-2.5 hover:bg-white/15 transition-all">
                  <span className="text-base sm:text-lg">📝</span>
                  <span className="text-xs sm:text-sm font-bold leading-snug" style={{ color: '#FFFFFF' }}>Notes → structured summaries</span>
                </div>
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-2.5 hover:bg-white/15 transition-all">
                  <span className="text-base sm:text-lg">🔔</span>
                  <span className="text-xs sm:text-sm font-bold leading-snug" style={{ color: '#FFFFFF' }}>Human-sounding nudges</span>
                </div>
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-2.5 hover:bg-white/15 transition-all">
                  <span className="text-base sm:text-lg">🔒</span>
                  <span className="text-xs sm:text-sm font-bold leading-snug" style={{ color: '#FFFFFF' }}>Encrypted, consent logged</span>
                </div>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <img 
                src={auraImage} 
                alt="Aura AI Interface" 
                className="w-full max-w-md h-auto object-contain rounded-2xl shadow-2xl transform transition-transform duration-500 hover:scale-105" 
              />
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5.5 ROLLING COURSES MARQUEE                                              */}
      {/* ========================================================================= */}
      <section className="py-20 bg-white overflow-hidden border-b border-slate-200/80">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <span
            style={{
              color: "#2563EB",
              backgroundColor: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: "9999px",
              padding: "5px 16px",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "12px",
            }}
          >
            LEARN FROM THE BEST
          </span>
          <h2 
            className="text-3xl sm:text-5xl font-black tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F172A' }}
          >
            Explore Free &amp; Premium Courses
          </h2>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden flex flex-col gap-6 sm:gap-8 pb-4">
          
          {/* Edge Gradients for smooth fade in/out */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 z-10 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 z-10 bg-gradient-to-l from-white to-transparent" />

          {/* Row 1: Free Courses (Scrolls Left) */}
          {freeCourses.length > 0 && (
            <div className="flex w-max animate-course-marquee hover:[animation-play-state:paused]">
              {[0, 1, 2, 3].map((set) => (
                <div key={`free-set-${set}`} className="flex gap-5 sm:gap-6 pr-5 sm:pr-6 shrink-0">
                  {freeCourses.map((course) => (
                    <CourseCard key={`free-${set}-${course._id || course.id}`} course={course} />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Row 2: Paid Courses (Scrolls Right) */}
          {paidCourses.length > 0 && (
            <div className="flex w-max animate-course-marquee-reverse hover:[animation-play-state:paused] ml-[-800px]">
              {[0, 1, 2, 3].map((set) => (
                <div key={`paid-set-${set}`} className="flex gap-5 sm:gap-6 pr-5 sm:pr-6 shrink-0">
                  {paidCourses.map((course) => (
                    <CourseCard key={`paid-${set}-${course._id || course.id}`} course={course} />
                  ))}
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Embedded CSS for this section */}
        <style>{`
          @keyframes course-marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-25%); }
          }
          @keyframes course-marquee-scroll-reverse {
            0% { transform: translateX(-25%); }
            100% { transform: translateX(0); }
          }
          .animate-course-marquee {
            animation: course-marquee-scroll 45s linear infinite;
          }
          .animate-course-marquee-reverse {
            animation: course-marquee-scroll-reverse 50s linear infinite;
          }
        `}</style>
      </section>

      {/* ========================================================================= */}
      {/* 6. ORGANIZATIONS BANNER & DUAL CLOSING CTAS (Screenshot 7)                */}
      {/* ========================================================================= */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Top Banner: Organizations & EAP (Redesigned) */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-14 border border-slate-200 shadow-xl relative overflow-hidden">
            {/* Background pattern/gradient */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 relative z-10 items-center">
              <div className="space-y-6 text-left">
                <span
                  style={{
                    color: "#2563EB",
                    backgroundColor: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    borderRadius: "9999px",
                    padding: "6px 18px",
                    fontSize: "12px",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    display: "inline-block",
                  }}
                >
                  FOR ORGANIZATIONS &amp; EAP
                </span>
                <h3 
                  className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F172A' }}
                >
                  Give your people a guide, not another webinar.
                </h3>
                <p className="text-base sm:text-lg font-medium leading-relaxed" style={{ color: '#475569' }}>
                  Upgrade your team's support system. We provide tailored 1:1 sessions and group Circles with top-tier verified guides.
                </p>
                <div className="pt-4">
                  <Link
                    to="/contact-us"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm shadow-lg hover:bg-slate-800 transition-all cursor-pointer"
                    style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}
                  >
                    <span>Talk to our team</span>
                    <FiArrowRight />
                  </Link>
                </div>
              </div>

              {/* Right side: Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Feature 1 */}
                <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <span className="text-xl">👥</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Curated Pools</h4>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">Verified coaches, counsellors, and mentors matched to your team.</p>
                </div>
                {/* Feature 2 */}
                <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <span className="text-xl">📊</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">HR Reporting</h4>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">Track utilization and engagement metrics without compromising privacy.</p>
                </div>
                {/* Feature 3 */}
                <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <span className="text-xl">💳</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Per-Seat Billing</h4>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">Flexible pricing structures that scale effortlessly as you grow.</p>
                </div>
                {/* Feature 4 */}
                <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <span className="text-xl">⭕</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Private Circles</h4>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">Exclusive peer pods and group sessions dedicated to your workforce.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 2 Split Dual CTAs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Left CTA: Learner */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 flex flex-col justify-between shadow-xs">
              <div className="space-y-2 mb-8">
                <h4 
                  className="text-2xl sm:text-3xl font-black tracking-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F172A' }}
                >
                  Ready to feel lighter?
                </h4>
                <p className="text-xs sm:text-sm font-medium" style={{ color: '#475569' }}>
                  Find a guide or join a Circle starting this week.
                </p>
              </div>

              <div>
                <Link
                  to="/find-a-practitioner"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-sm shadow-md hover:bg-blue-700 transition-all cursor-pointer"
                  style={{ backgroundColor: '#2563EB', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' }}
                >
                  Explore guides
                </Link>
              </div>
            </div>

            {/* Right CTA: Practitioner */}
            <div 
              className="rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xl"
              style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', color: '#FFFFFF' }}
            >
              <div className="space-y-2 mb-8">
                <h4 
                  className="text-2xl sm:text-3xl font-black tracking-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFFFFF' }}
                >
                  Ready to take your practice online?
                </h4>
                <p className="text-xs sm:text-sm font-medium" style={{ color: '#CBD5E1' }}>
                  Set up free. Pay only when you earn.
                </p>
              </div>

              <div>
                <Link
                  to="/signup?role=practitioner"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-sm shadow-md hover:bg-slate-100 transition-all cursor-pointer"
                  style={{ backgroundColor: '#FFFFFF', color: '#0F172A', fontWeight: 800 }}
                >
                  Claim your page
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Global Footer */}
      <OHFooter />

    </div>
  )
}

export default Home
