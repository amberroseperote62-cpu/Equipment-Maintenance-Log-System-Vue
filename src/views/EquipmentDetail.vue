<template>
  <div v-if="!equipment" class="empty">
    Equipment not found. <RouterLink to="/equipment">Back to equipment</RouterLink>
  </div>

  <template v-else>
    <RouterLink to="/equipment" class="back-link">← Back to equipment</RouterLink>

    <div class="page-header">
      <div>
        <h2 class="title">
          {{ equipment.name }}
          <StatusBadge :value="equipment.status" />
        </h2>
        <div class="detail-meta">
          <span class="mono">#{{ equipment.property_number }}</span>
          <span class="sep">·</span>
          <span>{{ equipment.category }}</span>
          <span class="sep">·</span>
          <RouterLink :to="`/equipment?room_id=${equipment.room_id}`" title="View all equipment in this room">
            {{ room?.room_name }}{{ room?.building ? `, ${room.building}` : "" }}
          </RouterLink>
        </div>
      </div>
    </div>

    <Msg :m="msg" />

    <!-- Only admins and technicians can record maintenance -->
    <div v-if="canLog" class="form-card">
      <div class="form-title">📋 Record maintenance</div>
      <form class="grid" @submit.prevent="addEntry">
        <select v-model="log.action_type">
          <option v-for="a in ACTIONS" :key="a" :value="a">{{ label(a) }}</option>
        </select>
        <input v-model="log.description" placeholder="What was done? (description)" required />
        <input v-model="log.logged_at" type="datetime-local" title="Leave blank to use the current time" />
        <select v-model="log.equipment_status">
          <option value="">Keep current status</option>
          <option v-for="s in STATUSES" :key="s" :value="s">{{ label(s) }}</option>
        </select>
        <div class="full form-actions">
          <button type="submit">Save log entry</button>
        </div>
      </form>
    </div>

    <div class="section-header">
      <span class="section-title">History timeline</span>
    </div>

    <div v-if="logs.length === 0" class="empty">No maintenance history for this equipment yet.</div>
    <ul v-else class="timeline">
      <li v-for="l in logs" :key="l.id" :class="{ void: l.is_voided }">
        <div class="entry">
          <div class="entry-body">
            <b>{{ label(l.action_type) }}</b>
            <span class="dash">—</span>
            <span class="entry-desc">{{ l.description }}</span>
            <div>
              <small>{{ l.user?.name ?? "Unknown user" }} · {{ fmt(l.logged_at) }}</small>
            </div>
            <div v-if="l.is_voided" class="void-note">
              VOIDED by {{ l.voider?.name ?? "unknown" }}: {{ l.void_reason }}
            </div>
          </div>
          <button v-if="auth.user.role === 'admin' && !l.is_voided" class="btn-danger btn-sm" @click="openVoid(l)">
            Void
          </button>
        </div>
      </li>
    </ul>

    <!-- Reuses the DeleteModal component: the default slot is the message, `extra` holds the input -->
    <DeleteModal
      :is-open="!!voidTarget"
      icon="ban"
      title="Void Log Entry"
      confirm-text="Void Entry"
      :confirm-disabled="voidReason.trim().length < 3"
      @confirm="confirmVoid"
      @close="voidTarget = null"
    >
      Voiding invalidates this entry while keeping it in the audit history.
      <template #extra>
        <input v-model="voidReason" placeholder="Reason for voiding (required)…" required minlength="3" />
      </template>
    </DeleteModal>
  </template>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import DeleteModal from "../components/DeleteModal.vue";
import Msg from "../components/Msg.vue";
import StatusBadge from "../components/StatusBadge.vue";
import { addLog, auth, getEquipment, getRoom, logsFor, voidLog } from "../store";
import { ACTIONS, STATUSES, fmt, label } from "../utils";

// The route passes :id in as a prop (props: true in router.js)
const props = defineProps({ id: { type: String, required: true } });

const equipment = computed(() => getEquipment(props.id));
const room = computed(() => (equipment.value ? getRoom(equipment.value.room_id) : null));
const logs = computed(() => logsFor(props.id));
const canLog = computed(() => ["admin", "technician"].includes(auth.user.role));

const msg = ref(null);
const log = reactive({ action_type: "cleaned", description: "", logged_at: "", equipment_status: "" });

const addEntry = () => {
  try {
    msg.value = { ok: addLog({ ...log, equipment_id: props.id }) };
    log.description = "";
    log.logged_at = "";
    log.equipment_status = "";
  } catch (er) {
    msg.value = { err: er.message };
  }
};

// Void dialog
const voidTarget = ref(null);
const voidReason = ref("");

const openVoid = (l) => {
  voidTarget.value = l;
  voidReason.value = "";
};

const confirmVoid = () => {
  try {
    msg.value = { ok: voidLog(voidTarget.value.id, voidReason.value) };
  } catch (er) {
    msg.value = { err: er.message };
  }
  voidTarget.value = null;
};
</script>

<style scoped>
.back-link {
  display: inline-flex;
  color: var(--fg2);
  font-size: 0.8125rem;
  margin-bottom: 18px;
  font-weight: 500;
}
.back-link:hover {
  color: var(--accent);
  text-decoration: none;
}

.title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.detail-meta {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  color: var(--fg2);
  font-size: 0.875rem;
}
.detail-meta a {
  color: inherit;
  text-decoration: underline;
}
.sep {
  color: var(--border2);
}
.mono {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.8rem;
}

/* Timeline */
.timeline {
  list-style: none;
  position: relative;
}
.timeline::before {
  content: "";
  position: absolute;
  left: 11px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--accent), var(--purple));
  border-radius: 2px;
}
.timeline li {
  position: relative;
  padding: 14px 18px 14px 40px;
  margin-bottom: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: border-color var(--transition);
}
.timeline li:hover {
  border-color: var(--border2);
}
.timeline li::before {
  content: "";
  position: absolute;
  left: 6px;
  top: 20px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid var(--bg);
  box-shadow: 0 0 8px rgba(88, 166, 255, 0.4);
}
.timeline li.void {
  opacity: 0.55;
}

.entry {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.entry-body {
  flex: 1;
}
.entry-body b {
  color: var(--accent);
  font-size: 0.875rem;
  text-transform: capitalize;
}
.dash {
  color: var(--fg2);
  margin: 0 8px;
}
.entry-desc {
  font-size: 0.875rem;
}
small {
  color: var(--fg3);
  font-size: 0.75rem;
}
.void-note {
  margin-top: 6px;
  padding: 7px 10px;
  background: var(--red-bg);
  border: 1px solid rgba(248, 81, 73, 0.2);
  border-radius: var(--radius-sm);
  color: var(--red);
  font-size: 0.78rem;
}
</style>
