import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Outlet, useParams } from "react-router-dom"

import CourseReviewModal from "../components/core/ViewCourse/CourseReviewModal"
import VideoDetailsSidebar from "../components/core/ViewCourse/VideoDetailsSidebar"
import { getFullDetailsOfCourse } from "../services/operations/courseDetailsAPI"
import {
  setCompletedLectures,
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
} from "../slices/viewCourseSlice"

export default function ViewCourse() {
  const { courseId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [reviewModal, setReviewModal] = useState(false)

  useEffect(() => {
    ;(async () => {
      const courseData = await getFullDetailsOfCourse(courseId, token)
      // console.log("Course Data here... ", courseData.courseDetails)
      dispatch(setCourseSectionData(courseData.courseDetails.courseContent))
      dispatch(setEntireCourseData(courseData.courseDetails))
      dispatch(setCompletedLectures(courseData.completedVideos))
      let lectures = 0
      courseData?.courseDetails?.courseContent?.forEach((sec) => {
        lectures += sec.subSection.length
      })
      dispatch(setTotalNoOfLectures(lectures))
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="relative flex min-h-[calc(100vh-3.5rem)]">
        <VideoDetailsSidebar setReviewModal={setReviewModal} />
        <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto">
          <div className="mx-6">
            <Outlet />
          </div>
        </div>
      </div>
      {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
    </>
  )
}

// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { Outlet, useParams } from "react-router-dom"

// import CourseReviewModal from "../components/core/ViewCourse/CourseReviewModal"
// import VideoDetailsSidebar from "../components/core/ViewCourse/VideoDetailsSidebar"
// import { getFullDetailsOfCourse } from "../services/operations/courseDetailsAPI"
// import {
//   setCompletedLectures,
//   setCourseSectionData,
//   setEntireCourseData,
//   setTotalNoOfLectures,
// } from "../slices/viewCourseSlice"

// export default function ViewCourse() {
//   const { courseId } = useParams()
//   const { token } = useSelector((state) => state.auth)
//   const dispatch = useDispatch()
//   const [reviewModal, setReviewModal] = useState(false)

//   useEffect(() => {
//     ;(async () => {
//       const courseData = await getFullDetailsOfCourse(courseId, token)
//       // console.log("Course Data here... ", courseData.courseDetails)
//       dispatch(setCourseSectionData(courseData.courseDetails.courseContent))
//       dispatch(setEntireCourseData(courseData.courseDetails))
//       dispatch(setCompletedLectures(courseData.completedVideos))
//       let lectures = 0
//       courseData?.courseDetails?.courseContent?.forEach((sec) => {
//         lectures += sec.subSection.length
//       })
//       dispatch(setTotalNoOfLectures(lectures))
//     })()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   return (
//     <>
//       <div className="relative grid min-h-[calc(100vh-3.5rem)] grid-cols-2 gap-4 ">
//         <VideoDetailsSidebar setReviewModal={setReviewModal} />
//         <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto">
//           <div className="mx-6">
//             <Outlet />
//           </div>
//         </div>

//         <div className="h-full  bg-white p-[20px]">
//           <div className="  flex  items-center justify-center  gap-[100px]">
//             <button class="mr-4 w-[40%] rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600">
//               IDE
//             </button>

//             <button class="w-[40%] rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600">
//               GENERATE NOTES
//             </button>
//           </div>

//           <div className="text-bold mt-5 h-[90%]  w-[100%] rounded-md bg-black pl-4 pt-3 text-pink-500">
//             ubantu<span className="text-blue-300">$...</span>{" "}
//             <span className="text-white">|</span>
//           </div>
//         </div>
//       </div>
//       {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
//     </>
//   )
// }
