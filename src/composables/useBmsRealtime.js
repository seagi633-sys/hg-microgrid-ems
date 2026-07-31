import { ref, computed, onMounted, onUnmounted, unref, watch } from 'vue'
import {
  BMS1_DEVICE_ID,
  BMS1_REALTIME_POINTS,
  buildBmsRealtimePoints,
  buildPcsFullRealtimePoints,
  buildPcsRealtimePoints,
  ESS_CABINET_COUNT,
  getBmsDeviceId,
  getPcsDeviceId,
  PCS1_DEVICE_ID,
  PCS1_REALTIME_POINTS,
  VPP_SITE_MAP
} from '../config/vppSites'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

function emptyPointState() {
  return { value: null, quality: '', recordedAt: '', error: '' }
}

function createEmptyPoints(pointsConfig) {
  return Object.fromEntries(pointsConfig.map((p) => [p.key, emptyPointState()]))
}

function formatFetchError(status, json) {
  if (status === 502 || status === 503) {
    return '後端 API 未啟動，請執行 npm run dev:api'
  }
  return json.error || `HTTP ${status}`
}

function parseNumericValue(data) {
  if (!data) return null
  const raw = data.numeric_value ?? data.value ?? data.point_value
  if (raw == null || raw === '') return null
  const num = Number(raw)
  return Number.isFinite(num) ? num : null
}

function formatIndexValue(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return ''
  return Number.isInteger(num) ? String(num) : String(num)
}

function buildIndexText(cfg, pointStates) {
  if (!Array.isArray(cfg.indexPointKeys) || cfg.indexPointKeys.length === 0) return ''
  const values = cfg.indexPointKeys.map((key) => formatIndexValue(pointStates[key]?.value))
  return values.every(Boolean) ? `(${values.join(',')})` : ''
}

async function fetchPoint(vppSiteId, deviceId, pointId) {
  const params = new URLSearchParams({
    site_id: vppSiteId,
    device_id: deviceId,
    point_id: pointId
  })
  const res = await fetch(`${API_BASE}/api/vpp/realtime/latest?${params}`)
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.ok) {
    throw new Error(formatFetchError(res.status, json))
  }
  const data = json.data || {}
  const value = parseNumericValue(data)
  if (value == null) {
    throw new Error('無法解析數值')
  }
  return {
    value,
    quality: data.quality || '',
    recordedAt: data.recorded_at || ''
  }
}

