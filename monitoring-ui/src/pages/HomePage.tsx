
import "./HomePage.css";
import type { RootState } from "../app/store";
import { useSelector } from "react-redux";
import Navbar from "../components/shared/Navbar";
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import SetupGuide from "../components/home/SetupGuide";
import Footer from "../components/home/Footer";

export default function HomePage() {
  const username = useSelector((state: RootState) => state?.auth?.userInfo?.username);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <div className="home-page">
      {/* Navbar */}
      <Navbar username={username} isAuthenticated={isAuthenticated}/>

      {/* Hero */}
      <Hero />

      {/* Features */}
      <Features />

      {/* Setup Guide */}
      <SetupGuide />

      {/* Footer */}
      <Footer />
    </div>
  );
}
