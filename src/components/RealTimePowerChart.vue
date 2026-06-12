<template>
  <div ref="chartRef" class="chart-wrapper"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useEmsStore } from '../stores/emsStore'

const MAX_POINTS = 60

const chartRef = ref(null)
const emsStore = useEmsStore()
let chart = null
const loadLegendName = '關鍵負載'

const timeLabels = []
const gridData = []
const pvData = []
const essData = []
const genData = []
const loadData = []

const formatTime = (date) =>
  date.toLocaleTimeString('zh-TW', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

const pushPoint = () => {
  timeLabels.push(formatTime(new Date()))
  gridData.push(Number(emsStore.gridPower || 0).toFixed(1))
  pvData.push(Number(emsStore.pvPower || 0).toFixed(1))
  essData.push(Number(emsStore.essPower || 0).toFixed(1))
  genData.push(Number(emsStore.genPower || 0).toFixed(1))
  loadData.push(Number(emsStore.loadPower || 0).toFixed(1))

  if (timeLabels.length > MAX_POINTS) {
    timeLabels.shift()
    gridData.shift()
    pvData.shift()
    essData.shift()
    genData.shift()
    loadData.shift()
  }

  updateChart()
}

const buildOption = () => ({
  tooltip: {
    trigger: 'axis',
    valueFormatter: (value) => `${value} kW`
  },
  legend: {
    data: ['市電', '太陽光電', '儲能系統', '柴油發電機', loadLegendName],
    top: 0
  },
  grid: { left: 50, right: 24, top: 48, bottom: 32 },
  xAxis: {
    type: 'category',
    name: '時間',
    data: timeLabels,
    boundaryGap: false,
    axisLabel: { rotate: timeLabels.length > 20 ? 45 : 0 }
  },
  yAxis: {
    type: 'value',
    name: '功率 (kW)',
    scale: true
  },
  series: [
    {
      name: '市電',
      type: 'line',
      data: gridData,
      color: '#409eff',
      smooth: true,
      showSymbol: false
    },
    {
      name: '太陽光電',
      type: 'line',
      data: pvData,
      color: '#e6a23c',
      smooth: true,
      showSymbol: false
    },
    {
      name: '儲能系統',
      type: 'line',
      data: essData,
      color: '#67c23a',
      smooth: true,
      showSymbol: false
    },
    {
      name: '柴油發電機',
      type: 'line',
      data: genData,
      color: '#909399',
      smooth: true,
      showSymbol: false
    },
    {
      name: loadLegendName,
      type: 'line',
      data: loadData,
      color: '#f56c6c',
      smooth: true,
      showSymbol: false,
      lineStyle: { type: 'dashed' }
    }
  ]
})

const updateChart = () => {
  if (!chart) return
  chart.setOption({
    xAxis: {
      data: timeLabels,
      axisLabel: { rotate: timeLabels.length > 20 ? 45 : 0 }
    },
    series: [
      { data: gridData },
      { data: pvData },
      { data: essData },
      { data: genData },
      { data: loadData }
    ]
  })
}

const handleResize = () => chart?.resize()

watch(
  () => [
    emsStore.gridPower,
    emsStore.pvPower,
    emsStore.essPower,
    emsStore.genPower,
    emsStore.loadPower
  ],
  () => pushPoint()
)

onMounted(() => {
  chart = echarts.init(chartRef.value)
  chart.setOption(buildOption())
  pushPoint()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 380px;
}
</style>