export function useVppDeviceRealtime(siteIdRef, deviceId, pointsConfig, deviceLabel, pollMs = 5000) {
  const loading = ref(false)
  const connectionError = ref('')
  const points = ref(createEmptyPoints(pointsConfig))

  let timer = null
  let requestSeq = 0

  const getVppSiteId = () => VPP_SITE_MAP[siteIdRef.value] || null

  const metrics = computed(() =>
    pointsConfig
      .filter((cfg) => !cfg.hidden)
      .map((cfg) => ({
        ...cfg,
        ...points.value[cfg.key],
        indexText: buildIndexText(cfg, points.value)
      }))
  )

  const latestRecordedAt = computed(() => {
    const times = metrics.value
      .map((item) => item.recordedAt)
      .filter(Boolean)
      .sort()
    return times.length ? times[times.length - 1] : ''
  })

  const hasAnyValue = computed(() =>
    metrics.value.some((item) => Number.isFinite(Number(item.value)))
  )

  const fetchAll = async () => {
    const vppSiteId = getVppSiteId()
    if (!vppSiteId) {
      loading.value = false
      connectionError.value = ''
      points.value = createEmptyPoints(pointsConfig)
      return
    }

    const seq = ++requestSeq
    loading.value = true

    try {
      const results = await Promise.allSettled(
        pointsConfig.map(async (cfg) => {
          const data = await fetchPoint(vppSiteId, deviceId, cfg.pointId)
          return { key: cfg.key, ...data }
        })
      )

      if (seq !== requestSeq) return

      const next = createEmptyPoints(pointsConfig)
      let successCount = 0

      results.forEach((result, index) => {
        const key = pointsConfig[index].key
        if (result.status === 'fulfilled') {
          next[key] = {
            value: result.value.value,
            quality: result.value.quality,
            recordedAt: result.value.recordedAt,
            error: ''
          }
          successCount += 1
        } else {
          next[key] = {
            ...emptyPointState(),
            error: result.reason?.message || '讀取失敗'
          }
        }
      })

      points.value = next
      connectionError.value = successCount === 0 ? `無法取得 ${deviceLabel} 即時資料` : ''
    } catch (err) {
      if (seq !== requestSeq) return
      connectionError.value = err.message || `無法取得 ${deviceLabel} 即時資料`
      points.value = createEmptyPoints(pointsConfig)
    } finally {
      if (seq === requestSeq) {
        loading.value = false
      }
    }
  }

  onMounted(() => {
    fetchAll()
    timer = setInterval(fetchAll, pollMs)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  watch(siteIdRef, () => {
    fetchAll()
  })

  const getPointValue = (key) => computed(() => {
    const value = points.value[key]?.value
    if (value == null || value === '') return null
    const num = Number(value)
    return Number.isFinite(num) ? num : null
  })

  return {
    loading,
    connectionError,
    points,
    metrics,
    latestRecordedAt,
    hasAnyValue,
    fetchAll,
    getPointValue
  }
}

export function useBmsNRealtime(siteIdRef, unitIndex, pollMs = 5000) {
  const realtime = useVppDeviceRealtime(
    siteIdRef,
    getBmsDeviceId(unitIndex),
    buildBmsRealtimePoints(unitIndex),
    `BMS-${unitIndex}`,
    pollMs
  )

  return {
    unitIndex,
    ...realtime,
    soc: realtime.getPointValue('soc'),
    voltage: realtime.getPointValue('voltage'),
    maxCellVoltage: realtime.getPointValue('maxCellVoltage'),
    minCellVoltage: realtime.getPointValue('minCellVoltage'),
    soh: realtime.getPointValue('soh'),
    totalStoredAh: realtime.getPointValue('totalStoredAh'),
    maxCellTemp: realtime.getPointValue('maxCellTemp'),
    minCellTemp: realtime.getPointValue('minCellTemp')
  }
}

export function usePcsNRealtime(siteIdRef, unitIndex, pollMs = 5000) {
  const realtime = useVppDeviceRealtime(
    siteIdRef,
    getPcsDeviceId(unitIndex),
    buildPcsRealtimePoints(unitIndex),
    `PCS-${unitIndex}`,
    pollMs
  )

  return {
    unitIndex,
    ...realtime,
    powerFactor: realtime.getPointValue('powerFactor'),
    activePower: realtime.getPointValue('activePower'),
    reactivePower: realtime.getPointValue('reactivePower'),
    frequency: realtime.getPointValue('frequency')
  }
}

export function usePcsFullRealtime(siteIdRef, unitIndexRef, pollMs = 5000) {
  const loading = ref(false)
  const connectionError = ref('')
  const selectedUnitIndex = computed(() => {
    const index = Number(unref(unitIndexRef))
    return Number.isInteger(index) && index > 0 ? index : 1
  })
  const pointsConfig = computed(() => buildPcsFullRealtimePoints(selectedUnitIndex.value))
  const points = ref(createEmptyPoints(pointsConfig.value))

  let timer = null
  let requestSeq = 0

  const getVppSiteId = () => VPP_SITE_MAP[siteIdRef.value] || null

  const metrics = computed(() =>
    pointsConfig.value.map((cfg) => ({
      ...cfg,
      ...points.value[cfg.key]
    }))
  )

  const latestRecordedAt = computed(() => {
    const times = metrics.value
      .map((item) => item.recordedAt)
      .filter(Boolean)
      .sort()
    return times.length ? times[times.length - 1] : ''
  })

  const hasAnyValue = computed(() =>
    metrics.value.some((item) => Number.isFinite(Number(item.value)))
  )

  const fetchAll = async () => {
    const vppSiteId = getVppSiteId()
    const config = pointsConfig.value
    const unitIndex = selectedUnitIndex.value
    if (!vppSiteId) {
      loading.value = false
      connectionError.value = ''
      points.value = createEmptyPoints(config)
      return
    }

    const seq = ++requestSeq
    loading.value = true

    try {
      const results = await Promise.allSettled(
        config.map(async (cfg) => {
          const data = await fetchPoint(vppSiteId, getPcsDeviceId(unitIndex), cfg.pointId)
          return { key: cfg.key, ...data }
        })
      )

      if (seq !== requestSeq) return

      const next = createEmptyPoints(config)
      let successCount = 0

      results.forEach((result, index) => {
        const key = config[index].key
        if (result.status === 'fulfilled') {
          next[key] = {
            value: result.value.value,
            quality: result.value.quality,
            recordedAt: result.value.recordedAt,
            error: ''
          }
          successCount += 1
        } else {
          next[key] = {
            ...emptyPointState(),
            error: result.reason?.message || '讀取失敗'
          }
        }
      })

      points.value = next
      connectionError.value = successCount === 0 ? `無法取得 PCS-${unitIndex} 完整即時資料` : ''
    } catch (err) {
      if (seq !== requestSeq) return
      connectionError.value = err.message || `無法取得 PCS-${unitIndex} 完整即時資料`
      points.value = createEmptyPoints(config)
    } finally {
      if (seq === requestSeq) {
        loading.value = false
      }
    }
  }

  onMounted(() => {
    fetchAll()
    timer = setInterval(fetchAll, pollMs)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  watch([siteIdRef, selectedUnitIndex], () => {
    points.value = createEmptyPoints(pointsConfig.value)
    fetchAll()
  })

  return {
    loading,
    connectionError,
    points,
    metrics,
    latestRecordedAt,
    hasAnyValue,
    fetchAll
  }
}

export function useEssCabinetRealtime(siteIdRef, pollMs = 5000, unitCount = ESS_CABINET_COUNT) {
  const bms1 = useBmsNRealtime(siteIdRef, 1, pollMs)
  const bms2 = useBmsNRealtime(siteIdRef, 2, pollMs)
  const bms3 = useBmsNRealtime(siteIdRef, 3, pollMs)
  const bms4 = useBmsNRealtime(siteIdRef, 4, pollMs)
  const bms5 = useBmsNRealtime(siteIdRef, 5, pollMs)
  const bms6 = useBmsNRealtime(siteIdRef, 6, pollMs)

  const pcs1 = usePcsNRealtime(siteIdRef, 1, pollMs)
  const pcs2 = usePcsNRealtime(siteIdRef, 2, pollMs)
  const pcs3 = usePcsNRealtime(siteIdRef, 3, pollMs)
  const pcs4 = usePcsNRealtime(siteIdRef, 4, pollMs)
  const pcs5 = usePcsNRealtime(siteIdRef, 5, pollMs)
  const pcs6 = usePcsNRealtime(siteIdRef, 6, pollMs)

  const allBms = [bms1, bms2, bms3, bms4, bms5, bms6].slice(0, unitCount)
  const allPcs = [pcs1, pcs2, pcs3, pcs4, pcs5, pcs6].slice(0, unitCount)

  const bmsUnits = computed(() =>
    allBms.map((unit) => ({
      unitIndex: unit.unitIndex,
      loading: unit.loading.value,
      connectionError: unit.connectionError.value,
      metrics: unit.metrics.value,
      points: unit.points.value,
      soc: unit.soc.value,
      voltage: unit.voltage.value,
      soh: unit.soh.value,
      maxCellTemp: unit.maxCellTemp.value
    }))
  )

  const pcsUnits = computed(() =>
    allPcs.map((unit) => ({
      unitIndex: unit.unitIndex,
      loading: unit.loading.value,
      connectionError: unit.connectionError.value,
      metrics: unit.metrics.value,
      points: unit.points.value,
      activePower: unit.activePower.value,
      powerFactor: unit.powerFactor.value,
      reactivePower: unit.reactivePower.value,
      frequency: unit.frequency.value
    }))
  )

  return {
    bmsUnits,
    pcsUnits,
    bms1,
    pcs1,
    allBms,
    allPcs
  }
}

export function useBms1Realtime(siteIdRef, pollMs = 5000) {
  return useBmsNRealtime(siteIdRef, 1, pollMs)
}

export function usePcs1Realtime(siteIdRef, pollMs = 5000) {
  return usePcsNRealtime(siteIdRef, 1, pollMs)
}

/** @deprecated 請改用 useBms1Realtime */
export function useBms1Voltage(siteIdRef, pollMs = 5000) {
  const realtime = useBms1Realtime(siteIdRef, pollMs)
  return {
    loading: realtime.loading,
    error: realtime.connectionError,
    voltage: realtime.voltage,
    recordedAt: realtime.latestRecordedAt,
    quality: computed(() => realtime.points.value.voltage?.quality || ''),
    raw: realtime.points,
    fetchVoltage: realtime.fetchAll
  }
}

/** @deprecated 內部使用，保留舊匯入相容 */
export { BMS1_DEVICE_ID, BMS1_REALTIME_POINTS, PCS1_DEVICE_ID, PCS1_REALTIME_POINTS }
