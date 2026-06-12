<template>
  <div class="pv-page">
    <SiteHeader />

    <el-card class="page-header-card">
      <template #header>
        <div class="page-header">
          <div>
            <span class="page-title">光電預測範例頁面</span>
            <div class="site-name">{{ emsStore.selectedSite.name }}</div>
          </div>
          <el-tag type="success" effect="light">Demo</el-tag>
        </div>
      </template>
      <el-row :gutter="12" align="middle">
        <el-col :xs="24" :md="10">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="選擇預測日期"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-col>
        <el-col :xs="24" :md="14" class="header-note">
          依據天氣、日照與歷史資料估算當日光電出力，供 EMS 調度參考。
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="summary-card">
          <div class="metric-label">預測總發電量</div>
          <div class="metric-value">{{ totalForecastEnergy }} kWh</div>
          <div class="metric-sub">06:00 ~ 18:00 累積</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="summary-card">
          <div class="metric-label">預測尖峰功率｜光電裝置容量 {{ emsStore.selectedSite.pvCapacityKw }} kWp</div>
          <div class="metric-value">{{ peakForecastPower }} kW</div>
          <div class="metric-sub">{{ peakHour }} 時段 kWp</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="summary-card">
          <div class="metric-label">預測可信度</div>
          <div class="metric-value">{{ forecastConfidence }}%</div>
          <el-progress
            :percentage="forecastConfidence"
            :stroke-width="10"
            :show-text="false"
            status="success"
          />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="15">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">分時光電預測</div>
          </template>
          <el-table :data="forecastRows" stripe>
            <el-table-column prop="time" label="時段" width="120" />
            <el-table-column prop="weather" label="天氣" width="120" />
            <el-table-column prop="irradiance" label="日照 (W/m²)" />
            <el-table-column prop="power" label="預測功率 (kW)" />
            <el-table-column prop="note" label="備註" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="9">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">預測條件</div>
          </template>
          <div class="info-item">
            <span class="info-key">站點位置</span>
            <span class="info-value">{{ emsStore.selectedSite.location }}</span>
          </div>
          <div class="info-item">
            <span class="info-key">模組容量</span>
            <span class="info-value">{{ emsStore.selectedSite.pvCapacityKw }} kWp</span>
          </div>
          <div class="info-item">
            <span class="info-key">逆變器效率</span>
            <span class="info-value">97%</span>
          </div>
          <div class="info-item">
            <span class="info-key">氣象來源</span>
            <span class="info-value">中央氣象署預報 + 現地修正</span>
          </div>
          <el-alert
            title="此頁為範例畫面，可再串接後端預測 API。"
            type="info"
            :closable="false"
            show-icon
            class="mt-12"
          />
        </el-card>
      </el-col>
    </el-row>

    <el-card class="cwa-card">
      <template #header>
        <div class="card-header cwa-header">
          <span>臺南地區即時日射量（中央氣象署署屬氣象站）</span>
          <el-button size="small" type="primary" plain :loading="cwaLoading" @click="fetchSolarRadiation">
            重新整理
          </el-button>
        </div>
      </template>
      <el-alert
        v-if="cwaError"
        :title="cwaError"
        type="error"
        :closable="false"
        show-icon
      />
      <el-table v-else :data="cwaStations" stripe v-loading="cwaLoading">
        <el-table-column prop="name" label="測站" width="160" />
        <el-table-column prop="id" label="測站代碼" width="140" />
        <el-table-column prop="time" label="觀測時間" />
        <el-table-column prop="radiation" label="累積日射量 (MJ/m²)" width="200" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useEmsStore } from '../stores/emsStore'
import SiteHeader from '../components/SiteHeader.vue'

const emsStore = useEmsStore()

const selectedDate = ref(new Date().toISOString().slice(0, 10))

// 各時段出力比（相對裝置容量），各案場依自身容量換算
const hourlyProfile = [
  { time: '06:00', weather: '多雲', irradiance: 120, ratio: 0.064, note: '日照初升' },
  { time: '08:00', weather: '晴時多雲', irradiance: 360, ratio: 0.252, note: '快速爬升' },
  { time: '10:00', weather: '晴朗', irradiance: 620, ratio: 0.511, note: '穩定輸出' },
  { time: '12:00', weather: '晴朗', irradiance: 780, ratio: 0.673, note: '接近峰值' },
  { time: '14:00', weather: '局部雲', irradiance: 690, ratio: 0.565, note: '短暫遮蔽' },
  { time: '16:00', weather: '多雲', irradiance: 380, ratio: 0.273, note: '午後下降' },
  { time: '18:00', weather: '陰', irradiance: 90, ratio: 0.041, note: '接近日落' }
]

