<template>
  <div class="cabinet-scene" :class="[activityClass, { 'has-pcs-row': isJialiSite }]">
    <div class="scene-floor" />
    <div class="cabinet-row" :class="{ 'cabinet-row-many': cabinetCount > 6 }">
      <div
        v-for="n in cabinetCount"
        :key="n"
        class="cabinet-column"
        :class="{
          'cabinet-column-with-pcs': isJialiSite,
          'column-hover-active': bmsHover[n] || pcsHover[n]
        }"
      >
        <div
          v-if="isJialiSite"
          class="pcs-wrapper"
          @mouseenter="setPcsHover(n, true)"
          @mouseleave="setPcsHover(n, false)"
        >
          <div
            class="pcs-unit pcs-interactive"
            :class="{ 'has-live-data': hasAnyPcsMetric(n) }"
          >
            <PcsBlock :n="n" :active="true" />
          </div>
          <Transition name="pcs-popover-fade">
            <div v-show="pcsHover[n]" class="pcs-hover-popover">
              <div class="pcs-hover-panel">
                <div class="pcs-hover-title">PCS-{{ n }} 即時資訊</div>
                <div
                  v-for="item in pcsMetricsFor(n)"
                  :key="item.key"
                  class="pcs-hover-row"
                >
                  <span>{{ item.label }}</span>
                  <strong v-if="item.error" class="is-error">{{ item.error }}</strong>
                  <strong v-else-if="hasMetricValue(item)">
                    {{ formatMetric(item) }}<span v-if="item.unit"> {{ item.unit }}</span>
                  </strong>
                  <strong v-else>—</strong>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div
          class="bms-wrapper"
          @mouseenter="setBmsHover(n, true)"
          @mouseleave="setBmsHover(n, false)"
        >
          <div
            class="ess-cabinet bms-interactive"
            :class="[
              `cabinet-tone-${((n - 1) % 3) + 1}`,
              { 'has-live-data': isJialiSite && hasAnyBmsMetric(n) }
            ]"
            :style="{ animationDelay: `${(n - 1) * 0.12}s` }"
          >
            <CabinetBlock :n="n" :label-prefix="labelPrefix" :soc="bmsSocFor(n)" />
          </div>
          <Transition v-if="isJialiSite" name="bms-popover-fade">
            <div v-show="bmsHover[n]" class="bms-hover-popover">
              <div class="bms-hover-panel">
                <div class="bms-hover-title">BMS-{{ n }} 即時資訊</div>
                <div
                  v-for="item in bmsMetricsFor(n)"
                  :key="item.key"
                  class="bms-hover-row"
                >
                  <span>{{ item.label }}</span>
                  <strong v-if="item.error" class="is-error">{{ item.error }}</strong>
                  <strong v-else-if="hasMetricValue(item)">
                    {{ formatMetric(item) }} {{ item.unit }}
                  </strong>
                  <strong v-else>—</strong>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import CabinetBlock from './CabinetBlock.vue'
import PcsBlock from './PcsBlock.vue'

const props = defineProps({
  siteId: { type: String, default: '' },
  siteName: { type: String, default: '' },
  soc: { type: Number, default: 0 },
  powerKw: { type: Number, default: 0 },
  bmsUnits: { type: Array, default: () => [] },
  pcsUnits: { type: Array, default: () => [] }
})

const isJialiSite = computed(() => props.siteId === 'jiali-junior-high')
const bmsHover = reactive({})
const pcsHover = reactive({})

const cabinetCount = computed(() => 6)
const labelPrefix = computed(() => (isJialiSite.value ? 'BMS' : 'ESS'))

const getBmsUnit = (n) => props.bmsUnits.find((unit) => unit.unitIndex === n) || null
const getPcsUnit = (n) => props.pcsUnits.find((unit) => unit.unitIndex === n) || null

const setBmsHover = (n, value) => {
  bmsHover[n] = value
}

const setPcsHover = (n, value) => {
  pcsHover[n] = value
}

const bmsMetricsFor = (n) => getBmsUnit(n)?.metrics || []
const pcsMetricsFor = (n) => getPcsUnit(n)?.metrics || []

const bmsSocFor = (n) => {
  if (!isJialiSite.value) return props.soc
  const soc = getBmsUnit(n)?.soc
  return soc != null ? soc : props.soc
}

const hasAnyBmsMetric = (n) =>
  bmsMetricsFor(n).some((item) => Number.isFinite(Number(item.value)))

const hasAnyPcsMetric = (n) =>
  pcsMetricsFor(n).some((item) => Number.isFinite(Number(item.value)))

const activityClass = computed(() => {
  if (props.powerKw > 0.5) return 'discharging'
  if (props.powerKw < -0.5) return 'charging'
  return 'standby'
})

const hasMetricValue = (item) => Number.isFinite(Number(item.value))

const formatMetric = (item) => {
  const num = Number(item.value)
  if (!Number.isFinite(num)) return '—'
  const decimals = item.decimals ?? 1
  return num.toFixed(decimals)
}
</script>

