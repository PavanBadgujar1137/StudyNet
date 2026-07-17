import React from "react"
import * as Icon1 from "react-icons/bi"
import * as Icon3 from "react-icons/hi2"
import * as Icon2 from "react-icons/io5"

const contactDetails = [
  {
    icon: "HiChatBubbleLeftRight",
    heading: "Email Us",
    description: "We're here to answer your questions.",
    details: "support@learnhub.com",
  },
  {
    icon: "BiWorld",
    heading: "Visit Our Office",
    description: "Drop by and meet our team.",
    details:
      "Baner Road, Baner, Pune, Maharashtra 411045",
  },
  {
    icon: "IoCall",
    heading: "Call Us",
    description: "Monday - Saturday | 9:00 AM - 6:00 PM",
    details: "+91 98765 43210",
  },
];

const ContactDetails = () => {
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-ink-600 bg-ink-800 p-6">

      {contactDetails.map((ele, i) => {
        const Icon = Icon1[ele.icon] || Icon2[ele.icon] || Icon3[ele.icon];

        return (
          <div
            key={i}
            className="group rounded-2xl border border-ink-600 bg-ink-900 p-5 transition-all duration-300 hover:border-gold-400 hover:bg-ink-700"
          >
            <div className="flex items-start gap-4">

              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 transition-all duration-300 group-hover:bg-gold-500 group-hover:text-ink-900">
                <Icon size={24} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-ink-50">
                  {ele.heading}
                </h2>

                <p className="mt-1 text-sm leading-6 text-ink-200">
                  {ele.description}
                </p>

                <p className="mt-3 font-medium text-gold-300 break-words">
                  {ele.details}
                </p>
              </div>

            </div>
          </div>
        );
      })}

    </div>
  );
};

export default ContactDetails
