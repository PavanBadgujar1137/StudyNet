import signupImg from "../assets/Images/signup.jpeg"
import Template from "../components/core/Auth/Template"

function Signup() {
  return (
    <Template
      title="Start Your Learning Journey Today"
      description1="Create your free account and access expert-led courses, hands-on projects, and personalized learning."
      description2="Learn new skills, earn certificates, and build your future at your own pace."
      image={signupImg}
      formType="signup"
    />
  )
}

export default Signup