import { useNavigate } from "react-router-dom";
import "./Hero.css"

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="home-hero">
      <div className="home-hero-badge">
        <div className="home-live-dot" />
        Real-time application monitoring
      </div>
      <h1 className="home-hero-title">
        Monitor your apps.<br />
        <span>Stay ahead of issues.</span>
      </h1>
      <p className="home-hero-sub">
        Connect your Spring Boot applications and get instant visibility into CPU, memory,
        response times, threads, and alerts — all in one place.
      </p>
      <div className="home-hero-btns">
        <button className="home-btn-lg home-btn-lg-primary" onClick={() => navigate("/register")}>
          Get started free
        </button>
        <button className="home-btn-lg home-btn-lg-ghost" onClick={() => navigate("/dashboard")}>
          View dashboard
        </button>
      </div>
    </div>
  );
}

export default Hero;