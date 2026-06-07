import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEmsStore = defineStore('ems', () => {
  // 狀態變數定義 (統一命名，與 Dashboard 和單線圖完全對齊)
  const currentMode = ref(1) // 1: 併網, 2: 孤島, 3: 儲能+柴發, 4: 純柴發
  const pvPower = ref(52.5)
  const essPower = ref(0)
  const genPower = ref(0)    // 柴油發電機
  const loadPower = ref(70.0) // 夢翔館緊急負載 (基準 70kW)
  const gridPower = ref(0)
  const soc = ref(35.0)      // 電池電量

  // 模擬數據跳動與電力平衡邏輯
  const fetchEmsData = () => {
    // 1. 負載與太陽能隨機微幅震盪
    loadPower.value = 70.0 + (Math.random() * 5- 1)
    pvPower.value = 52.0 + (Math.random() * 30 - 1.5)

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
      genPower.value = 150.0 + (Math.random() * 2 - 1) // 柴發啟動出大電力

      // 柴發+光電扣除負載後，剩餘充入儲能 (通常為負值充電)
      const totalGen = pv + genPower.value
      essPower.value = load - totalGen 

      if (essPower.value < 0) soc.value += 0.2
      if (soc.value >= 70) currentMode.value = 2 // 充飽後回到情境二
    }
    else if (currentMode.value === 4) {
      // 情境四：純柴發離網
      gridPower.value = 0
      essPower.value = 0
      genPower.value = Math.max(0, load - pv)
    }

    // 確保 SOC 邊界防護
    soc.value = Math.max(0, Math.min(100, soc.value))
  }

  return {
    currentMode, pvPower, essPower, genPower, loadPower, gridPower, soc, fetchEmsData
  }
})