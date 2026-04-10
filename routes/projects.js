const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

/* ══════════════════════════════════════════════
   GET /api/projects
   Query: ?title=
══════════════════════════════════════════════ */
router.get("/", async (req, res) => {
  try {
    const { title } = req.query;
    const filter = {};
    if (title) filter.title = { $regex: title, $options: "i" };

    const projects = await Project.find(filter)
      .populate("assignedEmployees", "fullName email mobile bloodGroup gender")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ══════════════════════════════════════════════
   GET /api/projects/:id
══════════════════════════════════════════════ */
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "assignedEmployees",
      "fullName email mobile bloodGroup gender district state"
    );
    if (!project)
      return res.status(404).json({ success: false, message: "Project not found" });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ══════════════════════════════════════════════
   POST /api/projects — Create
══════════════════════════════════════════════ */
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || title.trim().length < 3)
      return res.status(400).json({ success: false, message: "Title must be at least 3 characters" });
    if (!description || description.trim().length < 10)
      return res.status(400).json({ success: false, message: "Description must be at least 10 characters" });

    const project = new Project({ title, description });
    const saved = await project.save();
    res.status(201).json({ success: true, data: saved, message: "Project created successfully" });
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors)[0].message;
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ══════════════════════════════════════════════
   PUT /api/projects/:id — Update title/desc
══════════════════════════════════════════════ */
router.put("/:id", async (req, res) => {
  try {
    const { title, description } = req.body;
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true }
    ).populate("assignedEmployees", "fullName email mobile");

    if (!updated)
      return res.status(404).json({ success: false, message: "Project not found" });
    res.json({ success: true, data: updated, message: "Project updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ══════════════════════════════════════════════
   DELETE /api/projects/:id
══════════════════════════════════════════════ */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Project not found" });
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ══════════════════════════════════════════════
   POST /api/projects/:id/assign
   Body: { employeeId }
══════════════════════════════════════════════ */
router.post("/:id/assign", async (req, res) => {
  try {
    const { employeeId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: "Project not found" });

    if (project.assignedEmployees.includes(employeeId))
      return res.status(400).json({ success: false, message: "Employee already assigned" });

    project.assignedEmployees.push(employeeId);
    await project.save();

    const updated = await Project.findById(req.params.id).populate(
      "assignedEmployees", "fullName email mobile bloodGroup gender"
    );
    res.json({ success: true, data: updated, message: "Employee assigned successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ══════════════════════════════════════════════
   DELETE /api/projects/:id/remove/:employeeId
══════════════════════════════════════════════ */
router.delete("/:id/remove/:employeeId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: "Project not found" });

    project.assignedEmployees = project.assignedEmployees.filter(
      (e) => e.toString() !== req.params.employeeId
    );
    await project.save();

    const updated = await Project.findById(req.params.id).populate(
      "assignedEmployees", "fullName email mobile bloodGroup gender"
    );
    res.json({ success: true, data: updated, message: "Employee removed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
