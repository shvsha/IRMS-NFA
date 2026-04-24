import { Navigate } from "react-router-dom";

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('access_token');
  const user  = getUser();

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    return <Navigate to="/" replace />;
  }

  // role check
  if (allowedRoles && !allowedRoles.includes(user?.user_level)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}