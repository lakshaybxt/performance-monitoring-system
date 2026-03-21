import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { useGetAlertsQuery, useGetMetricsQuery } from "../features/api/monitoringSlice";
import "./MonitoringPage.css";

const TIME_RANGES = [
  { label: "5m",  value: 5 },
  { label: "15m", value: 15 },
  { label: "30m", value: 30 },
  { label: "1h",  value: 60 },
  { label: "3h",  value: 180 },
];

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "#e5534b",
  HIGH:     "#d4a017",
  MEDIUM:   "#7da3e0",
  LOW:      "#57ab5a",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function StatCard({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: color || "#ececec" }}>
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const color = SEVERITY_COLOR[severity] || "#7a7a7a";
  return (
    <span className="severity-badge" style={{ color, borderColor: color, background: color + "18" }}>
      {severity}
    </span>
  );
}

export default function MonitoringPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [minutes, setMinutes] = useState(15);
  const [alertPage, setAlertPage] = useState(0);
  const ALERT_LIMIT = 10;

  // Metrics now needs minutes param too
  const { data: metrics = [], isLoading: metricsLoading, isError: metricsError, refetch: refetchMetrics } =
    useGetMetricsQuery({ applicationId: applicationId!, minutes });
  // Alerts
  const { data: alerts = [], isLoading: alertsLoading, refetch: refetchAlerts } =
    useGetAlertsQuery({ applicationId: applicationId!, limit: 50, offset: alertPage * ALERT_LIMIT });

  console.log("Metrics: ", metrics);
  console.log("Alerts: ", alerts);

  const chartData = [...metrics]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((m) => ({
      time:         formatTime(m.createdAt),
      cpu:          +m.cpuUsage.toFixed(1),
      memory:       +(m.memoryUsage / 1024 / 1024).toFixed(1), 
      responseTime: +m.responseTime.toFixed(1),
      threads:      m.threadCount,
    }));

  const latest = chartData[chartData.length - 1];

  const unresolvedCount = alerts.filter((a) => !a.resolved).length;
  const criticalCount   = alerts.filter((a) => a.severity === "CRITICAL" && !a.resolved).length;

  const pagedAlerts = alerts.slice(alertPage * ALERT_LIMIT, (alertPage + 1) * ALERT_LIMIT);
  const totalPages  = Math.ceil(alerts.length / ALERT_LIMIT);

  return (
    <div className="monitor-page">
      {/* Header */}
      <div className="monitor-header">
        <div className="monitor-header-left">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ← Back
          </button>
          <div>
            <h1 className="monitor-title">Application Monitoring</h1>
            <p className="monitor-sub">ID: {applicationId}</p>
          </div>
        </div>
        <div className="monitor-header-right">
          <div className="time-range-group">
            {TIME_RANGES.map((r) => (
              <button
                key={r.value}
                className={`range-btn ${minutes === r.value ? "active" : ""}`}
                onClick={() => setMinutes(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            className="refresh-btn"
            onClick={() => { refetchMetrics(); refetchAlerts(); }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard label="CPU Usage"     value={latest?.cpu      ?? "—"} unit="%" color={latest?.cpu > 80 ? "#e5534b" : "#57ab5a"} />
        <StatCard label="Memory Usage"  value={latest?.memory   ?? "—"} unit="MB" color={latest?.memory > 512 ? "#e5534b" : "#7da3e0"} />
        <StatCard label="Response Time" value={latest?.responseTime ?? "—"} unit="ms" />
        <StatCard label="Thread Count"  value={latest?.threads  ?? "—"} />
        <StatCard label="Active Alerts" value={unresolvedCount}          color={unresolvedCount > 0 ? "#d4a017" : "#57ab5a"} />
        <StatCard label="Critical"      value={criticalCount}            color={criticalCount > 0 ? "#e5534b" : "#57ab5a"} />
      </div>

      {metricsLoading && <div className="loading-bar">Loading metrics...</div>}
      {metricsError   && <div className="error-bar">Failed to load metrics. Check your connection.</div>}

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="charts-grid">
          {/* CPU + Memory */}
          <div className="chart-card">
            <div className="chart-title">CPU & Memory Usage</div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3d63dd" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3d63dd" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#57ab5a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#57ab5a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
                <XAxis dataKey="time" tick={{ fill: "#5a5a5a", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#5a5a5a", fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ background: "#262626", border: "1px solid #3e3e3e", borderRadius: 8, color: "#ececec", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#a0a0a0" }} />
                <Area type="monotone" dataKey="cpu"    name="CPU %"    stroke="#3d63dd" fill="url(#cpuGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="memory" name="Memory %" stroke="#57ab5a" fill="url(#memGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Response Time */}
          <div className="chart-card">
            <div className="chart-title">Response Time</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
                <XAxis dataKey="time" tick={{ fill: "#5a5a5a", fontSize: 11 }} />
                <YAxis tick={{ fill: "#5a5a5a", fontSize: 11 }} unit="ms" />
                <Tooltip contentStyle={{ background: "#262626", border: "1px solid #3e3e3e", borderRadius: 8, color: "#ececec", fontSize: 12 }} />
                <Line type="monotone" dataKey="responseTime" name="Response Time" stroke="#d4a017" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Thread Count */}
          <div className="chart-card">
            <div className="chart-title">Thread Count</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
                <XAxis dataKey="time" tick={{ fill: "#5a5a5a", fontSize: 11 }} />
                <YAxis tick={{ fill: "#5a5a5a", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#262626", border: "1px solid #3e3e3e", borderRadius: 8, color: "#ececec", fontSize: 12 }} />
                <Line type="monotone" dataKey="threads" name="Threads" stroke="#9d8fd4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Alerts */}
      <div className="alerts-section">
        <div className="section-header">
          <div className="monitor-title" style={{ fontSize: 15 }}>
            Alerts
            {unresolvedCount > 0 && (
              <span className="alert-count-badge">{unresolvedCount} unresolved</span>
            )}
          </div>
        </div>

        {alertsLoading && <div className="loading-bar">Loading alerts...</div>}

        {!alertsLoading && alerts.length === 0 && (
          <div className="empty-state">No alerts found for this application.</div>
        )}

        {pagedAlerts.map((alert, i) => (
          <div key={i} className={`alert-card ${alert.resolved ? "resolved" : ""}`}>
            <div className="alert-left">
              <SeverityBadge severity={alert.severity} />
              <div>
                <div className="alert-type">{alert.alertType}</div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-time">{formatTime(alert.createdAt)}</div>
              </div>
            </div>
            <div className={`alert-status ${alert.resolved ? "ok" : "open"}`}>
              {alert.resolved ? "Resolved" : "Open"}
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={alertPage === 0}
              onClick={() => setAlertPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span className="page-info">{alertPage + 1} / {totalPages}</span>
            <button
              className="page-btn"
              disabled={alertPage >= totalPages - 1}
              onClick={() => setAlertPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
