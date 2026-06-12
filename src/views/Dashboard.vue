<template>
  <div class="dashboard-container">
    <SiteHeader />

    <el-card class="mode-selector-card selector-card">
      <div class="selector-row">
        <div class="selector-inline-label">情境選擇</div>
        <el-radio-group v-model="emsStore.currentMode" size="large" class="mode-radio-group">
          <el-radio-button :value="1">情境一：市電正常（光電併網運轉）</el-radio-button>
          <el-radio-button :value="2">情境二：市電異常（儲能孤島供電）</el-radio-button>
          <el-radio-button :value="3">情境三：市電異常（儲能 + 柴油發電機）</el-radio-button>
          <el-radio-button :value="4">情境四：市電與儲能異常（光電+柴油發電機）</el-radio-button>
          <el-radio-button :value="5">情境五：夜尖峰時段（儲能供電）</el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <el-row :gutter="16" class="data-cards-row">
      <el-col :xs="24" :sm="12" :md="8" :lg="4">
        <el-card shadow="hover" class="data-card grid-card">
          <div class="card-body">
            <div class="card-label">市電饋線功率</div>
            <div class="card-value">{{ Number(emsStore.gridPower || 0).toFixed(1) }} kW</div>
            <div class="card-status">
              <el-tag :type="emsStore.currentMode === 1 ? 'success' : 'info'" effect="light">
                {{ emsStore.currentMode === 1 ? '併網供電中' : '已安全隔離' }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8" :lg="5">
        <el-card shadow="hover" class="data-card pv-card">
          <div class="card-body">
            <div class="card-label">太陽光電發電</div>
            <div class="metric-label">既設容量 {{ emsStore.selectedSite.pvCapacityKw }} kW</div>
            <div class="card-value">{{ Number(emsStore.pvPower || 0).toFixed(1) }} kW</div>
            <div class="card-status">
              <el-tag :type="emsStore.pvPower > 0.5 ? 'warning' : 'info'" effect="light">
                {{ emsStore.pvPower > 0.5 ? '綠電發電中' : '無日照待命' }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8" :lg="5">
        <el-card shadow="hover" class="data-card ess-card">
          <div class="card-body">
            <div class="card-label">儲能系統狀態</div>
            <div class="card-value">
              <span v-if="Number(emsStore.essPower) > 0.1" class="text-discharge">放電 </span>
              <span v-else-if="Number(emsStore.essPower) < -0.1" class="text-charge">充電 </span>
              <span v-else>待命 </span>
              {{ Math.abs(Number(emsStore.essPower || 0)).toFixed(1) }} kW
            </div>
            <div class="soc-section">
              <div class="soc-header">
                <span class="soc-label">電池電量 (SoC)</span>
                <span class="soc-num">{{ Number(emsStore.soc || 0).toFixed(0) }}%</span>
              </div>
              <el-progress 
                :percentage="Math.min(100, Math.max(0, Math.round(Number(emsStore.soc || 0))))" 
                :status="emsStore.soc < 30 ? 'exception' : emsStore.soc > 90 ? 'warning' : 'success'"
                :show-text="false"
              />
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8" :lg="5">
        <el-card shadow="hover" class="data-card genset-card">
          <div class="card-body">
            <div class="card-label">應變柴油發電機</div>
            <div class="card-value">{{ Number(emsStore.genPower || 0).toFixed(1) }} kW</div>
            <div class="card-status">
              <el-tag :type="emsStore.genPower > 0.5 ? 'danger' : 'info'" effect="light">
                {{ emsStore.genPower > 0.5 ? '應變出力中' : '自動備援待命' }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8" :lg="5">
        <el-card shadow="hover" class="data-card load-card">
          <div class="card-body">
            <div class="card-label">{{ emsStore.selectedSite.loadLabel }}</div>
            <div class="card-value">{{ Number(emsStore.loadPower || 0).toFixed(1) }} kW</div>
            <div class="card-status">
              <el-tag type="primary" effect="dark">緊急負載不斷電監控</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="sld-card">
      <template #header>
        <div class="card-header">
          <span>📊 微電網系統即時單線圖</span>
        </div>
      </template>
      <SingleLineDiagram />
    </el-card>

    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span>📈 各設備即時功率曲線（每 2 秒更新）</span>
        </div>
      </template>
      <RealTimePowerChart />
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useEmsStore } from '../stores/emsStore'
import SiteHeader from '../components/SiteHeader.vue'
import SingleLineDiagram from '../components/SingleLineDiagram.vue'
import RealTimePowerChart from '../components/RealTimePowerChart.vue'

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
.dashboard-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.selector-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.mode-selector-card {
  border-left: 4px solid #67c23a;
}

.card-header {
  font-weight: 700;
  font-size: 20px;
  color: #303133;
  text-align: center;
}

.selector-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.selector-inline-label {
  flex: 0 0 auto;
  min-width: 76px;
  padding-top: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  white-space: nowrap;
}

.mode-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
}

@media (max-width: 992px) {
  .selector-row {
    flex-direction: column;
  }

  .selector-inline-label {
    padding-top: 0;
  }
}

.sld-card { box-shadow: 0 2px 12px rgba(0,0,0,0.03); }
.chart-card { box-shadow: 0 2px 12px rgba(0,0,0,0.03); }
.data-cards-row { margin-bottom: 4px; }
.data-card { height: 100%; border-radius: 6px; transition: all 0.3s; }
.card-body { display: flex; flex-direction: column; gap: 12px; }
.card-label { font-size: 12px; color: #909399; font-weight: 500; }
.card-value { font-size: 22px; font-weight: 700; color: #303133; line-height: 1.2; }
.text-discharge { color: #e6a23c; }
.text-charge { color: #67c23a; }
.soc-section { margin-top: 4px; }
.soc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.soc-label { font-size: 14px; color: #909399; }
.soc-num { font-size: 30px; font-weight: bold; color: #67c23a; }
.grid-card { border-left: 4px solid #409eff; }
.pv-card { border-left: 4px solid #e6a23c; }
.ess-card { border-left: 4px solid #67c23a; }
.genset-card { border-left: 4px solid #909399; }
.load-card { border-left: 4px solid #f56c6c; }
</style>