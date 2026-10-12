<template>
  <div v-if="meta && meta.last_page > 1" class="pager">
    <button :disabled="meta.current_page <= 1" @click="emit('page', meta.current_page - 1)">← Prev</button>
    <span>Page {{ meta.current_page }} of {{ meta.last_page }}</span>
    <button :disabled="meta.current_page >= meta.last_page" @click="emit('page', meta.current_page + 1)">
      Next →
    </button>
  </div>
</template>

<script setup>
// Props go down, events come up: the parent owns the page number.
defineProps({ meta: { type: Object, default: null } });
const emit = defineEmits(["page"]);
</script>

<style scoped>
.pager {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding: 20px 0 8px;
}
.pager span {
  font-size: 0.8125rem;
  color: var(--fg2);
  min-width: 120px;
  text-align: center;
}
.pager button {
  background: var(--surface2);
  color: var(--fg2);
  border: 1px solid var(--border);
  padding: 7px 14px;
  font-size: 0.8125rem;
}
.pager button:hover:not(:disabled) {
  background: var(--bg3);
  color: var(--fg);
  box-shadow: none;
  transform: none;
}
</style>
