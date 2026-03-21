import FormSection from "./FormSection";
import Illustration from "./Illustration";
import "./TopSection.css"

type TopSectionProps = {
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
  apps: any[];
};


const TopSection = ({ form, handleRegister, apps }: TopSectionProps) => {
  return (
    <div className="main-grid">
      {/* Register Form */}
      <FormSection 
        form={form}
        handleRegister={handleRegister}
      />

      {/* Illustration Panel */}
      <Illustration apps={apps} />
    </div>
  );
}

export default TopSection;