import api from './api'

export const booksService = {
  getAll:    (params) => api.get('/books', { params }),
  getOne:    (id)     => api.get(`/books/${id}`),
  create:    (data)   => api.post('/books', data),
  update:    (id, d)  => api.patch(`/books/${id}`, d),
  remove:    (id)     => api.delete(`/books/${id}`),
  getStats:  ()       => api.get('/books/stats')
}
