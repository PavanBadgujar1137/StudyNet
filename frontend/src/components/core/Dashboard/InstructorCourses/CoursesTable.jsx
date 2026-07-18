import { useDispatch, useSelector } from "react-redux"
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table"

import { setCourse, setEditCourse } from "../../../../slices/courseSlice"
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css"
import { useState } from "react"
import { FaCheck } from "react-icons/fa"
import { FiEdit2 } from "react-icons/fi"
import { HiClock } from "react-icons/hi"
import { RiDeleteBin6Line } from "react-icons/ri"
import { useNavigate } from "react-router-dom"

import { formatDate } from "../../../../services/formatDate"
import {
  deleteCourse,
  fetchInstructorCourses,
} from "../../../../services/operations/courseDetailsAPI"
import { COURSE_STATUS } from "../../../../utils/constants"
import ConfirmationModal from "../../../Common/ConfirmationModal"

export default function CoursesTable({ courses, setCourses }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const TRUNCATE_LENGTH = 30

  const handleCourseDelete = async (courseId) => {
    setLoading(true)
    await deleteCourse({ courseId: courseId }, token)
    const result = await fetchInstructorCourses(token)
    if (result) {
      setCourses(result)
    }
    setConfirmationModal(null)
    setLoading(false)
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-line/65 bg-white/70 shadow-md">
        <Table className="w-full border-collapse">
          <Thead className="bg-royal-blue/5 border-b border-line/60">
            <Tr className="flex gap-x-10 px-6 py-4.5">
              <Th className="flex-1 text-left text-xs font-bold uppercase tracking-widest text-navy">
                Space Name
              </Th>
              <Th className="w-28 text-left text-xs font-bold uppercase tracking-widest text-navy">
                Duration
              </Th>
              <Th className="w-24 text-left text-xs font-bold uppercase tracking-widest text-navy">
                Price
              </Th>
              <Th className="w-24 text-center text-xs font-bold uppercase tracking-widest text-navy">
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {courses?.length === 0 ? (
              <Tr>
                <Td className="py-16 text-center text-base font-semibold text-ink-soft">
                  No practice spaces found
                </Td>
              </Tr>
            ) : (
              courses?.map((course) => (
                <Tr
                  key={course._id}
                  className="flex gap-x-10 border-b border-line/50 last:border-b-0 px-6 py-6 items-center hover:bg-royal-blue/5 transition-colors duration-150"
                >
                  <Td className="flex flex-1 gap-x-4 items-center min-w-0">
                    <img
                      src={course?.thumbnail}
                      alt={course?.courseName}
                      className="h-20 w-32 rounded-xl object-cover border border-line/50 shrink-0 shadow-sm"
                    />
                    <div className="flex flex-col gap-1 text-left min-w-0">
                      <p className="text-base font-bold text-navy font-fraunces truncate">
                        {course.courseName}
                      </p>
                      <p className="text-xs text-ink-soft line-clamp-1">
                        {course.courseDescription.split(" ").length >
                        TRUNCATE_LENGTH
                          ? course.courseDescription
                              .split(" ")
                              .slice(0, TRUNCATE_LENGTH)
                              .join(" ") + "..."
                          : course.courseDescription}
                      </p>
                      <div className="flex flex-wrap items-center gap-2.5 mt-1">
                        <span className="text-[10px] text-ink-soft/75 font-medium">
                          Created: {formatDate(course.createdAt)}
                        </span>
                        <span>·</span>
                        {course.status === COURSE_STATUS.DRAFT ? (
                          <span className="flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/50 px-2.5 py-0.5 text-[10px] font-bold">
                            <HiClock className="text-xs" />
                            Drafted
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-full bg-green-100 text-green-700 border border-green-200/50 px-2.5 py-0.5 text-[10px] font-bold">
                            <FaCheck className="text-[8px]" />
                            Published
                          </span>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td className="w-28 text-sm font-semibold text-navy text-left shrink-0">
                    2hr 30min
                  </Td>
                  <Td className="w-24 text-sm font-extrabold text-royal-blue text-left shrink-0">
                    ₹{course.price}
                  </Td>
                  <Td className="w-24 text-sm font-semibold text-ink-soft flex items-center justify-center gap-2 shrink-0">
                    <button
                      disabled={loading}
                      onClick={() => {
                        navigate(`/dashboard/edit-course/${course._id}`)
                      }}
                      title="Edit"
                      className="p-1.5 rounded-full hover:bg-royal-blue/10 text-royal-blue transition-all duration-200 hover:scale-105"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      disabled={loading}
                      onClick={() => {
                        setConfirmationModal({
                          text1: "Delete this practice space?",
                          text2:
                            "All clients and content related to this space will be deleted permanent.",
                          btn1Text: !loading ? "Delete" : "Loading...",
                          btn2Text: "Cancel",
                          btn1Handler: !loading
                            ? () => handleCourseDelete(course._id)
                            : () => {},
                          btn2Handler: !loading
                            ? () => setConfirmationModal(null)
                            : () => {},
                        })
                      }}
                      title="Delete"
                      className="p-1.5 rounded-full hover:bg-red-500/10 text-red-500 transition-all duration-200 hover:scale-105"
                    >
                      <RiDeleteBin6Line size={16} />
                    </button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </div>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}
