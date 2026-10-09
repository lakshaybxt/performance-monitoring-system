import "./Features.css";
import FeatureCard from "./FeatureCard";

export default function Features() {
  return (
    <div className="home-features">
      <FeatureCard
        iconBg="#1e2a42"
        color="#7da3e0"
        title="Live metrics"
        description="Track CPU, memory, response time and thread count in real time with auto-refreshing charts."
      />

      <FeatureCard
        iconBg="#1a2a1e"
        color="#57ab5a"
        title="Health checks"
        description="Automatic uptime monitoring via Spring Actuator endpoints with instant alert notifications."
      />

      <FeatureCard
        iconBg="#2a1f0e"
        color="#d4a017"
        title="Smart alerts"
        description="Get notified on critical, high, medium and low severity events with full context and resolution tracking."
      />
    </div>
  );
}