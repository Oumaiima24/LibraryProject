<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Tableau de bord</h1>
        <p class="page-subtitle">Vue d'ensemble de la bibliothèque</p>
      </div>
      <button class="btn btn-secondary btn-sm" @click="loadAll">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
        Actualiser
      </button>
    </div>

    <!-- Stats grid -->
    <div class="stats-grid">
      <StatCard label="Total Livres"       :value="stats.books"   color="green"  :loading="loading" icon='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>' />
      <StatCard label="Total Auteurs"      :value="stats.authors" color="blue"   :loading="loading" icon='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>' />
      <StatCard label="Utilisateurs"       :value="stats.users"   color="yellow" :loading="loading" icon='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>' />
      <StatCard label="Livres disponibles" :value="stats.available" color="red"  :loading="loading" icon='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="20 6 9 17 4 12"/></svg>' />
    </div>

    <!-- Recent tables -->
    <div class="dashboard-grid">
      <!-- Recent books -->
      <div class="card">
        <div class="section-head">
          <h2 class="section-title">Derniers livres ajoutés</h2>
          <RouterLink to="/books" class="btn btn-ghost btn-sm">Voir tout →</RouterLink>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Auteur</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="4"><div class="skeleton-row"></div></td>
              </tr>
              <tr v-else-if="!recentBooks.length">
                <td colspan="4" style="text-align:center;color:var(--text-3);padding:28px">Aucun livre trouvé</td>
              </tr>
              <tr v-for="b in recentBooks" :key="b.id">
                <td><span class="cell-primary">{{ b.title }}</span></td>
                <td><span class="cell-secondary">{{ b.author?.name || '—' }}</span></td>
                <td>
                  <span class="badge" :class="b.available ? 'badge-green' : 'badge-yellow'">
                    {{ b.available ? 'Disponible' : 'Emprunté' }}
                  </span>
                </td>
                <td><span class="cell-secondary">{{ fmtDate(b.createdAt) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent users -->
      <div class="card">
        <div class="section-head">
          <h2 class="section-title">Derniers utilisateurs</h2>
          <RouterLink to="/users" class="btn btn-ghost btn-sm">Voir tout →</RouterLink>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="3"><div class="skeleton-row"></div></td>
              </tr>
              <tr v-else-if="!recentUsers.length">
                <td colspan="3" style="text-align:center;color:var(--text-3);padding:28px">Aucun utilisateur</td>
              </tr>
              <tr v-for="u in recentUsers" :key="u.id">
                <td>
                  <div style="display:flex;align-items:center;gap:9px">
                    <div class="avatar-sm">{{ initials(u.name) }}</div>
                    <span class="cell-primary">{{ u.name }}</span>
                  </div>
                </td>
                <td><span class="cell-secondary">{{ u.email }}</span></td>
                <td>
                  <span class="badge" :class="u.role === 'admin' ? 'badge-green' : 'badge-gray'">
                    {{ u.role === 'admin' ? 'Admin' : 'Membre' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StatCard from '@/components/ui/StatCard.vue'
import { booksService } from '@/services/books'
import { usersService } from '@/services/users'
import { authorsService } from '@/services/authors'

const loading     = ref(true)
const stats       = ref({ books: 0, authors: 0, users: 0, available: 0 })
const recentBooks = ref([])
const recentUsers = ref([])

async function loadAll() {
  loading.value = true
  try {
    const [booksRes, authorsRes, usersRes] = await Promise.all([
      booksService.getAll({ limit: 5, page: 1 }),
      authorsService.getAll({ limit: 1, page: 1 }),
      usersService.getAll({ limit: 5, page: 1 })
    ])
    const bData = booksRes.data
    const aData = authorsRes.data
    const uData = usersRes.data

    recentBooks.value = bData.data || bData.items || bData || []
    recentUsers.value = uData.data || uData.items || uData || []

    stats.value = {
      books:     bData.total || bData.meta?.total || recentBooks.value.length,
      authors:   aData.total || aData.meta?.total || 0,
      users:     uData.total || uData.meta?.total || recentUsers.value.length,
      available: recentBooks.value.filter(b => b.available).length
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fmtDate = (d) => d ? new Intl.DateTimeFormat('fr-FR', { day:'2-digit', month:'short', year:'numeric' }).format(new Date(d)) : '—'
const initials = (n) => n ? n.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '?'

onMounted(loadAll)
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.section-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--border-soft);
}
.section-title { font-size: 1rem; font-weight: 500; }
.cell-primary   { font-weight: 500; color: var(--text); }
.cell-secondary { color: var(--text-2); font-size: .8rem; }
.avatar-sm {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--accent-soft); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-size: .7rem; font-weight: 600; flex-shrink: 0;
}
.skeleton-row {
  height: 16px; border-radius: 4px;
  background: linear-gradient(90deg, var(--surface-2) 25%, var(--border-soft) 50%, var(--surface-2) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-grid { grid-template-columns: 1fr; }
}
</style>
