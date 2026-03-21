import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register'
import Dashboard from "./pages/Dashboard";
import MonitoringPage from "./pages/MonitoringPage"
import { useSelector } from "react-redux";
import type { RootState } from "./app/store";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import HomePage from "./pages/HomePage";

function App() {
  const isAuth = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route
          path="/"
          element={
            isAuth ? <Navigate to="/home" /> : <Navigate to="/home" />
          }
        /> */}
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            isAuth ? <Navigate to="/" /> : <Login />
          }
        />
        <Route path="/register" element={<Register />} />
         <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/monitor/:applicationId" element={<MonitoringPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
