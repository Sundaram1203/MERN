import React from "react";
import { Link } from "react-router-dom";

const Home = ({ currentUser }) => {
  return (
    <div className="page-container" style={{ maxWidth: 640 }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 className="page-title" style={{ fontSize: "2.4rem" }}>
          User Module
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1rem", maxWidth: 420, margin: "0.75rem auto 0" }}>
          A complete authentication system with registration, OTP verification, profile management, and user directory.
        </p>
      </div>

      {currentUser ? (
        <div>
          <div className="alert-custom alert-success" style={{ marginBottom: "2rem" }}>
            Welcome back, <strong>{currentUser.first_name} {currentUser.last_name}</strong>!
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {[
              { to: "/profile", label: "My Profile", desc: "View and update your profile" },
              { to: "/users", label: "User Directory", desc: "Browse all registered users" }
            ].map(({ to, icon, label, desc }) => (
              <Link key={to} to={to} style={{ textDecoration: "none" }}>
                <div className="card-glass" style={{ textAlign: "center", transition: "transform 0.15s", cursor: "pointer" }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{icon}</div>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, marginBottom: "0.3rem" }}>{label}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Link to="/register" style={{ textDecoration: "none" }}>
            <button className="btn-primary-custom" style={{ borderRadius: "var(--radius)" }}>
              Create Account
            </button>
          </Link>
          <Link to="/login" style={{ textDecoration: "none" }}>
            <button className="btn-secondary-custom" style={{ width: "100%", borderRadius: "var(--radius)" }}>
              Sign In
            </button>
          </Link>
        </div>
      )}

      {/* Features */}
      <div style={{ marginTop: "3rem", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
        {[
          { label: "Secure Auth", desc: "MD5-hashed passwords" },
          { label: "OTP Verify", desc: "Email-based verification" },
          { label: "Profile Image", desc: "Upload & manage photos" },
          { label: "User Directory", desc: "Browse & view users" }
        ].map(({ icon, label, desc }) => (
          <div key={label} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <div style={{ fontSize: "1.3rem", flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{label}</div>
              <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
