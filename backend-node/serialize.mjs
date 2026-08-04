function parsePointValue(raw) {
  if (raw == null) return [null, null]

  if (typeof raw === 'boolean') {
    return [raw, Number(raw)]
  }

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return [raw, raw]
  }

  if (typeof raw === 'string') {
    const text = raw.trim()
    if (!text) return [null, null]
    try {
      const parsed = JSON.parse(text)
      if (parsed !== raw) {
        return parsePointValue(parsed)
      }
    } catch {
      // not JSON
    }
    const num = Number(text)
    if (Number.isFinite(num)) {
      return [text, num]
    }
    return [text, null]
  }

  if (typeof raw === 'object' && !Array.isArray(raw)) {
    for (const key of ['value', 'val', 'v', 'data', 'numeric_value']) {
      if (key in raw) {
        return parsePointValue(raw[key])
      }
    }
    return [raw, null]
  }

  if (Array.isArray(raw) && raw.length === 1) {
    return parsePointValue(raw[0])
  }

  const num = Number(raw)
  return Number.isFinite(num) ? [raw, num] : [raw, null]
}

export function serializeRow(row) {
  if (!row) return null

  let recordedAt = row.recorded_at
  if (recordedAt instanceof Date) {
    recordedAt = recordedAt.toISOString()
  }

  const [value, numericValue] = parsePointValue(row.point_value)

  return {
    site_id: row.site_id,
    device_id: row.device_id,
    point_id: row.point_id,
    value,
    numeric_value: numericValue,
    decoded_status: row.decoded_status ?? null,
    quality: row.quality,
    unit: 'V',
    label: '平均電壓',
    recorded_at: recordedAt
  }
}
