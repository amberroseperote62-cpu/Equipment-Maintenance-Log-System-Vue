<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="brand-header">
        <RouterLink to="/" class="brand-logo" title="Back to home">
          <div class="logo-icon">🔧</div>
          <span>EMLS</span>
        </RouterLink>
        <h2>Register</h2>
        <p class="auth-subtitle">Create a new account to access the system</p>
      </div>

      <Msg :m="msg" />

      <form class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="reg-name">Full Name</label>
          <input
            id="reg-name"
            v-model="form.name"
            type="text"
            placeholder="John Doe"
            required
          />
        </div>

        <div class="form-group">
          <label for="reg-email">Email Address</label>
          <input
            id="reg-email"
            v-model="form.email"
            type="email"
            placeholder="johndoe@example.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="reg-role">Role</label>
          <select id="reg-role" v-model="form.role" required>
            <option v-for="r in ROLES" :key="r.value" :value="r.value">
              {{ r.text }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="reg-password">Password</label>
          <div class="password-wrapper">
            <input
              id="reg-password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="At least 4 characters"
              autocomplete="new-password"
              minlength="4"
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

        <div class="form-group">
          <label for="reg-confirm">Confirm Password</label>
          <input
            id="reg-confirm"
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Re-enter password"
            autocomplete="new-password"
            minlength="4"
            required
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? "Creating account…" : "Register Account →" }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Already have an account? <RouterLink to="/login">Sign in here</RouterLink></p>
        <RouterLink to="/" class="back-home">← Back to home</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import Msg from "../components/Msg.vue";
import { registerUser } from "../store";
import { ROLES } from "../utils";

const router = useRouter();

const form = reactive({
  name: "",
  email: "",
  role: "technician",
  password: "",
});

const confirmPassword = ref("");
const showPassword = ref(false);
const loading = ref(false);
const msg = ref(null);

const handleRegister = () => {
  msg.value = null;

  if (form.password !== confirmPassword.value) {
    msg.value = { err: "Passwords do not match." };
    return;
  }

  loading.value = true;
  try {
    registerUser({
      name: form.name,
      email: form.email,
      role: form.role,
      password: form.password,
    });
    router.push("/dashboard");
  } catch (err) {
    msg.value = { err: err.message };
  } finally {
    loading.value = false;
  }
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
  max-width: 460px;
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

.auth-footer {
  text-align: center;
  font-size: 0.85rem;
  color: var(--fg2);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 18px;
  margin-top: 20px;
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
