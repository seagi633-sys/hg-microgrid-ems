<template>
  <div class="microgrid-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <h1 style="color: #303133;">臺南七股佳里國中後港校區 — 防災微電網智慧 EMS 監控系統</h1>
        <el-alert title="運轉情境模擬控制面板" type="info" :closable="false" style="margin-bottom: 20px;">
          <el-radio-group v-model="emsStore.currentMode" size="large">
            <el-radio-button :label="1">情境一：市電正常 (併網運轉)</el-radio-button>
            <el-radio-button :label="2">情境二：市電異常 (儲能孤島供電)</el-radio-button>
            <el-radio-button :label="3">情境三：電力不足 (儲能 + 柴發啟動)</el-radio-button>
            <el-radio-button :label="4">情境四：儲能異常 (純柴發離網模式)</el-radio-button>
          </el-radio-group>
        </el-alert>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header><b style="color: #303133;">系統單線圖 (Single-Line Diagram)</b></template>
          <SingleLineDiagram />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="status-card pv-card">
          <template #header><b style="color: #e6a23c;">☀️ 既有太陽光電 (132kWp)</b></template>
          <div class="card-value">{{ emsStore.pvPower }} <small>kW</small></div>
          <el-tag type="warning">逆變器運轉中 (3台)</el-tag>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="status-card ess-card">
          <template #header><b style="color: #67c23a;">🔋 儲能系統 (600kW/1316kWh)</b></template>
          <div class="card-value">{{ emsStore.essPower }} <small>kW</small></div>
          <div style="margin: 10px 0;">
            <span>電池電量 (SOC)：</span>
            <el-progress :percentage="emsStore.essSoc" :status="emsStore.essSoc < 35 ? 'exception' : 'success'" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="status-card genset-card">
          <template #header><b style="color: #909399;">⚙️ 應變柴油發電機 (200kW)</b></template>
          <div class="card-value">{{ emsStore.gensetPower }} <small>kW</small></div>
          <el-tag :type="emsStore.gensetPower > 0 ? 'danger' : 'info'">
            {{ emsStore.gensetPower > 0 ? '發電機已發動 (950L油箱庫存)' : '待命備用' }}
          </el-tag>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="status-card load-card">
          <template #header><b style="color: #f56c6c;">🏢 緊急救災負載 (夢翔館)</b></template>
          <div class="card-value">{{ emsStore.loadPower }} <small>kW</small></div>
          <el-tag type="success">防災避難所正常供電</el-tag>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useEmsStore } from '../stores/emsStore'
import SingleLineDiagram from '../components/SingleLineDiagram.vue'

const emsStore = useEmsStore()
let timer = null

onMounted(() => {
  emsStore.fetchEmsData()
  timer = setInterval(() => {
    emsStore.fetchEmsData()
  }, 2000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.microgrid-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}
.status-card {
  text-align: center;
  height: 220px;
}
.card-value {
  font-size: 32px;
  font-weight: bold;
  margin: 20px 0;
  color: #303133;
}
.pv-card { border-top: 5px solid #e6a23c; }
.ess-card { border-top: 5px solid #67c23a; }
.genset-card { border-top: 5px solid #909399; }
.load-card { border-top: 5px solid #f56c6c; }
</style>