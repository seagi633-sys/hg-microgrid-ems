<template>
  <div class="schedule-page">
    <SiteHeader />

    <el-card class="page-header-card">
      <template #header>
        <div class="page-header">
          <div>
            <span class="page-title">電力服務排程</span>
            <div class="site-name">{{ emsStore.selectedSite.name }}</div>
          </div>
          <div class="header-actions">
            <el-tag type="warning" effect="light">Demo 模擬</el-tag>
            <el-button type="primary" @click="openDialog">新增服務排程</el-button>
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
          />
        </el-col>
        <el-col :xs="24" :md="16" class="header-note">
          規劃需量反應、卸載服務、尖離峰移轉等電力服務時段，協調儲能與市電資源參與電力市場或台電輔助服務。
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="6">
        <el-card shadow="hover" class="summary-card">
          <div class="metric-label">今日服務排程</div>
          <div class="metric-value">{{ serviceRows.length }} 項</div>
          <div class="metric-sub">已啟用 {{ activeCount }} 項</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="6">
        <el-card shadow="hover" class="summary-card">
          <div class="metric-label">預估參與容量</div>
          <div class="metric-value">{{ totalCapacity }} kW</div>
          <div class="metric-sub">啟用中服務合計</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="6">
        <el-card shadow="hover" class="summary-card">
          <div class="metric-label">預估服務收益</div>
          <div class="metric-value">${{ estimatedRevenue }}</div>
          <div class="metric-sub">模擬試算（NTD）</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="6">
        <el-card shadow="hover" class="summary-card">
          <div class="metric-label">下一個服務時段</div>
          <div class="metric-value next-slot">{{ nextService?.timeRange || '—' }}</div>
          <div class="metric-sub">{{ nextService?.serviceType || '今日無待執行排程' }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="15">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">電力服務排程明細</div>
          </template>
          <el-table :data="serviceRows" stripe>
            <el-table-column prop="serviceType" label="服務類型" min-width="130" />
            <el-table-column prop="timeRange" label="執行時段" width="140" />
            <el-table-column prop="capacityKw" label="參與容量 (kW)" width="130" />
            <el-table-column prop="duration" label="時數" width="70" />
            <el-table-column prop="unitPrice" label="單價 (元/kWh)" width="120" />
            <el-table-column label="預估收益" width="110">
              <template #default="{ row }">
                {{ calcRevenue(row).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column label="資源" width="100">
              <template #default="{ row }">
                <el-tag size="small" effect="light">{{ row.resource }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="狀態" width="100">
              <template #default="{ row }">
                <el-switch
                  v-model="row.enabled"
                  inline-prompt
                  active-text="啟"
                  inactive-text="停"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="90" fixed="right">
              <template #default="{ row }">
                <el-button link type="danger" @click="removeService(row.id)">刪除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="9">
        <el-card class="timeline-card">
          <template #header>
            <div class="card-header">今日服務時間軸</div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="item in timelineItems"
              :key="item.id"
              :timestamp="item.timeRange"
              :type="item.enabled ? item.color : 'info'"
              placement="top"
            >
              <div class="timeline-title">{{ item.serviceType }}</div>
              <div class="timeline-desc">
                {{ item.capacityKw }} kW · {{ item.resource }}
                <el-tag v-if="!item.enabled" size="small" type="info" class="ml-6">已停用</el-tag>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-if="!timelineItems.length" description="尚無排程" />
        </el-card>

        <el-card class="info-card mt-16">
          <template #header>
            <div class="card-header">服務類型說明</div>
          </template>
          <div v-for="tip in serviceTips" :key="tip.title" class="tip-item">
            <div class="tip-title">{{ tip.title }}</div>
            <div class="tip-desc">{{ tip.desc }}</div>
          </div>
          <el-alert
            title="此頁為初步模擬，收益為試算值，實際需依台電/電力交易平台規則計算。"
            type="info"
            :closable="false"
            show-icon
            class="mt-12"
          />
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" title="新增電力服務排程" width="500px">
      <el-form :model="form" label-width="110px">
        <el-form-item label="服務類型">
          <el-select v-model="form.serviceType" placeholder="選擇服務類型" style="width: 100%;">
            <el-option v-for="t in serviceTypeOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="執行時段">
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
        <el-form-item label="參與容量 (kW)">
          <el-input-number v-model="form.capacityKw" :min="0" :max="essPowerCap" :step="10" />
        </el-form-item>
        <el-form-item label="參與資源">
          <el-select v-model="form.resource" style="width: 100%;">
            <el-option label="儲能" value="儲能" />
            <el-option label="儲能+光電" value="儲能+光電" />
            <el-option label="市電卸載" value="市電卸載" />
          </el-select>
        </el-form-item>
        <el-form-item label="單價 (元/kWh)">
          <el-input-number v-model="form.unitPrice" :min="0" :step="0.5" :precision="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addService">加入排程</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import SiteHeader from '../components/SiteHeader.vue'
import { useEmsStore } from '../stores/emsStore'

const emsStore = useEmsStore()
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const dialogVisible = ref(false)

const essPowerCap = computed(() => Number(emsStore.selectedSite.essPowerKw || 600))

const serviceTypeOptions = [
  '需量反應',
  '卸載服務',
  '尖峰移轉',
  '離峰充電',
  '調頻備轉',
  '即時備轉'
]

const serviceTips = [
  { title: '需量反應', desc: '於契約容量超限前，透過儲能放電或負載卸載降低需量。' },
  { title: '卸載服務', desc: '依台電通知於指定時段降低用電，可獲得補償。' },
  { title: '尖峰移轉', desc: '將尖峰用電移至離峰時段，降低電費支出。' },
  { title: '調頻備轉', desc: '提供快速上下調頻能力，參與輔助服務市場。' }
]

const defaultServices = () => [
  { id: 1, serviceType: '需量反應', timeRange: '14:00-16:00', startHour: 14, capacityKw: 200, duration: 2, unitPrice: 12.5, resource: '儲能', enabled: true, color: 'primary' },
  { id: 2, serviceType: '尖峰移轉', timeRange: '17:00-21:00', startHour: 17, capacityKw: 350, duration: 4, unitPrice: 8.0, resource: '儲能+光電', enabled: true, color: 'warning' },
  { id: 3, serviceType: '卸載服務', timeRange: '12:00-13:00', startHour: 12, capacityKw: 100, duration: 1, unitPrice: 15.0, resource: '市電卸載', enabled: true, color: 'danger' },
  { id: 4, serviceType: '調頻備轉', timeRange: '09:00-11:00', startHour: 9, capacityKw: 150, duration: 2, unitPrice: 20.0, resource: '儲能', enabled: false, color: 'success' }
]

const serviceRows = ref(defaultServices())
let nextId = 5

const form = reactive({
  serviceType: '需量反應',
  timeRange: null,
  capacityKw: 200,
  resource: '儲能',
  unitPrice: 10
})

const calcRevenue = (row) => Math.round(row.capacityKw * row.duration * row.unitPrice)

const activeCount = computed(() => serviceRows.value.filter(r => r.enabled).length)

const totalCapacity = computed(() =>
  serviceRows.value.filter(r => r.enabled).reduce((sum, r) => sum + r.capacityKw, 0)
)

const estimatedRevenue = computed(() =>
  serviceRows.value.filter(r => r.enabled).reduce((sum, r) => sum + calcRevenue(r), 0).toLocaleString()
)

const timelineItems = computed(() =>
  [...serviceRows.value].sort((a, b) => a.startHour - b.startHour)
)

const nextService = computed(() => {
  const now = new Date()
  const currentHour = now.getHours()
  const upcoming = timelineItems.value
    .filter(r => r.enabled && r.startHour >= currentHour)
  return upcoming[0] || timelineItems.value.find(r => r.enabled) || null
})

const openDialog = () => {
  form.serviceType = '需量反應'
  form.timeRange = null
  form.capacityKw = Math.min(200, essPowerCap.value)
  form.resource = '儲能'
  form.unitPrice = 10
  dialogVisible.value = true
}

const formatTime = (date) => {
  if (!date) return '00:00'
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const addService = () => {
  if (!form.timeRange || form.timeRange.length !== 2) {
    ElMessage.warning('請選擇執行時段')
    return
  }
  const [start, end] = form.timeRange
  const startHour = start.getHours()
  const endHour = end.getHours() || 24
  const duration = Math.max(endHour - startHour, 1)
  const colorMap = { 需量反應: 'primary', 卸載服務: 'danger', 尖峰移轉: 'warning', 調頻備轉: 'success', 即時備轉: 'success', 離峰充電: 'info' }

  serviceRows.value.push({
    id: nextId++,
    serviceType: form.serviceType,
    timeRange: `${formatTime(start)}-${formatTime(end)}`,
    startHour,
    capacityKw: form.capacityKw,
    duration,
    unitPrice: form.unitPrice,
    resource: form.resource,
    enabled: true,
    color: colorMap[form.serviceType] || 'primary'
  })
  dialogVisible.value = false
  ElMessage.success('服務排程已加入（模擬）')
}

const removeService = (id) => {
  serviceRows.value = serviceRows.value.filter(r => r.id !== id)
}

watch(() => emsStore.selectedSiteId, () => {
  serviceRows.value = defaultServices()
  nextId = 5
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
  color: #e6a23c;
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
  border-left: 4px solid #e6a23c;
}

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

.metric-value.next-slot {
  font-size: 22px;
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

.timeline-title {
  font-weight: 600;
  color: #303133;
}

.timeline-desc {
  color: #606266;
  font-size: 13px;
  margin-top: 4px;
}

.tip-item {
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.tip-title {
  font-weight: 600;
  color: #303133;
}

.tip-desc {
  font-size: 13px;
  color: #606266;
  margin-top: 4px;
}

.mt-12 { margin-top: 12px; }
.mt-16 { margin-top: 16px; }
.ml-6 { margin-left: 6px; }
</style>
