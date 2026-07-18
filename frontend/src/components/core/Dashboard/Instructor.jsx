import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { FaBook, FaUsers, FaWallet, FaPlus, FaChevronRight } from "react-icons/fa"

import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI"
import { getInstructorData } from "../../../services/operations/profileAPI"
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
      if (instructorApiData.length) setInstructorData(instructorApiData)
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

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-navy font-fraunces flex items-center gap-2">
          Hi {user?.firstName} 👋
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Monitor your client enrolments, course revenue, and active spaces.
        </p>
      </div>

      {loading ? (
        <div className="grid min-h-[40vh] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : courses.length > 0 ? (
        <div className="flex flex-col gap-6">
          {/* Stats Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Total Spaces */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-royal-blue/10 flex items-center justify-center text-royal-blue shrink-0">
                <FaBook className="text-sm" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Spaces</p>
                <p className="text-2xl font-extrabold text-navy font-fraunces mt-0.5">
                  {courses.length}
                </p>
              </div>
            </div>

            {/* Total Clients */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-violet/10 flex items-center justify-center text-violet shrink-0">
                <FaUsers className="text-sm" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Clients</p>
                <p className="text-2xl font-extrabold text-navy font-fraunces mt-0.5">
                  {totalStudents}
                </p>
              </div>
            </div>

            {/* Total Earnings */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-700 shrink-0">
                <FaWallet className="text-sm" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Income</p>
                <p className="text-2xl font-extrabold text-navy font-fraunces mt-0.5">
                  Rs. {totalAmount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Visualizer Chart Card */}
            {totalAmount > 0 || totalStudents > 0 ? (
              <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
                <InstructorChart courses={instructorData} />
              </div>
            ) : (
              <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-center items-center text-center">
                <FaBook className="text-4xl text-slate-300 mb-3" />
                <p className="text-lg font-bold text-navy font-fraunces">Visualize Performance</p>
                <p className="mt-2 text-sm text-slate-500 max-w-xs">
                  Not enough analytics data yet to populate visualizations.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Card: Your Active Containers */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm relative">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy font-fraunces">Your Active Containers</h2>
              <Link to="/dashboard/my-courses" className="text-xs font-bold text-royal-blue flex items-center gap-1 hover:underline">
                View All <FaChevronRight className="text-[9px]" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 my-5">
              {courses.slice(0, 3).map((course) => (
                <div key={course._id} className="flex flex-col gap-3 group cursor-pointer bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="h-40 w-full rounded-lg overflow-hidden border border-slate-200/60 relative">
                    <img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  </div>
                  <div className="px-1 flex flex-col gap-1">
                    <h3 className="text-sm font-semibold text-navy group-hover:text-royal-blue transition-colors duration-200 line-clamp-1">
                      {course.courseName}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <span>{course.studentsEnroled?.length || 0} clients</span>
                      <span className="font-bold text-royal-blue">Rs. {course.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <FaBook className="text-4xl text-slate-300 mx-auto mb-4" />
          <p className="font-semibold text-navy text-lg">No practice spaces created yet</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Get started by creating your first secure container for client coaching and reflections.
          </p>
          <Link to="/dashboard/add-course">
            <button className="mt-5 rounded-full bg-royal-blue px-6 py-2.5 text-sm font-semibold text-white hover:bg-royal-blue/90 shadow-sm transition-all hover:scale-95 inline-flex items-center gap-1.5">
              <FaPlus className="text-xs" /> Create space
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
