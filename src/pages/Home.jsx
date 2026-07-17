// Icons Import
import { FaArrowRight } from "react-icons/fa"
import { Link } from "react-router-dom"

// Image and Video Import
import Banner from "../assets/Images/HomeVideo.mp4"
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
      <div className="relative mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 text-ink-100">
        {/* Become a Instructor Button */}
        <Link to="/signup">
          <div className="group mx-auto mt-16 w-fit">
            <div className="flex items-center gap-3 rounded-2xl border border-gold-500/30 bg-gradient-to-r from-ink-800 to-ink-700 px-8 py-4 text-ink-50 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-gold-400 hover:shadow-gold-500/20">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500 text-ink-900">
                <FaArrowRight />
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-gold-300">
                  Start Learning
                </p>
                <p className="font-semibold">
                  Build skills that shape your future
                </p>
              </div>

            </div>
          </div>
        </Link>

        {/* Heading */}
        <div className="text-center text-4xl font-semibold text-ink-50">
          Teach what you love.
          <HighlightText text={" Inspire learners everywhere."} />
        </div>

        <div className="-mt-3 w-[90%] text-center text-lg font-bold text-ink-200">
          Build interactive courses, connect with students, track progress, and create meaningful learning experiences from anywhere.
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
        <div className="relative overflow-hidden rounded-3xl bg-white">
          <div className="absolute top-5 left-5 z-10 rounded-full bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md text-ink-800">
            🚀 Learn Without Limits
          </div>

          <video
            className="w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
            muted
            loop
            autoPlay
            playsInline
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
                Everything you need
                <HighlightText text={" to teach and learn."} />
              </div>
            }
            subheading={
              "Create engaging courses, connect with students, track progress, and deliver a seamless learning experience—all from one intuitive platform."
            }
            ctabtn1={{
              btnText: "Start Learning",
              link: "/signup",
              active: true,
            }}
            ctabtn2={{
              btnText: "Browse Courses",
              link: "/catalog",
              active: false,
            }}
            codeColor={"text-ink-200"}
            codeblock={`function startLearning() {
  const skills = ["HTML", "CSS", "JavaScript", "React"];
  skills.forEach((skill) => {
    console.log(\`Learning \${skill}...\`);
  });

  return "Career Ready";
}
startLearning();`} backgroundGradient={<div className="codeblock1 absolute"></div>}
          />
        </div>

        {/* Code Section 2 */}
        <div>
          <CodeBlocks
            position={"lg:flex-row-reverse"}
            heading={
              <div className="w-[100%] text-4xl font-semibold lg:w-[50%]">
                Learn by
                <HighlightText text={" building real projects"} />
              </div>
            }
            subheading={
              "Move beyond theory with hands-on coding projects, practical assignments, and expert guidance designed to help you build real-world skills and confidence."
            }
            ctabtn1={{
              btnText: "Start Building",
              link: "/signup",
              active: true,
            }}
            ctabtn2={{
              btnText: "View Projects",
              link: "/catalog",
              active: false,
            }}
            codeColor={"text-yellow-25"}
            codeblock={`const student = {
  name: "Future Developer",
  courses: ["HTML", "CSS", "JavaScript", "React"],
  projectsCompleted: 12,
  certificates: 5,
  hired: false,
};

student.hired = true;

console.log("Career Started 🚀");`}
            backgroundGradient={<div className="codeblock2 absolute"></div>}
          />
        </div>

        {/* Explore Section */}
        <ExploreMore />
      </div>

      {/* Section 2 */}
      <div className="bg-ink-800 text-ink-100">
        <div className="homepage_bg h-[320px]">
          {/* Explore Full Catagory Section */}
          <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8">
            <div className="lg:h-[150px]"></div>
            <div className="flex flex-row gap-7 text-ink-50 lg:mt-8">
              <CTAButton active={true} linkto={"/signup"}>
                <div className="flex items-center gap-2">
                  Start Learning
                  <FaArrowRight />
                </div>
              </CTAButton>

              <CTAButton active={false} linkto={"/login"}>
                Explore Courses
              </CTAButton>
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 ">
          {/* Job that is in Demand - Section 1 */}
          <div className="mb-10 mt-[-100px] flex flex-col justify-between gap-7 lg:mt-20 lg:flex-row lg:gap-0">
            <div className="text-4xl font-semibold lg:w-[45%] text-ink-50">
              Learn from experts.
              <HighlightText text={" Build your future."} />
            </div>

            <div className="flex flex-col items-start gap-10 lg:w-[40%] text-ink-200">
              <div className="text-[16px]">
                Access industry-led courses, hands-on projects, and interactive learning experiences designed to help you gain practical skills and advance your career with confidence.
              </div>

              <CTAButton active={true} linkto={"/signup"}>
                <div>Start Learning Today</div>
              </CTAButton>
            </div>
            <div className="flex flex-col items-start gap-10 lg:w-[40%] text-ink-200">
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
      <div className="relative mx-auto my-24 flex w-11/12 max-w-maxContent flex-col items-center gap-12 bg-ink-900 text-ink-100">

        {/* Become an Instructor */}
        <InstructorSection />

        {/* Testimonials */}
        <div className="flex flex-col items-center gap-4 text-center">

          <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-5 py-2 text-sm font-semibold uppercase tracking-wider text-gold-300">
            Student Success Stories
          </span>

          <h2 className="text-4xl lg:text-5xl font-bold text-ink-50">
            Loved by
            <HighlightText text={" Thousands of Learners"} />
          </h2>

          <p className="max-w-3xl text-lg leading-8 text-ink-200">
            Discover how students have transformed their careers, built real-world
            projects, and achieved their learning goals through our expert-led
            courses and hands-on learning experience.
          </p>

        </div>

        <ReviewSlider />

      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Home