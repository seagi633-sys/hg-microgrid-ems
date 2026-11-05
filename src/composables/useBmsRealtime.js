import { ref, computed, onMounted, onUnmounted, unref, watch } from 'vue'
import {
  ATS_DEVICE_IDS,
  ATS_DG_DEVICE_ID,
  BMS1_DEVICE_ID,
  BMS1_REALTIME_POINTS,
  buildAtsFullRealtimePoints,
  buildBmsFullRealtimePoints,
  buildBmsRealtimePoints,
  buildDgFullRealtimePoints,
  buildEmsFullRealtimePoints,
  buildFg4010FullRealtimePoints,
  buildMcFullRealtimePoints,
  buildMpmFullRealtimePoints,
  buildPcsFullRealtimePoints,
  buildPcsRealtimePoints,
  buildRcbFullRealtimePoints,
  buildUpsFullRealtimePoints,
  DG_DEVICE_ID,
  DG_DEVICE_IDS,
  EMS_DEVICE_IDS,
  EMS_GW_DEVICE_ID,
  ESS_CABINET_COUNT,
  FG4010_DEVICE_ID,
  FG4010_DEVICE_IDS,
  getAtsDeviceLabel,
  getBmsDeviceId,
  getDgDeviceLabel,
  getEmsDeviceLabel,
  getFg4010DeviceLabel,
  getMcDeviceLabel,
  getMpmDeviceLabel,
  getPcsDeviceId,
  getRcbDeviceLabel,
  getUpsDeviceLabel,
  MC_DEVICE_IDS,
  MC_DG_DEVICE_ID,
  METER_GW_DEVICE_ID,
  MPM_DEVICE_IDS,
  PCS1_DEVICE_ID,
  PCS1_REALTIME_POINTS,
  RCB_ACC_DEVICE_ID,
  RCB_DEVICE_IDS,
  UPS1_DEVICE_ID,
  UPS_DEVICE_IDS,
  VPP_SITE_MAP
} from '../config/vppSites'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const MAX_CONCURRENT_POINT_FETCHES = 8
let activePointFetches = 0
const pointFetchWaiters = []

function acquirePointFetchSlot() {
  if (activePointFetches < MAX_CONCURRENT_POINT_FETCHES) {
    activePointFetches += 1
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    pointFetchWaiters.push(resolve)
  }).then(() => {
    activePointFetches += 1
  })
}

function releasePointFetchSlot() {
  activePointFetches = Math.max(0, activePointFetches - 1)
  const next = pointFetchWaiters.shift()
  if (next) next()
}

function startPollingLoop(runFetch, pollMs, startDelayMs = 0) {
  let stopped = false
  let timer = null

  const loop = async () => {
    if (stopped) return
    try {
      await runFetch()
    } finally {
      if (!stopped) {
        timer = setTimeout(loop, pollMs)
      }
    }
  }

  timer = setTimeout(loop, Math.max(0, startDelayMs))

  return () => {
    stopped = true
    if (timer) clearTimeout(timer)
  }
}

