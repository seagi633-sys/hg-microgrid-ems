import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv(join(__dirname, '../backend/.env'))

const { Pool } = pg

const PG_CONFIG = {
  host: process.env.PG_HOST || '192.168.1.199',
  port: Number(process.env.PG_PORT || '5432'),
  user: process.env.PG_USER || 'ems',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DATABASE || 'vpp'
}

const VALUE_COLUMN = process.env.PG_VALUE_COLUMN || ''
const TIME_COLUMN = process.env.PG_TIME_COLUMN || ''

const VALUE_CANDIDATES = ['value', 'point_value', 'val', 'data_value', 'numeric_value']
const TIME_CANDIDATES = [
  'updated_at',
  'sample_time',
  'ts',
  'recorded_at',
  'update_time',
  'timestamp',
  'time',
  'created_at'
]

const pool = new Pool(PG_CONFIG)

function loadEnv(filePath) {
  if (!existsSync(filePath)) return
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx <= 0) continue
    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] == null) {
      process.env[key] = value
    }
  }
}

function resolveColumn(columnMap, configured, candidates) {
  if (configured && columnMap[configured.toLowerCase()]) {
    return columnMap[configured.toLowerCase()]
  }
  for (const name of candidates) {
    if (columnMap[name.toLowerCase()]) {
      return columnMap[name.toLowerCase()]
    }
  }
  return null
}

function valueSql(valueCol, valueType) {
  if (valueType === 'jsonb') {
    return `(${valueCol} #>> '{}')`
  }
  return valueCol
}

