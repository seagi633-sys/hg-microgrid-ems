<template>
  <div class="history-container">
    <SiteHeader />

    <el-card shadow="sm" class="chart-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="header-title">歷史電力曲線</span>
          <span class="header-source">vpp_energy_rollup · {{ rollupName }} · {{ vppSiteId || '未對應案場' }}</span>
        </div>
      </template>

      <div class="toolbar">
        <div class="toolbar-group">
          <span class="toolbar-label">粒度</span>
          <el-radio-group v-model="bucketInterval" size="default">
            <el-radio-button value="1 minute">1 分鐘</el-radio-button>
            <el-radio-button value="15 minutes">15 分鐘</el-radio-button>
            <el-radio-button value="1 hour">1 小時</el-radio-button>
            <el-radio-button value="1 day">1 日</el-radio-button>
          </el-radio-group>
        </div>
        <div class="toolbar-group">
          <span class="toolbar-label">範圍</span>
          <el-radio-group v-model="rangeHours" size="default">
            <el-radio-button :value="24">24 小時</el-radio-button>
            <el-radio-button :value="168">7 天</el-radio-button>
            <el-radio-button :value="720">30 天</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <p v-if="appliedHours < rangeHours" class="range-note">
        1 分鐘資料最多顯示 {{ appliedHours }} 小時。
      </p>

      <el-alert
        v-if="error"
        :title="error"
        type="error"
        show-icon
        :closable="false"
        class="status-alert"
      />

      <el-row v-if="points.length" :gutter="12" class="summary-row">
        <el-col :xs="12" :sm="6" :lg="4">
          <div class="summary-item">
            <div class="summary-label">最新平均功率</div>
            <div class="summary-value">{{ formatNumber(latestPoint?.avg_power_kw) }} kW</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :lg="5">
          <div class="summary-item">
            <div class="summary-label">區間輸入電量</div>
            <div class="summary-value">{{ formatNumber(importSum) }} kWh</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :lg="5">
          <div class="summary-item">
            <div class="summary-label">區間輸出電量</div>
            <div class="summary-value">{{ formatNumber(exportSum) }} kWh</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :lg="5">
          <div class="summary-item">
            <div class="summary-label">累計輸入電量</div>
            <div class="summary-value">{{ formatNumber(latestPoint?.import_energy_total_kwh, 1) }} kWh</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :lg="5">
          <div class="summary-item">
            <div class="summary-label">最新 SOC</div>
            <div class="summary-value">{{ formatSocValue(latestSoc) }} %</div>
          </div>
        </el-col>
      </el-row>

      <div v-show="points.length" ref="chartRef" class="chart-wrapper"></div>
      <el-empty v-if="!loading && !error && !points.length" description="此範圍沒有歷史彙總資料" />
    </el-card>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import SiteHeader from '../components/SiteHeader.vue'
import { getHistorySiteId } from '../config/vppSites'
import { useEmsStore } from '../stores/emsStore'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const MAX_HOURS = {
  '1 minute': 48,
  '15 minutes': 24 * 31,
  '1 hour': 24 * 90,
  '1 day': 24 * 400
}

const emsStore = useEmsStore()
const chartRef = ref(null)
const bucketInterval = ref('15 minutes')
const rangeHours = ref(24)
const points = ref([])
const rollupName = ref('mpm_1')
const loading = ref(false)
const error = ref('')

let chart = null
let requestSeq = 0

const vppSiteId = computed(() => getHistorySiteId(emsStore.selectedSiteId))
const appliedHours = computed(() => Math.min(rangeHours.value, MAX_HOURS[bucketInterval.value] || rangeHours.value))
const latestPoint = computed(() => points.value[points.value.length - 1] || null)
const latestSoc = computed(() => {
  for (let index = points.value.length - 1; index >= 0; index -= 1) {
    const value = points.value[index].soc
    if (value != null) return value
  }
  return null
})
const importSum = computed(() =>
  points.value.reduce((sum, point) => sum + (Number(point.import_energy_kwh) || 0), 0)
)
const exportSum = computed(() =>
  points.value.reduce((sum, point) => sum + (Number(point.export_energy_kwh) || 0), 0)
)

