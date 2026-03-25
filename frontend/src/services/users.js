import api from './api'

export const usersService = {
  getAll:  (params) => api.get('/users', { params }),
  getOne:  (id)     => api.get(`/users/${id}`),
  create:  (data)   => api.post('/users', data),
  update:  (id, d)  => api.patch(`/users/${id}`, d),
  remove:  (id)     => api.delete(`/users/${id}`)
}
