/**
 * 產生 hg-microgrid-ems API 程式說明文件（Word + PPT）
 * 執行：node scripts/generate_api_docs.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, PageBreak,
} from 'docx'
import PptxGenJS from 'pptxgenjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = path.join(__dirname, '..', 'docs')
const WORD_OUT = path.join(DOCS_DIR, '微電網EMS_API程式說明_初學者版.docx')
const PPT_OUT = path.join(DOCS_DIR, '微電網EMS_API程式說明_初學者版.pptx')

const FONT = 'Microsoft JhengHei'
const CODE = 'Consolas'

const T = (s, o = {}) => new TextRun({ text: s, font: FONT, size: o.size || 22, bold: o.bold })
const P = (c, o = {}) => new Paragraph({
  children: Array.isArray(c) ? c : [T(c)],
  spacing: { after: o.after ?? 120 },
  alignment: o.align,
})
const H = (t, lv = 1) => new Paragraph({
  text: t,
  heading: [HeadingLevel.TITLE, HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3][lv],
  spacing: { before: 240, after: 120 },
})
const B = (t) => new Paragraph({ text: t, bullet: { level: 0 }, spacing: { after: 60 } })
const C = (t) => new Paragraph({
  children: [new TextRun({ text: t, font: CODE, size: 18 })],
  spacing: { before: 80, after: 80 },
  indent: { left: 360 },
})
const PB = () => new Paragraph({ children: [new PageBreak()] })

function tbl(headers, rows) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' }
  const b = { top: border, bottom: border, left: border, right: border }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headers.map(h => new TableCell({ borders: b, children: [P([T(h, { bold: true })])] })) }),
      ...rows.map(r => new TableRow({ children: r.map(c => new TableCell({ borders: b, children: [P(String(c))] })) })),
    ],
  })
}

const BMS1_POINTS = [
  ['BMS1_SOC', 'SOC', '%'],
  ['BMS1_AVG_RACK_VOLTAGE', '平均電壓', 'V'],
  ['BMS1_MAX_CELL_VOLTAGE', '最高單體電壓', 'V'],
  ['BMS1_MIN_CELL_VOLTAGE', '最低單體電壓', 'V'],
  ['BMS1_AVG_SOH', '平均 SOH', '%'],
  ['BMS1_MAX_CELL_TEMP', '最高單體溫度', '°C'],
  ['BMS1_MIN_CELL_TEMP', '最低單體溫度', '°C'],
]

function buildWordSections() {
  const s = []

  s.push(new Paragraph({
    children: [T('臺南市小型防災微電網 EMS', { size: 52, bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }))
  s.push(P('API 程式說明文件（初學者版）', { align: AlignmentType.CENTER }))
  s.push(P(''))
  s.push(P([
    T('專案：', { bold: true }), T('hg-microgrid-ems\n'),
    T('版本：', { bold: true }), T('1.0\n'),
    T('對象：', { bold: true }), T('後端 / 全端初學者\n'),
    T('說明：', { bold: true }), T('PostgreSQL 即時資料 API 與前端串接'),
  ], { align: AlignmentType.CENTER }))
  s.push(PB())

  s.push(H('目錄', 1))
  ;[
    '第一章  API 在做什麼？',
    '第二章  整體架構（從資料庫到畫面）',
    '第三章  專案目錄與檔案說明',
    '第四章  資料庫 vpp_realtime 結構',
    '第五章  API 端點說明',
    '第六章  後端程式流程（Node.js）',
    '第七章  前端如何呼叫 API',
    '第八章  開發環境設定與啟動',
    '第九章  常見錯誤排除',
    '第十章  未來擴充：BMS-2 ~ BMS-8',
    '附錄 A  BMS-1 點位清單',
    '附錄 B  建議閱讀順序',
  ].forEach(t => s.push(B(t)))
  s.push(PB())

  // 第一章
  s.push(H('第一章  API 在做什麼？', 1))
  s.push(P('本專案的 API 是一個「中間人」程式，負責：'))
  ;[
    '從 PostgreSQL 資料庫讀取即時點位資料（vpp_realtime 資料表）',
    '把資料整理成 JSON 格式，提供給 Vue 前端網頁使用',
    '目前主要用於佳里國中（MG-TNN-001）儲能系統 BMS-1 的即時監控',
  ].forEach(t => s.push(B(t)))
  s.push(P('白話理解：資料庫像倉庫，API 像服務生，前端網頁像客人。客人不能直接進倉庫，必須透過服務生點餐（發 HTTP 請求），服務生去倉庫取資料後端上桌（回傳 JSON）。'))

  // 第二章
  s.push(H('第二章  整體架構', 1))
  s.push(P('資料流向如下：'))
  s.push(C(
    'PostgreSQL (192.168.1.17:5432 / vpp)\n' +
    '    ↓ SQL 查詢 vpp_realtime\n' +
    'backend-node/ (Express API, port 5000)\n' +
    '    ↓ JSON HTTP 回應\n' +
    'Vite Dev Server (port 5173) — proxy /api → localhost:5000\n' +
    '    ↓ fetch()\n' +
    'Vue 前端 (useBmsRealtime.js → ESSSystem.vue → CabinetEssScene.vue)\n' +
    '    ↓ 畫面顯示\n' +
    '使用者瀏覽器（懸停 BMS-1 看即時資訊）'
  ))
  s.push(P([T('為什麼需要 Vite Proxy？', { bold: true }), T(' 開發時前端在 5173 埠、API 在 5000 埠。Proxy 讓前端可以用 /api 相對路徑呼叫，避免跨域（CORS）問題。')]))
  s.push(tbl(['層級', '技術', '角色'],
    [
      ['資料層', 'PostgreSQL', '儲存案場即時點位'],
      ['API 層', 'Node.js + Express + pg', '查詢資料庫、回傳 JSON'],
      ['代理層', 'Vite proxy', '開發模式轉送 /api 請求'],
      ['前端層', 'Vue 3 + composable', '定時 fetch、更新畫面'],
    ]))

  // 第三章
  s.push(H('第三章  專案目錄與檔案說明', 1))
  s.push(C(
    `hg-microgrid-ems/\n` +
    `├── backend/                 ← Python Flask 版 API（可選）\n` +
    `│   ├── app.py               ← Flask 路由\n` +
    `│   ├── db.py                ← PostgreSQL 查詢\n` +
    `│   └── .env                 ← 資料庫連線設定\n` +
    `├── backend-node/            ← Node.js 版 API（建議使用）\n` +
    `│   ├── server.mjs           ← Express 路由、啟動伺服器\n` +
    `│   ├── db.mjs               ← 連線池、fetchLatestPoint()\n` +
    `│   └── serialize.mjs        ← jsonb 數值解析\n` +
    `├── vite.config.js           ← /api proxy 設定\n` +
    `├── .env.development         ← VITE_API_BASE_URL（留空走 proxy）\n` +
    `└── src/\n` +
    `    ├── config/vppSites.js   ← 案場代碼、BMS 點位定義\n` +
    `    ├── composables/useBmsRealtime.js  ← 前端輪詢 API\n` +
    `    ├── views/ESSSystem.vue  ← 儲能頁面\n` +
    `    └── components/ess/CabinetEssScene.vue  ← BMS 懸停資訊`
  ))
  s.push(tbl(['檔案', '初學者該知道的事'],
    [
      ['backend-node/server.mjs', '定義 URL 路徑，收到請求後呼叫 db.mjs'],
      ['backend-node/db.mjs', '真正執行 SQL 的地方'],
      ['backend-node/serialize.mjs', '把 DB 的 jsonb 值轉成數字'],
      ['src/config/vppSites.js', '前端要查哪些點位，在這裡設定'],
      ['useBmsRealtime.js', '每 5 秒向 API 要資料'],
    ]))

  // 第四章
  s.push(H('第四章  資料庫 vpp_realtime 結構', 1))
  s.push(P('佳里國中 BMS 資料存在 vpp 資料庫的 vpp_realtime 資料表。主要欄位：'))
  s.push(tbl(['欄位', '類型', '說明'],
    [
      ['site_id', 'text (PK)', '案場代碼，如 MG-TNN-001'],
      ['device_id', 'text (PK)', '設備代碼，如 BMS1'],
      ['point_id', 'text (PK)', '點位代碼，如 BMS1_SOC'],
      ['value', 'jsonb', '數值（可能是 0.0 等純量）'],
      ['quality', 'text', '資料品質，如 good'],
      ['sample_time', 'timestamptz', '取樣時間'],
      ['updated_at', 'timestamptz', '更新時間（API 排序用）'],
    ]))
  s.push(P('查詢條件範例：site_id=MG-TNN-001 AND device_id=BMS1 AND point_id=BMS1_SOC，取 updated_at 最新一筆。'))

  // 第五章
  s.push(H('第五章  API 端點說明', 1))
  s.push(tbl(['方法', '路徑', '用途', '參數'],
    [
      ['GET', '/api/health/db', '測試資料庫連線', '無'],
      ['GET', '/api/vpp/realtime/latest', '查詢任意點位最新值', 'site_id, device_id, point_id'],
      ['GET', '/api/vpp/jiali/bms1/voltage', '佳里 BMS-1 電壓快捷端點', '無'],
      ['GET', '/time', '伺服器時間', '無'],
    ]))
  s.push(H('5.1 通用查詢範例', 2))
  s.push(C(
    'GET /api/vpp/realtime/latest?\n' +
    '  site_id=MG-TNN-001&\n' +
    '  device_id=BMS1&\n' +
    '  point_id=BMS1_SOC'
  ))
  s.push(H('5.2 成功回應範例', 2))
  s.push(C(
    `{\n` +
    `  "ok": true,\n` +
    `  "data": {\n` +
    `    "site_id": "MG-TNN-001",\n` +
    `    "device_id": "BMS1",\n` +
    `    "point_id": "BMS1_SOC",\n` +
    `    "numeric_value": 35.0,\n` +
    `    "quality": "good",\n` +
    `    "recorded_at": "2026-07-16T17:05:29+08:00",\n` +
    `    "unit": "V",\n` +
    `    "label": "平均電壓"\n` +
    `  }\n` +
    `}`
  ))
  s.push(H('5.3 錯誤回應', 2))
  s.push(tbl(['HTTP 狀態', '意義', '常見原因'],
    [
      ['404', '查無資料', 'DB 沒有該點位紀錄'],
      ['500', '伺服器錯誤', 'DB 連線失敗、欄位名稱不符'],
      ['502（前端）', 'Bad Gateway', 'API 未啟動，需 npm run dev:api'],
    ]))

  // 第六章
  s.push(H('第六章  後端程式流程（Node.js）', 1))
  s.push(P('以 GET /api/vpp/realtime/latest 為例，程式執行順序：'))
  ;[
    '1. 使用者（或前端）發送 HTTP GET 請求，帶 query 參數',
    '2. server.mjs 的 app.get() 收到請求，讀取 site_id / device_id / point_id',
    '3. 呼叫 db.mjs 的 fetchLatestPoint()',
    '4. db.mjs 查 information_schema 確認 vpp_realtime 欄位名稱',
    '5. 若 value 是 jsonb，用 (value #>> \'{}\') 取出數值',
    '6. 依 updated_at DESC 排序，LIMIT 1 取最新一筆',
    '7. serialize.mjs 的 serializeRow() 解析數值、格式化時間',
    '8. server.mjs 回傳 res.json({ ok: true, data: ... })',
  ].forEach(t => s.push(B(t)))
  s.push(H('6.1 db.mjs 重點函式', 2))
  s.push(C(
    `fetchLatestPoint(siteId, deviceId, pointId)\n` +
    `  → 自動偵測 value / updated_at 等欄位\n` +
    `  → 回傳 { point_value, recorded_at, quality, ... }\n\n` +
    `checkDbHealth()\n` +
    `  → SELECT 1 測試連線`
  ))
  s.push(H('6.2 環境變數（backend/.env）', 2))
  s.push(tbl(['變數', '範例', '說明'],
    [
      ['PG_HOST', '192.168.1.17', 'PostgreSQL 主機'],
      ['PG_PORT', '5432', '連接埠'],
      ['PG_USER', 'ems', '使用者'],
      ['PG_PASSWORD', '***', '密碼'],
      ['PG_DATABASE', 'vpp', '資料庫名稱'],
      ['PG_VALUE_COLUMN', 'value', '數值欄位（可自動偵測）'],
      ['PG_TIME_COLUMN', 'updated_at', '時間欄位'],
      ['FLASK_PORT', '5000', 'API 監聽埠'],
    ]))

  // 第七章
  s.push(H('第七章  前端如何呼叫 API', 1))
  s.push(P('前端透過 composable 封裝輪詢邏輯，主要檔案：src/composables/useBmsRealtime.js'))
  s.push(H('7.1 執行流程', 2))
  ;[
    '1. ESSSystem.vue 在佳里國中案場時呼叫 useBms1Realtime()',
    '2. onMounted 立即 fetch，之後每 5 秒 setInterval 輪詢',
    '3. 對 BMS1_REALTIME_POINTS 中每個點位並行 fetch',
    '4. fetch URL：/api/vpp/realtime/latest?site_id=...&device_id=BMS1&point_id=...',
    '5. 解析 numeric_value，存入 points ref',
    '6. metrics computed 合併設定與數值，傳給 CabinetEssScene',
    '7. 懸停 BMS-1 時顯示 SOC、電壓、SOH、溫度等',
  ].forEach(t => s.push(B(t)))
  s.push(H('7.2 vppSites.js 設定', 2))
  s.push(P('BMS1_REALTIME_POINTS 陣列定義要顯示的點位。每筆包含 key、pointId、label、unit、decimals。新增點位只需在此加入一筆，前端會自動輪詢並顯示。'))

  // 第八章
  s.push(H('第八章  開發環境設定與啟動', 1))
  s.push(H('8.1 安裝', 2))
  s.push(C('npm install'))
  s.push(H('8.2 設定資料庫', 2))
  s.push(C('複製 backend/.env.example → backend/.env\n填入 PG_HOST、PG_PASSWORD 等'))
  s.push(H('8.3 啟動（兩種方式）', 2))
  s.push(C(
    `# 方式 A：分開兩個終端\n` +
    `npm run dev:api    # 終端 1：API (5000)\n` +
    `npm run dev        # 終端 2：前端 (5173)\n\n` +
    `# 方式 B：一次啟動\n` +
    `npm run dev:all`
  ))
  s.push(H('8.4 驗證', 2))
  s.push(C(
    `瀏覽器開啟：http://localhost:5000/api/health/db\n` +
    `應回傳 { "ok": true, ... }\n\n` +
    `http://localhost:5000/api/vpp/jiali/bms1/voltage`
  ))

  // 第九章
  s.push(H('第九章  常見錯誤排除', 1))
  s.push(tbl(['現象', '原因', '解法'],
    [
      ['HTTP 502', 'API 未啟動', '執行 npm run dev:api'],
      ['ECONNREFUSED', '5000 埠無程式', '確認 API 終端是否在跑'],
      ['查無資料 404', 'DB 無該點位', '確認 point_id 拼字、site_id 正確'],
      ['無法解析數值', 'value 格式異常', '檢查 jsonb 內容、serialize.mjs'],
      ['畫面顯示 NaN', 'ref 未解包（已修正）', '模板用解構後的變數，非 bms1Realtime.voltage'],
      ['顯示 0.00 V', 'DB 值確實為 0', '檢查 BMS 採集端是否正常寫入'],
    ]))

  // 第十章 BMS-2~8
  s.push(H('第十章  未來擴充：BMS-2 ~ BMS-8', 1))
  s.push(P('佳里國中儲能系統有 8 櫃（BMS-1 ~ BMS-8）。目前僅 BMS-1 有 PostgreSQL 即時串接。擴充其餘 BMS 時，API 層幾乎不用改，主要改前端設定與 UI。'))

  s.push(H('10.1 命名規則', 2))
  s.push(P('資料庫中 device_id 與 point_id 遵循固定模式：'))
  s.push(tbl(['BMS 編號', 'device_id', 'point_id 範例'],
    [
      ['BMS-1', 'BMS1', 'BMS1_SOC, BMS1_AVG_RACK_VOLTAGE, ...'],
      ['BMS-2', 'BMS2', 'BMS2_SOC, BMS2_AVG_RACK_VOLTAGE, ...'],
      ['BMS-3', 'BMS3', 'BMS3_SOC, ...'],
      ['...', '...', '...'],
      ['BMS-8', 'BMS8', 'BMS8_MIN_CELL_TEMP, ...'],
    ]))
  s.push(P('同一套 7 個點位類型可複製，只需把 BMS1 改成 BMS2、BMS3…'))

  s.push(H('10.2 擴充步驟（建議順序）', 2))
  ;[
    '步驟 1：確認 PostgreSQL 已有 BMS2~BMS8 的點位資料（可先查 vpp_realtime）',
    '步驟 2：在 src/config/vppSites.js 新增 BMS2_DEVICE_ID、BMS2_REALTIME_POINTS（複製 BMS1 改編號）',
    '步驟 3：重構 useBmsRealtime.js，抽出通用函式 useBmsRealtime(siteIdRef, deviceId, pointsConfig)',
    '步驟 4：在 CabinetEssScene.vue 為 n===2~8 的櫃子加上 el-tooltip（參考 BMS-1）',
    '步驟 5：ESSSystem.vue 傳入各 BMS 的 metrics（可用陣列 bmsRealtimeList[0..7]）',
    '步驟 6：（可選）在 server.mjs 新增快捷端點 /api/vpp/jiali/bms2/realtime',
    '步驟 7：測試每個 BMS 懸停與右側指標',
  ].forEach(t => s.push(B(t)))

  s.push(H('10.3 重構範例：通用 composable', 2))
  s.push(C(
    `// 未来可改成：\n` +
    `export function useBmsRealtime(siteIdRef, deviceId, points, pollMs = 5000) {\n` +
    `  // deviceId: 'BMS2'\n` +
    `  // points: BMS2_REALTIME_POINTS\n` +
    `  // 其餘邏輯與 useBms1Realtime 相同\n` +
    `}\n\n` +
    `// ESSSystem.vue\n` +
    `const bmsDevices = ['BMS1','BMS2',...,'BMS8']\n` +
    `const bmsRealtimeList = bmsDevices.map(id =>\n` +
    `  useBmsRealtime(selectedSiteId, id, getPointsFor(id))\n` +
    `)`
  ))

  s.push(H('10.4 批量查詢優化（進階）', 2))
  s.push(P('若 8 櫃 × 7 點位 = 56 次請求，可新增 API：'))
  s.push(C(
    `GET /api/vpp/realtime/batch?\n` +
    `  site_id=MG-TNN-001&device_id=BMS2\n` +
    `→ 一次回傳該 device 所有點位最新值\n\n` +
    `或在 db.mjs 用 DISTINCT ON (point_id) 單次 SQL 查多點位`
  ))
  s.push(P('初學階段建議先沿用現有「一點位一請求 + Promise.allSettled」，確認功能正確後再優化。'))

  s.push(H('10.5 CabinetEssScene 擴充示意', 2))
  s.push(C(
    `<el-tooltip v-if="n <= 8 && isJialiSite" ...>\n` +
    `  <!-- 內容用 bmsMetricsList[n-1] -->\n` +
    `</el-tooltip>`
  ))

  // 附錄
  s.push(PB())
  s.push(H('附錄 A  BMS-1 點位清單', 1))
  s.push(tbl(['point_id', '顯示名稱', '單位'], BMS1_POINTS))

  s.push(H('附錄 B  建議閱讀順序', 1))
  ;[
    '1. backend/README.md — 快速上手',
    '2. backend-node/server.mjs — 看 API 路由',
    '3. backend-node/db.mjs — 看 SQL 怎麼查',
    '4. src/config/vppSites.js — 看點位定義',
    '5. useBmsRealtime.js — 看前端怎麼輪詢',
    '6. ESSSystem.vue + CabinetEssScene.vue — 看資料怎麼顯示',
    '7. 第十章 — 規劃 BMS-2~8 擴充',
  ].forEach(t => s.push(B(t)))

  return s
}

async function generateWord() {
  const doc = new Document({ sections: [{ properties: {}, children: buildWordSections() }] })
  fs.mkdirSync(DOCS_DIR, { recursive: true })
  fs.writeFileSync(WORD_OUT, await Packer.toBuffer(doc))
  console.log(`Word 已產生：${WORD_OUT}`)
}

function generatePpt() {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_16x9'
  pptx.author = 'hg-microgrid-ems'
  pptx.title = '微電網 EMS API 程式說明'

  const FONT_FACE = FONT
  const TITLE_STYLE = { x: 0.5, w: 9, align: 'center', fontSize: 28, bold: true, color: '1F2D3D', fontFace: FONT_FACE }
  const SUB_STYLE = { x: 0.5, w: 9, align: 'center', fontSize: 16, color: '606266', fontFace: FONT_FACE }
  const BULLET = { x: 0.6, y: 1.3, w: 8.8, h: 5.5, fontSize: 14, color: '303133', fontFace: FONT_FACE, valign: 'top', bullet: true, lineSpacing: 28 }

  const addTitleSlide = (title, subtitle = '') => {
    const slide = pptx.addSlide()
    slide.background = { color: 'F5F7FA' }
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: 'B71636' } })
    slide.addText(title, { ...TITLE_STYLE, y: 2.2 })
    if (subtitle) slide.addText(subtitle, { ...SUB_STYLE, y: 3.0 })
  }

  const addContentSlide = (title, bullets) => {
    const slide = pptx.addSlide()
    slide.background = { color: 'FFFFFF' }
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.7, fill: { color: '192D40' } })
    slide.addText(title, { x: 0.4, y: 0.12, w: 9, fontSize: 20, bold: true, color: 'FFFFFF', fontFace: FONT_FACE })
    slide.addText(bullets.map(b => ({ text: b, options: { bullet: true, breakLine: true } })), BULLET)
  }

  const addCodeSlide = (title, code) => {
    const slide = pptx.addSlide()
    slide.background = { color: 'FFFFFF' }
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.7, fill: { color: '192D40' } })
    slide.addText(title, { x: 0.4, y: 0.12, w: 9, fontSize: 20, bold: true, color: 'FFFFFF', fontFace: FONT_FACE })
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 1.2, w: 9, h: 4.8, fill: { color: 'F5F7FA' }, line: { color: 'DCDFE6', width: 1 } })
    slide.addText(code, { x: 0.7, y: 1.4, w: 8.6, h: 4.4, fontSize: 11, fontFace: 'Consolas', color: '303133', valign: 'top' })
  }

  addTitleSlide('臺南市小型防災微電網 EMS', 'API 程式說明 — 初學者版')

  addContentSlide('API 在做什麼？', [
    '從 PostgreSQL 讀取 vpp_realtime 即時點位',
    '轉成 JSON 提供 Vue 前端使用',
    '目前：佳里國中 MG-TNN-001 / BMS-1',
    '白話：DB=倉庫，API=服務生，網頁=客人',
  ])

  addCodeSlide('整體架構', 
    `PostgreSQL (vpp / vpp_realtime)\n` +
    `    ↓ SQL\n` +
    `backend-node/ Express :5000\n` +
    `    ↓ JSON\n` +
    `Vite proxy /api → localhost:5000\n` +
    `    ↓ fetch()\n` +
    `useBmsRealtime.js → ESSSystem.vue\n` +
    `    ↓\n` +
    `CabinetEssScene 懸停 BMS-1 顯示`
  )

  addContentSlide('專案目錄（API 相關）', [
    'backend-node/server.mjs — API 路由',
    'backend-node/db.mjs — SQL 查詢',
    'backend-node/serialize.mjs — 數值解析',
    'backend/.env — 資料庫連線',
    'src/config/vppSites.js — 點位定義',
    'src/composables/useBmsRealtime.js — 前端輪詢',
  ])

  addContentSlide('資料表 vpp_realtime', [
    '主鍵：site_id + device_id + point_id',
    'value (jsonb) — 點位數值',
    'quality — 資料品質 good/bad',
    'updated_at — 最新資料排序用',
    '佳里：site_id = MG-TNN-001',
  ])

  addContentSlide('API 端點', [
    'GET /api/health/db — 連線測試',
    'GET /api/vpp/realtime/latest — 通用查詢',
    '  參數：site_id, device_id, point_id',
    'GET /api/vpp/jiali/bms1/voltage — 快捷端點',
  ])

  addCodeSlide('API 請求範例',
    `GET /api/vpp/realtime/latest?\n` +
    `  site_id=MG-TNN-001&\n` +
    `  device_id=BMS1&\n` +
    `  point_id=BMS1_SOC\n\n` +
    `回應：{ ok: true, data: { numeric_value: 35, ... } }`
  )

  addContentSlide('後端程式流程', [
    '1. server.mjs 收到 HTTP GET',
    '2. 讀取 query 參數',
    '3. db.mjs → fetchLatestPoint()',
    '4. 自動偵測 value / updated_at 欄位',
    '5. jsonb 用 #>> 取出數值',
    '6. serialize.mjs 格式化 JSON',
    '7. res.json() 回傳前端',
  ])

  addContentSlide('前端程式流程', [
    'ESSSystem.vue 呼叫 useBms1Realtime()',
    '每 5 秒並行 fetch 7 個點位',
    'vppSites.js 定義 BMS1_REALTIME_POINTS',
    'metrics 傳給 CabinetEssScene',
    '懸停 BMS-1 顯示 SOC/電壓/SOH/溫度',
  ])

  addCodeSlide('開發啟動',
    `npm install\n` +
    `設定 backend/.env\n\n` +
    `npm run dev:api   # API :5000\n` +
    `npm run dev       # 前端 :5173\n\n` +
    `或：npm run dev:all\n\n` +
    `測試：localhost:5000/api/health/db`
  )

  addContentSlide('常見錯誤', [
    'HTTP 502 → API 未啟動，跑 npm run dev:api',
    '404 查無資料 → 確認 DB 有該 point_id',
    '500 → DB 連線或欄位設定錯誤',
    'NaN → 前端 ref 未解包（已修正）',
  ])

  addContentSlide('BMS-1 目前點位（7 個）', [
    'BMS1_SOC — SOC',
    'BMS1_AVG_RACK_VOLTAGE — 平均電壓',
    'BMS1_MAX/MIN_CELL_VOLTAGE — 單體電壓',
    'BMS1_AVG_SOH — 平均 SOH',
    'BMS1_MAX/MIN_CELL_TEMP — 單體溫度',
  ])

  addContentSlide('擴充 BMS-2 ~ BMS-8（1）命名', [
    'device_id：BMS2, BMS3, ... BMS8',
    'point_id：BMS2_SOC, BMS2_AVG_RACK_VOLTAGE...',
    '複製 BMS1 的 7 種點位類型即可',
    'API 通用端點不需修改',
  ])

  addContentSlide('擴充 BMS-2 ~ BMS-8（2）步驟', [
    '1. 確認 DB 已有 BMS2~8 資料',
    '2. vppSites.js 新增 BMS2_REALTIME_POINTS',
    '3. 重構 useBmsRealtime 為通用函式',
    '4. CabinetEssScene 為 BMS-2~8 加 tooltip',
    '5. ESSSystem 傳入各櫃 metrics',
    '6. 測試懸停與指標',
  ])

  addCodeSlide('擴充範例（未来）',
    `// vppSites.js\n` +
    `export const BMS2_REALTIME_POINTS = [\n` +
    `  { key:'soc', pointId:'BMS2_SOC', ... },\n` +
    `  ...\n` +
    `]\n\n` +
    `// useBmsRealtime(siteId, 'BMS2', BMS2_POINTS)\n\n` +
    `// 進階：batch API 一次查整櫃`
  )

  addContentSlide('建議閱讀順序', [
    '1. backend/README.md',
    '2. backend-node/server.mjs + db.mjs',
    '3. vppSites.js + useBmsRealtime.js',
    '4. ESSSystem.vue + CabinetEssScene.vue',
    '5. 規劃 BMS-2~8 擴充',
  ])

  addTitleSlide('謝謝', '微電網 EMS API 程式說明文件')

  pptx.writeFile({ fileName: PPT_OUT })
  console.log(`PPT 已產生：${PPT_OUT}`)
}

await generateWord()
generatePpt()
