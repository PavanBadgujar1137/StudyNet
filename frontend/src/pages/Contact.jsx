import React from "react"
import { FaStar, FaEnvelope } from "react-icons/fa"

// Component Imports
import Footer from "../components/Common/Footer"
import ContactDetails from "../components/core/ContactUsPage/ContactDetails"
import ContactForm from "../components/core/ContactUsPage/ContactForm"
import DynamicCanvasBg from "../components/Common/DynamicCanvasBg"

const Contact = () => {
  return (
    <div className="bg-paper min-h-screen font-sans text-navy relative overflow-hidden">
      {/* Interactive Ambient Background Canvas */}
      <DynamicCanvasBg />

      {/* Hero Header */}
      <section className="relative z-10 pt-20 pb-12 text-center border-b border-line/40">
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-6">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-royal-blue/30 bg-white/80 backdrop-blur-md px-5 py-2 text-xs font-bold uppercase tracking-widest text-royal-blue shadow-lg shadow-royal-blue/10 animate-float-slow">
            <FaEnvelope className="text-violet text-xs" />
            Reach Out to OpenHand Support
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-navy max-w-4xl leading-tight">
            We&apos;re Here to <span className="bg-gradient-to-r from-royal-blue via-violet to-pink-500 bg-clip-text text-transparent">Help &amp; Support</span> You
          </h1>

          <p className="text-lg text-slate-600 font-medium max-w-2xl leading-relaxed">
            Have questions about course enrollment, instructor onboarding, student certificates, or platform features? Get in touch with our team directly.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="relative z-10 mx-auto py-16 flex w-11/12 max-w-maxContent flex-col justify-between gap-12 lg:flex-row items-start">
        {/* Contact Details (Left side) */}
        <div className="lg:w-[40%] w-full sticky top-24">
          <div className="mb-6 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-royal-blue bg-royal-blue/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-royal-blue/20">
              <FaStar className="text-[10px]" /> Direct Channels
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mt-4 leading-tight">
              Get in Touch Directly
            </h2>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed font-medium">
              We operate globally to assist students, instructors, and partner institutions.
            </p>
          </div>
          <ContactDetails />
        </div>

        {/* Contact Form (Right side) */}
        <div className="lg:w-[58%] w-full">
          <ContactForm />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Contact
