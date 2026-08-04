<template>
  <div class="pcs-full-page">
    <SiteHeader />

    <el-card class="pcs-full-card">
      <template #header>
        <div class="pcs-full-header">
          <div>
            <div class="pcs-full-title">設備細部參數</div>
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

      <el-tabs v-model="activeDetailTab" class="device-detail-tabs">
        <el-tab-pane label="BMS" name="bms">
          <div class="pcs-full-status">
            <el-tag :type="hasAnyBmsValue ? 'success' : 'info'" effect="light">
              {{ hasAnyBmsValue ? '已取得 BMS 即時資料' : '尚無 BMS 即時資料' }}
            </el-tag>
          </div>

          <div class="pcs-panel-list">
            <section
              v-for="panel in bmsPanels"
              :key="`bms-panel-${panel.panelIndex}`"
              class="pcs-panel bms-panel"
              :class="{ 'is-minimized': panel.minimized }"
            >
              <div class="pcs-panel-header">
                <div>
                  <div class="pcs-panel-title">BMS-{{ panel.selectedUnit }}</div>
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
                    @change="(value) => setBmsPanelUnit(panel.panelIndex, value)"
                  >
                    <el-option
                      v-for="unit in bmsUnitOptions"
                      :key="unit.value"
                      :label="unit.label"
                      :value="unit.value"
                    />
                  </el-select>
                  <el-tag :type="panel.hasAnyValue ? 'success' : 'info'" effect="light">
                    {{ panel.hasAnyValue ? '已連線' : '尚無資料' }}
                  </el-tag>
                  <el-button size="small" plain @click="toggleBmsPanel(panel.panelIndex)">
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
                class="bms-detail-grid"
              >
                <div class="bms-detail-column bms-status-column">
                  <div class="pcs-column-header bms-status-header">
                    <span>電池狀態</span>
                  </div>
                  <div
                    v-for="row in panel.statusRows"
                    :key="row.pointId"
                    class="pcs-point-row"
                  >
                    <div class="bms-status-point">
                      <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                      <div class="bms-status-raw-value">({{ formatStatusRawValue(row) }})</div>
                    </div>
                    <div
                      class="pcs-value bms-status-value"
                      :class="{ 'is-error': row.error, 'is-empty': !row.error && !row.hasValue, 'is-abnormal': row.isAbnormal, 'is-working-status': row.isWorkingStatus }"
                      :title="row.displayValue"
                    >
                      <ul v-if="row.statusItems.length" class="bms-status-list">
                        <li v-for="statusItem in row.statusItems" :key="statusItem">
                          {{ statusItem }}
                        </li>
                      </ul>
                      <template v-else>{{ row.displayValue }}</template>
                    </div>
                  </div>
                </div>

                <div class="bms-detail-column">
                  <div class="pcs-column-header">
                    <span>參數名稱</span>
                    <span>數值</span>
                  </div>
                  <div
                    v-for="row in panel.metricRows"
                    :key="row.pointId"
                    class="pcs-point-row"
                  >
                    <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                    <div
                      class="pcs-value"
                      :class="{ 'is-error': row.error, 'is-empty': !row.error && !row.hasValue, 'is-abnormal': row.isAbnormal }"
                    >
                      {{ row.displayValue }}
                    </div>
                  </div>
                </div>

                <div class="bms-detail-column bms-index-column">
                  <div class="bms-index-header">
                    <span>最高/最低 Cell 參數</span>
                    <span>數值</span>
                    <span>Index</span>
                  </div>
                  <div
                    v-for="row in panel.indexRows"
                    :key="row.pointId"
                    class="bms-index-row"
                  >
                    <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                    <div
                      class="pcs-value"
                      :class="{ 'is-error': row.error, 'is-empty': !row.error && !row.hasValue, 'is-abnormal': row.isAbnormal }"
                    >
                      {{ row.displayValue }}
                    </div>
                    <div class="bms-index-value">{{ row.indexText || '—' }}</div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </el-tab-pane>
        <el-tab-pane label="PCS" name="pcs">
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
                    @change="(value) => setPcsPanelUnit(panel.panelIndex, value)"
                  >
                    <el-option
                      v-for="unit in pcsUnitOptions"
                      :key="unit.value"
                      :label="unit.label"
                      :value="unit.value"
                    />
                  </el-select>
                  <el-tag :type="panel.hasAnyValue ? 'success' : 'info'" effect="light">
                    {{ panel.hasAnyValue ? '已連線' : '尚無資料' }}
                  </el-tag>
                  <el-button size="small" plain @click="togglePcsPanel(panel.panelIndex)">
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
                  :class="{ 'pcs-status-column': isPcsStatusColumn(column) }"
                >
                  <div
                    class="pcs-column-header"
                    :class="{ 'pcs-status-header': isPcsStatusColumn(column) }"
                  >
                    <template v-if="isPcsStatusColumn(column)">
                      <span>PCS狀態</span>
                    </template>
                    <template v-else>
                      <span>參數名稱</span>
                      <span>數值</span>
                    </template>
                  </div>
                  <div
                    v-for="row in column"
                    :key="row.pointId"
                    class="pcs-point-row"
                  >
                    <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                    <div
                      class="pcs-value"
                      :class="{
                        'is-error': row.error,
                        'is-empty': !row.error && !row.hasValue,
                        'is-abnormal': row.isAbnormal,
                        'is-alarm-status': row.isAlarmStatus,
                        'is-alarm-normal': row.isAlarmNormal
                      }"
                      :title="row.displayValue"
                    >
                      <ul v-if="row.isAlarmPoint && row.statusItems.length" class="pcs-status-list">
                        <li
                          v-for="statusItem in row.statusItems"
                          :key="statusItem"
                          :class="{ 'is-normal-text': isNormalStatusText(statusItem) }"
                        >
                          {{ statusItem }}
                        </li>
                      </ul>
                      <template v-else>{{ row.displayValue }}</template>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </el-tab-pane>
        <el-tab-pane label="ATS" name="ats">
          <el-empty description="ATS 細部參數尚未建立" />
        </el-tab-pane>
        <el-tab-pane label="MC" name="mc">
          <el-empty description="MC 細部參數尚未建立" />
        </el-tab-pane>
        <el-tab-pane label="MPM" name="mpm">
          <el-empty description="MPM 細部參數尚未建立" />
        </el-tab-pane>
        <el-tab-pane label="RCB" name="rcb">
          <el-empty description="RCB 細部參數尚未建立" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Back, Refresh } from '@element-plus/icons-vue'
