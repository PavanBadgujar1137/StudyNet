import React from "react"
import { FaStar } from "react-icons/fa"

// Component Imports
import Footer from "../components/Common/Footer"
import ReviewSlider from "../components/Common/ReviewSlider"
import LearningGrid from "../components/core/AboutPage/LearningGrid"
import Quote from "../components/core/AboutPage/Quote"
import StatsComponenet from "../components/core/AboutPage/Stats"
import HighlightText from "../components/core/HomePage/HighlightText"

const About = () => {
  return (
    <div className="bg-paper min-h-screen font-poppins relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-[20%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-royal-blue/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[30%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-violet/5 blur-[120px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative z-10 bg-gradient-to-b from-royal-blue/5 to-transparent border-b border-line/40">
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-center text-richblack-25 py-24">
          {/* Eyebrow */}
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-royal-blue/30 bg-royal-blue/5 px-4.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-royal-blue animate-float">
            <FaStar className="text-[10px]" />
            About OpenHand
          </div>

          <h1 className="font-fraunces text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-navy max-w-4xl mx-auto leading-tight">
            Empowering Guides and Healers for a <span className="bg-gradient-to-r from-royal-blue to-violet bg-clip-text text-transparent italic">Connected World</span>
          </h1>

          <p className="mx-auto mt-4 text-center text-lg text-ink-soft max-w-2.5xl leading-relaxed">
            OpenHand is at the forefront of supporting practitioners. We are passionate about creating a grounded space by offering tools for check-ins, private cohorts, and nourishing real community.
          </p>
        </div>
      </section>

      {/* Quote Section */}
      <section className="relative z-10 py-16 border-b border-line/40">
        <div className="mx-auto w-11/12 max-w-maxContent text-richblack-500">
          <Quote />
        </div>
      </section>

      {/* Story Sections */}
      <section className="relative z-10 py-24">
        <div className="mx-auto w-11/12 max-w-maxContent">
          <div className="flex flex-col items-center gap-12 lg:flex-row justify-between">
            {/* Founding Story Content */}
            <div className="flex lg:w-[50%] flex-col gap-6 text-left">
              <h2 className="font-fraunces text-3xl sm:text-4.5xl font-bold text-navy bg-gradient-to-r from-royal-blue to-violet bg-clip-text text-transparent">
                Our Founding Story
              </h2>
              <p className="text-base text-ink-soft leading-relaxed">
                Our platform was born out of a shared vision and passion for transforming how guides, mentors, and healers share their wisdom. It all began with a group of practitioners and builders who recognized the need for a safe, high-quality, and intentional space online.
              </p>
              <p className="text-base text-ink-soft leading-relaxed">
                As practitioners ourselves, we witnessed firsthand the limitations of corporate LMS tools and sterile course portals. We wanted to build something that feels organic, held, and deeply trusted — a space where guides and clients can focus on true transformation.
              </p>
            </div>

            {/* Founding Story Graphic Card */}
            <div className="lg:w-[45%] flex justify-center items-center w-full">
              <div className="w-full aspect-[4/3] rounded-3xl bg-gradient-to-tr from-royal-blue/10 via-violet/10 to-transparent border border-white/60 glass-card p-10 flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-royal-blue/5 rounded-full blur-xl pointer-events-none group-hover:bg-royal-blue/10 transition-colors"></div>
                <FaStar className="text-5xl text-royal-blue mb-5 animate-float" />
                <h3 className="font-fraunces text-2.5xl font-bold text-navy mb-3">Our Foundation</h3>
                <p className="text-ink-soft text-sm max-w-xs leading-relaxed">
                  Guided by ethical practice, backed by secure technologies, built for deep human connection.
                </p>
              </div>
            </div>
          </div>

          {/* Vision & Mission row */}
          <div className="flex flex-col items-center gap-12 lg:gap-20 lg:flex-row justify-between mt-24">
            <div className="flex lg:w-[45%] flex-col gap-5 text-left">
              <h3 className="font-fraunces text-2xl sm:text-3xl font-bold text-navy border-b border-line pb-3">
                Our Vision
              </h3>
              <p className="text-base text-ink-soft leading-relaxed">
                We envision a digital world where professional coaching, mental wellness, and spiritual practice thrive without compromising boundaries, trust, or safety. A world where wisdom is shared beautifully.
              </p>
            </div>
            
            <div className="flex lg:w-[45%] flex-col gap-5 text-left">
              <h3 className="font-fraunces text-2xl sm:text-3xl font-bold text-navy border-b border-line pb-3">
                Our Mission
              </h3>
              <p className="text-base text-ink-soft leading-relaxed">
                Our mission is to build the digital infrastructure for intentional practitioners. We provide the privacy, the cohorts, the community cards, and the AI assistance that lets you hold space beautifully.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsComponenet />

      {/* Learning Grid */}
      <section className="relative z-10 mx-auto py-24 flex w-11/12 max-w-maxContent flex-col justify-between text-richblack-25">
        <LearningGrid />
      </section>

      {/* Reviews Slider */}
      <section className="relative z-10 py-16 border-t border-line/40 bg-white/20">
        <div className="mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-12">
          <h2 className="font-fraunces text-center text-3xl sm:text-4.5xl font-bold text-navy">
            Reviews from other learners
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
