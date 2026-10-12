<template>
  <div class="page-header">
    <div>
      <h2>Equipment</h2>
      <div v-if="roomId" class="filter-chip">
        <span>Filtered by room: <b>{{ currentRoomName || `Room #${roomId}` }}</b></span>
        <button type="button" title="Clear room filter" @click="setRoomFilter('')">✕</button>
      </div>
    </div>
    <button v-if="isAdmin" @click="openForm()">＋ Add equipment</button>
  </div>

  <div class="toolbar">
    <input v-model="q" placeholder="🔍  Search by name or property number…" />
    <select :value="roomId" aria-label="Filter by room" @change="setRoomFilter($event.target.value)">
      <option value="">All rooms</option>
      <option v-for="r in db.rooms" :key="r.id" :value="String(r.id)">{{ r.room_name }}</option>
    </select>
  </div>

  <Msg :m="msg" />

  <!-- Create / Edit form (the same form is used for both) -->
  <div v-if="form" class="form-card">
    <div class="form-title">{{ form.id ? "Edit equipment" : "Add new equipment" }}</div>
    <form class="grid" @submit.prevent="save">
      <select v-model="form.room_id" required>
        <option value="">Select room</option>
        <option v-for="r in db.rooms" :key="r.id" :value="r.id">{{ r.room_name }}</option>
      </select>
      <input v-model="form.name" placeholder="Equipment name" required />
      <input v-model="form.property_number" placeholder="Property number" required />
      <input v-model="form.category" placeholder="Category" required />
      <div class="full form-actions">
        <button type="button" class="btn-ghost" @click="form = null">Cancel</button>
        <button type="submit">{{ form.id ? "Update equipment" : "Save equipment" }}</button>
      </div>
    </form>
  </div>

  <div v-if="result.data.length === 0" class="empty">
    {{ roomId ? `No equipment found in ${currentRoomName || "this room"}.` : "No equipment found." }}
  </div>
  <DataTable v-else>
    <thead>
      <tr>
        <th>Name</th>
        <th>Property No.</th>
        <th>Category</th>
        <th>Room</th>
        <th>Status</th>
        <th v-if="isAdmin" />
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="x in result.data"
        :key="x.id"
        class="clickable-row"
        title="Click row to view details"
        @click="router.push(`/equipment/${x.id}`)"
      >
        <td class="name">{{ x.name }}</td>
        <td class="mono">{{ x.property_number }}</td>
        <td class="muted">{{ x.category }}</td>
        <td class="muted">{{ x.room?.room_name ?? "—" }}</td>
        <td><StatusBadge :value="x.status" /></td>
        <td v-if="isAdmin" @click.stop>
          <div class="row-actions">
            <button class="btn-ghost btn-sm" @click.stop="openForm(x)">Edit</button>
            <button class="btn-danger btn-sm" @click.stop="deleteTarget = x">Delete</button>
          </div>
        </td>
      </tr>
    </tbody>
  </DataTable>
  <Pager :meta="result" @page="page = $event" />

  <DeleteModal
    :is-open="!!deleteTarget"
    title="Delete Equipment"
    :item-title="deleteTarget?.name"
    confirm-text="Delete Equipment"
    @confirm="confirmDelete"
    @close="deleteTarget = null"
  >
    <template v-if="deleteTarget">
      Are you sure you want to delete
      <span class="highlight">{{ deleteTarget.name }}</span>
      (#{{ deleteTarget.property_number }})? If it has maintenance history, it will be marked as
      disposed instead.
    </template>
  </DeleteModal>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import DataTable from "../components/DataTable.vue";
import DeleteModal from "../components/DeleteModal.vue";
import Msg from "../components/Msg.vue";
import Pager from "../components/Pager.vue";
import StatusBadge from "../components/StatusBadge.vue";
import { auth, db, deleteEquipment, queryEquipment, saveEquipment } from "../store";

const router = useRouter();
const route = useRoute();

const isAdmin = computed(() => auth.user.role === "admin");

// ── State ───────────────────────────────────────────────────
const q = ref("");
const page = ref(1);
const roomId = ref(String(route.query.room_id || ""));
const form = ref(null);
const msg = ref(null);
const deleteTarget = ref(null);

// READ: the visible rows, recomputed whenever search / room / page / data change
const result = computed(() => queryEquipment({ q: q.value, roomId: roomId.value, page: page.value }));

const currentRoomName = computed(() => db.rooms.find((r) => String(r.id) === roomId.value)?.room_name);

// Back to page 1 whenever the filters change
watch([q, roomId], () => (page.value = 1));

// Keep the filter in sync with ?room_id= in the URL (links from the Rooms page, back/forward buttons)
watch(
  () => route.query.room_id,
  (val) => (roomId.value = String(val || "")),
);

const setRoomFilter = (val) => {
  roomId.value = val;
  router.replace({ path: route.path, query: val ? { room_id: val } : {} });
};

// ── CREATE / UPDATE ─────────────────────────────────────────
const openForm = (item = null) => {
  msg.value = null;
  form.value = item
    ? { ...item } // edit: work on a copy so Cancel leaves the table untouched
    : { room_id: roomId.value ? Number(roomId.value) : "", name: "", property_number: "", category: "" };
};

const save = () => {
  try {
    msg.value = { ok: saveEquipment(form.value) };
    form.value = null;
  } catch (er) {
    msg.value = { err: er.message };
  }
};

// ── DELETE ──────────────────────────────────────────────────
const confirmDelete = () => {
  try {
    msg.value = { ok: deleteEquipment(deleteTarget.value.id) };
  } catch (er) {
    msg.value = { err: er.message };
  }
  deleteTarget.value = null;
};
</script>

<style scoped>
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  background: rgba(88, 166, 255, 0.1);
  border: 1px solid rgba(88, 166, 255, 0.25);
  color: var(--accent);
  font-size: 0.8125rem;
  padding: 4px 10px;
  border-radius: 99px;
}
.filter-chip button {
  background: transparent;
  color: var(--accent);
  padding: 0;
  font-size: 0.875rem;
  line-height: 1;
}
.filter-chip button:hover {
  color: var(--red);
  background: transparent;
  box-shadow: none;
  transform: none;
}

.toolbar select {
  flex: 0 1 200px;
}

.name {
  font-weight: 600;
  color: var(--accent);
}
.mono {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.8rem;
  color: var(--fg2);
}
.muted {
  color: var(--fg2);
}
.row-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
