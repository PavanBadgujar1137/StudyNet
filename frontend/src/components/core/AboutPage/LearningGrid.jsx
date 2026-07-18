import React from "react";
import HighlightText from "../../../components/core/HomePage/HighlightText";
import CTAButton from "../../../components/core/HomePage/Button";

const LearningGridArray = [
  {
    order: -1,
    heading: "A Trusted Space for",
    highliteText: "Guides & Healers",
    description:
      "OpenHand provides secure check-ins, private cohorts, and ethical practice tools to support coaches, counsellors, and guides around the world.",
    BtnText: "Explore Platform",
    BtnLink: "/",
  },
  {
    order: 1,
    heading: "Ethical Practice Boundaries",
    description:
      "Our platform features built-in boundaries and guidelines that respect professional practice codes.",
  },
  {
    order: 2,
    heading: "Flexible Client Journeys",
    description:
      "Design check-ins and reflection prompts that meet your client's needs on their transformation path.",
  },
  {
    order: 3,
    heading: "Secure Reflection Space",
    description:
      "Conversations and notes are heavily encrypted, protecting client confidentiality.",
  },
  {
    order: 4,
    heading: "Quietly Intelligent Tools",
    description:
      "Use AI that sounds like you to draft reflection questions and help organize session highlights.",
  },
  {
    order: 5,
    heading: "Circular Community",
    description:
      "Fosters peer support and accountability pods to keep progress going organically.",
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
