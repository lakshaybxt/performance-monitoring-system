import type { RootState } from "../../app/store";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};


const ProtectedRoute = ({ children }: Props)=> {
  const isAuth = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;