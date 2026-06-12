import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useEmsStore = defineStore('ems', () => {
  const siteOptions = [
    {
      id: 'jiali-junior-high',
      name: '臺南市佳里國中小型防災微電網',
      location: '臺南市佳里區',
      pvCapacityKw: 132,
      essPowerKw: 600,
      essEnergyKwh: 1316,
      genCapacityKw: 200,
      loadLabel: '夢翔館救災負載',
      loadDeviceTitle: '夢翔館',
      loadDeviceSub: '緊急避難所',
      loadBaseKw: 70
    },
    {
      id: 'ruifeng-elementary',
      name: '臺南市瑞峰國小小型防災微電網',
      location: '臺南市南化區',
      pvCapacityKw: 91.12,
      essPowerKw: 600,
      essEnergyKwh: 1200,
      genCapacityKw: 60,
      loadLabel: '瑞峰國小關鍵負載',
      loadDeviceTitle: '瑞峰國小',
      loadDeviceSub: '緊急避難所',
      loadBaseKw: 55
    },
    {
      id: 'zengwen-vision-park',
      name: '臺南市曾文市政願景園區小型防災微電網',
      location: '臺南市麻豆區',
      pvCapacityKw: 497.39,
      essPowerKw: 1000,
      essEnergyKwh: 1800,
      genCapacityKw: 200,
      loadLabel: '曾文園區關鍵負載',
      loadDeviceTitle: '致遠樓',
      loadDeviceSub: '緊急避難所',
      loadBaseKw: 180
    }
  ]

  // 狀態變數定義 (統一命名，與 Dashboard 和單線圖完全對齊)
  const selectedSiteId = ref(siteOptions[0].id)
  const currentMode = ref(1) // 1: 併網, 2: 孤島, 3: 儲能+柴發, 4: 純柴發 5: 夜尖峰時段（儲能供電）
  const pvPower = ref(52.5)
  const essPower = ref(0)
  const genPower = ref(0) // 柴油發電機
  const loadPower = ref(siteOptions[0].loadBaseKw)
  const gridPower = ref(0)
  const soc = ref(35.0) // 電池電量

  const selectedSite = computed(() => {
    return siteOptions.find((site) => site.id === selectedSiteId.value) || siteOptions[0]
  })

  const setSite = (siteId) => {
    selectedSiteId.value = siteId
    currentMode.value = 1
    soc.value = 35
    gridPower.value = 0
    essPower.value = 0
    genPower.value = 0
    loadPower.value = selectedSite.value.loadBaseKw
    pvPower.value = Number((selectedSite.value.pvCapacityKw * 0.4).toFixed(1))
  }

  // 模擬數據跳動與電力平衡邏輯
  const fetchEmsData = () => {
    const site = selectedSite.value
    const loadBase = Number(site.loadBaseKw || 70)
    const pvCap = Number(site.pvCapacityKw || 0)
    const essPowerCap = Number(site.essPowerKw || 600)
    const genCap = Number(site.genCapacityKw || 200)

    // 1. 負載與太陽能隨機微幅震盪
    loadPower.value = loadBase + (Math.random() * loadBase * 0.12 - loadBase * 0.04)
    pvPower.value = Math.max(0, pvCap * 0.4 + (Math.random() * pvCap * 0.2 - pvCap * 0.1))

    const load = loadPower.value
    const pv = pvPower.value

    // 2. 依據不同情境計算電力平衡
    if (currentMode.value === 1) {
      // 情境一：市電正常 (市電不逆送)
      genPower.value = 0
      if (pv >= load) {
        // 太陽能充足：多餘電量充入儲能，市電為 0
        const surplus = pv - load
        essPower.value = -surplus 
        gridPower.value = 0       
      } else {
        // 太陽能不足：市電補足缺口
        const deficit = load - pv
        essPower.value = 0
        gridPower.value = deficit
      }
    }
    else if (currentMode.value === 2) {
      // 情境二：市電異常 (儲能孤島)
      gridPower.value = 0
      genPower.value = 0
      // 儲能負責補足缺額 (正值代表放電)
      essPower.value = load - pv

      if (essPower.value > 0) soc.value -= 0.1
      if (soc.value < 30) currentMode.value = 3 // 低電量自動啟動柴發
    }
    else if (currentMode.value === 3) {
      // 情境三：電力不足 (儲能 + 柴發)
      gridPower.value = 0
      genPower.value = Math.max(0, Math.min(genCap, load * 0.8 + (Math.random() * 8 - 4)))

      // 柴發+光電扣除負載後，剩餘充入儲能 (通常為負值充電)
      const totalGen = pv + genPower.value
      essPower.value = load - totalGen 

      if (essPower.value < 0) soc.value += 0.1
      if (soc.value >= 70) currentMode.value = 2 // 充飽後回到情境二
    }
    else if (currentMode.value === 4) {
      // 情境四：純柴發離網
      gridPower.value = 0
      essPower.value = 0
      genPower.value = Math.max(0, load - pv)
    }
    else if (currentMode.value === 5) {
      // 情境五：夜尖峰時段（儲能供電）
      pvPower.value = 0
      essPower.value = essPowerCap
      genPower.value = 0
      gridPower.value = essPower.value - load
      if (essPower.value > 0) soc.value -= 0.5
    }

    // 確保 SOC 邊界防護
    soc.value = Math.max(0, Math.min(100, soc.value))
  }

  return {
    siteOptions,
    selectedSiteId,
    selectedSite,
    setSite,
    currentMode,
    pvPower,
    essPower,
    genPower,
    loadPower,
    gridPower,
    soc,
    fetchEmsData
  }
})