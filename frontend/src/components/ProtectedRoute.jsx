import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

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
    return JSON.parse(sessionStorage.getItem('user'));
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = sessionStorage.getItem('access_token');
  const user  = getUser();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = sessionStorage.getItem('access_token');
      if (!t || isTokenExpired(t)) {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user');
        setExpired(true);
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, []);
  
  if (expired || !token || isTokenExpired(token)) {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    return <Navigate to="/" replace />;
  }

  // role check
  if (allowedRoles && !allowedRoles.includes(user?.user_level)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}