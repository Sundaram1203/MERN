import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isEmail } from "validator";
import AuthService from "../services/auth.service";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState("");
  const [serverSuccess, setServerSuccess] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpTime, setOtpTime] = useState("");
  const [otpMsg, setOtpMsg] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerMsg("");
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = "First name is required.";
    else if (form.first_name.trim().length > 255)
      errs.first_name = "First name cannot exceed 255 characters.";

    if (!form.last_name.trim()) errs.last_name = "Last name is required.";
    else if (form.last_name.trim().length > 255)
      errs.last_name = "Last name cannot exceed 255 characters.";

    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!isEmail(form.email)) errs.email = "Please enter a valid email address.";

    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    else if (form.password.length > 15)
      errs.password = "Password cannot exceed 15 characters.";

    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";

    return errs;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setServerMsg("");

    try {
      const response = await AuthService.register(
        form.first_name.trim(),
        form.last_name.trim(),
        form.email.trim(),
        form.password
      );

      if (response.data?.status) {
        const time = response.data.time || new Date().toISOString().slice(0, 19).replace("T", " ");
        setOtpTime(time);
        setServerMsg(response.data.message);
        setServerSuccess(true);
        setShowOtp(true);
      } else {
        setServerMsg(response.data?.message || "Registration failed.");
        setServerSuccess(false);
      }
    } catch (err) {
      setServerMsg(err.response?.data?.message || err.message || "Network error. Please try again.");
      setServerSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setOtpMsg("Please enter a valid 6-digit OTP.");
      setOtpSuccess(false);
      return;
    }

    setOtpLoading(true);
    setOtpMsg("");

    try {
      const response = await AuthService.otpVerify(form.email.trim(), otp, otpTime);
      if (response.data?.status) {
        setOtpMsg("Email verified successfully! Redirecting to login...");
        setOtpSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setOtpMsg(response.data?.message || "OTP verification failed.");
        setOtpSuccess(false);
      }
    } catch (err) {
      setOtpMsg(err.response?.data?.message || "Verification failed. Please try again.");
      setOtpSuccess(false);
    } finally {
      setOtpLoading(false);
    }
  };

  const InputField = ({ label, name, type = "text", placeholder, extra }) => (
    <div style={{ marginBottom: "1.2rem" }}>
      <label className="form-label">{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={name === "password" && showPassword ? "text" : type}
          className={`form-control ${errors[name] ? "is-invalid" : ""}`}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete={name === "password" ? "new-password" : "on"}
        />
        {extra}
      </div>
      {errors[name] && (
        <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "4px" }}>
          {errors[name]}
        </div>
      )}
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: 520 }}>
      {!showOtp ? (
        <div className="card-glass">
          <div className="avatar avatar-lg" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
          </div>

          <div className="page-title" style={{ textAlign: "center", fontSize: "1.6rem" }}>Create Account</div>
          <div className="page-subtitle" style={{ textAlign: "center" }}>
            Join us today — it's free
          </div>

          <form onSubmit={handleRegister} noValidate>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
              <InputField label="First Name" name="first_name" placeholder="John" />
              <InputField label="Last Name" name="last_name" placeholder="Doe" />
            </div>

            <InputField label="Email Address" name="email" type="email" placeholder="john@example.com" />

            <div style={{ marginBottom: "1.2rem" }}>
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="8–15 characters"
                  autoComplete="new-password"
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
              {errors.password && (
                <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "4px" }}>{errors.password}</div>
              )}
            </div>

            <InputField label="Confirm Password" name="confirmPassword" type="password" placeholder="Repeat password" />

            {serverMsg && (
              <div className={`alert-custom ${serverSuccess ? "alert-success" : "alert-error"}`} style={{ marginBottom: "1rem" }}>
                {serverMsg}
              </div>
            )}

            <button type="submit" className="btn-primary-custom" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <div className="divider">or</div>
          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.875rem" }}>
            Already have an account?{" "}
            <Link to="/login" className="link-accent">Sign in</Link>
          </p>
        </div>
      ) : (
        <div className="card-glass">
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📧</div>
            <div className="page-title" style={{ fontSize: "1.5rem" }}>Verify Your Email</div>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
              We've sent a 6-digit OTP to <strong style={{ color: "var(--text)" }}>{form.email}</strong>
            </p>
          </div>

          {serverMsg && (
            <div className="alert-custom alert-success" style={{ marginBottom: "1.2rem" }}>
              {serverMsg}
            </div>
          )}

          <form onSubmit={handleOtpVerify} noValidate>
            <div style={{ marginBottom: "1.2rem" }}>
              <label className="form-label">Enter OTP</label>
              <input
                type="text"
                className="form-control otp-input"
                maxLength={6}
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setOtpMsg(""); }}
                placeholder="• • • • • •"
              />
            </div>

            {otpMsg && (
              <div className={`alert-custom ${otpSuccess ? "alert-success" : "alert-error"}`} style={{ marginBottom: "1rem" }}>
                {otpMsg}
              </div>
            )}

            <button type="submit" className="btn-primary-custom" disabled={otpLoading || otpSuccess}>
              {otpLoading && <span className="spinner" />}
              {otpLoading ? "Verifying…" : "Verify OTP"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.2rem", color: "var(--muted)", fontSize: "0.85rem" }}>
            OTP expires in 5 minutes.{" "}
            <button
              style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.85rem" }}
              onClick={() => { setShowOtp(false); setServerMsg(""); setOtp(""); setOtpMsg(""); }}
            >
              Go back
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default Register;
