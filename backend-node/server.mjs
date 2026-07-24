import express from 'express'
import cors from 'cors'
import { checkDbHealth, fetchLatestPoint, PG_CONFIG } from './db.mjs'
import { serializeRow } from './serialize.mjs'

const JIALI_SITE_ID = 'MG-TNN-001'
const BMS1_DEVICE_ID = 'BMS1'
const BMS1_VOLTAGE_POINT = 'BMS1_AVG_RACK_VOLTAGE'

const app = express()
app.use(cors())

app.get('/time', (_req, res) => {
  res.json({ time: new Date().toISOString() })
})

app.get('/api/vpp/realtime/latest', async (req, res) => {
  const siteId = req.query.site_id || JIALI_SITE_ID
  const deviceId = req.query.device_id || BMS1_DEVICE_ID
  const pointId = req.query.point_id || BMS1_VOLTAGE_POINT

  try {
    const row = await fetchLatestPoint(siteId, deviceId, pointId)
    if (!row) {
      return res.status(404).json({
        ok: false,
        error: '查無資料',
        site_id: siteId,
        device_id: deviceId,
        point_id: pointId
      })
    }
    return res.json({ ok: true, data: serializeRow(row) })
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message || String(err),
      site_id: siteId,
      device_id: deviceId,
      point_id: pointId
    })
  }
})

app.get('/api/vpp/jiali/bms1/voltage', async (_req, res) => {
  try {
    const row = await fetchLatestPoint(JIALI_SITE_ID, BMS1_DEVICE_ID, BMS1_VOLTAGE_POINT)
    if (!row) {
      return res.status(404).json({ ok: false, error: '查無 BMS1 電壓資料' })
    }
    return res.json({
      ok: true,
      site_id: JIALI_SITE_ID,
      site_name: '臺南市佳里國中後港校區',
      device_id: BMS1_DEVICE_ID,
      bms_label: 'BMS-1',
      point_id: BMS1_VOLTAGE_POINT,
      data: serializeRow(row)
    })
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || String(err) })
  }
})

app.get('/api/health/db', async (_req, res) => {
  try {
    await checkDbHealth()
    return res.json({
      ok: true,
      database: PG_CONFIG.database,
      host: PG_CONFIG.host
    })
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || String(err) })
  }
})

const host = process.env.FLASK_HOST || '0.0.0.0'
const port = Number(process.env.FLASK_PORT || '5000')

app.listen(port, host, () => {
  console.log(`EMS API (Node) listening on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`)
  console.log(`PostgreSQL ${PG_CONFIG.host}:${PG_CONFIG.port}/${PG_CONFIG.database}`)
})
