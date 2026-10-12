<template>
  <div v-if="m" class="note" :class="m.err ? 'err' : 'ok'" role="status">
    {{ m.err ? "⚠ " : "✓ " }}{{ m.err || m.ok }}
  </div>
</template>

<script setup>
// Success / error banner. `m` is { ok: "..." } or { err: "..." } (or null to hide it).
defineProps({ m: { type: Object, default: null } });
</script>

<style scoped>
.note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 12px;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}
.err {
  background: var(--red-bg);
  border: 1px solid rgba(248, 81, 73, 0.25);
  color: var(--red);
}
.ok {
  background: var(--green-bg);
  border: 1px solid rgba(63, 185, 80, 0.25);
  color: var(--green);
}
</style>
