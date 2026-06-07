<template>
  <div class="sld-wrapper">
    <svg
      class="sld-svg"
      viewBox="0 0 820 460"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="微電網系統單線圖"
    >
      <!-- 匯流排 -->
      <rect x="90" y="188" width="640" height="10" rx="2" class="bus-bar" />

      <!-- 市電 -->
      <rect x="368" y="52" width="84" height="44" rx="4" class="device-box grid-box" />
      <text x="410" y="72" class="device-title">市電</text>
      <text x="410" y="88" class="device-sub">台電饋線</text>
      <line x1="410" y1="96" x2="410" y2="108" class="line-base" />
      <g>
        <template v-if="gridBreakerClosed">
          <rect x="400" y="112" width="20" height="12" rx="2" class="breaker-closed" />
        </template>
        <template v-else>
          <line x1="402" y1="122" x2="410" y2="114" class="breaker-open-arm" />
          <line x1="410" y1="114" x2="418" y2="122" class="breaker-open-arm" />
        </template>
        <text x="410" y="140" class="breaker-label">ATS1</text>
      </g>
      <line x1="410" y1="148" x2="410" y2="188" :class="gridLineClass" />
      <text x="430" y="100" class="power-label">市電 {{ formatPower(emsStore.gridPower, true) }}</text>

      <!-- 太陽光電 -->
      <line x1="130" y1="108" x2="130" y2="188" :class="pvLineClass" />
      <rect x="88" y="52" width="84" height="44" rx="4" class="device-box pv-box" />
      <text x="130" y="72" class="device-title">太陽光電</text>
      <text x="130" y="88" class="device-sub">132 kWp</text>
      <rect x="108" y="148" width="44" height="28" rx="3" class="symbol-box" />
      <text x="130" y="167" class="symbol-text">INV</text>
      <text x="148" y="130" class="power-label">{{ formatPower(emsStore.pvPower) }}</text>

      <!-- 儲能 -->
      <line x1="210" y1="188" x2="210" y2="248" :class="essLineClass" />
      <g>
        <template v-if="essBreakerClosed">
          <rect x="200" y="252" width="20" height="12" rx="2" class="breaker-closed" />
        </template>
        <template v-else>
          <line x1="202" y1="262" x2="210" y2="254" class="breaker-open-arm" />
          <line x1="210" y1="254" x2="218" y2="262" class="breaker-open-arm" />
        </template>
        <text x="210" y="280" class="breaker-label">ATS2</text>
      </g>
      <line x1="210" y1="290" x2="210" y2="318" :class="essLineClass" />
      <rect x="168" y="318" width="84" height="52" rx="4" class="device-box ess-box" />
      <text x="210" y="340" class="device-title">儲能系統</text>
      <text x="210" y="356" class="device-sub">600kW / 1316kWh</text>
      <text x="210" y="388" class="soc-text">SOC {{ emsStore.essSoc }}%</text>
      <text x="228" y="220" class="power-label">{{ formatPower(emsStore.essPower, true) }}</text>

      <!-- 柴發 -->
      <line x1="610" y1="188" x2="610" y2="248" :class="gensetLineClass" />
      <g>
        <template v-if="gensetBreakerClosed">
          <rect x="600" y="252" width="20" height="12" rx="2" class="breaker-closed" />
        </template>
        <template v-else>
          <line x1="602" y1="262" x2="610" y2="254" class="breaker-open-arm" />
          <line x1="610" y1="254" x2="618" y2="262" class="breaker-open-arm" />
        </template>
        <text x="610" y="280" class="breaker-label">ATS3</text>
      </g>
      <line x1="610" y1="290" x2="610" y2="318" :class="gensetLineClass" />
      <rect x="568" y="318" width="84" height="52" rx="4" class="device-box genset-box" />
      <text x="610" y="340" class="device-title">柴油發電機</text>
      <text x="610" y="356" class="device-sub">200 kW</text>
      <text x="628" y="220" class="power-label">{{ formatPower(emsStore.gensetPower) }}</text>

      <!-- 負載 -->
      <line x1="690" y1="188" x2="690" y2="108" :class="loadLineClass" />
      <rect x="648" y="52" width="84" height="44" rx="4" class="device-box load-box" />
      <text x="690" y="72" class="device-title">夢翔館</text>
      <text x="690" y="88" class="device-sub">緊急救災負載</text>
      <text x="708" y="130" class="power-label">{{ formatPower(emsStore.loadPower) }}</text>

      <!-- PCC -->
      <circle cx="410" cy="193" r="14" class="pcc-node" />
      <text x="410" y="230" class="pcc-label">AC 併網點 (PCC)</text>

      <!-- 運轉模式 -->
      <rect x="300" y="400" width="220" height="36" rx="6" class="mode-badge" />
      <text x="410" y="423" class="mode-text">{{ modeLabel }}</text>

      <!-- 圖例 -->
      <g transform="translate(24, 400)">
        <text x="0" y="0" class="legend-title">圖例</text>
        <line x1="0" y1="14" x2="28" y2="14" class="line-active" />
        <text x="36" y="18" class="legend-item">功率流通</text>
        <line x1="0" y1="32" x2="28" y2="32" class="line-idle" />
        <text x="36" y="36" class="legend-item">待命中</text>
        <rect x="120" y="6" width="16" height="10" class="breaker-closed-legend" />
        <text x="144" y="16" class="legend-item">ATS 合</text>
        <line x1="120" y1="30" x2="128" y2="22" class="breaker-open-legend" />
        <line x1="128" y1="30" x2="136" y2="22" class="breaker-open-legend" />
        <text x="144" y="34" class="legend-item">ATS 開</text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEmsStore } from '../stores/emsStore'

