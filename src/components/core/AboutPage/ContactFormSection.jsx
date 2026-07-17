import React from "react";
import ContactUsForm from "../ContactUsPage/ContactUsForm";

const ContactFormSection = () => {
  return (
   <div className="mx-auto">
  <h1 className="text-center text-4xl font-semibold text-ink-50">
    We'd Love to Hear From You
  </h1>

  <p className="mt-4 text-center text-ink-200">
    Whether you have a question, need support, or want to learn more about our
    platform, we're just a message away.
  </p>

  <div className="mx-auto mt-12">
    <ContactUsForm />
  </div>
</div>
  );
};

export default ContactFormSection;
