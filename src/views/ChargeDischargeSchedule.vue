<template>
  <div class="schedule-page">
    <SiteHeader />

    <el-card class="page-header-card">
      <template #header>
        <div class="page-header">
          <div>
            <span class="page-title">充放電排程</span>
            <div class="site-name">{{ emsStore.selectedSite.name }}</div>
          </div>
          <div class="header-actions">
            <el-tag type="warning" effect="light">Demo 模擬</el-tag>
            <el-button type="primary" @click="openDialog">新增排程</el-button>
          </div>
        </div>
      </template>
      <el-row :gutter="12" align="middle">
        <el-col :xs="24" :md="8">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="選擇排程日期"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
            @change="refreshChart"
          />
        </el-col>
        <el-col :xs="24" :md="16" class="header-note">
          依案場儲能容量（{{ emsStore.selectedSite.essPowerKw }} kW /
          {{ emsStore.selectedSite.essEnergyKwh }} kWh）規劃充放電時段，支援光電剩餘充電、夜間放電與尖峰抑低。
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="6">
        <el-card shadow="hover" class="summary-card charge-card">
          <div class="metric-label">排定充電時段</div>
          <div class="metric-value">{{ chargeSlotCount }} 段</div>
          <div class="metric-sub">合計 {{ totalChargeEnergy }} kWh</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="6">
        <el-card shadow="hover" class="summary-card discharge-card">
          <div class="metric-label">排定放電時段</div>
          <div class="metric-value">{{ dischargeSlotCount }} 段</div>
          <div class="metric-sub">合計 {{ totalDischargeEnergy }} kWh</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="6">
        <el-card shadow="hover" class="summary-card soc-card">
          <div class="metric-label">預估 SOC 區間</div>
          <div class="metric-value">{{ socRange.min }}% ~ {{ socRange.max }}%</div>
          <el-progress
            :percentage="socRange.max"
            :stroke-width="10"
            :show-text="false"
            status="success"
          />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="6">
        <el-card shadow="hover" class="summary-card status-card">
          <div class="metric-label">排程執行狀態</div>
          <div class="metric-value">{{ activeCount }} / {{ scheduleRows.length }}</div>
          <div class="metric-sub">已啟用排程數</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="14">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">24 小時充放電排程圖</div>
          </template>
          <div ref="chartRef" class="chart-wrapper" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">排程策略說明</div>
          </template>
          <div class="info-item">
            <span class="info-key">光電剩餘充電</span>
            <span class="info-value">10:00 ~ 14:00</span>
          </div>
          <div class="info-item">
            <span class="info-key">離峰充電</span>
            <span class="info-value">00:00 ~ 06:00</span>
          </div>
          <div class="info-item">
            <span class="info-key">尖峰放電</span>
            <span class="info-value">17:00 ~ 21:00</span>
          </div>
          <div class="info-item">
            <span class="info-key">最大充放電功率</span>
            <span class="info-value">{{ emsStore.selectedSite.essPowerKw }} kW</span>
          </div>
          <el-alert
            title="此頁為初步模擬，排程資料存於前端記憶體，可後續串接 EMS 排程 API。"
            type="info"
            :closable="false"
            show-icon
            class="mt-12"
          />
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">排程明細</div>
      </template>
      <el-table :data="scheduleRows" stripe>
        <el-table-column prop="name" label="排程名稱" min-width="140" />
        <el-table-column prop="timeRange" label="時段" width="140" />
        <el-table-column label="模式" width="100">
          <template #default="{ row }">
            <el-tag :type="row.mode === 'charge' ? 'success' : 'danger'" effect="light">
              {{ row.mode === 'charge' ? '充電' : '放電' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="powerKw" label="功率 (kW)" width="110" />
        <el-table-column prop="targetSoc" label="目標 SOC (%)" width="120" />
        <el-table-column prop="priority" label="優先序" width="80" />
        <el-table-column label="狀態" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              inline-prompt
              active-text="啟"
              inactive-text="停"
              @change="refreshChart"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="removeSchedule(row.id)">刪除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增充放電排程" width="480px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="排程名稱">
          <el-input v-model="form.name" placeholder="例如：離峰充電" />
        </el-form-item>
        <el-form-item label="時段">
          <el-time-picker
            v-model="form.timeRange"
            is-range
            range-separator="至"
            start-placeholder="開始"
            end-placeholder="結束"
            format="HH:mm"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="模式">
          <el-radio-group v-model="form.mode">
            <el-radio value="charge">充電</el-radio>
            <el-radio value="discharge">放電</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="功率 (kW)">
          <el-input-number v-model="form.powerKw" :min="0" :max="essPowerCap" :step="10" />
        </el-form-item>
        <el-form-item label="目標 SOC (%)">
          <el-input-number v-model="form.targetSoc" :min="0" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addSchedule">加入排程</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import SiteHeader from '../components/SiteHeader.vue'
import { useEmsStore } from '../stores/emsStore'

const emsStore = useEmsStore()
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const chartRef = ref(null)
const dialogVisible = ref(false)
let chart = null

const essPowerCap = computed(() => Number(emsStore.selectedSite.essPowerKw || 600))

const defaultSchedules = () => [
  { id: 1, name: '離峰充電', timeRange: '00:00-06:00', startHour: 0, endHour: 6, mode: 'charge', powerKw: 200, targetSoc: 80, priority: 1, enabled: true },
  { id: 2, name: '光電剩餘充電', timeRange: '10:00-14:00', startHour: 10, endHour: 14, mode: 'charge', powerKw: 150, targetSoc: 90, priority: 2, enabled: true },
  { id: 3, name: '尖峰放電抑低', timeRange: '17:00-21:00', startHour: 17, endHour: 21, mode: 'discharge', powerKw: 300, targetSoc: 35, priority: 1, enabled: true },
  { id: 4, name: '備援待命放電', timeRange: '21:00-23:00', startHour: 21, endHour: 23, mode: 'discharge', powerKw: 120, targetSoc: 30, priority: 3, enabled: false }
]

const scheduleRows = ref(defaultSchedules())
let nextId = 5

const form = reactive({
  name: '',
  timeRange: null,
  mode: 'charge',
  powerKw: 200,
  targetSoc: 80
})

const chargeSlotCount = computed(() => scheduleRows.value.filter(r => r.enabled && r.mode === 'charge').length)
const dischargeSlotCount = computed(() => scheduleRows.value.filter(r => r.enabled && r.mode === 'discharge').length)
const activeCount = computed(() => scheduleRows.value.filter(r => r.enabled).length)

const hoursBetween = (start, end) => Math.max(end - start, 1)

const totalChargeEnergy = computed(() =>
  scheduleRows.value
    .filter(r => r.enabled && r.mode === 'charge')
    .reduce((sum, r) => sum + r.powerKw * hoursBetween(r.startHour, r.endHour), 0)
    .toFixed(0)
)

const totalDischargeEnergy = computed(() =>
  scheduleRows.value
    .filter(r => r.enabled && r.mode === 'discharge')
    .reduce((sum, r) => sum + r.powerKw * hoursBetween(r.startHour, r.endHour), 0)
    .toFixed(0)
)

const socRange = computed(() => {
  const enabled = scheduleRows.value.filter(r => r.enabled)
  if (!enabled.length) return { min: 30, max: 50 }
  const socs = enabled.map(r => r.targetSoc)
  return { min: Math.min(...socs), max: Math.max(...socs) }
})

const buildChartOption = () => {
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
  const chargeData = hours.map((_, h) => {
    const row = scheduleRows.value.find(r => r.enabled && r.mode === 'charge' && h >= r.startHour && h < r.endHour)
    return row ? row.powerKw : 0
  })
  const dischargeData = hours.map((_, h) => {
    const row = scheduleRows.value.find(r => r.enabled && r.mode === 'discharge' && h >= r.startHour && h < r.endHour)
    return row ? -row.powerKw : 0
  })

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['充電', '放電'], top: 0 },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: hours, boundaryGap: false },
    yAxis: { type: 'value', name: '功率 (kW)' },
    series: [
      {
        name: '充電',
        type: 'bar',
        stack: 'power',
        data: chargeData,
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '放電',
        type: 'bar',
        stack: 'power',
        data: dischargeData,
        itemStyle: { color: '#f56c6c' }
      }
    ]
  }
}

