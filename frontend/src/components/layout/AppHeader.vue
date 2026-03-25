<template>
  <header class="app-header">
    <div class="header-left">
      <nav class="breadcrumb">
        <span class="breadcrumb-item muted">Admin</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-item current">{{ currentPage }}</span>
      </nav>
    </div>
    <div class="header-right">
      <span class="header-date">{{ date }}</span>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const labels = { dashboard: 'Tableau de bord', books: 'Livres', authors: 'Auteurs', users: 'Utilisateurs' }
const currentPage = computed(() => labels[route.name] || 'Admin')

const date = new Intl.DateTimeFormat('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(new Date())
</script>

<style scoped>
.app-header {
  height: var(--header-h);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 36px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--surface);
  position: sticky; top: 0; z-index: 50;
}
.breadcrumb { display: flex; align-items: center; gap: 6px; font-size: .85rem; }
.breadcrumb-item.muted   { color: var(--text-3); }
.breadcrumb-item.current { font-weight: 500; color: var(--text); }
.breadcrumb-sep { color: var(--border); }
.header-date { font-size: .8rem; color: var(--text-3); }
</style>
