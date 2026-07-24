# EMS PostgreSQL API

從 PostgreSQL `vpp` 資料庫讀取 `vpp_realtime` 即時資料，提供給 Vue 前端。

## 安裝

```bash
cd backend
pip install -r requirements.txt
```

## 設定

複製 `.env.example` 為 `.env` 並填入資料庫連線資訊：

```
PG_HOST=192.168.1.17
PG_PORT=5432
PG_USER=ems
PG_PASSWORD=your_password
PG_DATABASE=vpp
PG_VALUE_COLUMN=value
PG_TIME_COLUMN=updated_at
```

若資料表欄位名稱不同，請修改 `PG_VALUE_COLUMN` 與 `PG_TIME_COLUMN`。

## 啟動

### 方式 A：Node.js（推薦，不需 Python）

```bash
# 終端 1 — API
npm run dev:api

# 終端 2 — 前端
npm run dev
```

或一次啟動兩者：

```bash
npm run dev:all
```

### 方式 B：Python Flask

```bash
cd backend
pip install -r requirements.txt
python app.py
```

預設監聽 `http://0.0.0.0:5000`

## API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/health/db` | 資料庫連線測試 |
| GET | `/api/vpp/jiali/bms1/voltage` | 佳里國中 BMS-1 平均電壓 |
| GET | `/api/vpp/realtime/latest` | 通用查詢（site_id, device_id, point_id） |

### 佳里國中 BMS-1 查詢條件

- `site_id`: MG-TNN-001
- `device_id`: BMS1
- `point_id` 範例：
  - BMS1_SOC
  - BMS1_AVG_RACK_VOLTAGE
  - BMS1_MAX_CELL_VOLTAGE
  - BMS1_MIN_CELL_VOLTAGE
  - BMS1_AVG_SOH
  - BMS1_MAX_CELL_TEMP
  - BMS1_MIN_CELL_TEMP
  - PCS1_POWER_FACTOR
  - PCS1_SYSTEM_ACTIVE_POWER
  - PCS1_SYSTEM_REACTIVE_POWER
  - PCS1_U1_FREQUENCY

## 前端

開發模式請同時執行 API 與前端（見上方「方式 A」）。

Vite 會將 `/api` 代理至 `localhost:5000`。

若畫面顯示 **HTTP 502**，代表 API 未啟動，請先執行 `npm run dev:api`。

## 說明文件

初學者版 API 程式說明（Word + PPT）位於 `docs/`：

- `微電網EMS_API程式說明_初學者版.docx`
- `微電網EMS_API程式說明_初學者版.pptx`

重新產生：`npm run docs:api`
