import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      children: [
        { path: 'dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
        { path: 'books',     name: 'books',     component: () => import('@/views/BooksView.vue') },
        { path: 'authors',   name: 'authors',   component: () => import('@/views/AuthorsView.vue') },
        { path: 'users',     name: 'users',     component: () => import('@/views/UsersView.vue') }
      ]
    }
  ]
})

export default router
