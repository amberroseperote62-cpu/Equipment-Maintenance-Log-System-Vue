<template>
  <div class="table-wrapper">
    <div class="table-scroll">
      <!-- The parent supplies <thead> and <tbody> through the default slot -->
      <table><slot /></table>
    </div>
  </div>
</template>

<style scoped>
.table-wrapper {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin: 16px 0;
}
.table-scroll {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}

/* Slot content belongs to the parent, so :deep() is needed to style it from here */
table :deep(thead) {
  background: var(--surface2);
}
table :deep(th) {
  text-align: left;
  padding: 11px 16px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--fg2);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--border);
}
table :deep(td) {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 0.875rem;
  vertical-align: middle;
}
table :deep(tbody tr) {
  transition: background var(--transition);
}
table :deep(tbody tr:last-child td) {
  border-bottom: none;
}
table :deep(tbody tr:hover) {
  background: rgba(88, 166, 255, 0.03);
}

/* Rows that navigate somewhere when clicked */
table :deep(tr.clickable-row) {
  cursor: pointer;
}
table :deep(tr.clickable-row:hover) {
  background: rgba(88, 166, 255, 0.08);
}
table :deep(tr.clickable-row:active) {
  background: rgba(88, 166, 255, 0.14);
}
</style>
