import React from "react";

/**
 * OpenHand — Floating Continuous Scrolling Brand Strap
 * Continuous infinite marquee ticker displaying partner and ecosystem brands.
 * Fully configurable via `brands` prop.
 */

export const DEFAULT_BRANDS = [
  {
    name: "Razorpay",
    tagline: "Instant UPI Payouts",
    badge: "Payments",
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 120 32" fill="currentColor">
        <path d="M12 2L2 22h8l2-8h8l2-12H12zm18 0l-4 20h6l1.5-7h5c5 0 8.5-2.5 9.5-7 .8-4-1.5-6-6.5-6h-11.5zm6 4h4c2.5 0 4 1 3.5 3s-2 3-4.5 3h-4l1-6zm16-4l-4 20h6l4-20h-6zm14 0l-4 20h6l1.2-6h5.8l4 6h6.5l-4.5-6.5c3.5-1 5.5-3.5 6-6.5.8-4-1.8-7-6.8-7H66zm6 4h4.2c2.5 0 4 1 3.5 3s-2 3-4.5 3H69l1.2-6zm20-4l-4 20h6l4-20h-6zm12 0l-4 20h14l1-5h-8l1-4h7l1-5h-7l1-6h-6z" />
      </svg>
    ),
  },
  {
    name: "Stripe",
    tagline: "Global Card Payouts",
    badge: "Payments",
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 80 32" fill="currentColor">
        <path d="M12 11.5c0-1.8 1.5-2.5 3.8-2.5 3.5 0 7.8 1.1 11.2 3V4.2C23.2 3.1 19.3 2.5 15.4 2.5 5.8 2.5 0 7.6 0 15.6c0 12.3 17 10.3 17 15.6 0 2.1-1.8 2.8-4.4 2.8-4.2 0-9.2-1.7-13.2-3.9v8c4.6 2 9.2 2.8 13.5 2.8C23.6 40.9 30 35.8 30 27.8c-.1-13-17.1-10.8-17.1-16.3z" />
        <path d="M37 7.5h9.5v24H37z" />
        <circle cx="41.8" cy="2.5" r="2.5" />
        <path d="M52 14.5v17h9.5V20.2c0-3.5 1.8-5.2 4.8-5.2 1.3 0 2.5.3 3.2.7V7c-.9-.4-2.1-.6-3.7-.6-4 0-6.8 2.2-7.8 5.6V7.5H52v7z" />
      </svg>
    ),
  },
  {
    name: "Calm",
    tagline: "Mindfulness & Sleep",
    badge: "Wellness",
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 90 32" fill="currentColor">
        <text x="0" y="24" fontFamily="'Playfair Display', Georgia, serif" fontSize="26" fontStyle="italic" fontWeight="700">Calm</text>
      </svg>
    ),
  },
  {
    name: "Headspace",
    tagline: "Mental Health Support",
    badge: "Health",
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 130 32" fill="currentColor">
        <circle cx="14" cy="16" r="11" fill="#F59E0B" />
        <text x="32" y="22" fontFamily="Inter, sans-serif" fontSize="18" fontWeight="800" letterSpacing="-0.5px">headspace</text>
      </svg>
    ),
  },
  {
    name: "Mindvalley",
    tagline: "Personal Transformation",
    badge: "Coaching",
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 130 32" fill="currentColor">
        <path d="M4 22L12 8l8 14h-4l-4-7-4 7H4zm14 0l8-14 8 14h-4l-4-7-4 7h-4z" fill="#7C3AED" />
        <text x="36" y="21" fontFamily="Inter, sans-serif" fontSize="16" fontWeight="800" letterSpacing="-0.5px">MINDVALLEY</text>
      </svg>
    ),
  },
  {
    name: "BetterHelp",
    tagline: "Therapy & Counselling",
    badge: "Therapy",
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 130 32" fill="currentColor">
        <circle cx="12" cy="16" r="8" fill="#10B981" />
        <path d="M12 11c2.8 0 5 2.2 5 5s-2.2 5-5 5" fill="#34D399" />
        <text x="26" y="21" fontFamily="Inter, sans-serif" fontSize="16" fontWeight="800">betterhelp</text>
      </svg>
    ),
  },
  {
    name: "Harvard Health",
    tagline: "Evidence-Based Frameworks",
    badge: "Publishing",
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 150 32" fill="currentColor">
        <rect x="2" y="6" width="18" height="20" rx="3" fill="#991B1B" />
        <text x="8" y="21" fill="#FFFFFF" fontFamily="Georgia, serif" fontSize="14" fontWeight="bold">H</text>
        <text x="26" y="21" fontFamily="Georgia, serif" fontSize="14" fontWeight="bold" letterSpacing="0.5px">HARVARD HEALTH</text>
      </svg>
    ),
  },
  {
    name: "Psychology Today",
    tagline: "Verified Practitioner Network",
    badge: "Directory",
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 160 32" fill="currentColor">
        <text x="0" y="21" fontFamily="Georgia, serif" fontSize="16" fontWeight="bold" letterSpacing="-0.5px">Psychology Today</text>
      </svg>
    ),
  },
];

export default function OHBrandStrap({
  title = "TRUSTED BY PRACTITIONERS & INTEGRATED WITH",
  brands = DEFAULT_BRANDS,
  speedSeconds = 35,
  className = "",
}) {
  // Duplicate brands array 3 times to ensure 100% seamless infinite scroll
  const marqueeList = [...brands, ...brands, ...brands];

  return (
    <div className={`relative w-full overflow-hidden py-4 sm:py-5 ${className}`}>
      {/* Container with floating dark ribbon styling */}
      <div
        className="relative mx-auto max-w-7xl px-3 sm:px-6"
      >
        <div
          className="relative rounded-2xl sm:rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #0B1120 0%, #070B14 100%)",
            boxShadow: "0 20px 40px -15px rgba(2, 6, 23, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Subtle Top Ambient Glow Accent */}
          <div
            className="absolute top-0 left-1/4 right-1/4 h-[1px] opacity-60"
            style={{
              background: "linear-gradient(90deg, transparent, #2563EB, #7C3AED, transparent)",
            }}
          />

          <div className="py-4 sm:py-5">
            {/* Header Eyebrow */}
            {title && (
              <div className="text-center mb-3">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-slate-400/90 select-none">
                  {title}
                </span>
              </div>
            )}

            {/* Continuous Marquee Track Container */}
            <div className="relative w-full overflow-hidden group">
              {/* Left and Right Edge Fade Gradients */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-r from-[#0B1120] to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-l from-[#070B14] to-transparent" />

              {/* Scrolling Strip */}
              <div
                className="flex items-center gap-8 sm:gap-12 w-max animate-marquee group-hover:[animation-play-state:paused]"
                style={{
                  animationDuration: `${speedSeconds}s`,
                }}
              >
                {marqueeList.map((brand, idx) => (
                  <div
                    key={`${brand.name}-${idx}`}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5 shrink-0 select-none cursor-pointer"
                  >
                    <div className="flex items-center text-slate-300 hover:text-white transition-colors">
                      {brand.svg}
                    </div>
                    {brand.badge && (
                      <span className="hidden md:inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60">
                        {brand.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Marquee Animation CSS */}
      <style>{`
        @keyframes oh-marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333333%);
          }
        }
        .animate-marquee {
          animation: oh-marquee-scroll linear infinite;
        }
      `}</style>
    </div>
  );
}
