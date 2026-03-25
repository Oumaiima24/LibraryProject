<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Livres</h1>
        <p class="page-subtitle">{{ total }} livre{{ total !== 1 ? 's' : '' }} au total</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ajouter un livre
      </button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar card">
      <div class="search-wrap" style="flex:1;max-width:340px">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" class="input" placeholder="Rechercher un livre..." @input="debouncedLoad" />
      </div>
      <select v-model="filterAvailable" class="select" style="width:170px" @change="loadBooks(1)">
        <option value="">Tous les statuts</option>
        <option value="true">Disponible</option>
        <option value="false">Emprunté</option>
      </select>
    </div>

    <!-- Table -->
    <div class="card" style="margin-top:16px">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Auteur</th>
              <th>ISBN</th>
              <th>Genre</th>
              <th>Année</th>
              <th>Statut</th>
              <th style="width:100px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7">
                <div style="display:flex;flex-direction:column;gap:10px;padding:12px 16px">
                  <div v-for="i in 5" :key="i" class="skeleton"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="!books.length">
              <td colspan="7">
                <div class="empty-state">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                  <h4>Aucun livre trouvé</h4>
                  <p>Ajoutez votre premier livre ou modifiez votre recherche.</p>
                </div>
              </td>
            </tr>
            <tr v-for="book in books" :key="book.id">
              <td>
                <div class="cell-with-icon">
                  <div class="book-thumb">{{ book.title?.[0]?.toUpperCase() || '?' }}</div>
                  <div>
                    <div class="cell-primary">{{ book.title }}</div>
                    <div class="cell-secondary" v-if="book.description">{{ truncate(book.description, 50) }}</div>
                  </div>
                </div>
              </td>
              <td><span class="cell-secondary">{{ book.author?.name || book.authorName || '—' }}</span></td>
              <td><span class="cell-mono">{{ book.isbn || '—' }}</span></td>
              <td><span class="cell-secondary">{{ book.genre || '—' }}</span></td>
              <td><span class="cell-secondary">{{ book.publishedYear || '—' }}</span></td>
              <td>
                <span class="badge" :class="book.available ? 'badge-green' : 'badge-yellow'">
                  {{ book.available ? 'Disponible' : 'Emprunté' }}
                </span>
              </td>
              <td>
                <div class="row-actions">
                  <button class="btn btn-ghost btn-sm btn-icon" title="Modifier" @click="openEdit(book)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="btn btn-ghost btn-sm btn-icon" title="Supprimer" style="color:var(--danger)" @click="askDelete(book)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <AppPagination :page="page" :per-page="perPage" :total="total" @change="loadBooks" />
    </div>

    <!-- Create / Edit Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
          <div class="modal modal-lg">
            <div class="modal-header">
              <h3>{{ editingBook ? 'Modifier le livre' : 'Ajouter un livre' }}</h3>
              <button class="btn btn-ghost btn-sm btn-icon" @click="showModal=false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Titre <span style="color:var(--danger)">*</span></label>
                  <input v-model="form.title" class="input" :class="{ error: errors.title }" placeholder="Ex: Le Petit Prince" />
                  <p v-if="errors.title" class="form-error">{{ errors.title }}</p>
                </div>
                <div class="form-group">
                  <label class="form-label">Auteur <span style="color:var(--danger)">*</span></label>
                  <select v-model="form.authorId" class="select" :class="{ error: errors.authorId }">
                    <option value="">— Sélectionner —</option>
                    <option v-for="a in authors" :key="a.id" :value="a.id">{{ a.name }}</option>
                  </select>
                  <p v-if="errors.authorId" class="form-error">{{ errors.authorId }}</p>
                </div>
                <div class="form-group">
                  <label class="form-label">ISBN</label>
                  <input v-model="form.isbn" class="input" placeholder="978-3-16-148410-0" />
                </div>
                <div class="form-group">
                  <label class="form-label">Genre</label>
                  <input v-model="form.genre" class="input" placeholder="Ex: Roman, Science-fiction..." />
                </div>
                <div class="form-group">
                  <label class="form-label">Année de publication</label>
                  <input v-model.number="form.publishedYear" class="input" type="number" min="1000" max="2099" placeholder="2024" />
                </div>
                <div class="form-group">
                  <label class="form-label">Statut</label>
                  <select v-model="form.available" class="select">
                    <option :value="true">Disponible</option>
                    <option :value="false">Emprunté</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea v-model="form.description" class="textarea" rows="3" placeholder="Résumé du livre..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showModal=false">Annuler</button>
              <button class="btn btn-primary" :disabled="saving" @click="saveBook">
                <svg v-if="saving" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                {{ editingBook ? 'Enregistrer' : 'Créer' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confirm delete -->
    <ConfirmModal
      v-model="showConfirm"
      :title="`Supprimer «\u00a0${deleteTarget?.title}\u00a0»`"
      message="Ce livre sera définitivement supprimé. Cette action est irréversible."
      :loading="deleting"
      @confirm="deleteBook"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import ConfirmModal  from '@/components/ui/ConfirmModal.vue'
import { booksService }   from '@/services/books'
import { authorsService } from '@/services/authors'
import { useToastStore }  from '@/stores/toast'

const toast   = useToastStore()
const books   = ref([])
const authors = ref([])
const total   = ref(0)
const page    = ref(1)
const perPage = ref(10)
const loading = ref(false)
const search  = ref('')
const filterAvailable = ref('')

const showModal   = ref(false)
const showConfirm = ref(false)
const editingBook = ref(null)
const deleteTarget= ref(null)
const saving      = ref(false)
const deleting    = ref(false)

const form = reactive({ title:'', authorId:'', isbn:'', genre:'', publishedYear:'', description:'', available:true })
const errors = reactive({})

let debounceTimer = null
function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => loadBooks(1), 350)
}

