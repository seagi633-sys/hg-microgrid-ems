<template>
  <router-view v-slot="{ Component, route }">
    <component v-if="route.path === '/login'" :is="Component" />
    <el-container v-else class="app-shell">
      <el-aside :width="isCollapse ? '72px' : '260px'" class="app-aside">
        <div class="sidebar-logo-wrap">
          <img v-if="!isCollapse" :src="logoSrc" alt="臺南市政府" class="sidebar-logo" />
          <div v-else class="sidebar-logo-mini">台南</div>
        </div>
        <el-menu
          active-text-color="#f3c24b"
          background-color="transparent"
          text-color="#f6f8fa"
          :default-active="$route.path"
          :collapse="isCollapse"
          :collapse-transition="false"
          popper-class="sidebar-submenu-popup"
          router
          class="sidebar-menu"
        >
          <el-menu-item v-if="can('system-overview')" index="/system-overview">
            <el-icon><Monitor /></el-icon>
            <template #title>系統總覽</template>
          </el-menu-item>

          <el-sub-menu v-if="showSystemInfo" index="system-info">
            <template #title>
              <el-icon><Connection /></el-icon>
              <span>系統資訊</span>
            </template>
            <el-menu-item v-if="can('real-time-power')" index="/real-time-power">即時電力曲線</el-menu-item>
            <el-menu-item v-if="can('history')" index="/history">歷史電力曲線</el-menu-item>
          </el-sub-menu>

          <el-sub-menu v-if="showPowerInfo" index="power-info">
            <template #title>
              <el-icon><TrendCharts /></el-icon>
              <span>電力資訊</span>
            </template>
            <el-menu-item v-if="can('pv-system')" index="/pv-system">太陽光電系統</el-menu-item>
            <el-menu-item v-if="can('ess-system')" index="/ess-system">儲能系統</el-menu-item>
            <el-menu-item v-if="can('pcs-full-info')" index="/ess-system/pcs-full-info">PCS參數資訊</el-menu-item>
            <el-menu-item v-if="can('genset-system')" index="/genset-system">柴油發電機</el-menu-item>
          </el-sub-menu>

          <el-sub-menu v-if="showPrediction" index="prediction">
            <template #title>
              <el-icon><Sunrise /></el-icon>
              <span>預測資訊</span>
            </template>
            <el-menu-item v-if="can('PV-Prediction')" index="/PV-Prediction">光電預測</el-menu-item>
            <el-menu-item v-if="can('Load-Prediction')" index="/Load-Prediction">負載預測</el-menu-item>
          </el-sub-menu>

          <el-sub-menu v-if="showSchedule" index="schedule">
            <template #title>
              <el-icon><Calendar /></el-icon>
              <span>排程功能</span>
            </template>
            <el-menu-item v-if="can('charge-discharge-schedule')" index="/charge-discharge-schedule">充放電排程</el-menu-item>
            <el-menu-item v-if="can('power-service-schedule')" index="/power-service-schedule">電力服務排程</el-menu-item>
          </el-sub-menu>

          <el-sub-menu v-if="showEvents" index="events">
            <template #title>
              <el-icon><Loading /></el-icon>
              <span>事件紀錄</span>
            </template>
            <el-menu-item v-if="can('event-log')" index="/event-log">事件紀錄</el-menu-item>
            <el-menu-item v-if="can('operation-log')" index="/operation-log">操作紀錄</el-menu-item>
          </el-sub-menu>

          <el-sub-menu v-if="showAccount" index="account">
            <template #title>
              <el-icon><User /></el-icon>
              <span>帳號管理</span>
            </template>
            <el-menu-item v-if="can('users')" index="/users">使用者管理</el-menu-item>
            <el-menu-item v-if="can('permissions')" index="/permissions">權限管理</el-menu-item>
          </el-sub-menu>

          <el-menu-item v-if="can('reports')" index="/reports">
            <el-icon><TrendCharts /></el-icon>
            <template #title>報表輸出</template>
          </el-menu-item>

          <el-menu-item v-if="can('api-test')" index="/api-test">
            <el-icon><Connection /></el-icon>
            <template #title>API 測試</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-main style="background-color: #f5f7fa; padding: 0;">
          <component :is="Component" />
        </el-main>
      </el-container>
    </el-container>
  </router-view>
</template>

<script setup>
import { computed, provide, ref } from 'vue'
import {
  Monitor,
  TrendCharts,
  Connection,
  Sunrise,
  Loading,
  User,
  Calendar
} from '@element-plus/icons-vue'
import { useAuthStore } from './stores/authStore'
import logoSrc from './assets/tainan_logo.jpg'

