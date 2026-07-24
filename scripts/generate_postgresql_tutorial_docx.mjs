import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  PageBreak,
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT = path.join(__dirname, '..', 'docs', 'PostgreSQL_API_教學_微電網EMS.docx')

const FONT = 'Microsoft JhengHei'
const CODE_FONT = 'Consolas'

function text(content, opts = {}) {
  return new TextRun({ text: content, font: opts.font || FONT, size: opts.size || 22, bold: opts.bold })
}

function para(runs, opts = {}) {
  return new Paragraph({
    children: Array.isArray(runs) ? runs : [text(runs)],
    spacing: { after: opts.after ?? 120 },
    alignment: opts.align,
  })
}

function heading(content, level) {
  const map = {
    0: HeadingLevel.TITLE,
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
  }
  return new Paragraph({ text: content, heading: map[level] || HeadingLevel.HEADING_1, spacing: { before: 240, after: 120 } })
}

function bullet(content) {
  return new Paragraph({ text: content, bullet: { level: 0 }, spacing: { after: 60 } })
}

function numbered(content) {
  return new Paragraph({ text: content, numbering: { reference: 'steps', level: 0 }, spacing: { after: 60 } })
}

function codeBlock(content) {
  return new Paragraph({
    children: [new TextRun({ text: content, font: CODE_FONT, size: 18 })],
    spacing: { before: 80, after: 80 },
    indent: { left: 360 },
  })
}

function table(headers, rows) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' }
  const borders = { top: border, bottom: border, left: border, right: border }
  const headerRow = new TableRow({
    children: headers.map((h) =>
      new TableCell({
        borders,
        children: [para([text(h, { bold: true })])],
        width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
      })
    ),
  })
  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map((cell) =>
          new TableCell({ borders, children: [para(String(cell))] })
        ),
      })
  )
  return new Table({ rows: [headerRow, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE } })
}

const SQL_SCRIPT = `-- 場域基本資料
CREATE TABLE sites (
  id              VARCHAR(50) PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  location        VARCHAR(100),
  pv_capacity_kw  NUMERIC(10,2),
  ess_power_kw    NUMERIC(10,2),
  ess_energy_kwh  NUMERIC(10,2),
  gen_capacity_kw NUMERIC(10,2),
  load_base_kw    NUMERIC(10,2)
);

-- 即時／歷史功率紀錄
CREATE TABLE power_readings (
  id          SERIAL PRIMARY KEY,
  site_id     VARCHAR(50) REFERENCES sites(id),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  pv_power    NUMERIC(10,2),
  ess_power   NUMERIC(10,2),
  gen_power   NUMERIC(10,2),
  load_power  NUMERIC(10,2),
  grid_power  NUMERIC(10,2),
  soc         NUMERIC(5,2),
  mode        SMALLINT
);

INSERT INTO sites VALUES
  ('jiali-junior-high', '臺南市佳里國中後港校區', '臺南市佳里區', 132, 600, 1316, 200, 70),
  ('ruifeng-elementary', '臺南市瑞峰國小', '臺南市南化區', 91.12, 600, 1200, 60, 30),
  ('zengwen-vision-park', '臺南市曾文市政願景園區', '臺南市麻豆區', 497.39, 1000, 1800, 200, 76);`

const FLASK_CODE = `from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "microgrid_ems",
    "user": "postgres",
    "password": "你的密碼"
}

def get_db():
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

@app.route("/time")
def get_time():
    return jsonify({"time": datetime.now().isoformat()})

@app.route("/api/sites")
def list_sites():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM sites ORDER BY name")
    rows = cur.fetchall()
    cur.close(); conn.close()
    return jsonify(rows)

@app.route("/api/sites/<site_id>/latest")
def latest_power(site_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM power_readings
        WHERE site_id = %s ORDER BY recorded_at DESC LIMIT 1
    """, (site_id,))
    row = cur.fetchone()
    cur.close(); conn.close()
    if not row:
        return jsonify({"error": "尚無資料"}), 404
    return jsonify(row)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)`

