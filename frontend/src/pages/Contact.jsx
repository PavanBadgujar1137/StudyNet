import React from "react"
import { FaStar } from "react-icons/fa"

// Component Imports
import Footer from "../components/Common/Footer"
import ContactDetails from "../components/core/ContactUsPage/ContactDetails"
import ContactForm from "../components/core/ContactUsPage/ContactForm"

const Contact = () => {
  return (
    <div className="bg-paper min-h-screen font-poppins relative overflow-hidden">
      {/* Dynamic ambient backdrop glows */}
      <div className="absolute top-20 left-[-10%] w-[35rem] h-[35rem] rounded-full bg-royal-blue/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-violet/5 blur-[120px] pointer-events-none"></div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto mt-16 pb-24 flex w-11/12 max-w-maxContent flex-col justify-between gap-12 lg:flex-row items-start">
        {/* Contact Details (Left side) */}
        <div className="lg:w-[40%] w-full sticky top-24">
          <div className="mb-6 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-royal-blue bg-royal-blue/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
              <FaStar className="text-[10px]" /> Contact Space
            </span>
            <h1 className="font-fraunces text-3xl sm:text-4xl font-bold text-navy mt-4 leading-tight">
              We're here to hold space for you.
            </h1>
            <p className="text-ink-soft text-sm mt-2 leading-relaxed">
              Have questions about setting up your cohort, secure journals, or team access? Reach out directly.
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
