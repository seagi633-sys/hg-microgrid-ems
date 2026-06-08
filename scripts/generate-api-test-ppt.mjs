import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import PptxGenJS from 'pptxgenjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputPath = path.join(__dirname, '..', 'docs', 'API測試頁面程式說明.pptx')

const pptx = new PptxGenJS()
pptx.layout = 'LAYOUT_16x9'
pptx.author = 'hg-microgrid-ems'
pptx.title = 'API 測試頁面程式說明'

const COLORS = {
  primary: '1F4E79',
  secondary: '2E75B6',
  accent: 'ED7D31',
  text: '333333',
  light: 'F5F7FA',
  white: 'FFFFFF',
  codeBg: 'F2F2F2'
}

function addTitleSlide(title, subtitle) {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.primary }
  slide.addText(title, {
    x: 0.5,
    y: 2.0,
    w: 9,
    h: 1.2,
    fontSize: 36,
    bold: true,
    color: COLORS.white,
    align: 'center'
  })
  slide.addText(subtitle, {
    x: 0.5,
    y: 3.3,
    w: 9,
    h: 0.8,
    fontSize: 18,
    color: 'DDEEFF',
    align: 'center'
  })
}

function addSectionSlide(title) {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.secondary }
  slide.addText(title, {
    x: 0.5,
    y: 2.3,
    w: 9,
    h: 1,
    fontSize: 32,
    bold: true,
    color: COLORS.white,
    align: 'center'
  })
}

function addContentSlide(title, bullets, opts = {}) {
  const slide = pptx.addSlide()
  slide.addText(title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.7,
    fontSize: 26,
    bold: true,
    color: COLORS.primary
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.0,
    w: 1.2,
    h: 0.05,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent }
  })
  slide.addText(bullets.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), {
    x: 0.6,
    y: 1.2,
    w: 8.8,
    h: 4.2,
    fontSize: opts.fontSize || 18,
    color: COLORS.text,
    valign: 'top',
    ...opts.textOpts
  })
  return slide
}

function addCodeSlide(title, codeLines) {
  const slide = pptx.addSlide()
  slide.addText(title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.7,
    fontSize: 24,
    bold: true,
    color: COLORS.primary
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.1,
    w: 9,
    h: 4.0,
    fill: { color: COLORS.codeBg },
    line: { color: 'CCCCCC', width: 1 }
  })
  slide.addText(codeLines.join('\n'), {
    x: 0.7,
    y: 1.25,
    w: 8.6,
    h: 3.7,
    fontSize: 14,
    fontFace: 'Consolas',
    color: COLORS.text,
    valign: 'top'
  })
}

function addTableSlide(title, headers, rows) {
  const slide = pptx.addSlide()
  slide.addText(title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.7,
    fontSize: 24,
    bold: true,
    color: COLORS.primary
  })
  const tableRows = [
    headers.map((h) => ({
      text: h,
      options: { bold: true, fill: { color: COLORS.secondary }, color: COLORS.white }
    })),
    ...rows.map((row) => row.map((cell) => ({ text: cell })))
  ]
  slide.addTable(tableRows, {
    x: 0.5,
    y: 1.2,
    w: 9,
    colW: [2.5, 3.25, 3.25],
    fontSize: 14,
    border: { type: 'solid', color: 'CCCCCC', pt: 1 },
    align: 'left',
    valign: 'middle'
  })
}

function addFlowSlide(title, steps) {
  const slide = pptx.addSlide()
  slide.addText(title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.7,
    fontSize: 24,
    bold: true,
    color: COLORS.primary
  })
  steps.forEach((step, i) => {
    const y = 1.2 + i * 0.85
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y,
      w: 8.8,
      h: 0.65,
      fill: { color: i % 2 === 0 ? 'E8F0FE' : COLORS.light },
      line: { color: COLORS.secondary, width: 1 },
      rectRadius: 0.08
    })
    slide.addText(`${i + 1}. ${step}`, {
      x: 0.8,
      y: y + 0.12,
      w: 8.4,
      h: 0.45,
      fontSize: 16,
      color: COLORS.text
    })
    if (i < steps.length - 1) {
      slide.addText('↓', {
        x: 4.7,
        y: y + 0.62,
        w: 0.5,
        h: 0.25,
        fontSize: 14,
        color: COLORS.secondary,
        align: 'center'
      })
    }
  })
}

// --- Slides ---

addTitleSlide('API 測試頁面程式說明', 'Vue 3 初學者教學｜hg-microgrid-ems 專案')

