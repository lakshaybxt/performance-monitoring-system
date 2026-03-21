import { useEffect, useState } from "react";
import { useLoginMutation } from "../features/api/apiSlice";
import { setAuthSession } from "../features/auth/authSlice";
import Image from "../assets/image.png";
import Logo from "../assets/logo.png";
import GoogleSvg from "../assets/icons8-google.svg";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import { toast, ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import "./Login.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [ showPassword, setShowPassword ] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, isSuccess, data }] = useLoginMutation();

  const handleLogin = async () => {
    try {
      const res = await login({
        email,
        password,
      }).unwrap();

      console.log("Login Success:", res);
      toast.success("Logged in successfully!");
    } catch (err) {
      console.error("Login Error:", err);
      toast.error(err?.data?.message || "Login failed. Please try again.");
    }
  };

  useEffect(() => {
    if(isSuccess && data) {
      dispatch(setAuthSession(data));
      toast.success("Logged in successfully!");
      navigate("/home");
    }
  }, [isSuccess, data, navigate, dispatch])

  
  return (
    <div className="login-main">
      <div className="login-left">
        <img src={Image} alt="" />
      </div>
      <div className="login-right">
        <div className="login-right-container">
          <div className="login-logo">
            <img src={Logo} alt="" />
          </div>
          <div className="login-center">
            <h2>Welcome back!</h2>
            <p>Please enter your details</p>
            <form>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="pass-input-div">

                <input
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {showPassword ? <FaEyeSlash onClick={() => {setShowPassword(!showPassword)}} /> : <FaEye onClick={() => {setShowPassword(!showPassword)}} />}
                
              </div>

              <div className="login-center-options">
                <div className="remember-div">
                  <input type="checkbox" id="remember-checkbox" />
                  <label htmlFor="remember-checkbox">
                    Remember for 30 days
                  </label>
                </div>
                <a href="#" className="forgot-pass-link">
                  Forgot password?
                </a>
              </div>
              <div className="login-center-buttons">
                <button 
                  type="button" 
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  Log In
                </button>
                <button type="button">
                  <img src={GoogleSvg} alt="" />
                  Log In with Google
                </button>
              </div>
            </form>
          </div>

          <p className="login-bottom-p">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
      
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Login;
