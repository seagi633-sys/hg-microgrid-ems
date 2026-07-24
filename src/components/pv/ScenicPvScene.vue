<template>
  <div class="scenic-scene" :class="{ generating: utilization > 0.05 }">
    <div class="sky">
      <div class="sun-wrap" :style="{ opacity: 0.4 + utilization * 0.6 }">
        <div class="sun-rays" />
        <div class="sun" />
      </div>
      <div class="cloud cloud-a"><span /><span /><span /></div>
      <div class="cloud cloud-b"><span /><span /><span /></div>
      <div class="hill hill-back" />
      <div class="hill hill-front" />
    </div>

    <div class="ground-layer">
      <div class="meadow">
        <span v-for="f in 12" :key="f" class="flower" :style="{ left: `${8 + f * 7}%` }" />
      </div>
      <div class="path" />

      <div class="array-block array-left">
        <div class="rack-frame" />
        <div
          v-for="row in rackRows"
          :key="`l-${row}`"
          class="rack-row"
        >
          <div
            v-for="col in rackCols"
            :key="`l-${row}-${col}`"
            class="ground-panel"
            :style="{
              opacity: 0.28 + utilization * 0.72,
              animationDelay: `${(row + col) * 0.1}s`
            }"
          >
            <span class="panel-glare" />
          </div>
        </div>
      </div>

      <div class="array-block array-right">
        <div class="rack-frame" />
        <div
          v-for="row in rackRows"
          :key="`r-${row}`"
          class="rack-row"
        >
          <div
            v-for="col in rackCols"
            :key="`r-${row}-${col}`"
            class="ground-panel"
            :style="{
              opacity: 0.28 + utilization * 0.72,
              animationDelay: `${(row + col) * 0.1 + 0.5}s`
            }"
          >
            <span class="panel-glare" />
          </div>
        </div>
      </div>

      <div class="pavilion">
        <div class="pavilion-roof" />
        <div class="pavilion-body">{{ siteName }}</div>
      </div>

      <div class="tree-scenic tree-a"><div class="trunk" /><div class="canopy" /></div>
      <div class="tree-scenic tree-b"><div class="trunk" /><div class="canopy" /></div>
    </div>

    <template v-if="utilization > 0.05">
      <div class="energy-line energy-left" />
      <div class="energy-line energy-right" />
      <div
        v-for="n in 4"
        :key="n"
        class="flow-dot"
        :style="{ animationDelay: `${n * 0.45}s`, left: `${44 + n * 3}%` }"
      />
    </template>
  </div>
</template>

<script setup>
defineProps({
  utilization: { type: Number, default: 0 },
  siteName: { type: String, default: '' }
})

const rackRows = 5
const rackCols = 7
</script>

<style scoped>
.scenic-scene {
  position: relative;
  height: 220px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, #5eb3ff 0%, #a8d8ff 42%, #8fd14f 42%, #4caf50 100%);
  border: 1px solid #c0d4e8;
  box-shadow: inset 0 -8px 24px rgba(0, 80, 0, 0.1);
}

.sky {
  position: absolute;
  inset: 0 0 55% 0;
}

.sun-wrap {
  position: absolute;
  top: 10px;
  right: 18px;
  width: 58px;
  height: 58px;
  transition: opacity 0.6s ease;
  z-index: 2;
}

.sun-rays {
  position: absolute;
  inset: -4px;
  background: conic-gradient(
    from 0deg,
    transparent 0deg 15deg,
    rgba(255, 230, 100, 0.4) 15deg 28deg,
    transparent 28deg 60deg,
    rgba(255, 230, 100, 0.35) 60deg 73deg,
    transparent 73deg 360deg
  );
  border-radius: 50%;
  animation: sun-spin 16s linear infinite;
}

.sun {
  position: absolute;
  inset: 9px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fffde7 0%, #ffee58 50%, #ffa000 100%);
  box-shadow: 0 0 24px rgba(255, 193, 7, 0.7);
  animation: sun-pulse 3.2s ease-in-out infinite;
}

.cloud {
  position: absolute;
  display: flex;
  opacity: 0.88;
  animation: cloud-drift 26s linear infinite;
  z-index: 1;
}

.cloud span {
  display: block;
  background: #fff;
  border-radius: 50%;
}

.cloud-a { top: 18px; left: 5%; animation-duration: 30s; }
.cloud-a span:nth-child(1) { width: 26px; height: 26px; margin-top: 6px; }
.cloud-a span:nth-child(2) { width: 36px; height: 36px; }
.cloud-a span:nth-child(3) { width: 22px; height: 22px; margin-top: 8px; }

.cloud-b { top: 42px; left: 60%; animation-duration: 36s; animation-delay: -10s; opacity: 0.7; }
.cloud-b span:nth-child(1) { width: 20px; height: 20px; margin-top: 5px; }
.cloud-b span:nth-child(2) { width: 30px; height: 30px; }
.cloud-b span:nth-child(3) { width: 18px; height: 18px; margin-top: 7px; }

