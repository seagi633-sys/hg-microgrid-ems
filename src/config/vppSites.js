export const VPP_SITE_MAP = {
  'jiali-junior-high': 'MG-TNN-002',
  'ruifeng-elementary': 'MG-TNN-003'
}

const HISTORY_SITE_MAP = {
  'jiali-junior-high': 'MG-TNN-002',
  'ruifeng-elementary': 'MG-TNN-003',
  'zengwen-vision-park': 'MG-TNN-001'
}

export function getHistorySiteId(siteId) {
  return HISTORY_SITE_MAP[siteId] || VPP_SITE_MAP[siteId] || null
}

export const ESS_CABINET_COUNT = 6

export function getBmsDeviceId(unitIndex) {
  return `BMS${unitIndex}`
}

export function getPcsDeviceId(unitIndex) {
  return `PCS${unitIndex}`
}

export const ATS_DG_DEVICE_ID = 'ATS_DG'
export const ATS_PV1_DEVICE_ID = 'ATS_PV1'
export const ATS_PV2_DEVICE_ID = 'ATS_PV2'
export const ATS_DEVICE_IDS = [ATS_DG_DEVICE_ID, ATS_PV1_DEVICE_ID, ATS_PV2_DEVICE_ID]

const ATS_DEVICE_LABELS = {
  ATS_DG: '柴電 ATS',
  ATS_PV1: 'PV1 ATS',
  ATS_PV2: 'PV2 ATS'
}

export function getAtsDeviceLabel(deviceId) {
  return ATS_DEVICE_LABELS[deviceId] || deviceId
}

const ATS_FULL_POINT_DEFS = [
  { suffix: 'WORK_MODE_STATUS', label: '工作模式狀態', decimals: 0, statusKind: 'mode' },
  { suffix: 'MAIN_POWER_ERROR_TYPE', label: '市電異常類型', decimals: 0, statusKind: 'error' },
  { suffix: 'MAIN_POWER_RETURN_TYPE', label: '市電復歸類型', decimals: 0, statusKind: 'return' },
  { suffix: 'STANDBY_POWER_ERROR_TYPE', label: '備電異常類型', decimals: 0, statusKind: 'error' },
  { suffix: 'SYSTEM_ERROR_TYPE', label: '系統異常類型', decimals: 0, statusKind: 'error' },
  { suffix: 'NETWORK_STATUS', label: '網路/投切狀態', decimals: 0, statusKind: 'network' },
  { suffix: 'OTHER_STATUS', label: '其他狀態', decimals: 0, statusKind: 'other' },
  { suffix: 'REMOTE_TRANSFER_COMMAND_STATUS', label: '遠端轉供指令狀態', decimals: 0, statusKind: 'command' },
  { suffix: 'SOURCE_I_PHASE_A_VOLTAGE', label: 'Source I A相電壓', unit: 'V', decimals: 2, statusKind: 'voltage' },
  { suffix: 'SOURCE_I_PHASE_B_VOLTAGE', label: 'Source I B相電壓', unit: 'V', decimals: 2, statusKind: 'voltage' },
  { suffix: 'SOURCE_I_PHASE_C_VOLTAGE', label: 'Source I C相電壓', unit: 'V', decimals: 2, statusKind: 'voltage' },
  { suffix: 'SOURCE_II_PHASE_A_VOLTAGE', label: 'Source II A相電壓', unit: 'V', decimals: 2, statusKind: 'voltage' },
  { suffix: 'SOURCE_II_PHASE_B_VOLTAGE', label: 'Source II B相電壓', unit: 'V', decimals: 2, statusKind: 'voltage' },
  { suffix: 'SOURCE_II_PHASE_C_VOLTAGE', label: 'Source II C相電壓', unit: 'V', decimals: 2, statusKind: 'voltage' }
]

export function buildAtsFullRealtimePoints(deviceId = ATS_DG_DEVICE_ID) {
  const prefix = deviceId
  return ATS_FULL_POINT_DEFS.map((point) => ({
    key: point.suffix.toLowerCase(),
    pointId: `${prefix}_${point.suffix}`,
    label: point.label,
    unit: point.unit || '',
    decimals: point.decimals,
    statusKind: point.statusKind
  }))
}

export const MC_DG_DEVICE_ID = 'MC_DG'
export const MC_PV1_DEVICE_ID = 'MC_PV1'
export const MC_PV2_DEVICE_ID = 'MC_PV2'
export const MC_DEVICE_IDS = [MC_DG_DEVICE_ID, MC_PV1_DEVICE_ID, MC_PV2_DEVICE_ID]

const MC_DEVICE_LABELS = {
  MC_DG: '柴電 MC',
  MC_PV1: 'PV1 MC',
  MC_PV2: 'PV2 MC'
}

export function getMcDeviceLabel(deviceId) {
  return MC_DEVICE_LABELS[deviceId] || deviceId
}

const MC_FULL_POINT_DEFS = [
  { suffix: 'COS_AUTO', label: '自動/手動', decimals: 0, statusKind: 'mode' },
  { suffix: 'OFF_STATUS', label: 'OFF 狀態', decimals: 0, statusKind: 'status' },
  { suffix: 'ON_STATUS', label: 'ON 狀態', decimals: 0, statusKind: 'status' }
]

export function buildMcFullRealtimePoints(deviceId = MC_DG_DEVICE_ID) {
  return MC_FULL_POINT_DEFS.map((point) => ({
    key: point.suffix.toLowerCase(),
    pointId: `${deviceId}_${point.suffix}`,
    label: point.label,
    unit: point.unit || '',
    decimals: point.decimals,
    statusKind: point.statusKind
  }))
}

export const RCB_ACC_DEVICE_ID = 'RCB_ACC'
export const RCB_DG_DEVICE_ID = 'RCB_DG'
export const RCB_MAIN_DEVICE_ID = 'RCB_MAIN'
export const RELAY32_DEVICE_ID = 'RELAY32'
export const RCB_DEVICE_IDS = [
  RCB_ACC_DEVICE_ID,
  RCB_DG_DEVICE_ID,
  RCB_MAIN_DEVICE_ID,
  RELAY32_DEVICE_ID
]

const RCB_DEVICE_LABELS = {
  RCB_ACC: 'ACC RCB',
  RCB_DG: '柴電 RCB',
  RCB_MAIN: '主迴路 RCB',
  RELAY32: 'RELAY32'
}

export function getRcbDeviceLabel(deviceId) {
  return RCB_DEVICE_LABELS[deviceId] || deviceId
}

