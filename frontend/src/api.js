const BASE_EMP = "http://localhost:5000/api/employees";
const BASE_PROJ = "http://localhost:5000/api/projects";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res.json();
}

/* ── Employee APIs ── */
export const getEmployees = (name = "", mobile = "") => {
  const p = new URLSearchParams();
  if (name) p.append("name", name);
  if (mobile) p.append("mobile", mobile);
  return request(`${BASE_EMP}${p.toString() ? "?" + p : ""}`);
};
export const getEmployee = (id) => request(`${BASE_EMP}/${id}`);
export const createEmployee = (body) => request(BASE_EMP, { method: "POST", body: JSON.stringify(body) });
export const updateEmployee = (id, body) => request(`${BASE_EMP}/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteEmployee = (id) => request(`${BASE_EMP}/${id}`, { method: "DELETE" });

/* ── Project APIs ── */
export const getProjects = (title = "") => {
  const p = new URLSearchParams();
  if (title) p.append("title", title);
  return request(`${BASE_PROJ}${p.toString() ? "?" + p : ""}`);
};
export const getProject = (id) => request(`${BASE_PROJ}/${id}`);
export const createProject = (body) => request(BASE_PROJ, { method: "POST", body: JSON.stringify(body) });
export const deleteProject = (id) => request(`${BASE_PROJ}/${id}`, { method: "DELETE" });

export const assignEmployee = (projectId, employeeId) =>
  request(`${BASE_PROJ}/${projectId}/assign`, {
    method: "POST",
    body: JSON.stringify({ employeeId }),
  });

export const removeEmployee = (projectId, employeeId) =>
  request(`${BASE_PROJ}/${projectId}/remove/${employeeId}`, { method: "DELETE" });