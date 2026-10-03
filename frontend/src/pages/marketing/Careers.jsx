import React, { useState, useRef } from "react";
import {
  ArrowRight,
  Briefcase,
  MapPin,
  Clock3,
  Users,
  Sparkles,
  HeartHandshake,
  X,
  Upload,
  CheckCircle2,
  Play,
  Send,
  Target,
  Lightbulb,
  TrendingUp,
  FileText,
  Heart,
  Cpu
} from "lucide-react";
import { submitCareerApplication } from "../../services/operations/careerAPI";
import toast from "react-hot-toast";
import { OHFooter } from "../../components/openhand";
import heroInfinityImg from "../../assets/Images/careers_hero_infinity.jpg";
import teamJourneyImg from "../../assets/Images/careers_team_journey.jpg";

const jobs = [
  {
    id: "junior",
    level: "JUNIOR",
    title: "Practitioner Success Associate",
    experience: "0–2 Years",
    location: "Mumbai / Remote",
    type: "Full Time",
    icon: Users,
    gradient: "from-sky-400 to-blue-600",
    badgeBg: "bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]",
    iconBoxBg: "bg-[#E0F2FE] text-[#0284C7]",
    tagBg: "bg-[#F0F9FF] text-[#0369A1] border-[#E0F2FE]",
    btnBg: "bg-[#0284C7] hover:bg-[#0369A1]",
    short:
      "Help practitioners onboard, build strong profiles and succeed on OpenHand.",
    responsibilities: [
      "Onboard new practitioners to the OpenHand platform",
      "Assist practitioners with profile and service setup",
      "Coordinate practitioner onboarding sessions",
      "Monitor practitioner engagement and activity",
      "Collect feedback and identify improvement opportunities",
      "Support community initiatives and practitioner events",
    ],
    skills: [
      "Communication",
      "Community Support",
      "CRM",
      "Problem Solving",
      "Social Media",
    ],
  },
  {
    id: "mid",
    level: "MID LEVEL",
    title: "Community & Growth Manager",
    experience: "3–6 Years",
    location: "Mumbai / Hybrid",
    type: "Full Time",
    icon: Sparkles,
    gradient: "from-violet-500 to-purple-600",
    badgeBg: "bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]",
    iconBoxBg: "bg-[#F3E8FF] text-[#9333EA]",
    tagBg: "bg-[#FAF5FF] text-[#7E22CE] border-[#F3E8FF]",
    btnBg: "bg-[#7C3AED] hover:bg-[#6D28D9]",
    short:
      "Build and scale the OpenHand practitioner ecosystem through community, partnerships and growth initiatives.",
    responsibilities: [
      "Develop practitioner acquisition and activation strategies",
      "Build and manage OpenHand practitioner communities",
      "Design campaigns to improve practitioner engagement",
      "Create partnerships with coaches, trainers and experts",
      "Track acquisition, activation and retention metrics",
      "Work with product and marketing teams on growth experiments",
    ],
    skills: [
      "Community Building",
      "Growth Marketing",
      "Partnerships",
      "Content Strategy",
      "Analytics",
    ],
  },
  {
    id: "senior",
    level: "SENIOR",
    title: "Head – Practitioner Experience & Partnerships",
    experience: "7–12+ Years",
    location: "Mumbai / Hybrid",
    type: "Full Time",
    icon: HeartHandshake,
    gradient: "from-fuchsia-500 to-pink-600",
    badgeBg: "bg-[#FCE7F3] text-[#BE185D] border-[#FBCFE8]",
    iconBoxBg: "bg-[#FCE7F3] text-[#DB2777]",
    tagBg: "bg-[#FDF2F8] text-[#BE185D] border-[#FCE7F3]",
    btnBg: "bg-[#DB2777] hover:bg-[#BE185D]",
    short:
      "Lead the practitioner ecosystem, strategic partnerships and experience strategy for OpenHand.",
    responsibilities: [
      "Own the overall practitioner ecosystem strategy",
      "Build strategic partnerships with coaches, experts and institutions",
      "Develop practitioner acquisition and retention frameworks",
      "Define practitioner experience and engagement metrics",
      "Lead community and partnership teams",
      "Collaborate with founders and product leadership",
      "Identify new business and ecosystem opportunities",
    ],
    skills: [
      "Strategic Thinking",
      "Leadership",
      "Business Development",
      "Ecosystem Building",
      "Stakeholder Management",
    ],
  },
];

