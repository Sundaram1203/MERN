import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";

const Profile = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [profilePath, setProfilePath] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  if (!currentUser) {
    return (
      <div className="page-container" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        <div className="page-title" style={{ fontSize: "1.4rem" }}>Not Authenticated</div>
        <p style={{ color: "var(--muted)", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
          Please log in to view your profile.
        </p>
        <button className="btn-primary-custom" style={{ maxWidth: 200, margin: "0 auto" }} onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  const initials = `${currentUser.first_name?.[0] || ""}${currentUser.last_name?.[0] || ""}`.toUpperCase();

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadMsg("Only image files (jpg, png, gif, webp) are allowed.");
      setUploadSuccess(false);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadMsg("File size must be under 5 MB.");
      setUploadSuccess(false);
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setUploadMsg("");

    try {
      const response = await AuthService.uploadImage(file);
      if (response.data?.status) {
        setUploadMsg(response.data.message);
        setUploadSuccess(true);
        setProfilePath(response.data.data?.profile_path);
      } else {
        setUploadMsg(response.data?.message || "Upload failed.");
        setUploadSuccess(false);
      }
    } catch (err) {
      setUploadMsg(err.response?.data?.message || err.message || "Upload error.");
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="page-container" style={{ maxWidth: 560 }}>
      {/* Profile card */}
      <div className="card-glass" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{ position: "relative" }}>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile"
                style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--accent)" }}
              />
            ) : (
              <div className="avatar" style={{ width: 80, height: 80, fontSize: "1.8rem" }}>
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-head)", fontSize: "1.4rem", fontWeight: 700 }}>
              {currentUser.first_name} {currentUser.last_name}
            </div>
            <div style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "2px" }}>
              {currentUser.email}
            </div>
            {currentUser.id && (
              <div style={{ marginTop: "6px" }}>
                <span className="badge-custom badge-accent">ID #{currentUser.id}</span>
              </div>
            )}
          </div>
        </div>

        {/* User details */}
        <div style={{ marginTop: "1.8rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {[
              { label: "First Name", value: currentUser.first_name },
              { label: "Last Name", value: currentUser.last_name },
              { label: "Email", value: currentUser.email },
              { label: "User ID", value: currentUser.user_id ? currentUser.user_id.slice(0, 16) + "…" : "—" }
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ color: "var(--muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                  {label}
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload card */}
      <div className="card-glass" style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, marginBottom: "0.5rem" }}>
          Profile Photo
        </div>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
          Upload a new profile picture. Max 5 MB (jpg, png, gif, webp).
        </p>

        <div
          className={`upload-area ${dragOver ? "drag-over" : ""}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div><span className="spinner" />Uploading…</div>
          ) : previewUrl ? (
            <div>
              <img src={previewUrl} alt="preview" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", marginBottom: "0.5rem" }} />
              <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Click to change</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📷</div>
              <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                Drag & drop or <span style={{ color: "var(--accent)" }}>click to upload</span>
              </div>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {uploadMsg && (
          <div className={`alert-custom ${uploadSuccess ? "alert-success" : "alert-error"}`} style={{ marginTop: "1rem" }}>
            {uploadMsg}
            {uploadSuccess && profilePath && (
              <div style={{ marginTop: "4px", fontSize: "0.8rem", opacity: 0.8 }}>
                Path: {profilePath}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        className="btn-secondary-custom"
        style={{ width: "100%" }}
        onClick={onLogout}
      >
        Sign Out
      </button>
    </div>
  );
};

export default Profile;