const authStore = useAuthStore()
const isCollapse = ref(false)

authStore.initialize()

const can = (key) => authStore.hasPermission(key)

const showSystemInfo = computed(() => can('real-time-power') || can('history'))
const showPowerInfo = computed(() =>
  can('pv-system') || can('ess-system') || can('pcs-full-info') || can('genset-system')
)
const showPrediction = computed(() => can('PV-Prediction') || can('Load-Prediction'))
const showSchedule = computed(() => can('charge-discharge-schedule') || can('power-service-schedule'))
const showEvents = computed(() => can('event-log') || can('operation-log'))
const showAccount = computed(() => can('users') || can('permissions'))

provide('sidebarControl', {
  isCollapse,
  toggle: () => {
    isCollapse.value = !isCollapse.value
  }
})
</script>

<style scoped>
.app-shell {
  height: 100vh;
}

.app-aside {
  background: linear-gradient(180deg, #0f1d2c 0%, #192d40 62%, #152636 100%);
  border-right: 2px solid #c69723;
  overflow-x: hidden;
  transition: width 0.2s ease;
  display: flex;
  flex-direction: column;
}

.sidebar-logo-wrap {
  padding: 14px 12px 8px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(245, 247, 250, 0.92) 100%);
  border-bottom: 2px solid #b71636;
}

.sidebar-logo {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
}

.sidebar-logo-mini {
  width: 44px;
  height: 44px;
  margin: 0 auto;
  border-radius: 50%;
  background: #fff;
  color: #b71636;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
}

.sidebar-menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
}

.sidebar-menu :deep(.el-menu-item) {
  margin: 6px 8px;
  border-radius: 8px;
  font-size: 17px;
  transition: all 0.2s ease;
}

.sidebar-menu :deep(.el-sub-menu__title) {
  margin: 6px 8px;
  border-radius: 8px;
  font-size: 17px;
  transition: all 0.2s ease;
}

.sidebar-menu :deep(.el-icon) {
  font-size: 24px;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: rgba(243, 194, 75, 0.18);
  color: #ffe6a4;
}

.sidebar-menu :deep(.el-menu-item.is-active),
.sidebar-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  background: linear-gradient(90deg, rgba(183, 22, 54, 0.86) 0%, rgba(140, 19, 48, 0.82) 100%);
  color: #fff6da;
  box-shadow: inset 0 0 0 1px rgba(243, 194, 75, 0.55);
}

.sidebar-menu :deep(.el-sub-menu .el-menu) {
  background-color: transparent;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  min-width: auto;
  padding-left: 52px !important;
  font-size: 16px;
  color: #f6f8fa;
  white-space: nowrap;
}

.sidebar-menu :deep(.el-sub-menu__title span) {
  color: #f6f8fa;
}

.sidebar-menu.el-menu--collapse :deep(.el-sub-menu .el-menu-item) {
  padding-left: 20px !important;
}

.sidebar-menu.el-menu--collapse {
  width: 100% !important;
}

.sidebar-menu.el-menu--collapse :deep(.el-menu-item),
.sidebar-menu.el-menu--collapse :deep(.el-sub-menu__title) {
  margin: 6px 8px;
  padding: 0 !important;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sidebar-menu.el-menu--collapse :deep(.el-menu-item .el-menu-tooltip__trigger) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 !important;
}

.sidebar-menu.el-menu--collapse :deep(.el-icon) {
  margin: 0 !important;
}

.sidebar-menu.el-menu--collapse :deep(.el-sub-menu__icon-arrow) {
  display: none;
}
</style>

<style>
.sidebar-submenu-popup.el-menu--popup-container .el-menu--popup,
.sidebar-submenu-popup.el-menu--popup {
  background-color: #152636 !important;
  border: 1px solid #c69723;
  min-width: 180px;
}

.sidebar-submenu-popup .el-menu-item {
  color: #f6f8fa !important;
  background-color: transparent !important;
}

.sidebar-submenu-popup .el-menu-item:hover {
  background-color: rgba(243, 194, 75, 0.18) !important;
  color: #ffe6a4 !important;
}

.sidebar-submenu-popup .el-menu-item.is-active {
  background: linear-gradient(90deg, rgba(183, 22, 54, 0.86) 0%, rgba(140, 19, 48, 0.82) 100%) !important;
  color: #fff6da !important;
}
</style>
