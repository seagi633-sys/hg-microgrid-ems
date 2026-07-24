export const VPP_SITE_MAP = {
  'jiali-junior-high': 'MG-TNN-001'
}

export const ESS_CABINET_COUNT = 6

export function getBmsDeviceId(unitIndex) {
  return `BMS${unitIndex}`
}

export function getPcsDeviceId(unitIndex) {
  return `PCS${unitIndex}`
}

export function buildBmsRealtimePoints(unitIndex) {
  const prefix = `BMS${unitIndex}`
  return [
    {
      key: 'soc',
      pointId: `${prefix}_SOC`,
      label: 'SOC',
      unit: '%',
      decimals: 1
    },
    {
      key: 'soh',
      pointId: `${prefix}_AVG_SOH`,
      label: 'SOH',
      unit: '%',
      decimals: 1
    },
    {
      key: 'totalStoredAh',
      pointId: `${prefix}_TOTAL_STORED_AH`,
      label: '電量總計',
      unit: 'Ah',
      decimals: 2
    },
    {
      key: 'voltage',
      pointId: `${prefix}_AVG_RACK_VOLTAGE`,
      label: '電池平均電壓',
      unit: 'V',
      decimals: 2
    },
    {
      key: 'maxCellVoltage',
      pointId: `${prefix}_MAX_CELL_VOLTAGE`,
      label: 'Cell最高電壓',
      unit: 'V',
      decimals: 2
    },
    {
      key: 'minCellVoltage',
      pointId: `${prefix}_MIN_CELL_VOLTAGE`,
      label: 'Cell最低電壓',
      unit: 'V',
      decimals: 2
    },
    {
      key: 'maxCellTemp',
      pointId: `${prefix}_MAX_CELL_TEMP`,
      label: 'Cell最高溫度',
      unit: '°C',
      decimals: 1
    },
    {
      key: 'minCellTemp',
      pointId: `${prefix}_MIN_CELL_TEMP`,
      label: 'Cell最低溫度',
      unit: '°C',
      decimals: 1
    }
  ]
}

export function buildPcsRealtimePoints(unitIndex) {
  const prefix = `PCS${unitIndex}`
  return [
    {
      key: 'powerFactor',
      pointId: `${prefix}_POWER_FACTOR`,
      label: '功率因數',
      unit: '',
      decimals: 3
    },
    {
      key: 'activePower',
      pointId: `${prefix}_SYSTEM_ACTIVE_POWER`,
      label: '輸出實功率',
      unit: 'kW',
      decimals: 2
    },
    {
      key: 'reactivePower',
      pointId: `${prefix}_SYSTEM_REACTIVE_POWER`,
      label: '輸出虛功率',
      unit: 'kVar',
      decimals: 2
    },
    {
      key: 'frequency',
      pointId: `${prefix}_U1_FREQUENCY`,
      label: '頻率',
      unit: 'Hz',
      decimals: 2
    }
  ]
}

/** @deprecated 請改用 buildBmsRealtimePoints(1) */
export const BMS1_DEVICE_ID = 'BMS1'
export const BMS1_SOC_POINT = 'BMS1_SOC'
export const BMS1_AVG_SOH_POINT = 'BMS1_AVG_SOH'
export const BMS1_AVG_VOLTAGE_POINT = 'BMS1_AVG_RACK_VOLTAGE'
export const BMS1_MAX_CELL_VOLTAGE_POINT = 'BMS1_MAX_CELL_VOLTAGE'
export const BMS1_MIN_CELL_VOLTAGE_POINT = 'BMS1_MIN_CELL_VOLTAGE'
export const BMS1_MAX_CELL_TEMP_POINT = 'BMS1_MAX_CELL_TEMP'
export const BMS1_MIN_CELL_TEMP_POINT = 'BMS1_MIN_CELL_TEMP'
export const BMS1_TOTAL_STORED_AH_POINT = 'BMS1_TOTAL_STORED_AH'
export const BMS1_REALTIME_POINTS = buildBmsRealtimePoints(1)

/** @deprecated 請改用 buildPcsRealtimePoints(1) */
export const PCS1_DEVICE_ID = 'PCS1'
export const PCS1_POWER_FACTOR_POINT = 'PCS1_POWER_FACTOR'
export const PCS1_ACTIVE_POWER_POINT = 'PCS1_SYSTEM_ACTIVE_POWER'
export const PCS1_REACTIVE_POWER_POINT = 'PCS1_SYSTEM_REACTIVE_POWER'
export const PCS1_FREQUENCY_POINT = 'PCS1_U1_FREQUENCY'
export const PCS1_REALTIME_POINTS = buildPcsRealtimePoints(1)
