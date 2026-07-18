import React from "react"
import * as Icon1 from "react-icons/bi"
import * as Icon3 from "react-icons/hi2"
import * as Icon2 from "react-icons/io5"

const contactDetails = [
  {
    icon: "HiChatBubbleLeftRight",
    heading: "Chat on us",
    description: "Our friendly team is here to help.",
    details: "info@openhand.live",
  },
  {
    icon: "BiWorld",
    heading: "Visit us",
    description: "Come and say hello at our office HQ.",
    details:
      "Akshya Nagar 1st Block 1st Cross, Rammurthy nagar, Bangalore-560016",
  },
  {
    icon: "IoCall",
    heading: "Call us",
    description: "Mon - Fri From 8am to 5pm",
    details: "+123 456 7869",
  },
]

const ContactDetails = () => {
  return (
    <div className="flex flex-col gap-8 rounded-[32px] border border-line/65 bg-white/75 p-8 shadow-xl backdrop-blur-md">
      {contactDetails.map((ele, i) => {
        let Icon = Icon1[ele.icon] || Icon2[ele.icon] || Icon3[ele.icon]
        return (
          <div
            className="flex gap-4 p-2 text-left"
            key={i}
          >
            <div className="w-12 h-12 rounded-2xl bg-royal-blue/10 flex items-center justify-center text-royal-blue shrink-0 shadow-sm border border-royal-blue/10">
              <Icon size={22} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-navy font-fraunces">
                {ele?.heading}
              </h3>
              <p className="text-sm font-medium text-ink-soft leading-relaxed">
                {ele?.description}
              </p>
              <p className="text-sm font-bold text-royal-blue select-all">
                {ele?.details}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ContactDetails
