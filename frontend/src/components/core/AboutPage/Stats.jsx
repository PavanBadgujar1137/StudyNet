import React from "react";

const Stats = [
  { count: "50K+", label: "Active Students" },
  { count: "1,200+", label: "Published Courses" },
  { count: "2.5M+", label: "Video Lessons Streamed" },
  { count: "99.4%", label: "Completion Satisfaction" },
];

const StatsComponenet = () => {
  return (
    <div className="bg-gradient-to-r from-royal-blue/5 via-violet/5 to-transparent border-y border-line/45 py-12">
      <div className="w-11/12 max-w-maxContent mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 text-center divide-y md:divide-y-0 md:divide-x divide-line/60">
          {Stats.map((data, index) => {
            return (
              <div className="flex flex-col py-6 md:py-4 justify-center items-center group transition-all duration-300 hover:scale-105" key={index}>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-navy font-fraunces mb-2.5 transition-colors group-hover:text-royal-blue">
                  {data.count}
                </h2>
                <h3 className="font-semibold text-xs text-ink-soft uppercase tracking-widest">
                  {data.label}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsComponenet;
