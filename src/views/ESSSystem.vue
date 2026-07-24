<template>
  <div class="ess-system-page">
    <SiteHeader />

    <el-card class="page-header-card">
      <template #header>
        <div class="page-header">
          <span class="page-title">儲能系統監控</span>
        </div>
      </template>
      <div class="spec-summary">
        <div class="spec-item">
          <span class="label">系統規格（目前案場）</span>
          <span class="value">{{ essSpecText }}</span>
        </div>
        <div class="spec-item">
          <span class="label">運轉狀態</span>
          <span class="value">{{ operationStatus }}</span>
        </div>
        <div class="spec-item">
          <span class="label">電池 SOC</span>
          <span class="value">{{ Number(emsStore.soc).toFixed(0) }}%</span>
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

      <div class="alarm-box" :class="alarmLevel">
        <div class="alarm-title">儲能系統運作資訊</div>
        <div class="alarm-text">{{ alarmMessage }}</div>
      </div>

      <div class="ess-top-metrics">
        <div class="ess-top-metric highlight-power">
          <span class="ess-top-metric-label">目前充放電功率</span>
          <span class="ess-top-metric-value power" :class="selectedPowerClass">
            <template v-if="isJialiSite && selectedPcsActivePower != null">
              {{ formatPcsActivePower(selectedPcsActivePower) }}
            </template>
            <template v-else>{{ powerDisplayText }}</template>
          </span>
        </div>
        <div class="ess-top-metric highlight">
          <span class="ess-top-metric-label">電池 SOC</span>
          <span class="ess-top-metric-value soc">
            <template v-if="isJialiSite && selectedBmsSoc != null">
              {{ selectedBmsSoc.toFixed(1) }}%
            </template>
            <template v-else>{{ Number(emsStore.soc).toFixed(0) }}%</template>
          </span>
        </div>
        <div class="ess-top-metric highlight">
          <span class="ess-top-metric-label">電池 SOH</span>
          <span class="ess-top-metric-value">
            <template v-if="isJialiSite && selectedBmsSoh != null">
              {{ selectedBmsSoh.toFixed(1) }}%
            </template>
            <template v-else>—</template>
          </span>
        </div>
        <div class="ess-top-metric">
          <span class="ess-top-metric-label">市電電壓</span>
          <span class="ess-top-metric-value">
            {{ currentMetrics.gridVoltage.toFixed(1) }} V
          </span>
        </div>
        <div class="ess-top-metric">
          <span class="ess-top-metric-label">市電頻率</span>
          <span class="ess-top-metric-value">
            <template v-if="isJialiSite && selectedPcsFrequency != null">
              {{ selectedPcsFrequency.toFixed(2) }} Hz
            </template>
            <template v-else>{{ currentMetrics.gridFrequency.toFixed(2) }} Hz</template>
          </span>
        </div>
      </div>

      <div class="ess-visual-row">
        <div class="ess-scene-wrap">
          <div class="ess-scene-scale">
            <CabinetEssScene
              v-if="isCabinetSite"
              :site-id="emsStore.selectedSiteId"
              :site-name="emsStore.selectedSite.name"
              :soc="Number(emsStore.soc)"
              :power-kw="Number(emsStore.essPower)"
              :bms-units="bmsUnits"
              :pcs-units="pcsUnits"
              class="scene-large"
            />
            <ContainerEssScene
              v-else
              :site-name="emsStore.selectedSite.name"
              :soc="Number(emsStore.soc)"
              :power-kw="Number(emsStore.essPower)"
              class="scene-large"
            />
            <div class="scene-type-label">
              {{ sceneTypeLabel }}
            </div>
          </div>
        </div>

        <div v-if="isJialiSite" class="ess-side-panel">
          <div class="units-summary">
            <div class="units-summary-header">
              <div class="units-summary-title">各機組即時資訊</div>
              <div class="units-summary-source">PostgreSQL · MG-TNN-001</div>
            </div>
            <el-select
              v-model="selectedUnitKey"
              class="units-summary-select"
              placeholder="選擇機組"
            >
              <el-option-group label="BMS">
                <el-option
                  v-for="i in 6"
                  :key="`bms-${i}`"
                  :label="`BMS-${i}`"
                  :value="`bms:${i}`"
                />
              </el-option-group>
              <el-option-group label="PCS">
                <el-option
                  v-for="i in 6"
                  :key="`pcs-${i}`"
                  :label="`PCS-${i}`"
                  :value="`pcs:${i}`"
                />
              </el-option-group>
            </el-select>

            <div class="units-summary-toolbar">
              <el-tag :type="selectedUnitTypeTag" effect="light">
                {{ selectedUnitLabel }}
              </el-tag>
              <span class="units-summary-status">
                <span class="units-summary-quality-label">通訊品質:</span>
                <span class="units-summary-quality-led" :class="selectedUnitQualityLedClass" />
                <span :class="selectedUnitQualityClass">{{ selectedUnitQualityText }}</span>
              </span>
            </div>

            <div class="units-summary-metrics">
              <div
                v-for="item in selectedUnitMetrics"
                :key="item.key"
                class="units-summary-metric-item"
              >
                <span class="units-summary-metric-label">{{ item.label }}</span>
                <span
                  class="units-summary-metric-value"
                  :class="{ 'is-error': item.error }"
                >
                  <template v-if="item.error">{{ item.error }}</template>
                  <template v-else-if="hasUnitMetricValue(item)">
                    {{ formatUnitMetric(item) }}<span v-if="item.unit" class="units-summary-unit">{{ item.unit }}</span>
                  </template>
                  <template v-else>—</template>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useEmsStore } from '../stores/emsStore'
