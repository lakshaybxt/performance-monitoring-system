import { getInitials } from "../../../utils/stringUtils";
import { useNavigate } from "react-router-dom";
import "./Application.css";

type App = {
  name: string;
  baseUrl: string;
  id: string;
  email: string;
};

type ApplicationProps = {
  apps: App[];
  handleDelete: (id: string) => void;
};

const Application = ({ apps, handleDelete }: ApplicationProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="section">
      <div className="section-header">
        <h3 className="section-title">Your applications</h3>
        <div className="section-actions">
          <button className="btn-sm primary">View all</button>
          <button className="btn-sm">Refresh</button>
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="empty-state">No applications registered yet.</div>
      ) : (
        apps.map((app) => (
          <div key={app.id} className="app-card">
            <div className="app-info" onClick={() => navigate(`/monitor/${app.id}`)}>
              <div className="app-icon">{getInitials(app.name)}</div>
              <div>
                <div className="app-name">{app.name}</div>
                <div className="app-url">{app.baseUrl}</div>
                <div className="app-meta">
                  {app.email}&nbsp;·&nbsp;{app.id}
                </div>
              </div>
            </div>
            <button className="btn-delete" onClick={() => handleDelete(app.id)}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Application;