async function loadBooks(p = page.value) {
  loading.value = true
  page.value = p
  try {
    const params = { page: p, limit: perPage.value }
    if (search.value) params.search = search.value
    if (filterAvailable.value !== '') params.available = filterAvailable.value
    const { data } = await booksService.getAll(params)
    books.value = data.data || data.items || data || []
    total.value = data.total || data.meta?.total || books.value.length
  } catch { toast.error('Impossible de charger les livres') }
  finally   { loading.value = false }
}

async function loadAuthors() {
  try {
    const { data } = await authorsService.getAll({ limit: 999 })
    authors.value = data.data || data.items || data || []
  } catch {}
}

function openCreate() {
  editingBook.value = null
  Object.assign(form, { title:'', authorId:'', isbn:'', genre:'', publishedYear:'', description:'', available:true })
  Object.keys(errors).forEach(k => delete errors[k])
  showModal.value = true
}

function openEdit(book) {
  editingBook.value = book
  Object.assign(form, {
    title: book.title, authorId: book.authorId || book.author?.id || '',
    isbn: book.isbn || '', genre: book.genre || '',
    publishedYear: book.publishedYear || '', description: book.description || '',
    available: book.available ?? true
  })
  Object.keys(errors).forEach(k => delete errors[k])
  showModal.value = true
}

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.title.trim()) errors.title = 'Le titre est requis'
  if (!form.authorId)     errors.authorId = "L'auteur est requis"
  return !Object.keys(errors).length
}

async function saveBook() {
  if (!validate()) return
  saving.value = true
  try {
    const payload = { ...form }
    if (editingBook.value) {
      await booksService.update(editingBook.value.id, payload)
      toast.success('Livre modifié avec succès')
    } else {
      await booksService.create(payload)
      toast.success('Livre créé avec succès')
    }
    showModal.value = false
    loadBooks(editingBook.value ? page.value : 1)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Une erreur est survenue')
  } finally { saving.value = false }
}

function askDelete(book) { deleteTarget.value = book; showConfirm.value = true }

async function deleteBook() {
  deleting.value = true
  try {
    await booksService.remove(deleteTarget.value.id)
    toast.success('Livre supprimé')
    showConfirm.value = false
    loadBooks(books.value.length === 1 && page.value > 1 ? page.value - 1 : page.value)
  } catch { toast.error('Impossible de supprimer') }
  finally  { deleting.value = false }
}

const truncate = (s, n) => s?.length > n ? s.slice(0, n) + '…' : s

onMounted(() => { loadBooks(); loadAuthors() })
</script>

<style scoped>
.toolbar { display:flex; align-items:center; gap:12px; padding:14px 16px; }
.cell-primary   { font-weight:500; color:var(--text); font-size:.875rem; }
.cell-secondary { color:var(--text-2); font-size:.8rem; }
.cell-mono      { font-family:monospace; font-size:.8rem; color:var(--text-2); }
.row-actions    { display:flex; gap:2px; }
.cell-with-icon { display:flex; align-items:center; gap:10px; }
.book-thumb {
  width:32px; height:32px; border-radius:6px;
  background:var(--accent-soft); color:var(--accent);
  display:flex; align-items:center; justify-content:center;
  font-weight:600; font-size:.85rem; flex-shrink:0;
}
.skeleton {
  height:14px; border-radius:4px;
  background:linear-gradient(90deg,var(--surface-2) 25%,var(--border-soft) 50%,var(--surface-2) 75%);
  background-size:200% 100%; animation:shimmer 1.5s infinite;
}
@keyframes shimmer{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.spin { animation:spin 1s linear infinite; }
@keyframes spin{ to{transform:rotate(360deg)} }
</style>