const VUE_CODE = `const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const fetchEmsData = async () => {
  try {
    const siteId = selectedSiteId.value
    const res = await fetch(\`\${API_BASE}/api/sites/\${siteId}/latest\`)
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
    const data = await res.json()

    pvPower.value     = Number(data.pv_power)
    essPower.value    = Number(data.ess_power)
    genPower.value    = Number(data.gen_power)
    loadPower.value   = Number(data.load_power)
    gridPower.value   = Number(data.grid_power)
    soc.value         = Number(data.soc)
    currentMode.value = Number(data.mode)
  } catch (err) {
    console.error('無法取得 EMS 數據', err)
  }
}`

const children = [
  new Paragraph({
    children: [text('PostgreSQL API 入門教學', { size: 48, bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }),
  para('連接 hg-microgrid-ems 微電網能源管理系統', { align: AlignmentType.CENTER }),
  para(''),
  para([text('專案名稱：', { bold: true }), text('hg-microgrid-ems\n'), text('文件版本：', { bold: true }), text('1.0\n'), text('適用對象：', { bold: true }), text('初學者')], { align: AlignmentType.CENTER }),
  new Paragraph({ children: [new PageBreak()] }),

  heading('目錄', 1),
  ...[
    '一、專案現況說明',
    '二、重要觀念：為何瀏覽器不能直接連 PostgreSQL',
    '三、整體架構與四步驟流程',
    '四、Step 1：安裝 PostgreSQL 並建立資料表',
    '五、Step 2：建立 API 後端（Python Flask）',
    '六、Step 3：Vue 前端呼叫 API',
    '七、Step 4：開發常見問題',
    '八、API 與頁面對照表',
    '九、建議學習順序',
    '十、名詞小字典',
    '附錄 A：完整 SQL 建表腳本',
    '附錄 B：Flask 後端完整範例',
    '附錄 C：Vue emsStore 修改範例',
  ].map(bullet),
  new Paragraph({ children: [new PageBreak()] }),

  heading('一、專案現況說明', 1),
  para('hg-microgrid-ems 是一套微電網能源管理系統（EMS）的前端網站，使用 Vue 3、Vite、Pinia、Element Plus 與 ECharts 建置。'),
  heading('1.1 技術棧', 2),
  table(
    ['技術', '用途'],
    [
      ['Vue 3 + Vite', '網頁介面與開發工具'],
      ['Pinia（emsStore.js）', '全域狀態管理'],
      ['Element Plus', 'UI 元件'],
      ['ECharts', '圖表顯示'],
    ]
  ),
  para(''),
  heading('1.2 目前資料來源', 2),
  para('目前電力數據（太陽光電、儲能、柴發、負載、市電、SOC 等）皆由前端 emsStore.js 中的 fetchEmsData() 函式以 Math.random() 模擬產生，並非來自真實資料庫。'),
  para([text('主要受影響的頁面包括：', { bold: true })]),
  ...[
    'Dashboard.vue — 系統總覽儀表板',
    'RealTimePower.vue — 即時功率',
    'History.vue — 24 小時歷史曲線（使用 generateMockData）',
    'PVSystem.vue、ESSSystem.vue、GensetSystem.vue — 各子系統頁面',
  ].map(bullet),
  heading('1.3 已有的 API 測試', 2),
  para('專案中已有 ApiTest.vue 頁面（路由 /api-test），透過 fetch 連接後端 http://192.168.1.148:5000，測試 GET /time 與 POST /add2 兩個端點。這表示後端 API 伺服器的概念已存在，只需擴充 PostgreSQL 功能即可。'),

  heading('二、重要觀念：為何瀏覽器不能直接連 PostgreSQL', 1),
  para([text('錯誤做法：', { bold: true })]),
  codeBlock('Vue 網頁 ──直接──▶ PostgreSQL'),
  para([text('正確做法：', { bold: true })]),
  codeBlock('Vue 網頁 ──HTTP──▶ API 伺服器 ──SQL──▶ PostgreSQL'),
  para([text('原因說明：', { bold: true })]),
  ...[
    '瀏覽器無法執行 PostgreSQL 驅動程式（如 psycopg2、pg 模組）。',
    '資料庫帳號密碼若寫在前端 JavaScript，任何人按 F12 都能看到。',
    '需要後端負責身份驗證、權限控管與 SQL 查詢邏輯。',
  ].map(bullet),
  para([text('正確的三層架構：', { bold: true })]),
  codeBlock(
    '┌─────────────────┐     fetch()      ┌──────────────────┐     SQL      ┌────────────┐\n' +
      '│  Vue 前端        │ ───────────────▶ │  API 後端         │ ──────────▶ │ PostgreSQL │\n' +
      '│  (port 5173)    │ ◀─────────────── │  (port 5000)      │ ◀────────── │            │\n' +
      '└─────────────────┘     JSON 回應     └──────────────────┘   查詢結果    └────────────┘'
  ),

  heading('三、整體架構與四步驟流程', 1),
  ...[
    'Step 1：安裝 PostgreSQL，建立資料庫與資料表',
    'Step 2：撰寫後端 API（Python Flask 或 Node.js Express）',
    'Step 3：後端使用 SQL 讀寫 PostgreSQL',
    'Step 4：Vue 前端用 fetch 呼叫 API，取代模擬數據',
  ].map((s, i) => para(`${i + 1}. ${s}`)),

  heading('四、Step 1：安裝 PostgreSQL 並建立資料表', 1),
  heading('4.1 安裝 PostgreSQL', 2),
  para('前往 https://www.postgresql.org/download/windows/ 下載並安裝。安裝時請記住：使用者名稱（預設 postgres）、密碼、連接埠（預設 5432）。'),
  heading('4.2 建立資料庫', 2),
  codeBlock('CREATE DATABASE microgrid_ems;'),
  heading('4.3 設計 EMS 資料表', 2),
  para('依 emsStore.js 的 siteOptions 與即時功率欄位，建議建立 sites（場域）與 power_readings（功率紀錄）兩張表。詳細 SQL 請見附錄 A。'),
  heading('4.4 測試查詢', 2),
  codeBlock('SELECT * FROM sites;\nSELECT * FROM power_readings ORDER BY recorded_at DESC LIMIT 10;'),

  heading('五、Step 2：建立 API 後端（Python Flask）', 1),
  para('因 ApiTest.vue 已連接 port 5000 的 Flask 風格 API，建議在同一後端擴充 PostgreSQL 功能。'),
  heading('5.1 安裝套件', 2),
  codeBlock('pip install flask flask-cors psycopg2-binary'),
  heading('5.2 主要 API 端點', 2),
  table(
    ['方法', '路徑', '說明'],
    [
      ['GET', '/time', '回傳伺服器時間（原有測試用）'],
      ['GET', '/api/sites', '取得所有場域清單'],
      ['GET', '/api/sites/{id}/latest', '取得某場域最新即時功率'],
      ['POST', '/api/power-readings', '寫入一筆功率紀錄'],
      ['GET', '/api/sites/{id}/history?hours=24', '取得 24 小時歷史資料'],
    ]
  ),
  para(''),
  para('完整 Flask 程式碼請見附錄 B。'),
  heading('5.3 啟動後端', 2),
  codeBlock('python app.py'),
  para('瀏覽器測試：http://localhost:5000/api/sites'),

  heading('六、Step 3：Vue 前端呼叫 API', 1),
  heading('6.1 環境變數設定', 2),
  para('在專案根目錄建立 .env.development：'),
  codeBlock('VITE_API_BASE_URL=http://192.168.1.148:5000'),
  para('在 Vue 中使用：'),
  codeBlock('const API_BASE = import.meta.env.VITE_API_BASE_URL'),
  heading('6.2 修改 emsStore.js', 2),
  para('將 fetchEmsData() 中的 Math.random() 模擬邏輯，改為 async fetch 呼叫 GET /api/sites/{siteId}/latest，並將回傳 JSON 寫入 pvPower、essPower 等 ref 變數。完整範例請見附錄 C。'),
  heading('6.3 修改 History.vue', 2),
  para('將 generateMockData() 改為呼叫 GET /api/sites/{siteId}/history?hours=24，將回傳的 rows 陣列轉換為 ECharts 所需的 timeAxis、pvData、loadData 等格式。'),

  heading('七、Step 4：開發常見問題', 1),
  heading('7.1 CORS 跨域錯誤', 2),
  para('若瀏覽器 Console 出現 Access-Control-Allow-Origin 錯誤：後端需安裝 flask-cors 並啟用 CORS；或在 vite.config.js 設定 proxy 將 /api 轉發至後端。'),
  codeBlock(
    '// vite.config.js\nserver: {\n  proxy: {\n    \'/api\': {\n      target: \'http://192.168.1.148:5000\',\n      changeOrigin: true\n    }\n  }\n}'
  ),
  heading('7.2 資料從哪來？', 2),
  ...[
    '過渡期：後端定時用模擬邏輯寫入 power_readings 表',
    '正式環境：SCADA 或電表 gateway 透過 POST 寫入',
    '測試：手動 INSERT 或使用 Postman 送 POST 請求',
  ].map(bullet),
  heading('7.3 安全提醒', 2),
  table(
    ['項目', '建議做法'],
    [
      ['資料庫密碼', '只放在後端，使用環境變數，勿提交至 Git'],
      ['SQL 注入', '使用參數化查詢（%s），不要拼接 SQL 字串'],
      ['生產環境', '加上登入驗證、HTTPS、API 金鑰'],
    ]
  ),
  para(''),

  heading('八、API 與頁面對照表', 1),
  table(
    ['頁面 / 功能', '目前做法', '建議 API'],
    [
      ['Dashboard 即時功率', 'emsStore.fetchEmsData() 模擬', 'GET /api/sites/{id}/latest'],
      ['History 24h 曲線', 'generateMockData()', 'GET /api/sites/{id}/history?hours=24'],
      ['場域切換', 'siteOptions 寫死在 JS', 'GET /api/sites'],
      ['ApiTest', '/time, /add2', '保留作連線測試'],
    ]
  ),
  para(''),

  heading('九、建議學習順序', 1),
  ...[
    '使用 pgAdmin 建表，手動 INSERT 幾筆測試資料',
    '啟動 Flask 後端，用瀏覽器測試 /api/sites',
    '在 ApiTest 頁面新增卡片測試 /api/sites（熟悉 fetch 用法）',
    '修改 emsStore.fetchEmsData 接入真實 API',
    '修改 History.vue 讀取歷史資料',
  ].map((s, i) => para(`${i + 1}. ${s}`)),

  heading('十、名詞小字典', 1),
  table(
    ['名詞', '說明'],
    [
      ['PostgreSQL', '開源關聯式資料庫，使用 SQL 語言存取資料'],
      ['API', '後端提供的 HTTP 網址，回傳 JSON 格式資料'],
      ['REST', '用 GET 讀取、POST 新增、PUT 更新、DELETE 刪除的 API 設計風格'],
      ['fetch', '瀏覽器內建的 HTTP 請求函式'],
      ['CORS', '跨來源資源共享，瀏覽器的跨網域安全限制機制'],
      ['Pinia store', 'Vue 3 的全域狀態管理，適合集中管理 API 資料'],
      ['JSON', 'JavaScript Object Notation，前後端交換資料的標準格式'],
    ]
  ),

  new Paragraph({ children: [new PageBreak()] }),
  heading('附錄 A：完整 SQL 建表腳本', 1),
  codeBlock(SQL_SCRIPT),
  heading('附錄 B：Flask 後端完整範例', 1),
  codeBlock(FLASK_CODE),
  heading('附錄 C：Vue emsStore 修改範例', 1),
  codeBlock(VUE_CODE),
]

const doc = new Document({
  numbering: {
    config: [{ reference: 'steps', levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.LEFT }] }],
  },
  sections: [{ properties: {}, children }],
})

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
const buffer = await Packer.toBuffer(doc)
fs.writeFileSync(OUTPUT, buffer)
console.log(`已產生：${OUTPUT}`)
