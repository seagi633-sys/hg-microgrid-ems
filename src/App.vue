<template>
  <el-container style="height: 100vh;">
    <el-aside width="240px" style="background-color: #304156;">
      <el-menu
  active-text-color="#409eff"
  background-color="#303133"
  text-color="#fff"
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
import { Odometer, DataAnalysis } from '@element-plus/icons-vue'
</script>