<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        </svg>
      </div>
      <div class="brand-text">
        <span class="brand-name">Bibliothèque</span>
        <span class="brand-sub">Administration</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-label">Principal</div>
      <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="nav-item">
        <span class="nav-icon" v-html="item.icon"></span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="user-avatar">A</div>
        <div class="user-info">
          <span class="user-name">Administrateur</span>
          <span class="user-role">Super Admin</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
const navItems = [
  {
    to: '/dashboard', label: 'Tableau de bord',
    icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
  },
  {
    to: '/books', label: 'Livres',
    icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`
  },
  {
    to: '/authors', label: 'Auteurs',
    icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`
  },
  {
    to: '/users', label: 'Utilisateurs',
    icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`
  }
]
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0; left: 0;
  width: var(--sidebar-w);
  height: 100vh;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

/* Brand */
.sidebar-brand {
  display: flex; align-items: center; gap: 12px;
  padding: 20px 20px 18px;
  border-bottom: 1px solid var(--border-soft);
}
.brand-icon {
  width: 36px; height: 36px;
  background: var(--accent);
  color: #fff;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.brand-name  { display: block; font-weight: 600; font-size: .9rem; color: var(--text); line-height: 1.2; }
.brand-sub   { display: block; font-size: .72rem; color: var(--text-3); letter-spacing: .04em; text-transform: uppercase; }

/* Nav */
.sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }
.nav-section-label {
  font-size: .68rem; font-weight: 600; letter-spacing: .08em;
  text-transform: uppercase; color: var(--text-3);
  padding: 0 8px; margin-bottom: 6px;
}
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radius);
  font-size: .875rem;
  color: var(--text-2);
  transition: var(--transition);
  margin-bottom: 2px;
}
.nav-item:hover { background: var(--surface-2); color: var(--text); }
.nav-item.router-link-active { background: var(--accent-soft); color: var(--accent); font-weight: 500; }
.nav-icon { display: flex; align-items: center; }

/* Footer */
.sidebar-footer {
  border-top: 1px solid var(--border-soft);
  padding: 14px 16px;
}
.sidebar-user { display: flex; align-items: center; gap: 10px; }
.user-avatar  {
  width: 32px; height: 32px;
  background: var(--accent-2); color: var(--accent);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: .8rem;
}
.user-name { display: block; font-size: .8rem; font-weight: 500; color: var(--text); }
.user-role { display: block; font-size: .7rem; color: var(--text-3); }
</style>
