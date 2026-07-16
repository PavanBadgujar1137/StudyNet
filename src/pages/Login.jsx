import loginImg from "../assets/Images/login.webp"
import Template from "../components/core/Auth/Template"

function Login() {
  return (
    <Template
      title="Welcome Back to Openhand"
      description1="Access your practice space, cohorts, and circles."
      description2="The practice platform built for people who guide."
      image={loginImg}
      formType="login"
    />
  )
}

export default Login
