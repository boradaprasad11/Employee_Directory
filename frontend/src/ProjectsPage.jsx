import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { getProjects, createProject, deleteProject } from "./api";

/* ── Delete Modal ── */
function DeleteModal({ title, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
      onClick={onCancel}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "28px 26px", maxWidth: 340, width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ width: 52, height: 52, background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          </svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Delete Project?</div>
        <div style={{ fontSize: 13, color: "#475569", marginBottom: 22, lineHeight: 1.6 }}>
          Are you sure you want to delete <strong>{title}</strong>?
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 10, borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#0f172a" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 10, borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#dc2626", border: "none", color: "#fff" }}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

const EMPTY = { title: "", description: "" };

const inputStyle = (hasErr) => ({
  padding: "9px 13px",
  border: `1.5px solid ${hasErr ? "var(--red)" : "var(--border)"}`,
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "'DM Sans', sans-serif",
  color: "var(--text)",
  background: "#fafafa",
  outline: "none",
  width: "100%",
  transition: "border 0.15s",
});

export default function ProjectsPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiMsg, setApiMsg] = useState({ type: "", text: "" });
  const [searchTitle, setSearchTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async (title = "") => {
    setLoading(true);
    try {
      const res = await getProjects(title);
      if (res.success) setProjects(res.data);
    } finally { setLoading(false); }
  };

  const validate = (f) => {
    const e = {};
    if (!f.title.trim() || f.title.trim().length < 3) e.title = "Title must be at least 3 characters.";
    if (!f.description.trim() || f.description.trim().length < 10) e.description = "Description must be at least 10 characters.";
    return e;
  };

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    if (Object.keys(formErrors).length) setFormErrors(validate(updated));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setFormErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      const res = await createProject(form);
      if (res.success) {
        setApiMsg({ type: "success", text: "Project created successfully!" });
        setForm(EMPTY); setFormErrors({});
        fetchAll();
        setTimeout(() => setApiMsg({ type: "", text: "" }), 3000);
      } else { setApiMsg({ type: "error", text: res.message }); }
    } catch { setApiMsg({ type: "error", text: "Network error." }); }
    finally { setSubmitting(false); }
  };

  const handleDeleteConfirm = async () => {
    await deleteProject(deleteTarget.id);
    setDeleteTarget(null);
    fetchAll(searchTitle);
  };

  return (
    <Layout title="Projects" subtitle="Create and manage projects, assign employees">

      {/* ── Create Project Form ── */}
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "22px 24px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
          📁 Create New Project
        </div>

        {apiMsg.text && (
          <div style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 14, display: "flex", alignItems: "center", gap: 8, background: apiMsg.type === "success" ? "#d1fae5" : "#fee2e2", color: apiMsg.type === "success" ? "#065f46" : "#dc2626", border: `1px solid ${apiMsg.type === "success" ? "#6ee7b7" : "#fca5a5"}` }}>
            {apiMsg.type === "success" ? "✅" : "❌"} {apiMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 16 }}>

            {/* Title */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-sub)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Project Title *
              </label>
              <input name="title" type="text" placeholder="e.g. HRMS Revamp"
                value={form.title} onChange={handleChange}
                style={inputStyle(!!formErrors.title)} />
              {formErrors.title && <span style={{ fontSize: 11.5, color: "var(--red)" }}>⚠ {formErrors.title}</span>}
            </div>

            {/* Description */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-sub)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Description *
              </label>
              <textarea name="description" placeholder="Describe the project…"
                value={form.description} onChange={handleChange}
                style={{ ...inputStyle(!!formErrors.description), resize: "vertical", minHeight: 70 }} />
              {formErrors.description && <span style={{ fontSize: 11.5, color: "var(--red)" }}>⚠ {formErrors.description}</span>}
            </div>

          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={submitting}
              style={{ padding: "9px 22px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", opacity: submitting ? 0.65 : 1 }}>
              {submitting ? "Creating…" : "✔ Create Project"}
            </button>
            <button type="button" onClick={() => { setForm(EMPTY); setFormErrors({}); }}
              style={{ padding: "9px 18px", background: "#f1f5f9", color: "var(--text-sub)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* ── Search ── */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          placeholder="Search by project name…"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchAll(searchTitle)}
          style={{ padding: "9px 14px", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none", width: 280, background: "#fff" }}
        />
        <button onClick={() => fetchAll(searchTitle)}
          style={{ padding: "9px 20px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
          Search
        </button>
        {searchTitle && (
          <button onClick={() => { setSearchTitle(""); fetchAll(); }}
            style={{ padding: "9px 14px", background: "#fff", color: "var(--text-sub)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
            Clear
          </button>
        )}
      </div>

      {/* ── Projects grid ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading projects…</div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>No projects found.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {projects.map((proj) => (
            <div key={proj._id}
              onClick={() => navigate(`/projects/${proj._id}`)}
              style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20, cursor: "pointer", transition: "all 0.18s", position: "relative" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; }}
            >
              {/* Icon */}
              <div style={{ width: 40, height: 40, background: "var(--accent-light)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>📁</div>

              {/* Title */}
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{proj.title}</div>

              {/* Desc */}
              <div style={{ fontSize: 12.5, color: "var(--text-sub)", lineHeight: 1.55, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {proj.description}
              </div>

              {/* Assigned employees list */}
              {proj.assignedEmployees?.length > 0 && (
                <div style={{ marginBottom: 14, padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 7 }}>
                    Assigned Employees
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {proj.assignedEmployees.map((emp) => (
                      <div key={emp._id} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#0694a2,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>
                          {(emp.fullName || "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 12, color: "var(--text-sub)", fontWeight: 500 }}>{emp.fullName}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>— {emp.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  👥 <strong style={{ color: "var(--text)" }}>{proj.assignedEmployees?.length || 0}</strong> assigned
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: proj._id, title: proj.title }); }}
                  style={{ padding: "4px 12px", background: "var(--red-light)", color: "var(--red)", border: "1px solid var(--red-border)", borderRadius: 6, fontSize: 11.5, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <DeleteModal
          title={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </Layout>
  );
}