function formatNumber(value, digits = 2) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '-'
  return number.toLocaleString('zh-TW', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
}

function formatSocValue(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'
  const fixed = number.toFixed(2)
  return fixed.endsWith('0') ? number.toFixed(1) : fixed
}

function formatBucket(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date)
  const pick = (type) => parts.find((part) => part.type === type)?.value || ''
  const hour = pick('hour') === '24' ? '00' : pick('hour')
  if (bucketInterval.value === '1 day') {
    return `${pick('year')}-${pick('month')}-${pick('day')}`
  }
  return `${pick('month')}-${pick('day')} ${hour}:${pick('minute')}`
}

function renderChart() {
  if (!chartRef.value || !points.value.length) {
    chart?.clear()
    return
  }
  if (!chart) chart = echarts.init(chartRef.value)

  const labels = points.value.map((point) => formatBucket(point.bucket_time))
  const series = [
    {
      name: '平均功率',
      type: 'line',
      yAxisIndex: 0,
      data: points.value.map((point) => point.avg_power_kw),
      color: '#409eff',
      smooth: true,
      showSymbol: false
    },
    {
      name: '輸入電量',
      type: 'bar',
      yAxisIndex: 1,
      data: points.value.map((point) => point.import_energy_kwh),
      color: '#e6a23c',
      barMaxWidth: 14
    },
    {
      name: '輸出電量',
      type: 'bar',
      yAxisIndex: 1,
      data: points.value.map((point) => point.export_energy_kwh),
      color: '#67c23a',
      barMaxWidth: 14
    }
  ]
  const legend = ['平均功率', '輸入電量', '輸出電量']

  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: legend, top: 0 },
    grid: { left: 56, right: 56, top: 48, bottom: 64 },
    dataZoom: [
      { type: 'inside' },
      { type: 'slider', height: 18, bottom: 12 }
    ],
    xAxis: {
      type: 'category',
      data: labels,
      boundaryGap: true,
      axisLabel: { hideOverlap: true }
    },
    yAxis: [
      { type: 'value', name: '功率 (kW)', scale: true },
      { type: 'value', name: '電量 (kWh)', scale: true }
    ],
    series
  }, true)
  chart.resize()
}

async function loadHistory() {
  const seq = ++requestSeq
  const siteId = vppSiteId.value
  if (!siteId) {
    points.value = []
    error.value = '此案場尚未對應資料庫案場代碼'
    chart?.clear()
    return
  }

  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams({
      site_id: siteId,
      bucket_interval: bucketInterval.value,
      hours: String(appliedHours.value)
    })
    const res = await fetch(`${API_BASE}/api/vpp/energy/rollup?${params}`)
    const body = await res.json().catch(() => ({}))
    if (seq !== requestSeq) return
    if (!res.ok || body.ok === false) {
      throw new Error(body.error || `HTTP ${res.status}`)
    }
    rollupName.value = body.rollup_name || 'mpm_1'
    points.value = Array.isArray(body.points) ? body.points : []
    await nextTick()
    renderChart()
  } catch (err) {
    if (seq !== requestSeq) return
    points.value = []
    error.value = err.message || '無法讀取歷史資料'
    chart?.clear()
  } finally {
    if (seq === requestSeq) loading.value = false
  }
}

function onResize() {
  chart?.resize()
}

watch([vppSiteId, bucketInterval, rangeHours], () => {
  loadHistory()
})

onMounted(() => {
  loadHistory()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.history-container {
  padding: 16px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.header-title {
  font-weight: 700;
  font-size: 20px;
  color: #303133;
}

.header-source {
  font-size: 13px;
  color: #909399;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 12px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-label {
  color: #606266;
  font-weight: 600;
}

.range-note,
.status-alert {
  margin-bottom: 12px;
}

.range-note {
  margin-top: 0;
  color: #909399;
  font-size: 13px;
}

.summary-row {
  margin-bottom: 12px;
}

.summary-item {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 8px;
}

.summary-label {
  font-size: 12px;
  color: #909399;
}

.summary-value {
  margin-top: 4px;
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.chart-wrapper {
  width: 100%;
  height: 500px;
}
</style>
