<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Utilisateurs</h1>
        <p class="page-subtitle">{{ total }} utilisateur{{ total !== 1 ? 's' : '' }} enregistrés</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ajouter un utilisateur
      </button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar card">
      <div class="search-wrap" style="flex:1;max-width:340px">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" class="input" placeholder="Rechercher par nom ou email..." @input="debouncedLoad" />
      </div>
      <select v-model="filterRole" class="select" style="width:160px" @change="loadUsers(1)">
        <option value="">Tous les rôles</option>
        <option value="admin">Admin</option>
        <option value="member">Membre</option>
      </select>
    </div>

    <!-- Table -->
    <div class="card" style="margin-top:16px">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Téléphone</th>
              <th>Inscription</th>
              <th style="width:100px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6">
                <div style="display:flex;flex-direction:column;gap:10px;padding:12px 16px">
                  <div v-for="i in 5" :key="i" class="skeleton"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="!users.length">
              <td colspan="6">
                <div class="empty-state">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  <h4>Aucun utilisateur trouvé</h4>
                  <p>Ajoutez votre premier utilisateur ou modifiez votre recherche.</p>
                </div>
              </td>
            </tr>
            <tr v-for="u in users" :key="u.id">
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="user-avatar" :class="`color-${colorFor(u.id)}`">
                    {{ initials(u.name || u.firstName + ' ' + u.lastName) }}
                  </div>
                  <div>
                    <div class="cell-primary">{{ u.name || [u.firstName, u.lastName].filter(Boolean).join(' ') }}</div>
                  </div>
                </div>
              </td>
              <td><span class="cell-secondary">{{ u.email }}</span></td>
              <td>
                <span class="badge" :class="u.role === 'admin' ? 'badge-green' : 'badge-gray'">
                  {{ u.role === 'admin' ? 'Admin' : 'Membre' }}
                </span>
              </td>
              <td><span class="cell-secondary">{{ u.phone || '—' }}</span></td>
              <td><span class="cell-secondary">{{ fmtDate(u.createdAt) }}</span></td>
              <td>
                <div class="row-actions">
                  <button class="btn btn-ghost btn-sm btn-icon" title="Modifier" @click="openEdit(u)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="btn btn-ghost btn-sm btn-icon" style="color:var(--danger)" @click="askDelete(u)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <AppPagination :page="page" :per-page="perPage" :total="total" @change="loadUsers" />
    </div>

    <!-- Create / Edit Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
          <div class="modal modal-lg">
            <div class="modal-header">
              <h3>{{ editingUser ? "Modifier l'utilisateur" : 'Ajouter un utilisateur' }}</h3>
              <button class="btn btn-ghost btn-sm btn-icon" @click="showModal=false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Nom complet <span style="color:var(--danger)">*</span></label>
                  <input v-model="form.name" class="input" :class="{ error: errors.name }" placeholder="Ex: Jean Dupont" />
                  <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
                </div>
                <div class="form-group">
                  <label class="form-label">Email <span style="color:var(--danger)">*</span></label>
                  <input v-model="form.email" class="input" :class="{ error: errors.email }" type="email" placeholder="jean@exemple.com" />
                  <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
                </div>
                <div class="form-group">
                  <label class="form-label">{{ editingUser ? 'Nouveau mot de passe' : 'Mot de passe' }} <span v-if="!editingUser" style="color:var(--danger)">*</span></label>
                  <input v-model="form.password" class="input" :class="{ error: errors.password }" type="password" :placeholder="editingUser ? 'Laisser vide pour ne pas changer' : 'Mot de passe sécurisé'" />
                  <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
                </div>
                <div class="form-group">
                  <label class="form-label">Rôle</label>
                  <select v-model="form.role" class="select">
                    <option value="member">Membre</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Téléphone</label>
                  <input v-model="form.phone" class="input" placeholder="+213 6 12 34 56 78" />
                </div>
                <div class="form-group">
                  <label class="form-label">Adresse</label>
                  <input v-model="form.address" class="input" placeholder="Adresse complète" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showModal=false">Annuler</button>
              <button class="btn btn-primary" :disabled="saving" @click="saveUser">
                <svg v-if="saving" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                {{ editingUser ? 'Enregistrer' : 'Créer' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ConfirmModal
      v-model="showConfirm"
      :title="`Supprimer «\u00a0${displayName(deleteTarget)}\u00a0»`"
      message="Cet utilisateur sera définitivement supprimé. Cette action est irréversible."
      :loading="deleting"
      @confirm="deleteUser"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import ConfirmModal  from '@/components/ui/ConfirmModal.vue'
import { usersService }  from '@/services/users'
import { useToastStore } from '@/stores/toast'

const toast   = useToastStore()
const users   = ref([])
const total   = ref(0)
const page    = ref(1)
const perPage = ref(10)
const loading = ref(false)
const search  = ref('')
const filterRole = ref('')

const showModal  = ref(false)
const showConfirm= ref(false)
const editingUser= ref(null)
const deleteTarget = ref(null)
const saving     = ref(false)
const deleting   = ref(false)

const form   = reactive({ name:'', email:'', password:'', role:'member', phone:'', address:'' })
const errors = reactive({})

const COLORS = ['green','blue','yellow']
const colorFor = (id) => COLORS[(parseInt(id) || 0) % COLORS.length] || 'green'

let debounceTimer = null
function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => loadUsers(1), 350)
}

