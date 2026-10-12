<template>
  <div
    v-if="isOpen"
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    @click="emit('close')"
  >
    <form ref="dialog" class="dialog" @click.stop @submit.prevent="emit('confirm')">
      <div class="dialog-top">
        <div class="dialog-icon">
          <svg v-if="icon === 'ban'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </div>
        <div class="dialog-heading">
          <h3 id="dialog-title">{{ title }}</h3>
          <!-- Default slot = the message. If the parent sends nothing, this fallback text is used. -->
          <p class="dialog-desc">
            <slot>
              Are you sure you want to delete
              <span class="highlight">{{ itemTitle }}</span>? This action cannot be undone.
            </slot>
          </p>
        </div>
      </div>

      <!-- Optional extra content (for example a text box) -->
      <div v-if="$slots.extra" class="dialog-extra"><slot name="extra" /></div>

      <div class="dialog-actions">
        <button type="button" class="btn-ghost" @click="emit('close')">Cancel</button>
        <button ref="confirmBtn" type="submit" class="btn-danger" :disabled="confirmDisabled">
          {{ confirmText }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: "Confirm Deletion" },
  itemTitle: { type: String, default: "" },
  confirmText: { type: String, default: "Delete" },
  confirmDisabled: { type: Boolean, default: false },
  icon: { type: String, default: "trash" }, // "trash" or "ban"
});
const emit = defineEmits(["confirm", "close"]);

const dialog = ref(null);
const confirmBtn = ref(null);

const onKeyDown = (e) => {
  if (e.key === "Escape") emit("close");
};

// Listen for Esc only while the dialog is open, and move focus into it.
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      window.addEventListener("keydown", onKeyDown);
      nextTick(() => (dialog.value?.querySelector("input") ?? confirmBtn.value)?.focus());
    } else {
      window.removeEventListener("keydown", onKeyDown);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => window.removeEventListener("keydown", onKeyDown));
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.15s ease-out;
}

.dialog {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5);
  padding: 22px 24px;
  animation: scaleUp 0.15s ease-out;
}

.dialog-top {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 20px;
}

.dialog-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(248, 81, 73, 0.12);
  border: 1px solid rgba(248, 81, 73, 0.2);
  color: var(--red);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.dialog-heading {
  flex: 1;
}
.dialog-heading h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--fg);
  margin: 0 0 6px;
  text-transform: none;
  letter-spacing: normal;
}

.dialog-desc {
  font-size: 0.875rem;
  color: var(--fg2);
  line-height: 1.5;
}
/* :deep() because the highlighted name may come from the parent's slot content */
.dialog-desc :deep(.highlight) {
  color: var(--fg);
  font-weight: 600;
  background: var(--bg3);
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid var(--border);
}

.dialog-extra {
  margin-bottom: 18px;
}

.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
