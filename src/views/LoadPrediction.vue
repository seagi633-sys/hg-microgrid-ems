<template>
  <div class="load-page">
    <SiteHeader />

    <el-card class="page-header-card">
      <template #header>
        <div class="page-header">
          <div>
            <span class="page-title">負載預測範例頁面</span>
            <div class="site-name">{{ emsStore.selectedSite.name }}</div>
          </div>
          <el-tag type="warning" effect="light">Demo</el-tag>
        </div>
      </template>
      <el-row :gutter="12" align="middle">
        <el-col :xs="24" :md="10">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="選擇預測日期"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-col>
        <el-col :xs="24" :md="14" class="header-note">
          依據歷史用電、課表活動與氣象資訊，預估園區各時段負載需求。
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="summary-card">
          <div class="metric-label">預測總用電量</div>
          <div class="metric-value">{{ totalForecastEnergy }} kWh</div>
          <div class="metric-sub">全天 00:00 ~ 24:00 累積</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="summary-card">
          <div class="metric-label">預測尖峰負載</div>
          <div class="metric-value">{{ peakForecastLoad }} kW</div>
          <div class="metric-sub">{{ peakHour }} 時段</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="summary-card">
          <div class="metric-label">預測可信度</div>
          <div class="metric-value">{{ forecastConfidence }}%</div>
          <el-progress
            :percentage="forecastConfidence"
            :stroke-width="10"
            :show-text="false"
            status="warning"
          />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="15">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">分時負載預測</div>
          </template>
          <el-table :data="forecastRows" stripe>
            <el-table-column prop="time" label="時段" width="120" />
            <el-table-column prop="temperature" label="溫度 (°C)" width="120" />
            <el-table-column prop="scenario" label="場域情境" />
            <el-table-column prop="load" label="預測負載 (kW)" />
            <el-table-column prop="note" label="備註" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="9">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">預測條件</div>
          </template>
          <div class="info-item">
            <span class="info-key">負載類型</span>
            <span class="info-value">教學、行政、空調、緊急照明</span>
          </div>
          <div class="info-item">
            <span class="info-key">模型策略</span>
            <span class="info-value">歷史平均 + 天氣修正係數</span>
          </div>
          <div class="info-item">
            <span class="info-key">時間解析度</span>
            <span class="info-value">每 2 小時</span>
          </div>
          <div class="info-item">
            <span class="info-key">更新頻率</span>
            <span class="info-value">每 30 分鐘重算一次</span>
          </div>
          <el-alert
            title="此頁為範例畫面，可再串接後端負載預測 API。"
            type="info"
            :closable="false"
            show-icon
            class="mt-12"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useEmsStore } from '../stores/emsStore'
import SiteHeader from '../components/SiteHeader.vue'

const emsStore = useEmsStore()

const selectedDate = ref(new Date().toISOString().slice(0, 10))

// 各時段負載比（相對基準負載），各案場依自身基準負載換算
const hourlyProfile = [
  { time: '00:00', temperature: 28, ratio: 0.604 },
  { time: '06:00', temperature: 27, ratio: 0.787 },
  { time: '08:00', temperature: 29, ratio: 1.194 },
  { time: '10:00', temperature: 31, ratio: 1.377 },
  { time: '12:00', temperature: 33, ratio: 1.497 },
  { time: '14:00', temperature: 34, ratio: 1.561 },
  { time: '18:00', temperature: 31, ratio: 1.089 },
  { time: '22:00', temperature: 29, ratio: 0.696 }
]

// 各案場用電型態（學校／行政園區作息不同）與預測可信度
const siteProfiles = {
  'jiali-junior-high': {
    confidence: 84,
    loadFactor: 1.0,
    scenarios: ['夜間待機', '清晨啟用', '上課時段', '日間高溫', '午間活動', '午後課程', '放學後', '夜間待機'],
    notes: ['基礎負載', '空調預冷', '教學設備投入', '空調占比提升', '接近尖峰', '尖峰時段', '負載下降', '回到基礎負載']
  },
  'ruifeng-elementary': {
    confidence: 80,
    loadFactor: 0.92,
    scenarios: ['夜間待機', '清晨啟用', '上課時段', '日間高溫', '午餐供膳', '午後課程', '放學後', '夜間待機'],
    notes: ['基礎負載', '空調預冷', '小校規模負載', '空調占比提升', '廚房用電增加', '尖峰時段', '負載下降', '回到基礎負載']
  },
  'zengwen-vision-park': {
    confidence: 88,
    loadFactor: 1.08,
    scenarios: ['夜間保全', '清晨啟用', '上班時段', '日間高溫', '午間用電', '午後高峰', '下班離峰', '夜間保全'],
    notes: ['保全與機房負載', '空調預冷', '行政辦公設備投入', '空調占比提升', '接近尖峰', '尖峰時段', '洽公人潮減少', '回到基礎負載']
  }
}

const siteProfile = computed(() => siteProfiles[emsStore.selectedSite.id] || siteProfiles['jiali-junior-high'])

const forecastRows = computed(() => {
  const base = Number(emsStore.selectedSite.loadBaseKw || 70)
  const profile = siteProfile.value
  return hourlyProfile.map((p, i) => ({
    time: p.time,
    temperature: p.temperature,
    scenario: profile.scenarios[i],
    load: Number((base * p.ratio * profile.loadFactor).toFixed(1)),
    note: profile.notes[i]
  }))
})

const totalForecastEnergy = computed(() => {
  const totalLoad = forecastRows.value.reduce((sum, row) => sum + Number(row.load || 0), 0)
  return (totalLoad * 2).toFixed(1)
})

const peakRow = computed(() => {
  return forecastRows.value.reduce((peak, row) => (row.load > peak.load ? row : peak), forecastRows.value[0])
})

const peakForecastLoad = computed(() => Number(peakRow.value.load || 0).toFixed(1))
const peakHour = computed(() => peakRow.value.time)
const forecastConfidence = computed(() => siteProfile.value.confidence)
</script>

<style scoped>
.load-page {
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
  gap: 8px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.site-name {
  margin-top: 4px;
  font-size: 15px;
  font-weight: 600;
  color: #f56c6c;
}

.header-note {
  color: #606266;
  font-size: 14px;
}

.summary-card {
  border-left: 4px solid #f56c6c;
}

.metric-label {
  color: #909399;
  font-size: 13px;
}

.metric-value {
  margin: 6px 0;
  font-size: 30px;
  font-weight: 700;
  color: #303133;
}

.metric-sub {
  color: #606266;
  font-size: 13px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.info-card,
.table-card {
  height: 100%;
}

.info-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.info-key {
  color: #909399;
}

.info-value {
  color: #303133;
  text-align: right;
}

.mt-12 {
  margin-top: 12px;
}
</style>
