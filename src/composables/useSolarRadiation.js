import { onMounted, ref } from 'vue'

const CWA_URL = 'https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0091-001.json'

export function useSolarRadiation() {
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
          radiation: Number.isNaN(rad) || rad < 0 ? null : rad
        }
      })

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

  return {
    cwaStations,
    cwaError,
    cwaLoading,
    fetchSolarRadiation
  }
}

/** 依觀測時段與累積日射量估算即時日照強度 W/m² */
export function estimateInstantIrradiance(cumulativeMj, date = new Date()) {
  const hour = date.getHours() + date.getMinutes() / 60
  if (hour < 6 || hour > 18) return 0

  const daylightFactor = Math.sin(((hour - 6) / 12) * Math.PI)
  const base = cumulativeMj != null && cumulativeMj > 0
    ? Math.min(980, cumulativeMj * 42)
    : 650

  return Math.round(Math.max(0, base * daylightFactor))
}
