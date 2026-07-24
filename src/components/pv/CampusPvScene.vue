<template>
  <div class="campus-scene" :class="{ generating: utilization > 0.05 }">
    <div class="sky">
      <div class="sun-wrap" :style="{ opacity: 0.4 + utilization * 0.6 }">
        <div class="sun-rays" />
        <div class="sun" />
      </div>
      <div class="cloud cloud-a"><span /><span /><span /></div>
      <div class="cloud cloud-b"><span /><span /><span /></div>
      <div v-if="utilization > 0.05" class="bird bird-1" />
      <div v-if="utilization > 0.05" class="bird bird-2" />
    </div>

    <div class="ground">
      <div class="grass-layer">
        <span v-for="g in 18" :key="g" class="grass-blade" :style="{ left: `${(g - 1) * 5.5}%` }" />
      </div>
      <div class="track" />
      <div class="tree tree-left"><div class="trunk" /><div class="canopy" /></div>
      <div class="tree tree-right"><div class="trunk" /><div class="canopy" /></div>

      <div class="building-shadow" />

      <div class="building">
        <div class="roof">
          <div
            v-for="cell in panelCells"
            :key="cell"
            class="panel-cell"
            :style="{
              opacity: 0.3 + utilization * 0.7,
              animationDelay: `${(cell % 4) * 0.15}s`
            }"
          >
            <span class="panel-glare" />
          </div>
        </div>
        <div class="facade">
          <div class="window-row">
            <span v-for="w in 6" :key="w" class="window" />
          </div>
          <div class="window-row">
            <span v-for="w in 6" :key="`b-${w}`" class="window" />
          </div>
          <div class="entrance">{{ siteName }}</div>
        </div>
      </div>

      <div class="flag-pole">
        <div class="flag" />
      </div>
    </div>

    <template v-if="utilization > 0.05">
      <div class="power-beam" :style="{ height: `${28 + utilization * 40}px` }" />
      <div
        v-for="p in sparkCount"
        :key="p"
        class="spark"
        :style="sparkStyle(p)"
      />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineProps({
  utilization: { type: Number, default: 0 },
  siteName: { type: String, default: '' }
})

const panelCells = computed(() => Array.from({ length: 12 }, (_, i) => i))
const sparkCount = 6

const sparkStyle = (i) => ({
  left: `${38 + (i % 3) * 8}%`,
  animationDelay: `${i * 0.35}s`,
  animationDuration: `${1.2 + (i % 3) * 0.3}s`
})
</script>

<style scoped>
.campus-scene {
  position: relative;
  height: 220px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, #4da3ff 0%, #87cefa 38%, #b8e8ff 52%, #7ec850 52%, #5a9e3e 100%);
  border: 1px solid #c0d4e8;
  box-shadow: inset 0 -8px 24px rgba(0, 60, 0, 0.08);
}

.sky {
  position: absolute;
  inset: 0 0 48% 0;
}

.sun-wrap {
  position: absolute;
  top: 12px;
  right: 22px;
  width: 64px;
  height: 64px;
  transition: opacity 0.6s ease;
}

.sun-rays {
  position: absolute;
  inset: -6px;
  background: conic-gradient(
    from 0deg,
    transparent 0deg 12deg,
    rgba(255, 220, 80, 0.45) 12deg 24deg,
    transparent 24deg 42deg,
    rgba(255, 220, 80, 0.35) 42deg 54deg,
    transparent 54deg 72deg,
    rgba(255, 220, 80, 0.45) 72deg 84deg,
    transparent 84deg 102deg,
    rgba(255, 220, 80, 0.35) 102deg 114deg,
    transparent 114deg 132deg,
    rgba(255, 220, 80, 0.45) 132deg 144deg,
    transparent 144deg 162deg,
    rgba(255, 220, 80, 0.35) 162deg 174deg,
    transparent 174deg 360deg
  );
  border-radius: 50%;
  animation: sun-spin 18s linear infinite;
}

.generating .sun-rays {
  animation: sun-spin 10s linear infinite;
}

.sun {
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff9c4 0%, #ffd54f 45%, #ff9800 100%);
  box-shadow: 0 0 28px rgba(255, 193, 7, 0.75), 0 0 56px rgba(255, 152, 0, 0.35);
  animation: sun-pulse 3s ease-in-out infinite;
}

.cloud {
  position: absolute;
  display: flex;
  gap: 0;
  opacity: 0.92;
  animation: cloud-drift 22s linear infinite;
}

.cloud span {
  display: block;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.5);
}

.cloud-a {
  top: 22px;
  left: 8%;
  animation-duration: 28s;
}

.cloud-a span:nth-child(1) { width: 28px; height: 28px; margin-top: 8px; }
.cloud-a span:nth-child(2) { width: 38px; height: 38px; }
.cloud-a span:nth-child(3) { width: 24px; height: 24px; margin-top: 10px; }

.cloud-b {
  top: 48px;
  left: 55%;
  animation-duration: 34s;
  animation-delay: -8s;
  opacity: 0.78;
}

.cloud-b span:nth-child(1) { width: 22px; height: 22px; margin-top: 6px; }
.cloud-b span:nth-child(2) { width: 32px; height: 32px; }
.cloud-b span:nth-child(3) { width: 20px; height: 20px; margin-top: 8px; }

.bird {
  position: absolute;
  width: 14px;
  height: 6px;
  border-top: 2px solid rgba(60, 60, 80, 0.55);
  border-radius: 50% 50% 0 0;
  animation: bird-fly 12s linear infinite;
}

.bird-1 { top: 36px; left: -20px; animation-duration: 14s; }
.bird-2 { top: 52px; left: -40px; animation-duration: 18s; animation-delay: 4s; transform: scale(0.8); }