const refreshChart = () => {
  if (!chart) return
  chart.setOption(buildChartOption(), true)
}

const initChart = () => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  refreshChart()
}

const openDialog = () => {
  form.name = ''
  form.timeRange = null
  form.mode = 'charge'
  form.powerKw = Math.min(200, essPowerCap.value)
  form.targetSoc = 80
  dialogVisible.value = true
}

const formatTime = (date) => {
  if (!date) return '00:00'
  const h = date.getHours()
  const m = date.getMinutes()
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const addSchedule = () => {
  if (!form.name.trim()) {
    ElMessage.warning('請輸入排程名稱')
    return
  }
  if (!form.timeRange || form.timeRange.length !== 2) {
    ElMessage.warning('請選擇時段')
    return
  }
  const [start, end] = form.timeRange
  const startHour = start.getHours()
  const endHour = end.getHours() || 24
  scheduleRows.value.push({
    id: nextId++,
    name: form.name.trim(),
    timeRange: `${formatTime(start)}-${formatTime(end)}`,
    startHour,
    endHour,
    mode: form.mode,
    powerKw: form.powerKw,
    targetSoc: form.targetSoc,
    priority: scheduleRows.value.length + 1,
    enabled: true
  })
  dialogVisible.value = false
  refreshChart()
  ElMessage.success('排程已加入（模擬）')
}

const removeSchedule = (id) => {
  scheduleRows.value = scheduleRows.value.filter(r => r.id !== id)
  refreshChart()
}

watch(() => emsStore.selectedSiteId, () => {
  scheduleRows.value = defaultSchedules()
  nextId = 5
  refreshChart()
})

onMounted(() => {
  initChart()
  window.addEventListener('resize', refreshChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', refreshChart)
  chart?.dispose()
})
</script>

<style scoped>
.schedule-page {
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
  flex-wrap: wrap;
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
  color: #409eff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-note {
  color: #606266;
  font-size: 14px;
}

.summary-card {
  margin-bottom: 0;
}

.charge-card { border-left: 4px solid #67c23a; }
.discharge-card { border-left: 4px solid #f56c6c; }
.soc-card { border-left: 4px solid #409eff; }
.status-card { border-left: 4px solid #e6a23c; }

.metric-label {
  color: #909399;
  font-size: 13px;
}

.metric-value {
  margin: 6px 0;
  font-size: 28px;
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

.chart-wrapper {
  height: 320px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.info-key { color: #909399; }
.info-value { color: #303133; text-align: right; }
.mt-12 { margin-top: 12px; }
</style>
