import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { getProject, getEmployees, assignEmployee, removeEmployee } from "./api";

function Avatar({ name, size = 34 }) {
  const initials = (name || "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#0694a2,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size < 30 ? 9 : 12, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

const TH = { textAlign: "left", padding: "10px 18px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", background: "#f8fafc", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" };
const TD = { padding: "13px 18px", fontSize: 13, color: "var(--text-sub)", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" };

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProject(); loadAllEmployees(); }, [id]);

  const loadProject = async () => {
    setLoading(true);
    const res = await getProject(id);
    if (res.success) setProject(res.data);
    setLoading(false);
  };

  const loadAllEmployees = async () => {
    const res = await getEmployees();
    if (res.success) setAllEmployees(res.data);
  };

  const unassigned = allEmployees.filter(
    (emp) => !project?.assignedEmployees?.some((a) => a._id === emp._id)
  );

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  };

  const handleAssign = async () => {
    if (!selectedEmp) return;
    setAssigning(true);
    const res = await assignEmployee(id, selectedEmp);
    if (res.success) { setProject(res.data); setSelectedEmp(""); showMsg("success", "Employee assigned!"); }
    else showMsg("error", res.message);
    setAssigning(false);
  };

  const handleRemove = async (empId) => {
    const res = await removeEmployee(id, empId);
    if (res.success) { setProject(res.data); showMsg("success", "Employee removed."); }
    else showMsg("error", res.message);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  if (loading) return (
    <Layout title="Project Details">
      <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>Loading project…</div>
    </Layout>
  );

  if (!project) return (
    <Layout title="Project Details">
      <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>Project not found.</div>
    </Layout>
  );

  return (
    <Layout
      title="Project Details"
      actions={
        <button onClick={() => navigate("/projects")}
          style={{ padding: "7px 16px", background: "#f1f5f9", color: "var(--text-sub)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
          ← Back to Projects
        </button>
      }
    >

      {/* ── Project Info Card ── */}
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px 26px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, background: "var(--accent-light)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📁</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>{project.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>Created on {fmtDate(project.createdAt)}</div>
          </div>
        </div>

        <div style={{ height: 1, background: "var(--border)", marginBottom: 16 }} />

        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Description</div>
        <div style={{ fontSize: 13.5, color: "var(--text-sub)", lineHeight: 1.65 }}>{project.description}</div>
      </div>

      {/* ── Assigned Employees Section ── */}
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>👥 Assigned Employees</div>
          <div style={{ background: "var(--accent-light)", color: "var(--accent)", fontSize: 12, fontWeight: 600, padding: "3px 12px", borderRadius: 20 }}>
            {project.assignedEmployees?.length || 0} assigned
          </div>
        </div>

        {/* Assign bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", background: "#fafafa", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
          <select
            value={selectedEmp}
            onChange={(e) => setSelectedEmp(e.target.value)}
            style={{ flex: 1, minWidth: 220, padding: "9px 12px", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", color: "var(--text)", background: "#fff", outline: "none" }}>
            <option value="">-- Select employee to assign --</option>
            {unassigned.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.fullName} — {emp.mobile}
              </option>
            ))}
          </select>
          <button onClick={handleAssign} disabled={!selectedEmp || assigning}
            style={{ padding: "9px 20px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", opacity: (!selectedEmp || assigning) ? 0.6 : 1 }}>
            {assigning ? "Assigning…" : "+ Assign"}
          </button>
          {msg.text && (
            <div style={{ fontSize: 12.5, fontWeight: 500, padding: "7px 12px", borderRadius: 7, background: msg.type === "success" ? "#d1fae5" : "#fee2e2", color: msg.type === "success" ? "#065f46" : "#dc2626" }}>
              {msg.text}
            </div>
          )}
        </div>

        {/* Table */}
        {project.assignedEmployees?.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: 13 }}>
            No employees assigned yet. Use the dropdown above.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["#", "Employee", "Mobile", "Gender", "Blood Group", "Action"].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {project.assignedEmployees.map((emp, i) => (
                  <tr key={emp._id}>
                    <td style={{ ...TD, color: "var(--text-muted)", width: 40 }}>{i + 1}</td>
                    <td style={TD}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={emp.fullName} />
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text)" }}>{emp.fullName}</div>
                          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 1 }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={TD}>{emp.mobile}</td>
                    <td style={TD}>{emp.gender}</td>
                    <td style={TD}>
                      <span style={{ display: "inline-block", background: "var(--accent-light)", color: "var(--accent)", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>
                        {emp.bloodGroup}
                      </span>
                    </td>
                    <td style={TD}>
                      <button onClick={() => handleRemove(emp._id)}
                        style={{ padding: "5px 13px", background: "var(--red-light)", color: "var(--red)", border: "1px solid var(--red-border)", borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </Layout>
  );
}