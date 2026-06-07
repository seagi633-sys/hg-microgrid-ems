import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEmsStore = defineStore('ems', () => {
  // 運轉模式：1-市電正常, 2-儲能離網, 3-儲能+柴發, 4-完全柴發
  const currentMode = ref(1) 
  
  // 即時電力數據
  const pvPower = ref(52.4)     // 太陽能發電功率 (kW)
  const essPower = ref(-15.2)   // 儲能充放電功率 (kW, 負代表充電, 正代表放電)
  const essSoc = ref(65.0)      // 儲能電量百分比 (SOC %)
  const gensetPower = ref(0)    // 柴油發電機即時功率 (kW)
  const loadPower = ref(36.8)   // 夢翔館緊急負載 (kW)
  const gridPower = ref(0)      // 市電功率 (kW, 正=輸入, 負=逆送)

  // 模擬地端 EMS 即時更新數據的函式
  const fetchEmsData = () => {
    // 模擬數據微幅跳動
    pvPower.value = +(pvPower.value + (Math.random() - 0.5) * 2).toFixed(1)
    loadPower.value = +(loadPower.value + (Math.random() - 0.5) * 1).toFixed(1)
    
    // 情境邏輯模擬
    if (currentMode.value === 1) {
      gensetPower.value = 0
      const deficit = loadPower.value - pvPower.value
      if (deficit > 0) {
        // 負載 > 太陽能：儲能優先放電，不足由市電補足
        const essDischarge = Math.min(deficit, 150)
        essPower.value = +essDischarge.toFixed(1)
        gridPower.value = +(deficit - essDischarge).toFixed(1)
      } else {
        // 太陽能 >= 負載：餘電優先充儲能（約 70%），其餘逆送市電
        const surplus = -deficit
        const essCharge = Math.min(surplus * 0.7, 150, (95 - essSoc.value) * 3)
        essPower.value = +(-essCharge).toFixed(1)
        gridPower.value = +(-(surplus - essCharge)).toFixed(1)
      }
    } else if (currentMode.value === 2) {
      gridPower.value = 0
      gensetPower.value = 0
      essSoc.value = +(essSoc.value - 0.1).toFixed(1) // 離網放電中
      if (essSoc.value <= 30) {
        currentMode.value = 3 // 低於 30% 自動切換到情境三（啟動柴發）
      }
    } else if (currentMode.value === 3) {
      gridPower.value = 0
      gensetPower.value = 150.0 // 柴發全力發電
      essSoc.value = +(essSoc.value + 0.2).toFixed(1) // 幫電池充電
      if (essSoc.value >= 70) {
        currentMode.value = 2 // 充飽到 70% 柴發關閉，回到情境二
      }
    } else if (currentMode.value === 4) {
      gridPower.value = 0
      gensetPower.value = +(loadPower.value + 10).toFixed(1) // 純柴發供電
      essPower.value = 0
    }
  }

  return {
    currentMode,
    pvPower,
    essPower,
    essSoc,
    gensetPower,
    loadPower,
    gridPower,
    fetchEmsData
  }
})