import React from "react";
import HighlightText from "../../../components/core/HomePage/HighlightText";
import CTAButton from "../../../components/core/HomePage/Button";

const LearningGridArray = [
  {
    order: -1,
    heading: "World-Class Learning for",
    highliteText: "Anyone, Anywhere",
    description:
      "OpenHand partners with leading instructors and tech experts to deliver hands-on, job-ready education in Web Development, Data Science, and UI/UX Design.",
    BtnText: "Explore Courses",
    BtnLink: "/signup",
  },
  {
    order: 1,
    heading: "Curriculum Designed by Experts",
    description:
      "Courses are built from the ground up by industry professionals using modern tech stacks.",
  },
  {
    order: 2,
    heading: "Flexible Learning Rhythm",
    description:
      "Watch video lectures on your schedule, track lesson progress, and pause anytime.",
  },
  {
    order: 3,
    heading: "Interactive Skill Quizzes",
    description:
      "Reinforce knowledge with built-in quizzes and instant feedback after every module.",
  },
  {
    order: 4,
    heading: "Verified Certificates",
    description:
      "Earn shareable, official certificates upon finishing 100% of course lectures.",
  },
  {
    order: 5,
    heading: "Vibrant Student Community",
    description:
      "Engage with fellow learners, share project feedback, and collaborate on challenges.",
  },
];

const LearningGrid = () => {
  return (
    <div className="grid mx-auto grid-cols-1 xl:grid-cols-4 gap-6 mb-16 w-full max-w-maxContent">
      {LearningGridArray.map((card, i) => {
        return (
          <div
            key={i}
            className={`${i === 0 ? "xl:col-span-2 xl:h-[300px]" : "h-[300px]"} ${
              card.order < 0
                ? "bg-transparent flex flex-col justify-center"
                : card.order % 2 === 1
                ? "bg-white border border-line/65 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                : "bg-royal-blue/5 border border-royal-blue/10 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            }`}
          >
            {card.order < 0 ? (
              <div className="xl:w-[95%] flex flex-col gap-4 pb-8 xl:pb-0 text-left">
                <h2 className="text-3xl sm:text-4.5xl font-bold font-fraunces text-navy leading-tight">
                  {card.heading}{" "}
                  <HighlightText text={card.highliteText} />
                </h2>
                <p className="text-ink-soft text-sm font-medium leading-relaxed">
                  {card.description}
                </p>

                <div className="w-fit mt-3">
                  <CTAButton active={true} linkto={card.BtnLink}>
                    {card.BtnText}
                  </CTAButton>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-left h-full justify-between">
                <div>
                  <h3 className="text-navy text-lg font-bold font-fraunces leading-snug">{card.heading}</h3>
                  <p className="text-ink-soft text-sm leading-relaxed mt-2.5">
                    {card.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LearningGrid;