export default function OpenHandCareers() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplication, setShowApplication] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const applyFormRef = useRef(null);

  // Application form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    experience: "",
    currentOrg: "",
    linkedin: "",
    expertise: "",
    coverNote: "",
    jobTitle: "",
  });
  const [fileName, setFileName] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [agreeConsent, setAgreeConsent] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const openApplication = (job) => {
    setSelectedJob(job);
    setShowApplication(true);
  };

  const scrollToApply = (job) => {
    if (job) {
      setFormData((prev) => ({
        ...prev,
        jobTitle: job.title,
        expertise:
          job.id === "junior"
            ? "Practitioner Success"
            : job.id === "mid"
            ? "Community & Growth"
            : "Business Development",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        jobTitle: "General / Open Application",
      }));
    }
    applyFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEmbeddedSubmit = async (e) => {
    e.preventDefault();
    if (!agreeConsent) {
      toast.error("Please agree to the consent declaration before submitting.");
      return;
    }
    if (!resumeFile && !fileName) {
      toast.error("Please upload your Resume / CV before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("city", formData.city || "");
      data.append("experience", formData.experience);
      data.append("currentOrg", formData.currentOrg || "");
      data.append("linkedin", formData.linkedin || "");
      data.append("expertise", formData.expertise);
      data.append("coverNote", formData.coverNote);
      data.append("jobTitle", formData.jobTitle || "General / Open Application");
      if (resumeFile) {
        data.append("resume", resumeFile);
        data.append("resumeName", resumeFile.name);
      } else if (fileName) {
        data.append("resumeName", fileName);
      }

      await submitCareerApplication(data);
      setFormSubmitted(true);
    } catch (err) {
      console.error("Application submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setResumeFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-[#111936] font-sans antialiased">
      
      {/* ── 1. HERO SECTION ── */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
        {/* Soft Ambient Light Gradient Background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-blue-300/20 via-violet-300/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-r from-blue-200/25 to-cyan-200/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-6 text-left">
              {/* Category pill */}
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="text-[12px] font-extrabold uppercase tracking-[2.5px] text-[#2563EB]">
                  Careers at OpenHand
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-black tracking-tight text-[#0F172A] leading-[1.08]">
                Build the future of <br />
                <span className="text-[#7C3AED]">
                  human guidance.
                </span>
              </h1>

              {/* Sub-paragraph */}
              <p className="mt-5 text-base sm:text-[17px] text-[#475569] leading-relaxed max-w-xl font-normal">
                Join our mission to connect people with the right practitioners, mentors and experts.
                Help us create a more guided, empowered and fulfilling world.
              </p>

              {/* CTA Buttons */}
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <button
                  onClick={() =>
                    document.getElementById("open-roles")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="group inline-flex items-center gap-2.5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <span>Explore Open Roles</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => setShowVideoModal(true)}
                  className="inline-flex items-center gap-2.5 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-[#0F172A] hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <div className="w-5 h-5 rounded-full bg-[#0F172A] flex items-center justify-center text-white text-[9px]">
                    <Play size={10} className="fill-white translate-x-0.5" />
                  </div>
                  <span>Watch Our Story</span>
                </button>
              </div>

              {/* Team Social Proof Pill */}
              <div className="mt-8 flex items-center gap-3.5 pt-4">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover shadow-sm"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                    alt="Team member"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover shadow-sm"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80"
                    alt="Team member"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover shadow-sm"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&h=100&q=80"
                    alt="Team member"
                  />
                </div>
                <div className="text-[12px] text-[#475569] leading-tight">
                  <span className="font-bold text-[#0F172A] block">A small team. A big mission.</span>
                  Be part of something meaningful.
                </div>
              </div>
            </div>

            {/* Right Hero Graphic (Exact Match from Screenshot) */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[530px] rounded-[32px] overflow-hidden shadow-2xl border border-white/60 bg-[#070D22] group">
                
                {/* Generated Infinity Artwork */}
                <img
                  src={heroInfinityImg}
                  alt="OpenHand Infinity Human Guidance"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                />

                {/* Overlaid Floating Ethereal Script Labels matching Screenshot */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 sm:p-8">
                  {/* Top row */}
                  <div className="flex justify-between items-start">
                    <span className="font-serif italic text-white/95 text-xl sm:text-2xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] select-none">
                      People
                    </span>
                    <span className="font-serif italic text-white/95 text-xl sm:text-2xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] select-none">
                      Purpose
                    </span>
                  </div>

                  {/* Bottom row */}
                  <div className="flex justify-between items-end pb-12 sm:pb-16">
                    <span className="font-serif italic text-white/95 text-lg sm:text-xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] select-none">
                      Possibilities
                    </span>
                    <span className="font-serif italic text-white/95 text-lg sm:text-xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] select-none">
                      Together
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ── 4 Feature Pillars Row (Matching Screenshot) ── */}
        <div className="mx-auto max-w-7xl px-5 sm:px-8 mt-14 sm:mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: Heart,
                iconColor: "text-[#EC4899]",
                boxBg: "bg-[#FDF2F8]",
                title: "Human Impact",
                desc: "Real people. Real change.",
              },
              {
                icon: Cpu,
                iconColor: "text-[#2563EB]",
                boxBg: "bg-[#EFF6FF]",
                title: "Human + AI",
                desc: "Technology that amplifies human expertise.",
              },
              {
                icon: Briefcase,
                iconColor: "text-[#8B5CF6]",
                boxBg: "bg-[#F5F3FF]",
                title: "Flexible Work",
                desc: "Work that fits your life.",
              },
              {
                icon: TrendingUp,
                iconColor: "text-[#0284C7]",
                boxBg: "bg-[#F0F9FF]",
                title: "Growth",
                desc: "Learn. Build. Make a difference.",
              },
            ].map((pillar) => {
              const IconComponent = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3.5"
                >
                  <div className={`w-11 h-11 rounded-xl ${pillar.boxBg} ${pillar.iconColor} flex items-center justify-center shrink-0`}>
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A] leading-tight">{pillar.title}</h4>
                    <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug font-medium">{pillar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 2. OPEN POSITIONS SECTION (Exact 3-Card Layout & Colors from Screenshot) ── */}
      <section id="open-roles" className="py-16 sm:py-20 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          
          <div className="text-left mb-12">
            <span className="text-xs font-extrabold uppercase tracking-[2.5px] text-[#2563EB] block mb-2">
              Open Positions
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight text-[#0F172A]">
              Find your place at <span className="text-[#2563EB]">OpenHand.</span>
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#64748B] max-w-3xl">
              We're looking for people who care deeply about people, technology and creating meaningful experiences.
            </p>
          </div>

          {/* 3 Positions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {jobs.map((job) => {
              const Icon = job.icon;
              return (
                <div
                  key={job.id}
                  className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Level Pill & Icon Box */}
                    <div className="flex items-center justify-between mb-5">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider border ${job.badgeBg}`}>
                        {job.level}
                      </span>
                      <div className={`w-11 h-11 rounded-2xl ${job.iconBoxBg} flex items-center justify-center`}>
                        <Icon size={20} />
                      </div>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-xl sm:text-[22px] font-black text-[#0F172A] leading-snug">
                      {job.title}
                    </h3>

                    {/* Short Description */}
                    <p className="mt-3 text-xs sm:text-[13px] text-[#64748B] leading-relaxed">
                      {job.short}
                    </p>

                    {/* Meta Info (Location, Type, Experience) */}
                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-[#475569]">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#64748B] shrink-0" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-[#64748B] shrink-0" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock3 size={14} className="text-[#64748B] shrink-0" />
                        <span>{job.experience}</span>
                      </div>
                    </div>

                    {/* Skill Tags */}
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${job.tagBg}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Full-width Role Action Button */}
                  <div className="mt-8 pt-4">
                    <button
                      onClick={() => openApplication(job)}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full text-xs font-bold text-white shadow-md transition-all duration-200 ${job.btnBg}`}
                    >
                      <span>View Role & Apply</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 3. WHY OPENHAND SECTION (Dark Navy Theme with Cyan/Pink accents) ── */}
      <section className="bg-[#0A1026] text-white py-20 lg:py-28 relative overflow-hidden">
        {/* Glow ambient lights */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-14">
            <div className="lg:col-span-7">
              <span className="text-xs font-extrabold uppercase tracking-[2.5px] text-[#38BDF8] block mb-2.5">
                Why OpenHand
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight leading-tight">
                More than just a job. <br />
                <span className="text-[#38BDF8]">A chance </span>
                <span className="text-[#F472B6]">to make a real impact.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              At OpenHand, you will work at the intersection of people, technology and purpose.
              We are building a platform that helps people find the right guidance for every stage of life.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Target,
                color: "text-[#38BDF8]",
                bg: "bg-[#0369A1]/25 border border-[#38BDF8]/30",
                title: "Meaningful impact",
                desc: "Help people find guidance that can genuinely change their lives.",
              },
              {
                icon: Lightbulb,
                color: "text-[#FBBF24]",
                bg: "bg-[#B45309]/25 border border-[#FBBF24]/30",
                title: "AI + Human",
                desc: "Build technology that amplifies human expertise rather than replacing it.",
              },
              {
                icon: Users,
                color: "text-[#60A5FA]",
                bg: "bg-[#1D4ED8]/25 border border-[#60A5FA]/30",
                title: "Own Your Work",
                desc: "Small teams. Real ownership. Fast decisions. Your ideas matter.",
              },
              {
                icon: TrendingUp,
                color: "text-[#C084FC]",
                bg: "bg-[#7E22CE]/25 border border-[#C084FC]/30",
                title: "Grow With Us",
                desc: "Learn, take on challenges and shape a growing platform from the early stages.",
              },
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-[#111A38]/70 p-6 sm:p-7 backdrop-blur-sm hover:bg-[#162147] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-5`}>
                    <IconComp size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-normal">{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 4. HOW WE HIRE SECTION (4 Solid Colored Numbered Circles in Flow) ── */}
      <section className="py-20 lg:py-24 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-16">
            <div className="lg:col-span-7">
              <span className="text-xs font-extrabold uppercase tracking-[2.5px] text-[#2563EB] block mb-2">
                How We Hire
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight leading-tight">
                A simple, human <br className="hidden sm:inline" />
                and <span className="text-[#7C3AED]">transparent process.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 text-[#64748B] text-sm sm:text-base leading-relaxed">
              We believe in a straightforward and respectful hiring journey. Here's what to expect.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {[
              {
                step: "01",
                bg: "bg-[#2563EB]",
                title: "Apply",
                desc: "Submit your application and tell us what you can bring to OpenHand.",
              },
              {
                step: "02",
                bg: "bg-[#7C3AED]",
                title: "Meet",
                desc: "Have a conversation with our team.",
              },
              {
                step: "03",
                bg: "bg-[#EC4899]",
                title: "Explore",
                desc: "Discuss your skills and experience through a practical conversation.",
              },
              {
                step: "04",
                bg: "bg-[#0284C7]",
                title: "Join",
                desc: "If there is a fit, let's build the future of human guidance together.",
              },
            ].map((step, idx) => (
              <div key={step.step} className="flex flex-col items-center lg:items-start text-center lg:text-left relative">
                {/* Number circle */}
                <div className="relative mb-5 flex items-center justify-between w-full">
                  <div className={`w-14 h-14 rounded-full ${step.bg} text-white font-black text-base flex items-center justify-center shadow-lg shadow-blue-500/15`}>
                    {step.step}
                  </div>
                  {idx < 3 && (
                    <div className="hidden lg:block flex-1 h-[2px] bg-slate-200 mx-4 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-300 transform rotate-45" />
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] mb-1.5">{step.title}</h3>
                <p className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 5. APPLY NOW SECTION (Two-column with Team Photo & Application Form) ── */}
      <section ref={applyFormRef} id="apply-section" className="py-20 lg:py-28 bg-[#F8FAFF]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left Column: Team Banner & Copy */}
            <div className="lg:col-span-5">
              <span className="text-xs font-extrabold uppercase tracking-[2.5px] text-[#2563EB] block mb-2">
                Apply Now
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#0F172A] tracking-tight leading-tight">
                Take the next <br />
                step with <span className="text-[#7C3AED]">us.</span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#64748B] leading-relaxed">
                Share your details and let us know why you'd like to be part of OpenHand.
              </p>

              {/* Collaborative Team Photo Card with Laptop Banner from Screenshot */}
              <div className="mt-8 rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white relative group">
                <div className="h-64 sm:h-80 w-full overflow-hidden relative">
                  <img
                    src={teamJourneyImg}
                    alt="OpenHand Team Collaboration"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1536]/80 via-transparent to-transparent" />
                  
                  {/* Handwritten Badge on the Laptop Lid */}
                  <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 bg-[#0F172A]/85 backdrop-blur-md border border-white/20 px-5 py-4 rounded-2xl text-white shadow-2xl">
                    <p className="font-serif italic text-base sm:text-lg text-white font-bold leading-tight">
                      Great <br />
                      People <br />
                      Build <br />
                      Great <br />
                      <span className="text-[#38BDF8]">Journeys</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Application Form Card */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-10 shadow-lg relative">
                
                {/* Form Card Header */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0F172A]">Application Form</h3>
                      <p className="text-xs text-[#64748B]">
                        {formData.jobTitle ? `Applying for: ${formData.jobTitle}` : "General / Open Application"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">* Required fields</span>
                </div>

                {formSubmitted ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={36} />
                    </div>
                    <h4 className="text-2xl font-bold text-[#0F172A]">Application Received!</h4>
                    <p className="mt-2 text-sm text-[#64748B] max-w-md mx-auto">
                      Thank you for applying to OpenHand. Our talent team will review your profile and contact you if there is a match.
                    </p>
                    <button
                      onClick={() => {
                        setFormSubmitted(false);
                        setFormData({
                          fullName: "",
                          email: "",
                          phone: "",
                          city: "",
                          experience: "",
                          currentOrg: "",
                          linkedin: "",
                          expertise: "",
                          coverNote: "",
                          jobTitle: "",
                        });
                        setFileName("");
                      }}
                      className="mt-6 rounded-full bg-[#0F172A] px-7 py-3 text-xs font-bold text-white hover:bg-slate-800 transition"
                    >
                      Submit Another Application
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEmbeddedSubmit} className="space-y-4 sm:space-y-5">
                    
                    {/* Full Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="Your full name"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-purple-100 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="you@example.com"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-purple-100 transition"
                        />
                      </div>
                    </div>

                    {/* Phone Number & Current City */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-purple-100 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Current City
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Mumbai"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-purple-100 transition"
                        />
                      </div>
                    </div>

                    {/* Years of Experience & Current Organization */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Years of Experience *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          required
                          value={formData.experience}
                          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                          placeholder="e.g. 4"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-purple-100 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Current / Last Organisation
                        </label>
                        <input
                          type="text"
                          value={formData.currentOrg}
                          onChange={(e) => setFormData({ ...formData, currentOrg: e.target.value })}
                          placeholder="Company name"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-purple-100 transition"
                        />
                      </div>
                    </div>

                    {/* LinkedIn & Expertise Dropdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          LinkedIn Profile
                        </label>
                        <input
                          type="url"
                          value={formData.linkedin}
                          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                          placeholder="linkedin.com/in/yourname"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-purple-100 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Primary Area of Expertise *
                        </label>
                        <select
                          required
                          value={formData.expertise}
                          onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-purple-100 transition"
                        >
                          <option value="">Select expertise</option>
                          <option value="Community & Growth">Community & Growth</option>
                          <option value="Business Development">Business Development & Partnerships</option>
                          <option value="Practitioner Success">Practitioner Success</option>
                          <option value="Marketing">Growth Marketing</option>
                          <option value="Product">Product Management</option>
                          <option value="Technology">Technology & Engineering</option>
                          <option value="Operations">Operations</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Why OpenHand? */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Why OpenHand? *
                      </label>
                      <textarea
                        required
                        rows="3"
                        value={formData.coverNote}
                        onChange={(e) => setFormData({ ...formData, coverNote: e.target.value })}
                        placeholder="Tell us what excites you about OpenHand and what you can bring to the team..."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-purple-100 transition"
                      />
                    </div>

                    {/* Resume Upload Box */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Resume / CV *
                      </label>
                      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-[#FAF5FF] p-6 text-center transition hover:border-violet-400 hover:bg-[#F3E8FF]">
                        <Upload className="text-[#7C3AED] mb-2" size={24} />
                        <p className="text-xs font-bold text-[#0F172A]">
                          {fileName ? `Selected: ${fileName}` : "Click to upload your resume"}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">PDF, DOC or DOCX (Max 5 MB)</p>
                        <input
                          type="file"
                          name="resume"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Agreement Checkbox */}
                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        type="checkbox"
                        id="career-consent"
                        checked={agreeConsent}
                        onChange={(e) => setAgreeConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED] cursor-pointer"
                      />
                      <label htmlFor="career-consent" className="text-[11px] text-[#64748B] leading-normal cursor-pointer select-none">
                        I agree that OpenHand may use the information provided to evaluate my application and contact me regarding relevant opportunities.
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] py-3.5 px-6 font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 cursor-pointer"
                    >
                      <span>{submitting ? "Submitting Application..." : "Submit Application"}</span>
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>

                  </form>
                )}

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 6. STILL LOOKING? BANNER (Horizontal Pill Gradient matching Screenshot) ── */}
      <section className="px-5 sm:px-8 py-16">
        <div className="mx-auto max-w-7xl rounded-[32px] bg-gradient-to-r from-[#2563EB] via-[#6366F1] to-[#D946EF] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex items-center gap-5 z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-inner">
              <Send size={24} />
            </div>
            <div>
              <span className="text-[11px] font-mono tracking-widest text-cyan-200 uppercase block mb-1">
                Still Looking?
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Don't see the right role?
              </h3>
              <p className="text-xs sm:text-sm text-slate-100 mt-1 max-w-xl font-normal leading-relaxed">
                We are always interested in meeting exceptional people. Send us your profile and tell us how you could contribute to OpenHand.
              </p>
            </div>
          </div>

          <button
            onClick={() => scrollToApply(null)}
            className="shrink-0 z-10 rounded-full bg-white px-7 py-3.5 text-xs sm:text-sm font-bold text-[#0F172A] hover:bg-slate-100 shadow-xl hover:scale-105 transition-all duration-200 inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Send an Open Application</span>
            <ArrowRight size={15} />
          </button>

        </div>
      </section>

      {/* ── 7. APPLICATION MODAL ── */}
      {showApplication && (
        <ApplicationModal
          job={selectedJob}
          onClose={() => setShowApplication(false)}
        />
      )}

      {/* ── 8. VIDEO / STORY MODAL ── */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070b20]/80 px-4 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">Our Story</h3>
            <p className="text-xs text-slate-500 mb-6">
              Learn why OpenHand was created and how our human-first technology empowers practitioners and clients worldwide.
            </p>
            <div className="aspect-video w-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center text-white relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 to-purple-900/60" />
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-3 shadow-lg">
                <Play size={28} className="fill-white translate-x-0.5" />
              </div>
              <p className="relative z-10 text-sm font-bold">OpenHand Vision & Story</p>
              <p className="relative z-10 text-xs text-slate-300">Empowering Human Guidance with AURA</p>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowVideoModal(false)}
                className="rounded-full bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 9. OPENHAND FOOTER ── */}
      <OHFooter />

    </div>
  );
}

/**
 * Quick Apply Modal
 */
function ApplicationModal({ job, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [modalFile, setModalFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modalFile && !resumeName) {
      toast.error("Please upload your Resume / CV before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData(e.target);
      formData.append("jobTitle", job?.title || "General / Open Application");
      if (modalFile) {
        formData.append("resume", modalFile);
        formData.append("resumeName", modalFile.name);
      } else if (resumeName) {
        formData.append("resumeName", resumeName);
      }
      await submitCareerApplication(formData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070b20]/75 px-4 backdrop-blur-md">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 sm:p-10 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
            <CheckCircle2 size={42} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">Application Received!</h2>
          <p className="mt-3 text-sm text-[#64748B] leading-relaxed max-w-sm mx-auto">
            Thanks for your interest in OpenHand. Our talent team will review your profile and reach out if there is an alignment.
          </p>
          <button
            onClick={onClose}
            className="mt-8 rounded-full bg-[#0F172A] px-8 py-3 text-sm font-bold text-white hover:bg-[#7C3AED] transition-all duration-200 shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#070b20]/75 px-4 py-8 backdrop-blur-md flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 sm:px-8 py-5 bg-slate-50/60">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#7C3AED]">
              OpenHand Careers
            </p>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-black text-[#0F172A]">
              {job?.title || "Open Application"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-200/60 p-2 text-slate-600 hover:bg-slate-200 transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Job Details preview (if specific job) */}
        {job && (
          <div className="px-6 sm:px-8 py-4 bg-violet-50/40 border-b border-violet-100 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-slate-600 font-semibold mb-2">
              <span className="flex items-center gap-1.5"><MapPin size={13} className="text-[#7C3AED]" /> {job.location}</span>
              <span className="flex items-center gap-1.5"><Clock3 size={13} className="text-[#7C3AED]" /> {job.type}</span>
              <span className="flex items-center gap-1.5"><Briefcase size={13} className="text-[#7C3AED]" /> {job.experience}</span>
            </div>
            <p className="text-slate-600 font-normal leading-relaxed">{job.short}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          
          {/* Section: Personal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">About You</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" name="fullName" placeholder="Your full name" required />
              <Input label="Email" name="email" type="email" placeholder="you@example.com" required />
              <Input label="Phone Number" name="phone" type="tel" placeholder="+91 98765 43210" required />
              <Input label="Current City" name="city" placeholder="Mumbai" />
            </div>
          </div>

          {/* Section: Professional */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Professional Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Years of Experience" name="experience" type="number" min="0" step="0.5" placeholder="e.g. 4" required />
              <Input label="Current / Last Organisation" name="currentOrg" placeholder="Company name" />
              <Input label="LinkedIn Profile" name="linkedin" placeholder="linkedin.com/in/yourname" />
              <Input label="Portfolio / Website" name="portfolio" placeholder="https://..." />
            </div>
          </div>

          {/* Expertise Dropdown */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Primary area of expertise *</label>
            <select
              name="expertise"
              required
              defaultValue={
                job?.id === "junior"
                  ? "Practitioner Success"
                  : job?.id === "mid"
                  ? "Community & Growth"
                  : job?.id === "senior"
                  ? "Business Development & Partnerships"
                  : ""
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-purple-100 transition"
            >
              <option value="">Select expertise</option>
              <option value="Community & Growth">Community & Growth</option>
              <option value="Business Development & Partnerships">Business Development & Partnerships</option>
              <option value="Growth Marketing">Growth Marketing</option>
              <option value="Practitioner Success">Practitioner Success</option>
              <option value="Product Management">Product Management</option>
              <option value="Technology & Engineering">Technology & Engineering</option>
              <option value="Operations">Operations</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Cover Note */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Why OpenHand? *</label>
            <textarea
              name="coverNote"
              required
              rows="3"
              placeholder="Tell us what excites you about OpenHand and what you can bring to the team..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-purple-100 transition"
            />
          </div>

          {/* Resume Upload */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Resume / CV *</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-[#FAF5FF] p-6 text-center transition hover:border-violet-400 hover:bg-[#F3E8FF]">
              <Upload className="text-[#7C3AED] mb-2" size={24} />
              <p className="text-xs font-bold text-[#0F172A]">
                {resumeName ? `Selected: ${resumeName}` : "Upload your resume"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">PDF, DOC or DOCX · Max 5 MB</p>
              <input
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const f = e.target.files[0];
                    setResumeName(f.name);
                    setModalFile(f);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Agreement Notice */}
          <div className="rounded-xl bg-slate-50 p-3.5 text-[11px] leading-relaxed text-slate-500">
            By submitting this application, you agree that OpenHand may use the information provided to evaluate your application and contact you regarding relevant opportunities.
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] py-3.5 px-6 font-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 cursor-pointer text-sm"
          >
            <span>{submitting ? "Submitting Application..." : "Submit Application"}</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>

        </form>

      </div>
    </div>
  );
}

/**
 * Reusable Input Component
 */
function Input({ label, name, type = "text", placeholder, required = false, min, step, value, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-slate-700">{label} {required && "*"}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-purple-100"
      />
    </div>
  );
}
