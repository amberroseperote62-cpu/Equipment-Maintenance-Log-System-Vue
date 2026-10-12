<template>
  <RouterView />
</template>

<!--
  App.vue holds the only *global* styles: design tokens, the CSS reset and the
  look of plain HTML elements (inputs, buttons) plus a few layout helpers that
  every page shares. Everything else is styled inside its own component.
-->
<style>
/* ─── Design tokens ─────────────────────────────────────────── */
:root {
  --bg: #0d1117;
  --bg2: #161b22;
  --bg3: #21262d;
  --surface: #1c2128;
  --surface2: #262c36;
  --border: #30363d;
  --border2: #444c56;
  --fg: #e6edf3;
  --fg2: #8b949e;
  --fg3: #6e7681;
  --accent: #58a6ff;
  --accent2: #388bfd;
  --accent-glow: rgba(88, 166, 255, 0.15);
  --green: #3fb950;
  --green-bg: rgba(63, 185, 80, 0.12);
  --yellow: #d29922;
  --yellow-bg: rgba(210, 153, 34, 0.15);
  --red: #f85149;
  --red-bg: rgba(248, 81, 73, 0.12);
  --purple: #bc8cff;
  --shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --radius: 10px;
  --radius-sm: 6px;
  --radius-lg: 14px;
  --nav-h: 60px;
  --transition: 0.18s ease;
}

/* ─── Reset ─────────────────────────────────────────────────── */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--fg);
  font-size: 14px;
  line-height: 1.6;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--bg);
}
::-webkit-scrollbar-thumb {
  background: var(--border2);
  border-radius: 4px;
}

/* ─── Typography ────────────────────────────────────────────── */
a {
  color: var(--accent);
  text-decoration: none;
  transition: color var(--transition);
}
a:hover {
  color: #79c0ff;
  text-decoration: underline;
}

h2 {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 20px;
  color: var(--fg);
}

h3 {
  font-size: 0.75rem;
  font-weight: 600;
  margin: 24px 0 12px;
  color: var(--fg2);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ─── Form controls ─────────────────────────────────────────── */
input,
select,
textarea {
  width: 100%;
  padding: 9px 13px;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--fg);
  font: inherit;
  font-size: 0.875rem;
  transition: border-color var(--transition), box-shadow var(--transition);
  outline: none;
}
input:focus,
select:focus,
textarea:focus {
  border-color: var(--accent2);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
input::placeholder,
textarea::placeholder {
  color: var(--fg3);
}
select option {
  background: var(--bg2);
}

/* ─── Buttons ───────────────────────────────────────────────── */
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-sm);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  background: var(--accent2);
  color: #fff;
  white-space: nowrap;
}
button:hover {
  background: var(--accent);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(88, 166, 255, 0.3);
}
button:active {
  transform: translateY(0);
}
button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

button.btn-ghost {
  background: transparent;
  color: var(--fg2);
  border: 1px solid var(--border);
}
button.btn-ghost:hover {
  background: var(--bg3);
  color: var(--fg);
  border-color: var(--border2);
  box-shadow: none;
}

button.btn-danger {
  background: transparent;
  color: var(--red);
  border: 1px solid rgba(248, 81, 73, 0.3);
}
button.btn-danger:hover {
  background: var(--red-bg);
  border-color: var(--red);
  box-shadow: none;
}

button.btn-sm {
  padding: 5px 10px;
  font-size: 0.8125rem;
}

/* ─── Layout helpers shared by every page ───────────────────── */
.page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}
.page-header h2 {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 24px 0 12px;
}
.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--fg3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.form-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin: 16px 0;
}
.form-card .form-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--fg);
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}
.full {
  grid-column: 1 / -1;
}
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.toolbar input {
  flex: 1;
  min-width: 200px;
}

.empty {
  color: var(--fg3);
  text-align: center;
  padding: 48px 20px;
  font-size: 0.9rem;
}

.grow {
  flex: 1;
}

@media (max-width: 640px) {
  .page {
    padding: 20px 14px;
  }
}
</style>
