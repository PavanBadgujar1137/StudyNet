import loginImg from "../assets/Images/login.jpeg";
import Template from "../components/core/Auth/Template";

function Login() {
  return (
    <Template
      title="Welcome Back!"
      description1="Continue your learning journey and pick up where you left off."
      description2="Access your courses, track your progress, and build new skills every day."
      image={loginImg}
      formType="login"
    />
  );
}

export default Login;