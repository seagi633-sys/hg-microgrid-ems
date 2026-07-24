<template>
  <div class="pcs-inner" :class="{ active: active }">
    <div class="pcs-header">
      <span class="pcs-led" />
      <span class="pcs-label">PCS-{{ n }}</span>
    </div>
    <div class="pcs-body">
      <div class="pcs-symbol">
        <span class="dc-side">DC</span>
        <span class="arrow">⇄</span>
        <span class="ac-side">AC</span>
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

.pcs-symbol {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.dc-side,
.ac-side {
  padding: 1px 4px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
}

.arrow {
  font-size: 10px;
  opacity: 0.9;
}

@keyframes pcs-led-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.78; }
}
</style>