const RCB_FULL_POINT_DEFS = [
  { suffix: 'COS_AUTO', label: '自動/手動', decimals: 0, statusKind: 'mode' },
  { suffix: 'OFF_STATUS', label: 'OFF 狀態', decimals: 0, statusKind: 'status' },
  { suffix: 'ON_STATUS', label: 'ON 狀態', decimals: 0, statusKind: 'status' }
]

const RELAY32_FULL_POINT_DEFS = [
  { suffix: 'OC_TRIP', label: 'OC Trip', decimals: 0, statusKind: 'trip' },
  { suffix: 'RP_TRIP', label: 'RP Trip', decimals: 0, statusKind: 'trip' }
]

export function buildRcbFullRealtimePoints(deviceId = RCB_ACC_DEVICE_ID) {
  const defs = deviceId === RELAY32_DEVICE_ID ? RELAY32_FULL_POINT_DEFS : RCB_FULL_POINT_DEFS
  return defs.map((point) => ({
    key: point.suffix.toLowerCase(),
    pointId: `${deviceId}_${point.suffix}`,
    label: point.label,
    unit: point.unit || '',
    decimals: point.decimals,
    statusKind: point.statusKind
  }))
}

export const METER_GW_DEVICE_ID = 'METER_GW'
export const MPM1_DEVICE_ID = 'MPM1'
export const MPM2_DEVICE_ID = 'MPM2'
export const MPM3_DEVICE_ID = 'MPM3'
export const MPM4_DEVICE_ID = 'MPM4'
export const MPM11_DEVICE_ID = 'MPM11'
export const MPM12_DEVICE_ID = 'MPM12'
export const MPM13_DEVICE_ID = 'MPM13'
export const MPM14_DEVICE_ID = 'MPM14'
export const MPM_DRB_DEVICE_ID = 'MPM_DRB'
export const MPM_METER_DEVICE_IDS = [
  MPM1_DEVICE_ID,
  MPM2_DEVICE_ID,
  MPM3_DEVICE_ID,
  MPM4_DEVICE_ID,
  MPM11_DEVICE_ID,
  MPM12_DEVICE_ID,
  MPM13_DEVICE_ID,
  MPM14_DEVICE_ID
]
export const MPM_DRB_CHA_CHANNELS = ['CHA1', 'CHA2', 'CHA3', 'CHA4', 'CHA5']
export const MPM_DRB_CHB_CHANNELS = ['CHB1', 'CHB2', 'CHB3', 'CHB4', 'CHB5']
export const MPM_DRB_CHANNELS = [...MPM_DRB_CHA_CHANNELS, ...MPM_DRB_CHB_CHANNELS]
export const MPM_DRB_CHANNEL_GROUPS = [
  { key: 'cha', label: 'CHA1~CHA5', channels: MPM_DRB_CHA_CHANNELS },
  { key: 'chb', label: 'CHB1~CHB5', channels: MPM_DRB_CHB_CHANNELS }
]
export const MPM_DEVICE_IDS = [
  METER_GW_DEVICE_ID,
  ...MPM_METER_DEVICE_IDS,
  MPM_DRB_DEVICE_ID
]

const MPM_DEVICE_LABELS = {
  METER_GW: '電表閘道',
  MPM1: 'MPM1',
  MPM2: 'MPM2',
  MPM3: 'MPM3',
  MPM4: 'MPM4',
  MPM11: 'MPM11',
  MPM12: 'MPM12',
  MPM13: 'MPM13',
  MPM14: 'MPM14',
  MPM_DRB: 'MPM DRB'
}

export function getMpmDeviceLabel(deviceId) {
  return MPM_DEVICE_LABELS[deviceId] || deviceId
}

const MPM_FULL_POINT_DEFS = [
  { suffix: 'ACTIVE_POWER_SUM', label: '總有功功率', unit: 'W', decimals: 1 },
  { suffix: 'REACTIVE_POWER_SUM', label: '總無功功率', unit: 'Var', decimals: 1 },
  { suffix: 'APPARENT_POWER_SUM', label: '總視在功率', unit: 'VA', decimals: 1 },
  { suffix: 'AVG_POWER_FACTOR', label: '平均功率因數', unit: '', decimals: 3 },
  { suffix: 'FREQUENCY', label: '頻率', unit: 'Hz', decimals: 2 },
  { suffix: 'AVG_CURRENT', label: '平均電流', unit: 'A', decimals: 3 },
  { suffix: 'I1_CURRENT', label: 'I1 電流', unit: 'A', decimals: 3 },
  { suffix: 'I2_CURRENT', label: 'I2 電流', unit: 'A', decimals: 3 },
  { suffix: 'I3_CURRENT', label: 'I3 電流', unit: 'A', decimals: 3 },
  { suffix: 'AVG_LINE_VOLTAGE', label: '平均線電壓', unit: 'V', decimals: 1 },
  { suffix: 'U12_LINE_VOLTAGE', label: 'U12 線電壓', unit: 'V', decimals: 1 },
  { suffix: 'U23_LINE_VOLTAGE', label: 'U23 線電壓', unit: 'V', decimals: 1 },
  { suffix: 'U31_LINE_VOLTAGE', label: 'U31 線電壓', unit: 'V', decimals: 1 },
  { suffix: 'IMPORT_ACTIVE_ENERGY', label: '輸入電能', unit: 'kWh', decimals: 1 },
  { suffix: 'EXPORT_ACTIVE_ENERGY', label: '輸出電能', unit: 'kWh', decimals: 1 }
]

function buildMpmMeterPoints(deviceId) {
  return MPM_FULL_POINT_DEFS.map((point) => ({
    key: point.suffix.toLowerCase(),
    pointId: `${deviceId}_${point.suffix}`,
    label: point.label,
    unit: point.unit || '',
    decimals: point.decimals,
    statusKind: 'metric'
  }))
}

function buildMpmDrbPoints(deviceId = MPM_DRB_DEVICE_ID) {
  return MPM_DRB_CHANNELS.flatMap((channel) =>
    MPM_FULL_POINT_DEFS.map((point) => ({
      key: `${channel.toLowerCase()}_${point.suffix.toLowerCase()}`,
      pointId: `${deviceId}_${channel}_${point.suffix}`,
      label: point.label,
      unit: point.unit || '',
      decimals: point.decimals,
      statusKind: 'metric',
      channel
    }))
  )
}

