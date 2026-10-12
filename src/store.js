// ─────────────────────────────────────────────────────────────
// store.js — the app's "database".
//
// There is no backend: everything lives in one reactive object (`db`)
// that is saved to localStorage, so data survives a page refresh.
// Every create / update / delete function below is plain CRUD on that
// object. Validation problems are thrown as Errors; the views catch
// them and show the message on screen.
// ─────────────────────────────────────────────────────────────
import { reactive, watch } from "vue";

const DATA_KEY = "emls:data:v2";
const SESSION_KEY = "emls:session:v2";

export const PER_PAGE = 8;

// ── Seed data (used on first run and by "Reset demo data") ────
const daysAgo = (n, hour = 9) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const seed = () => ({
  users: [
    { id: 1, name: "Alex Admin", email: "admin@example.com", password: "password123", role: "admin", status: "active" },
    { id: 2, name: "Tina Technician", email: "tech@example.com", password: "password123", role: "technician", status: "active" },
    { id: 3, name: "Frank Faculty", email: "faculty@example.com", password: "password123", role: "incharge", status: "active" },
  ],
  rooms: [
    { id: 1, room_name: "Computer Lab 1", building: "IT Building", floor: "2nd", in_charge_id: 3 },
  ],
  equipment: [
    { id: 1, room_id: 1, name: "Desktop PC 01", property_number: "PN-2023-001", category: "Computer", status: "working" },
    { id: 2, room_id: 1, name: "Desktop PC 02", property_number: "PN-2023-002", category: "Computer", status: "under_repair" },
    { id: 3, room_id: 1, name: "Ceiling Projector", property_number: "PN-2023-003", category: "Projector", status: "working" },
  ],
  logs: [
    { id: 1, equipment_id: 2, user_id: 2, action_type: "inspected", description: "Computer would not boot. Checked power supply.", logged_at: daysAgo(4), is_voided: false, void_reason: "", voided_by: null },
    { id: 2, equipment_id: 3, user_id: 2, action_type: "cleaned", description: "Cleaned the projector lens and air filter.", logged_at: daysAgo(2), is_voided: false, void_reason: "", voided_by: null },
  ],
  nextId: { users: 4, rooms: 2, equipment: 4, logs: 3 },
});

// ── Load / persist ───────────────────────────────────────────
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(DATA_KEY));
    if (saved && Array.isArray(saved.users) && Array.isArray(saved.rooms) && Array.isArray(saved.equipment) && Array.isArray(saved.logs) && saved.nextId) {
      return saved;
    }
  } catch {
    /* no saved data yet, or it was corrupted — fall through to the seed */
  }
  return seed();
}

export const db = reactive(load());

watch(
  db,
  () => {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(db));
    } catch {
      /* storage full or blocked — the app keeps working in memory */
    }
  },
  { deep: true, immediate: true },
);

/** Throw away every change and go back to the starting demo data. */
export function resetData() {
  Object.assign(db, seed());
}

