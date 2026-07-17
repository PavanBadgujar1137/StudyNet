import React from "react";
import HighlightText from "../HomePage/HighlightText";

const Quote = () => {
  return (
    <div className="mx-auto py-5 pb-20 text-center text-xl font-semibold text-ink-50 md:text-4xl leading-relaxed">
      Learning is more than watching videos—it's about
      <HighlightText text={" building real skills"} />, solving real
      problems, and growing with a community that inspires you every step of
      the way.
    </div>
  );
};

export default Quote;