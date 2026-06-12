<template>
  <div class="sld-wrapper">
    <svg
      class="sld-svg"
      viewBox="0 0 820 460"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="微電網系統單線圖"
    >
      <rect x="90" y="188" width="640" height="10" rx="2" class="bus-bar" />
      <text x="410" y="30" class="mode-label" text-anchor="middle">
        {{ currentModeLabel }}
      </text>
      <rect x="368" y="52" width="84" height="44" rx="4" class="device-box grid-box" />
      <text x="410" y="72" class="device-title">市電</text>
      <text x="410" y="88" class="device-sub">台電饋線</text>
      <line x1="410" y1="96" x2="410" y2="108" class="line-base" />
      <g>
        <template v-if="gridBreakerClosed">
          <line x1="410" y1="108" x2="410" y2="148" class="line-breaker-closed" />
        </template>
        <template v-else>
          <line x1="410" y1="108" x2="410" y2="114" class="line-base" />
          <line x1="410" y1="114" x2="422" y2="134" class="breaker-open-arm" />
          <line x1="410" y1="138" x2="410" y2="148" class="line-base" />
        </template>
        <text x="430" y="132" class="breaker-label">ATS1</text>
      </g>
      <line x1="410" y1="148" x2="410" y2="188" :class="gridLineClass" />
      <text x="430" y="165" class="power-label">市電 {{ formatPower(emsStore.gridPower) }}</text>

      <line x1="130" y1="108" x2="130" y2="188" :class="pvLineClass" />
      <rect x="88" y="52" width="84" height="44" rx="4" class="device-box pv-box" />
      <text x="130" y="72" class="device-title">既設太陽光電</text>
      <text x="130" y="88" class="device-sub">{{ `${formatCapacity(emsStore.selectedSite.pvCapacityKw)} kWp` }}</text>
      <rect x="108" y="148" width="44" height="28" rx="3" class="symbol-box" />
      <text x="130" y="167" class="symbol-text">INV</text>
      <text x="148" y="130" class="power-label">{{ formatPower(emsStore.pvPower) }}</text>

      <line x1="210" y1="188" x2="210" y2="248" :class="essLineClass" />
      <g>
        <template v-if="essBreakerClosed">
          <line x1="210" y1="248" x2="210" y2="288" class="line-breaker-closed" />
        </template>
        <template v-else>
          <line x1="210" y1="248" x2="210" y2="254" class="line-base" />
          <line x1="210" y1="254" x2="222" y2="274" class="breaker-open-arm" />
          <line x1="210" y1="278" x2="210" y2="288" class="line-base" />
        </template>
        <text x="230" y="272" class="breaker-label">ATS2</text>
      </g>
      <line x1="210" y1="288" x2="210" y2="318" :class="essLineClass" />
      <rect x="168" y="318" width="84" height="52" rx="4" class="device-box ess-box" />
      <text x="210" y="340" class="device-title">儲能系統</text>
      <text x="210" y="352" class="device-sub">{{ `${formatCapacity(emsStore.selectedSite.essPowerKw)} kW` }}</text>
      <text x="210" y="366" class="device-sub">{{ `${formatCapacity(emsStore.selectedSite.essEnergyKwh)} kWh` }}</text>
      <text x="210" y="388" class="soc-text">SOC {{ Number(emsStore.soc || 0).toFixed(0) }}%</text>
      <text x="228" y="220" class="power-label">{{ formatPower(emsStore.essPower, true) }}</text>
      <text x="260" y="350" class="soc-status" :class="socStatus.class">
      {{ socStatus.label }}
       </text>

      <line x1="610" y1="188" x2="610" y2="248" :class="gensetLineClass" />
      <g>
        <template v-if="gensetBreakerClosed">
          <line x1="610" y1="248" x2="610" y2="288" class="line-breaker-closed" />
        </template>
        <template v-else>
          <line x1="610" y1="248" x2="610" y2="254" class="line-base" />
          <line x1="610" y1="254" x2="622" y2="274" class="breaker-open-arm" />
          <line x1="610" y1="278" x2="610" y2="288" class="line-base" />
        </template>
        <text x="630" y="272" class="breaker-label">ATS3</text>
      </g>
      <line x1="610" y1="288" x2="610" y2="318" :class="gensetLineClass" />
      <rect x="568" y="318" width="84" height="52" rx="4" class="device-box genset-box" />
      <text x="610" y="340" class="device-title">柴油發電機</text>
      <text x="610" y="356" class="device-sub">{{ `${formatCapacity(emsStore.selectedSite.genCapacityKw)} kW` }}</text>
      <text x="628" y="220" class="power-label">{{ formatPower(emsStore.genPower) }}</text>

      <line x1="690" y1="188" x2="690" y2="108" :class="loadLineClass" />
      <rect x="648" y="52" width="84" height="44" rx="4" class="device-box load-box" />
      <text x="690" y="72" class="device-title">{{ emsStore.selectedSite.loadDeviceTitle }}</text>
      <text x="690" y="88" class="device-sub">{{ emsStore.selectedSite.loadDeviceSub }}</text>
      <text x="708" y="130" class="power-label">{{ formatPower(emsStore.loadPower) }}</text>

      <circle cx="410" cy="193" r="14" class="pcc-node" />
      <text x="410" y="230" class="pcc-label">AC 併網點 (PCC)</text>

      <g transform="translate(700, 250)">

        <line x1="0" y1="48" x2="28" y2="48" class="line-active-flow-up" />
        <text x="36" y="52" class="legend-item">功率流向</text>
        <!-- 第 3 行：ATS 閉合 -->
        <line x1="0" y1="68" x2="15" y2="68" class="line-breaker-closed" />
        <text x="36" y="72" class="legend-item">ATS 閉合 (導通)</text>
        <!-- 第 4 行：ATS 斷開 -->
        <line x1="0" y1="88" x2="6" y2="88" class="line-base" />
        <line x1="6" y1="88" x2="16" y2="78" class="breaker-open-arm" />
        <line x1="16" y1="88" x2="20" y2="88" class="line-base" />
        <text x="36" y="92" class="legend-item">ATS 斷開 (隔離)</text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEmsStore } from '../stores/emsStore'

