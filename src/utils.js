// Small helpers and constants shared by several views.

export const fmt = (d) => new Date(d).toLocaleString();

export const label = (s) => String(s).replaceAll("_", " ");

export const ACTIONS = ["cleaned", "repaired", "modified", "inspected", "part_replaced"];

export const STATUSES = ["working", "under_repair", "needs_replacement", "disposed"];

export const ROLES = [
  { value: "admin", text: "Admin" },
  { value: "technician", text: "Technician" },
  { value: "incharge", text: "Room in-charge" },
];

export const roleText = (role) => ROLES.find((r) => r.value === role)?.text ?? role;
