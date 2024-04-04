import React, { useCallback, useEffect, useRef, useState } from "react"
import { toPng } from "html-to-image"
import { useSelector } from "react-redux"

import { getUserEnrolledCourses } from "../services/operations/profileAPI"
import certificateTemplate from "./Certificate.png"
import "./Certificate.css"

const Certificate = () => {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const ref = useRef(null)

  const [instructorName, setInstructorName] = useState("")
  const [enrolledCourses, setEnrolledCourses] = useState([])

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const res = await getUserEnrolledCourses(token)
        const filteredCourses = res.filter(
          (course) => course.status !== "Draft"
        )
        setEnrolledCourses(filteredCourses)
      } catch (error) {
        console.log("Could not fetch enrolled courses.")
      }
    }

    fetchEnrolledCourses()
  }, [token])

  const onButtonClick = useCallback(() => {
    if (ref.current === null) {
      return
    }

    toPng(ref.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement("a")
        link.download = "Certificate.png"
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.log(err)
      })
  }, [ref])

  return (
    <div className="flex h-screen items-center justify-center gap-[20px]">
      <form className="bg-gray-800 w-64 rounded-md p-4 shadow-md">
        <div className="mb-4">
          <label className="mb-2 block text-white" htmlFor="instructorName">
            Instructor Name:
          </label>
          <input
            type="text"
            id="instructorName"
            placeholder="Enter Instructor Name"
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
            className="w-full rounded-md border px-3 py-2 focus:border-blue-300 focus:outline-none focus:ring"
          />
        </div>
      </form>

      <div className="relative h-[400px] w-[560px]" ref={ref}>
        <img
          src={certificateTemplate}
          alt="certificate template"
          height={400}
        />
        <div className="content">
          <h1>
            {" "}
            {user?.firstName} {user?.lastName}
          </h1>
          {enrolledCourses.map((course, index) => (
            <div key={index}>
              <p className="font-semibold">{course.courseName}</p>
            </div>
          ))}
          <h4>{instructorName}</h4>
        </div>
      </div>
      <button className="button" onClick={onButtonClick}>
        Download
      </button>
    </div>
  )
}

export default Certificate
