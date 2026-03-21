import "./FormSection.css"

type FormSectionProps = {
  form: {
    appName: string;
    setAppName: React.Dispatch<React.SetStateAction<string>>;
    baseUrl: string;
    setBaseUrl: React.Dispatch<React.SetStateAction<string>>;
    contactEmail: string;
    setContactEmail: React.Dispatch<React.SetStateAction<string>>;
    urlError: string;
    setUrlError: React.Dispatch<React.SetStateAction<string>>;
  };
  handleRegister: () => void;
};

const FormSection = ( { form, handleRegister }: FormSectionProps ) => {
  const { appName, setAppName, baseUrl, setBaseUrl, contactEmail, setContactEmail, urlError, setUrlError } = form;
  return (
    <div className="card">
      <h2 className="card-title">Register new application</h2>
      <p className="card-sub">Connect your app to start monitoring</p>

      <div className="field-group">
        <label className="field-label">Application name</label>
        <input
          className="field-input"
          type="text"
          placeholder="Enter application name"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
        />
      </div>

      <div className="field-group">
        <label className="field-label">Base URL</label>
        <input
          className={`field-input ${urlError ? "field-input-error" : ""}`}
          type="text"
          placeholder="https://your-app-url.com"
          value={baseUrl}
          onChange={(e) => { setBaseUrl(e.target.value); setUrlError(""); }}
        />
        {urlError
          ? <div className="field-hint error">{urlError}</div>
          : <div className="field-hint">Must start with http:// or https://</div>
        }
      </div>

      <div className="field-group">
        <label className="field-label">Contact email</label>
        <input
          className="field-input"
          type="email"
          placeholder="Enter email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button className="btn-primary" onClick={handleRegister}>
          Register application
        </button>
        <button
          className="btn-secondary"
          onClick={() => { setAppName(""); setBaseUrl(""); setContactEmail(""); setUrlError(""); }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default FormSection;