import SiteHeader from '../components/SiteHeader.vue'
import { useEmsStore } from '../stores/emsStore'
import { useBmsFullRealtime, usePcsFullRealtime } from '../composables/useBmsRealtime'
import { ESS_CABINET_COUNT } from '../config/vppSites'

const router = useRouter()
const emsStore = useEmsStore()
const selectedSiteId = computed(() => emsStore.selectedSiteId)

const activeDetailTab = ref('bms')
const manualRefreshing = ref(false)
const bmsLoadedPanels = ref({})
const bmsMinimizedPanels = ref({})
const pcsLoadedPanels = ref({})
const pcsMinimizedPanels = ref({})
const buildUnitOptions = (prefix) => Array.from({ length: ESS_CABINET_COUNT }, (_, index) => ({
  label: `${prefix}-${index + 1}`,
  value: index + 1
}))
const bmsUnitOptions = buildUnitOptions('BMS')
const pcsUnitOptions = buildUnitOptions('PCS')
const bmsPanelUnitRefs = Array.from({ length: ESS_CABINET_COUNT }, (_, index) => ref(index + 1))
const pcsPanelUnitRefs = Array.from({ length: ESS_CABINET_COUNT }, (_, index) => ref(index + 1))
const bmsRealtimeUnits = bmsPanelUnitRefs.map((unitIndexRef, index) => {
  const panelIndex = index + 1
  return {
    panelIndex,
    unitIndexRef,
    ...useBmsFullRealtime(selectedSiteId, unitIndexRef, 5000)
  }
})
const pcsRealtimeUnits = pcsPanelUnitRefs.map((unitIndexRef, index) => {
  const panelIndex = index + 1
  return {
    panelIndex,
    unitIndexRef,
    ...usePcsFullRealtime(selectedSiteId, unitIndexRef, 5000)
  }
})

