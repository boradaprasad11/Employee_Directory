const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const employeeRoutes = require("./routes/employees");
const projectRoutes = require("./routes/projects");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/employees", employeeRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => res.json({ message: "HRMS API running ✅" }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server on http://localhost:${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB error:", err.message));