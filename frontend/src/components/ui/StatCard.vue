<template>
  <div class="stat-card card">
    <div class="stat-icon" :class="`color-${color}`">
      <span v-html="icon"></span>
    </div>
    <div class="stat-body">
      <div class="stat-value">{{ loading ? '—' : value }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
    <div v-if="trend !== undefined" class="stat-trend" :class="trend >= 0 ? 'up' : 'down'">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline :points="trend >= 0 ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
      </svg>
      {{ Math.abs(trend) }}%
    </div>
  </div>
</template>

<script setup>
defineProps({
  label:   String,
  value:   [String, Number],
  icon:    String,
  color:   { type: String, default: 'green' },
  trend:   Number,
  loading: Boolean
})
</script>

<style scoped>
.stat-card {
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: var(--transition);
}
.stat-card:hover { box-shadow: var(--shadow-md); }

.stat-icon {
  width: 44px; height: 44px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.color-green  { background: var(--accent-soft);  color: var(--accent); }
.color-blue   { background: var(--info-soft);    color: var(--info); }
.color-yellow { background: var(--warn-soft);    color: var(--warn); }
.color-red    { background: var(--danger-soft);  color: var(--danger); }

.stat-body { flex: 1; }
.stat-value { font-size: 1.6rem; font-weight: 600; line-height: 1.1; font-family: var(--font-display); }
.stat-label { font-size: .8rem; color: var(--text-2); margin-top: 3px; }

.stat-trend {
  display: flex; align-items: center; gap: 3px;
  font-size: .75rem; font-weight: 500;
  padding: 3px 7px; border-radius: 99px;
  align-self: flex-start; margin-top: 2px;
}
.stat-trend.up   { background: var(--accent-soft); color: var(--accent); }
.stat-trend.down { background: var(--danger-soft); color: var(--danger); }
</style>
