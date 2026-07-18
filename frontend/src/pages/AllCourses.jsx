import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { FaBook } from "react-icons/fa"
import { getAllCourses } from "../services/operations/courseDetailsAPI"
import GetAvgRating from "../utils/avgRating"
import RatingStars from "../components/Common/RatingStars"
import Footer from "../components/Common/Footer"

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
    <div className="bg-slate-50 min-h-screen font-poppins relative flex flex-col justify-between">
      {/* Main Page Area */}
      <main className="flex-grow mx-auto w-11/12 max-w-maxContent py-12 text-left">
        {/* Breadcrumb / Title */}
        <div className="mb-10 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-royal-blue bg-royal-blue/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <FaBook className="text-[10px]" /> Workspace Directory
          </span>
          <h1 className="font-fraunces text-3xl sm:text-4.5xl font-bold text-navy mt-4 leading-tight">
            Explore All Available Practice Spaces
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Browse our directory to find cohorts, secure journals, reflection logs, and certified guidance.
          </p>
        </div>

        {/* Loading / Grid */}
        {loading ? (
          <div className="grid min-h-[40vh] place-items-center">
            <div className="spinner"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm max-w-lg mx-auto">
            <FaBook className="text-4xl text-slate-300 mx-auto mb-4" />
            <p className="font-semibold text-navy text-lg">No practice spaces published yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Check back soon for new guidance courses and secure reflection cohorts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 my-4">
            {courses.map((course) => {
              const avgReviewCount = GetAvgRating(course.ratingAndReviews)
              return (
                <Link
                  key={course._id}
                  to={`/courses/${course._id}`}
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
                >
                  {/* Image */}
                  <div className="h-48 w-full relative overflow-hidden shrink-0 border-b border-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col justify-between flex-grow gap-4">
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-fraunces text-navy text-lg font-bold line-clamp-1 group-hover:text-royal-blue transition-colors duration-200">
                        {course.courseName}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {course.courseDescription}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        Guide: {course?.instructor?.firstName} {course?.instructor?.lastName}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-4 mt-auto">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-amber-500">{avgReviewCount || 0}</span>
                        <RatingStars Review_Count={avgReviewCount} />
                        <span className="text-slate-400">({course?.ratingAndReviews?.length || 0})</span>
                      </div>
                      <span className="font-extrabold text-royal-blue text-sm">
                        Rs. {course.price}
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
