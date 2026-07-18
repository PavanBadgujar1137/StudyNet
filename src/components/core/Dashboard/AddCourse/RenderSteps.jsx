import { FaCheck } from "react-icons/fa"
import { useSelector } from "react-redux"

import CourseBuilderForm from "./CourseBuilder/CourseBuilderForm"
import CourseInformationForm from "./CourseInformation/CourseInformationForm"
import PublishCourse from "./PublishCourse"

export default function RenderSteps() {
  const { step } = useSelector((state) => state.course)

  const steps = [
    {
      id: 1,
      title: "Information",
    },
    {
      id: 2,
      title: "Course Builder",
    },
    {
      id: 3,
      title: "Publish",
    },
  ]

  return (
<>
  {/* Progress Steps */}
  <div className="mb-12 flex items-center justify-between">
    {steps.map((item, index) => (
      <div
        key={item.id}
        className="flex flex-1 items-start"
      >
        {/* Step */}
        <div className="flex flex-col items-center">
          <button
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300
              ${
                step > item.id
                  ? "border-gold-500 bg-gold-500 text-ink-900 shadow-lg shadow-gold-500/30"
                  : step === item.id
                  ? "border-gold-500 bg-gold-500/15 text-gold-300 ring-4 ring-gold-500/10"
                  : "border-ink-600 bg-ink-800 text-ink-300"
              }`}
          >
            {step > item.id ? <FaCheck size={16} /> : item.id}
          </button>

          <p
            className={`mt-4 w-28 text-center text-sm font-medium transition-colors duration-300 ${
              step >= item.id ? "text-ink-50" : "text-ink-300"
            }`}
          >
            {item.title}
          </p>
        </div>

        {/* Connector */}
        {index !== steps.length - 1 && (
          <div className="mx-4 mt-6 flex-1">
            <div
              className={`h-[3px] rounded-full transition-all duration-300 ${
                step > item.id ? "bg-gold-500" : "bg-ink-700"
              }`}
            />
          </div>
        )}
      </div>
    ))}
  </div>

  {/* Current Step Form */}
  <div>
    {step === 1 && <CourseInformationForm />}
    {step === 2 && <CourseBuilderForm />}
    {step === 3 && <PublishCourse />}
  </div>
</>
  )
}
