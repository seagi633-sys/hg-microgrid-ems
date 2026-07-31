<template>
  <div class="pcs-inner" :class="{ active: active }">
    <div class="pcs-header">
      <span class="pcs-led" />
      <span class="pcs-label">PCS-{{ n }}</span>
    </div>
    <div class="pcs-body">
      <div class="acdc-symbol" aria-label="AC DC converter">
        <div class="acdc-ac">AC</div>
        <svg class="acdc-wave" viewBox="0 0 48 14" aria-hidden="true">
          <path d="M2 8 C10 0 18 0 24 7 C30 14 38 14 46 6" />
        </svg>
        <div class="acdc-divider" />
        <div class="acdc-dc">DC</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  n: { type: Number, required: true },
  active: { type: Boolean, default: false }
})
</script>

<style scoped>
.pcs-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 8px 8px 5px 5px;
  overflow: hidden;
  background: linear-gradient(180deg, #ff8f00 0%, #ef6c00 100%);
  border: 3px solid #ffb74d;
  box-shadow: 0 5px 13px rgba(0, 0, 0, 0.22);
}

.pcs-inner.active {
  box-shadow: 0 0 12px rgba(255, 183, 77, 0.75);
}

.pcs-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 8px 5px;
  background: linear-gradient(180deg, #5d4037 0%, #4e342e 100%);
}

.pcs-led {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #bdbdbd;
  box-shadow: 0 0 5px rgba(189, 189, 189, 0.6);
}

.pcs-inner.active .pcs-led {
  background: #76ff03;
  box-shadow: 0 0 8px #76ff03;
  animation: pcs-led-blink 1s ease-in-out infinite;
}

.pcs-label {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.05em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  white-space: nowrap;
}

.pcs-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 3px;
  min-height: 0;
}

.acdc-symbol {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: min(54px, 82%);
  aspect-ratio: 1;
  padding: 5px 6px;
  box-sizing: border-box;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.95);
  background: rgba(255, 143, 0, 0.28);
  box-shadow:
    inset 0 0 8px rgba(255, 255, 255, 0.12),
    0 2px 5px rgba(0, 0, 0, 0.2);
}

.acdc-ac,
.acdc-dc {
  font-family: Arial, sans-serif;
  font-size: 13px;
  font-weight: 900;
  line-height: 0.9;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.38);
}

.acdc-wave {
  width: 74%;
  height: 11px;
  margin: 1px 0 0;
}

.acdc-wave path {
  fill: none;
  stroke: #fff;
  stroke-width: 4;
  stroke-linecap: round;
}

.acdc-divider {
  width: 74%;
  height: 3px;
  margin: 1px 0 2px;
  border-radius: 3px;
  background: #fff;
}

@keyframes pcs-led-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.78; }
}
</style>
