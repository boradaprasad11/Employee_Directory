import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEmployee } from "./api";
import { validateEmployee, calcAge } from "./validate";
import "./CreateEmployee.css";

/* ── Constants ── */
const EMPTY = {
  fullName: "", fatherName: "", dob: "", age: "",
  mobile: "", email: "", gender: "", maritalStatus: "",
  bloodGroup: "", aadhar: "", state: "", district: "",
  fullAddress: "", pincode: "",
};

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed"];

//CREATE EMPLOYEE PAGE

export default function CreateEmployee() {
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiMsg, setApiMsg] = useState({ type: "", text: "" });

  /* ── Input change ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...form, [name]: value };

    /* Auto-fill age when DOB changes */
    if (name === "dob") {
      updated.age = value ? calcAge(value) : "";
    }

    setForm(updated);
    setApiMsg({ type: "", text: "" });
    if (touched[name]) setErrors(validateEmployee(updated));
  };

  /* ── Blur ── */
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validateEmployee(form));
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(EMPTY).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);
    const errs = validateEmployee(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await createEmployee(form);
      if (res.success) {
        /* Redirect to home — new card will appear */
        navigate("/");
      } else {
        setApiMsg({ type: "error", text: res.message });
      }
    } catch {
      setApiMsg({ type: "error", text: "Network error. Is the backend running?" });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Field class helpers ── */
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
      {/* {touched[name] && !errors[name] && <span className="field-success">✓ Looks good!</span>} */}
    </>
  );

  return (
    <div className="create-page">

      {/* Top bar */}
      <div className="create-topbar">
        <button className="back-btn" onClick={() => navigate("/")}>← Back</button>
        <div className="create-topbar-title">Create New Employee</div>
      </div>

      <div className="create-content">
        <div className="form-card">
          <div className="form-card-title">📋 Employee Registration Form</div>

          {/* API banner */}
          {apiMsg.text && (
            <div className={`api-banner ${apiMsg.type}`}>
              {apiMsg.type === "success" ? "✅" : "❌"} {apiMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* ── PERSONAL DETAILS ── */}
            <div className="form-section-title">Personal Details</div>
            <div className="form-grid">

              <div className="field-group">
                <label className="field-label">Full Name *</label>
                <input name="fullName" type="text" placeholder="e.g. Ravi Kumar"
                  value={form.fullName} onChange={handleChange} onBlur={handleBlur}
                  className={fc("fullName")} />
                <Msg name="fullName" />
              </div>

              <div className="field-group">
                <label className="field-label">Father's Name *</label>
                <input name="fatherName" type="text" placeholder="e.g. Suresh Kumar"
                  value={form.fatherName} onChange={handleChange} onBlur={handleBlur}
                  className={fc("fatherName")} />
                <Msg name="fatherName" />
              </div>

              <div className="field-group">
                <label className="field-label">Date of Birth *</label>
                <input name="dob" type="date"
                  value={form.dob} onChange={handleChange} onBlur={handleBlur}
                  className={fc("dob")}
                  max={new Date().toISOString().split("T")[0]} />
                <Msg name="dob" />
              </div>

              <div className="field-group">
                <label className="field-label">Age (auto-filled)</label>
                <input name="age" type="number" placeholder="Auto from DOB"
                  value={form.age} onChange={handleChange} onBlur={handleBlur}
                  className={fc("age")} readOnly />
                <Msg name="age" />
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
                  <option value="">-- Select --</option>
                  {MARITAL_STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
                <Msg name="maritalStatus" />
              </div>

              <div className="field-group">
                <label className="field-label">Blood Group *</label>
                <select name="bloodGroup" value={form.bloodGroup}
                  onChange={handleChange} onBlur={handleBlur} className={sc("bloodGroup")}>
                  <option value="">-- Select --</option>
                  {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
                </select>
                <Msg name="bloodGroup" />
              </div>

              <div className="field-group">
                <label className="field-label">Aadhar Number *</label>
                <input name="aadhar" type="text" placeholder="12-digit Aadhar"
                  value={form.aadhar} onChange={handleChange} onBlur={handleBlur}
                  className={fc("aadhar")} maxLength={12} />
                <Msg name="aadhar" />
              </div>

            </div>

            {/* ── CONTACT DETAILS ── */}
            <div className="form-section-title">Contact Details</div>
            <div className="form-grid">

              <div className="field-group">
                <label className="field-label">Mobile Number *</label>
                <input name="mobile" type="tel" placeholder="10-digit mobile"
                  value={form.mobile} onChange={handleChange} onBlur={handleBlur}
                  className={fc("mobile")} maxLength={10} />
                <Msg name="mobile" />
              </div>

              <div className="field-group">
                <label className="field-label">Email Address *</label>
                <input name="email" type="email" placeholder="name@example.com"
                  value={form.email} onChange={handleChange} onBlur={handleBlur}
                  className={fc("email")} />
                <Msg name="email" />
              </div>

            </div>

            {/* ── ADDRESS ── */}
            <div className="form-section-title">Address</div>
            <div className="form-grid">

              <div className="field-group">
                <label className="field-label">State *</label>
                <select name="state" value={form.state}
                  onChange={handleChange} onBlur={handleBlur} className={sc("state")}>
                  <option value="">-- Select State --</option>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <Msg name="state" />
              </div>

              <div className="field-group">
                <label className="field-label">District *</label>
                <input name="district" type="text" placeholder="e.g. Hyderabad"
                  value={form.district} onChange={handleChange} onBlur={handleBlur}
                  className={fc("district")} />
                <Msg name="district" />
              </div>

              <div className="field-group">
                <label className="field-label">Pincode *</label>
                <input name="pincode" type="text" placeholder="6-digit pincode"
                  value={form.pincode} onChange={handleChange} onBlur={handleBlur}
                  className={fc("pincode")} maxLength={6} />
                <Msg name="pincode" />
              </div>

              <div className="field-group col-span-3">
                <label className="field-label">Full Address *</label>
                <textarea name="fullAddress" placeholder="Door no, Street, Locality…"
                  value={form.fullAddress} onChange={handleChange} onBlur={handleBlur}
                  className={tc("fullAddress")} />
                <Msg name="fullAddress" />
              </div>

            </div>

            {/* Actions */}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting
                  ? <><div className="spinner" /> Saving…</>
                  : "✔ Submit"}
              </button>
              <button type="button" className="btn btn-secondary"
                onClick={() => navigate("/")}>
                Cancel
              </button>
            </div>


          </form>
        </div>
      </div>
    </div>
  );
}