async function loadUsers(p = page.value) {
  loading.value = true; page.value = p
  try {
    const params = { page:p, limit:perPage.value }
    if (search.value)   params.search = search.value
    if (filterRole.value) params.role = filterRole.value
    const { data } = await usersService.getAll(params)
    users.value = data.data || data.items || data || []
    total.value = data.total || data.meta?.total || users.value.length
  } catch { toast.error('Impossible de charger les utilisateurs') }
  finally  { loading.value = false }
}

function openCreate() {
  editingUser.value = null
  Object.assign(form, { name:'', email:'', password:'', role:'member', phone:'', address:'' })
  Object.keys(errors).forEach(k => delete errors[k])
  showModal.value = true
}

function openEdit(u) {
  editingUser.value = u
  Object.assign(form, {
    name: u.name || [u.firstName, u.lastName].filter(Boolean).join(' '),
    email: u.email, password: '', role: u.role || 'member',
    phone: u.phone || '', address: u.address || ''
  })
  Object.keys(errors).forEach(k => delete errors[k])
  showModal.value = true
}

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.name.trim()) errors.name = 'Le nom est requis'
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email invalide'
  if (!editingUser.value && !form.password) errors.password = 'Le mot de passe est requis'
  if (form.password && form.password.length < 6) errors.password = 'Minimum 6 caractères'
  return !Object.keys(errors).length
}

async function saveUser() {
  if (!validate()) return
  saving.value = true
  try {
    const payload = { ...form }
    if (editingUser.value && !payload.password) delete payload.password
    if (editingUser.value) {
      await usersService.update(editingUser.value.id, payload)
      toast.success('Utilisateur modifié avec succès')
    } else {
      await usersService.create(payload)
      toast.success('Utilisateur créé avec succès')
    }
    showModal.value = false
    loadUsers(editingUser.value ? page.value : 1)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Une erreur est survenue')
  } finally { saving.value = false }
}

function askDelete(u) { deleteTarget.value = u; showConfirm.value = true }

async function deleteUser() {
  deleting.value = true
  try {
    await usersService.remove(deleteTarget.value.id)
    toast.success('Utilisateur supprimé')
    showConfirm.value = false
    loadUsers(users.value.length === 1 && page.value > 1 ? page.value - 1 : page.value)
  } catch { toast.error('Impossible de supprimer') }
  finally  { deleting.value = false }
}

const displayName = (u) => u ? u.name || [u.firstName, u.lastName].filter(Boolean).join(' ') : ''
const initials = (n) => n ? n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : '?'
const fmtDate  = (d) => d ? new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(d)) : '—'

onMounted(loadUsers)
</script>

<style scoped>
.toolbar { display:flex;align-items:center;gap:12px;padding:14px 16px; }
.cell-primary   { font-weight:500;color:var(--text);font-size:.875rem; }
.cell-secondary { color:var(--text-2);font-size:.8rem; }
.row-actions    { display:flex;gap:2px; }
.user-avatar {
  width:36px;height:36px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-weight:600;font-size:.8rem;flex-shrink:0;
}
.color-green  { background:var(--accent-soft);color:var(--accent); }
.color-blue   { background:var(--info-soft);color:var(--info); }
.color-yellow { background:var(--warn-soft);color:var(--warn); }
.skeleton { height:14px;border-radius:4px;background:linear-gradient(90deg,var(--surface-2) 25%,var(--border-soft) 50%,var(--surface-2) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite; }
@keyframes shimmer{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.spin { animation:spin 1s linear infinite; }
@keyframes spin{ to{transform:rotate(360deg)} }
</style>
