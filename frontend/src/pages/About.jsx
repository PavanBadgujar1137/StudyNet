import React from "react"
import { FaStar, FaGraduationCap, FaAward, FaRocket, FaHeart } from "react-icons/fa"

// Component Imports
import Footer from "../components/Common/Footer"
import ReviewSlider from "../components/Common/ReviewSlider"
import LearningGrid from "../components/core/AboutPage/LearningGrid"
import Quote from "../components/core/AboutPage/Quote"
import StatsComponenet from "../components/core/AboutPage/Stats"
import DynamicCanvasBg from "../components/Common/DynamicCanvasBg"

const About = () => {
  return (
    <div className="bg-paper min-h-screen font-sans text-navy relative overflow-hidden">
      {/* Interactive Ambient Background Canvas */}
      <DynamicCanvasBg />

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 text-center border-b border-line/40">
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8">
          {/* Eyebrow Pill Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-royal-blue/30 bg-white/80 backdrop-blur-md px-5 py-2 text-xs font-bold uppercase tracking-widest text-royal-blue shadow-lg shadow-royal-blue/10 animate-float-slow">
            <FaStar className="text-violet text-xs" />
            Empowering Modern Learners &amp; Educators
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-navy max-w-5xl leading-[1.12]">
            Driving Innovation in Online Education for a{" "}
            <span className="italic bg-gradient-to-r from-royal-blue via-violet to-pink-500 bg-clip-text text-transparent">
              Brighter Future
            </span>
          </h1>

          <p className="mt-2 text-lg sm:text-xl text-slate-600 font-medium max-w-3xl leading-relaxed">
            OpenHand is dedicated to empowering learners around the world with interactive course paths, hands-on practice modules, real-time video classrooms, and verified digital credentials.
          </p>
        </div>
      </section>

      {/* Quote Section */}
      <section className="relative z-10 py-16 border-b border-line/40 bg-white/40 backdrop-blur-md">
        <div className="mx-auto w-11/12 max-w-maxContent text-navy">
          <Quote />
        </div>
      </section>

      {/* Story & Values Section */}
      <section className="relative z-10 py-24">
        <div className="mx-auto w-11/12 max-w-maxContent">
          <div className="flex flex-col items-center gap-12 lg:flex-row justify-between">
            {/* Founding Story */}
            <div className="flex lg:w-[52%] flex-col gap-6 text-left">
              <span className="text-xs font-extrabold uppercase tracking-widest text-violet bg-violet/10 px-4 py-1.5 rounded-full w-fit border border-violet/20">
                Our Genesis
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-navy leading-tight">
                Our Founding <span className="bg-gradient-to-r from-royal-blue to-violet bg-clip-text text-transparent">Story</span>
              </h2>
              <p className="text-base text-slate-600 leading-relaxed font-medium">
                OpenHand was created out of a shared vision to revolutionize how technology and practical skills are taught online. It began with a group of educators, developers, and designers who believed online learning could be both engaging and deeply accessible.
              </p>
              <p className="text-base text-slate-600 leading-relaxed font-medium">
                We set out to eliminate outdated interfaces and replace them with a vibrant platform where students can stream high-definition video lectures, test their skills with interactive quizzes, and earn verifiable career credentials.
              </p>
            </div>

            {/* Graphic Glass Card */}
            <div className="lg:w-[42%] w-full flex justify-center items-center">
              <div className="w-full aspect-[4/3] rounded-[30px] bg-white/80 backdrop-blur-xl border border-white/60 p-10 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-royal-blue to-violet flex items-center justify-center text-white mb-6 shadow-xl shadow-royal-blue/20">
                  <FaGraduationCap className="text-4xl animate-float-slow" />
                </div>
                <h3 className="text-2xl font-bold text-navy mb-3">Academic Excellence</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium max-w-xs">
                  Driven by real-world projects, expert instructor guidance, and transparent skill mastery.
                </p>
              </div>
            </div>
          </div>

          {/* Vision & Mission Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-24">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[28px] border border-white/60 shadow-xl text-left hover:border-royal-blue/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-royal-blue/10 text-royal-blue flex items-center justify-center font-bold text-xl mb-5">
                <FaRocket />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-3">Our Vision</h3>
              <p className="text-slate-600 text-base leading-relaxed font-medium">
                We envision a world where anyone, regardless of background or location, can master in-demand skills and earn industry-recognized credentials to accelerate their career.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[28px] border border-white/60 shadow-xl text-left hover:border-violet/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-violet/10 text-violet flex items-center justify-center font-bold text-xl mb-5">
                <FaHeart />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-3">Our Mission</h3>
              <p className="text-slate-600 text-base leading-relaxed font-medium">
                Our mission is to provide an end-to-end learning platform combining seamless video streaming, interactive assessments, student progress tracking, and instructor tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-12">
        <StatsComponenet />
      </section>

      {/* Learning Grid Section */}
      <section className="relative z-10 py-20">
        <LearningGrid />
      </section>

      {/* Student Reviews Slider */}
      <section className="relative z-10 py-20 bg-white/40 backdrop-blur-md">
        <div className="mx-auto w-11/12 max-w-maxContent text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-royal-blue bg-royal-blue/10 px-3.5 py-1.5 rounded-full">
            Student Feedback
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-navy mt-4 mb-10">
            Reviews from Learners Around the World
          </h2>
          <ReviewSlider />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default About
