import "./Illustration.css";

const Illustration = ({ apps }: { apps: any[] }) => {
  return (    
    <div className="card illus-card">
      <div className="screen">
        <div className="screen-bar">
          <div className="screen-dot red" />
          <div className="screen-dot amber" />
          <div className="screen-dot green" />
        </div>
        <div className="screen-label">System overview</div>
        <div className="mini-chart">
          {[28, 38, 44, 32, 48, 36, 42, 30, 38, 46].map((h, i) => (
            <div
              key={i}
              className={`bar ${h > 40 ? "hi" : ""}`}
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
        <div className="metrics-row">
          <div className="metric-mini">
            <div className="metric-val">99.9%</div>
            <div className="metric-lbl">Uptime</div>
          </div>
          <div className="metric-mini">
            <div className="metric-val">12ms</div>
            <div className="metric-lbl">Latency</div>
          </div>
          <div className="metric-mini">
            <div className="metric-val">{apps.length}</div>
            <div className="metric-lbl">Apps</div>
          </div>
        </div>
      </div>
      <div className="badges">
        <span className="badge badge-blue">SSL secured</span>
        <span className="badge badge-purple">https://api.example.com</span>
        <span className="badge badge-green">
          <span className="status-dot" />
          Live monitoring
        </span>
      </div>
    </div>
  );
}

export default Illustration;