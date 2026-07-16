import React from "react";
import HighlightText from "../../../components/core/HomePage/HighlightText";
import CTAButton from "../../../components/core/HomePage/Button";

const LearningGridArray = [
  {
    order: -1,
    heading: "Practice Platform for",
    highliteText: " Guides & Coaches",
    description:
      "Openhand partners with leading coaches, therapists, and guides to bring secure, thoughtful community tools to practices worldwide.",
    BtnText: "Start Free",
    BtnLink: "/signup",
  },
  {
    order: 1,
    heading: "Ethical by Design",
    description:
      "Built alongside practitioners, with guardrails and boundaries that reflect real coaching and counselling ethics codes.",
  },
  {
    order: 2,
    heading: "Gentle reflections",
    description:
      "Simple, recurring check-ins and reflection prompts that feel like journaling, not a clinical database.",
  },
  {
    order: 3,
    heading: "Circle space",
    description:
      "Small group private cohorts and peer support structured for safety, depth, and genuine connection.",
  },
  {
    order: 4,
    heading: "Protected data",
    description:
      "Your session notes and client information are encrypted and never used to train external models.",
  },
  {
    order: 5,
    heading: "Client-focused tracking",
    description:
      "Understand client sentiment and engagement without rigid quiz scoring or corporate LMS dashboards.",
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
                <div className="text-4xl font-semibold ">
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
