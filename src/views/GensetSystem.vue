<template>
  <div class="genset-system-page">
    <SiteHeader />

    <el-card class="page-header-card">
      <template #header>
        <div class="page-header">
          <span class="page-title">柴油發電機監控</span>
        </div>
      </template>
      <div class="spec-summary">
        <div class="spec-item">
          <span class="label">發電機規格（目前案場）</span>
          <span class="value">{{ genSpecText }}</span>
        </div>
        <div class="spec-item">
          <span class="label">運轉狀態</span>
          <span class="value">{{ operationStatus }}</span>
        </div>
        <div class="spec-item">
          <span class="label">目前出力</span>
          <span class="value">{{ Number(emsStore.genPower || 0).toFixed(1) }} kW</span>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="site-card">
      <template #header>
        <div class="site-card-header">
          <div>
            <div class="site-name">{{ emsStore.selectedSite.name }}</div>
            <div class="site-location">{{ emsStore.selectedSite.location }}</div>
          </div>
          <el-tag :type="statusTagType" effect="light">{{ operationStatus }}</el-tag>
        </div>
      </template>

      <el-row :gutter="20" align="middle">
        <el-col :xs="24" :md="14">
          <GensetScene
            :capacity-kw="Number(emsStore.selectedSite.genCapacityKw)"
            :power-kw="Number(emsStore.genPower)"
            :fuel-level="fuelLevel"
            class="scene-large"
          />
          <div class="scene-type-label">柴油發電機模擬</div>
        </el-col>

        <el-col :xs="24" :md="10">
          <div class="metrics-grid">
            <div class="metric-item">
              <span class="metric-label">發電機規格</span>
              <span class="metric-value">{{ genSpecText }}</span>
            </div>
            <div class="metric-item highlight">
              <span class="metric-label">目前電功率</span>
              <span class="metric-value power" :class="{ active: isRunning }">
                {{ Number(emsStore.genPower || 0).toFixed(1) }} kW
              </span>
            </div>
            <div class="metric-item">
              <span class="metric-label">溫度</span>
              <span class="metric-value">{{ currentMetrics.temperature.toFixed(1) }} °C</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">壓力</span>
              <span class="metric-value">{{ currentMetrics.pressure.toFixed(2) }} bar</span>
            </div>
            <div class="metric-item highlight">
              <span class="metric-label">油量</span>
              <span class="metric-value fuel">{{ fuelLevel.toFixed(0) }}%</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">狀態</span>
              <span class="metric-value">{{ operationStatus }}</span>
            </div>
          </div>

          <div class="alarm-box" :class="alarmLevel">
            <div class="alarm-title">告警訊息</div>
            <div class="alarm-text">{{ alarmMessage }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useEmsStore } from '../stores/emsStore'
import SiteHeader from '../components/SiteHeader.vue'
import GensetScene from '../components/genset/GensetScene.vue'

const emsStore = useEmsStore()
const simSeed = ref(Math.random())
const fuelLevel = ref(78)

const genSpecText = computed(() => `${emsStore.selectedSite.genCapacityKw} kW`)

const genPower = computed(() => Number(emsStore.genPower || 0))
const isRunning = computed(() => genPower.value > 0.5)

const operationStatus = computed(() =>
  isRunning.value ? '應變出力中' : '自動備援待命'
)

const statusTagType = computed(() => (isRunning.value ? 'danger' : 'info'))

const currentMetrics = computed(() => {
  const cap = Number(emsStore.selectedSite.genCapacityKw || 200)
  const p = genPower.value
  const loadFactor = Math.min(1, p / cap)

  const temperature = isRunning.value
    ? 72 + loadFactor * 28 + (simSeed.value % 1) * 3
    : 28 + (simSeed.value % 1) * 2

  const pressure = isRunning.value
    ? 2.2 + loadFactor * 1.8 + (simSeed.value % 1) * 0.15
    : 0.8 + (simSeed.value % 1) * 0.1

  return { temperature, pressure }
})

