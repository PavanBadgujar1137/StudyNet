import { useEffect } from "react"
import { useDispatch } from "react-redux"

import { resetCourseState } from "../../../../slices/courseSlice"
import RenderSteps from "./RenderSteps"

export default function AddCourse() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(resetCourseState())
  }, [dispatch])

  return (
    <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
      <div className="w-full flex-1">
        <h1 className="mb-8 text-3xl font-medium text-richblack-5 md:mb-14">
          Add Program (Self-Paced Offer)
        </h1>
        <div className="w-full">
          <RenderSteps />
        </div>
      </div>

      <aside className="w-full max-w-[400px] flex-shrink-0 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6 xl:sticky xl:top-6">
        <p className="mb-8 text-lg text-richblack-5">⚡ Program Upload Tips</p>
        <ul className="ml-5 list-disc space-y-4 text-xs text-richblack-5">
          <li>Set the Program Price or offer it as part of a circle membership.</li>
          <li>Standard size for the program thumbnail is 1024x576.</li>
          <li>Video section controls the program overview video.</li>
          <li>Program Builder is where you create & organize self-paced modules.</li>
          <li>
            Add Topics in the Program Builder section to create lessons, reflection exercises, and downloadable resources.
          </li>
          <li>
            Information from the Additional Data section shows up on your practitioner profile.
          </li>
          <li>Send Announcements to notify all enrolled program clients at once.</li>
        </ul>
      </aside>
    </div>
  )
}
