import "./Features.css";
import FeatureCard from "./FeatureCard";

export default function Features() {
  return (
    <div className="home-features">
      <FeatureCard
        iconBg="#1e2a42"
        iconSvg={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7da3e0" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        }
        title="Live metrics"
        description="Track CPU, memory, response time and thread count in real time with auto-refreshing charts."
      />

      <FeatureCard
        iconBg="#1a2a1e"
        iconSvg={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#57ab5a" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        }
        title="Health checks"
        description="Automatic uptime monitoring via Spring Actuator endpoints with instant alert notifications."
      />

      <FeatureCard
        iconBg="#2a1f0e"
        iconSvg={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4a017" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        }
        title="Smart alerts"
        description="Get notified on critical, high, medium and low severity events with full context and resolution tracking."
      />
    </div>
  );
}