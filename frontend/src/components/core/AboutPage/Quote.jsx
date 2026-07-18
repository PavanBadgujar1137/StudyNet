import React from 'react'
import HighlightText from '../HomePage/HighlightText'

const Quote = () => {
  return (
    <div className="glass-card px-8 py-10 md:px-16 md:py-14 rounded-[32px] border border-white/60 shadow-xl max-w-4.5xl mx-auto text-center text-xl md:text-3.5xl font-medium text-navy leading-relaxed font-fraunces relative">
      <span className="absolute -top-6 left-6 text-7xl text-royal-blue/15 select-none font-fraunces">“</span>
      We are passionate about holding space for growth. Our platform
      <HighlightText text=" combines secure technology" />,{" "}
      <span className="bg-gradient-to-r from-royal-blue to-violet text-transparent bg-clip-text font-bold">
        expert practice methods
      </span>
      , and community to help you guide clients along an
      <span className="bg-gradient-to-r from-royal-blue to-violet bg-clip-text font-bold italic">
        {" "}unparalleled journey of transformation.
      </span> 
      <span className="absolute -bottom-16 right-6 text-7xl text-royal-blue/15 select-none font-fraunces">”</span>
    </div>
  )
}

export default Quote