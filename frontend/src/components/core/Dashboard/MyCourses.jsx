import { useEffect, useState } from "react"
import { VscAdd } from "react-icons/vsc"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI"
import CoursesTable from "./InstructorCourses/CoursesTable"

export default function MyCourses() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])

  useEffect(() => {
    const fetchCourses = async () => {
      const result = await fetchInstructorCourses(token)
      if (result) {
        setCourses(result)
      }
    }
    fetchCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy font-fraunces">My Practice Spaces</h1>
        <button
          onClick={() => navigate("/dashboard/add-course")}
          className="rounded-full bg-royal-blue hover:bg-royal-blue/90 text-white font-semibold py-2.5 px-6 text-sm transition-all duration-200 shadow-md flex items-center gap-2 hover:scale-95 inline-flex"
        >
          <VscAdd className="text-base" /> Create Space
        </button>
      </div>
      {courses && <CoursesTable courses={courses} setCourses={setCourses} />}
    </div>
  )
}
