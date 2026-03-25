<template>
  <div class="app-shell">
    <AppSidebar />
    <div class="main-area">
      <AppHeader />
      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue'
import AppHeader  from './AppHeader.vue'
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
}
.main-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-w);
}
.main-content {
  flex: 1;
  padding: 32px 36px;
}
@media (max-width: 768px) {
  .main-area { margin-left: 0; }
  .main-content { padding: 20px 16px; }
}
</style>
