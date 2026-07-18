import RenderSteps from "./RenderSteps"

export default function AddCourse() {
  return (
    <>
<div className="flex w-full items-start gap-10">
  {/* Left Section */}
  <div className="flex flex-1 flex-col">
    <h1 className="mb-8 text-4xl font-bold tracking-tight text-ink-50">
      Add Course
    </h1>

    <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-6 shadow-lg backdrop-blur-sm">
      <RenderSteps />
    </div>
  </div>

  {/* Course Upload Tips */}
  <div className="sticky top-8 hidden w-full max-w-sm xl:block">
    <div className="overflow-hidden rounded-2xl border border-ink-700 bg-gradient-to-b from-ink-800 to-ink-900 shadow-2xl">

      {/* Header */}
      <div className="border-b border-ink-700 bg-gold-500/10 px-6 py-5">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gold-300">
          ⚡ Course Upload Tips
        </h2>
        <p className="mt-1 text-sm text-ink-200">
          Follow these recommendations for the best learning experience.
        </p>
      </div>

      {/* Body */}
      <div className="space-y-4 p-6">
        {[
          "Set the course price or make it free.",
          "Use a 1024 × 576 thumbnail for the best quality.",
          "Upload an engaging course overview video.",
          "Organize lessons inside the Course Builder.",
          "Create quizzes and assignments for better engagement.",
          "Additional Data appears on the course page.",
          "Use announcements to notify enrolled students.",
        ].map((tip, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-ink-700/50"
          >
            <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gold-500/15 text-sm font-semibold text-gold-300">
              ✓
            </div>

            <p className="text-sm leading-6 text-ink-100">
              {tip}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
    </>
  )
}
