import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import EmployeeList from "./EmployeeList";
import CreateEmployee from "./CreateEmployee";
import EmployeeDetail from "./EmployeeDetail";
import ProjectsPage from "./ProjectsPage";
import ProjectDetail from "./ProjectDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/employees" replace />} />
      <Route path="/employees" element={<EmployeeList />} />
      <Route path="/create-employee" element={<CreateEmployee />} />
      <Route path="/employee/:id" element={<EmployeeDetail />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
    </Routes>
  );
}