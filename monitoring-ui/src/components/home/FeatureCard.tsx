import "./FeatureCard.css";

interface FeatureCardProps {
  iconBg: string;
  color?: string;
  title: string;
  description: string;
}

export default function FeatureCard({ iconBg, color, title, description }: FeatureCardProps) {
  return (
    <div className="home-feat-card">
      <div className="home-feat-icon" style={{ background: iconBg }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
      </div>
      <div className="home-feat-title">{title}</div>
      <div className="home-feat-desc">{description}</div>
    </div>
  );
}