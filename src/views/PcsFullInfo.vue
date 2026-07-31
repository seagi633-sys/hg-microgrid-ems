<template>
  <div class="pcs-full-page">
    <SiteHeader />

    <el-card class="pcs-full-card">
      <template #header>
        <div class="pcs-full-header">
          <div>
            <div class="pcs-full-title">PCS參數資訊</div>
            <div class="pcs-full-subtitle">
              PostgreSQL · PCS-1 ~ PCS-6 · 最新更新 {{ allLatestRecordedAt || '—' }}
            </div>
          </div>
          <div class="pcs-full-actions">
            <el-button :icon="Refresh" :loading="manualRefreshing" type="primary" plain @click="refreshAll">
              全部重新整理
            </el-button>
            <el-button :icon="Back" plain @click="goBack">
              返回儲能系統
            </el-button>
          </div>
        </div>
      </template>

      <div class="pcs-full-status">
        <el-tag :type="hasAnyPcsValue ? 'success' : 'info'" effect="light">
          {{ hasAnyPcsValue ? '已取得 PCS 即時資料' : '尚無 PCS 即時資料' }}
        </el-tag>
      </div>

      <div class="pcs-panel-list">
        <section
          v-for="panel in pcsPanels"
          :key="panel.panelIndex"
          class="pcs-panel"
          :class="{ 'is-minimized': panel.minimized }"
        >
          <div class="pcs-panel-header">
            <div>
              <div class="pcs-panel-title">PCS-{{ panel.selectedUnit }}</div>
              <div class="pcs-panel-subtitle">
                區塊 {{ panel.panelIndex }} ·
                最新更新 {{ panel.latestRecordedAt || '—' }}
              </div>
            </div>
            <div class="pcs-panel-actions">
              <el-select
                :model-value="panel.selectedUnit"
                class="pcs-panel-select"
                size="small"
                @change="(value) => setPanelUnit(panel.panelIndex, value)"
              >
                <el-option
                  v-for="unit in unitOptions"
                  :key="unit.value"
                  :label="unit.label"
                  :value="unit.value"
                />
              </el-select>
              <el-tag :type="panel.hasAnyValue ? 'success' : 'info'" effect="light">
                {{ panel.hasAnyValue ? '已連線' : '尚無資料' }}
              </el-tag>
              <el-button size="small" plain @click="togglePanel(panel.panelIndex)">
                {{ panel.minimized ? '展開' : '最小化' }}
              </el-button>
            </div>
          </div>

          <el-alert
            v-if="panel.connectionError && !panel.minimized"
            :title="panel.connectionError"
            type="warning"
            show-icon
            :closable="false"
            class="pcs-full-alert"
          />

          <div
            v-show="!panel.minimized"
            v-loading="panel.loading"
            class="pcs-point-grid"
          >
            <div
              v-for="(column, columnIndex) in panel.pointColumns"
              :key="`pcs-panel-${panel.panelIndex}-point-column-${columnIndex}`"
              class="pcs-point-column"
            >
              <div class="pcs-column-header">
                <span>參數名稱</span>
                <span>數值</span>
              </div>
              <div
                v-for="row in column"
                :key="row.pointId"
                class="pcs-point-row"
              >
                <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                <div
                  class="pcs-value"
                  :class="{ 'is-error': row.error, 'is-empty': !row.error && !row.hasValue }"
                >
                  {{ row.displayValue }}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Back, Refresh } from '@element-plus/icons-vue'
import SiteHeader from '../components/SiteHeader.vue'
import { useEmsStore } from '../stores/emsStore'
import { usePcsFullRealtime } from '../composables/useBmsRealtime'
import { ESS_CABINET_COUNT } from '../config/vppSites'

const router = useRouter()
const emsStore = useEmsStore()
const selectedSiteId = computed(() => emsStore.selectedSiteId)

const manualRefreshing = ref(false)
const loadedPanels = ref({})
const minimizedPanels = ref({})
const unitOptions = Array.from({ length: ESS_CABINET_COUNT }, (_, index) => ({
  label: `PCS-${index + 1}`,
  value: index + 1
}))
const panelUnitRefs = Array.from({ length: ESS_CABINET_COUNT }, (_, index) => ref(index + 1))
const pcsRealtimeUnits = panelUnitRefs.map((unitIndexRef, index) => {
  const panelIndex = index + 1
  return {
    panelIndex,
    unitIndexRef,
    ...usePcsFullRealtime(selectedSiteId, unitIndexRef, 5000)
  }
})

pcsRealtimeUnits.forEach((unit) => {
  watch(unit.loading, (isLoading) => {
    if (!isLoading) {
      loadedPanels.value = {
        ...loadedPanels.value,
        [unit.panelIndex]: true
      }
    }
  })
})

const hasMetricValue = (item) => Number.isFinite(Number(item.value))

const formatMetricValue = (item) => {
  if (item.error) return item.error
  if (!hasMetricValue(item)) return '—'
  const decimals = item.decimals ?? 2
  const value = Number(item.value).toFixed(decimals)
  return item.unit ? `${value} ${item.unit}` : value
}