addContentSlide('這次要做什麼？', [
  '在微電網 EMS 網站新增「API 測試」頁面',
  'GET：從 http://192.168.1.148:5000/time 讀取資料，每 2 秒更新',
  'POST：送 {"number": 23122} 到 http://192.168.1.148:5000/add2',
  '畫面要顯示伺服器回傳的結果',
  '想像成：在網站裡開一間「API 測試室」'
])

addSectionSlide('Part 1｜基礎概念')

addContentSlide('什麼是 API？', [
  'API = 前端（網頁）跟後端（伺服器）溝通的接口',
  '前端用 fetch 發請求，後端回傳 JSON 或文字',
  '常見兩種方式：GET（讀資料）與 POST（送資料）',
  '本頁面同時示範這兩種用法'
])

addTableSlide(
  'GET 與 POST 的差別',
  ['項目', 'GET /time', 'POST /add2'],
  [
    ['目的', '讀取時間', '送出數字讓伺服器計算'],
    ['何時執行', '進入頁面後自動、每 2 秒', '使用者按「送出 POST」'],
    ['是否帶 body', '否', '是，{"number": 23122}'],
    ['典型用途', '查詢、輪詢更新', '提交表單、運算請求']
  ]
)

addContentSlide('Vue 專案的三層結構', [
  'App.vue — 外框：左側選單 + 右側內容區',
  'router/index.js — 路由表：網址對應哪個頁面',
  'views/*.vue — 各頁面：畫面 + 邏輯 + 樣式',
  '一個 .vue 檔 = template + script setup + style scoped'
])

addSectionSlide('Part 2｜修改步驟')

addContentSlide('整體只需 3 個步驟', [
  '步驟 1：新建 src/views/ApiTest.vue（頁面本體）',
  '步驟 2：修改 src/router/index.js（註冊 /api-test 路由）',
  '步驟 3：修改 src/App.vue（左側選單加入「API 測試」）',
  '完成後：點選單 → 網址 /api-test → 顯示測試頁'
])

addContentSlide('ApiTest.vue 畫面長什麼樣？', [
  '第一張卡片（GET）：顯示 /time 網址與回傳結果',
  '  讀取中 → 顯示「讀取中...」',
  '  失敗 → 紅色錯誤訊息',
  '  成功 → 顯示伺服器內容',
  '第二張卡片（POST）：數字輸入框 + 送出按鈕 + 結果區',
  '使用 Element Plus 的 el-card、el-button、el-input-number'
])

addCodeSlide('template 重點：條件顯示', [
  '<el-tag v-if="timeLoading">讀取中...</el-tag>',
  '<el-tag v-else-if="timeError">{{ timeError }}</el-tag>',
  '<pre v-else>{{ timeData }}</pre>',
  '',
  '<el-input-number v-model="postNumber" />',
  '<el-button @click="sendPost">送出 POST</el-button>',
  '',
  'v-if / v-else-if / v-else：依狀態切換畫面',
  'v-model：雙向綁定，輸入框與 postNumber 同步'
])

addSectionSlide('Part 3｜JavaScript 邏輯')

addCodeSlide('用 ref 存放會變動的資料', [
  'import { ref, onMounted, onUnmounted } from "vue"',
  '',
  'const timeData = ref("")',
  'const timeError = ref("")',
  'const postNumber = ref(23122)',
  'const postResult = ref(null)',
  '',
  '// script 裡讀寫要用 .value',
  'timeData.value = "伺服器回傳內容"',
  '',
  'ref = 響應式變數，值改變時畫面自動更新'
])

addCodeSlide('GET：fetchTime 函式', [
  'const fetchTime = async () => {',
  '  try {',
  '    const res = await fetch(TIME_URL)',
  '    const text = await res.text()',
  '    timeData.value = text  // 或解析 JSON',
  '  } catch (err) {',
  '    timeError.value = err.message',
  '  }',
  '}',
  '',
  'fetch：瀏覽器內建，用來發 HTTP 請求',
  'async/await：等待伺服器回應後再繼續'
])

addCodeSlide('每 2 秒更新 + 離開頁面清理', [
  'onMounted(() => {',
  '  fetchTime()',
  '  pollTimer = setInterval(fetchTime, 2000)',
  '})',
  '',
  'onUnmounted(() => {',
  '  clearInterval(pollTimer)',
  '})',
  '',
  'onMounted：進入頁面時執行',
  'setInterval：每 2000 毫秒（2 秒）重複',
  'onUnmounted：離開頁面時停止計時器'
])

