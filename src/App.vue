<template>
  <el-container class="app-shell">
    <el-aside width="240px" class="app-aside">
      <div class="sidebar-logo-wrap">
        <img :src="logoSrc" alt="臺南市政府" class="sidebar-logo" />
      </div>
      <el-menu
        active-text-color="#f3c24b"
        background-color="transparent"
        text-color="#f6f8fa"
        :default-active="$route.path"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/">
          <el-icon><Monitor /></el-icon>
          <span>即時狀態監控</span>
        </el-menu-item>

        <el-menu-item index="/history">
          <el-icon><TrendCharts /></el-icon>
          <span>歷史曲線查詢</span>
        </el-menu-item>

        <el-menu-item index="/PV-Prediction">
          <el-icon><Sunrise /></el-icon>
          <span>光電預測</span>
        </el-menu-item>

        <el-menu-item index="/Load-Prediction">
          <el-icon><Loading /></el-icon>
          <span>負載預測</span>
        </el-menu-item>

        <el-menu-item index="/api-test">
          <el-icon><Connection /></el-icon>
          <span>API 測試</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-main style="background-color: #f5f7fa; padding: 0;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { Monitor, TrendCharts, Connection, MoonNight, Sunrise, Loading } from '@element-plus/icons-vue'
import logoSrc from './assets/tainan_logo.jpg'
</script>

<style scoped>
.app-shell {
  height: 100vh;
}

.app-aside {
  background: linear-gradient(180deg, #0f1d2c 0%, #192d40 62%, #152636 100%);
  border-right: 2px solid #c69723;
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

.sidebar-menu :deep(.el-menu-item) {
  margin: 6px 8px;
  border-radius: 8px;
  font-size: 18px;
  transition: all 0.2s ease;
}

.sidebar-menu :deep(.el-icon) {
  font-size: 24px;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: rgba(243, 194, 75, 0.18);
  color: #ffe6a4;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(183, 22, 54, 0.86) 0%, rgba(140, 19, 48, 0.82) 100%);
  color: #fff6da;
  box-shadow: inset 0 0 0 1px rgba(243, 194, 75, 0.55);
}
</style>