import { useEssCabinetRealtime } from '../composables/useBmsRealtime'
import SiteHeader from '../components/SiteHeader.vue'
import CabinetEssScene from '../components/ess/CabinetEssScene.vue'
import ContainerEssScene from '../components/ess/ContainerEssScene.vue'

const emsStore = useEmsStore()
const simSeed = ref(Math.random())
const selectedSiteId = computed(() => emsStore.selectedSiteId)

const { bmsUnits, pcsUnits } = useEssCabinetRealtime(selectedSiteId, 5000)

const isJialiSite = computed(() => emsStore.selectedSiteId === 'jiali-junior-high')

const selectedUnitKey = ref('bms:1')

const selectedPairIndex = computed(() => Number(selectedUnitKey.value.split(':')[1]) || 1)

const selectedBmsUnit = computed(() =>
  bmsUnits.value.find((unit) => unit.unitIndex === selectedPairIndex.value) || null
)
const selectedPcsUnit = computed(() =>
  pcsUnits.value.find((unit) => unit.unitIndex === selectedPairIndex.value) || null
)

const selectedBmsSoc = computed(() => selectedBmsUnit.value?.soc ?? null)
const selectedBmsSoh = computed(() => selectedBmsUnit.value?.soh ?? null)
const selectedPcsActivePower = computed(() => selectedPcsUnit.value?.activePower ?? null)
const selectedPcsFrequency = computed(() => selectedPcsUnit.value?.frequency ?? null)

const selectedUnitData = computed(() => {
  const [type] = selectedUnitKey.value.split(':')
  if (type === 'bms') return selectedBmsUnit.value
  if (type === 'pcs') return selectedPcsUnit.value
  return null
})

const selectedUnitMetrics = computed(() => selectedUnitData.value?.metrics || [])

const selectedUnitType = computed(() => selectedUnitKey.value.split(':')[0] || '')
const selectedUnitIndex = computed(() => Number(selectedUnitKey.value.split(':')[1]) || 0)
const selectedUnitLabel = computed(() => {
  const prefix = selectedUnitType.value === 'pcs' ? 'PCS' : 'BMS'
  return `${prefix}-${selectedUnitIndex.value}`
})
const selectedUnitTypeTag = computed(() => (selectedUnitType.value === 'pcs' ? 'warning' : 'success'))

const selectedUnitQualityText = computed(() => {
  const qualities = selectedUnitMetrics.value
    .map((item) => item.quality)
    .filter(Boolean)
  if (!qualities.length) return '—'
  const unique = [...new Set(qualities)]
  return unique.length === 1 ? unique[0] : unique.join(' / ')
})

const selectedUnitQualityClass = computed(() => {
  const quality = selectedUnitQualityText.value.toLowerCase()
  if (quality === 'good') return 'is-ok'
  if (quality === '—') return ''
  return 'is-warn'
})

const selectedUnitQualityLedClass = computed(() => {
  const quality = selectedUnitQualityText.value.toLowerCase()
  if (quality === 'good') return 'is-ok'
  if (quality === '—') return 'is-off'
  if (quality.includes('bad') || quality.includes('error') || quality.includes('fail')) return 'is-bad'
  return 'is-warn'
})

const hasUnitMetricValue = (item) => Number.isFinite(Number(item.value))

const formatUnitMetric = (item) => {
  const num = Number(item.value)
  if (!Number.isFinite(num)) return '—'
  const decimals = item.decimals ?? 1
  return num.toFixed(decimals)
}

