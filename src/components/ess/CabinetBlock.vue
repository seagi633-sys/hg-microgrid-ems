<template>
  <div class="cabinet-inner">
    <div class="cabinet-header">
      <span class="cabinet-led" />
      <span class="cabinet-label">{{ labelPrefix }}-{{ n }}</span>
    </div>
    <div class="cabinet-body">
      <div class="vent-column">
        <span v-for="v in 6" :key="v" class="vent-slot" />
      </div>
      <div class="soc-vertical">
        <div class="soc-fill" :style="{ height: `${soc}%` }" />
      </div>
    </div>
    <div class="cabinet-base" />
  </div>
</template>

<script setup>
defineProps({
  n: { type: Number, required: true },
  labelPrefix: { type: String, required: true },
  soc: { type: Number, default: 0 }
})
</script>

<style scoped>
.cabinet-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cabinet-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 8px 5px;
  background: linear-gradient(180deg, #ff4081 0%, #f50057 100%);
}

.cabinet-led {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #ffeb3b;
  box-shadow: 0 0 13px #ffeb3b;
}

.cabinet-label {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.05em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  white-space: nowrap;
}

.cabinet-body {
  flex: 1;
  display: flex;
  gap: 5px;
  margin: 8px 7px;
  min-height: 0;
}

.vent-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  padding: 5px 3px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.vent-slot {
  height: 5px;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.15));
}

.soc-vertical {
  width: 13px;
  border-radius: 7px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}

.soc-fill {
  width: 100%;
  background: linear-gradient(180deg, #76ff03 0%, #00e676 100%);
  border-radius: 5px;
  transition: height 0.6s ease;
  box-shadow: 0 0 10px rgba(118, 255, 3, 0.6);
}

.cabinet-base {
  height: 10px;
  background: linear-gradient(180deg, #ffd600 0%, #ffab00 100%);
}
</style>