const emsStore = useEmsStore()

const modeLabel = {
  1: '市電正常（光電併網運轉）',
  2: '市電異常（光電 + 儲能孤島供電）',
  3: '市電異常（光電 + 儲能 + 柴油發電機）',
  4: '市電與儲能異常（光電 + 柴油發電機）',
  5: '夜尖峰時段（儲能供電）',
}
const currentModeLabel = computed(() => {
  const mode = Number(emsStore.currentMode || 1)
  return modeLabel[mode]
})

const socStatus = computed(() => {
  const soc = Number(emsStore.soc || 0)
  if (soc < 30) return {label: '低電量警告', class: 'soc-status-danger'}
  if (soc > 90) return {label: '高電量警告', class: 'soc-status-warning'}
  return {label: '電量正常', class: 'soc-status-normal'}
})

  const gridBreakerClosed = computed(() =>  { 
  const mode= Number(emsStore.currentMode || 1) 
  return mode === 1 || mode === 5 
  })
const essBreakerClosed = computed(() => {
  const mode = Number(emsStore.currentMode || 1)
  return mode !== 4
})
const gensetBreakerClosed = computed(() => {
  const mode = Number(emsStore.currentMode || 1)
  return mode === 3 || mode === 4
})


const isLineActive = (power) => {
  const num = Number(power || 0)
  return !isNaN(num) && Math.abs(num) >= 0.1
}

const pvLineClass = computed(() => isLineActive(emsStore.pvPower) ? 'line-active-flow-down' : 'line-idle')
const loadLineClass = computed(() => isLineActive(emsStore.loadPower) ? 'line-active-flow-down' : 'line-idle')
const gridLineClass = computed(() => {
  if (!gridBreakerClosed.value || !isLineActive(emsStore.gridPower)) return 'line-idle'
  const mode = Number(emsStore.currentMode || 1)
  // 情境五：儲能逆送，功率由母線往上回送市電
  return mode === 5 ? 'line-active-flow-up' : 'line-active-flow-down'
})
const gensetLineClass = computed(() => isLineActive(emsStore.genPower) ? 'line-active-flow-up' : 'line-idle')

