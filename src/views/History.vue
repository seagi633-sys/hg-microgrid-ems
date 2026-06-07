<template>
  <div class="history-container">
    <el-card shadow="sm" class="chart-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">📈 微電網 24 小時歷史功率曲線分析</span>
        </div>
      </template>
      <div ref="chartRef" class="chart-wrapper"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
let myChart = null

// 模擬 24 小時歷史數據
const generateMockData = () => {
  const timeAxis = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
  
  // 設定情境模式 (1:併網, 2:孤島, 3:儲能+柴發, 4:純柴發)
  const modeData = timeAxis.map((_, i) => {
    if (i < 8) return 1
    if (i < 14) return 2
    if (i < 18) return 3
    return 4
  })

  // 模擬各設備功率
  const loadData = timeAxis.map(() => Number((70 + Math.random() * 5).toFixed(1)))
  const pvData = timeAxis.map((_, i) => (i > 6 && i < 18 ? Number((Math.sin(((i - 6) / 12) * Math.PI) * 100).toFixed(1)) : 0))
  const gridData = timeAxis.map((_, i) => (modeData[i] === 1 ? Math.max(0, loadData[i] - pvData[i]) : 0))
  const essData = timeAxis.map((_, i) => (modeData[i] === 2 ? Number((loadData[i] - pvData[i]).toFixed(1)) : 0))
  const genData = timeAxis.map((_, i) => (modeData[i] >= 3 ? 120 : 0))

  return { timeAxis, modeData, loadData, pvData, gridData, essData, genData }
}

const initChart = () => {
  if (!chartRef.value) return;
  myChart = echarts.init(chartRef.value);
  const data = generateMockData();

  // 1. 定義顏色與名稱
  const modeColors = { 1: '#b3e19d', 2: '#a0cfff', 3: '#fab6b6', 4: '#dcdfe6' };
  const modeNames = { 1: '情境一：併網', 2: '情境二：孤島', 3: '情境三：儲能+柴發', 4: '情境四：純柴發' };

  // 2. 建立 markArea 區域
  const markAreas = [];
  let start = 0;
  for (let i = 0; i <= 24; i++) {
    if (i === 24 || data.modeData[i] !== data.modeData[start]) {
      markAreas.push([
        { 
          name: modeNames[data.modeData[start]], // 這裡的 name 會顯示在圖例
          xAxis: data.timeAxis[start],
          itemStyle: { color: modeColors[data.modeData[start]], opacity: 0.3 }
        },
        { xAxis: data.timeAxis[i] || '24:00' }
      ]);
      start = i;
    }
  }

  const option = {
    tooltip: { trigger: 'axis' },
    // 💡 關鍵：將情境名稱加入 legend
    legend: { 
      data: ['市電', '太陽光電', '儲能', '柴油發電機', '負載', '情境一：併網', '情境二：孤島', '情境三：儲能+柴發', '情境四：純柴發'],
      top: '5%' 
    },
    xAxis: { type: 'category', data: data.timeAxis, boundaryGap: false },
    yAxis: { type: 'value', name: '功率 (kW)' },
    series: [
      { name: '市電', type: 'line', data: data.gridData, color: '#409eff', smooth: true },
      { name: '太陽光電', type: 'line', data: data.pvData, color: '#e6a23c', smooth: true },
      { name: '儲能', type: 'line', data: data.essData, color: '#67c23a', smooth: true },
      { name: '柴油發電機', type: 'line', data: data.genData, color: '#909399', smooth: true },
      { name: '負載', type: 'line', data: data.loadData, color: '#f56c6c', smooth: true, lineStyle: { type: 'dashed' } },
      {
        name: '情境顯示',
        type: 'line',
        data: [], // 隱形線條用於顯示 markArea
        markArea: {
          silent: true,
          data: markAreas // 💡 確保數據傳入這裡
        }
      }
    ]
  };
  myChart.setOption(option);
};

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => myChart?.resize())
})

onUnmounted(() => {
  myChart?.dispose()
  window.removeEventListener('resize', () => myChart?.resize())
})
</script>

<style scoped>
.history-container { padding: 20px; background-color: #f5f7fa; min-height: 80vh; }
.chart-wrapper { width: 100%; height: 500px; }
.header-title { font-weight: 600; font-size: 16px; }
</style>