export function buildMpmFullRealtimePoints(deviceId = MPM1_DEVICE_ID) {
  if (deviceId === METER_GW_DEVICE_ID) {
    return [
      {
        key: 'gateway_comm_status',
        pointId: 'MPM_GATEWAY_COMM_STATUS',
        label: '閘道通訊狀態',
        unit: '',
        decimals: 0,
        statusKind: 'gateway'
      }
    ]
  }

  if (deviceId === MPM_DRB_DEVICE_ID) {
    return buildMpmDrbPoints(deviceId)
  }

  return buildMpmMeterPoints(deviceId)
}

export const EMS_GW_DEVICE_ID = 'EMS_GW'
export const EMS_DEVICE_IDS = [EMS_GW_DEVICE_ID]

const EMS_DEVICE_LABELS = {
  EMS_GW: 'EMS Gateway'
}

export function getEmsDeviceLabel(deviceId) {
  return EMS_DEVICE_LABELS[deviceId] || deviceId
}

const EMS_FULL_POINT_DEFS = [
  { suffix: 'EMS_GATEWAY_COMM_STATUS_1', label: 'Gateway Comm Status 1', decimals: 0, statusKind: 'gateway', useDecodedStatus: true },
  { suffix: 'EMS_GATEWAY_COMM_STATUS_2', label: 'Gateway Comm Status 2', decimals: 0, statusKind: 'gateway', useDecodedStatus: true },
  { suffix: 'EMS_GATEWAY_HEARTBEAT', label: 'Gateway Heartbeat', decimals: 0, statusKind: 'gateway' },
  { suffix: 'EMS_GATEWAY_STATUS', label: 'Gateway Status', decimals: 0, statusKind: 'gateway', useDecodedStatus: true },
  { suffix: 'SITE_SOC_AVG', label: 'Site SOC Avg', unit: '%', decimals: 2, trimSecondDecimal: true },
  { suffix: 'SITE_SOC_kWh', label: 'Site SOC kWh', unit: 'kWh', decimals: 2 }
]

export function buildEmsFullRealtimePoints(deviceId = EMS_GW_DEVICE_ID) {
  return EMS_FULL_POINT_DEFS.map((point) => ({
    key: point.suffix.toLowerCase(),
    pointId: point.suffix,
    label: point.label,
    unit: point.unit || '',
    decimals: point.decimals,
    statusKind: point.statusKind || 'metric',
    ...(point.useDecodedStatus ? { useDecodedStatus: true } : {}),
    ...(point.trimSecondDecimal ? { trimSecondDecimal: true } : {})
  }))
}

export const UPS1_DEVICE_ID = 'UPS1'
export const UPS2_DEVICE_ID = 'UPS2'
export const UPS_DEVICE_IDS = [UPS1_DEVICE_ID, UPS2_DEVICE_ID]

const UPS_DEVICE_LABELS = {
  UPS1: 'UPS1',
  UPS2: 'UPS2'
}

export function getUpsDeviceLabel(deviceId) {
  return UPS_DEVICE_LABELS[deviceId] || deviceId
}

const UPS_WORKING_MODE_DECODE_MAP = {
  20480: 'Power on mode',
  21248: 'Standby mode',
  22784: 'Bypass mode',
  19456: 'Line mode',
  16896: 'Battery mode',
  21504: 'Battery test mode',
  17920: 'Fault mode',
  17664: 'HE/ECO mode',
  17152: 'Converter mode',
  17408: 'Shutdown mode'
}

const UPS_FULL_POINT_DEFS = [
  {
    suffix: 'UPS_WARNING_1',
    label: 'UPS Warning #1',
    decimals: 0,
    statusKind: 'warning',
    zeroText: 'normal',
    bitDecodeMap: {
      11: 'Alarm: Charger fail',
      12: 'Alarm: Battery low',
      13: 'Alarm: Bypass frequency unstable'
    }
  },
  {
    suffix: 'UPS_WARNING_4',
    label: 'UPS Warning #4',
    decimals: 0,
    statusKind: 'warning',
    zeroText: 'normal',
    bitDecodeMap: {
      8: 'Alarm: Over temperature',
      10: 'Alarm: EPO active',
      11: 'Alarm: Fan lock warning',
      12: 'Alarm: Overload warning',
      13: 'Alarm: Battery over charge',
      14: 'Alarm: IP site fail'
    }
  },
  { suffix: 'UPS_BATTERY_SOC', label: 'UPS Battery SOC', unit: '%', decimals: 0, statusKind: 'metric' },
  { suffix: 'UPS_BATTERY_REMAIN_TIME', label: 'UPS Battery remain time', unit: 'min', decimals: 0, statusKind: 'metric' },
  {
    suffix: 'UPS_WORKING_MODE',
    label: 'UPS Working mode',
    decimals: 0,
    statusKind: 'mode',
    decodeMap: UPS_WORKING_MODE_DECODE_MAP
  },
  { suffix: 'UPS_FAULT_CODE', label: 'UPS Fault code', decimals: 0, statusKind: 'fault' }
]

export function buildUpsFullRealtimePoints(deviceId = UPS1_DEVICE_ID) {
  return UPS_FULL_POINT_DEFS.map((point) => ({
    key: point.suffix.toLowerCase(),
    pointId: `${deviceId}_${point.suffix}`,
    label: point.label,
    unit: point.unit || '',
    decimals: point.decimals,
    statusKind: point.statusKind,
    ...(point.decodeMap ? { decodeMap: point.decodeMap } : {}),
    ...(point.bitDecodeMap ? { bitDecodeMap: point.bitDecodeMap } : {}),
    ...(point.zeroText ? { zeroText: point.zeroText } : {})
  }))
}

export const DG_DEVICE_ID = 'DG'
export const DG_DEVICE_IDS = [DG_DEVICE_ID]

const DG_DEVICE_LABELS = {
  DG: '柴油發電機'
}

export function getDgDeviceLabel(deviceId) {
  return DG_DEVICE_LABELS[deviceId] || deviceId
}

const scaleDecimals = (scale) => {
  if (!Number.isFinite(scale) || scale >= 1) return 0
  const text = String(scale)
  const index = text.indexOf('.')
  return index < 0 ? 0 : text.length - index - 1
}

