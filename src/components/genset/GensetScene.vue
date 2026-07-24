<template>
  <div class="genset-scene" :class="activityClass">
    <div class="scene-bg" />
    <div class="concrete-pad" />

    <div class="genset-assembly">
      <!-- 底座滑軌 -->
      <div class="skid-frame">
        <div class="skid-rail" />
        <div class="skid-rail" />
        <div class="skid-cross" v-for="i in 3" :key="i" />
      </div>

      <!-- 主機防音罩 -->
      <div class="canopy">
        <!-- 頂部排氣消音器 -->
        <div class="muffler">
          <div class="muffler-pipe" />
          <div v-if="isRunning" class="exhaust-smoke">
            <span v-for="i in 3" :key="i" class="smoke-puff" :style="{ animationDelay: `${i * 0.45}s` }" />
          </div>
        </div>

        <!-- 左端：散熱器進風口 -->
        <div class="end-radiator">
          <div class="radiator-mesh">
            <span v-for="i in 8" :key="i" class="mesh-line" />
          </div>
          <span class="end-label">散熱</span>
        </div>

        <!-- 機身側面 -->
        <div class="canopy-side">
          <div class="canopy-roof" />
          <div class="canopy-wall">
            <!-- 百葉進風口 -->
            <div class="louver-group">
              <span v-for="i in 5" :key="i" class="louver" />
            </div>

            <!-- 控制箱門 -->
            <div class="control-door">
              <div class="door-window">
                <span class="door-status">{{ isRunning ? '運轉中' : '待  命' }}</span>
                <div class="door-lights">
                  <span class="dlamp" :class="{ on: isRunning }" />
                  <span class="dlamp lamp-amber" :class="{ on: !isRunning }" />
                </div>
              </div>
              <div class="door-handle" />
              <span class="door-badge">DG-1</span>
            </div>

            <!-- 側面油箱視窗 -->
            <div class="fuel-gauge">
              <span class="gauge-label">油量</span>
              <div class="gauge-track">
                <div class="gauge-fill" :style="{ height: `${fuelLevel}%` }" />
              </div>
              <span class="gauge-val">{{ fuelLevel.toFixed(0) }}%</span>
            </div>
          </div>
        </div>

        <!-- 右端：發電機（ alternator ） -->
        <div class="end-alternator">
          <div class="alt-housing" />
          <div class="alt-terminal">
            <span class="terminal-bolt" v-for="i in 3" :key="i" />
          </div>
          <span class="end-label">發電</span>
        </div>
      </div>

      <!-- 出力標示 -->
      <div v-if="isRunning" class="output-badge">
        <span class="output-icon">⚡</span>
        <span>{{ powerKw.toFixed(1) }} kW</span>
      </div>
    </div>

    <div class="info-bar">
      <span>額定 {{ capacityKw }} kW</span>
      <span class="sep">|</span>
      <span>{{ isRunning ? '柴油發電機運轉中' : '自動備援待命' }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  capacityKw: { type: Number, default: 200 },
  powerKw: { type: Number, default: 0 },
  fuelLevel: { type: Number, default: 75 }
})

const isRunning = computed(() => props.powerKw > 0.5)
const activityClass = computed(() => (isRunning.value ? 'running' : 'standby'))
</script>

<style scoped>
.genset-scene {
  position: relative;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  background: #90a4ae;
  border: 1px solid #78909c;
}

