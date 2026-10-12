<template>
  <!-- v-if: after sign-out `auth.user` is null for a moment, before the router leaves this page -->
  <nav v-if="auth.user" class="nav">
    <RouterLink to="/dashboard" class="nav-brand">
      <div class="brand-icon">🔧</div>
      <span>EMLS</span>
    </RouterLink>

    <RouterLink to="/dashboard" class="nav-link" :class="{ active: isActive('/dashboard') }">Dashboard</RouterLink>
    <RouterLink to="/equipment" class="nav-link" :class="{ active: isActive('/equipment') }">Equipment</RouterLink>

    <!-- Only admins see these links (the router guard blocks the URLs too) -->
    <template v-if="auth.user.role === 'admin'">
      <RouterLink to="/rooms" class="nav-link" :class="{ active: isActive('/rooms') }">Rooms</RouterLink>
      <RouterLink to="/users" class="nav-link" :class="{ active: isActive('/users') }">Users</RouterLink>
    </template>

    <span class="grow" />

    <div class="nav-user">
      <div class="nav-user-info">
        <div class="nav-user-name">{{ auth.user.name }}</div>
        <div class="nav-user-role">{{ roleText(auth.user.role) }}</div>
      </div>
      <button class="btn-ghost btn-sm" @click="onLogout">Sign out</button>
    </div>
  </nav>

  <main v-if="auth.user" class="page">
    <!-- The matched child page is rendered here -->
    <RouterView />
  </main>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { auth, logout } from "../store";
import { roleText } from "../utils";

const route = useRoute();
const router = useRouter();

const isActive = (to) => route.path.startsWith(to);

const onLogout = () => {
  logout();
  router.push("/");
};
</script>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 24px;
  height: var(--nav-h);
  background: rgba(13, 17, 23, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 1rem;
  color: var(--fg);
  margin-right: 16px;
  white-space: nowrap;
}
.nav-brand:hover {
  text-decoration: none;
  color: var(--fg);
}
.brand-icon {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, var(--accent), var(--purple));
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 15px;
}

.nav-link {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  color: var(--fg2);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all var(--transition);
}
.nav-link:hover {
  color: var(--fg);
  background: var(--bg3);
  text-decoration: none;
}
.nav-link.active {
  color: var(--accent);
  background: var(--accent-glow);
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 12px;
  border-left: 1px solid var(--border);
}
.nav-user-info {
  text-align: right;
  line-height: 1.3;
}
.nav-user-name {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--fg);
}
.nav-user-role {
  font-size: 0.6875rem;
  color: var(--fg3);
}

@media (max-width: 640px) {
  .nav {
    padding: 0 14px;
    overflow-x: auto;
  }
  .nav-user-info {
    display: none;
  }
}
</style>