const DG_FULL_POINT_DEFS = [
  {
    suffix: 'CONTROL_MODE',
    label: '控制模式',
    decimals: 0,
    statusKind: 'mode',
    decodeMap: {
      1: 'AUTO - Operation Mode Auto 自動',
      2: 'STOP - Operation Mode Stop 停止',
      4: 'MANUAL - Operation Mode Man 手動',
      8: 'TEST - Operation Mode Test 測試'
    }
  },
  {
    suffix: 'STATUS_MESSAGE',
    label: '狀態訊息',
    decimals: 0,
    statusKind: 'mode',
    decodeMap: {
      14354: 'STOP mode',
      4685: 'Operation mode TEST',
      14355: 'MAN mode',
      14353: 'AUTO mode',
      13253: 'AUTO mode ready',
      13201: 'Aux. services prerun',
      13204: 'Cool down',
      13214: 'Crank protect',
      13216: 'Idle run active',
      13250: 'Gen. stable time',
      13200: 'Aux. serv. postrun',
      13251: 'In operation',
      13207: 'Start - Pause',
      13203: 'Stop engine',
      13206: 'Start',
      13254: 'Ramp to rated',
      13252: 'Power limited prerun',
      13213: 'Ignition',
      13208: 'Preglow',
      13212: 'Turning',
      13263: 'Start w/o Load',
      13211: 'Emergency run',
      13271: 'Run-up Synchron.',
      13281: 'Derating active',
      13284: 'Inhibit cranking',
      13287: 'Uprating active',
      13288: 'Gen excitation lim.',
      13309: 'P(V) derating',
      14763: 'System update',
      14775: 'Keypad locked',
      13258: 'Loading generator',
      13264: 'Unloading mains',
      13256: 'Unloading generator',
      13261: 'GCB -> MCB Delay',
      13210: 'MCB dead bus close',
      13262: 'MCB -> GCB Delay',
      13259: 'Synchronization GCB',
      13260: 'Synchronization MCB',
      13205: 'Mains settling',
      13255: 'Open GCB',
      13257: 'Open MCB',
      13202: 'Critical mode',
      13215: 'Emergency/Critical',
      13209: 'GCB dead bus close',
      13265: 'Synch. PERMISSIVE',
      13266: 'Synch. CHECK',
      13267: 'Synch. OFF',
      13311: 'Inh.dead bus closure',
      13247: 'GCB closure disabled',
      14776: 'GC System update',
      14688: 'Frequency droop',
      14689: 'Voltage droop',
      14681: 'RF active mode'
    }
  },
  {
    suffix: 'CONTROL_COMMAND_STATUS',
    label: '控制指令狀態',
    decimals: 0,
    statusKind: 'mode',
    useDecodedStatus: true
  },
  {
    suffix: 'CONTROL_BITS_1',
    label: '控制位元 1',
    decimals: 0,
    statusKind: 'mode',
    bitDecodeMap: {
      0: 'Lamp test request',
      1: 'Auxiliary services postrun is active',
      2: 'Auxiliary services prerun is active',
      3: 'Engine release is active',
      4: 'Critical mode is active',
      5: 'Engine shall run 運轉',
      6: 'Breaker delay timer has expired',
      7: 'Engine monitoring delay expired',
      8: 'Auxiliary Services is active',
      9: 'Cooldown is active',
      10: 'A manual STOP has been requested',
      11: 'A manual START has been requested',
      12: 'Key activation',
      13: 'Start without closing GCB',
      14: 'Idle run is active',
      15: 'Idle mode OR Ramp to rated active'
    }
  },
  {
    suffix: 'CONTROL_BITS_2',
    label: '控制位元 2',
    decimals: 0,
    statusKind: 'mode',
    bitDecodeMap: {
      0: 'Increment Engine Start Counter',
      1: 'Free PID Controller 1: Raise Command',
      2: 'Free PID Controller 1: Lower Command',
      3: 'The genset runs mains parallel',
      4: 'Excitation enabled (Run-up Synchronization)',
      5: 'Stop solenoid is active',
      6: 'Free PID Controller 2: Raise Command',
      7: 'Free PID Controller 2: Lower Command',
      8: 'Free PID Controller 3: Raise Command',
      9: 'Free PID Controller 3: Lower Command',
      10: 'Remote Shutdown',
      11: 'Emergency mode is currently active',
      12: 'Mains settling',
      13: 'Preglow or Ignition is active',
      14: 'Operating Magnet / Gasrelay is active',
      15: 'Starter / Crank is active'
    }
  },
  {
    suffix: 'CONTROL_BITS_3',
    label: '控制位元 3',
    decimals: 0,
    statusKind: 'mode',
    bitDecodeMap: {
      0: 'Power limited prerun',
      1: 'Unloading mains is active',
      2: 'Unloading generator is active',
      3: 'Close command MCB is active',
      4: 'Open command MCB is active',
      5: 'Synchronisation MCB procedure is active',
      6: 'Close command GCB is active',
      7: 'Opening GCB relay is active',
      8: 'Synchronisation GCB procedure is active',
      9: 'Derating active (J1939 or freely)',
      10: 'MCB is closed',
      11: 'GCB is closed 輸出斷路器狀態',
      12: '3-Pos. Controller Volt./ReactPow lower',
      13: '3-Pos. Controller Volt./ReactPow raise',
      14: '3-Pos. Controller Freq./Power lower',
      15: '3-Pos. Controller Freq./Power raise'
    }
  },
  {
    suffix: 'CONTROL_BITS_5',
    label: '控制位元 5',
    decimals: 0,
    statusKind: 'mode',
    bitDecodeMap: {
      0: 'Parameter set 1-7 selection Bit 1',
      1: 'Parameter set 1-7 selection Bit 2',
      2: 'Parameter set 1-7 selection Bit 3',
      3: 'Opening GCB active',
      4: 'Mains decoubling enabled',
      5: 'LDSS MOP Reserve power 2 ready',
      6: 'LDSS IOP Reserve power 2 ready',
      7: 'LM Enable MCB',
      8: 'Synchronization mode Run active',
      9: 'Synchronization mode Permissive active',
      10: 'Synchronization mode Check active',
      11: 'LM Voltage Droop active',
      12: 'LM Frequency Droop active',
      13: 'Uprating active',
      14: 'Remote acknowledge',
      15: 'Remote Start request'
    }
  },
  {
    suffix: 'RELAY_OUTPUTS',
    label: '繼電器輸出',
    decimals: 0,
    statusKind: 'mode',
    bitDecodeMap: {
      4: '電壓頻率正常',
      5: '故障(預警)',
      11: '故障(停機)',
      12: '燃油',
      13: '啟動',
      14: '蜂鳴器告警'
    }
  },
  {
    suffix: 'ALARM_GENERAL',
    label: '一般告警',
    decimals: 0,
    statusKind: 'mode',
    bitDecodeMap: {
      0: 'Alarm class A latched',
      1: 'Alarm class B latched 輕故障 (警報)',
      2: 'Alarm class C latched',
      3: 'Alarm class D latched',
      4: 'Alarm class E latched',
      5: 'Alarm class F latched 重故障 (停機)',
      15: 'New Alarm triggered'
    }
  },
  {
    suffix: 'ALARMS_1',
    label: '告警 1',
    decimals: 0,
    statusKind: 'mode',
    bitDecodeMap: {
      3: 'Start fail detected latched 啟動超時',
      7: 'GCB fail to open latched ACB切離失敗',
      8: 'GCB fail to close latched ACB投入失敗'
    }
  },
  {
    suffix: 'ALARMS_AI_1',
    label: 'AI 告警 1',
    decimals: 0,
    statusKind: 'mode',
    bitDecodeMap: {
      0: 'Battery under voltage 1 latched 直流電源過低',
      1: 'Battery over voltage 1 latched 直流電源過高'
    }
  },
  {
    suffix: 'ALARMS_GEN_LATCHED',
    label: '發電機鎖存告警',
    decimals: 0,
    statusKind: 'mode',
    bitDecodeMap: {
      1: 'Generator overload IOP 2 latched 過載停機',
      3: 'Reverse / reduced power 2 latched 逆功率停機',
      5: 'Generator over current 3 latched 過電流3',
      6: 'Generator over current 2 latched 過電流2',
      8: 'Generator under voltage 2 latched 電壓過低停機',
      10: 'Generator over voltage 2 latched 電壓過高停機',
      12: 'Generator under frequency 2 latched 低頻運轉',
      14: 'Generator over frequency 2 latched 過頻率停機'
    }
  },
  {
    suffix: 'ALARMS_GEN_1',
    label: '發電機告警 1',
    decimals: 0,
    statusKind: 'mode',
    bitDecodeMap: {
      0: 'Gen.Power Factor leading 2 latched Mask',
      1: 'Gen.Power Factor leading 1 latched',
      2: 'Gen.Power Factor lagging 2 latched',
      3: 'Gen.Power Factor lagging 1 latched',
      4: 'Generator overload MOP 2 latched',
      5: 'Generator overload MOP 1 latched',
      6: 'Operating Range failed latched',
      7: 'Inverse time over current Latched',
      8: 'Generator unloading mismatch Latched',
      9: 'Gen. active power mismatch Latched',
      10: 'Gen. Phase Rotation mismatch Latched',
      11: 'Ground fault 2 latched',
      12: 'Ground fault 1 latched',
      13: 'Generator voltage asymmetry latched',
      14: 'Generator unbalanced load 2 latched',
      15: 'Generator unbalanced load 1 latched'
    }
  },
  {
    suffix: 'ALARMS_DI_1',
    label: 'DI 告警 1',
    decimals: 0,
    statusKind: 'mode',
    bitDecodeMap: {
      4: '市電並聯(基載輸出)',
      5: 'ACB故障',
      8: '輸出斷路器狀態',
      12: '高水溫',
      13: '低油溫',
      15: '緊急停車'
    }
  },
  { suffix: 'GENERATOR_FREQUENCY', label: '發電機頻率', unit: 'Hz', scale: 0.01 },
  { suffix: 'TOTAL_POWER', label: '總功率', unit: 'W', scale: 1 },
  { suffix: 'TOTAL_REACTIVE_POWER', label: '總虛功率', unit: 'var', scale: 1 },
  { suffix: 'GENERATOR_POWER_FACTOR', label: '發電機功因', unit: '', scale: 0.001 },
  { suffix: 'GENERATOR_VOLTAGE_L1_L2', label: '發電機電壓 L1-L2', unit: 'V', scale: 1 },
  { suffix: 'GENERATOR_VOLTAGE_L2_L3', label: '發電機電壓 L2-L3', unit: 'V', scale: 1 },
  { suffix: 'GENERATOR_VOLTAGE_L3_L1', label: '發電機電壓 L3-L1', unit: 'V', scale: 1 },
  { suffix: 'GENERATOR_VOLTAGE_L1_N', label: '發電機電壓 L1-N', unit: 'V', scale: 1 },
  { suffix: 'GENERATOR_VOLTAGE_L2_N', label: '發電機電壓 L2-N', unit: 'V', scale: 1 },
  { suffix: 'GENERATOR_VOLTAGE_L3_N', label: '發電機電壓 L3-N', unit: 'V', scale: 1 },
  { suffix: 'GENERATOR_CURRENT_L1', label: '發電機電流 L1', unit: 'A', scale: 1 },
  { suffix: 'GENERATOR_CURRENT_L2', label: '發電機電流 L2', unit: 'A', scale: 1 },
  { suffix: 'GENERATOR_CURRENT_L3', label: '發電機電流 L3', unit: 'A', scale: 1 },
  { suffix: 'BATTERY_VOLTAGE', label: '電瓶電壓', unit: 'V', scale: 0.1 },
  { suffix: 'START_COUNT', label: '啟動次數', unit: '', scale: 1 },
  { suffix: 'ENGINE_OIL_PRESSURE', label: '引擎油壓', unit: 'bar', scale: 1 },
  { suffix: 'ENGINE_COOLANT_TEMPERATURE', label: '引擎水溫', unit: '°C', scale: 1 },
  { suffix: 'TOTAL_GEN_POWER', label: 'Total gen. power', unit: 'W', scale: 1 },
  { suffix: 'TOTAL_GEN_REACTIVE_POWER', label: 'Total gen. reactive power', unit: 'VAR', scale: 1 },
  { suffix: 'TOTAL_GEN_APPARENT_POWER', label: 'Total gen. apparent power', unit: 'VA', scale: 1 },
  { suffix: 'AVG_GEN_WYE_VOLTAGE', label: 'Av. Gen. Wye-Voltage', unit: 'V', scale: 0.1 },
  { suffix: 'AVG_GEN_DELTA_VOLTAGE', label: 'Av. Gen. Delta-Voltage', unit: 'V', scale: 0.1 },
  { suffix: 'AVG_BUSBAR1_DELTA_VOLTAGE', label: 'Av. Busbar 1 Delta-Voltage', unit: 'V', scale: 0.1 },
  { suffix: 'AVG_GEN_CURRENT', label: 'Av. Gen. Current', unit: 'A', scale: 0.001 },
  { suffix: 'GEN_CURRENT_1', label: 'Gen. current 1', unit: 'A', scale: 0.001 },
  { suffix: 'GEN_CURRENT_2', label: 'Gen. current 2', unit: 'A', scale: 0.001 },
  { suffix: 'GEN_CURRENT_3', label: 'Gen. current 3', unit: 'A', scale: 0.001 },
  { suffix: 'MEASURED_GROUND_CURRENT', label: 'Meas. ground current', unit: 'A', scale: 0.001 },
  { suffix: 'CALCULATED_GROUND_CURRENT', label: 'Calculated ground current', unit: 'A', scale: 0.001 },
  { suffix: 'GEN_VOLTAGE_L1_L2', label: 'Gen. voltage L1-L2', unit: 'V', scale: 0.1 },
  { suffix: 'GEN_VOLTAGE_L2_L3', label: 'Gen. voltage L2-L3', unit: 'V', scale: 0.1 },
  { suffix: 'GEN_VOLTAGE_L3_L1', label: 'Gen. voltage L3-L1', unit: 'V', scale: 0.1 },
  { suffix: 'GEN_VOLTAGE_L1_N', label: 'Gen. voltage L1-N', unit: 'V', scale: 0.1 },
  { suffix: 'GEN_VOLTAGE_L2_N', label: 'Gen. voltage L2-N', unit: 'V', scale: 0.1 },
  { suffix: 'GEN_VOLTAGE_L3_N', label: 'Gen. voltage L3-N', unit: 'V', scale: 0.1 },
  { suffix: 'GEN_ACTIVE_POWER_1_N', label: 'Gen. active power 1-N', unit: 'W', scale: 1 },
  { suffix: 'GEN_ACTIVE_POWER_2_N', label: 'Gen. active power 2-N', unit: 'W', scale: 1 },
  { suffix: 'GEN_ACTIVE_POWER_3_N', label: 'Gen. active power 3-N', unit: 'W', scale: 1 },
  { suffix: 'BUSBAR1_VOLTAGE_L1_L2', label: 'Busbar 1: voltage L1-L2', unit: 'V', scale: 0.1 },
  { suffix: 'GEN_REAL_ENERGY', label: 'Gen. real energy', unit: 'MWh', scale: 0.01 },
  { suffix: 'RUN_HOURS', label: '運轉積時', unit: 'h', scale: 0.01 },
  { suffix: 'LOAD_OUTPUT_SETPOINT_STATUS', label: '負載輸出設定點 Status', unit: 'W', scale: 1 }
]