<style scoped>
.cabinet-scene {
  position: relative;
  height: 364px;
  border-radius: 16px;
  overflow: visible;
  background: linear-gradient(180deg, #3949ab 0%, #5c6bc0 38%, #7e57c2 38%, #512da8 100%);
  border: 2px solid #7c4dff;
  box-shadow: inset 0 0 40px rgba(124, 77, 255, 0.25);
}

.cabinet-scene.has-pcs-row {
  height: 468px;
}

.scene-floor {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 29px;
  background: linear-gradient(180deg, #ff6f00 0%, #e65100 100%);
  box-shadow: 0 -2px 12px rgba(255, 111, 0, 0.4);
}

.cabinet-row {
  position: absolute;
  inset: 18px 14px 31px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 11px;
  overflow: visible;
}

.cabinet-row-many {
  gap: 8px;
}

.cabinet-column {
  position: relative;
  z-index: 1;
  flex: 1;
  max-width: 103px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-end;
  gap: 8px;
}

.cabinet-column.column-hover-active {
  z-index: 300;
}

.cabinet-column-with-pcs .ess-cabinet {
  flex: 1;
  min-height: 0;
  max-width: none;
  height: auto;
}

.bms-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.bms-interactive {
  cursor: pointer;
  position: relative;
  overflow: visible;
}

.bms-hover-popover {
  position: absolute;
  top: 52px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 400;
  padding: 10px 12px;
  border-radius: 8px;
  background: #303133;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  pointer-events: none;
  white-space: nowrap;
}

.bms-hover-popover::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 6px 6px;
  border-style: solid;
  border-color: transparent transparent #303133;
}

.bms-popover-fade-enter-active,
.bms-popover-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.bms-popover-fade-enter-from,
.bms-popover-fade-leave-to {
  opacity: 0;
}

.cabinet-row-many .cabinet-column {
  max-width: 83px;
}

.cabinet-row-many :deep(.cabinet-label) {
  font-size: 12px;
}

.pcs-unit {
  flex-shrink: 0;
  height: 68px;
}

.pcs-wrapper {
  position: relative;
  overflow: visible;
}

.pcs-unit.pcs-interactive {
  position: relative;
  overflow: visible;
  cursor: pointer;
}

.pcs-interactive.has-live-data :deep(.pcs-inner) {
  box-shadow:
    0 5px 13px rgba(0, 0, 0, 0.22),
    0 0 16px rgba(255, 183, 77, 0.75);
}

.pcs-hover-popover {
  position: absolute;
  top: 76px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 400;
  padding: 10px 12px;
  border-radius: 8px;
  background: #303133;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  pointer-events: none;
  white-space: nowrap;
}

.pcs-hover-popover::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 6px 6px;
  border-style: solid;
  border-color: transparent transparent #303133;
}

.pcs-hover-panel {
  min-width: 220px;
  line-height: 1.5;
  color: #fff;
}

.pcs-hover-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #fff;
}

.pcs-hover-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  margin-bottom: 4px;
}

.pcs-hover-row span {
  color: rgba(255, 255, 255, 0.75);
}

.pcs-hover-row strong {
  color: #fff;
  text-align: right;
}

.pcs-hover-row strong.is-error {
  color: #ffb4b4;
  max-width: 140px;
}

.pcs-popover-fade-enter-active,
.pcs-popover-fade-leave-active {
  transition: opacity 0.15s ease;
}

.pcs-popover-fade-enter-from,
.pcs-popover-fade-leave-to {
  opacity: 0;
}

.ess-cabinet {
  flex: 1;
  max-width: 103px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 10px 10px 5px 5px;
  overflow: hidden;
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.28),
    0 0 12px rgba(0, 229, 255, 0.2);
  border: 3px solid #00e5ff;
}

.ess-cabinet.bms-interactive {
  overflow: visible;
}

.bms-interactive.has-live-data {
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.28),
    0 0 16px rgba(118, 255, 3, 0.55);
}

.cabinet-tone-1 {
  background: linear-gradient(180deg, #00bcd4 0%, #0097a7 100%);
}

.cabinet-tone-2 {
  background: linear-gradient(180deg, #26c6da 0%, #00838f 100%);
  border-color: #18ffff;
}

.cabinet-tone-3 {
  background: linear-gradient(180deg, #29b6f6 0%, #0277bd 100%);
  border-color: #40c4ff;
}

.standby :deep(.cabinet-led) {
  background: #18ffff;
  box-shadow: 0 0 10px #18ffff;
}

/* 佳里案場 BMS：綠燈持續閃爍，不受待機/充放電切換影響 */
.cabinet-scene.has-pcs-row :deep(.cabinet-led) {
  background: #76ff03;
  box-shadow: 0 0 12px #76ff03;
  animation: led-blink 1s ease-in-out infinite;
}

.charging :deep(.cabinet-led) {
  background: #76ff03;
  box-shadow: 0 0 12px #76ff03;
  animation: led-blink 1s ease-in-out infinite;
}

.discharging :deep(.cabinet-led) {
  background: #ff9100;
  box-shadow: 0 0 12px #ff9100;
  animation: led-blink 0.8s ease-in-out infinite;
}

.discharging :deep(.soc-fill) {
  background: linear-gradient(180deg, #ff9100 0%, #ff3d00 100%);
  box-shadow: 0 0 8px rgba(255, 145, 0, 0.6);
}

.charging .ess-cabinet,
.discharging .ess-cabinet {
  animation: cabinet-pulse 2s ease-in-out infinite;
}

.bms-hover-panel {
  min-width: 220px;
  line-height: 1.5;
  color: #fff;
}

.bms-hover-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #fff;
}

.bms-hover-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  margin-bottom: 4px;
}

.bms-hover-row span {
  color: rgba(255, 255, 255, 0.75);
}

.bms-hover-row strong {
  color: #fff;
  text-align: right;
}

.bms-hover-row strong.is-error {
  color: #ffb4b4;
  max-width: 140px;
}

@keyframes led-blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.78; transform: scale(0.92); }
}

@keyframes cabinet-pulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.15); }
}
</style>
