<template>
  <div class="placeholder-container">
    <SiteHeader />

    <el-card class="placeholder-card">
      <template #header>
        <div class="card-header">{{ pageTitle }}</div>
      </template>
      <el-empty description="此功能頁面建置中">
        <el-button type="primary" @click="$router.push('/')">返回即時狀態</el-button>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from '../components/SiteHeader.vue'

const route = useRoute()
const pageTitle = computed(() => route.meta.title || '功能頁面')
</script>

<style scoped>
.placeholder-container {
  padding: 0 0 20px;
  min-height: 80vh;
  background-color: #f5f7fa;
}

.placeholder-card {
  min-height: 360px;
  margin: 0 20px;
}

.card-header {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}
</style>
