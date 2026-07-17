import React from "react";
import ContactUsForm from "./ContactUsForm";

const ContactForm = () => {
  return (
    <div className="border border-ink-600 rounded-2xl bg-ink-800 p-7 lg:p-14 flex flex-col gap-4 text-ink-200">

  <h1 className="text-4xl leading-tight font-bold text-ink-50">
    Have Questions?
    <br />
    We're Here to Help.
  </h1>

  <p className="text-base leading-7">
    Whether you need help choosing the right course, have questions about your
    learning journey, or need technical support, our team is ready to assist
    you.
  </p>

  <div className="mt-7">
    <ContactUsForm />
  </div>

</div>
  );
};

export default ContactForm;
