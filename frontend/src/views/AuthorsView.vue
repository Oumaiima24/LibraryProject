<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Auteurs</h1>
        <p class="page-subtitle">{{ total }} auteur{{ total !== 1 ? 's' : '' }} enregistrés</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ajouter un auteur
      </button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar card">
      <div class="search-wrap" style="flex:1;max-width:340px">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" class="input" placeholder="Rechercher un auteur..." @input="debouncedLoad" />
      </div>
    </div>

    <!-- Table -->
    <div class="card" style="margin-top:16px">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Auteur</th>
              <th>Nationalité</th>
              <th>Date de naissance</th>
              <th>Livres</th>
              <th style="width:100px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5">
                <div style="display:flex;flex-direction:column;gap:10px;padding:12px 16px">
                  <div v-for="i in 5" :key="i" class="skeleton"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="!authors.length">
              <td colspan="5">
                <div class="empty-state">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  <h4>Aucun auteur trouvé</h4>
                  <p>Ajoutez votre premier auteur ou modifiez votre recherche.</p>
                </div>
              </td>
            </tr>
            <tr v-for="a in authors" :key="a.id">
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="author-avatar">{{ initials(a.name) }}</div>
                  <div>
                    <div class="cell-primary">{{ a.name }}</div>
                    <div class="cell-secondary" v-if="a.bio">{{ truncate(a.bio, 55) }}</div>
                  </div>
                </div>
              </td>
              <td><span class="cell-secondary">{{ a.nationality || '—' }}</span></td>
              <td><span class="cell-secondary">{{ fmtDate(a.birthDate) }}</span></td>
              <td>
                <span class="badge badge-gray">{{ a._count?.books ?? a.booksCount ?? '—' }}</span>
              </td>
              <td>
                <div class="row-actions">
                  <button class="btn btn-ghost btn-sm btn-icon" title="Modifier" @click="openEdit(a)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="btn btn-ghost btn-sm btn-icon" style="color:var(--danger)" @click="askDelete(a)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <AppPagination :page="page" :per-page="perPage" :total="total" @change="loadAuthors" />
    </div>

    <!-- Create / Edit Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
          <div class="modal">
            <div class="modal-header">
              <h3>{{ editingAuthor ? 'Modifier l\'auteur' : 'Ajouter un auteur' }}</h3>
              <button class="btn btn-ghost btn-sm btn-icon" @click="showModal=false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-grid">
                <div class="form-group" style="grid-column:span 2">
                  <label class="form-label">Nom complet <span style="color:var(--danger)">*</span></label>
                  <input v-model="form.name" class="input" :class="{ error: errors.name }" placeholder="Ex: Victor Hugo" />
                  <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
                </div>
                <div class="form-group">
                  <label class="form-label">Nationalité</label>
                  <input v-model="form.nationality" class="input" placeholder="Ex: Française" />
                </div>
                <div class="form-group">
                  <label class="form-label">Date de naissance</label>
                  <input v-model="form.birthDate" class="input" type="date" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Biographie</label>
                <textarea v-model="form.bio" class="textarea" rows="4" placeholder="Courte biographie de l'auteur..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showModal=false">Annuler</button>
              <button class="btn btn-primary" :disabled="saving" @click="saveAuthor">
                <svg v-if="saving" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                {{ editingAuthor ? 'Enregistrer' : 'Créer' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ConfirmModal
      v-model="showConfirm"
      :title="`Supprimer «\u00a0${deleteTarget?.name}\u00a0»`"
      message="Cet auteur sera définitivement supprimé. Ses livres associés ne seront pas supprimés."
      :loading="deleting"
      @confirm="deleteAuthor"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import ConfirmModal  from '@/components/ui/ConfirmModal.vue'
import { authorsService } from '@/services/authors'
import { useToastStore }  from '@/stores/toast'

const toast   = useToastStore()
const authors = ref([])
const total   = ref(0)
const page    = ref(1)
const perPage = ref(10)
const loading = ref(false)
const search  = ref('')

const showModal    = ref(false)
const showConfirm  = ref(false)
const editingAuthor= ref(null)
const deleteTarget = ref(null)
const saving       = ref(false)
const deleting     = ref(false)

const form   = reactive({ name:'', nationality:'', birthDate:'', bio:'' })
const errors = reactive({})

let debounceTimer = null
function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => loadAuthors(1), 350)
}

async function loadAuthors(p = page.value) {
  loading.value = true; page.value = p
  try {
    const params = { page: p, limit: perPage.value }
    if (search.value) params.search = search.value
    const { data } = await authorsService.getAll(params)
    authors.value = data.data || data.items || data || []
    total.value   = data.total || data.meta?.total || authors.value.length
  } catch { toast.error('Impossible de charger les auteurs') }
  finally  { loading.value = false }
}

function openCreate() {
  editingAuthor.value = null
  Object.assign(form, { name:'', nationality:'', birthDate:'', bio:'' })
  Object.keys(errors).forEach(k => delete errors[k])
  showModal.value = true
}

function openEdit(a) {
  editingAuthor.value = a
  Object.assign(form, {
    name: a.name, nationality: a.nationality || '',
    birthDate: a.birthDate ? a.birthDate.slice(0,10) : '', bio: a.bio || ''
  })
  Object.keys(errors).forEach(k => delete errors[k])
  showModal.value = true
}

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.name.trim()) errors.name = 'Le nom est requis'
  return !Object.keys(errors).length
}

async function saveAuthor() {
  if (!validate()) return
  saving.value = true
  try {
    if (editingAuthor.value) {
      await authorsService.update(editingAuthor.value.id, { ...form })
      toast.success('Auteur modifié avec succès')
    } else {
      await authorsService.create({ ...form })
      toast.success('Auteur créé avec succès')
    }
    showModal.value = false
    loadAuthors(editingAuthor.value ? page.value : 1)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Une erreur est survenue')
  } finally { saving.value = false }
}

function askDelete(a) { deleteTarget.value = a; showConfirm.value = true }

async function deleteAuthor() {
  deleting.value = true
  try {
    await authorsService.remove(deleteTarget.value.id)
    toast.success('Auteur supprimé')
    showConfirm.value = false
    loadAuthors(authors.value.length === 1 && page.value > 1 ? page.value - 1 : page.value)
  } catch { toast.error('Impossible de supprimer') }
  finally  { deleting.value = false }
}

const initials  = (n) => n ? n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : '?'
const truncate  = (s,n) => s?.length > n ? s.slice(0,n)+'…' : s
const fmtDate   = (d) => d ? new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(d)) : '—'

onMounted(loadAuthors)
</script>

<style scoped>
.toolbar      { display:flex;align-items:center;gap:12px;padding:14px 16px; }
.cell-primary { font-weight:500;color:var(--text);font-size:.875rem; }
.cell-secondary { color:var(--text-2);font-size:.8rem; }
.row-actions  { display:flex;gap:2px; }
.author-avatar {
  width:36px;height:36px;border-radius:50%;
  background:var(--info-soft);color:var(--info);
  display:flex;align-items:center;justify-content:center;
  font-weight:600;font-size:.8rem;flex-shrink:0;
}
.skeleton { height:14px;border-radius:4px;background:linear-gradient(90deg,var(--surface-2) 25%,var(--border-soft) 50%,var(--surface-2) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite; }
@keyframes shimmer{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.spin { animation:spin 1s linear infinite; }
@keyframes spin{ to{transform:rotate(360deg)} }
</style>