export function buildDgFullRealtimePoints(deviceId = DG_DEVICE_ID) {
  return DG_FULL_POINT_DEFS.map((point) => ({
    key: point.suffix.toLowerCase(),
    pointId: `${deviceId}_${point.suffix}`,
    label: point.label,
    unit: point.unit || '',
    decimals: point.decimals ?? scaleDecimals(point.scale ?? 1),
    statusKind: point.statusKind || 'metric',
    ...(point.scale != null ? { scale: point.scale } : {}),
    ...(point.decodeMap ? { decodeMap: point.decodeMap } : {}),
    ...(point.bitDecodeMap ? { bitDecodeMap: point.bitDecodeMap } : {}),
    ...((point.statusKind === 'mode' || point.useDecodedStatus) ? { useDecodedStatus: true } : {})
  }))
}

export const FG4010_DEVICE_ID = 'FG4010'
export const FG4010_DEVICE_IDS = [FG4010_DEVICE_ID]

const FG4010_DEVICE_LABELS = {
  FG4010: 'FG4010'
}

export function getFg4010DeviceLabel(deviceId) {
  return FG4010_DEVICE_LABELS[deviceId] || deviceId
}

const FG4010_FULL_POINT_DEFS = [
  { suffix: 'ACTIVE_POWER', label: 'Active power', unit: 'kW', decimals: 2 },
  { suffix: 'APPARENT_POWER', label: 'Apparent power', unit: 'kVA', decimals: 2 },
  { suffix: 'ATS_RUN_STATUS', label: 'ATS run status', decimals: 0, statusKind: 'status', useDecodedStatus: true },
  { suffix: 'AUTO_RUN_STATUS', label: 'Auto run status', decimals: 0, statusKind: 'status', useDecodedStatus: true },
  { suffix: 'BATTERY_VOLTAGE', label: 'Battery voltage', unit: 'V', decimals: 2 },
  { suffix: 'CONTROLLER_RUN_STATUS', label: 'Controller run status', decimals: 0, statusKind: 'status', useDecodedStatus: true },
  { suffix: 'D_PLUS_VOLTAGE', label: 'D+ voltage', unit: 'V', decimals: 2 },
  { suffix: 'GEN_FREQUENCY', label: 'Gen frequency', unit: 'Hz', decimals: 2 },
  { suffix: 'LOAD_PERCENT', label: 'Load percent', unit: '%', decimals: 1 },
  { suffix: 'MAINS_FREQUENCY', label: 'Mains frequency', unit: 'Hz', decimals: 2 },
  { suffix: 'MAINS_STATUS', label: 'Mains status', decimals: 0, statusKind: 'status', useDecodedStatus: true },
  { suffix: 'POWER_FACTOR', label: 'Power factor', decimals: 3 },
  { suffix: 'REACTIVE_POWER', label: 'Reactive power', unit: 'kVar', decimals: 2 },
  { suffix: 'RUN_HOURS', label: 'Run hours', unit: 'h', decimals: 0 },
  { suffix: 'RUN_MINUTES', label: 'Run minutes', unit: 'min', decimals: 0 },
  { suffix: 'RUN_SECONDS', label: 'Run seconds', unit: 's', decimals: 0 },
  { suffix: 'START_COUNT', label: 'Start count', decimals: 0 },
  { suffix: 'STATUS_1', label: 'Status 1', decimals: 0, statusKind: 'status', useDecodedStatus: true },
  { suffix: 'STATUS_2', label: 'Status 2', decimals: 0, statusKind: 'status', useDecodedStatus: true },
  { suffix: 'STATUS_3', label: 'Status 3', decimals: 0, statusKind: 'status', useDecodedStatus: true },
  { suffix: 'STATUS_4', label: 'Status 4', decimals: 0, statusKind: 'status', useDecodedStatus: true },
  { suffix: 'STATUS_5', label: 'Status 5', decimals: 0, statusKind: 'status', useDecodedStatus: true },
  { suffix: 'STATUS_6', label: 'Status 6', decimals: 0, statusKind: 'status', useDecodedStatus: true },
  { suffix: 'TOTAL_ENERGY', label: 'Total energy', unit: 'kWh', decimals: 2 },
  { suffix: 'TOTAL_FUEL_CONSUMPTION', label: 'Total fuel consumption', decimals: 2 },
  ...[771, 772, 773, 774, 775, 776, 778, 779, 780, 781, 782, 783, 785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 801, 802, 803, 804, 821, 822, 823, 825, 826, 827, 828, 829, 830, 831, 832, 833, 836]
    .map((reg) => ({ suffix: `REG_${reg}`, label: `REG ${reg}`, decimals: 0 })),
  ...[806, 808, 810, 812]
    .map((reg) => ({ suffix: `DELAY_${reg}`, label: `Delay ${reg}`, decimals: 0 }))
]

