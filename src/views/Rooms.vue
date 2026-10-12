<template>
  <div class="page-header">
    <div>
      <h2>Rooms</h2>
      <p class="sub">Click any room to view all its equipment.</p>
    </div>
    <button @click="openForm()">＋ Add room</button>
  </div>

  <Msg :m="msg" />

  <div v-if="form" class="form-card">
    <div class="form-title">{{ form.id ? "Edit room" : "Add new room" }}</div>
    <form class="grid" @submit.prevent="save">
      <input v-model="form.room_name" placeholder="Room name" required />
      <input v-model="form.building" placeholder="Building" required />
      <input v-model="form.floor" placeholder="Floor (optional)" />
      <select v-model="form.in_charge_id">
        <option :value="null">No in-charge assigned</option>
        <option v-for="u in incharges" :key="u.id" :value="u.id">{{ u.name }}</option>
      </select>
      <div class="full form-actions">
        <button type="button" class="btn-ghost" @click="form = null">Cancel</button>
        <button type="submit">{{ form.id ? "Update room" : "Save room" }}</button>
      </div>
    </form>
  </div>

  <div v-if="result.data.length === 0" class="empty">No rooms added yet.</div>
  <DataTable v-else>
    <thead>
      <tr>
        <th>Room name</th>
        <th>Building</th>
        <th>Floor</th>
        <th>In-charge</th>
        <th>Equipment</th>
        <th />
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="r in result.data"
        :key="r.id"
        class="clickable-row"
        title="Click row to view all equipment in this room"
        @click="router.push(`/equipment?room_id=${r.id}`)"
      >
        <td class="name">{{ r.room_name }} <span class="chevron">›</span></td>
        <td class="muted">{{ r.building }}</td>
        <td class="muted">{{ r.floor || "—" }}</td>
        <td :class="r.in_charge ? '' : 'muted'">{{ r.in_charge?.name ?? "—" }}</td>
        <td>
          <span class="count">{{ r.equipment_count }} item{{ r.equipment_count !== 1 ? "s" : "" }}</span>
        </td>
        <td @click.stop>
          <div class="row-actions">
            <button class="btn-ghost btn-sm" @click.stop="openForm(r)">Edit</button>
            <button class="btn-danger btn-sm" @click.stop="deleteTarget = r">Delete</button>
          </div>
        </td>
      </tr>
    </tbody>
  </DataTable>
  <Pager :meta="result" @page="page = $event" />

  <DeleteModal
    :is-open="!!deleteTarget"
    title="Delete Room"
    :item-title="deleteTarget?.room_name"
    confirm-text="Delete Room"
    :confirm-disabled="deleteTarget?.equipment_count > 0"
    @confirm="confirmDelete"
    @close="deleteTarget = null"
  >
    <template v-if="deleteTarget">
      Are you sure you want to delete room <span class="highlight">{{ deleteTarget.room_name }}</span>?
      <span v-if="deleteTarget.equipment_count > 0" class="warning">
        ⚠ This room still contains {{ deleteTarget.equipment_count }}
        item{{ deleteTarget.equipment_count !== 1 ? "s" : "" }}. Move or delete the equipment first.
      </span>
    </template>
  </DeleteModal>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import DataTable from "../components/DataTable.vue";
import DeleteModal from "../components/DeleteModal.vue";
import Msg from "../components/Msg.vue";
import Pager from "../components/Pager.vue";
import { usePagination } from "../composables/usePagination";
import { db, deleteRoom, roomsWithCount, saveRoom } from "../store";

const router = useRouter();

const { page, result } = usePagination(roomsWithCount);
const incharges = computed(() => db.users.filter((u) => u.role === "incharge" && u.status === "active"));

const form = ref(null);
const msg = ref(null);
const deleteTarget = ref(null);

const openForm = (room = null) => {
  msg.value = null;
  form.value = room
    ? { id: room.id, room_name: room.room_name, building: room.building, floor: room.floor, in_charge_id: room.in_charge_id }
    : { room_name: "", building: "", floor: "", in_charge_id: null };
};

const save = () => {
  try {
    msg.value = { ok: saveRoom(form.value) };
    form.value = null;
  } catch (er) {
    msg.value = { err: er.message };
  }
};

const confirmDelete = () => {
  try {
    msg.value = { ok: deleteRoom(deleteTarget.value.id) };
  } catch (er) {
    msg.value = { err: er.message };
  }
  deleteTarget.value = null;
};
</script>

<style scoped>
.sub {
  color: var(--fg2);
  font-size: 0.85rem;
  margin-top: 4px;
}
.name {
  font-weight: 600;
  color: var(--accent);
}
.chevron {
  opacity: 0.6;
  margin-left: 4px;
}
.muted {
  color: var(--fg3);
}
td.muted {
  color: var(--fg2);
}
.count {
  display: inline-flex;
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--accent);
  font-weight: 600;
  font-size: 0.8125rem;
  padding: 4px 10px;
  border-radius: 99px;
  transition: all var(--transition);
}
.clickable-row:hover .count {
  background: var(--accent-glow);
  border-color: var(--accent2);
}
.row-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.warning {
  display: block;
  margin-top: 10px;
  color: var(--yellow);
  font-size: 0.825rem;
}
</style>
