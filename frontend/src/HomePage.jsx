import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployees, deleteEmployee } from "./api";
import "./HomePage.css";

/* ── Delete Confirm Modal ── */
function DeleteModal({ name, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="#e02424" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </div>
        <h3 className="modal-title">Delete Employee?</h3>
        <p className="modal-sub">
          Are you sure you want to delete <strong>{name}</strong>?
          <br />This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="modal-btn modal-btn--cancel" onClick={onCancel}>Cancel</button>
          <button className="modal-btn modal-btn--confirm" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── Employee Card ── */
function EmployeeCard({ emp, onDelete, onClick }) {
  const initials = emp.fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="emp-card" onClick={() => onClick(emp._id)}>
      <div className="emp-card-header">
        <div className="emp-card-avatar">{initials}</div>
        <div>
          <div className="emp-card-name">{emp.fullName}</div>
          <div className="emp-card-email">{emp.email}</div>
        </div>
      </div>

      <div className="emp-card-details">
        <div className="emp-card-row">
          <strong>Mobile:</strong> {emp.mobile}
        </div>
        <div className="emp-card-row">
          <strong>Gender:</strong> {emp.gender}
        </div>
        <div className="emp-card-row">
          <strong>Blood Group:</strong> {emp.bloodGroup}
        </div>
        <div className="emp-card-row">
          <strong>District:</strong> {emp.district}, {emp.state}
        </div>
      </div>

      {/* Delete button — stop propagation so card click doesn't fire */}
      <button
        className="emp-card-delete"
        onClick={(e) => { e.stopPropagation(); onDelete(emp); }}
      >
        Delete
      </button>
    </div>
  );
}

// HOME PAGE

export default function HomePage() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchMob, setSearchMob] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

  /* Fetch on mount */
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async (name = "", mobile = "") => {
    setLoading(true);
    try {
      const data = await getEmployees(name, mobile);
      if (data.success) setEmployees(data.data);
    } catch {
      console.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchAll(searchName, searchMob);

  const handleClear = () => {
    setSearchName("");
    setSearchMob("");
    fetchAll();
  };

  const handleDeleteConfirm = async () => {
    const res = await deleteEmployee(deleteTarget.id);
    if (res.success) fetchAll(searchName, searchMob);
    setDeleteTarget(null);
  };

  return (
    <div className="home-page">

      {/* Top Bar */}
      <div className="home-topbar">
        <div className="home-brand">Entro <span>Labs</span></div>
      </div>

      <div className="home-content">

        {/* Heading */}
        <div className="home-heading">
          <h2>Employee Directory</h2>

        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            className="search-input"
            type="text"
            placeholder="Search by name…"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <input
            className="search-input"
            type="text"
            placeholder="Search by mobile…"
            value={searchMob}
            onChange={(e) => setSearchMob(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>Search</button>
          {(searchName || searchMob) && (
            <button className="clear-btn" onClick={handleClear}>Clear</button>
          )}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="home-loading">
            <div className="spinner" />
            Loading employees…
          </div>
        ) : (
          <div className="cards-grid">

            {/* Create Card — always first */}
            <div className="create-card" onClick={() => navigate("/create-employee")}>
              <div className="create-card-icon">+</div>
              <div className="create-card-label">Add New Employee</div>
              <div className="create-card-sub">Click to fill the employee form</div>
            </div>

            {/* Employee Cards */}
            {employees.length === 0 ? (
              <div className="home-empty">No employees found.</div>
            ) : (
              employees.map((emp) => (
                <EmployeeCard
                  key={emp._id}
                  emp={emp}
                  onClick={(id) => navigate(`/employee/${id}`)}
                  onDelete={(emp) => setDeleteTarget({ id: emp._id, name: emp.fullName })}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
