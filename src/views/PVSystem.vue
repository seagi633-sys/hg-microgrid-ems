<template>
  <div class="pv-system-page">
    <SiteHeader />

    <el-card class="page-header-card">
      <template #header>
        <div class="page-header">
          <span class="page-title">太陽光電系統監控</span>
          <el-button size="small" type="primary" plain :loading="cwaLoading" @click="fetchSolarRadiation">
            更新日射量
          </el-button>
        </div>
      </template>
      <el-alert
        v-if="cwaError"
        :title="cwaError"
        type="warning"
        :closable="false"
        show-icon
        class="mb-12"
      />
      <div class="cwa-summary">
        <div class="cwa-item">
          <span class="label">臺南地區即時日射量</span>
          <span class="value">{{ cwaRadiationText }}</span>
        </div>
        <div class="cwa-item">
          <span class="label">估算日照強度</span>
          <span class="value">{{ instantIrradiance }} W/m²</span>
        </div>
        <div class="cwa-item">
          <span class="label">觀測時間</span>
          <span class="value">{{ cwaObsTime }}</span>
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
          <el-tag
            :type="currentMetrics.power > 0.5 ? 'warning' : 'info'"
            effect="light"
          >
            {{ currentMetrics.power > 0.5 ? '發電中' : '待命' }}
          </el-tag>
        </div>
      </template>

      <el-row :gutter="20" align="middle">
        <el-col :xs="24" :md="14">
          <CampusPvScene
            v-if="isCampusSite(emsStore.selectedSite.id)"
            :utilization="currentMetrics.utilization"
            :site-name="emsStore.selectedSite.name"
            class="scene-large"
          />
          <ScenicPvScene
            v-else
            :utilization="currentMetrics.utilization"
            :site-name="emsStore.selectedSite.name"
            class="scene-large"
          />
          <div class="scene-type-label">
            {{ isCampusSite(emsStore.selectedSite.id) ? '校園屋頂光電' : '觀光園區地面光電' }}
          </div>
        </el-col>

        <el-col :xs="24" :md="10">
          <div class="metrics-grid">
            <div class="metric-item">
              <span class="metric-label">既設容量</span>
              <span class="metric-value">{{ emsStore.selectedSite.pvCapacityKw }} kWp</span>
            </div>
            <div class="metric-item highlight">
              <span class="metric-label">目前發電功率</span>
              <span class="metric-value power">{{ currentMetrics.power.toFixed(1) }} kW</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">日照量</span>
              <span class="metric-value">{{ instantIrradiance }} W/m²</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">溫度</span>
              <span class="metric-value">{{ currentMetrics.temperature.toFixed(1) }} °C</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">電壓</span>
              <span class="metric-value">{{ currentMetrics.voltage.toFixed(1) }} V</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">電流</span>
              <span class="metric-value">{{ currentMetrics.current.toFixed(1) }} A</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">出力比</span>
              <span class="metric-value">{{ outputRatioText }}</span>
            </div>
            <div class="metric-item highlight">
              <span class="metric-label">當日累積電量</span>
              <span class="metric-value energy">{{ dailyEnergyKwh.toFixed(1) }} kWh</span>
            </div>
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
import CampusPvScene from '../components/pv/CampusPvScene.vue'
import ScenicPvScene from '../components/pv/ScenicPvScene.vue'
import { estimateInstantIrradiance, useSolarRadiation } from '../composables/useSolarRadiation'

const emsStore = useEmsStore()
const { cwaStations, cwaError, cwaLoading, fetchSolarRadiation } = useSolarRadiation()

const simSeed = ref(Math.random())
const dailyEnergyKwh = ref(0)
let lastEnergyTick = Date.now()

const outputRatioText = computed(() => {
  const pct = currentMetrics.value.utilization * 100
  return `${pct.toFixed(0)}%（${currentMetrics.value.power.toFixed(1)} / ${emsStore.selectedSite.pvCapacityKw} kW）`
})

/** 依日出至目前時段，估算當日已累積電量初值 */
const seedDailyEnergy = () => {
  const now = new Date()
  const hour = now.getHours() + now.getMinutes() / 60
  if (hour <= 6) {
    dailyEnergyKwh.value = 0
    return
  }

  const cap = Number(emsStore.selectedSite.pvCapacityKw || 0)
  const daylightHours = Math.min(hour - 6, 12)
  const daylightFactor = 0.5 - 0.5 * Math.cos((Math.min(daylightHours, 12) / 12) * Math.PI)
  dailyEnergyKwh.value = cap * 4.2 * daylightFactor * 0.38
}

const accumulateDailyEnergy = () => {
  const now = Date.now()
  const dtHours = (now - lastEnergyTick) / 3600000
  lastEnergyTick = now
  dailyEnergyKwh.value += Number(emsStore.pvPower || 0) * dtHours
}

const campusSiteIds = new Set(['jiali-junior-high', 'ruifeng-elementary'])

const isCampusSite = (siteId) => campusSiteIds.has(siteId)

const avgTainanRadiation = computed(() => {
  const values = cwaStations.value
    .map((s) => s.radiation)
    .filter((v) => v != null && v >= 0)
  if (values.length === 0) return null
  return values.reduce((sum, v) => sum + v, 0) / values.length
})

const cwaRadiationText = computed(() => {
  if (avgTainanRadiation.value == null) return '讀取中…'
  return `${avgTainanRadiation.value.toFixed(2)} MJ/m²（臺南測站平均）`
})

const cwaObsTime = computed(() => {
  const first = cwaStations.value[0]
  return first?.time || '—'
})

const instantIrradiance = computed(() =>
  estimateInstantIrradiance(avgTainanRadiation.value)
)

const currentMetrics = computed(() => {
  const site = emsStore.selectedSite
  const cap = Number(site.pvCapacityKw || 1)
  const power = Number(emsStore.pvPower || 0)
  const utilization = Math.min(1, Math.max(0, power / cap))
  const irradiance = instantIrradiance.value
  const siteOffset = site.id === 'ruifeng-elementary' ? -1.2 : site.id === 'zengwen-vision-park' ? 0.8 : 0
  const temperature = 26 + (irradiance / 1000) * 14 + siteOffset + (simSeed.value % 1) * 0.6
  const voltage = 580 + utilization * 140 + (site.id === 'zengwen-vision-park' ? 40 : 0)
  const current = power > 0 ? (power * 1000) / voltage : 0

  return { power, utilization, temperature, voltage, current }
})

let timer = null

watch(() => emsStore.selectedSiteId, () => {
  seedDailyEnergy()
  lastEnergyTick = Date.now()
})

onMounted(() => {
  seedDailyEnergy()
  emsStore.fetchEmsData()
  timer = setInterval(() => {
    emsStore.fetchEmsData()
    accumulateDailyEnergy()
    simSeed.value = Math.random()
  }, 2000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.pv-system-page {
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

.mb-12 {
  margin-bottom: 12px;
}

.cwa-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.cwa-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.cwa-item .label {
  font-size: 12px;
  color: #909399;
}

.cwa-item .value {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.site-card {
  border-left: 4px solid #e6a23c;
}

.scene-large {
  height: 280px;
}

:deep(.scene-large.campus-scene),
:deep(.scene-large.scenic-scene) {
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
  background: #fff7e6;
  border-color: #f5dab1;
}

.metric-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
}

.metric-value.power {
  color: #e6a23c;
  font-size: 20px;
}

.metric-value.energy {
  color: #67c23a;
  font-size: 20px;
}
</style>