const registerLoadedWatch = (units, loadedPanels) => {
  units.forEach((unit) => {
    watch(unit.loading, (isLoading) => {
      if (!isLoading) {
        loadedPanels.value = {
          ...loadedPanels.value,
          [unit.panelIndex]: true
        }
      }
    })
  })
}

registerLoadedWatch(bmsRealtimeUnits, bmsLoadedPanels)
registerLoadedWatch(pcsRealtimeUnits, pcsLoadedPanels)

const hasMetricValue = (item) => Number.isFinite(Number(item.value))
const isStatusPoint = (item) => item.pointId?.includes('_STATUS')
const isAlarmPoint = (item) => item.pointId?.includes('_ALARM_')
const isActivePowerControlEnable = (item) => item.pointId?.endsWith('_ACTIVE_POWER_CONTROL_ENABLE')
const isPowerCommand = (item) => item.pointId?.endsWith('_POWER_COMMAND')
const isPcsStatePoint = (item) =>
  isStatusPoint(item)
  || isAlarmPoint(item)
  || isActivePowerControlEnable(item)
  || isPowerCommand(item)
  || item.pointId?.endsWith('_RUN_STATE')
  || item.pointId?.endsWith('_GRID_MODE')
  || item.pointId?.endsWith('_GRID_MODE_COMMAND')
const hasDisplayValue = (item) =>
  isPcsStatePoint(item) ? Boolean(item.decodedStatus) : hasMetricValue(item) || Boolean(item.decodedStatus)
const isRacksErrorStatus = (item) => item.key === 'racksErrorStatus'
const isRacksWorkingStatus = (item) => item.key === 'racksWorkingStatus'

const formatStatusText = (item) => {
  const text = item.decodedStatus || ''
  if (!isRacksWorkingStatus(item)) return text
  return text.replace(/\s*[（(][^）)]*[）)]/g, '')
}

const formatStatusRawValue = (item) => {
  if (!hasMetricValue(item)) return '—'
  const decimals = item.decimals ?? 0
  return Number(item.value).toFixed(decimals)
}

const formatMetricValue = (item) => {
  if (item.error) return item.error
  if (isPcsStatePoint(item)) return formatStatusText(item) || '—'
  if (item.decodedStatus) return item.decodedStatus
  if (!hasMetricValue(item)) return '—'
  const decimals = item.decimals ?? 2
  const value = Number(item.value).toFixed(decimals)
  return item.unit ? `${value} ${item.unit}` : value
}

const buildStatusItems = (item) => {
  if (!isPcsStatePoint(item) || !item.decodedStatus) return []
  return formatStatusText(item)
    .split('、')
    .map((text) => text.trim())
    .filter(Boolean)
}

const isNormalStatusText = (text) => String(text || '').trim().toLowerCase() === 'normal'

const isAlarmNormalStatus = (item) => {
  if (!isAlarmPoint(item)) return false
  const items = buildStatusItems(item)
  return items.length > 0 && items.every((text) => isNormalStatusText(text))
}

const formatDisplayPointId = (pointId) =>
  pointId
    .replace(/^BMS\d+_/, '')
    .replace(/^PCS\d+_/, '')
    .replace(/^U1_/, '')
    .replace(/_U1_/g, '_')
    .replace('INSULATION_RESISTANCE', 'INSULATION_RES')
    .replace('ACTIVE_POWER_CONTROL_ENABLE', 'POWER_CONTROL_ENABLE')
    .replace('GRID_MODE_COMMAND', 'GRID_MODE')

const buildRows = (metrics) =>
  metrics.map((item) => ({
    ...item,
    hasValue: hasDisplayValue(item),
    isAbnormal: isRacksErrorStatus(item) && Boolean(item.decodedStatus),
    isWorkingStatus: isRacksWorkingStatus(item) && Boolean(item.decodedStatus),
    isAlarmStatus: isAlarmPoint(item) && Boolean(item.decodedStatus) && !isAlarmNormalStatus(item),
    isAlarmNormal: isAlarmNormalStatus(item),
    isAlarmPoint: isAlarmPoint(item),
    isPcsStatus: isPcsStatePoint(item),
    statusItems: buildStatusItems(item),
    displayPointId: formatDisplayPointId(item.pointId),
    displayValue: formatMetricValue(item)
  }))