export async function fetchLatestPoint(siteId, deviceId, pointId) {
  const columnResult = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vpp_realtime'
  `)

  const columnMap = {}
  const typeMap = {}
  for (const row of columnResult.rows) {
    const name = String(row.column_name)
    columnMap[name.toLowerCase()] = name
    typeMap[name.toLowerCase()] = String(row.data_type).toLowerCase()
  }

  if (!Object.keys(columnMap).length) {
    throw new Error('找不到資料表 vpp_realtime 或無法讀取欄位')
  }

  const valueCol = resolveColumn(columnMap, VALUE_COLUMN, VALUE_CANDIDATES)
  const timeCol = resolveColumn(columnMap, TIME_COLUMN, TIME_CANDIDATES)
  const decodedStatusCol = columnMap.decoded_status || null

  if (!valueCol) {
    throw new Error(`找不到數值欄位，可用欄位：${Object.values(columnMap).sort().join(', ')}`)
  }
  if (!timeCol) {
    throw new Error(`找不到時間欄位，可用欄位：${Object.values(columnMap).sort().join(', ')}`)
  }

  const valueExpr = valueSql(valueCol, typeMap[valueCol.toLowerCase()] || '')

  const query = `
    SELECT
      site_id,
      device_id,
      point_id,
      ${valueExpr} AS point_value,
      ${decodedStatusCol || 'NULL'} AS decoded_status,
      ${timeCol} AS recorded_at,
      quality
    FROM vpp_realtime
    WHERE site_id = $1
      AND device_id = $2
      AND point_id = $3
    ORDER BY ${timeCol} DESC NULLS LAST
    LIMIT 1
  `

  const result = await pool.query(query, [siteId, deviceId, pointId])
  return result.rows[0] || null
}

export async function checkDbHealth() {
  const result = await pool.query('SELECT 1 AS ok')
  return result.rows[0]
}

const ONLINE_WINDOW_SEC = 120

export async function fetchSiteStatuses() {
  const result = await pool.query(`
    SELECT
      s.site_id,
      s.site_name,
      h.connector_status,
      h.data_delay_sec,
      h.received_at,
      h.edge_time,
      COALESCE(a.critical_count, 0)::int AS critical_count,
      COALESCE(a.warning_count, 0)::int AS warning_count,
      COALESCE(a.info_count, 0)::int AS info_count
    FROM vpp_site s
    LEFT JOIN LATERAL (
      SELECT connector_status, data_delay_sec, received_at, edge_time
      FROM vpp_site_heartbeat
      WHERE site_id = s.site_id
      ORDER BY received_at DESC NULLS LAST
      LIMIT 1
    ) h ON TRUE
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*) FILTER (WHERE severity = 'critical') AS critical_count,
        COUNT(*) FILTER (WHERE severity = 'warning') AS warning_count,
        COUNT(*) FILTER (WHERE severity = 'info') AS info_count
      FROM vpp_alarm_active
      WHERE site_id = s.site_id
    ) a ON TRUE
    WHERE s.deleted_at IS NULL
    ORDER BY s.site_id
  `)

  const now = Date.now()
  return result.rows.map((row) => {
    const receivedAt = row.received_at ? new Date(row.received_at) : null
    const edgeTime = row.edge_time ? new Date(row.edge_time) : null
    const lastSeen = receivedAt || edgeTime
    const ageSec = lastSeen ? (now - lastSeen.getTime()) / 1000 : null
    const hasHeartbeat = row.connector_status != null || lastSeen != null || row.data_delay_sec != null
    const fresh = ageSec != null && ageSec >= 0 && ageSec <= ONLINE_WINDOW_SEC
    const critical = Number(row.critical_count || 0)
    const warning = Number(row.warning_count || 0)
    const info = Number(row.info_count || 0)

    return {
      site_id: row.site_id,
      site_name: row.site_name,
      online: fresh && row.connector_status !== 'offline',
      data_delay_sec: hasHeartbeat ? row.data_delay_sec : null,
      last_seen_at: lastSeen ? lastSeen.toISOString() : null,
      alarms: {
        total: critical + warning + info,
        critical,
        warning,
        info
      }
    }
  })
}

export { PG_CONFIG, ONLINE_WINDOW_SEC }

const ROLLUP_NAME = 'mpm_1'
const BUCKET_INTERVALS = new Set(['1 minute', '15 minutes', '1 hour', '1 day'])
const MAX_ROLLUP_HOURS = {
  '1 minute': 48,
  '15 minutes': 24 * 31,
  '1 hour': 24 * 90,
  '1 day': 24 * 400
}

function roundMetric(value, digits = 4) {
  if (value == null || value === '') return null
  const number = Number(value)
  if (!Number.isFinite(number)) return null
  return Number(number.toFixed(digits))
}

export async function fetchEnergyRollup(siteId, bucketInterval, hours) {
  if (!BUCKET_INTERVALS.has(bucketInterval)) {
    throw new Error('不支援的時間粒度')
  }
  const requestedHours = Number(hours)
  const spanHours = Math.min(
    MAX_ROLLUP_HOURS[bucketInterval],
    Math.max(1, Number.isFinite(requestedHours) ? Math.trunc(requestedHours) : 24)
  )

  const result = await pool.query(
    `
    SELECT
      bucket_time,
      avg_power_kw,
      import_energy_kwh,
      export_energy_kwh,
      import_energy_total_kwh,
      export_energy_total_kwh,
      soc,
      soc_kwh,
      sample_count
    FROM vpp_energy_rollup
    WHERE site_id = $1
      AND rollup_name = $2
      AND bucket_interval = $3
      AND bucket_time >= NOW() - ($4::int * INTERVAL '1 hour')
    ORDER BY bucket_time ASC
    `,
    [siteId, ROLLUP_NAME, bucketInterval, spanHours]
  )

  return {
    site_id: siteId,
    rollup_name: ROLLUP_NAME,
    bucket_interval: bucketInterval,
    hours: spanHours,
    points: result.rows.map((row) => ({
      bucket_time: row.bucket_time instanceof Date ? row.bucket_time.toISOString() : row.bucket_time,
      avg_power_kw: roundMetric(row.avg_power_kw),
      import_energy_kwh: roundMetric(row.import_energy_kwh),
      export_energy_kwh: roundMetric(row.export_energy_kwh),
      import_energy_total_kwh: roundMetric(row.import_energy_total_kwh, 3),
      export_energy_total_kwh: roundMetric(row.export_energy_total_kwh, 3),
      soc: roundMetric(row.soc, 2),
      soc_kwh: roundMetric(row.soc_kwh, 3),
      sample_count: row.sample_count == null ? null : Number(row.sample_count)
    }))
  }
}
