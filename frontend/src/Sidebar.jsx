import React from "react";
import { NavLink } from "react-router-dom";

const NAV = [
  {
    label: "Employee List",
    path: "/employees",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: "Projects",
    path: "/projects",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  return (
    <aside style={{
      width: "var(--sidebar-w)",
      minWidth: "var(--sidebar-w)",
      height: "100vh",
      background: "var(--sidebar-bg)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      overflow: "hidden",
    }}>
      {/* Brand — same height as topbar so they align */}
      <div style={{
        height: "var(--topbar-h)",
        minHeight: "var(--topbar-h)",
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
            Entro<span style={{ color: "#38bdf8" }}>Labs</span>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>
            Employee Management
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "14px 0" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255, 255, 255, 1)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 20px 10px" }}>
          Main Menu
        </div>
        {NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "#fff" : "rgba(255,255,255,0.48)",
              textDecoration: "none",
              borderLeft: `3px solid ${isActive ? "#38bdf8" : "transparent"}`,
              background: isActive ? "rgba(56,189,248,0.09)" : "transparent",
              transition: "all 0.13s",
            })}
          >
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}