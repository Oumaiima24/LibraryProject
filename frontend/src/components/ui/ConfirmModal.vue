<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
        <div class="modal confirm-modal">
          <div class="modal-body" style="padding: 28px 28px 0">
            <div class="confirm-icon danger">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </div>
            <h3 style="font-size:1.1rem;margin-bottom:8px">{{ title }}</h3>
            <p style="font-size:.875rem;color:var(--text-2);line-height:1.5">{{ message }}</p>
          </div>
          <div class="modal-footer" style="margin-top:24px">
            <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Annuler</button>
            <button class="btn btn-danger" :disabled="loading" @click="$emit('confirm')">
              <svg v-if="loading" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue:   { type: Boolean, default: false },
  title:        { type: String,  default: 'Confirmer la suppression' },
  message:      { type: String,  default: 'Cette action est irréversible.' },
  confirmLabel: { type: String,  default: 'Supprimer' },
  loading:      { type: Boolean, default: false }
})
defineEmits(['update:modelValue', 'confirm'])
</script>

<style scoped>
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
