import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEmployee, updateEmployee } from "./api";
import { validateEmployee, calcAge } from "./validate";
import "./EmployeeDetail.css";

/* ── Constants ── */
const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed"];

/* ── Util ── */
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// EMPLOYEE DETAIL PAGE

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiMsg, setApiMsg] = useState({ type: "", text: "" });

  /* ── Load employee ── */
  useEffect(() => {
    (async () => {
      const res = await getEmployee(id);
      if (res.success) {
        setEmp(res.data);
        setForm(flattenEmp(res.data));
      }
      setLoading(false);
    })();
  }, [id]);

  /* Flatten mongo doc → form fields */
  function flattenEmp(e) {
    return {
      fullName: e.fullName || "",
      fatherName: e.fatherName || "",
      dob: e.dob?.split("T")[0] || "",
      age: e.age || "",
      mobile: e.mobile || "",
      email: e.email || "",
      gender: e.gender || "",
      maritalStatus: e.maritalStatus || "",
      bloodGroup: e.bloodGroup || "",
      aadhar: e.aadhar || "",
      state: e.state || "",
      district: e.district || "",
      fullAddress: e.fullAddress || "",
      pincode: e.pincode || "",
    };
  }

  /* ── Edit handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...form, [name]: value };
    if (name === "dob") updated.age = value ? calcAge(value) : "";
    setForm(updated);
    setApiMsg({ type: "", text: "" });
    if (touched[name]) setErrors(validateEmployee(updated));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validateEmployee(form));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);
    const errs = validateEmployee(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await updateEmployee(id, form);
      if (res.success) {
        setEmp(res.data);
        setForm(flattenEmp(res.data));
        setEditMode(false);
        setTouched({});
        setErrors({});
        setApiMsg({ type: "success", text: "Employee updated successfully!" });
        setTimeout(() => setApiMsg({ type: "", text: "" }), 3000);
      } else {
        setApiMsg({ type: "error", text: res.message });
      }
    } catch {
      setApiMsg({ type: "error", text: "Network error. Try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setForm(flattenEmp(emp));
    setErrors({});
    setTouched({});
    setApiMsg({ type: "", text: "" });
  };

  /* Field class helpers */
  const fc = (name) => {
    if (!touched[name]) return "field-input";
    return errors[name] ? "field-input error" : "field-input success";
  };
  const sc = (name) => {
    if (!touched[name]) return "field-select";
    return errors[name] ? "field-select error" : "field-select success";
  };
  const tc = (name) => {
    if (!touched[name]) return "field-textarea";
    return errors[name] ? "field-textarea error" : "field-textarea success";
  };
  const Msg = ({ name }) => (
    <>
      {touched[name] && errors[name] && <span className="field-error">⚠ {errors[name]}</span>}
      {touched[name] && !errors[name] && <span className="field-success">✓ Looks good!</span>}
    </>
  );

  if (loading) return <div className="detail-loading">Loading employee…</div>;
  if (!emp) return <div className="detail-loading">Employee not found.</div>;

  return (
    <div className="detail-page">

      {/* Top bar */}
      <div className="detail-topbar">
        <div className="detail-topbar-left">
          <button className="back-btn" onClick={() => navigate("/")}>← Back</button>
          <div className="detail-topbar-title">
            {editMode ? "Edit Employee" : "Employee Details"}
          </div>
        </div>
        <button
          className={`toggle-edit-btn ${editMode ? "close" : "edit"}`}
          onClick={editMode ? handleCancelEdit : () => setEditMode(true)}
        >
          {editMode ? "✕ Close Edit" : "✏ Edit Employee"}
        </button>
      </div>

      <div className="detail-content">

        {/* API banner */}
        {apiMsg.text && (
          <div className={`api-banner ${apiMsg.type}`}>
            {apiMsg.type === "success" ? "✅" : "❌"} {apiMsg.text}
          </div>
        )}

        {/* Profile header */}
        <div className="profile-header">
          <div className="profile-avatar">{initials(emp.fullName)}</div>
          <div>
            <div className="profile-name">{emp.fullName}</div>
            <div className="profile-email">{emp.email}</div>
            <div className="profile-badges">
              <span className="badge badge-blue">{emp.gender}</span>
              <span className="badge badge-green">{emp.bloodGroup}</span>
              <span className="badge badge-purple">{emp.maritalStatus}</span>
            </div>
          </div>
        </div>

        {/* ── VIEW MODE ── */}
        {!editMode && (
          <div className="detail-card">

            <div className="detail-section-title">Personal Details</div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Father's Name</div>
                <div className="detail-value">{emp.fatherName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Date of Birth</div>
                <div className="detail-value">{fmtDate(emp.dob)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Age</div>
                <div className="detail-value">{emp.age} years</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Gender</div>
                <div className="detail-value">{emp.gender}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Marital Status</div>
                <div className="detail-value">{emp.maritalStatus}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Blood Group</div>
                <div className="detail-value">{emp.bloodGroup}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Aadhar Number</div>
                <div className="detail-value">
                  {"*".repeat(8) + emp.aadhar?.slice(-4)}
                </div>
              </div>
            </div>

            <hr className="detail-divider" />
            <div className="detail-section-title">Contact Details</div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Mobile</div>
                <div className="detail-value">{emp.mobile}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Email</div>
                <div className="detail-value">{emp.email}</div>
              </div>
            </div>

            <hr className="detail-divider" />
            <div className="detail-section-title">Address</div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">State</div>
                <div className="detail-value">{emp.state}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">District</div>
                <div className="detail-value">{emp.district}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Pincode</div>
                <div className="detail-value">{emp.pincode}</div>
              </div>
              <div className="detail-item col-span-3">
                <div className="detail-label">Full Address</div>
                <div className="detail-value">{emp.fullAddress}</div>
              </div>
            </div>

          </div>
        )}

        {/* ── EDIT MODE ── */}
        {editMode && (
          <div className="detail-card">
            <form onSubmit={handleUpdate} noValidate className="edit-form">

              <div className="form-section-title">Personal Details</div>
              <div className="form-grid">

                <div className="field-group">
                  <label className="field-label">Full Name *</label>
                  <input name="fullName" type="text" value={form.fullName}
                    onChange={handleChange} onBlur={handleBlur} className={fc("fullName")} />
                  <Msg name="fullName" />
                </div>

                <div className="field-group">
                  <label className="field-label">Father's Name *</label>
                  <input name="fatherName" type="text" value={form.fatherName}
                    onChange={handleChange} onBlur={handleBlur} className={fc("fatherName")} />
                  <Msg name="fatherName" />
                </div>

                <div className="field-group">
                  <label className="field-label">Date of Birth *</label>
                  <input name="dob" type="date" value={form.dob}
                    onChange={handleChange} onBlur={handleBlur} className={fc("dob")}
                    max={new Date().toISOString().split("T")[0]} />
                  <Msg name="dob" />
                </div>

                <div className="field-group">
                  <label className="field-label">Age</label>
                  <input name="age" type="number" value={form.age} readOnly
                    className="field-input" />
                </div>

                <div className="field-group">
                  <label className="field-label">Gender *</label>
                  <div className="radio-group">
                    {["Male", "Female", "Other"].map((g) => (
                      <label className="radio-label" key={g}>
                        <input type="radio" name="gender" value={g}
                          checked={form.gender === g}
                          onChange={handleChange} onBlur={handleBlur} />
                        {g}
                      </label>
                    ))}
                  </div>
                  {touched.gender && errors.gender && <span className="field-error">⚠ {errors.gender}</span>}
                </div>

                <div className="field-group">
                  <label className="field-label">Marital Status *</label>
                  <select name="maritalStatus" value={form.maritalStatus}
                    onChange={handleChange} onBlur={handleBlur} className={sc("maritalStatus")}>
                    {MARITAL_STATUS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <Msg name="maritalStatus" />
                </div>

                <div className="field-group">
                  <label className="field-label">Blood Group *</label>
                  <select name="bloodGroup" value={form.bloodGroup}
                    onChange={handleChange} onBlur={handleBlur} className={sc("bloodGroup")}>
                    {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                  <Msg name="bloodGroup" />
                </div>

                <div className="field-group">
                  <label className="field-label">Aadhar Number *</label>
                  <input name="aadhar" type="text" value={form.aadhar} maxLength={12}
                    onChange={handleChange} onBlur={handleBlur} className={fc("aadhar")} />
                  <Msg name="aadhar" />
                </div>

              </div>

              <div className="form-section-title">Contact Details</div>
              <div className="form-grid">

                <div className="field-group">
                  <label className="field-label">Mobile *</label>
                  <input name="mobile" type="tel" value={form.mobile} maxLength={10}
                    onChange={handleChange} onBlur={handleBlur} className={fc("mobile")} />
                  <Msg name="mobile" />
                </div>

                <div className="field-group">
                  <label className="field-label">Email *</label>
                  <input name="email" type="email" value={form.email}
                    onChange={handleChange} onBlur={handleBlur} className={fc("email")} />
                  <Msg name="email" />
                </div>

              </div>

              <div className="form-section-title">Address</div>
              <div className="form-grid">

                <div className="field-group">
                  <label className="field-label">State *</label>
                  <select name="state" value={form.state}
                    onChange={handleChange} onBlur={handleBlur} className={sc("state")}>
                    {STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <Msg name="state" />
                </div>

                <div className="field-group">
                  <label className="field-label">District *</label>
                  <input name="district" type="text" value={form.district}
                    onChange={handleChange} onBlur={handleBlur} className={fc("district")} />
                  <Msg name="district" />
                </div>

                <div className="field-group">
                  <label className="field-label">Pincode *</label>
                  <input name="pincode" type="text" value={form.pincode} maxLength={6}
                    onChange={handleChange} onBlur={handleBlur} className={fc("pincode")} />
                  <Msg name="pincode" />
                </div>

                <div className="field-group col-span-3">
                  <label className="field-label">Full Address *</label>
                  <textarea name="fullAddress" value={form.fullAddress}
                    onChange={handleChange} onBlur={handleBlur} className={tc("fullAddress")} />
                  <Msg name="fullAddress" />
                </div>

              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><div className="spinner" /> Updating…</> : "✔ Submit Update"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                  ✕ Cancel
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
