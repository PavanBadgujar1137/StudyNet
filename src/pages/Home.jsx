// Icons Import
import { FaArrowRight } from "react-icons/fa"
import { Link } from "react-router-dom"

// Image and Video Import
import Banner from "../assets/Images/banner.mp4"
// Component Imports
import Footer from "../components/Common/Footer"
import ReviewSlider from "../components/Common/ReviewSlider"
import CTAButton from "../components/core/HomePage/Button"
import CodeBlocks from "../components/core/HomePage/CodeBlocks"
import ExploreMore from "../components/core/HomePage/ExploreMore"
import HighlightText from "../components/core/HomePage/HighlightText"
import InstructorSection from "../components/core/HomePage/InstructorSection"
import LearningLanguageSection from "../components/core/HomePage/LearningLanguageSection"
import TimelineSection from "../components/core/HomePage/Timeline"

function Home() {
  return (
    <div>
      {/* Section 1 */}
      <div className="relative mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 text-white">
        {/* Become a Instructor Button */}
        <Link to={"/signup"}>
          <div className="group mx-auto mt-16 w-fit rounded-full bg-richblack-800 p-1 font-bold text-richblack-200 drop-shadow-[0_1.5px_rgba(255,255,255,0.25)] transition-all duration-200 hover:scale-95 hover:drop-shadow-none">
            <div className="flex flex-row items-center gap-2 rounded-full px-10 py-[5px] transition-all duration-200 group-hover:bg-richblack-900">
              <p>For coaches, counsellors & healers</p>
              <FaArrowRight />
            </div>
          </div>
        </Link>

        {/* Heading */}
        <div className="text-center text-4xl font-semibold">
          You already know how to hold space. We'll help you hold it online —
          <HighlightText text={" and get paid for it."} />
        </div>

        {/* Sub Heading */}
        <div className="-mt-3 w-[90%] text-center text-lg font-bold text-richblack-300">
          Openhand is the practice platform built for people who guide, not just teach. Client check-ins, private cohorts, and real community — without the corporate LMS feel.
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-row gap-7">
          <CTAButton active={true} linkto={"/signup"}>
            Start your free practice space
          </CTAButton>
          <CTAButton active={false} linkto={"#journey"}>
            See a sample client journey
          </CTAButton>
        </div>

        {/* Video */}
        <div className="mx-3 my-7 shadow-[10px_-5px_50px_-5px] shadow-blue-200">
          <video
            className="shadow-[20px_20px_rgba(255,255,255)]"
            muted
            loop
            autoPlay
          >
            <source src={Banner} type="video/mp4" />
          </video>
        </div>

        {/* Code Section 1  */}
        <div>
          <CodeBlocks
            position={"lg:flex-row"}
            heading={
              <div className="text-4xl font-semibold">
                Built around
                <HighlightText text={" how you actually work"} /> with people.
              </div>
            }
            subheading={
              "Not modules. Practice. Simple, recurring check-ins that show you how someone's really doing between sessions, gentle progress tracking, and private cohorts with their own rhythm and boundaries."
            }
            ctabtn1={{
              btnText: "Start free",
              link: "/signup",
              active: true,
            }}
            ctabtn2={{
              btnText: "View sample journey",
              link: "/signup",
              active: false,
            }}
            codeColor={"text-yellow-25"}
            codeblock={`const clientJourney = {\n  method: "practice-not-modules",\n  checkIns: "recurring & reflective",\n  cohorts: "private & small group",\n  progress: "gentle reflection tracking",\n  boundaries: "own rhythm & space",\n  corporateLmsFeel: false\n};\n\nconsole.log("Holding space online...");`}
            backgroundGradient={<div className="codeblock1 absolute"></div>}
          />
        </div>

        {/* Code Section 2 */}
        <div>
          <CodeBlocks
            position={"lg:flex-row-reverse"}
            heading={
              <div className="w-[100%] text-4xl font-semibold lg:w-[50%]">
                People heal in
                <HighlightText text={" circles, not in isolation"} />
              </div>
            }
            subheading={
              "The part corporate LMS forgets: Peer circles, live group calls that feel like your living room, and small, self-organizing accountability pods."
            }
            ctabtn1={{
              btnText: "Join a Circle",
              link: "/signup",
              active: true,
            }}
            ctabtn2={{
              btnText: "See How",
              link: "/signup",
              active: false,
            }}
            codeColor={"text-white"}
            codeblock={`import React from "react";\nimport { PeerCircle } from "openhand";\n\nconst CircleGroup = () => {\n  return (\n    <PeerCircle\n      calls="built-in-calls"\n      feeling="living-room"\n      accountability="self-organizing"\n    />\n  );\n};\n\nexport default CircleGroup;`}
            backgroundGradient={<div className="codeblock2 absolute"></div>}
          />
        </div>

        {/* Explore Section */}
        <ExploreMore />
      </div>

      {/* Section 2 */}
      <div className="bg-pure-greys-5 text-richblack-700">
        <div className="homepage_bg h-[320px]">
          {/* Explore Full Catagory Section */}
          <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8">
            <div className="lg:h-[150px]"></div>
            <div className="flex flex-row gap-7 text-white lg:mt-8">
              <CTAButton active={true} linkto={"/signup"}>
                <div className="flex items-center gap-2">
                  Explore Full Catalog
                  <FaArrowRight />
                </div>
              </CTAButton>
              <CTAButton active={false} linkto={"/login"}>
                Learn More
              </CTAButton>
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 ">
          {/* Job that is in Demand - Section 1 */}
          <div className="mb-10 mt-[-100px] flex flex-col justify-between gap-7 lg:mt-20 lg:flex-row lg:gap-0">
            <div className="text-4xl font-semibold lg:w-[45%] ">
              Built for the trust your{" "}
              <HighlightText text={"work depends on."} />
            </div>
            <div className="flex flex-col items-start gap-10 lg:w-[40%]">
              <div className="text-[16px]">
                Held with care. Private cohorts and client data are separated and
                access-controlled from the ground up, with ethical-practice standards
                and protected, encrypted conversations.
              </div>
              <CTAButton active={true} linkto={"/signup"}>
                <div className="">Read our trust guidelines</div>
              </CTAButton>
            </div>
          </div>

          {/* Timeline Section - Section 2 */}
          <TimelineSection />

          {/* Learning Language Section - Section 3 */}
          <LearningLanguageSection />
        </div>
      </div>

      {/* Section 3 */}
      <div className="relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 bg-richblack-900 text-white">
        {/* Become a instructor section */}
        <InstructorSection />

        {/* Reviws from Other Learner */}
        <h1 className="text-center text-4xl font-semibold mt-8">
          Reviews from other learners
        </h1>
        <ReviewSlider />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Home
