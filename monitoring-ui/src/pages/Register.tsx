import { useState } from "react";
import { useRegisterMutation, useVerifyUserMutation } from "../features/api/apiSlice";
import Image from "../assets/image.png";
import Logo from "../assets/logo.png";
import GoogleSvg from "../assets/icons8-google.svg";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import { toast, ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [ showPassword, setShowPassword ] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [step, setStep] = useState<"register" | "verify">("register");
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));

  const [register, { isLoading, error }] = useRegisterMutation();
  const [verifyUser, { isLoading: isVerifying }] = useVerifyUserMutation();

  const handleRegister = async () => {
    try {
      const res = await register({
        email,
        password,
        username,
      }).unwrap();

      console.log("Register Success:", res);
      toast.success("User registered! Check Network tab");
      setStep("verify");
    } catch (err) {
      console.error("Register Error:", err);
      toast.error(err?.data?.message ||"Registration failed");
    }
  };

  const handleVerify = async () => {
    const verificationCode = otp.join("");
    if (verificationCode.length < 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }
    try {
      await verifyUser({ email, verificationCode }).unwrap();
      toast.success("Email verified! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      toast.error(err?.data?.message || "Invalid code. Please try again.");
    }
  };

    return (
    <div className="register-main">
      <div className="register-left">
        <img src={Image} alt="" />
      </div>
      <div className="register-right">
        <div className="register-right-container">
          <div className="register-logo">
            <img src={Logo} alt="" />
          </div>
          {step === "register" ? (     
            <div className="register-center">
              <h2>Welcome to Cloud Monitoring!</h2>
              <p>Please enter your details</p>
              <form>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
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

                <div className="register-center-buttons">
                  <button 
                    type="button" 
                    onClick={handleRegister}
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing up..." : "Sign Up"}
                  </button>
                  <button type="button">
                    <img src={GoogleSvg} alt="" />
                    Sign Up with Google
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="register-center">
              <h2>Email Verification</h2>
              <p>Enter the 6-digit code sent to your email.</p>
              <div className="otp-inputs">
                <input
                  className="verification-input"
                  type="number"
                  placeholder="Enter verification code"
                  value={otp.join("")}
                  onChange={(e) => setOtp(e.target.value.split("").slice(0, 6))}
                />
                <div className="register-center-buttons">
                  <button 
                    className="verify-button"
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerifying}
                  >
                    {isVerifying ? "Verifying..." : "Verify"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="register-bottom-p">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Register;