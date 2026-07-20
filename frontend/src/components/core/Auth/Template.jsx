import { useSelector } from "react-redux"
import logoIcon from "../../../assets/Logo/Logo-Icon.png"
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"

function Template({ title, description1, description2, formType }) {
  const { loading } = useSelector((state) => state.auth)

  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-paper relative overflow-hidden py-12">
      {/* Background glow animations */}
      <div className="absolute top-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-royal-blue/5 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-violet/5 blur-[120px] pointer-events-none animate-pulse"></div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col-reverse justify-between gap-y-12 md:flex-row-reverse md:gap-y-0 md:gap-x-16 items-center z-10">
          {/* Form container */}
          <div className="mx-auto w-11/12 max-w-[480px] md:mx-0 flex flex-col justify-center bg-white/40 border border-white/50 backdrop-blur-md p-8 sm:p-10 rounded-[32px] shadow-xl">
            <h1 className="text-[2rem] font-bold leading-[2.5rem] text-navy font-fraunces">
              {title}
            </h1>
            <p className="mt-4 text-[1.05rem] leading-[1.625rem]">
              <span className="text-ink-soft">{description1}</span>{" "}
              <span className="font-fraunces font-bold italic text-royal-blue">
                {description2}
              </span>
            </p>
            <div className="mt-8">
              {formType === "signup" ? <SignupForm /> : <LoginForm />}
            </div>
          </div>
          
          {/* Premium CSS-based Glassmorphic Graphics Panel */}
          <div className="relative mx-auto w-11/12 max-w-[450px] md:mx-0 flex items-center justify-center animate-float">
            <div className="w-full aspect-square rounded-[32px] bg-white/70 border border-white/60 flex flex-col justify-between p-10 relative overflow-hidden shadow-2xl">
              {/* Decorative backgrounds */}
              <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-royal-blue/5 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-violet/5 blur-2xl"></div>

              <div className="flex justify-between items-center w-full">
                <span className="text-[11px] font-bold uppercase tracking-wider text-royal-blue bg-royal-blue/10 border border-royal-blue/20 px-3.5 py-1.5 rounded-full">
                  Educational &amp; Practice Platform
                </span>
                <span className="text-xs font-semibold text-ink-soft">openhand.live</span>
              </div>

              <div className="flex flex-col items-center justify-center my-auto py-8">
                <div className="flex flex-col items-center justify-center gap-3">
                  <img 
                    src={logoIcon} 
                    alt="OpenHand Logo" 
                    className="h-20 w-auto object-contain" 
                  />
                  <span className="text-3xl font-extrabold tracking-tight text-navy">
                    Open<span className="text-royal-blue">Hand</span>
                  </span>
                </div>
              </div>

              <div className="border-t border-line/60 pt-8">
                <p className="italic text-xl text-navy text-center leading-relaxed font-semibold">
                  "Education for a Future-Proof Career"
                </p>
                <p className="text-xs text-center text-ink-soft mt-2.5">
                  The online platform built for students &amp; instructors.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Template
