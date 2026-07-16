import signupImg from "../assets/Images/signup.webp"
import Template from "../components/core/Auth/Template"

function Signup() {
  return (
    <Template
      title="Start your free Openhand practice space"
      description1="Hold space for your clients, build private cohorts, and foster real community."
      description2="The practice platform built for people who guide."
      image={signupImg}
      formType="signup"
    />
  )
}

export default Signup
