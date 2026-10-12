<template>
  <div class="landing">
    <section class="hero">
      <div class="logo">🔧</div>
      <h1>Equipment Maintenance Log System</h1>
      <p class="tagline">
        Keep track of every room, every piece of equipment and every repair — in one place.
      </p>

      <div class="hero-cta">
        <template v-if="auth.user">
          <button class="hero-btn primary" @click="router.push('/dashboard')">
            Continue as {{ auth.user.name }} →
          </button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="hero-btn primary">Sign In →</RouterLink>
          <RouterLink to="/register" class="hero-btn secondary">Register Account</RouterLink>
        </template>
      </div>
    </section>

    <section class="features">
      <article v-for="f in features" :key="f.title" class="feature">
        <div class="feature-icon">{{ f.icon }}</div>
        <h4>{{ f.title }}</h4>
        <p>{{ f.text }}</p>
      </article>
    </section>

    <section class="signin">
      <div class="signin-header">
        <h3>Choose a demo account</h3>
        <span class="auth-sub-links">
          or <RouterLink to="/login">Sign In with credentials</RouterLink> · <RouterLink to="/register">Register</RouterLink>
        </span>
      </div>

      <div class="accounts">
        <button v-for="u in activeUsers" :key="u.id" class="account btn-ghost" @click="enter(u.id)">
          <div class="account-left">
            <span class="account-name">{{ u.name }}</span>
            <span class="account-email">{{ u.email }} · password123</span>
          </div>
          <StatusBadge :value="u.role" :text="roleText(u.role)" />
        </button>
      </div>

      <p class="hint">Click any demo account above to sign in instantly, or use Sign In / Register.</p>
      <a href="#" class="reset" @click.prevent="reset">Reset demo data</a>
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import StatusBadge from "../components/StatusBadge.vue";
import { auth, db, login, resetData } from "../store";
import { roleText } from "../utils";

const router = useRouter();

const features = [
  { icon: "📦", title: "Equipment", text: "Add, edit, search and filter every item by room." },
  { icon: "📝", title: "Maintenance logs", text: "Record cleanings and repairs and follow each item's history." },
  { icon: "🏫", title: "Rooms", text: "Organise equipment by room, building and person in charge." },
  { icon: "👥", title: "Users & roles", text: "Admins manage accounts; technicians and in-charges see what they need." },
];

// Only active accounts can sign in
const activeUsers = computed(() => db.users.filter((u) => u.status === "active"));

const enter = (id) => {
  login(id);
  router.push("/dashboard");
};

const reset = () => {
  if (confirm("Reset demo data back to 3 users, 1 room, and 3 equipment?")) resetData();
};
</script>

<style scoped>
.landing {
  min-height: 100vh;
  padding: 64px 20px 48px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}
.landing::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(88, 166, 255, 0.14), transparent),
    radial-gradient(ellipse 60% 50% at 90% 90%, rgba(188, 140, 255, 0.08), transparent);
  pointer-events: none;
}
.landing > section {
  position: relative;
  width: 100%;
  max-width: 880px;
}

.hero {
  text-align: center;
}
.logo {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--accent), var(--purple));
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 26px;
  margin: 0 auto 18px;
  box-shadow: 0 0 30px rgba(88, 166, 255, 0.25);
}
h1 {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 10px;
}
.tagline {
  color: var(--fg2);
  font-size: 1rem;
  max-width: 520px;
  margin: 0 auto;
}

.hero-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}
.hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 22px;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  transition: all var(--transition);
  text-decoration: none;
}
.hero-btn.primary {
  background: var(--accent2);
  color: #fff;
}
.hero-btn.primary:hover {
  background: var(--accent);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(88, 166, 255, 0.35);
  text-decoration: none;
}
.hero-btn.secondary {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--fg);
}
.hero-btn.secondary:hover {
  background: var(--bg3);
  border-color: var(--border2);
  color: var(--fg);
  transform: translateY(-2px);
  text-decoration: none;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
}
.feature {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 18px;
  transition: border-color var(--transition), transform var(--transition);
}
.feature:hover {
  border-color: var(--border2);
  transform: translateY(-2px);
}
.feature-icon {
  font-size: 1.4rem;
  margin-bottom: 8px;
}
.feature h4 {
  font-size: 0.9rem;
  margin-bottom: 4px;
}
.feature p {
  color: var(--fg2);
  font-size: 0.8125rem;
}

.signin {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  padding: 28px;
  text-align: center;
  max-width: 480px !important;
}
.signin-header {
  margin-bottom: 16px;
}
.signin-header h3 {
  margin: 0 0 4px;
}
.auth-sub-links {
  font-size: 0.8rem;
  color: var(--fg3);
}
.accounts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.account {
  justify-content: space-between;
  padding: 10px 14px;
}
.account-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 2px;
}
.account-name {
  color: var(--fg);
  font-weight: 500;
}
.account-email {
  font-size: 0.72rem;
  color: var(--fg3);
}
.hint {
  color: var(--fg3);
  font-size: 0.8rem;
  margin-top: 16px;
}
.reset {
  display: inline-block;
  margin-top: 6px;
  font-size: 0.78rem;
  color: var(--fg3);
}
</style>