.scene-bg {
  position: absolute;
  inset: 0 0 30% 0;
  background: linear-gradient(180deg, #64b5f6 0%, #bbdefb 100%);
}

.concrete-pad {
  position: absolute;
  bottom: 28px;
  left: 5%;
  right: 5%;
  height: 14px;
  background: linear-gradient(180deg, #bdbdbd 0%, #9e9e9e 100%);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.genset-assembly {
  position: absolute;
  left: 50%;
  bottom: 38px;
  transform: translateX(-50%);
  width: 88%;
  max-width: 400px;
}

/* 底座 */
.skid-frame {
  position: relative;
  height: 12px;
  margin: 0 4px;
}

.skid-rail {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(180deg, #616161 0%, #424242 100%);
  border-radius: 1px;
}

.skid-rail:first-child {
  bottom: 6px;
  left: 8%;
  right: 8%;
  height: 4px;
  background: #757575;
}

.skid-cross {
  position: absolute;
  bottom: 0;
  width: 4px;
  height: 10px;
  background: #616161;
}

.skid-cross:nth-child(3) { left: 15%; }
.skid-cross:nth-child(4) { left: 50%; transform: translateX(-50%); }
.skid-cross:nth-child(5) { right: 15%; }

/* 防音罩整體 */
.canopy {
  position: relative;
  display: flex;
  align-items: stretch;
  height: 130px;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.22));
}

.running .canopy {
  animation: canopy-vibe 0.12s ease-in-out infinite;
}

/* 排氣管 */
.muffler {
  position: absolute;
  top: -28px;
  left: 28%;
  z-index: 3;
}

.muffler-pipe {
  width: 14px;
  height: 32px;
  margin: 0 auto;
  background: linear-gradient(90deg, #616161, #9e9e9e, #616161);
  border-radius: 3px 3px 0 0;
}

.exhaust-smoke {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
}

.smoke-puff {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(140, 140, 140, 0.6);
  animation: smoke-rise 2s ease-out infinite;
}

/* 散熱器端 */
.end-radiator {
  width: 36px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(90deg, #33691e 0%, #558b2f 100%);
  border: 2px solid #2e7d32;
  border-right: 1px solid #1b5e20;
  border-radius: 4px 0 0 4px;
  padding: 8px 4px 4px;
}

.radiator-mesh {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 4px;
  background: #1b5e20;
  border: 1px solid #388e3c;
  border-radius: 2px;
}

.mesh-line {
  display: block;
  height: 3px;
  background: repeating-linear-gradient(
    90deg,
    #81c784 0,
    #81c784 4px,
    #2e7d32 4px,
    #2e7d32 6px
  );
  border-radius: 1px;
}

.running .mesh-line {
  animation: mesh-flicker 0.25s ease-in-out infinite;
}

.running .mesh-line:nth-child(odd) {
  animation-delay: 0.12s;
}

/* 機身 */
.canopy-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.canopy-roof {
  height: 10px;
  background: linear-gradient(180deg, #689f38 0%, #558b2f 100%);
  border-left: 1px solid #33691e;
  border-right: 1px solid #33691e;
}

.canopy-wall {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: linear-gradient(180deg, #7cb342 0%, #558b2f 60%, #33691e 100%);
  border: 2px solid #2e7d32;
  border-top: none;
}

.louver-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px;
}

.louver {
  display: block;
  width: 32px;
  height: 4px;
  background: #33691e;
  border-radius: 1px;
  transform: skewX(-8deg);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* 控制門 */
.control-door {
  flex: 1;
  position: relative;
  min-height: 80px;
  background: linear-gradient(180deg, #eceff1 0%, #cfd8dc 100%);
  border: 2px solid #78909c;
  border-radius: 3px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.door-window {
  width: 100%;
  flex: 1;
  background: #263238;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px;
}

.door-status {
  font-size: 11px;
  font-weight: 800;
  color: #a5d6a7;
  letter-spacing: 0.15em;
}

.running .door-status {
  color: #ffcc80;
}

.door-lights {
  display: flex;
  gap: 8px;
}

.dlamp {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #424242;
  border: 1px solid #616161;
}

.dlamp.on {
  background: #66bb6a;
  box-shadow: 0 0 5px #66bb6a;
}

.dlamp.lamp-amber.on {
  background: #ffa726;
  box-shadow: 0 0 5px #ffa726;
}

.running .dlamp.on {
  animation: lamp-blink 0.9s ease-in-out infinite;
}

.door-handle {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: #78909c;
  border-radius: 2px;
}

.door-badge {
  font-size: 12px;
  font-weight: 900;
  color: #37474f;
  letter-spacing: 0.1em;
}

/* 油量表 */
.fuel-gauge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 28px;
}

.gauge-label {
  font-size: 8px;
  font-weight: 700;
  color: #e8f5e9;
}

.gauge-track {
  width: 14px;
  height: 50px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}

.gauge-fill {
  width: 100%;
  background: linear-gradient(180deg, #ffb74d, #e65100);
  border-radius: 2px;
  transition: height 0.8s ease;
}

.gauge-val {
  font-size: 9px;
  font-weight: 800;
  color: #fff;
}

/* 發電機端 */
.end-alternator {
  width: 40px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(90deg, #558b2f 0%, #33691e 100%);
  border: 2px solid #2e7d32;
  border-left: 1px solid #1b5e20;
  border-radius: 0 4px 4px 0;
  padding: 8px 4px 4px;
}

.alt-housing {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #78909c, #455a64 60%, #37474f);
  border: 3px solid #546e7a;
  box-shadow: inset 0 -2px 6px rgba(0, 0, 0, 0.3);
  margin-bottom: 6px;
}

.running .alt-housing {
  box-shadow:
    inset 0 -2px 6px rgba(0, 0, 0, 0.3),
    0 0 12px rgba(255, 167, 38, 0.5);
  animation: alt-spin-glow 2s ease-in-out infinite;
}

.alt-terminal {
  display: flex;
  gap: 3px;
  padding: 4px;
  background: #37474f;
  border-radius: 2px;
  margin-bottom: 4px;
}

.terminal-bolt {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffd54f;
  border: 1px solid #f9a825;
}

.running .terminal-bolt {
  box-shadow: 0 0 4px #ffd54f;
}

.end-label {
  font-size: 8px;
  font-weight: 700;
  color: #c8e6c9;
  letter-spacing: 0.05em;
}

/* 出力標籤 */
.output-badge {
  position: absolute;
  top: -8px;
  right: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: #fff8e1;
  border: 2px solid #ff9800;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 800;
  color: #e65100;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
  animation: badge-pulse 1.5s ease-in-out infinite;
}

.output-icon {
  font-size: 14px;
}

.info-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 6px 12px;
  background: rgba(38, 50, 56, 0.9);
  font-size: 11px;
  font-weight: 700;
  color: #eceff1;
}

.sep {
  color: rgba(255, 255, 255, 0.25);
}

@keyframes smoke-rise {
  0% { opacity: 0.65; transform: translateY(0) scale(0.7); }
  100% { opacity: 0; transform: translateY(-22px) scale(1.2); }
}

@keyframes canopy-vibe {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(0.4px); }
}

@keyframes mesh-flicker {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes lamp-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

@keyframes alt-spin-glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}

@keyframes badge-pulse {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
</style>
