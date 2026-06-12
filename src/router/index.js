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
    component: () => import('../views/History.vue') 
  },
  {
    path: '/api-test',
    name: 'ApiTest',
    component: () => import('../views/ApiTest.vue')
 },

 { path: '/PV-Prediction', 
   name: 'PVPrediction', 
   component: () => import('../views/PVPrediction.vue') 
 },
 
 { path: '/Load-Prediction', 
  name: 'LoadPrediction', 
  component: () => import('../views/LoadPrediction.vue') 
 },
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router