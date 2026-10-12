<template>
  <div class="page-header">
    <div>
      <h2>{{ greeting() }}, {{ auth.user.name.split(" ")[0] }} 👋</h2>
      <p class="sub">Here's your maintenance overview for today.</p>
    </div>
  </div>

  <!-- Summary cards: a v-for over a computed list -->
  <div class="stats">
    <component
      :is="s.to ? 'RouterLink' : 'div'"
      v-for="s in stats"
      :key="s.label"
      :to="s.to"
      class="stat"
      :class="{ link: s.to }"
    >
      <b>{{ s.value }}</b>
      <span>{{ s.label }}</span>
    </component>
  </div>

  <div class="section-header">
    <span class="section-title">Recent log entries</span>
  </div>

  <div v-if="logs.length === 0" class="empty">No log entries yet.</div>
  <div v-else class="logs-card">
    <ul>
      <li
        v-for="l in logs"
        :key="l.id"
        :class="{ void: l.is_voided }"
        title="Click to view equipment"
        @click="l.equipment && router.push(`/equipment/${l.equipment.id}`)"
      >
        <div class="log-row">
          <div>
            <b class="log-equipment">{{ l.equipment?.name ?? "Removed equipment" }}</b>
            <span class="dot">·</span>
            <span class="log-action">{{ label(l.action_type) }}</span>
            <div class="log-desc">{{ l.description }}</div>
          </div>
          <div class="log-meta">
            <div>{{ l.user?.name ?? "Unknown user" }}</div>
            <div>{{ fmt(l.logged_at) }}</div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { auth, db, recentLogs } from "../store";
import { fmt, label } from "../utils";

const router = useRouter();

// Summary cards: Rooms, Equipment, Logs, Users
const stats = computed(() => {
  const list = [];
  if (auth.user.role === "admin") {
    list.push({ label: "Rooms", value: db.rooms.length, to: "/rooms" });
  }
  list.push({ label: "Equipment", value: db.equipment.length, to: "/equipment" });
  list.push({ label: "Maintenance Logs", value: db.logs.filter((l) => !l.is_voided).length });
  if (auth.user.role === "admin") {
    list.push({ label: "Active Users", value: db.users.filter((u) => u.status === "active").length, to: "/users" });
  }
  return list;
});

const logs = computed(() => recentLogs(5));

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};
</script>

<style scoped>
.sub {
  color: var(--fg2);
  font-size: 0.875rem;
  margin-top: 2px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 16px;
  margin-bottom: 8px;
}
.stat {
  display: block;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 22px;
  position: relative;
  overflow: hidden;
  transition: all var(--transition);
}
.stat::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--purple));
}
.stat.link {
  cursor: pointer;
}
.stat:hover {
  border-color: var(--border2);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  text-decoration: none;
}
.stat b {
  display: block;
  font-size: 2.1rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 6px;
  color: var(--fg);
}
.stat span {
  font-size: 0.8rem;
  color: var(--fg3);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.logs-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
ul {
  list-style: none;
}
li {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background var(--transition);
}
li:last-child {
  border-bottom: none;
}
li:hover {
  background: var(--surface2);
}
li.void {
  opacity: 0.5;
}

.log-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.log-equipment {
  color: var(--accent);
  font-size: 0.875rem;
}
.dot {
  color: var(--fg3);
  margin: 0 6px;
}
.log-action {
  color: var(--fg2);
  text-transform: capitalize;
}
.log-desc {
  color: var(--fg2);
  font-size: 0.8125rem;
  margin-top: 3px;
}
.log-meta {
  text-align: right;
  flex-shrink: 0;
  color: var(--fg3);
  font-size: 0.75rem;
}
</style>
