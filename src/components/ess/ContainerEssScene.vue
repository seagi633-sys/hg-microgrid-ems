<template>
  <div class="container-scene" :class="activityClass">
    <div class="scene-ground" />
    <div class="container-unit">
      <div class="container-top">
        <span class="container-led" />
        <span class="container-tag">20ft ESS 貨櫃式儲能</span>
        <span class="container-led" />
      </div>
      <div class="container-body">
        <div class="corrugation" />
        <div class="container-door">
          <span class="door-handle" />
          <span class="door-panel" />
        </div>
        <div class="container-brand">ESS</div>
      </div>
      <div class="container-soc-wrap">
        <div class="soc-label">SOC {{ soc.toFixed(0) }}%</div>
        <div class="container-soc-bar">
          <div class="container-soc-fill" :style="{ width: `${soc}%` }" />
        </div>
      </div>
      <div class="container-name">{{ siteName }}</div>
    </div>
    <div v-if="Math.abs(powerKw) > 0.5" class="power-arrows">
      <span v-for="i in 5" :key="i" class="arrow" :style="{ animationDelay: `${i * 0.25}s` }">▲</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  siteName: { type: String, default: '' },
  soc: { type: Number, default: 0 },
  powerKw: { type: Number, default: 0 }
})

const activityClass = computed(() => {
  if (props.powerKw > 0.5) return 'discharging'
  if (props.powerKw < -0.5) return 'charging'
  return 'standby'
})
</script>

<style scoped>
.container-scene {
  position: relative;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, #3949ab 0%, #5c6bc0 38%, #7e57c2 38%, #512da8 100%);
  border: 2px solid #7c4dff;
  box-shadow: inset 0 0 40px rgba(124, 77, 255, 0.25);
}

.scene-ground {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 22px;
  background: linear-gradient(180deg, #ff6f00 0%, #e65100 100%);
  box-shadow: 0 -2px 12px rgba(255, 111, 0, 0.4);
}

.container-unit {
  position: absolute;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  width: 78%;
  max-width: 420px;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3));
  border: 2px solid #00e5ff;
  border-radius: 8px;
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.25);
}

.container-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: linear-gradient(180deg, #ff4081 0%, #f50057 100%);
  border-radius: 6px 6px 0 0;
}

.container-tag {
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.06em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
}

.container-led {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #18ffff;
  box-shadow: 0 0 10px #18ffff;
}

.charging .container-led {
  background: #76ff03;
  box-shadow: 0 0 12px #76ff03;
  animation: led-blink 1s ease-in-out infinite;
}

.discharging .container-led {
  background: #ff9100;
  box-shadow: 0 0 12px #ff9100;
  animation: led-blink 0.8s ease-in-out infinite;
}

.container-body {
  position: relative;
  height: 120px;
  background: linear-gradient(180deg, #00bcd4 0%, #0097a7 50%, #0277bd 100%);
  border: none;
  border-top: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.corrugation {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent 0,
    transparent 14px,
    rgba(255, 255, 255, 0.12) 14px,
    rgba(255, 255, 255, 0.12) 16px
  );
  pointer-events: none;
}

.container-door {
  position: absolute;
  right: 12%;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 80px;
  background: linear-gradient(180deg, #26c6da 0%, #00838f 100%);
  border: 2px solid #18ffff;
  border-radius: 2px;
  display: flex;
  align-items: center;
  padding-left: 6px;
  box-shadow: 0 0 8px rgba(24, 255, 255, 0.3);
}

.door-handle {
  width: 4px;
  height: 20px;
  background: #ffd600;
  border-radius: 2px;
}

.door-panel {
  flex: 1;
  height: 60%;
  margin-left: 4px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.container-brand {
  font-size: 42px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.28);
  letter-spacing: 0.2em;
  user-select: none;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.charging .container-body,
.discharging .container-body {
  animation: container-glow 2s ease-in-out infinite;
}

.container-soc-wrap {
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.35);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.soc-label {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.container-soc-bar {
  height: 10px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.container-soc-fill {
  height: 100%;
  background: linear-gradient(90deg, #76ff03 0%, #00e676 100%);
  border-radius: 4px;
  transition: width 0.6s ease;
  box-shadow: 0 0 8px rgba(118, 255, 3, 0.6);
}

.discharging .container-soc-fill {
  background: linear-gradient(90deg, #ff9100 0%, #ff3d00 100%);
  box-shadow: 0 0 8px rgba(255, 145, 0, 0.6);
}

.container-name {
  padding: 8px 10px;
  text-align: center;
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(180deg, #ffd600 0%, #ffab00 100%);
  border-radius: 0 0 6px 6px;
  line-height: 1.35;
  word-break: break-all;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.power-arrows {
  position: absolute;
  top: 24%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  pointer-events: none;
}

.arrow {
  font-size: 14px;
  color: #ff9100;
  text-shadow: 0 0 8px #ff9100;
  opacity: 0;
  animation: arrow-rise 1.2s ease-in-out infinite;
}

.charging .arrow {
  color: #76ff03;
  text-shadow: 0 0 8px #76ff03;
  animation-name: arrow-fall;
}

@keyframes led-blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

@keyframes container-glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.15); }
}

@keyframes arrow-rise {
  0% { opacity: 0; transform: translateY(6px); }
  40% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-14px); }
}

@keyframes arrow-fall {
  0% { opacity: 0; transform: translateY(-6px) rotate(180deg); }
  40% { opacity: 1; }
  100% { opacity: 0; transform: translateY(14px) rotate(180deg); }
}
</style>