const formatPcsActivePower = (value) => {
  const p = Number(value)
  const abs = Math.abs(p).toFixed(2)
  if (p > 0.5) return `放電 ${abs} kW`
  if (p < -0.5) return `充電 ${abs} kW`
  return `待命 ${abs} kW`
}

const cabinetSiteIds = new Set(['jiali-junior-high', 'ruifeng-elementary'])
const isCabinetSite = computed(() => cabinetSiteIds.has(emsStore.selectedSiteId))

const sceneTypeLabel = computed(() => {
  if (emsStore.selectedSiteId === 'jiali-junior-high') return '600kW/1200kWh儲能系統（PCS-1 ~ PCS-6 / BMS-1 ~ BMS-6）'
  if (isCabinetSite.value) return '600kW/1200kWh儲能系統'
  return '20呎貨櫃式儲能系統模擬'
})

const essSpecText = computed(() => {
  const site = emsStore.selectedSite
  return `${site.essPowerKw} kW / ${site.essEnergyKwh} kWh`
})

const essPower = computed(() => Number(emsStore.essPower || 0))

const operationStatus = computed(() => {
  const p = essPower.value
  if (p > 0.5) return '放電中'
  if (p < -0.5) return '充電中'
  return '待命'
})

const statusTagType = computed(() => {
  const p = essPower.value
  if (p > 0.5) return 'warning'
  if (p < -0.5) return 'success'
  return 'info'
})

const powerDisplayText = computed(() => {
  const p = essPower.value
  const abs = Math.abs(p).toFixed(1)
  if (p > 0.5) return `放電 ${abs} kW`
  if (p < -0.5) return `充電 ${abs} kW`
  return `待命 ${abs} kW`
})

const selectedPowerClass = computed(() => {
  const p = isJialiSite.value && selectedPcsActivePower.value != null
    ? selectedPcsActivePower.value
    : essPower.value
  if (p > 0.5) return 'discharge'
  if (p < -0.5) return 'charge'
  return ''
})

const isGridConnected = computed(() => emsStore.currentMode === 1 && Number(emsStore.gridPower) >= 0)

const currentMetrics = computed(() => {
  const site = emsStore.selectedSite
  const p = essPower.value
  const absPower = Math.abs(p)
  const socVal = Number(emsStore.soc || 0)
  const powerCap = Number(site.essPowerKw || 600)
  const loadFactor = Math.min(1, absPower / powerCap)

  const batteryTemp = 28 + loadFactor * 10 + (socVal / 100) * 4 + (simSeed.value % 1) * 0.8
  const batteryVoltage = 680 + (socVal / 100) * 60 + loadFactor * 25
  const batteryCurrent = absPower > 0 ? (absPower * 1000) / batteryVoltage : 0

  const gridVoltage = isGridConnected.value
    ? 220 + (simSeed.value % 1) * 1.2 - 0.6
    : 0
  const gridFrequency = isGridConnected.value
    ? 60 + (simSeed.value % 1) * 0.06 - 0.03
    : 0

  return { batteryTemp, batteryVoltage, batteryCurrent, gridVoltage, gridFrequency }
})

const alarmMessage = computed(() => {
  const socVal = Number(emsStore.soc || 0)
  const p = essPower.value

  if (socVal < 20) return '【嚴重】電池 SOC 過低，請立即檢查供電策略或啟動備援電源。'
  if (socVal < 30) return '【警告】電池 SOC 偏低，建議降低放電或補充充電。'
  if (currentMetrics.value.batteryTemp > 38) return '【警告】電池溫度偏高，請確認散熱與環境通風。'
  if (p > 0.5) return '【資訊】儲能系統放電中，供應緊急負載或調度出力。'
  if (p < -0.5) return '【資訊】儲能系統充電中，吸收光電或市電剩餘電力。'
  if (!isGridConnected.value && emsStore.currentMode !== 1) return '【資訊】孤島/離網模式運轉，市電未連線。'
  return '【正常】儲能系統運轉正常，無異常告警。'
})

const alarmLevel = computed(() => {
  if (alarmMessage.value.includes('嚴重')) return 'alarm-critical'
  if (alarmMessage.value.includes('警告')) return 'alarm-warning'
  if (alarmMessage.value.includes('資訊')) return 'alarm-info'
  return 'alarm-normal'
})

let timer = null