// ── Session & Authentication ──
const savedSession = () => {
  try {
    return Number(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
};

export const auth = reactive({
  userId: savedSession(),
  // A getter, so it always reflects the latest user data (role changes, deletions…)
  get user() {
    const u = db.users.find((x) => x.id === this.userId);
    return u && u.status === "active" ? u : null;
  },
});

export function login(userId) {
  auth.userId = userId;
  try {
    localStorage.setItem(SESSION_KEY, String(userId));
  } catch {
    /* ignore */
  }
}

export function loginWithCredentials(email, password) {
  need(email, "Email");
  need(password, "Password");
  const normalizedEmail = email.trim().toLowerCase();
  const u = db.users.find((x) => x.email.toLowerCase() === normalizedEmail);
  if (!u) {
    throw new Error("No account found with this email address.");
  }
  if (u.status !== "active") {
    throw new Error("This account is currently inactive. Please contact an administrator.");
  }
  const expectedPassword = u.password || "password123";
  if (expectedPassword !== password) {
    throw new Error("Incorrect password. Please try again.");
  }
  login(u.id);
  return u;
}

export function registerUser({ name, email, password, role = "technician" }) {
  need(name, "Full name");
  need(email, "Email address");
  need(password, "Password");
  if (!EMAIL.test(email.trim())) {
    throw new Error("Please enter a valid email address.");
  }
  if (password.length < 4) {
    throw new Error("Password must be at least 4 characters long.");
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error(`The email address "${normalizedEmail}" is already registered.`);
  }

  const newUser = {
    id: nextId("users"),
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: role || "technician",
    status: "active",
  };
  db.users.push(newUser);
  login(newUser.id);
  return newUser;
}

export function logout() {
  auth.userId = null;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

// ── Helpers ──────────────────────────────────────────────────
const need = (value, name) => {
  if (!String(value ?? "").trim()) throw new Error(`${name} is required.`);
};

const nextId = (table) => db.nextId[table]++;

export const getUser = (id) => db.users.find((u) => u.id === Number(id));
export const getRoom = (id) => db.rooms.find((r) => r.id === Number(id));
export const getEquipment = (id) => db.equipment.find((e) => e.id === Number(id));

/** Slice a list into pages. Returns the rows for one page plus paging info. */
export function paginate(items, page = 1, perPage = PER_PAGE) {
  const last_page = Math.max(1, Math.ceil(items.length / perPage));
  const current_page = Math.min(Math.max(1, page), last_page);
  const start = (current_page - 1) * perPage;
  return { data: items.slice(start, start + perPage), current_page, last_page, total: items.length };
}

// ── Rooms (CRUD) ─────────────────────────────────────────────
export const roomsWithCount = () =>
  db.rooms.map((r) => ({
    ...r,
    in_charge: getUser(r.in_charge_id) ?? null,
    equipment_count: db.equipment.filter((e) => e.room_id === r.id).length,
  }));

/** Create when `form.id` is missing, otherwise update. Returns a success message. */
export function saveRoom(form) {
  need(form.room_name, "Room name");
  need(form.building, "Building");

  const name = form.room_name.trim();
  const building = form.building.trim();
  const duplicate = db.rooms.some(
    (r) =>
      r.id !== form.id &&
      r.room_name.toLowerCase() === name.toLowerCase() &&
      r.building.toLowerCase() === building.toLowerCase(),
  );
  if (duplicate) throw new Error(`"${name}" already exists in ${building}.`);

  const data = {
    room_name: name,
    building,
    floor: String(form.floor ?? "").trim(),
    in_charge_id: form.in_charge_id || null,
  };

  if (form.id) {
    Object.assign(getRoom(form.id), data); // UPDATE
    return "Room updated successfully.";
  }
  db.rooms.push({ id: nextId("rooms"), ...data }); // CREATE
  return "Room added successfully.";
}

export function deleteRoom(id) {
  const room = getRoom(id);
  if (!room) throw new Error("Room not found.");
  if (db.equipment.some((e) => e.room_id === room.id)) {
    throw new Error("This room still has equipment. Move or delete its equipment first.");
  }
  db.rooms.splice(db.rooms.indexOf(room), 1); // DELETE
  return `Room "${room.room_name}" deleted successfully.`;
}

// ── Equipment (CRUD) ─────────────────────────────────────────
/** Search + room filter + paging, all in one call (used by the equipment list). */
export function queryEquipment({ q = "", roomId = "", page = 1 } = {}) {
  const term = q.trim().toLowerCase();
  const rows = db.equipment
    .filter((e) => !roomId || e.room_id === Number(roomId))
    .filter((e) => !term || e.name.toLowerCase().includes(term) || e.property_number.toLowerCase().includes(term))
    .map((e) => ({ ...e, room: getRoom(e.room_id) ?? null }));
  return paginate(rows, page);
}

export function saveEquipment(form) {
  need(form.room_id, "Room");
  need(form.name, "Equipment name");
  need(form.property_number, "Property number");
  need(form.category, "Category");

  const propertyNumber = form.property_number.trim();
  const duplicate = db.equipment.some(
    (e) => e.id !== form.id && e.property_number.toLowerCase() === propertyNumber.toLowerCase(),
  );
  if (duplicate) throw new Error(`Property number ${propertyNumber} is already in use.`);

  const data = {
    room_id: Number(form.room_id),
    name: form.name.trim(),
    property_number: propertyNumber,
    category: form.category.trim(),
  };

  if (form.id) {
    Object.assign(getEquipment(form.id), data); // UPDATE
    return "Equipment updated successfully.";
  }
  db.equipment.push({ id: nextId("equipment"), ...data, status: "working" }); // CREATE
  return "Equipment added successfully.";
}

/** Equipment with maintenance history is marked "disposed" instead of being removed. */
export function deleteEquipment(id) {
  const item = getEquipment(id);
  if (!item) throw new Error("Equipment not found.");

  if (db.logs.some((l) => l.equipment_id === item.id)) {
    item.status = "disposed";
    return `${item.name} has maintenance history, so it was marked as disposed instead of deleted.`;
  }
  db.equipment.splice(db.equipment.indexOf(item), 1); // DELETE
  return `${item.name} deleted successfully.`;
}

// ── Maintenance logs ─────────────────────────────────────────
export const logsFor = (equipmentId) =>
  db.logs
    .filter((l) => l.equipment_id === Number(equipmentId))
    .map((l) => ({ ...l, user: getUser(l.user_id) ?? null, voider: getUser(l.voided_by) ?? null }))
    .sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at));

export const recentLogs = (limit = 5) =>
  db.logs
    .map((l) => ({ ...l, equipment: getEquipment(l.equipment_id) ?? null, user: getUser(l.user_id) ?? null }))
    .sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at))
    .slice(0, limit);

