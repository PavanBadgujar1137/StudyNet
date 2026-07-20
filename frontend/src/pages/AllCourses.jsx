import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { FaBook, FaStar, FaArrowRight } from "react-icons/fa"
import { getAllCourses } from "../services/operations/courseDetailsAPI"
import GetAvgRating from "../utils/avgRating"
import RatingStars from "../components/Common/RatingStars"
import Footer from "../components/Common/Footer"
import DynamicCanvasBg from "../components/Common/DynamicCanvasBg"

export default function AllCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      const res = await getAllCourses()
      if (res) {
        setCourses(res)
      }
      setLoading(false)
    }
    fetchCourses()
  }, [])

  return (
    <div className="bg-paper min-h-screen font-sans text-navy relative flex flex-col justify-between overflow-hidden">
      {/* Dynamic Ambient Background Canvas */}
      <DynamicCanvasBg />

      {/* Hero Header */}
      <section className="relative z-10 pt-20 pb-12 text-center border-b border-line/40">
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-6">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-royal-blue/30 bg-white/80 backdrop-blur-md px-5 py-2 text-xs font-bold uppercase tracking-widest text-royal-blue shadow-lg shadow-royal-blue/10 animate-float-slow">
            <FaBook className="text-violet text-xs" />
            OpenHand Learning Catalog
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-navy max-w-4xl leading-tight">
            Explore All Available <span className="bg-gradient-to-r from-royal-blue via-violet to-pink-500 bg-clip-text text-transparent">Courses &amp; Paths</span>
          </h1>

          <p className="text-lg text-slate-600 font-medium max-w-2xl leading-relaxed">
            Discover expert-led video courses, interactive hands-on modules, daily practice papers, and verified skill completion certificates.
          </p>
        </div>
      </section>

      {/* Main Course Directory Area */}
      <main className="relative z-10 flex-grow mx-auto w-11/12 max-w-maxContent py-16 text-left">
        {loading ? (
          <div className="grid min-h-[40vh] place-items-center">
            <div className="spinner"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[30px] p-16 text-center shadow-xl max-w-lg mx-auto">
            <FaBook className="text-5xl text-royal-blue/40 mx-auto mb-4 animate-bounce" />
            <p className="font-bold text-navy text-xl">No courses published yet</p>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              Instructors are currently building new interactive courses. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              const avgReviewCount = GetAvgRating(course.ratingAndReviews)
              return (
                <Link
                  key={course._id}
                  to={`/courses/${course._id}`}
                  className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[28px] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col group"
                >
                  {/* Thumbnail */}
                  <div className="h-52 w-full relative overflow-hidden shrink-0 border-b border-line/40">
                    <img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-4 right-4 bg-navy/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                      ₹ {course.price}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col justify-between flex-grow gap-4">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xl font-bold text-navy line-clamp-1 group-hover:text-royal-blue transition-colors duration-200">
                        {course.courseName}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                        {course.courseDescription}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 mt-1">
                        Instructor: {course?.instructor?.firstName} {course?.instructor?.lastName}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="flex justify-between items-center text-xs border-t border-line/60 pt-4 mt-auto">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-500">{avgReviewCount || 0}</span>
                        <RatingStars Review_Count={avgReviewCount} />
                        <span className="text-slate-400 font-medium">({course?.ratingAndReviews?.length || 0})</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-royal-blue group-hover:translate-x-1 transition-transform">
                        View Course <FaArrowRight className="text-[10px]" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