addCodeSlide('POST：sendPost 函式', [
  'const sendPost = async () => {',
  '  const res = await fetch(ADD_URL, {',
  '    method: "POST",',
  '    headers: { "Content-Type": "application/json" },',
  '    body: JSON.stringify({ number: postNumber.value })',
  '  })',
  '  postResult.value = await res.text()',
  '}',
  '',
  'JSON.stringify：物件 → JSON 字串',
  'Content-Type：告訴伺服器 body 是 JSON 格式'
])

addSectionSlide('Part 4｜路由與選單')

addCodeSlide('router/index.js 新增路由', [
  '{',
  '  path: "/api-test",',
  '  name: "ApiTest",',
  '  component: () => import("../views/ApiTest.vue")',
  '}',
  '',
  'path：網址路徑',
  'component：要顯示的頁面元件',
  'import(...)：懶載入，進入頁面才下載程式'
])

addCodeSlide('App.vue 新增選單', [
  '<el-menu router>',
  '  <el-menu-item index="/api-test">',
  '    <el-icon><Connection /></el-icon>',
  '    <span>API 測試</span>',
  '  </el-menu-item>',
  '</el-menu>',
  '',
  'index="/api-test"：點擊導向該網址',
  'router 屬性：Element Plus 配合 Vue Router 跳轉'
])

addSectionSlide('Part 5｜資料流程')

addFlowSlide('GET 資料流程', [
  '使用者進入 API 測試頁',
  'onMounted 呼叫 fetchTime()',
  'fetch 向 192.168.1.148:5000/time 發 GET',
  '伺服器回傳時間資料',
  '寫入 timeData，畫面更新',
  '2 秒後 setInterval 再次執行'
])

addFlowSlide('POST 資料流程', [
  '使用者輸入 number（預設 23122）',
  '點擊「送出 POST」按鈕',
  'sendPost() 向 /add2 發 POST',
  'body 為 {"number": 23122}',
  '伺服器計算後回傳結果',
  '寫入 postResult，畫面顯示'
])

addSectionSlide('Part 6｜常見問題')

addContentSlide('CORS 是什麼？為什麼會失敗？', [
  '前端：localhost:5173（Vite 開發伺服器）',
  '後端：192.168.1.148:5000（不同網址）',
  '瀏覽器會檢查後端是否「允許」前端存取',
  '若後端沒設定 CORS → Console 出現 CORS 錯誤',
  '這不是 Vue 寫錯！需後端加入跨域設定',
  'Postman 測試通常正常（不受瀏覽器 CORS 限制）'
])

addContentSlide('try / catch 錯誤處理', [
  '連不上伺服器、404、500 都會進 catch',
  '把錯誤訊息存到 timeError 或 postError',
  '畫面顯示紅色提示，程式不會整個崩潰',
  '初學者建議：用 F12 開發者工具看 Network 與 Console'
])

addTableSlide(
  '修改檔案總整理',
  ['檔案', '動作', '內容'],
  [
    ['src/views/ApiTest.vue', '新建', 'GET 輪詢 + POST 表單 + 結果顯示'],
    ['src/router/index.js', '修改', '新增 /api-test 路由'],
    ['src/App.vue', '修改', '左側選單加入「API 測試」']
  ]
)

addContentSlide('如何執行與測試？', [
  '1. 終端機執行：npm run dev',
  '2. 瀏覽器開啟開發網址（通常 localhost:5173）',
  '3. 左側選單點「API 測試」',
  '4. 確認 GET 區塊每 2 秒更新',
  '5. 按「送出 POST」確認回傳數值',
  '6. 後端需先啟動在 192.168.1.148:5000'
])

addContentSlide('建議練習（加深理解）', [
  '把 POLL_INTERVAL 改成 5000，觀察更新頻率',
  '修改 postNumber 預設值，看 POST 結果變化',
  '暫時關閉後端，確認錯誤訊息是否正確',
  '在 fetchTime 加 console.log，用 F12 觀察',
  '試著加第三個 API 卡片，練習複製既有模式'
])

const endSlide = pptx.addSlide()
endSlide.background = { color: COLORS.primary }
endSlide.addText('謝謝聆聽', {
  x: 0.5,
  y: 2.2,
  w: 9,
  h: 1,
  fontSize: 36,
  bold: true,
  color: COLORS.white,
  align: 'center'
})
endSlide.addText('Q & A', {
  x: 0.5,
  y: 3.2,
  w: 9,
  h: 0.6,
  fontSize: 22,
  color: 'DDEEFF',
  align: 'center'
})

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
await pptx.writeFile({ fileName: outputPath })
console.log('已產生：' + outputPath)
