import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, NavLink, useNavigate, Navigate } from "react-router-dom";
import "./index.css";

import AuthService from "./services/auth.service";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Profile from "./components/Profile";
import UserList from "./components/UserList";

// Protected route wrapper
const ProtectedRoute = ({ children, currentUser }) => {
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  // const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) setCurrentUser(user);

    // Listen for 401 unauthorized events
    const handleUnauthorized = () => logOut();
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []); // eslint-disable-line

  const logOut = useCallback(async () => {
    await AuthService.logout(currentUser?.user_id);
    setCurrentUser(undefined);
    navigate("/login");
  }, [currentUser, navigate]);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? "var(--accent)" : "var(--muted)",
    textDecoration: "none",
    fontSize: "0.9rem",
    padding: "0.4rem 0.75rem",
    borderRadius: "var(--radius-sm)",
    transition: "color 0.2s",
    fontFamily: "var(--font-body)"
  });

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: 1200, margin: "0 auto", padding: "12px" }}>
          {/* Brand */}
          <Link to="/" className="navbar-brand" style={{ textDecoration: "none" }}>
            UserModule
          </Link>

          {/* Desktop nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <NavLink to="/" className="nav-link" style={navLinkStyle} end>Home</NavLink>

            {currentUser && (
              <NavLink to="/users" className="nav-link" style={navLinkStyle}>Directory</NavLink>
            )}

            {currentUser ? (
              <>
                <NavLink to="/profile" className="nav-link" style={navLinkStyle}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,var(--accent),var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700 }}>
                      {currentUser.first_name?.[0]}{currentUser.last_name?.[0]}
                    </span>
                    {currentUser.first_name}
                  </span>
                </NavLink>
                <button
                  onClick={logOut}
                  className="btn-secondary-custom"
                  style={{ marginLeft: "0.5rem", padding: "6px 14px", fontSize: "0.85rem" }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" style={navLinkStyle}>Login</NavLink>
                <NavLink to="/register" style={{ textDecoration: "none", marginLeft: "0.25rem" }}>
                  <button className="btn-primary-custom" style={{ width: "auto", padding: "8px 18px", fontSize: "0.875rem" }}>
                    Register
                  </button>
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ paddingBottom: "4rem" }}>
        <Routes>
          <Route path="/" element={<Home currentUser={currentUser} />} />
          <Route path="/home" element={<Home currentUser={currentUser} />} />
          <Route path="/login" element={
            currentUser ? <Navigate to="/profile" replace /> :
            <Login onLoginSuccess={handleLoginSuccess} />
          } />
          <Route path="/register" element={
            currentUser ? <Navigate to="/profile" replace /> :
            <Register />
          } />
          <Route path="/profile" element={
            <ProtectedRoute currentUser={currentUser}>
              <Profile currentUser={currentUser} onLogout={logOut} />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute currentUser={currentUser}>
              <UserList />
            </ProtectedRoute>
          } />
          {/* 404 */}
          <Route path="*" element={
            <div className="page-container" style={{ textAlign: "center", paddingTop: "4rem" }}>
              <div style={{ fontSize: "4rem" }}>404</div>
              <div className="page-title" style={{ fontSize: "1.4rem", marginTop: "0.5rem" }}>Page Not Found</div>
              <Link to="/" className="link-accent" style={{ display: "inline-block", marginTop: "1rem" }}>← Go Home</Link>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
};

export default App;
