import React from "react";
import CTAButton from "../../../components/core/HomePage/Button";
import { FaArrowRight } from "react-icons/fa";
import Instructor from "../../../assets/Images/homeimage2.jpeg";
import HighlightText from "./HighlightText";

const InstructorSection = () => {
  return (
    <div className="w-full rounded-3xl bg-gradient-to-r from-ink-800 to-ink-900 border border-ink-600 p-8 lg:p-14">
      <div className="flex flex-col-reverse lg:flex-row items-center gap-16">

        {/* Left Content */}
        <div className="lg:w-1/2 flex flex-col gap-8">

          <div>
            <span className="inline-block rounded-full bg-gold-500/10 border border-gold-500/30 px-4 py-1 text-sm font-semibold text-gold-300">
              Become an Instructor
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-ink-50 leading-tight">
            Share your knowledge,
            <HighlightText text={" inspire the next generation."} />
          </h1>

          <p className="text-lg leading-8 text-ink-200">
            Turn your expertise into engaging courses, connect with learners
            worldwide, and help thousands achieve their goals. Build your
            teaching journey with powerful tools and a supportive learning
            community.
          </p>

          <div className="w-fit">
            <CTAButton active={true} linkto={"/signup"}>
              <div className="flex items-center gap-3">
                Become an Instructor
                <FaArrowRight />
              </div>
            </CTAButton>
          </div>

        </div>

        {/* Right Image */}
<div className="lg:w-1/2 flex justify-center">
  <div className="rounded-3xl bg-gradient-to-br from-gold-400 via-sage-500 to-gold-500 p-[3px]">

    <div className="rounded-[22px] bg-ink-900 p-3">
      <img
        src={Instructor}
        alt="Instructor"
        className="rounded-2xl"
      />
    </div>

  </div>
</div>

      </div>
    </div>
  );
};

export default InstructorSection;