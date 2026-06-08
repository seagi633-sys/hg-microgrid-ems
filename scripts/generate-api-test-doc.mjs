import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputPath = path.join(__dirname, '..', 'docs', 'API測試頁面程式修改說明.docx')

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading: level, spacing: { before: 240, after: 120 } })
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    ...opts,
    children: [new TextRun({ text, size: 24 })]
  })
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 24 })]
  })
}

function codeBlock(lines) {
  return lines.map(
    (line) =>
      new Paragraph({
        spacing: { after: 40 },
        indent: { left: 360 },
        children: [new TextRun({ text: line, font: 'Consolas', size: 20 })]
      })
  )
}

function makeTable(headers, rows) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
  const borders = { top: border, bottom: border, left: border, right: border }
  const cell = (text, bold = false) =>
    new TableCell({
      borders,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [
        new Paragraph({
          children: [new TextRun({ text, bold, size: 22 })]
        })
      ]
    })

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headers.map((h) => cell(h, true)) }),
      ...rows.map((row) => new TableRow({ children: row.map((c) => cell(c)) }))
    ]
  })
}

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new TextRun({
              text: 'API 測試頁面程式修改說明',
              bold: true,
              size: 44
            })
          ]
        }),
        para('（初學者教學版）', { alignment: AlignmentType.CENTER }),
        para('專案：hg-microgrid-ems（Vue 3 + Element Plus）'),

        heading('一、這次的需求是什麼？'),
        para(
          '在現有的微電網 EMS 網站中，新增一個「API 測試」頁面，具備以下功能：'
        ),
        bullet('GET：從 http://192.168.1.148:5000/time 抓取資料，每 2 秒自動更新一次'),
        bullet('POST：將 {"number": 23122} 送到 http://192.168.1.148:5000/add2，並顯示伺服器回傳的數值'),
        para('可以把它想成：在網站裡再開一間「API 測試室」，左側選單點進去就能測試遠端伺服器。'),

        heading('二、專案基本結構'),
        para('這是一個 Vue 3 網站，主要分成三層：'),
        makeTable(
          ['部分', '檔案', '作用'],
          [
            ['外框（選單 + 內容區）', 'App.vue', '左側選單、右側顯示頁面'],
            ['路由表', 'router/index.js', '決定網址對應哪個頁面'],
            ['各個頁面', 'views/*.vue', '真正的畫面與邏輯']
          ]
        ),
        para('一個 .vue 檔通常有三段：'),
        bullet('<template> — 畫面長什麼樣（HTML）'),
        bullet('<script setup> — 邏輯（JavaScript）'),
        bullet('<style scoped> — 只作用在這個頁面的樣式（CSS）'),

        heading('三、整體修改流程（3 個步驟）'),
        bullet('步驟 1：新建 src/views/ApiTest.vue（頁面本體）'),
        bullet('步驟 2：修改 src/router/index.js（註冊 /api-test 路由）'),
        bullet('步驟 3：修改 src/App.vue（左側選單加入「API 測試」連結）'),
        para('完成後，使用者點選單 → 網址變成 /api-test → 右側顯示 API 測試頁面。'),

        heading('四、第一步：建立 ApiTest.vue', HeadingLevel.HEADING_2),
        heading('4.1 畫面（template）', HeadingLevel.HEADING_3),
        para('頁面分成兩張卡片（使用 Element Plus 的 el-card）：'),
        para('【第一張：GET 時間資料】', { spacing: { before: 120 } }),
        bullet('顯示 API 網址：http://192.168.1.148:5000/time'),
        bullet('讀取中 → 顯示「讀取中...」'),
        bullet('失敗 → 顯示紅色錯誤訊息'),
        bullet('成功 → 顯示伺服器回傳內容'),
        para('【第二張：POST 送數字】'),
        bullet('顯示 API 網址：http://192.168.1.148:5000/add2'),
        bullet('數字輸入框（預設 23122，可修改）'),
        bullet('「送出 POST」按鈕'),
        bullet('下方顯示回傳結果或錯誤'),
        para(
          'v-if / v-else-if / v-else 是 Vue 的條件顯示語法，依不同狀態切換畫面，而不是一次全部顯示。'
        ),

        heading('4.2 邏輯（script setup）', HeadingLevel.HEADING_3),
        para('① 準備會變動的資料 — 使用 ref()'),
        ...codeBlock([
          'const timeData = ref("")      // GET 回傳的內容',
          'const postNumber = ref(23122) // POST 要送的數字'
        ]),
        para(
          'ref 代表「這個值會改變，畫面要自動更新」。在 script 裡讀寫時要用 .value，例如 timeData.value = "..."'
        ),

        para('② GET：每 2 秒抓一次時間'),
        ...codeBlock([
          'const fetchTime = async () => {',
          '  const res = await fetch(TIME_URL)',
          '  // 成功存到 timeData，失敗存到 timeError',
          '}'
        ]),
        bullet('fetch：瀏覽器內建函式，用來發 HTTP 請求'),
        bullet('async/await：等待伺服器回應後再繼續，避免程式卡住'),
        para('進入頁面時（onMounted）：'),
        ...codeBlock([
          'fetchTime()                              // 立刻抓一次',
          'pollTimer = setInterval(fetchTime, 2000) // 每 2000 毫秒再抓'
        ]),
        para('離開頁面時（onUnmounted）：'),
        ...codeBlock(['clearInterval(pollTimer)  // 停止計時器，避免背景一直發請求']),
        para(
          'onMounted / onUnmounted 是 Vue 的生命週期鉤子：進入頁面做初始化，離開頁面做清理。'
        ),

        para('③ POST：按按鈕才送資料'),
        ...codeBlock([
          'const res = await fetch(ADD_URL, {',
          '  method: "POST",',
          '  headers: { "Content-Type": "application/json" },',
          '  body: JSON.stringify({ number: postNumber.value })',
          '})'
        ]),
        makeTable(
          ['項目', 'GET', 'POST'],
          [
            ['觸發時機', '自動、每 2 秒', '按「送出 POST」按鈕'],
            ['是否帶資料', '否', '是，{"number": 23122}'],
            ['用途', '讀取時間', '把數字送給伺服器計算']
          ]
        ),
        para('JSON.stringify 把 JavaScript 物件轉成 JSON 字串，伺服器才能正確讀取。'),

        para('④ 錯誤處理（try / catch）'),
        ...codeBlock([
          'try { /* 嘗試連線 */ }',
          'catch (err) { timeError.value = err.message }'
        ]),
        para('連不上伺服器、CORS 被擋、HTTP 404 等錯誤都會被 catch 住，畫面顯示錯誤訊息而不會崩潰。'),

        heading('4.3 樣式（style scoped）', HeadingLevel.HEADING_3),
        para(
          'scoped 表示 CSS 只影響這個頁面，不會改到其他頁面。包含卡片間距、結果框背景、等寬字體等設定。'
        ),

        heading('五、第二步：註冊路由 router/index.js'),
        para('原本路由：'),
        bullet('/ → Dashboard（即時監控）'),
        bullet('/history → History（歷史曲線）'),
        para('新增路由：'),
        ...codeBlock([
          '{',
          '  path: "/api-test",',
          '  name: "ApiTest",',
          '  component: () => import("../views/ApiTest.vue")',
          '}'
        ]),
        para(
          '當網址變成 /api-test 時，右側 <router-view /> 就會載入 ApiTest.vue。() => import(...) 是懶載入，只有進入該頁面才下載程式。'
        ),

        heading('六、第三步：選單 App.vue'),
        ...codeBlock([
          '<el-menu-item index="/api-test">',
          '  <el-icon><Connection /></el-icon>',
          '  <span>API 測試</span>',
          '</el-menu-item>'
        ]),
        bullet('index="/api-test"：點擊後導向該網址'),
        bullet('el-menu 的 router 屬性：Element Plus 自動配合 Vue Router 跳轉'),
        bullet('修正圖示 import，使 Monitor、TrendCharts、Connection 正常顯示'),

        heading('七、資料流程'),
        para('【GET 流程】'),
        para(
          '進入頁面 → onMounted 執行 fetchTime() → fetch 向 /time 發 GET → 伺服器回傳 → 寫入 timeData → 畫面更新 → 2 秒後重複'
        ),
        para('【POST 流程】'),
        para(
          '使用者改數字（可選）→ 按「送出 POST」→ sendPost() → fetch 向 /add2 發 POST → 伺服器回傳 → 寫入 postResult → 畫面顯示'
        ),

        heading('八、初學者常見問題：CORS'),
        para(
          '前端在 localhost:5173，API 在 192.168.1.148:5000，屬於不同網址。瀏覽器會檢查後端是否允許前端來源存取。'
        ),
        para('若後端未設定 CORS，Console 可能出現 CORS 錯誤，頁面顯示「無法連線」。這不是 Vue 寫錯，而是後端需加入跨域設定。'),
        para('Flask 範例：from flask_cors import CORS → CORS(app)'),
        para('Postman 測試通常正常，因 Postman 不受瀏覽器 CORS 限制。'),

        heading('九、修改檔案總整理'),
        makeTable(
          ['檔案', '做了什麼'],
          [
            ['src/views/ApiTest.vue', '新建：GET 輪詢 + POST 表單 + 結果顯示'],
            ['src/router/index.js', '新增 /api-test 路由'],
            ['src/App.vue', '新增左側「API 測試」選單項目']
          ]
        ),

        heading('十、建議練習'),
        bullet('把 POLL_INTERVAL 改成 5000，觀察 GET 是否變成 5 秒更新'),
        bullet('修改 postNumber 預設值，觀察 POST 結果變化'),
        bullet('暫時關閉後端，確認錯誤訊息是否正確顯示'),
        bullet('在 fetchTime 加入 console.log(res)，用 F12 開發者工具觀察回應')
      ]
    }
  ]
})

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
const buffer = await Packer.toBuffer(doc)
fs.writeFileSync(outputPath, buffer)
console.log('已產生：' + outputPath)
