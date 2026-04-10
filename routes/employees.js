const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

/* ══════════════════════════════════════════════
   Helper — format mongoose validation errors
══════════════════════════════════════════════ */
function formatError(err) {
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return { status: 400, message: errors[0], errors };
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return { status: 400, message: `${field} already exists`, errors: [] };
  }
  return { status: 500, message: "Server error", errors: [err.message] };
}

/* ══════════════════════════════════════════════
   GET /api/employees
   Query params: ?name=&mobile=
══════════════════════════════════════════════ */
router.get("/", async (req, res) => {
  try {
    const { name, mobile } = req.query;
    const filter = {};

    if (name) filter.fullName = { $regex: name, $options: "i" };
    if (mobile) filter.mobile = { $regex: mobile, $options: "i" };

    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (err) {
    const { status, message } = formatError(err);
    res.status(status).json({ success: false, message });
  }
});

/* ══════════════════════════════════════════════
   GET /api/employees/:id
══════════════════════════════════════════════ */
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ══════════════════════════════════════════════
   POST /api/employees  — Create
══════════════════════════════════════════════ */
router.post("/", async (req, res) => {
  try {
    const employee = new Employee(req.body);
    const saved = await employee.save();
    res.status(201).json({
      success: true,
      data: saved,
      message: "Employee created successfully",
    });
  } catch (err) {
    const { status, message, errors } = formatError(err);
    res.status(status).json({ success: false, message, errors });
  }
});

/* ══════════════════════════════════════════════
   PUT /api/employees/:id  — Update
══════════════════════════════════════════════ */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated)
      return res.status(404).json({ success: false, message: "Employee not found" });
    res.json({
      success: true,
      data: updated,
      message: "Employee updated successfully",
    });
  } catch (err) {
    const { status, message, errors } = formatError(err);
    res.status(status).json({ success: false, message, errors });
  }
});

/* ══════════════════════════════════════════════
   DELETE /api/employees/:id
══════════════════════════════════════════════ */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Employee not found" });
    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
