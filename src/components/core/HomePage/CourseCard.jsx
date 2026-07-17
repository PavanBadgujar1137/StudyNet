import React from "react";

// Importing React Icons
import { HiUsers } from "react-icons/hi";
import { ImTree } from "react-icons/im";

const CourseCard = ({ cardData, currentCard, setCurrentCard }) => {
  return (
    <div
      className={`w-[360px] lg:w-[30%] rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer border ${currentCard === cardData?.heading
          ? "bg-ink-800 border-gold-500 shadow-[0_15px_40px_rgba(201,162,39,0.15)]"
          : "bg-ink-800 border-ink-600 hover:border-gold-400 hover:-translate-y-2"
        }`}
      onClick={() => setCurrentCard(cardData?.heading)}
    >
      <div className="h-[80%] p-6 flex flex-col gap-4 border-b border-ink-600"><div
        className={`text-2xl font-bold transition-colors ${currentCard === cardData?.heading
            ? "text-gold-300"
            : "text-ink-50"
          }`}
      >
        {cardData?.heading}
      </div>

        <div className="text-ink-200 leading-7">
          {cardData?.description}
        </div>      </div>

      <div
        className={`flex justify-between items-center px-6 py-4 text-sm font-medium ${currentCard === cardData?.heading
            ? "text-sage-300"
            : "text-ink-300"
          }`}
      >
        {/* Level */}
        <div className="flex items-center gap-2 text-[16px]">
          <HiUsers />
          <p>{cardData?.level}</p>
        </div>

        {/* Flow Chart */}
        <div className="flex items-center gap-2 text-[16px]">
          <ImTree />
          <p>{cardData?.lessionNumber} Lession</p>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
