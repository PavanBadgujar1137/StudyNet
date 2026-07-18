import React from "react";

const Stats = [
  { count: "5K+", label: "Guides & Healers" },
  { count: "12K+", label: "Secure Containers" },
  { count: "250K+", label: "Daily Reflections" },
  { count: "99.8%", label: "Trust Rate" },
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
