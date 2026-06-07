import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import History from '../views/History.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  { path: '/history', 
    name: 'History', 
    component: () => import('../views/History.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router