.ground {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 48%;
}

.grass-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.grass-blade {
  position: absolute;
  bottom: 28px;
  width: 3px;
  height: 10px;
  background: linear-gradient(180deg, #8bc34a, #558b2f);
  border-radius: 2px 2px 0 0;
  transform-origin: bottom center;
  animation: grass-sway 2.8s ease-in-out infinite;
}

.grass-blade:nth-child(odd) { animation-delay: -0.6s; height: 8px; }
.grass-blade:nth-child(3n) { animation-delay: -1.2s; }

.track {
  position: absolute;
  bottom: 8px;
  left: 6%;
  width: 88%;
  height: 30px;
  border-radius: 15px;
  background: linear-gradient(180deg, #d4956a 0%, #a0653a 100%);
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.2);
  opacity: 0.55;
}

.tree {
  position: absolute;
  bottom: 26px;
  width: 36px;
  height: 56px;
}

.tree-left { left: 5%; }
.tree-right { right: 6%; }

.trunk {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 18px;
  background: #6d4c41;
  border-radius: 2px;
}

.canopy {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  width: 34px;
  height: 40px;
  background: radial-gradient(ellipse at 50% 60%, #43a047 0%, #2e7d32 70%, #1b5e20 100%);
  border-radius: 50% 50% 45% 45%;
  animation: tree-sway 4s ease-in-out infinite;
}

.tree-right .canopy { animation-delay: -1.5s; }

.building-shadow {
  position: absolute;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  width: 52%;
  max-width: 200px;
  height: 12px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.25) 0%, transparent 70%);
  border-radius: 50%;
}

.building {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  width: 58%;
  max-width: 220px;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15));
}

.roof {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
  padding: 7px;
  background: linear-gradient(180deg, #374151 0%, #1f2937 100%);
  border-radius: 8px 8px 0 0;
  border: 1px solid #4b5563;
}

.panel-cell {
  position: relative;
  aspect-ratio: 1.4;
  border-radius: 2px;
  overflow: hidden;
  background: linear-gradient(145deg, #0d47a1 0%, #1565c0 40%, #42a5f5 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.15);
  transition: opacity 0.6s ease;
}

.generating .panel-cell {
  animation: panel-shine 2.2s ease-in-out infinite;
}

.panel-glare {
  position: absolute;
  top: -50%;
  left: -60%;
  width: 40%;
  height: 200%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
  transform: rotate(25deg);
  animation: glare-sweep 3.5s ease-in-out infinite;
}

.facade {
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px solid #94a3b8;
  border-top: none;
  padding: 10px 8px 8px;
  border-radius: 0 0 8px 8px;
}

.window-row {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 6px;
}

.window {
  width: 18px;
  height: 14px;
  background: linear-gradient(135deg, #90caf9 0%, #bbdefb 50%, #64b5f6 100%);
  border: 1px solid #64748b;
  border-radius: 2px;
  box-shadow: inset 0 0 4px rgba(255, 255, 255, 0.6);
}

.entrance {
  margin-top: 4px;
  padding: 0 4px;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.35;
  color: #334155;
  letter-spacing: 0.02em;
  word-break: break-all;
}

.flag-pole {
  position: absolute;
  left: 13%;
  bottom: 36px;
  width: 3px;
  height: 58px;
  background: linear-gradient(90deg, #78909c, #546e7a);
  border-radius: 2px;
}

.flag {
  position: absolute;
  top: 4px;
  left: 3px;
  width: 24px;
  height: 15px;
  background: linear-gradient(180deg, #ef5350 0%, #c62828 100%);
  border-radius: 0 3px 3px 0;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
  transform-origin: left center;
  animation: flag-wave 2.5s ease-in-out infinite;
}

.power-beam {
  position: absolute;
  top: 68px;
  left: 50%;
  width: 5px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, rgba(255, 235, 59, 0.95), rgba(255, 193, 7, 0.4), transparent);
  border-radius: 3px;
  box-shadow: 0 0 12px rgba(255, 193, 7, 0.6);
  pointer-events: none;
  animation: beam-pulse 1.8s ease-in-out infinite;
}

.spark {
  position: absolute;
  top: 62px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ffeb3b;
  box-shadow: 0 0 8px #ffc107;
  pointer-events: none;
  animation: spark-rise linear infinite;
}

@keyframes sun-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes sun-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}

@keyframes cloud-drift {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(100vw * 0.3)); }
}

@keyframes bird-fly {
  0% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(30vw) translateY(-6px); }
  50% { transform: translateX(60vw) translateY(2px); }
  75% { transform: translateX(90vw) translateY(-4px); }
  100% { transform: translateX(110vw) translateY(0); }
}

@keyframes grass-sway {
  0%, 100% { transform: rotate(-4deg); }
  50% { transform: rotate(5deg); }
}

@keyframes tree-sway {
  0%, 100% { transform: translateX(-50%) rotate(-1deg); }
  50% { transform: translateX(-50%) rotate(2deg); }
}

@keyframes panel-shine {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.35); }
}

@keyframes glare-sweep {
  0% { left: -60%; }
  40%, 100% { left: 120%; }
}

@keyframes flag-wave {
  0%, 100% { transform: skewY(0deg) scaleX(1); }
  50% { transform: skewY(-6deg) scaleX(0.92); }
}

@keyframes beam-pulse {
  0%, 100% { opacity: 0.75; }
  50% { opacity: 1; }
}

@keyframes spark-rise {
  0% { opacity: 0; transform: translateY(0) scale(0.5); }
  20% { opacity: 1; transform: translateY(-8px) scale(1); }
  100% { opacity: 0; transform: translateY(-48px) scale(0.3); }
}
</style>
