/**
 * 產生 hg-microgrid-ems 程式說明文件（Word + PPT）
 * 執行：node scripts/generate_program_docs.mjs
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
const WORD_OUT = path.join(DOCS_DIR, '微電網EMS_程式架構說明_初學者版.docx')
const PPT_OUT = path.join(DOCS_DIR, '微電網EMS_程式架構說明_初學者版.pptx')

const FONT = 'Microsoft JhengHei'
const CODE = 'Consolas'

// ─── Word helpers ───────────────────────────────────────────────
const T = (s, o = {}) => new TextRun({ text: s, font: FONT, size: o.size || 22, bold: o.bold })
const P = (c, o = {}) => new Paragraph({
  children: Array.isArray(c) ? c : [T(c)],
  spacing: { after: o.after ?? 120 },
  alignment: o.align,
})
const H = (t, lv = 1) => new Paragraph({ text: t, heading: [HeadingLevel.TITLE, HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3][lv], spacing: { before: 240, after: 120 } })
const B = (t) => new Paragraph({ text: t, bullet: { level: 0 }, spacing: { after: 60 } })
const C = (t) => new Paragraph({ children: [new TextRun({ text: t, font: CODE, size: 18 })], spacing: { before: 80, after: 80 }, indent: { left: 360 } })
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

// ─── Word content ─────────────────────────────────────────────
function buildWordSections() {
  const s = []

  // 封面
  s.push(new Paragraph({ children: [T('臺南市小型防災微電網 EMS', { size: 52, bold: true })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }))
  s.push(P('程式架構說明文件（初學者版）', { align: AlignmentType.CENTER }))
  s.push(P(''))
  s.push(P([T('專案：', { bold: true }), T('hg-microgrid-ems\n'), T('版本：', { bold: true }), T('1.0\n'), T('對象：', { bold: true }), T('Vue / 前端初學者')], { align: AlignmentType.CENTER }))
  s.push(PB())

  // 目錄
  s.push(H('目錄', 1))
  ;[
    '第一章  這個網站在做什麼？',
    '第二章  使用技術與工具',
    '第三章  專案目錄結構',
    '第四章  程式啟動流程（從開啟網頁到顯示畫面）',
    '第五章  整體架構與資料流向',
    '第六章  身份驗證與權限系統',
    '第七章  微電網資料核心（emsStore）',
    '第八章  路由系統（router）',
    '第九章  頁面（Views）逐一說明',
    '第十章  元件（Components）逐一說明',
    '第十一章  工具與可組合函式',
    '第十二章  Vue 重要概念整理',
    '附錄 A  完整檔案清單',
    '附錄 B  建議閱讀順序',
  ].forEach(t => s.push(B(t)))
  s.push(PB())

  // 第一章
  s.push(H('第一章  這個網站在做什麼？', 1))
  s.push(P('「臺南市小型防災微電網系統（EMS）」是一套能源管理監控網站，用來即時顯示三個案場的微電網運轉狀態，包含：'))
  ;['太陽光電發電功率', '儲能系統充放電與 SOC（電池電量）', '柴油發電機功率', '負載用電', '市電饋線功率', '五種運轉情境（併網、孤島、柴發等）'].forEach(t => s.push(B(t)))
  s.push(P('目前大部分電力數據由前端 JavaScript 模擬產生（非真實 SCADA），適合展示、教學與後續串接 API。'))
  s.push(P([T('三個案場：', { bold: true }), T('佳里國中後港校區、瑞峰國小、曾文市政願景園區。')]))

  // 第二章
  s.push(H('第二章  使用技術與工具', 1))
  s.push(tbl(['技術', '版本', '用途', '初學者理解方式'],
    [
      ['Vue 3', '3.5', '前端框架', '像蓋房子的骨架，負責畫面與互動'],
      ['Vite', '8.0', '開發/打包工具', '快速啟動開發伺服器、打包上線'],
      ['Vue Router', '4.6', '路由管理', '網址對應不同頁面，如 /login、/system-overview'],
      ['Pinia', '3.0', '全域狀態管理', '多個頁面共用的資料倉庫'],
      ['Element Plus', '2.14', 'UI 元件庫', '按鈕、表格、選單等現成元件'],
      ['ECharts', '6.1', '圖表庫', '繪製即時/歷史功率曲線'],
    ]))
  s.push(P(''))

  // 第三章
  s.push(H('第三章  專案目錄結構', 1))
  s.push(C(
    `hg-microgrid-ems/\n` +
    `├── index.html          ← 瀏覽器載入的 HTML 入口\n` +
    `├── package.json        ← 專案設定與套件清單\n` +
    `├── vite.config.js      ← Vite 打包設定\n` +
    `└── src/                ← 所有原始程式碼\n` +
    `    ├── main.js         ← 程式起點\n` +
    `    ├── App.vue         ← 根元件（側欄+主畫面）\n` +
    `    ├── router/         ← 路由設定\n` +
    `    ├── stores/         ← Pinia 資料倉庫\n` +
    `    ├── views/          ← 各功能頁面\n` +
    `    ├── components/     ← 可重複使用的 UI 元件\n` +
    `    ├── composables/    ← 可重複使用的邏輯函式\n` +
    `    ├── config/         ← 設定檔（權限定義）\n` +
    `    └── utils/          ← 小工具函式`
  ))
  s.push(P([T('命名規則：', { bold: true }), T('Views 是「整頁」；Components 是「頁面中的一塊」；Stores 是「全域資料」。')]))

  // 第四章
  s.push(H('第四章  程式啟動流程', 1))
  s.push(P('使用者開啟網址後，程式依下列順序執行：'))
  s.push(C(
    `1. index.html 載入\n` +
    `2. main.js 執行：\n` +
    `   createApp(App)\n` +
    `     .use(createPinia())    // 啟用 Pinia\n` +
    `     .use(router)           // 啟用路由\n` +
    `     .use(ElementPlus)      // 啟用 UI 元件\n` +
    `     .mount('#app')         // 掛載到 #app\n` +
    `3. App.vue 渲染：\n` +
    `   - authStore.initialize() 載入登入狀態\n` +
    `   - 若網址是 /login → 顯示登入頁\n` +
    `   - 否則 → 顯示左側選單 + 右側頁面內容\n` +
    `4. router 決定要顯示哪個 View（如 Dashboard.vue）`
  ))
  s.push(H('4.1 main.js 原理', 2))
  s.push(P('main.js 是整個 Vue 應用的「總開關」。它把 Pinia、Router、Element Plus 三個插件註冊進 App，再掛載到 HTML 的 <div id="app">。'))
  s.push(H('4.2 App.vue 原理', 2))
  s.push(P('App.vue 是「外殼」。左側 el-menu 是導航選單，右側 router-view 是內容區。選單項目依 authStore.hasPermission() 動態顯示。'))
  s.push(P('App.vue 還用 provide() 提供 sidebarControl（側欄收合狀態），供 SiteHeader 用 inject() 取得。'))

  // 第五章
  s.push(H('第五章  整體架構與資料流向', 1))
  s.push(C(
    `┌─────────────┐     讀取/寫入     ┌──────────────┐\n` +
    `│  Views 頁面  │ ◀──────────────▶ │ Pinia Stores │\n` +
    `│ (Dashboard) │                   │ auth / ems   │\n` +
    `└──────┬──────┘                   └──────┬───────┘\n` +
    `       │ 使用                              │ 持久化\n` +
    `       ▼                                   ▼\n` +
    `┌─────────────┐                   ┌──────────────┐\n` +
    `│ Components  │                   │ localStorage │\n` +
    `│ (單線圖等)   │                   │ sessionStorage│\n` +
    `└─────────────┘                   └──────────────┘`
  ))
  s.push(P('核心概念：頁面不直接互相傳資料，而是透過 Pinia Store 集中管理。任何元件 import useEmsStore() 後讀取同一份資料。'))
  s.push(H('5.1 典型資料流（Dashboard 為例）', 2))
  s.push(C(
    `SiteHeader 切換案場\n` +
    `  → emsStore.setSite(siteId)\n` +
    `  → emsStore.fetchEmsData()\n` +
    `Dashboard 每 2 秒 setInterval\n` +
    `  → emsStore.fetchEmsData() 更新功率\n` +
    `SingleLineDiagram 直接讀 emsStore\n` +
    `  → SVG 自動重繪（Vue 響應式）`
  ))

  s.push(PB())

  // 第六章 Auth
  s.push(H('第六章  身份驗證與權限系統', 1))
  s.push(H('6.1 authStore.js', 2))
  s.push(P('負責登入、登出、使用者管理、權限檢查。資料存在瀏覽器：'))
  s.push(tbl(['Storage Key', '位置', '內容'], [
    ['ems-auth-data', 'localStorage', '所有使用者帳號、密碼雜湊、權限清單'],
    ['ems-auth-session', 'sessionStorage', '目前登入的使用者 ID'],
  ]))
  s.push(P(''))
  s.push(P([T('預設管理者：', { bold: true }), T('帳號 admin，密碼 02750963，isAdmin=true 擁有全部權限。')]))
  s.push(H('6.2 主要函式說明', 2))
  s.push(tbl(['函式', '作用', '原理'],
    [
      ['initialize()', '啟動時載入使用者與 session', '從 localStorage/sessionStorage 還原狀態'],
      ['login(user, pass)', '登入驗證', 'SHA-256 雜湊密碼後比對，成功寫入 session'],
      ['logout()', '登出', '清除 sessionStorage'],
      ['hasPermission(key)', '檢查權限', 'admin 全通；一般使用者檢查 permissions 陣列'],
      ['addUser()', '新增使用者', '寫入 users 陣列並存 localStorage'],
      ['updateUserPermissions()', '更新權限', '修改 permissions 陣列'],
      ['getFirstAllowedPath()', '找第一個可進入的頁面', '依 PERMISSION_GROUPS 順序遍歷'],
    ]))
  s.push(P(''))
  s.push(H('6.3 menuPermissions.js', 2))
  s.push(P('權限設定的「唯一來源」。定義 14 個 permission key、選單分組、路由對應表 ROUTE_PERMISSION_MAP。側欄、路由守衛、權限管理頁都讀同一份設定。'))
  s.push(H('6.4 password.js', 2))
  s.push(P('hashPassword() 使用 Web Crypto API 做 SHA-256，將密碼轉成無法反推的雜湊值再儲存。'))
  s.push(H('6.5 Login.vue', 2))
  s.push(P('登入表單頁。提交後呼叫 authStore.login()，成功則 router.replace() 導向原本要去的頁面或首頁。'))
  s.push(H('6.6 Users.vue / Permissions.vue', 2))
  s.push(P('Users.vue：表格顯示使用者，對話框新增/重設密碼/刪除。Permissions.vue：下拉選使用者，checkbox 勾選左側功能，儲存至 authStore。'))

  // 第七章 emsStore
  s.push(H('第七章  微電網資料核心（emsStore.js）', 1))
  s.push(P('emsStore 是業務邏輯的核心，管理三案場的即時模擬數據。'))
  s.push(H('7.1 狀態變數', 2))
  s.push(tbl(['變數', '型別', '說明'],
    [
      ['selectedSiteId', 'ref', '目前選中的案場 ID'],
      ['selectedSite', 'computed', '目前案場完整物件（容量等）'],
      ['currentMode', 'ref', '運轉情境 1~5'],
      ['pvPower', 'ref', '太陽光電功率 kW'],
      ['essPower', 'ref', '儲能功率 kW（負值=充電）'],
      ['genPower', 'ref', '柴發功率 kW'],
      ['loadPower', 'ref', '負載功率 kW'],
      ['gridPower', 'ref', '市電功率 kW'],
      ['soc', 'ref', '電池電量 %'],
    ]))
  s.push(P(''))
  s.push(H('7.2 setSite(siteId)', 2))
  s.push(P('切換案場時重置所有功率與 SOC，依新案場容量設定初始 pvPower。SiteHeader 案場選擇會觸發此函式。'))
  s.push(H('7.3 fetchEmsData()', 2))
  s.push(P('每 2 秒被各頁面呼叫。流程：'))
  s.push(B('1. 用 Math.random() 微幅波動負載與光電'))
  s.push(B('2. 依 currentMode（1~5）計算電力平衡'))
  s.push(B('3. 更新 essPower、gridPower、genPower'))
  s.push(B('4. 情境二 SOC 低於 30% 自動切換情境三'))
  s.push(B('5. 情境三 SOC 高於 70% 自動回到情境二'))
  s.push(B('6. SOC 限制在 0~100'))
  s.push(H('7.4 五種運轉情境', 2))
  s.push(tbl(['模式', '名稱', '邏輯摘要'],
    [
      ['1', '市電正常（併網）', '光電足→充儲能；光電不足→市電補'],
      ['2', '市電異常（儲能孤島）', '儲能放電補缺口，SOC 低啟動柴發'],
      ['3', '儲能+柴發', '柴發+光電供負載，多餘充儲能'],
      ['4', '純柴發', '柴發補足負載與光電差額'],
      ['5', '夜尖峰（儲能供電）', '光電=0，儲能全功率放電'],
    ]))

  s.push(PB())

  // 第八章 Router
  s.push(H('第八章  路由系統（router/index.js）', 1))
  s.push(P('router 把 URL 路徑對應到 View 元件，並在 beforeEach 守衛中檢查登入與權限。'))
  s.push(tbl(['路徑', '頁面', '權限 key'],
    [
      ['/login', 'Login.vue', '（公開）'],
      ['/system-overview', 'Dashboard.vue', 'system-overview'],
      ['/real-time-power', 'RealTimePower.vue', 'real-time-power'],
      ['/history', 'History.vue', 'history'],
      ['/pv-system', 'PVSystem.vue', 'pv-system'],
      ['/ess-system', 'ESSSystem.vue', 'ess-system'],
      ['/genset-system', 'GensetSystem.vue', 'genset-system'],
      ['/PV-Prediction', 'PVPrediction.vue', 'PV-Prediction'],
      ['/Load-Prediction', 'LoadPrediction.vue', 'Load-Prediction'],
      ['/users', 'Users.vue', 'users'],
      ['/permissions', 'Permissions.vue', 'permissions'],
      ['/api-test', 'ApiTest.vue', 'api-test'],
      ['/event-log 等', 'FeaturePlaceholder.vue', '各對應 key'],
    ]))
  s.push(P(''))
  s.push(P('守衛邏輯：未登入→/login；已登入但無權限→getFirstAllowedPath()；登入頁且已登入→導向首頁。'))

  // 第九章 Views
  s.push(H('第九章  頁面（Views）逐一說明', 1))
  const views = [
    ['Login.vue', '登入頁', '表單驗證 → authStore.login → 路由跳轉', 'authStore, vue-router'],
    ['Dashboard.vue', '系統總覽', '情境選擇、5 張 KPI 卡、SingleLineDiagram；2 秒 polling', 'emsStore, SiteHeader, SingleLineDiagram'],
    ['RealTimePower.vue', '即時電力曲線', '包裝 RealTimePowerChart 元件', 'emsStore, RealTimePowerChart'],
    ['History.vue', '歷史曲線', 'ECharts 繪製 24h mock 資料', 'ECharts, SiteHeader'],
    ['PVSystem.vue', '太陽光電系統', 'CWA 日射量 + 場景動畫 + 逆變器模擬參數', 'emsStore, useSolarRadiation, Campus/ScenicPvScene'],
    ['ESSSystem.vue', '儲能系統', 'PCS/BMS 模擬參數 + 儲能場景動畫', 'emsStore, Cabinet/ContainerEssScene'],
    ['GensetSystem.vue', '柴油發電機', '油量/運轉模擬 + GensetScene', 'emsStore, GensetScene'],
    ['PVPrediction.vue', '光電預測', '本地 Demo 演算法預測曲線', 'emsStore, useSolarRadiation'],
    ['LoadPrediction.vue', '負載預測', '本地 Demo 負載預測', 'emsStore'],
    ['Users.vue', '使用者管理', 'CRUD 使用者', 'authStore'],
    ['Permissions.vue', '權限管理', 'checkbox 設定各使用者功能權限', 'authStore, PERMISSION_GROUPS'],
    ['ApiTest.vue', 'API 測試', 'fetch 測試後端 192.168.1.148:5000', '原生 fetch'],
    ['FeaturePlaceholder.vue', '建置中佔位', '顯示「功能建置中」', 'route.meta.title'],
  ]
  s.push(tbl(['檔案', '功能', '核心邏輯', '依賴'], views))
  s.push(P(''))

  // 第十章 Components
  s.push(H('第十章  元件（Components）逐一說明', 1))
  s.push(H('10.1 SiteHeader.vue', 2))
  s.push(P('每頁頂部共用標題列：側欄收合按鈕、系統名稱、右上角使用者/登出/即時時鐘、案場選擇。inject sidebarControl；讀 authStore + emsStore。'))
  s.push(H('10.2 SingleLineDiagram.vue', 2))
  s.push(P('SVG 微電網單線圖。直接讀 emsStore，依 currentMode 決定 ATS 斷路器開合、線路動畫 class。顯示市電/光電/儲能/柴發/負載功率與 SOC。'))
  s.push(H('10.3 RealTimePowerChart.vue', 2))
  s.push(P('ECharts 滾動即時曲線，watch emsStore 功率變化 push 新點（最多 60 點）。'))
  s.push(H('10.4 場景動畫元件', 2))
  s.push(tbl(['元件', '用途', 'Props'],
    [
      ['CampusPvScene.vue', '校園屋頂光電動畫', 'utilization, siteName'],
      ['ScenicPvScene.vue', '園區地面光電動畫', 'utilization, siteName'],
      ['CabinetEssScene.vue', '六櫃式儲能動畫', 'siteName, soc, powerKw'],
      ['ContainerEssScene.vue', '貨櫃式儲能動畫', 'siteName, soc, powerKw'],
      ['GensetScene.vue', '柴油發電機動畫', 'capacityKw, powerKw, fuelLevel'],
    ]))
  s.push(P(''))
  s.push(P('案場對應：佳里/瑞峰用 CampusPvScene + CabinetEssScene；曾文用 ScenicPvScene + ContainerEssScene。'))

  s.push(PB())

  // 第十一章
  s.push(H('第十一章  工具與可組合函式', 1))
  s.push(H('11.1 useSolarRadiation.js', 2))
  s.push(P('Composable：封裝中央氣象署日射量 API 請求。回傳 cwaStations、cwaLoading、cwaError、fetchSolarRadiation。onMounted 自動 fetch。'))
  s.push(P('estimateInstantIrradiance()：依累積日射量估算瞬時 W/m²，供 PVSystem 顯示。'))
  s.push(H('11.2 password.js', 2))
  s.push(P('hashPassword()：SHA-256 雜湊，供 authStore 登入驗證與密碼儲存。'))

  // 第十二章
  s.push(H('第十二章  Vue 重要概念整理（初學者）', 1))
  s.push(tbl(['概念', '本專案用法', '白話說明'],
    [
      ['ref / reactive', 'emsStore 中的 pvPower 等', '會變化的資料，改變時畫面自動更新'],
      ['computed', 'selectedSite', '由其他資料自動算出來的值'],
      ['watch', 'RealTimePowerChart 監聽功率', '某資料改變時執行額外邏輯'],
      ['onMounted', 'Dashboard 啟動 setInterval', '元件出現在畫面上時執行'],
      ['provide/inject', 'App→SiteHeader 側欄控制', '跨層傳資料，不用一層層 props'],
      ['Pinia store', 'authStore, emsStore', '全域共用資料倉庫'],
      ['vue-router', 'beforeEach 守衛', '網址換頁 + 登入/權限檢查'],
      ['v-model', 'Dashboard 情境選擇', '雙向綁定，UI 與 store 同步'],
    ]))

  // 附錄
  s.push(PB())
  s.push(H('附錄 A  完整 src 檔案清單', 1))
  ;[
    'main.js, App.vue, router/index.js',
    'stores/authStore.js, stores/emsStore.js',
    'config/menuPermissions.js, utils/password.js',
    'composables/useSolarRadiation.js',
    'views: Login, Dashboard, RealTimePower, History, PVSystem, ESSSystem, GensetSystem, PVPrediction, LoadPrediction, Users, Permissions, ApiTest, FeaturePlaceholder',
    'components: SiteHeader, SingleLineDiagram, RealTimePowerChart',
    'components/pv: CampusPvScene, ScenicPvScene',
    'components/ess: CabinetEssScene, ContainerEssScene',
    'components/genset: GensetScene',
  ].forEach(t => s.push(B(t)))

  s.push(H('附錄 B  建議閱讀順序', 1))
  ;[
    '1. main.js → 了解程式如何啟動',
    '2. App.vue → 了解整體版面與側欄',
    '3. router/index.js → 了解有哪些頁面',
    '4. stores/authStore.js + Login.vue → 了解登入流程',
    '5. stores/emsStore.js → 了解核心資料邏輯',
    '6. Dashboard.vue + SingleLineDiagram.vue → 了解資料如何驅動 UI',
    '7. config/menuPermissions.js + Permissions.vue → 了解權限',
    '8. 其他 View 依需求閱讀',
  ].forEach(t => s.push(B(t)))

  return s
}

async function generateWord() {
  const doc = new Document({ sections: [{ properties: {}, children: buildWordSections() }] })
  fs.mkdirSync(DOCS_DIR, { recursive: true })
  fs.writeFileSync(WORD_OUT, await Packer.toBuffer(doc))
  console.log(`Word 已產生：${WORD_OUT}`)
}

// ─── PPT ──────────────────────────────────────────────────────
function generatePpt() {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_16x9'
  pptx.author = 'hg-microgrid-ems'
  pptx.title = '微電網 EMS 程式架構說明'

  const TITLE_STYLE = { x: 0.5, w: 9, align: 'center', fontSize: 28, bold: true, color: '1F2D3D', fontFace: FONT }
  const SUB_STYLE = { x: 0.5, w: 9, align: 'center', fontSize: 16, color: '606266', fontFace: FONT }
  const BODY = { x: 0.6, y: 1.3, w: 8.8, h: 5.5, fontSize: 14, color: '303133', fontFace: FONT, valign: 'top' }
  const BULLET = { ...BODY, bullet: true, lineSpacing: 28 }

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
    slide.addText(title, { x: 0.4, y: 0.12, w: 9, fontSize: 20, bold: true, color: 'FFFFFF', fontFace: FONT })
    slide.addText(bullets.map(b => ({ text: b, options: { bullet: true, breakLine: true } })), BULLET)
  }

  const addCodeSlide = (title, code) => {
    const slide = pptx.addSlide()
    slide.background = { color: 'FFFFFF' }
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.7, fill: { color: '192D40' } })
    slide.addText(title, { x: 0.4, y: 0.12, w: 9, fontSize: 20, bold: true, color: 'FFFFFF', fontFace: FONT })
    slide.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 1.2, w: 9, h: 4.8, fill: { color: 'F5F7FA' }, line: { color: 'DCDFE6', width: 1 } })
    slide.addText(code, { x: 0.7, y: 1.4, w: 8.6, h: 4.4, fontSize: 11, fontFace: 'Consolas', color: '303133', valign: 'top' })
  }

  // Slides
  addTitleSlide('臺南市小型防災微電網 EMS', '程式架構說明 — 初學者版')

  addContentSlide('這個網站在做什麼？', [
    '監控三個案場的微電網即時狀態',
    '顯示：光電、儲能、柴發、負載、市電功率',
    '支援五種運轉情境切換（併網/孤島/柴發等）',
    '帳號登入 + 權限管理左側功能',
    '目前數據為前端模擬，可後續串接 API',
  ])

  addContentSlide('使用技術', [
    'Vue 3 — 前端框架（畫面與互動）',
    'Vite — 開發與打包工具',
    'Vue Router — 網址對應不同頁面',
    'Pinia — 全域狀態管理（資料倉庫）',
    'Element Plus — UI 元件（按鈕、表格、選單）',
    'ECharts — 功率曲線圖表',
  ])

  addCodeSlide('專案目錄結構', 
    `src/\n` +
    `├── main.js          程式起點\n` +
    `├── App.vue          根元件（側欄+主畫面）\n` +
    `├── router/          路由設定\n` +
    `├── stores/          Pinia 資料倉庫\n` +
    `│   ├── authStore.js  登入/權限\n` +
    `│   └── emsStore.js   微電網模擬資料\n` +
    `├── views/           各功能頁面（14 個）\n` +
    `├── components/      共用 UI 元件\n` +
    `├── composables/     可重用邏輯\n` +
    `├── config/          權限定義\n` +
    `└── utils/           工具函式`
  )

  addCodeSlide('程式啟動流程',
    `1. index.html 載入\n` +
    `2. main.js\n` +
    `   createApp(App)\n` +
    `     .use(Pinia) .use(Router) .use(ElementPlus)\n` +
    `     .mount('#app')\n` +
    `3. App.vue\n` +
    `   authStore.initialize()\n` +
    `   /login → 登入頁\n` +
    `   其他   → 側欄 + 頁面內容\n` +
    `4. router 決定顯示哪個 View`
  )

  addContentSlide('整體架構', [
    'Views（頁面）↔ Pinia Stores（資料倉庫）',
    'Components（元件）直接讀 Store 顯示 UI',
    'authStore：登入、使用者、權限 → localStorage',
    'emsStore：案場、功率、情境 → 記憶體（模擬）',
    '任何頁面 useEmsStore() 取得同一份資料',
  ])

  addContentSlide('身份驗證流程', [
    'Login.vue → authStore.login() → sessionStorage',
    'router.beforeEach 檢查是否登入',
    'hasPermission(key) 檢查是否有功能權限',
    'admin 帳號擁有全部權限',
    'Users.vue 新增使用者 / Permissions.vue 設定權限',
    'menuPermissions.js 定義 14 個功能權限 key',
  ])

  addContentSlide('emsStore 核心邏輯', [
    'siteOptions：三個案場規格（容量、負載等）',
    'setSite()：切換案場，重置功率與 SOC',
    'fetchEmsData()：每 2 秒更新模擬數據',
    '依 currentMode（1~5）計算電力平衡',
    'pvPower / essPower / genPower / loadPower / gridPower / soc',
    'Dashboard、單線圖、各子系統頁都讀同一份 store',
  ])

  addContentSlide('路由與權限對應', [
    '/system-overview → Dashboard（system-overview）',
    '/pv-system → 太陽光電（pv-system）',
    '/ess-system → 儲能（ess-system）',
    '/users → 使用者管理（users）',
    '/permissions → 權限管理（permissions）',
    '無權限存取 → 自動導向第一個有權限的頁面',
  ])

  addContentSlide('主要頁面（Views）', [
    'Dashboard — 系統總覽 + 單線圖 + KPI 卡片',
    'RealTimePower / History — 即時與歷史曲線',
    'PVSystem / ESSSystem / GensetSystem — 子系統監控',
    'PVPrediction / LoadPrediction — 預測 Demo',
    'Users / Permissions — 帳號與權限管理',
    'ApiTest — 後端 API 連線測試',
  ])

  addContentSlide('主要元件（Components）', [
    'SiteHeader — 頂部標題、案場選擇、時鐘、登出',
    'SingleLineDiagram — SVG 微電網單線圖',
    'RealTimePowerChart — ECharts 即時曲線',
    'CampusPvScene / ScenicPvScene — 光電動畫',
    'CabinetEssScene / ContainerEssScene — 儲能動畫',
    'GensetScene — 柴發動畫',
  ])

  addCodeSlide('Dashboard 資料流',
    `SiteHeader 切換案場\n` +
    `  → emsStore.setSite(id)\n` +
    `  → emsStore.fetchEmsData()\n\n` +
    `Dashboard setInterval(2000)\n` +
    `  → emsStore.fetchEmsData()\n\n` +
    `SingleLineDiagram\n` +
    `  → 讀 emsStore → SVG 自動更新`
  )

  addContentSlide('Vue 重要概念', [
    'ref / computed — 響應式資料，改變即更新畫面',
    'Pinia store — 跨頁面共用資料',
    'provide / inject — App 傳側欄控制給 SiteHeader',
    'vue-router — 換頁 + 登入守衛',
    'onMounted — 頁面載入後啟動計時器',
    'watch — 監聽 store 變化更新圖表',
  ])

  addContentSlide('初學者建議閱讀順序', [
    '1. main.js → App.vue → router/index.js',
    '2. authStore + Login.vue（登入）',
    '3. emsStore.js（核心資料）',
    '4. Dashboard + SingleLineDiagram（UI 綁定）',
    '5. menuPermissions + Permissions（權限）',
    '6. 其他 View 依需求閱讀',
  ])

  addContentSlide('後續擴充方向', [
    'emsStore.fetchEmsData 改為呼叫後端 API',
    'authStore 改為 PostgreSQL + Flask 後端',
    'History.vue 讀取真實歷史資料',
    '事件紀錄、報表等功能完成開發',
  ])

  addTitleSlide('謝謝', 'hg-microgrid-ems 程式架構說明文件')

  pptx.writeFile({ fileName: PPT_OUT })
  console.log(`PPT 已產生：${PPT_OUT}`)
}

// ─── Run ──────────────────────────────────────────────────────
await generateWord()
await generatePpt()
