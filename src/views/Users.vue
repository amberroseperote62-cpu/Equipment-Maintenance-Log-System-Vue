<template>
  <div class="page-header">
    <h2>Users</h2>
    <button @click="openForm()">＋ Add user</button>
  </div>

  <Msg :m="msg" />

  <div v-if="form" class="form-card">
    <div class="form-title">{{ form.id ? "Edit user" : "Add new user" }}</div>
    <form class="grid" @submit.prevent="save">
      <input v-model="form.name" placeholder="Full name" required />
      <input v-model="form.email" type="email" placeholder="Email address" required />
      <input
        v-model="form.password"
        type="password"
        :placeholder="form.id ? 'Password (leave blank to keep unchanged)' : 'Password (default: password123)'"
      />
      <select v-model="form.role">
        <option v-for="r in ROLES" :key="r.value" :value="r.value">{{ r.text }}</option>
      </select>
      <select v-model="form.status">
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <div class="full form-actions">
        <button type="button" class="btn-ghost" @click="form = null">Cancel</button>
        <button type="submit">{{ form.id ? "Update user" : "Save user" }}</button>
      </div>
    </form>
  </div>

  <div v-if="result.data.length === 0" class="empty">No users found.</div>
  <DataTable v-else>
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Status</th>
        <th />
      </tr>
    </thead>
    <tbody>
      <tr v-for="u in result.data" :key="u.id">
        <td class="name">
          {{ u.name }}
          <span v-if="u.id === auth.userId" class="you">you</span>
        </td>
        <td class="muted">{{ u.email }}</td>
        <td><StatusBadge :value="u.role" :text="roleText(u.role)" /></td>
        <td>
          <span class="status" :class="u.status">{{ u.status }}</span>
        </td>
        <td>
          <div class="row-actions">
            <button class="btn-ghost btn-sm" @click="openForm(u)">Edit</button>
            <button class="btn-danger btn-sm" @click="deleteTarget = u">Delete</button>
          </div>
        </td>
      </tr>
    </tbody>
  </DataTable>
  <Pager :meta="result" @page="page = $event" />

  <DeleteModal
    :is-open="!!deleteTarget"
    title="Delete User"
    :item-title="deleteTarget?.name"
    confirm-text="Delete User"
    @confirm="confirmDelete"
    @close="deleteTarget = null"
  >
    <template v-if="deleteTarget">
      Are you sure you want to delete user <span class="highlight">{{ deleteTarget.name }}</span>
      ({{ deleteTarget.email }})? They will no longer have access to the system.
    </template>
  </DeleteModal>
</template>

<script setup>
import { ref } from "vue";
import DataTable from "../components/DataTable.vue";
import DeleteModal from "../components/DeleteModal.vue";
import Msg from "../components/Msg.vue";
import Pager from "../components/Pager.vue";
import StatusBadge from "../components/StatusBadge.vue";
import { usePagination } from "../composables/usePagination";
import { auth, db, deleteUser, saveUser } from "../store";
import { ROLES, roleText } from "../utils";

const { page, result } = usePagination(() => db.users);

const form = ref(null);
const msg = ref(null);
const deleteTarget = ref(null);

const openForm = (user = null) => {
  msg.value = null;
  form.value = user ? { ...user } : { name: "", email: "", role: "technician", status: "active" };
};

const save = () => {
  try {
    msg.value = { ok: saveUser(form.value) };
    form.value = null;
  } catch (er) {
    msg.value = { err: er.message };
  }
};

const confirmDelete = () => {
  try {
    msg.value = { ok: deleteUser(deleteTarget.value.id) };
  } catch (er) {
    msg.value = { err: er.message };
  }
  deleteTarget.value = null;
};
</script>

<style scoped>
.name {
  font-weight: 500;
  color: var(--fg);
}
.you {
  margin-left: 6px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent);
  background: var(--accent-glow);
  padding: 1px 6px;
  border-radius: 99px;
}
.muted {
  color: var(--fg2);
}
.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  text-transform: capitalize;
}
.status::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.status.active {
  color: var(--green);
}
.status.inactive {
  color: var(--fg3);
}
.row-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
