import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv(join(__dirname, '../backend/.env'))

const { Pool } = pg

const PG_CONFIG = {
  host: process.env.PG_HOST || '192.168.1.17',
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

export { PG_CONFIG }