function emptyPointState() {
  return { value: null, decodedStatus: '', decodedItems: [], quality: '', recordedAt: '', error: '' }
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

function parseDecodedStatusText(raw) {
  if (raw == null || raw === '') return ''

  if (typeof raw === 'string') {
    const text = raw.trim()
    if (!text) return ''
    try {
      return parseDecodedStatusText(JSON.parse(text)) || text
    } catch {
      return text
    }
  }

  if (Array.isArray(raw)) {
    return raw.map(parseDecodedStatusText).filter(Boolean).join('、')
  }

  if (typeof raw === 'object') {
    const entries = Object.values(raw)
    const hasStatusEntries = entries.some(
      (entry) => entry && typeof entry === 'object' && 'value' in entry
    )
    const normalTexts = []
    const texts = entries
      .map((entry) => {
        if (entry == null || entry === '') return ''
        if (typeof entry !== 'object') return String(entry)

        if ('value' in entry) {
          const value = entry.value
          if (value === false || value === 0 || value === '0') {
            const inactiveText = entry.name || entry.text || entry.label || entry.message || ''
            if (String(entry.text || inactiveText).toLowerCase() === 'normal') {
              normalTexts.push(entry.text || inactiveText)
            }
            return ''
          }
        }

        return entry.name || entry.text || entry.label || entry.message || ''
      })
      .filter(Boolean)

    if (texts.length) return texts.join('、')
    if (normalTexts.length) return [...new Set(normalTexts)].join('、')
    if (hasStatusEntries) return ''

    try {
      return JSON.stringify(raw)
    } catch {
      return String(raw)
    }
  }

  return String(raw)
}

function parseDecodedStatus(data) {
  return parseDecodedStatusText(data?.decoded_status ?? data?.decodedStatus)
}

function parseDecodedRawObject(raw) {
  if (raw == null || raw === '') return null
  if (typeof raw === 'object') return raw
  if (typeof raw !== 'string') return null
  const text = raw.trim()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function parseDecodedItems(data) {
  const raw = parseDecodedRawObject(data?.decoded_status ?? data?.decodedStatus)
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return []

  const entries = Object.entries(raw)
  const hasIndexedEntries = entries.every(([key, entry]) => (
    /^\d+$/.test(key)
    && entry
    && typeof entry === 'object'
    && ('name' in entry || 'text' in entry)
  ))

  if (!hasIndexedEntries) return []

  return entries
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, entry]) => ({
      name: entry.name || entry.label || '',
      text: entry.text != null ? String(entry.text) : String(entry.value ?? ''),
      value: entry.value,
      severity: entry.severity || 'info'
    }))
    .filter((item) => item.name || item.text)
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
  await acquirePointFetchSlot()
  try {
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
    const decodedStatus = parseDecodedStatus(data)
    const decodedItems = parseDecodedItems(data)
    if (value == null && !decodedStatus && !decodedItems.length) {
      throw new Error('無法解析數值')
    }
    return {
      value,
      decodedStatus,
      decodedItems,
      quality: data.quality || '',
      recordedAt: data.recorded_at || ''
    }
  } finally {
    releasePointFetchSlot()
  }
}

