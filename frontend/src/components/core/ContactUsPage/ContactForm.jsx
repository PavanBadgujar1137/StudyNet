import React from "react";
import ContactUsForm from "./ContactUsForm";

const ContactForm = () => {
  return (
    <div className="glass-card border border-line/65 rounded-[32px] p-8 lg:p-12 shadow-xl backdrop-blur-md relative overflow-hidden text-left">
      {/* Decorative subtle glows */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-royal-blue/5 rounded-full blur-xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet/5 rounded-full blur-xl pointer-events-none"></div>

      <div className="relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold font-fraunces text-navy leading-tight">
          Got an idea? We have the platform. Let&apos;s team up.
        </h2>
        <p className="text-ink-soft text-sm mt-2.5">
          Tell us more about your practice and what you have in mind.
        </p>

        <div className="mt-8">
          <ContactUsForm />
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
