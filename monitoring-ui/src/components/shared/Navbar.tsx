import "./Navbar.css";
import { getInitials } from "../../utils/stringUtils";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../../features/auth/authSlice";

type NavbarProps = {
  username: string | undefined;
  isAuthenticated: boolean
};

const Navbar = ({ username, isAuthenticated }: NavbarProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate("/login");
  };
  
  return (
      <nav className="nav">
        <div className="nav-logo">
          <div className="logo-dot">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="4" fill="#E6F1FB" />
              <circle cx="8" cy="8" r="2" fill="white" />
            </svg>
          </div>
          CloudMonitor
        </div>
        {isAuthenticated ? (
          
        <div className="nav-right">
          <div className="avatar">{getInitials(username)}</div>
          <button 
            className="logout-btn"
            onClick={handleLogout}
           >
            Logout
           </button>
        </div>
        ) : (  
        
        <div className="home-nav-btns">
          <button className="home-btn-ghost" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="home-btn-solid" onClick={() => navigate("/register")}>
            Get started
          </button>
        </div>
        )}
        
      </nav>
      
  );
}

export default Navbar;