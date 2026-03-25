import api from './api'

export const authorsService = {
  getAll:  (params) => api.get('/authors', { params }),
  getOne:  (id)     => api.get(`/authors/${id}`),
  create:  (data)   => api.post('/authors', data),
  update:  (id, d)  => api.patch(`/authors/${id}`, d),
  remove:  (id)     => api.delete(`/authors/${id}`)
}
