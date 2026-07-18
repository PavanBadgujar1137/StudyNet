import React from "react";
import ContactUsForm from "../ContactUsPage/ContactUsForm";

const ContactFormSection = () => {
  return (
    <div className="glass-card max-w-xl w-full mx-auto p-8 sm:p-10 rounded-[32px] border border-white/60 shadow-xl text-left relative overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-royal-blue/5 rounded-full blur-xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet/5 rounded-full blur-xl pointer-events-none"></div>

      <div className="relative z-10">
        <h2 className="text-center text-3xl font-bold text-navy font-fraunces">Get in Touch</h2>
        <p className="text-center text-ink-soft text-sm mt-2">
          We&apos;d love to hear from you. Please fill out this brief form.
        </p>
        <div className="mt-8">
          <ContactUsForm />
        </div>
      </div>
    </div>
  );
};

export default ContactFormSection;
