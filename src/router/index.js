import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import { useAuthStore } from '../stores/authStore'
import { ROUTE_PERMISSION_MAP } from '../config/menuPermissions'

const placeholder = (title) => ({
  component: () => import('../views/FeaturePlaceholder.vue'),
  meta: { title }
})

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    redirect: '/system-overview'
  },
  {
    path: '/system-overview',
    name: 'SystemOverview',
    component: Dashboard
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/History.vue')
  },
  {
    path: '/real-time-power',
    name: 'RealTimePower',
    component: () => import('../views/RealTimePower.vue')
  },
  {
    path: '/api-test',
    name: 'ApiTest',
    component: () => import('../views/ApiTest.vue')
  },
  {
    path: '/PV-Prediction',
    name: 'PVPrediction',
    component: () => import('../views/PVPrediction.vue')
  },
  {
    path: '/Load-Prediction',
    name: 'LoadPrediction',
    component: () => import('../views/LoadPrediction.vue')
  },
  {
    path: '/charge-discharge-schedule',
    name: 'ChargeDischargeSchedule',
    component: () => import('../views/ChargeDischargeSchedule.vue'),
    meta: { title: '充放電排程' }
  },
  {
    path: '/power-service-schedule',
    name: 'PowerServiceSchedule',
    component: () => import('../views/PowerServiceSchedule.vue'),
    meta: { title: '電力服務排程' }
  },
  {
    path: '/pv-system',
    name: 'PVSystem',
    component: () => import('../views/PVSystem.vue'),
    meta: { title: '太陽光電系統' }
  },
  {
    path: '/ess-system',
    name: 'EssSystem',
    component: () => import('../views/ESSSystem.vue'),
    meta: { title: '儲能系統' }
  },
  {
    path: '/ess-system/pcs-full-info',
    name: 'PcsFullInfo',
    component: () => import('../views/PcsFullInfo.vue'),
    meta: { title: '完整 PCS 資訊', permission: 'pcs-full-info' }
  },
  {
    path: '/genset-system',
    name: 'GensetSystem',
    component: () => import('../views/GensetSystem.vue'),
    meta: { title: '柴油發電機' }
  },
  {
    path: '/event-log',
    name: 'EventLog',
    ...placeholder('事件紀錄')
  },
  {
    path: '/operation-log',
    name: 'OperationLog',
    ...placeholder('操作紀錄')
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/Users.vue'),
    meta: { title: '使用者管理' }
  },
  {
    path: '/permissions',
    name: 'Permissions',
    component: () => import('../views/Permissions.vue'),
    meta: { title: '權限管理' }
  },
  {
    path: '/reports',
    name: 'Reports',
    ...placeholder('報表輸出')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (!authStore.initialized) {
    authStore.initialize()
  }

  if (to.meta.public) {
    if (authStore.isLoggedIn) {
      return authStore.getFirstAllowedPath()
    }
    return true
  }

  if (!authStore.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  const permission = to.meta.permission || ROUTE_PERMISSION_MAP[to.path]
  if (permission && !authStore.hasPermission(permission)) {
    return authStore.getFirstAllowedPath()
  }

  return true
})

export default router