onMounted(() => {
  emsStore.fetchEmsData()
  timer = setInterval(() => {
    emsStore.fetchEmsData()
    simSeed.value = Math.random()
  }, 2000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.ess-system-page {
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
  border-left: 4px solid #67c23a;
}

.scene-large {
  height: 364px;
}

:deep(.scene-large.cabinet-scene) {
  height: 364px;
}

:deep(.scene-large.container-scene) {
  height: 280px;
}

:deep(.scene-large.cabinet-scene.has-pcs-row) {
  height: 468px;
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
  margin: 10px 0 0;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #000;
  letter-spacing: 0.06em;
}

.ess-top-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.ess-top-metric {
  flex: 1 1 0;
  min-width: 120px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fafafa;
  border: 1px solid #ebeef5;
}

.ess-top-metric.highlight {
  background: #f0f9eb;
  border-color: #c2e7b0;
}

.ess-top-metric.highlight-power {
  background: #fdf6ec;
  border-color: #f5dab1;
}

.ess-top-metric-label {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #909399;
  margin-bottom: 4px;
  white-space: nowrap;
}

.ess-top-metric-value {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  line-height: 1.3;
  white-space: nowrap;
}

.ess-top-metric-value.power {
  font-size: 17px;
}

.ess-top-metric-value.power.discharge {
  color: #e6a23c;
}

.ess-top-metric-value.power.charge {
  color: #67c23a;
}

.ess-top-metric-value.soc {
  color: #67c23a;
  font-size: 20px;
}

.ess-visual-row {
  display: flex;
  align-items: stretch;
  gap: 12px;
}

.ess-scene-wrap {
  flex: 0 0 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.ess-scene-scale {
  width: 640px;
  max-width: 100%;
  overflow: visible;
  display: flex;
  flex-direction: column;
}

.ess-scene-scale :deep(.scene-large) {
  width: 100%;
  flex-shrink: 0;
}

.ess-scene-scale .scene-type-label {
  text-align: center;
  flex-shrink: 0;
}

.ess-side-panel {
  flex: 1 1 auto;
  min-width: 460px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  height: 90%;
  overflow: hidden;
}

.units-summary {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  max-height: 100%;
  overflow: hidden;
  padding: 16px 18px;
  border-radius: 10px;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.08);
}

.units-summary-title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.units-summary-header {
  margin-bottom: 9px;
}

.units-summary-source {
  margin-top: 2px;
  font-size: 13px;
  color: #909399;
}

.units-summary-select {
  width: 100%;
  margin-bottom: 9px;
}

.units-summary-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 11px;
  padding-bottom: 11px;
  border-bottom: 1px solid #fde2e2;
}

.units-summary-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
}

.units-summary-quality-label {
  color: #000;
  font-weight: 600;
}

.units-summary-status .is-ok {
  color: #67c23a;
  font-weight: 600;
}

.units-summary-status .is-warn {
  color: #e6a23c;
  font-weight: 600;
}

.units-summary-quality-led {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background: #c0c4cc;
  box-shadow: 0 0 6px rgba(192, 196, 204, 0.8);
}

.units-summary-quality-led.is-ok {
  background: #67c23a;
  box-shadow: 0 0 8px rgba(103, 194, 58, 0.9);
}

.units-summary-quality-led.is-warn {
  background: #e6a23c;
  box-shadow: 0 0 8px rgba(230, 162, 60, 0.9);
}

.units-summary-quality-led.is-bad {
  background: #f56c6c;
  box-shadow: 0 0 8px rgba(245, 108, 108, 0.9);
}

.units-summary-quality-led.is-off {
  background: #dcdfe6;
  box-shadow: none;
}

.units-summary-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: auto;
  gap: 9px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  align-content: start;
}

.units-summary-metric-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-height: 52px;
  padding: 9px 12px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #fde2e2;
}

.units-summary-metric-item:last-child:nth-child(odd) {
  grid-column: 1 / -1;
}

.units-summary-metric-label {
  font-size: 14px;
  color: #909399;
  line-height: 1.2;
}

.units-summary-metric-value {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
  line-height: 1.25;
  word-break: break-word;
}

.units-summary-metric-value.is-error {
  color: #e6a23c;
  font-size: 14px;
  font-weight: 600;
}

.units-summary-unit {
  margin-left: 3px;
  font-size: 16px;
  font-weight: 600;
  color: #606266;
}

.alarm-box {
  margin-bottom: 14px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.alarm-title {
  font-size: 18px;
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

@media (max-width: 992px) {
  .ess-visual-row {
    flex-direction: column;
    gap: 16px;
  }

  .ess-scene-wrap {
    width: 100%;
  }

  .ess-scene-scale {
    width: 100%;
    margin: 0 auto;
  }

  .ess-side-panel {
    min-width: 0;
    width: 100%;
    height: auto;
  }

  .units-summary {
    min-height: 0;
  }

  .ess-top-metric {
    min-width: calc(50% - 5px);
  }
}

@media (max-width: 576px) {
  .ess-top-metric {
    min-width: 100%;
  }
}
</style>
