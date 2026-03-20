import { useSelector } from "react-redux";
export const Home = () => {

  const token = useSelector((state: any) => state.auth.token);
  const userInfo = useSelector((state: any) => state.auth.userInfo)

  return (
    <div>
      <h1>Welcome to the Home Page!</h1>  
      <p>This is a protected route. You should only see this if you're logged in.</p>
      <p><strong>Token:</strong> {token}</p>
      <p><strong>User Info:</strong> {JSON.stringify(userInfo)}</p>
    </div>
  );
}