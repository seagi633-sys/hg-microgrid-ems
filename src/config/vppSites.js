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
      label: 'Cell最高電壓(Rack,Cell)',
      unit: 'V',
      decimals: 2,
      indexPointKeys: ['maxCellVoltageRackIndex', 'maxCellVoltageIndex']
    },
    {
      key: 'maxCellVoltageIndex',
      pointId: `${prefix}_MAX_CELL_VOLTAGE_INDEX`,
      label: 'Cell最高電壓Index',
      hidden: true
    },
    {
      key: 'maxCellVoltageRackIndex',
      pointId: `${prefix}_MAX_CELL_VOLTAGE_RACK_INDEX`,
      label: 'Cell最高電壓Rack Index',
      hidden: true
    },
    {
      key: 'minCellVoltage',
      pointId: `${prefix}_MIN_CELL_VOLTAGE`,
      label: 'Cell最低電壓(Rack,Cell)',
      unit: 'V',
      decimals: 2,
      indexPointKeys: ['minCellVoltageRackIndex', 'minCellVoltageIndex']
    },
    {
      key: 'minCellVoltageIndex',
      pointId: `${prefix}_MIN_CELL_VOLTAGE_INDEX`,
      label: 'Cell最低電壓Index',
      hidden: true
    },
    {
      key: 'minCellVoltageRackIndex',
      pointId: `${prefix}_MIN_CELL_VOLTAGE_RACK_INDEX`,
      label: 'Cell最低電壓Rack Index',
      hidden: true
    },
    {
      key: 'maxCellTemp',
      pointId: `${prefix}_MAX_CELL_TEMP`,
      label: 'Cell最高溫度(Rack,Module,Cell)',
      unit: '°C',
      decimals: 1,
      indexPointKeys: ['maxCellTempRackIndex', 'maxCellTempModuleIndex', 'maxCellTempIndex']
    },
    {
      key: 'maxCellTempIndex',
      pointId: `${prefix}_MAX_CELL_TEMP_INDEX`,
      label: 'Cell最高溫度Index',
      hidden: true
    },
    {
      key: 'maxCellTempModuleIndex',
      pointId: `${prefix}_MAX_CELL_TEMP_MODULE_INDEX`,
      label: 'Cell最高溫度Module Index',
      hidden: true
    },
    {
      key: 'maxCellTempRackIndex',
      pointId: `${prefix}_MAX_CELL_TEMP_RACK_INDEX`,
      label: 'Cell最高溫度Rack Index',
      hidden: true
    },
    {
      key: 'minCellTemp',
      pointId: `${prefix}_MIN_CELL_TEMP`,
      label: 'Cell最低溫度(Rack,Module,Cell)',
      unit: '°C',
      decimals: 1,
      indexPointKeys: ['minCellTempRackIndex', 'minCellTempModuleIndex', 'minCellTempIndex']
    },
    {
      key: 'minCellTempIndex',
      pointId: `${prefix}_MIN_CELL_TEMP_INDEX`,
      label: 'Cell最低溫度Index',
      hidden: true
    },
    {
      key: 'minCellTempModuleIndex',
      pointId: `${prefix}_MIN_CELL_TEMP_MODULE_INDEX`,
      label: 'Cell最低溫度Module Index',
      hidden: true
    },
    {
      key: 'minCellTempRackIndex',
      pointId: `${prefix}_MIN_CELL_TEMP_RACK_INDEX`,
      label: 'Cell最低溫度Rack Index',
      hidden: true
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

const PCS_FULL_POINT_DEFS = [
  { suffix: 'AC_SWITCH_STATUS', label: 'AC 開關狀態', decimals: 0 },
  { suffix: 'ALARM_W01', label: '告警 W01', decimals: 0 },
  { suffix: 'ALARM_W02', label: '告警 W02', decimals: 0 },
  { suffix: 'ALARM_W03', label: '告警 W03', decimals: 0 },
  { suffix: 'ALARM_W04', label: '告警 W04', decimals: 0 },
  { suffix: 'ALARM_W05', label: '告警 W05', decimals: 0 },
  { suffix: 'ALARM_W06', label: '告警 W06', decimals: 0 },
  { suffix: 'DC_SWITCH_STATUS', label: 'DC 開關狀態', decimals: 0 },
  { suffix: 'POWER_FACTOR', label: '功率因數', decimals: 3 },
  { suffix: 'REMOTE_ENABLE_STATUS', label: '遠端啟用狀態', decimals: 0 },
  { suffix: 'RUN_STATE', label: '運轉狀態', decimals: 0 },
  { suffix: 'SYSTEM_ACTIVE_POWER', label: '系統實功率', unit: 'kW', decimals: 2 },
  { suffix: 'SYSTEM_APPARENT_POWER', label: '系統視在功率', unit: 'kVA', decimals: 2 },
  { suffix: 'SYSTEM_REACTIVE_POWER', label: '系統虛功率', unit: 'kVar', decimals: 2 },
  { suffix: 'U1_ACTIVE_POWER', label: 'U1 實功率', unit: 'kW', decimals: 2 },
  { suffix: 'U1_AC_LEAKAGE_CURRENT', label: 'U1 AC 漏電流', unit: 'A', decimals: 2 },
  { suffix: 'U1_APPARENT_POWER', label: 'U1 視在功率', unit: 'kVA', decimals: 2 },
  { suffix: 'U1_DC_CURRENT', label: 'U1 DC 電流', unit: 'A', decimals: 2 },
  { suffix: 'U1_DC_POWER', label: 'U1 DC 功率', unit: 'kW', decimals: 2 },
  { suffix: 'U1_DC_VOLTAGE', label: 'U1 DC 電壓', unit: 'V', decimals: 2 },
  { suffix: 'U1_FREQUENCY', label: 'U1 頻率', unit: 'Hz', decimals: 2 },
  { suffix: 'U1_GRID_MODE', label: 'U1 併網模式', decimals: 0 },
  { suffix: 'U1_GRID_U_UV_VOLTAGE', label: 'U1 電網 UV 電壓', unit: 'V', decimals: 2 },
  { suffix: 'U1_GRID_V_VW_VOLTAGE', label: 'U1 電網 VW 電壓', unit: 'V', decimals: 2 },
  { suffix: 'U1_GRID_W_WU_VOLTAGE', label: 'U1 電網 WU 電壓', unit: 'V', decimals: 2 },
  { suffix: 'U1_IGBT_U_TEMP', label: 'U1 IGBT U 溫度', unit: '°C', decimals: 1 },
  { suffix: 'U1_IGBT_V_TEMP', label: 'U1 IGBT V 溫度', unit: '°C', decimals: 1 },
  { suffix: 'U1_IGBT_W_TEMP', label: 'U1 IGBT W 溫度', unit: '°C', decimals: 1 },
  { suffix: 'U1_INSULATION_RESISTANCE', label: 'U1 絕緣阻抗', decimals: 2 },
  { suffix: 'U1_INTERNAL_TEMP', label: 'U1 內部溫度', unit: '°C', decimals: 1 },
  { suffix: 'U1_OUTPUT_U_CURRENT', label: 'U1 輸出 U 電流', unit: 'A', decimals: 2 },
  { suffix: 'U1_OUTPUT_V_CURRENT', label: 'U1 輸出 V 電流', unit: 'A', decimals: 2 },
  { suffix: 'U1_OUTPUT_W_CURRENT', label: 'U1 輸出 W 電流', unit: 'A', decimals: 2 },
  { suffix: 'U1_POWER_FACTOR', label: 'U1 功率因數', decimals: 3 },
  { suffix: 'U1_REACTIVE_POWER', label: 'U1 虛功率', unit: 'kVar', decimals: 2 }
]

export function buildPcsFullRealtimePoints(unitIndex) {
  const prefix = `PCS${unitIndex}`
  return PCS_FULL_POINT_DEFS.map((point) => ({
    key: point.suffix.toLowerCase(),
    pointId: `${prefix}_${point.suffix}`,
    label: point.label,
    unit: point.unit || '',
    decimals: point.decimals
  }))
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
