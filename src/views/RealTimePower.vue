<template>
  <div class="realtime-container">
    <SiteHeader />

    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span>📈 各設備即時功率曲線（每 2 秒更新）</span>
        </div>
      </template>
      <RealTimePowerChart />
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useEmsStore } from '../stores/emsStore'
import SiteHeader from '../components/SiteHeader.vue'
import RealTimePowerChart from '../components/RealTimePowerChart.vue'

const emsStore = useEmsStore()
let timer = null

onMounted(() => {
  emsStore.fetchEmsData()
  timer = setInterval(() => {
    emsStore.fetchEmsData()
  }, 2000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.realtime-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.chart-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.card-header {
  font-weight: 700;
  font-size: 20px;
  color: #303133;
  text-align: center;
}
</style>
