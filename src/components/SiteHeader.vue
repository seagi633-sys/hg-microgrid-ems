<template>
  <el-card class="site-title-card" :body-style="{ display: 'none', padding: 0 }">
    <template #header>
      <div class="title-header">
        <span class="header-title">⚡臺南市防災微電網模擬情境⚡</span>
        <div class="site-subtitle">{{ emsStore.selectedSite.name }}</div>
      </div>
    </template>
  </el-card>

  <el-card class="site-selector-card">
    <div class="selector-row">
      <div class="selector-inline-label">案場選擇</div>
      <el-radio-group
        v-model="emsStore.selectedSiteId"
        size="large"
        class="site-radio-group"
        @change="handleSiteChange"
      >
        <el-radio-button
          v-for="site in emsStore.siteOptions"
          :key="site.id"
          :value="site.id"
        >
          {{ site.name }}
        </el-radio-button>
      </el-radio-group>
    </div>
  </el-card>
</template>

<script setup>
import { useEmsStore } from '../stores/emsStore'

const emsStore = useEmsStore()

const handleSiteChange = (siteId) => {
  emsStore.setSite(siteId)
  emsStore.fetchEmsData()
}
</script>

<style scoped>
.site-title-card {
  border: 1px solid #d9ecff;
  box-shadow: 0 2px 10px rgba(64, 158, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 30;
}

.title-header {
  font-weight: 700;
  color: #303133;
  text-align: center;
}

.header-title {
  display: block;
  font-size: 34px;
}

.site-subtitle {
  margin-top: 8px;
  font-size: 20px;
  color: #606266;
  font-weight: 600;
}

.site-selector-card {
  border-left: 4px solid #409eff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.selector-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.selector-inline-label {
  flex: 0 0 auto;
  min-width: 76px;
  padding-top: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  white-space: nowrap;
}

.site-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
}

@media (max-width: 992px) {
  .selector-row {
    flex-direction: column;
  }

  .selector-inline-label {
    padding-top: 0;
  }
}
</style>
