import React from 'react'
import CTAButton from "../../../components/core/HomePage/Button";
import { FaArrowRight } from "react-icons/fa";
import Instructor from "../../../assets/Images/Instructor.png";
import HighlightText from './HighlightText';

const InstructorSection = () => {
  return (
    <div>
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="lg:w-[50%]">
            <img
              src={Instructor}
              alt=""
              className="shadow-white shadow-[-20px_-20px_0_0]"
            />
          </div>
          <div className="lg:w-[50%] flex gap-10 flex-col">
            <h1 className="lg:w-[50%] text-4xl font-semibold ">
              Three ways in —
              <HighlightText text={" no pressure"} />
            </h1>

            <p className="font-medium text-[16px] text-justify w-[90%] text-richblack-300">
              Start your free practice space, see a sample client journey, or talk to a real human. Have questions specific to your practice? Book time with our team, not a bot.
            </p>

            <div className="w-fit">
              <CTAButton active={true} linkto={"/contact"}>
                <div className="flex items-center gap-3">
                  Book a conversation
                  <FaArrowRight />
                </div>
              </CTAButton>
            </div>
          </div>
        </div>
    </div>
  )
}

export default InstructorSection