const buildPointColumns = (rows, columnCount = null) => {
  if (!rows.length) return []
  const columns = []
  const targetColumns = columnCount && columnCount > 0
    ? columnCount
    : Math.ceil(rows.length / 7)
  const rowsPerColumn = Math.ceil(rows.length / targetColumns)
  for (let index = 0; index < rows.length; index += rowsPerColumn) {
    columns.push(rows.slice(index, index + rowsPerColumn))
  }
  return columns
}

const isStatusRow = (row) => row.displayPointId.includes('STATUS')
const isIndexRow = (row) => Boolean(row.indexText)
const isPcsStatusColumn = (column) => column.some((row) => row.isPcsStatus)

const buildPanels = (units, loadedPanels, minimizedPanels) =>
  units.map((unit) => {
    const rows = buildRows(unit.metrics.value)
    const metricRows = rows.filter((row) => !isStatusRow(row) && !isIndexRow(row))
    const indexRows = rows.filter((row) => isIndexRow(row))
    const statusRows = rows.filter((row) => isStatusRow(row))
    const pcsStatusRows = rows.filter((row) => row.isPcsStatus)
    const pcsMetricRows = rows.filter((row) => !row.isPcsStatus)
    return {
      panelIndex: unit.panelIndex,
      selectedUnit: unit.unitIndexRef.value,
      loading: unit.loading.value && !loadedPanels[unit.panelIndex],
      connectionError: unit.connectionError.value,
      latestRecordedAt: unit.latestRecordedAt.value,
      hasAnyValue: unit.hasAnyValue.value,
      minimized: Boolean(minimizedPanels[unit.panelIndex]),
      metricRows,
      indexRows,
      statusRows,
      pointColumns: pcsStatusRows.length
        ? [pcsStatusRows, ...buildPointColumns(pcsMetricRows, 3)]
        : buildPointColumns(rows)
    }
  })

const bmsPanels = computed(() =>
  buildPanels(bmsRealtimeUnits, bmsLoadedPanels.value, bmsMinimizedPanels.value)
)

const pcsPanels = computed(() =>
  buildPanels(pcsRealtimeUnits, pcsLoadedPanels.value, pcsMinimizedPanels.value)
)

const allLatestRecordedAt = computed(() => {
  const times = [...bmsPanels.value, ...pcsPanels.value]
    .map((panel) => panel.latestRecordedAt)
    .filter(Boolean)
    .sort()
  return times.length ? times[times.length - 1] : ''
})

const hasAnyBmsValue = computed(() => bmsPanels.value.some((panel) => panel.hasAnyValue))
const hasAnyPcsValue = computed(() => pcsPanels.value.some((panel) => panel.hasAnyValue))

const setDevicePanelUnit = (panelUnitRefs, loadedPanels, panelIndex, unitIndex) => {
  panelUnitRefs[panelIndex - 1].value = unitIndex
  loadedPanels.value = {
    ...loadedPanels.value,
    [panelIndex]: false
  }
}

const toggleDevicePanel = (minimizedPanels, panelIndex) => {
  minimizedPanels.value = {
    ...minimizedPanels.value,
    [panelIndex]: !minimizedPanels.value[panelIndex]
  }
}

const setBmsPanelUnit = (panelIndex, unitIndex) =>
  setDevicePanelUnit(bmsPanelUnitRefs, bmsLoadedPanels, panelIndex, unitIndex)

const setPcsPanelUnit = (panelIndex, unitIndex) =>
  setDevicePanelUnit(pcsPanelUnitRefs, pcsLoadedPanels, panelIndex, unitIndex)

const toggleBmsPanel = (panelIndex) => toggleDevicePanel(bmsMinimizedPanels, panelIndex)

const togglePcsPanel = (panelIndex) => toggleDevicePanel(pcsMinimizedPanels, panelIndex)

