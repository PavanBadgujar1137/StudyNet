import React from "react";

const HighlightText = ({ text }) => {
  return (
    <span className="bg-gradient-to-r from-gold-200 via-gold-400 to-gold-500 bg-clip-text text-transparent font-extrabold">
      {text}
    </span>
  );
};

export default HighlightText;