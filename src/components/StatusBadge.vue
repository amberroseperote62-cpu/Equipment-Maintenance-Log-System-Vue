<template>
  <span class="badge" :class="value">{{ text || label(value) }}</span>
</template>

<script setup>
import { label } from "../utils";

// `value` picks the colour (an equipment status or a user role); `text` overrides the wording.
defineProps({
  value: { type: String, required: true },
  text: { type: String, default: "" },
});
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 99px;
  text-transform: capitalize;
  background: var(--bg3);
  color: var(--fg2);
  border: 1px solid var(--border);
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.badge::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.8;
}

/* equipment statuses */
.working,
.incharge {
  background: var(--green-bg);
  color: var(--green);
  border-color: rgba(63, 185, 80, 0.25);
}
.under_repair,
.technician {
  background: var(--yellow-bg);
  color: var(--yellow);
  border-color: rgba(210, 153, 34, 0.25);
}
.needs_replacement {
  background: var(--red-bg);
  color: var(--red);
  border-color: rgba(248, 81, 73, 0.25);
}
.disposed {
  background: var(--bg3);
  color: var(--fg3);
  border-color: var(--border);
}
/* user roles */
.admin {
  background: rgba(188, 140, 255, 0.12);
  color: var(--purple);
  border-color: rgba(188, 140, 255, 0.25);
}
</style>