const emsStore = useEmsStore()

const modeLabels = {
  1: '情境一：市電正常（併網運轉）',
  2: '情境二：市電異常（儲能孤島供電）',
  3: '情境三：電力不足（儲能 + 柴發）',
  4: '情境四：儲能異常（純柴發離網）',
}

const modeLabel = computed(() => modeLabels[emsStore.currentMode] ?? '')

const gridBreakerClosed = computed(() => emsStore.currentMode === 1)
const essBreakerClosed = computed(() => emsStore.currentMode !== 4)
const gensetBreakerClosed = computed(() => emsStore.currentMode >= 3)

const isLineActive = (power, min = 0.5) => Math.abs(power) >= min

const pvLineClass = computed(() =>
  isLineActive(emsStore.pvPower) ? 'line-active' : 'line-idle'
)
const essLineClass = computed(() =>
  isLineActive(emsStore.essPower) ? 'line-active' : 'line-idle'
)
const gensetLineClass = computed(() =>
  isLineActive(emsStore.gensetPower) ? 'line-active' : 'line-idle'
)
const loadLineClass = computed(() =>
  isLineActive(emsStore.loadPower) ? 'line-active' : 'line-idle'
)
const gridLineClass = computed(() =>
  gridBreakerClosed.value && isLineActive(emsStore.gridPower) ? 'line-active' : 'line-idle'
)

const formatPower = (value, signed = false) => {
  const num = Number(value)
  if (signed && num > 0) return `+${num} kW`
  return `${num} kW`
}
</script>

<style scoped>
.sld-wrapper {
  width: 100%;
  overflow-x: auto;
  background: #fff;
  border-radius: 4px;
}

.sld-svg {
  display: block;
  width: 100%;
  min-width: 640px;
  height: auto;
}

.bus-bar {
  fill: #303133;
}

.line-base {
  stroke: #c0c4cc;
  stroke-width: 2;
}

.line-idle {
  stroke: #dcdfe6;
  stroke-width: 2;
}

.line-active {
  stroke: #409eff;
  stroke-width: 2.5;
  stroke-dasharray: 8 4;
  animation: flow 1s linear infinite;
}

@keyframes flow {
  to {
    stroke-dashoffset: -12;
  }
}

.device-box {
  fill: #fafafa;
  stroke-width: 2;
}

.grid-box { stroke: #409eff; }
.pv-box { stroke: #e6a23c; }
.ess-box { stroke: #67c23a; }
.genset-box { stroke: #909399; }
.load-box { stroke: #f56c6c; }

.device-title {
  fill: #303133;
  font-size: 13px;
  font-weight: 600;
  text-anchor: middle;
}

.device-sub {
  fill: #909399;
  font-size: 11px;
  text-anchor: middle;
}

.soc-text {
  fill: #67c23a;
  font-size: 12px;
  font-weight: 600;
  text-anchor: middle;
}

.symbol-box {
  fill: #fff;
  stroke: #e6a23c;
  stroke-width: 1.5;
}

.symbol-text {
  fill: #e6a23c;
  font-size: 11px;
  font-weight: 600;
  text-anchor: middle;
}

.pcc-node {
  fill: #fff;
  stroke: #303133;
  stroke-width: 2.5;
}

.pcc-label {
  fill: #606266;
  font-size: 12px;
  font-weight: 600;
  text-anchor: middle;
}

.breaker-closed {
  fill: #67c23a;
  stroke: #529b2e;
  stroke-width: 1;
}

.breaker-open-arm {
  stroke: #f56c6c;
  stroke-width: 2;
  stroke-linecap: round;
}

.breaker-label {
  fill: #909399;
  font-size: 10px;
  text-anchor: middle;
}

.power-label {
  fill: #409eff;
  font-size: 12px;
  font-weight: 600;
}

.mode-badge {
  fill: rgba(64, 158, 255, 0.08);
  stroke: #409eff;
  stroke-width: 1;
}

.mode-text {
  fill: #409eff;
  font-size: 13px;
  font-weight: 600;
  text-anchor: middle;
}

.legend-title {
  fill: #606266;
  font-size: 12px;
  font-weight: 600;
}

.legend-item {
  fill: #909399;
  font-size: 11px;
}

.breaker-closed-legend {
  fill: #67c23a;
  stroke: #529b2e;
  stroke-width: 0.5;
}

.breaker-open-legend {
  stroke: #f56c6c;
  stroke-width: 1.5;
  stroke-linecap: round;
}
</style>
