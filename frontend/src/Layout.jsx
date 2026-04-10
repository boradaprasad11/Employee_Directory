import React from "react";
import Sidebar from "./Sidebar";

/*
  Layout wraps every page.
  Usage:
    <Layout title="Employee List" subtitle="..." actions={<button>...</button>}>
      ...page content...
    </Layout>
*/
export default function Layout({ title, subtitle, actions, children }) {
  return (
    <div style={{
      display: "flex",
      height: "100%",
      width: "100%",
      overflow: "hidden",
      background: "var(--bg)",
    }}>
      {/* ── Sidebar — flush to left edge ── */}
      <Sidebar />

      {/* ── Right side: topbar + scrollable content ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
      }}>
        {/* Topbar — full width, no gaps */}
        <div style={{
          height: "var(--topbar-h)",
          minHeight: "var(--topbar-h)",
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "var(--shadow-sm)",
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
                {subtitle}
              </div>
            )}
          </div>
          {actions && <div style={{ display: "flex", gap: 10 }}>{actions}</div>}
        </div>

        {/* Scrollable content area */}
        <div style={{
          flex: 1,
          overflowY: "auto",
        }}>
          <div style={{
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            minHeight: "min-content",
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