// 各案場微氣候修正係數與預測可信度（佳里／南化／麻豆日照條件略異）
const siteFactors = {
  'jiali-junior-high': { irradianceFactor: 1.0, confidence: 87 },
  'ruifeng-elementary': { irradianceFactor: 0.95, confidence: 82 },
  'zengwen-vision-park': { irradianceFactor: 1.04, confidence: 90 }
}

const siteFactor = computed(() => siteFactors[emsStore.selectedSite.id] || siteFactors['jiali-junior-high'])

const forecastRows = computed(() => {
  const cap = Number(emsStore.selectedSite.pvCapacityKw || 0)
  const factor = siteFactor.value.irradianceFactor
  return hourlyProfile.map((p) => ({
    time: p.time,
    weather: p.weather,
    irradiance: Math.round(p.irradiance * factor),
    power: Number((cap * p.ratio * factor).toFixed(1)),
    note: p.note
  }))
})

const totalForecastEnergy = computed(() => {
  const totalPower = forecastRows.value.reduce((sum, row) => sum + Number(row.power || 0), 0)
  return (totalPower * 2).toFixed(1)
})

const peakRow = computed(() => {
  return forecastRows.value.reduce((peak, row) => (row.power > peak.power ? row : peak), forecastRows.value[0])
})

const peakForecastPower = computed(() => Number(peakRow.value.power || 0).toFixed(1))
const peakHour = computed(() => peakRow.value.time)
const forecastConfidence = computed(() => siteFactor.value.confidence)

// === 中央氣象署日射量（資料集 O-A0091-001：署屬氣象站日射量資料）===
// 此資料集為檔案型開放資料，fileapi 會轉址至下列公開 JSON（支援 CORS，可直接抓取）
const CWA_URL = 'https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0091-001.json'

const cwaStations = ref([])
const cwaError = ref('')
const cwaLoading = ref(false)

const fetchSolarRadiation = async () => {
  cwaLoading.value = true
  cwaError.value = ''
  try {
    const res = await fetch(CWA_URL)
    if (!res.ok) throw new Error(`API 請求失敗，錯誤代碼: ${res.status}`)
    const data = await res.json()

    const stations = data?.cwaopendata?.dataset?.Station || []
    const rows = stations.map((s) => {
      const rad = Number(s.WeatherElement?.SolarRadiation)
      return {
        name: s.StationName || '',
        id: s.StationId || '',
        time: (s.ObsTime?.DateTime || '').replace('T', ' ').slice(0, 19),
        // -99 為缺值；負值代表無有效觀測
        radiation: Number.isNaN(rad) || rad < 0 ? '無資料' : rad.toFixed(2)
      }
    })

    // 只保留臺南地區測站（臺南、永康），若無符合則顯示全部供參考
    const tainanRows = rows.filter(
      (row) => row.name.includes('臺南') || row.name.includes('台南') || row.name.includes('永康')
    )
    cwaStations.value = tainanRows.length > 0 ? tainanRows : rows
  } catch (err) {
    cwaError.value = err.message || '無法取得氣象署日射量資料'
    cwaStations.value = []
  } finally {
    cwaLoading.value = false
  }
}

onMounted(() => {
  fetchSolarRadiation()
})
</script>

<style scoped>
.pv-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.site-name {
  margin-top: 4px;
  font-size: 15px;
  font-weight: 600;
  color: #e6a23c;
}

.cwa-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.header-note {
  color: #606266;
  font-size: 14px;
}

.summary-card {
  border-left: 4px solid #e6a23c;
}

.metric-label {
  color: #909399;
  font-size: 13px;
}

.metric-value {
  margin: 6px 0;
  font-size: 30px;
  font-weight: 700;
  color: #303133;
}

.metric-sub {
  color: #606266;
  font-size: 13px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.info-card,
.table-card {
  height: 100%;
}

.info-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.info-key {
  color: #909399;
}

.info-value {
  color: #303133;
  text-align: right;
}

.mt-12 {
  margin-top: 12px;
}
</style>