const refreshAll = async () => {
  manualRefreshing.value = true
  try {
    await Promise.all(
      [...bmsRealtimeUnits, ...pcsRealtimeUnits].map((unit) => unit.fetchAll())
    )
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

.device-detail-tabs {
  margin-top: 4px;
}

.device-detail-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  border-bottom: 2px solid #dcdfe6;
}

.device-detail-tabs :deep(.el-tabs__nav-wrap) {
  display: flex;
  justify-content: flex-end;
}

.device-detail-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.device-detail-tabs :deep(.el-tabs__nav-scroll) {
  display: flex;
  justify-content: flex-end;
}

.device-detail-tabs :deep(.el-tabs__nav) {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  float: none;
}

.device-detail-tabs :deep(.el-tabs__active-bar) {
  display: none;
}

.device-detail-tabs :deep(.el-tabs__item) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 78px;
  height: 40px;
  margin: 0;
  padding: 0 18px 8px !important;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 12px 12px 0 0;
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
  opacity: 0.9;
  text-align: center;
  clip-path: polygon(8% 0, 92% 0, 100% 100%, 0 100%);
  transition: opacity 0.15s ease, transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease;
}

.device-detail-tabs :deep(.el-tabs__item.is-top:nth-child(2)),
.device-detail-tabs :deep(.el-tabs__item.is-top:last-child),
.device-detail-tabs :deep(#tab-bms),
.device-detail-tabs :deep(#tab-rcb) {
  padding-left: 18px !important;
  padding-right: 18px !important;
}

.device-detail-tabs :deep(.el-tabs__item .el-tabs__item__label),
.device-detail-tabs :deep(.el-tabs__item span) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0;
  line-height: 1;
  text-align: center;
  transform: none;
}

.device-detail-tabs :deep(#tab-bms) {
  background: #e8f5e9;
  color: #2e7d32 !important;
  border-color: #a5d6a7;
}

.device-detail-tabs :deep(#tab-pcs) {
  background: #e3f2fd;
  color: #1565c0 !important;
  border-color: #90caf9;
}

.device-detail-tabs :deep(#tab-ats) {
  background: #fff3e0;
  color: #ef6c00 !important;
  border-color: #ffcc80;
}

.device-detail-tabs :deep(#tab-mc) {
  background: #f3e5f5;
  color: #6a1b9a !important;
  border-color: #ce93d8;
}

.device-detail-tabs :deep(#tab-mpm) {
  background: #e0f7fa;
  color: #00838f !important;
  border-color: #80deea;
}

.device-detail-tabs :deep(#tab-rcb) {
  background: #ffebee;
  color: #c62828 !important;
  border-color: #ef9a9a;
}

.device-detail-tabs :deep(.el-tabs__item.is-active) {
  opacity: 1;
  height: 46px;
  transform: translateY(2px);
  filter: none;
  z-index: 1;
  box-shadow: 0 -2px 8px rgba(48, 49, 51, 0.08);
}

.device-detail-tabs :deep(#tab-bms.is-active) {
  background: #c8e6c9;
  color: #1b5e20 !important;
}

.device-detail-tabs :deep(#tab-pcs.is-active) {
  background: #bbdefb;
  color: #0d47a1 !important;
}

.device-detail-tabs :deep(#tab-ats.is-active) {
  background: #ffe0b2;
  color: #e65100 !important;
}

.device-detail-tabs :deep(#tab-mc.is-active) {
  background: #e1bee7;
  color: #4a148c !important;
}

.device-detail-tabs :deep(#tab-mpm.is-active) {
  background: #b2ebf2;
  color: #006064 !important;
}

.device-detail-tabs :deep(#tab-rcb.is-active) {
  background: #ffcdd2;
  color: #b71c1c !important;
}

.device-detail-tabs :deep(.el-tabs__item:hover) {
  opacity: 1;
}

