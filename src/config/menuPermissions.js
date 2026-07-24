export const ALL_PERMISSION_KEYS = [
  'system-overview',
  'real-time-power',
  'history',
  'pv-system',
  'ess-system',
  'genset-system',
  'PV-Prediction',
  'Load-Prediction',
  'charge-discharge-schedule',
  'power-service-schedule',
  'event-log',
  'operation-log',
  'users',
  'permissions',
  'reports',
  'api-test'
]

export const PERMISSION_GROUPS = [
  {
    label: '系統總覽',
    items: [{ key: 'system-overview', label: '系統總覽', path: '/system-overview' }]
  },
  {
    label: '系統資訊',
    items: [
      { key: 'real-time-power', label: '即時電力曲線', path: '/real-time-power' },
      { key: 'history', label: '歷史電力曲線', path: '/history' }
    ]
  },
  {
    label: '電力資訊',
    items: [
      { key: 'pv-system', label: '太陽光電系統', path: '/pv-system' },
      { key: 'ess-system', label: '儲能系統', path: '/ess-system' },
      { key: 'genset-system', label: '柴油發電機', path: '/genset-system' }
    ]
  },
  {
    label: '預測資訊',
    items: [
      { key: 'PV-Prediction', label: '光電預測', path: '/PV-Prediction' },
      { key: 'Load-Prediction', label: '負載預測', path: '/Load-Prediction' }
    ]
  },
  {
    label: '排程',
    items: [
      { key: 'charge-discharge-schedule', label: '充放電排程', path: '/charge-discharge-schedule' },
      { key: 'power-service-schedule', label: '電力服務排程', path: '/power-service-schedule' }
    ]
  },
  {
    label: '事件紀錄',
    items: [
      { key: 'event-log', label: '事件紀錄', path: '/event-log' },
      { key: 'operation-log', label: '操作紀錄', path: '/operation-log' }
    ]
  },
  {
    label: '帳號管理',
    items: [
      { key: 'users', label: '使用者管理', path: '/users' },
      { key: 'permissions', label: '權限管理', path: '/permissions' }
    ]
  },
  {
    label: '其他',
    items: [
      { key: 'reports', label: '報表輸出', path: '/reports' },
      { key: 'api-test', label: 'API 測試', path: '/api-test' }
    ]
  }
]

export const ROUTE_PERMISSION_MAP = PERMISSION_GROUPS.flatMap((group) =>
  group.items.map((item) => [item.path, item.key])
).reduce((acc, [path, key]) => {
  acc[path] = key
  return acc
}, {})

export function getPermissionLabel(key) {
  for (const group of PERMISSION_GROUPS) {
    const item = group.items.find((entry) => entry.key === key)
    if (item) return item.label
  }
  return key
}
