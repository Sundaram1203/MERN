import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isEmail } from "validator";
import AuthService from "../services/auth.service";

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerMsg("");
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!isEmail(form.email)) errs.email = "Please enter a valid email address.";
    if (!form.password) errs.password = "Password is required.";
    return errs;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setServerMsg("");

    try {
      const data = await AuthService.login(form.email.trim(), form.password);
      if (data?.status) {
        if (onLoginSuccess) onLoginSuccess(data.data);
        navigate("/profile");
      } else {
        setServerMsg(data?.message || "Invalid email or password.");
      }
    } catch (err) {
      setServerMsg(err.response?.data?.message || err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card-glass">
        <div className="avatar avatar-lg" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>

        <div className="page-title" style={{ textAlign: "center", fontSize: "1.6rem" }}>Welcome Back</div>
        <div className="page-subtitle" style={{ textAlign: "center" }}>
          Sign in to your account
        </div>

        <form onSubmit={handleLogin} noValidate>
          <div style={{ marginBottom: "1.2rem" }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              autoComplete="email"
            />
            {errors.email && <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "4px" }}>{errors.email}</div>}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                autoComplete="current-password"
                style={{ paddingRight: "2.8rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 0 }}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            {errors.password && <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "4px" }}>{errors.password}</div>}
          </div>

          {serverMsg && (
            <div className="alert-custom alert-error" style={{ marginBottom: "1rem" }}>
              {serverMsg}
            </div>
          )}

          <button type="submit" className="btn-primary-custom" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="divider">or</div>
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.875rem" }}>
          Don't have an account?{" "}
          <Link to="/register" className="link-accent">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
