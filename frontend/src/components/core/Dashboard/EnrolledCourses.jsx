import { useEffect, useState } from "react"
import ProgressBar from "@ramonak/react-progress-bar"
import { useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { FaClock, FaBookOpen, FaAward, FaChevronRight } from "react-icons/fa"

import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [enrolledCourses, setEnrolledCourses] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getUserEnrolledCourses(token) // Getting all the published and the drafted courses
        const filterPublishCourse = res.filter((ele) => ele.status !== "Draft")
        setEnrolledCourses(filterPublishCourse)
      } catch (error) {
        console.log("Could not fetch enrolled courses.")
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calculate statistics
  const totalCourses = enrolledCourses?.length || 0
  const completedCourses = enrolledCourses?.filter(c => (c.progressPercentage || 0) === 100).length || 0
  const inProgressCourses = totalCourses - completedCourses

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Title */}
      <h1 className="text-3xl font-bold text-navy font-fraunces">
        Enrolled Practice Spaces
      </h1>

      {!enrolledCourses ? (
        <div className="grid min-h-[50vh] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : !enrolledCourses.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <FaBookOpen className="text-4xl text-slate-300 mx-auto mb-4" />
          <p className="font-semibold text-navy text-lg">No active spaces yet</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            You haven&apos;t enrolled in any practice spaces. Explore our catalog to find a guide.
          </p>
          <Link to="/all-courses">
            <button className="mt-5 rounded-full bg-royal-blue px-6 py-2.5 text-sm font-semibold text-white hover:bg-royal-blue/90 shadow-sm transition-all hover:scale-95">
              Explore spaces
            </button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Summary Stats Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col gap-1 text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Enrolled</span>
              <span className="text-2xl font-extrabold text-navy font-fraunces">{totalCourses}</span>
            </div>
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col gap-1 text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Completed Spaces</span>
              <span className="text-2xl font-extrabold text-green-600 font-fraunces">{completedCourses}</span>
            </div>
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col gap-1 text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">In Progress</span>
              <span className="text-2xl font-extrabold text-royal-blue font-fraunces">{inProgressCourses}</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group relative"
              >
                {/* Thumbnail Container */}
                <div className="h-40 w-full relative overflow-hidden shrink-0">
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-royal-blue bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-sm">
                    Active container
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col justify-between flex-grow gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-fraunces text-navy text-lg font-bold line-clamp-1 group-hover:text-royal-blue transition-colors duration-200">
                      {course.courseName}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {course.courseDescription}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1 font-medium">
                      <FaClock className="text-slate-400" /> {course?.totalDuration || "Self-paced"}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-royal-blue">
                      {course.progressPercentage || 0}% Complete
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full shrink-0">
                    <ProgressBar
                      completed={course.progressPercentage || 0}
                      height="5px"
                      isLabelVisible={false}
                      bgColor="#2563EB"
                      baseBgColor="#F1F5F9"
                    />
                  </div>

                  {/* Validity Countdown bar (if applicable) */}
                  {course.validityDays && (
                    <div className="w-full shrink-0 text-xs">
                      <div className="flex justify-between text-slate-500 mb-1">
                        <span>Validity</span>
                        <span>{course.validityDays} days left</span>
                      </div>
                      <ProgressBar
                        completed={100}
                        height="3px"
                        isLabelVisible={false}
                        bgColor="#10B981"
                        baseBgColor="#E2E8F0"
                      />
                    </div>
                  )}


                  {/* Actions row */}
                  <div className="flex items-center justify-between mt-1 shrink-0 gap-3 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => {
                        navigate(
                          `/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`
                        )
                      }}
                      className="flex items-center gap-1 rounded-full bg-royal-blue hover:bg-royal-blue/90 text-white font-semibold py-2 px-4.5 text-xs transition-all hover:scale-95 shadow-sm"
                    >
                      Enter Space <FaChevronRight className="text-[8px]" />
                    </button>

                    <Link 
                      to="/certificate" 
                      className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-royal-blue transition-colors"
                    >
                      <FaAward className="text-sm" /> Certificate
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
