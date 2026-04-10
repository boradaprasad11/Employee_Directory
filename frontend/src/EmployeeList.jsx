import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { getEmployees, deleteEmployee, getProjects } from "./api";

/* ── Shared UI tokens ── */
const T = {
  card: {
    background: "#fff",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
  },
  th: {
    textAlign: "left",
    padding: "10px 18px",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    background: "#f8fafc",
    borderBottom: "1px solid var(--border)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 18px",
    fontSize: 13,
    color: "var(--text-sub)",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
  },
};

/* ── Delete Modal ── */
function DeleteModal({ name, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
      onClick={onCancel}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "28px 26px", maxWidth: 340, width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ width: 52, height: 52, background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Delete Employee?</div>
        <div style={{ fontSize: 13, color: "#475569", marginBottom: 22, lineHeight: 1.6 }}>
          Are you sure you want to delete <strong>{name}</strong>?<br />This cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#0f172a" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "10px", borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#dc2626", border: "none", color: "#fff" }}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── Avatar ── */
function Avatar({ name }) {
  const initials = (name || "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#0694a2,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

/* ── Tag ── */
function Tag({ label, color = "#e0f7fa", textColor = "#0694a2" }) {
  return (
    <span style={{ display: "inline-block", background: color, color: textColor, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

export default function EmployeeList() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchMobile, setSearchMobile] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { fetchAll(); fetchProjects(); }, []);

  const fetchAll = async (name = "", mobile = "") => {
    setLoading(true);
    try {
      const res = await getEmployees(name, mobile);
      if (res.success) setEmployees(res.data);
    } finally { setLoading(false); }
  };

  const fetchProjects = async () => {
    const res = await getProjects();
    if (res.success) setProjects(res.data);
  };

  /* Build a map: employeeId → [projectTitles] */
  const empProjectMap = {};
  projects.forEach((proj) => {
    (proj.assignedEmployees || []).forEach((emp) => {
      const id = emp._id || emp;
      if (!empProjectMap[id]) empProjectMap[id] = [];
      empProjectMap[id].push(proj.title);
    });
  });

  const handleSearch = () => fetchAll(searchName, searchMobile);
  const handleClear = () => { setSearchName(""); setSearchMobile(""); fetchAll(); };

  const handleDeleteConfirm = async () => {
    await deleteEmployee(deleteTarget.id);
    setDeleteTarget(null);
    fetchAll(searchName, searchMobile);
  };

  return (
    <Layout
      title="Employee List"
      subtitle="View and manage all employee records"
      actions={
        <button
          onClick={() => navigate("/create-employee")}
          style={{ padding: "8px 18px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
          + Add Employee
        </button>
      }
    >

      {/* ── Search bar ── */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          placeholder="Search by name…"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ padding: "9px 14px", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none", width: 220, background: "#fff" }}
        />
        <input
          placeholder="Search by mobile…"
          value={searchMobile}
          onChange={(e) => setSearchMobile(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ padding: "9px 14px", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none", width: 220, background: "#fff" }}
        />
        <button onClick={handleSearch} style={{ padding: "9px 20px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
          Search
        </button>
        {(searchName || searchMobile) && (
          <button onClick={handleClear} style={{ padding: "9px 14px", background: "#fff", color: "var(--text-sub)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
            Clear
          </button>
        )}
      </div>

      {/* ── Table card ── */}
      <div style={T.card}>
        {/* Card header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>All Employees</div>
          <div style={{ background: "var(--accent-light)", color: "var(--accent)", fontSize: 12, fontWeight: 600, padding: "3px 12px", borderRadius: 20 }}>
            {employees.length} records
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["#", "Employee", "Mobile", "Gender", "Blood Group", "District", "Assigned Projects", "Actions"].map((h) => (
                  <th key={h} style={T.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ ...T.td, textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Loading…</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan="8" style={{ ...T.td, textAlign: "center", padding: 48, color: "var(--text-muted)" }}>No employees found.</td></tr>
              ) : (
                employees.map((emp, i) => {
                  const assignedProjs = empProjectMap[emp._id] || [];
                  return (
                    <tr key={emp._id}
                      onClick={() => navigate(`/employee/${emp._id}`)}
                      style={{ cursor: "pointer", transition: "background 0.12s" }}
                      onMouseEnter={(e) => { Array.from(e.currentTarget.cells).forEach(c => c.style.background = "#f8fafc"); }}
                      onMouseLeave={(e) => { Array.from(e.currentTarget.cells).forEach(c => c.style.background = ""); }}
                    >
                      <td style={{ ...T.td, color: "var(--text-muted)", width: 40 }}>{i + 1}</td>
                      <td style={T.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={emp.fullName} />
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 13 }}>{emp.fullName}</div>
                            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 1 }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={T.td}>{emp.mobile}</td>
                      <td style={T.td}>{emp.gender}</td>
                      <td style={T.td}>
                        <Tag label={emp.bloodGroup} />
                      </td>
                      <td style={T.td}>{emp.district}, {emp.state}</td>

                      {/* Assigned Projects */}
                      <td style={T.td} onClick={(e) => e.stopPropagation()}>
                        {assignedProjs.length === 0 ? (
                          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {assignedProjs.map((title) => (
                              <Tag key={title} label={title} color="#f0fdf4" textColor="#059669" />
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={T.td} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => navigate(`/employee/${emp._id}`)}
                            style={{ padding: "5px 13px", background: "var(--accent-light)", color: "var(--accent)", border: "1px solid var(--accent-mid)", borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
                            View
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: emp._id, name: emp.fullName })}
                            style={{ padding: "5px 13px", background: "var(--red-light)", color: "var(--red)", border: "1px solid var(--red-border)", borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </Layout>
  );
}