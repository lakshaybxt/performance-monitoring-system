import "./FeatureCard.css";

interface FeatureCardProps {
  iconBg: string;
  iconSvg: JSX.Element;
  title: string;
  description: string;
}

export default function FeatureCard({ iconBg, iconSvg, title, description }: FeatureCardProps) {
  return (
    <div className="home-feat-card">
      <div className="home-feat-icon" style={{ background: iconBg }}>
        {iconSvg}
      </div>
      <div className="home-feat-title">{title}</div>
      <div className="home-feat-desc">{description}</div>
    </div>
  );
}