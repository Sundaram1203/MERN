import React, { useEffect, useState } from "react";
import AuthService from "../services/auth.service";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await AuthService.loginList();
      if (response.data?.status) {
        setUsers(response.data.result || []);
      } else {
        setError(response.data?.message || "Failed to load users.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    setViewLoading(true);
    setViewError("");
    setSelectedUser(null);

    try {
      const response = await AuthService.loginView(id);
      if (response.data?.status) {
        setSelectedUser(response.data.data);
      } else {
        setViewError(response.data?.message || "Failed to load user.");
        setSelectedUser({});
      }
    } catch (err) {
      setViewError(err.response?.data?.message || "Failed to load user.");
      setSelectedUser({});
    } finally {
      setViewLoading(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (u) =>
    `${u.first_name?.[0] || ""}${u.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="page-container-wide">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.8rem" }}>
        <div>
          <div className="page-title">User Directory</div>
          <div style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "2px" }}>
            {loading ? "Loading…" : `${filtered.length} user${filtered.length !== 1 ? "s" : ""} found`}
          </div>
        </div>
        <button className="btn-secondary-custom" onClick={fetchUsers} disabled={loading}>
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      {/* Error */}
      {error && <div className="alert-custom alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Table card */}
      <div className="card-glass" style={{ padding: "0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
            <span className="spinner" />Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👤</div>
            No users found.
          </div>
        ) : (
          <table className="table-custom">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Email</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td style={{ color: "var(--muted)", width: 40 }}>{user.id}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div className="avatar" style={{ width: 36, height: 36, fontSize: "0.85rem" }}>
                        {initials(user)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{user.first_name} {user.last_name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{user.email}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn-secondary-custom"
                      style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                      onClick={() => handleView(user.id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View Modal */}
      {(selectedUser !== null || viewLoading) && (
        <div className="modal-overlay" onClick={() => { setSelectedUser(null); setViewError(""); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontFamily: "var(--font-head)", fontSize: "1.1rem", fontWeight: 700 }}>User Details</div>
              <button
                onClick={() => { setSelectedUser(null); setViewError(""); }}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.3rem", lineHeight: 1 }}
              >×</button>
            </div>

            {viewLoading && (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
                <span className="spinner" />Loading…
              </div>
            )}

            {viewError && <div className="alert-custom alert-error">{viewError}</div>}

            {selectedUser && !viewLoading && Object.keys(selectedUser).length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div className="avatar" style={{ width: 56, height: 56, fontSize: "1.2rem" }}>
                    {initials(selectedUser)}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "1.1rem" }}>
                      {selectedUser.first_name} {selectedUser.last_name}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{selectedUser.email}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {[
                    { label: "ID", value: selectedUser.id },
                    { label: "First Name", value: selectedUser.first_name },
                    { label: "Last Name", value: selectedUser.last_name },
                    { label: "Email", value: selectedUser.email },
                    { label: "User ID", value: selectedUser.user_id }
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{label}</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 500, maxWidth: "60%", textAlign: "right", wordBreak: "break-all" }}>
                        {value || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
