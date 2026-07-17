import React from 'react'
import HighlightText from './HighlightText'
import CTAButton from "../../../components/core/HomePage/Button";
import Know_your_progress from "../../../assets/Images/card1.jpg";
import Compare_with_others from "../../../assets/Images/card2.jpeg";
import Plan_your_lessons from "../../../assets/Images/card3.png"

const LearningLanguageSection = () => {
  return (
<div className="my-24 rounded-3xl border border-ink-600 bg-gradient-to-br from-ink-900 to-ink-800 p-8 lg:p-14">

  <div className="grid lg:grid-cols-2 gap-14 items-center">

    {/* Left */}
    <div>

      <span className="inline-block rounded-full bg-gold-500/10 border border-gold-500/30 px-4 py-2 text-sm font-semibold text-gold-300 mb-6">
        AI Learning Assistant
      </span>

      <h2 className="text-4xl lg:text-5xl font-bold text-ink-50 leading-tight">
        Learn smarter with
        <HighlightText text={" AI-powered guidance."} />
      </h2>

      <p className="mt-6 text-lg leading-8 text-ink-200">
        Receive personalized explanations, coding assistance, smart quizzes,
        and instant feedback that adapts to your learning progress—helping you
        master concepts faster and build confidence.
      </p>

      <div className="mt-10">
        <CTAButton active={true} linkto={"/signup"}>
          <div>Explore AI Features</div>
        </CTAButton>
      </div>

    </div>

    {/* Right */}
    <div className="grid grid-cols-2 gap-6">

      <div className="rounded-2xl border border-ink-600 bg-ink-800 p-4">
        <img
          src={Know_your_progress}
          alt=""
          className="rounded-xl w-full"
        />
        <h3 className="mt-4 text-lg font-semibold text-ink-50">
          Smart Progress
        </h3>
        <p className="mt-2 text-sm text-ink-200">
          Track your learning journey with AI-powered insights.
        </p>
      </div>

      <div className="rounded-2xl border border-ink-600 bg-ink-800 p-4 mt-8">
        <img
          src={Compare_with_others}
          alt=""
          className="rounded-xl w-full"
        />
        <h3 className="mt-4 text-lg font-semibold text-ink-50">
          AI Code Review
        </h3>
        <p className="mt-2 text-sm text-ink-200">
          Improve your code with instant suggestions and best practices.
        </p>
      </div>

      <div className="rounded-2xl border border-ink-600 bg-ink-800 p-4 col-span-2">
        <img
          src={Plan_your_lessons}
          alt=""
          className="rounded-xl w-full"
        />
        <h3 className="mt-4 text-lg font-semibold text-ink-50">
          Personalized Learning
        </h3>
        <p className="mt-2 text-sm text-ink-200">
          AI recommends the next lessons based on your strengths and progress.
        </p>
      </div>

    </div>

  </div>

</div>
  )
}

export default LearningLanguageSection