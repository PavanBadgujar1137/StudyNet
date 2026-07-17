import React from "react"

import FoundingStory from "../assets/Images/journey.webp"
import BannerImage1 from "../assets/Images/about1.jpeg"
import BannerImage2 from "../assets/Images/about2.avif"
import BannerImage3 from "../assets/Images/about3.jpg"
import Footer from "../components/Common/Footer"
import ReviewSlider from "../components/Common/ReviewSlider"
import ContactFormSection from "../components/core/AboutPage/ContactFormSection"
import LearningGrid from "../components/core/AboutPage/LearningGrid"
import Quote from "../components/core/AboutPage/Quote"
import StatsComponenet from "../components/core/AboutPage/Stats"
import HighlightText from "../components/core/HomePage/HighlightText"

const About = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-ink-700">
        <div className="relative mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-center text-ink-100">
          <header className="mx-auto py-20 text-4xl font-semibold lg:w-[70%] text-ink-50">
            Empowering Every Learner to
            <HighlightText text={" Learn, Build & Succeed."} />

            <p className="mx-auto mt-5 text-center text-base font-medium text-ink-200 lg:w-[90%] leading-7">
              We believe learning should be practical, engaging, and accessible to
              everyone. Through expert-led courses, hands-on projects, and an
              active learning community, we help students gain the skills they
              need to grow their careers with confidence.
            </p>
          </header>

          <div className="sm:h-[70px] lg:h-[150px]"></div>
          <div className="absolute bottom-0 left-1/2 grid w-full -translate-x-1/2 translate-y-[35%] grid-cols-1 gap-5 px-4 sm:grid-cols-3 lg:px-0">

            {[BannerImage1, BannerImage2, BannerImage3].map((image, index) => (
              <div
                key={index}
                className="group overflow-hidden rounded-3xl border border-ink-600 bg-ink-800 p-2 transition-all duration-500 hover:-translate-y-2 hover:border-gold-400"
              >
                <img
                  src={image}
                  alt={`banner-${index + 1}`}
                  className="h-[220px] w-full rounded-2xl object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="border-b border-ink-700">
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col gap-10">
          <div className="h-[100px]"></div>
          <Quote />
        </div>
      </section>

      {/* Story Section */}
      <section>
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col gap-10">

          <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">

            <div className="my-24 flex flex-col gap-8 lg:w-[50%]">
              <h1 className="bg-gradient-to-r from-gold-500 to-sage-400 bg-clip-text text-4xl font-bold text-transparent">
                Our Journey
              </h1>

              <p className="text-base leading-7 text-ink-200">
                Our platform was created with one goal in mind—to make learning
                more interactive, practical, and career-focused. We wanted to move
                beyond traditional online courses and build a place where students
                learn by doing.
              </p>

              <p className="text-base leading-7 text-ink-200">
                Today, thousands of learners are building real-world projects,
                mastering in-demand technologies, and gaining confidence through
                expert guidance and hands-on experiences.
              </p>
            </div>

            <div className="lg:w-[45%] flex justify-center">
              <div className="relative rounded-3xl border border-ink-600 bg-ink-800 p-3">

                <div className="absolute -top-8 -left-8 h-28 w-28 rounded-full bg-gold-500/20 blur-3xl"></div>
                <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-sage-500/20 blur-3xl"></div>

                <img
                  src={FoundingStory}
                  alt="Our Story"
                  className="relative rounded-2xl object-cover transition-all duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Mission & Vision */}

          <div className="flex flex-col justify-between gap-16 lg:flex-row">

            <div className="my-12 flex flex-col gap-6 lg:w-[45%]">
              <h1 className="bg-gradient-to-r from-sage-400 to-sage-200 bg-clip-text text-4xl font-bold text-transparent">
                Our Vision
              </h1>

              <p className="text-base leading-7 text-ink-200">
                To create a world where anyone, anywhere can access high-quality
                education, develop practical skills, and unlock opportunities for
                lifelong success.
              </p>
            </div>

            <div className="my-12 flex flex-col gap-6 lg:w-[45%]">
              <h1 className="bg-gradient-to-r from-gold-500 to-gold-300 bg-clip-text text-4xl font-bold text-transparent">
                Our Mission
              </h1>

              <p className="text-base leading-7 text-ink-200">
                We empower learners through industry-relevant courses, real-world
                projects, expert mentorship, and a supportive community that
                inspires continuous learning and personal growth.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Stats */}
      <StatsComponenet />

      {/* Learning Grid & Contact */}
      <section className="mx-auto mt-20 flex w-11/12 max-w-maxContent flex-col gap-10 text-ink-100">
        <LearningGrid />
        <ContactFormSection />
      </section>

      {/* Reviews */}
      <section className="relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col items-center gap-10 rounded-3xl border border-ink-700 bg-ink-900 py-14">

        <div className="text-center">
          <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-5 py-2 text-sm font-semibold uppercase tracking-wider text-gold-300">
            Testimonials
          </span>

          <h1 className="mt-5 text-4xl font-bold text-ink-50">
            What Our
            <HighlightText text={" Students Say"} />
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-200">
            Discover how learners around the world have transformed their skills,
            built amazing projects, and achieved their career goals through our
            learning platform.
          </p>
        </div>

        <ReviewSlider />

      </section>

      <Footer />
    </div>
  );
}

export default About