const alarmMessage = computed(() => {
  const fuel = fuelLevel.value
  const temp = currentMetrics.value.temperature

  if (fuel < 15) return '【嚴重】燃油存量過低，請立即補充燃料。'
  if (fuel < 25) return '【警告】燃油存量偏低，建議安排加油。'
  if (isRunning.value && temp > 98) return '【警告】引擎溫度偏高，請確認冷卻系統。'
  if (isRunning.value) return '【資訊】柴油發電機應變出力中，供應緊急負載。'
  if (emsStore.currentMode >= 2 && emsStore.currentMode <= 4) {
    return '【資訊】市電或儲能異常，發電機自動備援待命。'
  }
  return '【正常】柴油發電機運轉正常，無異常告警。'
})

const alarmLevel = computed(() => {
  if (alarmMessage.value.includes('嚴重')) return 'alarm-critical'
  if (alarmMessage.value.includes('警告')) return 'alarm-warning'
  if (alarmMessage.value.includes('資訊')) return 'alarm-info'
  return 'alarm-normal'
})

const seedFuelLevel = () => {
  const base = emsStore.selectedSite.id === 'ruifeng-elementary' ? 72 : 80
  fuelLevel.value = base + (simSeed.value % 1) * 8
}

const updateFuelLevel = () => {
  if (genPower.value > 0.5) {
    fuelLevel.value = Math.max(5, fuelLevel.value - 0.08 - genPower.value * 0.0003)
  }
}

let timer = null

watch(() => emsStore.selectedSiteId, () => {
  seedFuelLevel()
})

onMounted(() => {
  seedFuelLevel()
  emsStore.fetchEmsData()
  timer = setInterval(() => {
    emsStore.fetchEmsData()
    updateFuelLevel()
    simSeed.value = Math.random()
  }, 2000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.genset-system-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.spec-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.spec-item .label {
  font-size: 12px;
  color: #909399;
}

.spec-item .value {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.site-card {
  border-left: 4px solid #909399;
}

.scene-large {
  height: 280px;
}

:deep(.scene-large.genset-scene) {
  height: 280px;
}

.site-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.site-name {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
}

.site-location {
  margin-top: 2px;
  font-size: 13px;
  color: #909399;
}

.scene-type-label {
  margin: 10px 0 12px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  letter-spacing: 0.06em;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.metric-item {
  padding: 10px;
  border-radius: 8px;
  background: #fafafa;
  border: 1px solid #ebeef5;
}

.metric-item.highlight {
  background: #fdf6ec;
  border-color: #f5dab1;
}

.metric-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 15px;
  font-weight: 700;
  color: #303133;
  line-height: 1.35;
}

.metric-value.power {
  font-size: 20px;
  color: #909399;
}

.metric-value.power.active {
  color: #f56c6c;
}

.metric-value.fuel {
  color: #e6a23c;
  font-size: 20px;
}

.alarm-box {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.alarm-title {
  font-size: 13px;
  font-weight: 700;
  color: #606266;
  margin-bottom: 6px;
}

.alarm-text {
  font-size: 14px;
  line-height: 1.5;
  font-weight: 600;
}

.alarm-normal {
  background: #f0f9eb;
  border-color: #b3e19d;
}

.alarm-normal .alarm-text {
  color: #529b2e;
}

.alarm-info {
  background: #ecf5ff;
  border-color: #b3d8ff;
}

.alarm-info .alarm-text {
  color: #409eff;
}

.alarm-warning {
  background: #fdf6ec;
  border-color: #f5dab1;
}

.alarm-warning .alarm-text {
  color: #e6a23c;
}

.alarm-critical {
  background: #fef0f0;
  border-color: #fab6b6;
}

.alarm-critical .alarm-text {
  color: #f56c6c;
}
</style>
