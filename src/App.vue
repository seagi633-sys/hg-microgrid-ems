<template>
  <el-container style="height: 100vh;">
    <el-aside width="240px" style="background-color: #304156;">
      <el-menu
        active-text-color="#409EFF"
        background-color="#304156"
        text-color="#fff"
        default-active="/"
        router
      >
        <el-menu-item index="/">
          <el-icon><Odometer /></el-icon>
          <span>微電網即時監控</span>
        </el-menu-item>
        <el-menu-item index="/history">
          <el-icon><DataAnalysis /></el-icon>
          <span>歷史數據報表分析</span>
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