.hill {
  position: absolute;
  bottom: 0;
  border-radius: 50% 50% 0 0;
}

.hill-back {
  left: -12%;
  width: 75%;
  height: 56px;
  background: linear-gradient(180deg, #a5d6a7 0%, #66bb6a 100%);
  opacity: 0.7;
}

.hill-front {
  right: -10%;
  width: 68%;
  height: 48px;
  background: linear-gradient(180deg, #81c784 0%, #43a047 100%);
}

.ground-layer {
  position: absolute;
  inset: 45% 0 0 0;
}

.meadow {
  position: absolute;
  inset: 0;
}

.flower {
  position: absolute;
  bottom: 38px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ff7043;
  box-shadow: 0 -8px 0 -2px #66bb6a;
  animation: flower-bob 3s ease-in-out infinite;
}

.flower:nth-child(even) { background: #ffca28; animation-delay: -1s; }
.flower:nth-child(3n) { background: #ec407a; animation-delay: -2s; }

.path {
  position: absolute;
  bottom: 10px;
  left: 8%;
  width: 84%;
  height: 18px;
  border-radius: 9px;
  background: linear-gradient(180deg, #efebe9 0%, #bcaaa4 100%);
  box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.5);
  opacity: 0.85;
}

.array-block {
  position: absolute;
  bottom: 34px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transform: perspective(120px) rotateX(8deg) skewX(-6deg);
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
}

.array-left { left: 14%; z-index: 2; }
.array-right { right: 14%; z-index: 2; }

.rack-frame {
  position: absolute;
  inset: -4px -6px -8px;
  border: 2px solid #78909c;
  border-radius: 2px;
  background: rgba(96, 125, 139, 0.15);
  pointer-events: none;
}

.rack-row {
  display: flex;
  gap: 2px;
}

.ground-panel {
  position: relative;
  width: 18px;
  height: 12px;
  border-radius: 1px;
  overflow: hidden;
  background: linear-gradient(155deg, #0d47a1 0%, #1976d2 50%, #64b5f6 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 1px 2px rgba(0, 0, 0, 0.2);
  transition: opacity 0.6s ease;
}

.generating .ground-panel {
  animation: scenic-glow 2.4s ease-in-out infinite;
}

.panel-glare {
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  animation: glare-slide 4s ease-in-out infinite;
}

.pavilion {
  position: absolute;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  z-index: 4;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.22));
}

.pavilion-roof {
  width: 148px;
  height: 28px;
  margin: 0 auto;
  background: linear-gradient(180deg, #a1887f 0%, #6d4c41 100%);
  clip-path: polygon(5% 100%, 50% 0, 95% 100%);
}

.pavilion-body {
  width: 136px;
  min-height: 36px;
  margin: 0 auto;
  padding: 8px 6px;
  text-align: center;
  font-size: 9px;
  font-weight: 700;
  line-height: 1.35;
  color: #fff;
  background: linear-gradient(180deg, #795548 0%, #5d4037 100%);
  border-radius: 0 0 6px 6px;
  word-break: break-all;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tree-scenic {
  position: absolute;
  bottom: 32px;
  width: 30px;
  height: 50px;
}

.tree-a { left: 1%; }
.tree-b { right: 1%; }

.trunk {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 7px;
  height: 16px;
  background: #5d4037;
  border-radius: 2px;
}

.canopy {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 34px;
  background: radial-gradient(ellipse, #66bb6a 0%, #388e3c 100%);
  border-radius: 50%;
  animation: tree-sway 3.5s ease-in-out infinite;
}

.tree-b .canopy { animation-delay: -1.2s; }

.energy-line {
  position: absolute;
  top: 72px;
  width: 2px;
  height: 40px;
  background: linear-gradient(180deg, rgba(255, 235, 59, 0.9), transparent);
  border-radius: 1px;
  animation: line-flicker 1.5s ease-in-out infinite;
}

.energy-left { left: 24%; transform: rotate(-12deg); }
.energy-right { right: 24%; transform: rotate(12deg); animation-delay: 0.4s; }

.flow-dot {
  position: absolute;
  top: 70px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffeb3b;
  box-shadow: 0 0 10px #ffc107;
  animation: flow-rise 1.4s ease-in-out infinite;
}

@keyframes sun-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes sun-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes cloud-drift {
  0% { transform: translateX(0); }
  100% { transform: translateX(40vw); }
}

@keyframes flower-bob {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-3px) rotate(3deg); }
}

@keyframes scenic-glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.4); }
}

@keyframes glare-slide {
  0% { left: -100%; }
  45%, 100% { left: 150%; }
}

@keyframes tree-sway {
  0%, 100% { transform: translateX(-50%) rotate(-1.5deg); }
  50% { transform: translateX(-50%) rotate(2deg); }
}

@keyframes line-flicker {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@keyframes flow-rise {
  0% { opacity: 0; transform: translateY(10px); }
  30% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-36px); }
}
</style>