export function useVppDeviceRealtime(siteIdRef, deviceId, pointsConfig, deviceLabel, pollMs = 5000) {
  const loading = ref(false)
  const connectionError = ref('')
  const points = ref(createEmptyPoints(pointsConfig))

  let requestSeq = 0
  let stopPolling = null
  let fetchInFlight = null

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
    if (fetchInFlight) return fetchInFlight

    const vppSiteId = getVppSiteId()
    if (!vppSiteId) {
      loading.value = false
      connectionError.value = ''
      points.value = createEmptyPoints(pointsConfig)
      return
    }

    const seq = requestSeq
    loading.value = true

    const task = (async () => {
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
              decodedStatus: result.value.decodedStatus,
              decodedItems: result.value.decodedItems || [],
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
        if (fetchInFlight === task) fetchInFlight = null
        if (seq === requestSeq) loading.value = false
      }
    })()

    fetchInFlight = task
    return task
  }

  onMounted(() => {
    stopPolling = startPollingLoop(fetchAll, pollMs)
  })

  onUnmounted(() => {
    if (stopPolling) stopPolling()
  })

  watch(siteIdRef, () => {
    requestSeq += 1
    fetchInFlight = null
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

export function useBmsFullRealtime(siteIdRef, unitIndexRef, pollMs = 5000) {
  const loading = ref(false)
  const connectionError = ref('')
  const selectedUnitIndex = computed(() => {
    const index = Number(unref(unitIndexRef))
    return Number.isInteger(index) && index > 0 ? index : 1
  })
  const pointsConfig = computed(() => buildBmsFullRealtimePoints(selectedUnitIndex.value))
  const points = ref(createEmptyPoints(pointsConfig.value))

  let requestSeq = 0
  let stopPolling = null
  let fetchInFlight = null

  const getVppSiteId = () => VPP_SITE_MAP[siteIdRef.value] || null

  const metrics = computed(() =>
    pointsConfig.value
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
    if (fetchInFlight) return fetchInFlight

    const vppSiteId = getVppSiteId()
    const config = pointsConfig.value
    const unitIndex = selectedUnitIndex.value
    if (!vppSiteId) {
      loading.value = false
      connectionError.value = ''
      points.value = createEmptyPoints(config)
      return
    }

    const seq = requestSeq
    loading.value = true

    const task = (async () => {
      try {
        const results = await Promise.allSettled(
          config.map(async (cfg) => {
            const data = await fetchPoint(vppSiteId, getBmsDeviceId(unitIndex), cfg.pointId)
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
              decodedStatus: result.value.decodedStatus,
              decodedItems: result.value.decodedItems || [],
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
        connectionError.value = successCount === 0 ? `無法取得 BMS-${unitIndex} 完整即時資料` : ''
      } catch (err) {
        if (seq !== requestSeq) return
        connectionError.value = err.message || `無法取得 BMS-${unitIndex} 完整即時資料`
        points.value = createEmptyPoints(config)
      } finally {
        if (fetchInFlight === task) fetchInFlight = null
        if (seq === requestSeq) loading.value = false
      }
    })()

    fetchInFlight = task
    return task
  }

  onMounted(() => {
    const startDelay = Math.max(0, (selectedUnitIndex.value - 1) * 350)
    stopPolling = startPollingLoop(fetchAll, pollMs, startDelay)
  })

  onUnmounted(() => {
    if (stopPolling) stopPolling()
  })

  watch([siteIdRef, selectedUnitIndex], () => {
    requestSeq += 1
    fetchInFlight = null
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

export function usePcsFullRealtime(siteIdRef, unitIndexRef, pollMs = 5000) {
  const loading = ref(false)
  const connectionError = ref('')
  const selectedUnitIndex = computed(() => {
    const index = Number(unref(unitIndexRef))
    return Number.isInteger(index) && index > 0 ? index : 1
  })
  const pointsConfig = computed(() => buildPcsFullRealtimePoints(selectedUnitIndex.value))
  const points = ref(createEmptyPoints(pointsConfig.value))

  let requestSeq = 0
  let stopPolling = null
  let fetchInFlight = null

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
    if (fetchInFlight) return fetchInFlight

    const vppSiteId = getVppSiteId()
    const config = pointsConfig.value
    const unitIndex = selectedUnitIndex.value
    if (!vppSiteId) {
      loading.value = false
      connectionError.value = ''
      points.value = createEmptyPoints(config)
      return
    }

    const seq = requestSeq
    loading.value = true

    const task = (async () => {
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
              decodedStatus: result.value.decodedStatus,
              decodedItems: result.value.decodedItems || [],
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
        if (fetchInFlight === task) fetchInFlight = null
        if (seq === requestSeq) loading.value = false
      }
    })()

    fetchInFlight = task
    return task
  }

  onMounted(() => {
    const startDelay = Math.max(0, (selectedUnitIndex.value - 1) * 350)
    stopPolling = startPollingLoop(fetchAll, pollMs, startDelay)
  })

  onUnmounted(() => {
    if (stopPolling) stopPolling()
  })

  watch([siteIdRef, selectedUnitIndex], () => {
    requestSeq += 1
    fetchInFlight = null
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

export function useAtsFullRealtime(siteIdRef, deviceId = ATS_DG_DEVICE_ID, pollMs = 5000) {
  const pointsConfig = buildAtsFullRealtimePoints(deviceId)
  return useVppDeviceRealtime(
    siteIdRef,
    deviceId,
    pointsConfig,
    getAtsDeviceLabel(deviceId) || deviceId,
    pollMs
  )
}

export function useAtsDevicesRealtime(siteIdRef, deviceIds = ATS_DEVICE_IDS, pollMs = 5000) {
  return deviceIds.map((deviceId) => ({
    deviceId,
    label: getAtsDeviceLabel(deviceId),
    ...useAtsFullRealtime(siteIdRef, deviceId, pollMs)
  }))
}

export function useMcFullRealtime(siteIdRef, deviceId = MC_DG_DEVICE_ID, pollMs = 5000) {
  const pointsConfig = buildMcFullRealtimePoints(deviceId)
  return useVppDeviceRealtime(
    siteIdRef,
    deviceId,
    pointsConfig,
    getMcDeviceLabel(deviceId) || deviceId,
    pollMs
  )
}

export function useMcDevicesRealtime(siteIdRef, deviceIds = MC_DEVICE_IDS, pollMs = 5000) {
  return deviceIds.map((deviceId) => ({
    deviceId,
    label: getMcDeviceLabel(deviceId),
    ...useMcFullRealtime(siteIdRef, deviceId, pollMs)
  }))
}

export function useRcbFullRealtime(siteIdRef, deviceId = RCB_ACC_DEVICE_ID, pollMs = 5000) {
  const pointsConfig = buildRcbFullRealtimePoints(deviceId)
  return useVppDeviceRealtime(
    siteIdRef,
    deviceId,
    pointsConfig,
    getRcbDeviceLabel(deviceId) || deviceId,
    pollMs
  )
}

export function useRcbDevicesRealtime(siteIdRef, deviceIds = RCB_DEVICE_IDS, pollMs = 5000) {
  return deviceIds.map((deviceId) => ({
    deviceId,
    label: getRcbDeviceLabel(deviceId),
    ...useRcbFullRealtime(siteIdRef, deviceId, pollMs)
  }))
}

export function useMpmFullRealtime(siteIdRef, deviceId = METER_GW_DEVICE_ID, pollMs = 5000) {
  const pointsConfig = buildMpmFullRealtimePoints(deviceId)
  return useVppDeviceRealtime(
    siteIdRef,
    deviceId,
    pointsConfig,
    getMpmDeviceLabel(deviceId) || deviceId,
    pollMs
  )
}

export function useMpmDevicesRealtime(siteIdRef, deviceIds = MPM_DEVICE_IDS, pollMs = 5000) {
  return deviceIds.map((deviceId) => ({
    deviceId,
    label: getMpmDeviceLabel(deviceId),
    ...useMpmFullRealtime(siteIdRef, deviceId, pollMs)
  }))
}

export function useDgFullRealtime(siteIdRef, deviceId = DG_DEVICE_ID, pollMs = 5000) {
  const pointsConfig = buildDgFullRealtimePoints(deviceId)
  return useVppDeviceRealtime(
    siteIdRef,
    deviceId,
    pointsConfig,
    getDgDeviceLabel(deviceId) || deviceId,
    pollMs
  )
}

export function useDgDevicesRealtime(siteIdRef, deviceIds = DG_DEVICE_IDS, pollMs = 5000) {
  return deviceIds.map((deviceId) => ({
    deviceId,
    label: getDgDeviceLabel(deviceId),
    ...useDgFullRealtime(siteIdRef, deviceId, pollMs)
  }))
}

export function useEmsFullRealtime(siteIdRef, deviceId = EMS_GW_DEVICE_ID, pollMs = 5000) {
  const pointsConfig = buildEmsFullRealtimePoints(deviceId)
  return useVppDeviceRealtime(
    siteIdRef,
    deviceId,
    pointsConfig,
    getEmsDeviceLabel(deviceId) || deviceId,
    pollMs
  )
}

export function useEmsDevicesRealtime(siteIdRef, deviceIds = EMS_DEVICE_IDS, pollMs = 5000) {
  return deviceIds.map((deviceId) => ({
    deviceId,
    label: getEmsDeviceLabel(deviceId),
    ...useEmsFullRealtime(siteIdRef, deviceId, pollMs)
  }))
}

export function useFg4010FullRealtime(siteIdRef, deviceId = FG4010_DEVICE_ID, pollMs = 5000) {
  const pointsConfig = buildFg4010FullRealtimePoints(deviceId)
  return useVppDeviceRealtime(
    siteIdRef,
    deviceId,
    pointsConfig,
    getFg4010DeviceLabel(deviceId) || deviceId,
    pollMs
  )
}

export function useFg4010DevicesRealtime(siteIdRef, deviceIds = FG4010_DEVICE_IDS, pollMs = 5000) {
  return deviceIds.map((deviceId) => ({
    deviceId,
    label: getFg4010DeviceLabel(deviceId),
    ...useFg4010FullRealtime(siteIdRef, deviceId, pollMs)
  }))
}

export function useUpsFullRealtime(siteIdRef, deviceId = UPS1_DEVICE_ID, pollMs = 5000) {
  const pointsConfig = buildUpsFullRealtimePoints(deviceId)
  return useVppDeviceRealtime(
    siteIdRef,
    deviceId,
    pointsConfig,
    getUpsDeviceLabel(deviceId) || deviceId,
    pollMs
  )
}

export function useUpsDevicesRealtime(siteIdRef, deviceIds = UPS_DEVICE_IDS, pollMs = 5000) {
  return deviceIds.map((deviceId) => ({
    deviceId,
    label: getUpsDeviceLabel(deviceId),
    ...useUpsFullRealtime(siteIdRef, deviceId, pollMs)
  }))
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
