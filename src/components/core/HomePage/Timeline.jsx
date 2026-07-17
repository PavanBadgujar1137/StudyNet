import React from "react";
import TimeLineImage from "../../../assets/Images/learners.jpeg";
import Logo1 from "../../../assets/TimeLineLogo/Logo1.svg";
import Logo2 from "../../../assets/TimeLineLogo/Logo2.svg";
import Logo3 from "../../../assets/TimeLineLogo/Logo3.svg";
import Logo4 from "../../../assets/TimeLineLogo/Logo4.svg";

const TimeLine = [
  {
    Logo: Logo1,
    Heading: "Confidentiality by design",
    Description: "Private cohorts and client data are separated and access-controlled from the ground up.",
  },
  {
    Logo: Logo2,
    Heading: "Ethical-practice standards",
    Description: "Built alongside practitioners, with guardrails that reflect real ethics codes.",
  },
  {
    Logo: Logo3,
    Heading: "Protected conversations",
    Description: "Session notes and sensitive client information are encrypted and secure.",
  },
  {
    Logo: Logo4,
    Heading: "Zero external training",
    Description: "Your notes are never used to train external models.",
  },
];


const TimelineSection = () => {
  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-20 mb-20 items-center">
        <div className="lg:w-[45%] flex flex-col gap-14 lg:gap-3">
          {TimeLine.map((ele, i) => {
            return (
              <div className="flex flex-col lg:gap-3" key={i}>
                <div className="flex gap-6" key={i}>
                  <div className="w-[52px] h-[52px] bg-white rounded-full flex justify-center items-center shadow-[#00000012] shadow-[0_0_62px_0]">
                    <img src={ele.Logo} alt="" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[18px] text-richblack-100">{ele.Heading}</h2>
                    <p className="text-base text-richblack-300">{ele.Description}</p>
                  </div>
                </div>
                <div
                  className={`hidden ${TimeLine.length - 1 === i ? "hidden" : "lg:block"
                    }  h-14 border-dotted border-r border-richblack-100 bg-richblack-400/0 w-[26px]`}
                ></div>
              </div>
            );
          })}
        </div>
        <div className="relative w-fit h-fit shadow-blue-200 shadow-[0px_0px_30px_0px]">

          <div className="rounded-[22px] bg-ink-900 p-3">
            <img
              src={TimeLineImage}
              alt="timeline"
              className="rounded-2xl object-cover h-[400px] lg:h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineSection;