const essLineClass = computed(() => {
  const power = Number(emsStore.essPower || 0)
  if (!isLineActive(power)) return 'line-idle'
  return power > 0 ? 'line-active-flow-up' : 'line-active-flow-down'
})

const formatPower = (value, signed = false) => {
  const num = Number(value || 0)
  if (signed && num > 0) return `+${num.toFixed(1)} kW`
  return `${num.toFixed(1)} kW`
}

const formatCapacity = (value) => {
  const num = Number(value || 0)
  if (Number.isInteger(num)) return num.toString()
  return num.toFixed(2).replace(/\.?0+$/, '')
}
</script>

<style scoped>
.sld-wrapper { width: 100%; background: #fff; border-radius: 4px; overflow-x: auto;}
.sld-svg { display: block; width: 100%; min-width: 640px; height: auto; }
.bus-bar { fill: #303133; }
.line-base { stroke: #909399; stroke-width: 2; }
.line-idle { stroke: #dcdfe6; stroke-width: 2; stroke-dasharray: none; animation: none; }

.line-active-flow-down {
  stroke: #409eff; stroke-width: 3; stroke-dasharray: 8 6;
  animation: flow-down-smooth 0.8s linear infinite;
}
.line-active-flow-up {
  stroke: #409eff; stroke-width: 3; stroke-dasharray: 8 6;
  animation: flow-up-smooth 0.8s linear infinite;
}

@keyframes flow-down-smooth { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -14; } }
@keyframes flow-up-smooth { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 14; } }

.device-box { fill: #fafafa; stroke-width: 2; }
.grid-box { stroke: #409eff; }
.pv-box { stroke: #e6a23c; }
.ess-box { stroke: #67c23a; }
.genset-box { stroke: #909399; }
.load-box { stroke: #f56c6c; }

.device-title { fill: #303133; font-size: 13px; font-weight: 600; text-anchor: middle; }
.device-sub { fill: #909399; font-size: 11px; text-anchor: middle; }
.soc-text { fill: #67c23a; font-size: 12px; font-weight: 600; text-anchor: middle; }
.soc-status {
  font-size: 11px;
  font-weight: 600;
  text-anchor: start;   /* 從 x=280 往右寫 */
}
.soc-status-normal {
  fill: #67c23a;   /* 綠：正常 */
}
.soc-status-warning {
  fill: #e6a23c;   /* 橙：高電量 */
  animation: soc-blink 1s ease-in-out infinite;
}
.soc-status-danger {
  fill: #f56c6c;   /* 紅：低電量 */
  animation: soc-blink 1s ease-in-out infinite;
}
  @keyframes soc-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.symbol-box { fill: #fff; stroke: #e6a23c; stroke-width: 1.5; }
.symbol-text { fill: #e6a23c; font-size: 11px; font-weight: 600; text-anchor: middle; }

.pcc-node { fill: #fff; stroke: #303133; stroke-width: 2.5; }
.pcc-label { fill: #606266; font-size: 12px; font-weight: 600; text-anchor: middle; }

.line-breaker-closed { stroke: #67c23a; stroke-width: 3.5; stroke-linecap: round; }
.breaker-open-arm { stroke: #f56c6c; stroke-width: 2.5; stroke-linecap: round; }
.breaker-label { fill: #303133; font-size: 11px; font-weight: bold; text-anchor: start; }
.power-label { fill: #409eff; font-size: 12px; font-weight: 600; }

.legend-title { fill: #303133; font-size: 12px; font-weight: 600; }
.legend-item { fill: #606266; font-size: 11px; }

.mode-banner { fill: #303133; font-size: 14px; font-weight:700; text-anchor: middle; }
</style>