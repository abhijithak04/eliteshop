import { Navigate, Outlet } from "react-router-dom";

const RequireAuth = () => {

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  return userInfo
    ? <Outlet />
    : <Navigate to="/login" replace />;
};

export default RequireAuth;