export function addLog({ equipment_id, action_type, description, logged_at, equipment_status }) {
  need(description, "Description");

  db.logs.push({
    id: nextId("logs"),
    equipment_id: Number(equipment_id),
    user_id: auth.userId,
    action_type,
    description: description.trim(),
    logged_at: logged_at ? new Date(logged_at).toISOString() : new Date().toISOString(),
    is_voided: false,
    void_reason: "",
    voided_by: null,
  });
  if (equipment_status) getEquipment(equipment_id).status = equipment_status;
  return "Log entry recorded.";
}

/** Voiding keeps the entry in the history but marks it invalid. */
export function voidLog(id, reason) {
  const log = db.logs.find((l) => l.id === id);
  if (!log) throw new Error("Log entry not found.");
  if (String(reason ?? "").trim().length < 3) throw new Error("Please give a reason (at least 3 characters).");

  log.is_voided = true;
  log.void_reason = reason.trim();
  log.voided_by = auth.userId;
  return "Log entry voided.";
}

// ── Users (CRUD) ─────────────────────────────────────────────
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function saveUser(form) {
  need(form.name, "Name");
  need(form.email, "Email");
  if (!EMAIL.test(form.email.trim())) throw new Error("Enter a valid email address.");

  const email = form.email.trim().toLowerCase();
  if (db.users.some((u) => u.id !== form.id && u.email.toLowerCase() === email)) {
    throw new Error(`${email} is already registered.`);
  }
  if (form.id && form.id === auth.userId && (form.role !== "admin" || form.status !== "active")) {
    throw new Error("You can't remove your own admin access.");
  }

  const existingUser = form.id ? getUser(form.id) : null;
  const password = form.password?.trim() ? form.password.trim() : (existingUser?.password || "password123");

  const data = { name: form.name.trim(), email, role: form.role, status: form.status || "active", password };

  if (form.id) {
    Object.assign(existingUser, data); // UPDATE
    return "User updated successfully.";
  }
  db.users.push({ id: nextId("users"), ...data }); // CREATE
  return "User added successfully.";
}

export function deleteUser(id) {
  const user = getUser(id);
  if (!user) throw new Error("User not found.");
  if (user.id === auth.userId) throw new Error("You can't delete the account you are signed in with.");

  db.rooms.forEach((r) => {
    if (r.in_charge_id === user.id) r.in_charge_id = null; // un-assign from their rooms
  });
  db.users.splice(db.users.indexOf(user), 1); // DELETE
  return `User "${user.name}" deleted successfully.`;
}