export function buildFg4010FullRealtimePoints(deviceId = FG4010_DEVICE_ID) {
  return FG4010_FULL_POINT_DEFS.map((point) => ({
    key: point.suffix.toLowerCase(),
    pointId: `${deviceId}_${point.suffix}`,
    label: point.label,
    unit: point.unit || '',
    decimals: point.decimals,
    statusKind: point.statusKind || 'metric',
    ...(point.useDecodedStatus ? { useDecodedStatus: true } : {})
  }))
}

export function buildBmsRealtimePoints(unitIndex) {
  const prefix = `BMS${unitIndex}`
  return [
    {
      key: 'soc',
      pointId: `${prefix}_SOC`,
      label: 'SOC',
      unit: '%',
      decimals: 2,
      trimSecondDecimal: true
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

const BMS_FULL_EXTRA_POINT_DEFS = [
  { suffix: 'SOC_kWh', label: 'SOC_kWh', unit: 'kWh', decimals: 2 },
  { suffix: 'TOTAL_NOMINAL_AH', label: 'Total nominal Ah', unit: 'Ah', decimals: 2 },
  { suffix: 'CELL_VOLTAGE_RACK_INDEX', label: 'Cell voltage rack index', decimals: 0 },
  { suffix: 'RACK_TEMP_INDEX', label: 'Rack temp index', decimals: 0 },
  { suffix: 'RACK_VOLTAGE_INDEX', label: 'Rack voltage index', decimals: 0 },
  {
    suffix: 'MAX_MODULE_TEMP',
    label: 'Max module temp(Rack,Module,Cell)',
    unit: '°C',
    decimals: 1,
    indexPointKeys: ['max_module_temp_rack_index', 'max_module_temp_module_index', 'max_module_temp_index']
  },
  { suffix: 'MAX_MODULE_TEMP_INDEX', label: 'Max module temp index', hidden: true },
  { suffix: 'MAX_MODULE_TEMP_MODULE_INDEX', label: 'Max module temp module index', hidden: true },
  { suffix: 'MAX_MODULE_TEMP_RACK_INDEX', label: 'Max module temp rack index', hidden: true },
  {
    suffix: 'MIN_MODULE_TEMP',
    label: 'Min module temp(Rack,Module,Cell)',
    unit: '°C',
    decimals: 1,
    indexPointKeys: ['min_module_temp_rack_index', 'min_module_temp_module_index', 'min_module_temp_index']
  },
  { suffix: 'MIN_MODULE_TEMP_INDEX', label: 'Min module temp index', hidden: true },
  { suffix: 'MIN_MODULE_TEMP_MODULE_INDEX', label: 'Min module temp module index', hidden: true },
  { suffix: 'MIN_MODULE_TEMP_RACK_INDEX', label: 'Min module temp rack index', hidden: true },
  {
    suffix: 'MAX_MODULE_VOLTAGE',
    label: 'Max module voltage(Rack,Module,Cell)',
    unit: 'V',
    decimals: 2,
    indexPointKeys: ['max_module_voltage_rack_index', 'max_module_voltage_module_index', 'max_module_voltage_index']
  },
  { suffix: 'MAX_MODULE_VOLTAGE_INDEX', label: 'Max module voltage index', hidden: true },
  { suffix: 'MAX_MODULE_VOLTAGE_MODULE_INDEX', label: 'Max module voltage module index', hidden: true },
  { suffix: 'MAX_MODULE_VOLTAGE_RACK_INDEX', label: 'Max module voltage rack index', hidden: true },
  {
    suffix: 'MIN_MODULE_VOLTAGE',
    label: 'Min module voltage(Rack,Module,Cell)',
    unit: 'V',
    decimals: 2,
    indexPointKeys: ['min_module_voltage_rack_index', 'min_module_voltage_module_index', 'min_module_voltage_index']
  },
  { suffix: 'MIN_MODULE_VOLTAGE_INDEX', label: 'Min module voltage index', hidden: true },
  { suffix: 'MIN_MODULE_VOLTAGE_MODULE_INDEX', label: 'Min module voltage module index', hidden: true },
  { suffix: 'MIN_MODULE_VOLTAGE_RACK_INDEX', label: 'Min module voltage rack index', hidden: true },
  {
    suffix: 'MAX_RACK_TEMP',
    label: 'Max rack temp(Rack)',
    unit: '°C',
    decimals: 1,
    indexPointKeys: ['max_rack_temp_rack_index']
  },
  { suffix: 'MAX_RACK_TEMP_RACK_INDEX', label: 'Max rack temp rack index', hidden: true },
  {
    suffix: 'MIN_RACK_TEMP',
    label: 'Min rack temp(Rack)',
    unit: '°C',
    decimals: 1,
    indexPointKeys: ['min_rack_temp_rack_index']
  },
  { suffix: 'MIN_RACK_TEMP_RACK_INDEX', label: 'Min rack temp rack index', hidden: true },
  {
    suffix: 'MAX_RACK_VOLTAGE',
    label: 'Max rack voltage(Rack)',
    unit: 'V',
    decimals: 2,
    indexPointKeys: ['max_rack_voltage_rack_index']
  },
  { suffix: 'MAX_RACK_VOLTAGE_RACK_INDEX', label: 'Max rack voltage rack index', hidden: true },
  {
    suffix: 'MIN_RACK_VOLTAGE',
    label: 'Min rack voltage(Rack)',
    unit: 'V',
    decimals: 2,
    indexPointKeys: ['min_rack_voltage_rack_index']
  },
  { suffix: 'MIN_RACK_VOLTAGE_RACK_INDEX', label: 'Min rack voltage rack index', hidden: true }
]

function buildBmsExtraRealtimePoints(prefix) {
  return BMS_FULL_EXTRA_POINT_DEFS.map((point) => ({
    key: point.suffix.toLowerCase(),
    pointId: `${prefix}_${point.suffix}`,
    label: point.label,
    unit: point.unit || '',
    decimals: point.decimals,
    hidden: point.hidden || false,
    ...(point.indexPointKeys ? { indexPointKeys: point.indexPointKeys } : {})
  }))
}

export function buildBmsFullRealtimePoints(unitIndex) {
  const prefix = `BMS${unitIndex}`
  return [
    ...buildBmsRealtimePoints(unitIndex),
    ...buildBmsExtraRealtimePoints(prefix),
    {
      key: 'racksErrorStatus',
      pointId: `${prefix}_RACKS_ERROR_STATUS`,
      label: 'RACKS_ERROR_STATUS',
      decimals: 0
    },
    {
      key: 'racksWorkingStatus',
      pointId: `${prefix}_RACKS_WORKING_STATUS`,
      label: 'RACKS_WORKING_STATUS',
      decimals: 0,
      useDecodedStatus: true
    },
    {
      key: 'rackCommErrorStatus',
      pointId: `${prefix}_RACK_COMM_ERROR_STATUS`,
      label: 'RACK_COMM_ERROR_STATUS',
      decimals: 0
    },
    {
      key: 'rackOnlineStatus',
      pointId: `${prefix}_RACK_ONLINE_STATUS`,
      label: 'RACK_ONLINE_STATUS',
      decimals: 0,
      useDecodedStatus: true
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
  // PCS 狀態欄
  { suffix: 'ACTIVE_POWER_CONTROL_ENABLE', label: '實功率控制啟用', decimals: 0 },
  { suffix: 'AC_SWITCH_STATUS', label: 'AC Switch 狀態', decimals: 0, statusKind: 'status' },
  { suffix: 'ALARM_W01', label: '告警 W01', decimals: 0 },
  { suffix: 'ALARM_W02', label: '告警 W02', decimals: 0 },
  { suffix: 'ALARM_W03', label: '告警 W03', decimals: 0 },
  { suffix: 'ALARM_W04', label: '告警 W04', decimals: 0 },
  { suffix: 'ALARM_W05', label: '告警 W05', decimals: 0 },
  { suffix: 'ALARM_W06', label: '告警 W06', decimals: 0 },
  { suffix: 'POWER_COMMAND', label: '功率指令', decimals: 0 },
  { suffix: 'REMOTE_ENABLE_STATUS', label: 'Remote enable 狀態', decimals: 0, statusKind: 'status' },
  { suffix: 'RUN_STATE', label: '運轉狀態', decimals: 0 },
  { suffix: 'SYSTEM_RUN_MODE_COMMAND', label: '系統運轉模式指令', decimals: 0 },
  { suffix: 'U1_GRID_MODE_COMMAND', label: 'U1 併網模式指令', decimals: 0 },
  { suffix: 'U1_GRID_MODE', label: 'U1 併網模式', decimals: 0 },
  { suffix: 'DC_SWITCH_STATUS', label: 'DC Switch 狀態', decimals: 0, statusKind: 'status' },
  // 無單位 / 功率因數
  { suffix: 'POWER_FACTOR', label: '功率因數', decimals: 3 },
  { suffix: 'U1_POWER_FACTOR', label: 'U1 功率因數', decimals: 3 },
  // kW
  { suffix: 'ACTIVE_POWER_SETPOINT', label: '實功率設定值', unit: 'kW', decimals: 2 },
  { suffix: 'MAX_CHARGE_POWER', label: '最大充電功率', unit: 'kW', decimals: 2 },
  { suffix: 'MAX_DISCHARGE_POWER', label: '最大放電功率', unit: 'kW', decimals: 2 },
  { suffix: 'SYSTEM_ACTIVE_POWER', label: '系統實功率', unit: 'kW', decimals: 2 },
  { suffix: 'U1_ACTIVE_POWER', label: 'U1 實功率', unit: 'kW', decimals: 2 },
  { suffix: 'U1_DC_POWER', label: 'U1 DC 功率', unit: 'kW', decimals: 2 },
  // kVA
  { suffix: 'SYSTEM_APPARENT_POWER', label: '系統視在功率', unit: 'kVA', decimals: 2 },
  { suffix: 'U1_APPARENT_POWER', label: 'U1 視在功率', unit: 'kVA', decimals: 2 },
  // kVar
  { suffix: 'SYSTEM_REACTIVE_POWER', label: '系統虛功率', unit: 'kVar', decimals: 2 },
  { suffix: 'U1_REACTIVE_POWER', label: 'U1 虛功率', unit: 'kVar', decimals: 2 },
  // DC setpoints
  { suffix: 'CONSTANT_CURRENT_SETPOINT', label: '定電流設定值', unit: 'A', decimals: 2 },
  { suffix: 'CONSTANT_VOLTAGE_DC_SETPOINT', label: 'DC 定電壓設定值', unit: 'V', decimals: 2 },
  // A
  { suffix: 'U1_AC_LEAKAGE_CURRENT', label: 'U1 AC 漏電流', unit: 'A', decimals: 2 },
  { suffix: 'U1_DC_CURRENT', label: 'U1 DC 電流', unit: 'A', decimals: 2 },
  { suffix: 'U1_OUTPUT_U_CURRENT', label: 'U1 輸出 U 電流', unit: 'A', decimals: 2 },
  { suffix: 'U1_OUTPUT_V_CURRENT', label: 'U1 輸出 V 電流', unit: 'A', decimals: 2 },
  { suffix: 'U1_OUTPUT_W_CURRENT', label: 'U1 輸出 W 電流', unit: 'A', decimals: 2 },
  // V
  { suffix: 'U1_DC_VOLTAGE', label: 'U1 DC 電壓', unit: 'V', decimals: 2 },
  { suffix: 'U1_GRID_U_UV_VOLTAGE', label: 'U1 電網 UV 電壓', unit: 'V', decimals: 2 },
  { suffix: 'U1_GRID_V_VW_VOLTAGE', label: 'U1 電網 VW 電壓', unit: 'V', decimals: 2 },
  { suffix: 'U1_GRID_W_WU_VOLTAGE', label: 'U1 電網 WU 電壓', unit: 'V', decimals: 2 },
  // Hz
  { suffix: 'U1_FREQUENCY', label: 'U1 頻率', unit: 'Hz', decimals: 2 },
  // °C
  { suffix: 'U1_IGBT_U_TEMP', label: 'U1 IGBT U 溫度', unit: '°C', decimals: 1 },
  { suffix: 'U1_IGBT_V_TEMP', label: 'U1 IGBT V 溫度', unit: '°C', decimals: 1 },
  { suffix: 'U1_IGBT_W_TEMP', label: 'U1 IGBT W 溫度', unit: '°C', decimals: 1 },
  { suffix: 'U1_INTERNAL_TEMP', label: 'U1 內部溫度', unit: '°C', decimals: 1 },
  // 其他
  { suffix: 'U1_INSULATION_RESISTANCE', label: 'U1 絕緣阻抗', decimals: 2 }
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
