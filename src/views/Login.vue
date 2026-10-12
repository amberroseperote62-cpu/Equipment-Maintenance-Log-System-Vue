<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="brand-header">
        <RouterLink to="/" class="brand-logo" title="Back to home">
          <div class="logo-icon">🔧</div>
          <span>EMLS</span>
        </RouterLink>
        <h2>Sign In</h2>
        <p class="auth-subtitle">Enter your email and password to access your dashboard</p>
      </div>

      <Msg :m="msg" />

      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="login-email">Email Address</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            placeholder="admin@example.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="login-password">Password</label>
          <div class="password-wrapper">
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="toggle-pass"
              :title="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? "🙈" : "👁️" }}
            </button>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? "Signing in…" : "Sign In →" }}
        </button>
      </form>

      <div class="auth-divider">
        <span>or quick sign-in as demo</span>
      </div>

      <!-- Quick demo accounts -->
      <div class="demo-accounts">
        <button
          v-for="u in demoUsers"
          :key="u.id"
          type="button"
          class="demo-account-btn"
          @click="fillAndLogin(u)"
        >
          <div class="demo-info">
            <span class="demo-name">{{ u.name }}</span>
            <span class="demo-email">{{ u.email }}</span>
          </div>
          <span class="demo-role-badge" :class="u.role">{{ u.role }}</span>
        </button>
      </div>

      <div class="auth-footer">
        <p>Don't have an account? <RouterLink to="/register">Create an account</RouterLink></p>
        <RouterLink to="/" class="back-home">← Back to home</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import Msg from "../components/Msg.vue";
import { db, loginWithCredentials } from "../store";

const router = useRouter();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const msg = ref(null);

const demoUsers = computed(() => db.users.filter((u) => u.status === "active"));

const handleLogin = () => {
  msg.value = null;
  loading.value = true;
  try {
    loginWithCredentials(email.value, password.value);
    router.push("/dashboard");
  } catch (err) {
    msg.value = { err: err.message };
  } finally {
    loading.value = false;
  }
};

const fillAndLogin = (user) => {
  email.value = user.email;
  password.value = user.password || "password123";
  handleLogin();
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  position: relative;
  overflow: hidden;
  background: var(--bg);
}

.auth-page::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 70% 50% at 50% 10%, rgba(88, 166, 255, 0.12), transparent),
    radial-gradient(ellipse 50% 40% at 85% 85%, rgba(188, 140, 255, 0.08), transparent);
  pointer-events: none;
}

.auth-card {
  position: relative;
  width: 100%;
  max-width: 440px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  padding: 36px 32px;
  z-index: 1;
}

.brand-header {
  text-align: center;
  margin-bottom: 24px;
}

.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--fg);
  margin-bottom: 16px;
  text-decoration: none;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--accent), var(--purple));
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 18px;
  box-shadow: 0 0 16px rgba(88, 166, 255, 0.25);
}

.brand-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.auth-subtitle {
  color: var(--fg2);
  font-size: 0.85rem;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--fg2);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  padding-right: 42px;
}

.toggle-pass {
  position: absolute;
  right: 6px;
  background: transparent;
  border: none;
  color: var(--fg3);
  padding: 6px 8px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: none;
  transform: none;
}
.toggle-pass:hover {
  background: transparent;
  transform: none;
  box-shadow: none;
  opacity: 0.8;
}

.submit-btn {
  width: 100%;
  padding: 11px;
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 6px;
  border-radius: var(--radius-sm);
}

.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 22px 0 16px;
  color: var(--fg3);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.auth-divider::before,
.auth-divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid var(--border);
}
.auth-divider span {
  padding: 0 10px;
}

.demo-accounts {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 22px;
}

.demo-account-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--fg);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition);
  box-shadow: none;
}
.demo-account-btn:hover {
  border-color: var(--accent);
  background: var(--surface2);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.demo-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.demo-name {
  font-weight: 600;
  font-size: 0.85rem;
}
.demo-email {
  font-size: 0.75rem;
  color: var(--fg3);
}

.demo-role-badge {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 99px;
  letter-spacing: 0.04em;
}
.demo-role-badge.admin {
  background: rgba(188, 140, 255, 0.15);
  color: var(--purple);
}
.demo-role-badge.technician {
  background: var(--accent-glow);
  color: var(--accent);
}
.demo-role-badge.incharge {
  background: var(--green-bg);
  color: var(--green);
}

.auth-footer {
  text-align: center;
  font-size: 0.85rem;
  color: var(--fg2);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.back-home {
  font-size: 0.8rem;
  color: var(--fg3);
}
.back-home:hover {
  color: var(--fg);
}
</style>
