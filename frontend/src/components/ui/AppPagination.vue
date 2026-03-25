<template>
  <div class="pagination">
    <span class="pagination-info">
      {{ from }}–{{ to }} sur <strong>{{ total }}</strong> résultats
    </span>
    <div class="pagination-btns">
      <button class="btn btn-secondary btn-sm btn-icon" :disabled="page <= 1" @click="$emit('change', page - 1)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button
        v-for="p in pages"
        :key="p"
        class="btn btn-sm btn-icon"
        :class="p === page ? 'btn-primary' : 'btn-secondary'"
        :disabled="p === '...'"
        @click="p !== '...' && $emit('change', p)"
      >{{ p }}</button>
      <button class="btn btn-secondary btn-sm btn-icon" :disabled="page >= totalPages" @click="$emit('change', page + 1)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  page:       { type: Number, default: 1 },
  perPage:    { type: Number, default: 10 },
  total:      { type: Number, default: 0 }
})
defineEmits(['change'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))
const from = computed(() => props.total === 0 ? 0 : (props.page - 1) * props.perPage + 1)
const to   = computed(() => Math.min(props.page * props.perPage, props.total))

const pages = computed(() => {
  const n = totalPages.value
  if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1)
  const p = props.page
  if (p <= 4) return [1, 2, 3, 4, 5, '...', n]
  if (p >= n - 3) return [1, '...', n-4, n-3, n-2, n-1, n]
  return [1, '...', p-1, p, p+1, '...', n]
})
</script>
