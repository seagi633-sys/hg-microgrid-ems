<template>
  <el-card class="site-status-card" shadow="never">
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
      class="status-alert"
    />
    <el-table
      :data="sites"
      stripe
      class="site-status-table"
      v-loading="loading && sites.length === 0"
      empty-text="尚無案場資料"
    >
      <el-table-column label="案場" min-width="140">
        <template #default="{ row }">
          <span class="site-id">{{ row.site_id }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="site_name" label="名稱" min-width="180" />
      <el-table-column label="連線" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.online ? 'success' : 'danger'" effect="light" round>
            {{ row.online ? 'online' : 'offline' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="資料延遲" width="120" align="center">
        <template #default="{ row }">
          <span class="muted">{{ delayText(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最後上線（台北）" min-width="190">
        <template #default="{ row }">
          <span class="muted">{{ lastSeenText(row.last_seen_at) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="目前警報" min-width="320">
        <template #default="{ row }">
          <div class="alarm-cell">
            <span class="alarm-total">{{ row.alarms.total }}</span>
            <span class="severity critical">critical: {{ row.alarms.critical }}</span>
            <span class="severity warning">warning: {{ row.alarms.warning }}</span>
            <span class="severity info">info: {{ row.alarms.info }}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const POLL_MS = 5000

const sites = ref([])
const loading = ref(false)
const error = ref('')
let stopped = false
let timer = null

function delayText(row) {
  if (row.data_delay_sec == null) return '- s'
  return `${row.data_delay_sec} s`
}

function lastSeenText(iso) {
  if (!iso) return '-'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date)
  const pick = (type) => parts.find((part) => part.type === type)?.value || ''
  const hour = pick('hour') === '24' ? '00' : pick('hour')
  return `${pick('year')}-${pick('month')}-${pick('day')} ${hour}:${pick('minute')}:${pick('second')}`
}

async function loadStatuses() {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/api/vpp/sites/status`)
    const body = await res.json().catch(() => ({}))
    if (!res.ok || body.ok === false) {
      throw new Error(body.error || `HTTP ${res.status}`)
    }
    sites.value = Array.isArray(body.sites) ? body.sites : []
    error.value = ''
  } catch (err) {
    error.value = err.message || '無法讀取案場狀態'
  } finally {
    loading.value = false
  }
}

function scheduleNext() {
  if (stopped) return
  timer = setTimeout(async () => {
    await loadStatuses()
    scheduleNext()
  }, POLL_MS)
}

onMounted(async () => {
  await loadStatuses()
  scheduleNext()
})

onUnmounted(() => {
  stopped = true
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.site-status-card {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.status-alert {
  margin-bottom: 12px;
}

.site-status-table {
  width: 100%;
}

.site-id {
  color: #409eff;
  font-weight: 600;
}

.muted {
  color: #606266;
}

.alarm-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.alarm-total {
  min-width: 1.5rem;
  font-weight: 700;
  color: #303133;
}

.severity {
  font-size: 13px;
  font-weight: 600;
}

.severity.critical {
  color: #f56c6c;
}

.severity.warning {
  color: #e6a23c;
}

.severity.info {
  color: #409eff;
}
</style>
