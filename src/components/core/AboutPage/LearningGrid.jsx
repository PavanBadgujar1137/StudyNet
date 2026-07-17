import React from "react";
import HighlightText from "../../../components/core/HomePage/HighlightText";
import CTAButton from "../../../components/core/HomePage/Button";

const LearningGridArray = [
  {
    order: -1,
    heading: "Learn Smarter with",
    highliteText: " Expert-Led Courses",
    description:
      "Gain practical skills through industry-focused courses, hands-on projects, coding exercises, and personalized learning paths designed to help you achieve your goals.",
    BtnText: "Start Learning",
    BtnLink: "/signup",
  },
  {
    order: 1,
    heading: "Expert Instructors",
    description:
      "Learn directly from experienced professionals who share practical knowledge, real-world insights, and proven industry practices.",
  },
  {
    order: 2,
    heading: "Interactive Learning",
    description:
      "Strengthen your understanding through coding challenges, quizzes, assignments, and project-based learning experiences.",
  },
  {
    order: 3,
    heading: "Career-Focused Projects",
    description:
      "Build an impressive portfolio by creating real-world applications that showcase your skills to employers and clients.",
  },
  {
    order: 4,
    heading: "Certificates & Progress",
    description:
      "Track your achievements, monitor your learning journey, and earn certificates as you successfully complete courses.",
  },
  {
    order: 5,
    heading: "Learn Anytime, Anywhere",
    description:
      "Access your courses from any device, study at your own pace, and continue learning whenever it fits your schedule.",
  },
];

const LearningGrid = () => {
  return (
    <div className="grid mx-auto w-[350px] xl:w-fit grid-cols-1 xl:grid-cols-4 mb-12">
      {LearningGridArray.map((card, i) => {
        return (
          <div
            key={i}
            className={`${i === 0 && "xl:col-span-2 xl:h-[294px]"}  ${
              card.order % 2 === 1
                ? "bg-richblack-700 h-[294px]"
                : card.order % 2 === 0
                ? "bg-richblack-800 h-[294px]"
                : "bg-transparent"
            } ${card.order === 3 && "xl:col-start-2"}  `}
          >
            {card.order < 0 ? (
              <div className="xl:w-[90%] flex flex-col gap-3 pb-10 xl:pb-0">
                <div className="text-4xl font-semibold text-richblack-100">
                  {card.heading}
                  <HighlightText text={card.highliteText} />
                </div>
                <p className="text-richblack-300 font-medium">
                  {card.description}
                </p>

                <div className="w-fit mt-2">
                  <CTAButton active={true} linkto={card.BtnLink}>
                    {card.BtnText}
                  </CTAButton>
                </div>
              </div>
            ) : (
              <div className="p-8 flex flex-col gap-8">
                <h1 className="text-richblack-5 text-lg">{card.heading}</h1>

                <p className="text-richblack-300 font-medium">
                  {card.description}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LearningGrid;
