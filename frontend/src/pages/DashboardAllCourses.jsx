import React, { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { FaBook, FaShoppingCart, FaArrowRight } from "react-icons/fa"
import { getAllCourses } from "../services/operations/courseDetailsAPI"
import { BuyCourse } from "../services/operations/studentFeaturesAPI"
import GetAvgRating from "../utils/avgRating"
import RatingStars from "../components/Common/RatingStars"
import ConfirmationModal from "../components/Common/ConfirmationModal"
import { ACCOUNT_TYPE } from "../utils/constants"

export default function DashboardAllCourses() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmationModal, setConfirmationModal] = useState(null)

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

  const handleBuyClick = (e, courseId) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      setConfirmationModal({
        text1: "Instructors cannot purchase courses",
        text2: "Please switch to a student account to purchase learning spaces.",
        btn1Text: "Okay",
        btn2Text: "Cancel",
        btn1Handler: () => setConfirmationModal(null),
        btn2Handler: () => setConfirmationModal(null),
      })
      return
    }

    if (token) {
      BuyCourse(token, [courseId], user, navigate, dispatch)
      return
    }
    
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to purchase practice spaces.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy font-fraunces">
            All Available Practice Spaces
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse our full catalog and enroll directly in any practice space.
          </p>
        </div>
      </div>

      {/* Loading / Grid */}
      {loading ? (
        <div className="grid min-h-[40vh] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm">
          <FaBook className="text-4xl text-slate-300 mx-auto mb-4" />
          <p className="font-semibold text-navy text-lg">No practice spaces published yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const avgReviewCount = GetAvgRating(course.ratingAndReviews)
            const isEnrolled = user && course?.studentsEnroled?.includes(user?._id)

            return (
              <div
                key={course._id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group relative"
              >
                {/* Image */}
                <Link to={`/courses/${course._id}`} className="h-40 w-full relative overflow-hidden shrink-0 border-b border-slate-100 block">
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  {isEnrolled && (
                    <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full shadow-sm">
                      Enrolled
                    </span>
                  )}
                </Link>

                {/* Body */}
                <div className="p-5 flex flex-col justify-between flex-grow gap-4">
                  <div className="flex flex-col gap-1">
                    <Link to={`/courses/${course._id}`} className="block">
                      <h3 className="font-fraunces text-navy text-lg font-bold line-clamp-1 group-hover:text-royal-blue transition-colors duration-200">
                        {course.courseName}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {course.courseDescription}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">
                      Guide: {course?.instructor?.firstName} {course?.instructor?.lastName}
                    </p>
                  </div>

                  {/* Ratings */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-bold text-amber-500">{avgReviewCount || 0}</span>
                    <RatingStars Review_Count={avgReviewCount} />
                    <span className="text-slate-400">({course?.ratingAndReviews?.length || 0})</span>
                  </div>

                  {/* Actions Row */}
                  <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-4 mt-auto">
                    <span className="font-extrabold text-navy text-sm">
                      Rs. {course.price}
                    </span>
                    
                    {isEnrolled ? (
                      <button
                        onClick={() => navigate("/dashboard/enrolled-courses")}
                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 text-xs transition-all hover:scale-95 shadow-sm inline-flex items-center gap-1"
                      >
                        Enter Space <FaArrowRight className="text-[8px]" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleBuyClick(e, course._id)}
                        className="rounded-full bg-royal-blue hover:bg-royal-blue/90 text-white font-semibold py-2 px-4.5 text-xs transition-all hover:scale-95 shadow-sm inline-flex items-center gap-1"
                      >
                        <FaShoppingCart className="text-[10px]" /> Buy Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  )
}
