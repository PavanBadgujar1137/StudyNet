import React from "react";
import CTAButton from "./Button";
import { TypeAnimation } from "react-type-animation";
import { FaArrowRight } from "react-icons/fa";

const CodeBlocks = ({
  position,
  heading,
  subheading,
  ctabtn1,
  ctabtn2,
  codeblock,
  backgroundGradient,
  codeColor,
}) => {
  return (
    <div className={`flex ${position} my-20 justify-between flex-col lg:gap-10 gap-10`}>


      {/* Section 1  */}
      <div className="w-[100%] lg:w-[50%] flex flex-col gap-8 text-richblack-100">
        {heading}

        {/* Sub Heading */}
        <div className="text-richblack-300 text-base font-bold w-[85%] -mt-3">
          {subheading}
        </div>

        {/* Button Group */}
        <div className="flex gap-7 mt-7">
          <CTAButton active={ctabtn1.active} linkto={ctabtn1.link}>
            <div className="flex items-center gap-2">
              {ctabtn1.btnText}
              <FaArrowRight />
            </div>
          </CTAButton>
          <CTAButton active={ctabtn2.active} linkto={ctabtn2.link}>
            {ctabtn2.btnText}
          </CTAButton>
        </div>
      </div>

      {/* Section 2 */}
{/* Section 2 */}
<div className="relative w-full lg:w-[500px] rounded-2xl overflow-hidden border border-richblack-700 bg-richblack-900 shadow-2xl">

  {/* Header */}
  <div className="flex items-center justify-between px-4 py-3 border-b border-richblack-700 bg-richblack-800">
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full bg-red-500"></span>
      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
      <span className="w-3 h-3 rounded-full bg-green-500"></span>
    </div>

<p className=" text-gold-300 font-small text-4xl font-semibold">
  Learning Journey
</p>
    <div></div>
  </div>

  {backgroundGradient}

  {/* Editor */}
  <div className="flex py-5 font-mono text-sm relative">

    {/* Line Numbers */}
    <div className="w-12 text-right pr-4 text-richblack-500 select-none leading-7">
      {Array.from({ length: 11 }, (_, i) => (
        <p key={i}>{i + 1}</p>
      ))}
    </div>

    {/* Code */}
    <div className={`flex-1 leading-7 ${codeColor} pr-5`}>
      <TypeAnimation
        sequence={[codeblock, 1000, ""]}
        repeat={Infinity}
        cursor={true}
        omitDeletionAnimation={true}
        style={{
          whiteSpace: "pre-line",
          display: "block",
        }}
      />
    </div>

  </div>
</div>  
    </div>
  );
};

export default CodeBlocks;
