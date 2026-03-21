import { useState } from "react";
import "./Dashboard.css";
import Navbar from "../components/shared/Navbar";
import TopSection from "../components/dashboard/TopSection/TopSection";
import Application from "../components/dashboard/BottomSection/Application";
import type { RootState } from "../app/store";
import { useSelector } from "react-redux";
import { useGetUserApplicationQuery, useRegisterApplicationMutation, useDeleteApplicationMutation } from "../features/api/apiSlice";
import { toast, ToastContainer } from "react-toastify";

type Application = {
  name: string;
  baseUrl: string;
  userId: string;
  email: string;
};

const Dashboard = () => {
  const [appName, setAppName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [urlError, setUrlError] = useState("");
  const username = useSelector((state: RootState) => state?.auth?.userInfo?.username);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const { data } = useGetUserApplicationQuery();
  const [registerApplication] = useRegisterApplicationMutation();
  const [deleteApplication] = useDeleteApplicationMutation();
  console.log(data);

  const apps = data || [];

  const handleRegister = async() => {
    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      setUrlError("Must start with http:// or https://");
      toast.error("Must start with http:// or https://")
      return;
    }
    setUrlError("");

    try {
      await registerApplication({
        name: appName,
        baseUrl: baseUrl,
        email: contactEmail,
      }).unwrap();

      toast.success("Application registered successfully");

      setAppName("");
      setBaseUrl("");
      setContactEmail("");
    } catch {
      toast.error("Failed to register application");
    }
};

  const handleDelete = async (id: string) => {
    await deleteApplication(id);
  };


  return (
    <div className="dash">
      {/* Navbar */}
      <Navbar username={username} isAuthenticated={isAuthenticated}/>

      {/* Top grid: Form + Illustration */}
      <TopSection
        form={{
          appName,
          setAppName,
          baseUrl,
          setBaseUrl,
          contactEmail,
          setContactEmail,
          urlError,
          setUrlError,
        }}
        handleRegister={handleRegister}
        apps={apps}
      />

      {/* Applications List */}
      <Application apps={apps} handleDelete={handleDelete} />


        <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Dashboard;