const formatDisplayPointId = (pointId) =>
  pointId
    .replace(/^PCS\d+_/, '')
    .replace(/^U1_/, '')
    .replace(/_U1_/g, '_')
    .replace('INSULATION_RESISTANCE', 'INSULATION_RES')

const buildRows = (metrics) =>
  metrics.map((item) => ({
    ...item,
    hasValue: hasMetricValue(item),
    displayPointId: formatDisplayPointId(item.pointId),
    displayValue: formatMetricValue(item)
  }))

const buildPointColumns = (rows) => {
  const rowsPerColumn = 7
  const columns = []
  for (let index = 0; index < rows.length; index += rowsPerColumn) {
    columns.push(rows.slice(index, index + rowsPerColumn))
  }
  return columns
}

const pcsPanels = computed(() =>
  pcsRealtimeUnits.map((unit) => {
    const rows = buildRows(unit.metrics.value)
    return {
      panelIndex: unit.panelIndex,
      selectedUnit: unit.unitIndexRef.value,
      loading: unit.loading.value && !loadedPanels.value[unit.panelIndex],
      connectionError: unit.connectionError.value,
      latestRecordedAt: unit.latestRecordedAt.value,
      hasAnyValue: unit.hasAnyValue.value,
      minimized: Boolean(minimizedPanels.value[unit.panelIndex]),
      pointColumns: buildPointColumns(rows)
    }
  })
)

const allLatestRecordedAt = computed(() => {
  const times = pcsPanels.value
    .map((panel) => panel.latestRecordedAt)
    .filter(Boolean)
    .sort()
  return times.length ? times[times.length - 1] : ''
})

const hasAnyPcsValue = computed(() => pcsPanels.value.some((panel) => panel.hasAnyValue))

const setPanelUnit = (panelIndex, unitIndex) => {
  panelUnitRefs[panelIndex - 1].value = unitIndex
  loadedPanels.value = {
    ...loadedPanels.value,
    [panelIndex]: false
  }
}

const togglePanel = (panelIndex) => {
  minimizedPanels.value = {
    ...minimizedPanels.value,
    [panelIndex]: !minimizedPanels.value[panelIndex]
  }
}

const refreshAll = async () => {
  manualRefreshing.value = true
  try {
    await Promise.all(pcsRealtimeUnits.map((unit) => unit.fetchAll()))
  } finally {
    manualRefreshing.value = false
  }
}

const goBack = () => {
  router.push('/ess-system')
}
</script>

<style scoped>
.pcs-full-page {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
}

.pcs-full-card {
  border-left: 4px solid #409eff;
}

.pcs-full-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.pcs-full-title {
  font-size: 30px;
  font-weight: 800;
  color: #303133;
}

.pcs-full-subtitle {
  margin-top: 8px;
  font-size: 16px;
  color: #909399;
}

.pcs-full-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.pcs-full-alert {
  margin: 12px 14px 0;
}

.pcs-full-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.pcs-panel-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pcs-panel {
  overflow: hidden;
  border: 1px solid #d9ecff;
  border-left: 4px solid #409eff;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(64, 158, 255, 0.08);
}

.pcs-panel.is-minimized {
  border-left-color: #909399;
}

.pcs-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: linear-gradient(90deg, #ecf5ff 0%, #ffffff 100%);
  border-bottom: 1px solid #d9ecff;
}

.pcs-panel.is-minimized .pcs-panel-header {
  border-bottom: none;
}

.pcs-panel-title {
  font-size: 22px;
  font-weight: 800;
  color: #303133;
}

.pcs-panel-subtitle {
  margin-top: 3px;
  font-size: 13px;
  color: #909399;
}

.pcs-panel-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.pcs-panel-select {
  width: 112px;
}

.pcs-point-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(190px, 1fr));
  gap: 10px;
  align-items: start;
  overflow-x: auto;
  padding: 14px;
}

.pcs-point-column {
  min-height: 230px;
  padding: 0 0 8px;
  border: 1px solid #0f6b7a;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 107, 122, 0.12);
}

.pcs-column-header,
.pcs-point-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 76px;
  gap: 5px;
  align-items: baseline;
}

.pcs-column-header {
  padding: 7px 10px;
  margin-bottom: 7px;
  background: #0f6b7a;
  font-size: 15px;
  font-weight: 800;
  color: #fff;
}

.pcs-column-header span:last-child {
  text-align: right;
}

.pcs-point-row {
  padding: 4px 8px;
  margin: 0 8px 3px;
  min-height: 23px;
  border-radius: 4px;
}

.pcs-point-row:nth-child(even) {
  background: #eef9fc;
}

.pcs-point-row:nth-child(odd) {
  background: #fff8e6;
}

.pcs-point-id {
  font-family: Consolas, 'Courier New', monospace;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: normal;
}

.pcs-value {
  font-size: 18px;
  font-weight: 800;
  color: #00a344;
  line-height: 1.3;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: normal;
}

.pcs-value.is-error {
  color: #e6a23c;
}

.pcs-value.is-empty {
  color: #909399;
}

@media (max-width: 768px) {
  .pcs-full-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .pcs-full-actions {
    justify-content: flex-start;
    width: 100%;
  }

  .pcs-point-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