.device-detail-tabs :deep(.el-tabs__content) {
  padding-top: 16px;
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

.bms-panel {
  border-left-color: #2e7d32;
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

.bms-detail-grid {
  display: grid;
  grid-template-columns: minmax(620px, 1.55fr) minmax(250px, 0.7fr) minmax(320px, 0.95fr);
  gap: 8px;
  align-items: start;
  overflow-x: auto;
  padding: 10px;
}

.bms-detail-column {
  min-height: 188px;
  padding: 0 0 8px;
  border: 1px solid #0f6b7a;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 107, 122, 0.12);
}

.bms-index-header,
.bms-index-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 78px 136px;
  gap: 4px;
  align-items: baseline;
}

.bms-index-header {
  padding: 7px 10px;
  margin-bottom: 7px;
  background: #0f6b7a;
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  text-align: center;
}

.bms-index-header span {
  text-align: center;
}

.bms-index-row {
  min-height: 23px;
  margin: 0 5px 3px;
  padding: 4px 6px;
  border-radius: 4px;
}

.bms-index-row:nth-child(even) {
  background: #eef9fc;
}

.bms-index-row:nth-child(odd) {
  background: #fff8e6;
}

.bms-index-value {
  overflow: hidden;
  color: #1565c0;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.3;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bms-status-column .pcs-point-row {
  grid-template-columns: minmax(190px, 210px) minmax(0, 1fr);
  align-items: center;
}

.bms-status-column .bms-status-header {
  display: block;
  text-align: center;
}

.bms-status-column .pcs-point-id {
  overflow: visible;
  text-overflow: clip;
}

.bms-status-point {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.bms-status-raw-value {
  color: #606266;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.5;
  text-align: left;
}

.pcs-value.bms-status-value {
  color: #1565c0;
  font-size: 15px;
  overflow: visible;
  text-align: left;
  text-overflow: clip;
  white-space: nowrap;
}

.pcs-value.bms-status-value.is-working-status {
  color: #00a344;
}

.bms-status-list {
  margin: 0;
  padding-left: 14px;
}

.bms-status-list li {
  line-height: 1.45;
  text-align: left;
  white-space: nowrap;
}

.pcs-point-grid {
  display: grid;
  grid-template-columns: minmax(400px, 1.2fr) repeat(3, minmax(280px, 1fr));
  gap: 8px;
  align-items: start;
  overflow-x: auto;
  padding: 14px;
}

.pcs-point-column {
  min-width: 0;
  min-height: 230px;
  padding: 0 0 8px;
  border: 1px solid #0f6b7a;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 107, 122, 0.12);
}

.pcs-point-grid .pcs-column-header {
  grid-template-columns: minmax(0, 1fr) 100px;
}

.pcs-point-grid .pcs-point-row {
  grid-template-columns: minmax(0, 1fr) 100px;
  gap: 6px;
  align-items: center;
}

.pcs-point-grid .pcs-status-column .pcs-column-header,
.pcs-point-grid .pcs-status-column .pcs-point-row {
  grid-template-columns: 210px minmax(0, 1fr);
  gap: 8px;
}

.pcs-point-grid .pcs-point-id {
  overflow: hidden;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 18px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pcs-point-grid .pcs-value {
  overflow: hidden;
  font-size: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  text-align: center;
}

.pcs-column-header span {
  text-align: center;
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

.pcs-value.is-abnormal {
  color: #f56c6c;
}

.pcs-value.is-empty {
  color: #909399;
}

.pcs-status-column {
  min-width: 400px;
  overflow: hidden;
}

.pcs-status-column .pcs-point-row {
  grid-template-columns: 210px minmax(0, 1fr);
  align-items: center;
}

.pcs-status-column .pcs-status-header {
  display: block;
  text-align: center;
  white-space: nowrap;
}

.pcs-status-column .pcs-point-id {
  overflow: hidden;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 18px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pcs-status-column .pcs-value {
  overflow: visible;
  font-size: 15px;
  text-align: left;
  text-overflow: clip;
  white-space: normal;
}

.pcs-status-column .pcs-value.is-alarm-status {
  color: #f56c6c;
}

.pcs-status-column .pcs-value.is-alarm-normal {
  color: #1565c0;
}

.pcs-status-list {
  margin: 0;
  padding-left: 14px;
}

.pcs-status-list li {
  line-height: 1.45;
  text-align: left;
  white-space: nowrap;
}

.pcs-status-list li.is-normal-text {
  color: #1565c0;
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
