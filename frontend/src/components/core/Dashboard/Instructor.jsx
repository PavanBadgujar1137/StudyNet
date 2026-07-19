import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { 
  FaBook, 
  FaUsers, 
  FaWallet, 
  FaPlus, 
  FaChevronRight, 
  FaCalendarAlt, 
  FaAward, 
  FaLightbulb, 
  FaRegEdit, 
  FaExternalLinkAlt 
} from "react-icons/fa"
import { FiTrendingUp, FiArrowUpRight, FiBookOpen } from "react-icons/fi"

import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI"
import { getInstructorData } from "../../../services/operations/profileAPI"
import { COURSE_STATUS } from "../../../utils/constants"
import InstructorChart from "./InstructorDashboard/InstructorChart"

export default function Instructor() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [loading, setLoading] = useState(false)
  const [instructorData, setInstructorData] = useState(null)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const instructorApiData = await getInstructorData(token)
      const result = await fetchInstructorCourses(token)
      if (instructorApiData?.length) setInstructorData(instructorApiData)
      if (result) {
        setCourses(result)
      }
      setLoading(false)
    })()
  }, [token])

  const totalAmount = instructorData?.reduce(
    (acc, curr) => acc + curr.totalAmountGenerated,
    0
  )

  const totalStudents = instructorData?.reduce(
    (acc, curr) => acc + curr.totalStudentsEnrolled,
    0
  )

  // Quick calculations for insights panel
  const averagePrice = courses.length > 0 
    ? Math.round(courses.reduce((acc, curr) => acc + curr.price, 0) / courses.length) 
    : 0

  const topCourse = instructorData && instructorData.length > 0
    ? [...instructorData].sort((a, b) => b.totalStudentsEnrolled - a.totalStudentsEnrolled)[0]
    : null

  const draftCount = courses.filter(c => c.status === COURSE_STATUS.DRAFT).length
  const publishedCount = courses.filter(c => c.status === COURSE_STATUS.PUBLISHED).length

  const currentDateString = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex flex-col gap-8 text-left max-w-7xl mx-auto px-4 md:px-6">
      
      {/* 1. Welcoming Hero Banner */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-navy via-[#1E293B] to-[#3B82F6] p-6 md:p-8 text-white shadow-xl shadow-blue-900/10">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-xl"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-royal-blue/10 blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-sky-blue">
              <FaCalendarAlt />
              <span>{currentDateString}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-fraunces tracking-tight text-white mt-1">
              Welcome Back, {user?.firstName}! 👋
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-xl font-poppins font-light leading-relaxed">
              Track your student success, inspect enrollment stats, monitor earnings, and edit your coaching spaces.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link to="/dashboard/my-courses">
              <button className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-all backdrop-blur-md shadow-sm">
                <FiBookOpen className="text-lg" />
                <span>My Spaces</span>
              </button>
            </Link>
            
            <Link to="/dashboard/add-course">
              <button className="flex items-center gap-2 rounded-xl bg-white text-navy hover:bg-slate-100 px-5 py-3 text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                <FaPlus className="text-xs text-royal-blue" />
                <span>Create Space</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid min-h-[40vh] place-items-center">
          <div className="relative flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-blue"></div>
            <div className="absolute text-[10px] font-bold text-royal-blue">STUDY</div>
          </div>
        </div>
      ) : courses.length > 0 ? (
        <div className="flex flex-col gap-8">
          
          {/* 2. Enhanced Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat Card 1: Total Spaces */}
            <div className="group relative bg-white border border-slate-100 hover:border-royal-blue/30 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-royal-blue"></div>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total Spaces</span>
                  <p className="text-3xl font-extrabold text-navy font-fraunces">{courses.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-royal-blue/10 flex items-center justify-center text-royal-blue group-hover:scale-110 transition-transform duration-300">
                  <FaBook className="text-lg" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 w-fit px-2.5 py-1 rounded-full border border-emerald-100">
                <FiTrendingUp />
                <span>Active Learning Hubs</span>
              </div>
            </div>

            {/* Stat Card 2: Total Clients */}
            <div className="group relative bg-white border border-slate-100 hover:border-violet/30 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-violet"></div>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total Clients</span>
                  <p className="text-3xl font-extrabold text-navy font-fraunces">{totalStudents}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-violet/10 flex items-center justify-center text-violet group-hover:scale-110 transition-transform duration-300">
                  <FaUsers className="text-lg" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-royal-blue font-semibold bg-blue-50 w-fit px-2.5 py-1 rounded-full border border-blue-100">
                <FiArrowUpRight />
                <span>+12.4% vs last month</span>
              </div>
            </div>

            {/* Stat Card 3: Total Earnings */}
            <div className="group relative bg-white border border-slate-100 hover:border-emerald-500/30 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total Earnings</span>
                  <p className="text-3xl font-extrabold text-navy font-fraunces">₹ {totalAmount?.toLocaleString() || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                  <FaWallet className="text-lg" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 w-fit px-2.5 py-1 rounded-full border border-emerald-100">
                <FiArrowUpRight />
                <span>+8.2% vs last month</span>
              </div>
            </div>
          </div>

          {/* 3. Performance & Insights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Card (Spans 2 columns on lg screens) */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
              {totalAmount > 0 || totalStudents > 0 ? (
                <InstructorChart courses={instructorData} />
              ) : (
                <div className="min-h-[300px] flex flex-col justify-center items-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                    <FaBook className="text-2xl" />
                  </div>
                  <h4 className="text-lg font-bold text-navy font-fraunces">Visual Performance</h4>
                  <p className="mt-2 text-sm text-ink-soft max-w-xs">
                    Not enough analytics data yet to populate visualizations. Receive enrollments to see chart insights.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Insights Widget (Spans 1 column) */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col">
              <div className="border-b border-line/50 pb-4 mb-5">
                <h3 className="text-lg font-bold text-navy font-fraunces flex items-center gap-2">
                  <FaLightbulb className="text-amber-500 text-base" /> Quick Insights
                </h3>
                <p className="text-xs text-ink-soft mt-0.5">Automated workspace analytics summary</p>
              </div>

              <div className="flex-1 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  {/* Insight: Top space */}
                  {topCourse && (
                    <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-violet/10 flex items-center justify-center text-violet shrink-0">
                        <FaAward />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Enrolled Space</p>
                        <p className="text-sm font-semibold text-navy truncate mt-0.5">{topCourse.courseName}</p>
                        <p className="text-xs text-ink-soft mt-0.5">{topCourse.totalStudentsEnrolled} students</p>
                      </div>
                    </div>
                  )}

                  {/* Insight: Price stats */}
                  <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-royal-blue/10 flex items-center justify-center text-royal-blue shrink-0">
                      <FaWallet />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average Course Price</p>
                      <p className="text-sm font-extrabold text-navy mt-0.5">₹ {averagePrice.toLocaleString()}</p>
                      <p className="text-xs text-ink-soft mt-0.5">Across {courses.length} spaces</p>
                    </div>
                  </div>

                  {/* Insight: Published vs Draft */}
                  <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                      <FaBook />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-poppins">Status Split</p>
                      <div className="flex items-center justify-between text-xs text-navy mt-1.5">
                        <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{publishedCount} Published</span>
                        <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{draftCount} Drafts</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Helpful Tip */}
                <div className="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-left">
                  <div className="text-amber-600 shrink-0 mt-0.5">
                    <FaLightbulb />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Platform Recommendation</h5>
                    <p className="text-xs text-amber-700/90 leading-relaxed mt-1">
                      Spaces with complete materials and a published status receive 5x higher student enrollment rates on average. Keep content fresh!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Bottom Section: Active Containers list */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-line/50 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-navy font-fraunces">Active Learning Containers</h2>
                <p className="text-xs text-ink-soft mt-0.5">Overview of your primary student learning portals</p>
              </div>
              <Link to="/dashboard/my-courses" className="text-xs font-bold text-royal-blue flex items-center gap-1 hover:underline">
                Manage All <FaChevronRight className="text-[9px]" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.slice(0, 3).map((course) => (
                <div key={course._id} className="flex flex-col bg-slate-50 hover:bg-white border border-slate-200/60 hover:border-royal-blue/30 rounded-xl p-4 transition-all duration-300 group shadow-sm hover:shadow-md">
                  
                  {/* Thumbnail Image Container */}
                  <div className="h-44 w-full rounded-lg overflow-hidden border border-slate-200 relative shrink-0 bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Floating Price Pill */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-royal-blue shadow-sm border border-slate-100">
                      ₹ {course.price}
                    </div>

                    {/* Floating Status Pill */}
                    <div className="absolute top-3 left-3">
                      {course.status === COURSE_STATUS.DRAFT ? (
                        <span className="bg-slate-900/80 backdrop-blur text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide">
                          Draft
                        </span>
                      ) : (
                        <span className="bg-emerald-600/90 backdrop-blur text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide">
                          Published
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col justify-between flex-1 mt-4 gap-4">
                    <div>
                      <h3 className="text-base font-bold text-navy group-hover:text-royal-blue transition-colors duration-200 line-clamp-1">
                        {course.courseName}
                      </h3>
                      <p className="text-xs text-ink-soft line-clamp-2 mt-1 leading-relaxed">
                        {course.courseDescription}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <span className="font-medium text-navy">{course.studentsEnroled?.length || 0} Clients</span>
                      
                      <div className="flex gap-2">
                        <Link 
                          to={`/dashboard/edit-course/${course._id}`} 
                          title="Edit space"
                          className="p-2 rounded-lg bg-slate-200/50 hover:bg-royal-blue/10 text-royal-blue transition-all"
                        >
                          <FaRegEdit />
                        </Link>
                        
                        <Link 
                          to={`/courses/${course._id}`} 
                          target="_blank"
                          title="View preview"
                          className="p-2 rounded-lg bg-slate-200/50 hover:bg-navy/10 text-navy transition-all"
                        >
                          <FaExternalLinkAlt className="text-[10px]" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 5. Styled Empty State */
        <div className="mt-4 rounded-[24px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm max-w-xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-royal-blue/10 flex items-center justify-center text-royal-blue mb-4">
            <FaBook className="text-2xl" />
          </div>
          <p className="font-extrabold text-navy text-xl font-fraunces">No learning spaces created yet</p>
          <p className="text-sm text-ink-soft mt-2 max-w-sm mx-auto leading-relaxed">
            Get started by creating your first secure container for student learning, files, and lectures.
          </p>
          <Link to="/dashboard/add-course" className="mt-6">
            <button className="rounded-xl bg-royal-blue hover:bg-royal-blue/90 px-6 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 inline-flex items-center gap-2">
              <FaPlus className="text-xs" /> Create space
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}

