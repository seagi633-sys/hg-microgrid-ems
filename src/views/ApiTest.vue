<template>
  <div class="api-test-container">
    <el-card shadow="sm" class="api-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">GET — 時間資料（每2秒更新一次）</span>
        </div>
      </template>
      <div class="api-url">http://192.168.1.148:5000/time</div>
      <div class="result-box">
        <el-tag v-if="timeLoading" type="info">讀取中...</el-tag>
        <el-tag v-else-if="timeError" type="danger">{{ timeError }}</el-tag>
        <pre v-else class="result-text">{{ timeData }}</pre>
      </div>
    </el-card>

    <el-card shadow="sm" class="api-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">POST — 數值相加</span>
        </div>
      </template>
      <div class="api-url">http://192.168.1.148:5000/add2</div>
      <div class="post-form">
        <el-form inline @submit.prevent="sendPost">
          <el-form-item label="number">
            <el-input-number v-model="postNumber" :controls="true" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="postLoading" @click="sendPost">
              送出 POST
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="result-box">
        <el-tag v-if="postError" type="danger">{{ postError }}</el-tag>
        <pre v-else-if="postResult !== null" class="result-text">{{ postResult }}</pre>
        <span v-else class="placeholder">尚未送出請求</span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const TIME_URL = 'http://192.168.1.148:5000/time'
const ADD_URL = 'http://192.168.1.148:5000/add2'
const POLL_INTERVAL = 2000

const timeData = ref('')
const timeError = ref('')
const timeLoading = ref(false)

const postNumber = ref(23122)
const postResult = ref(null)
const postError = ref('')
const postLoading = ref(false)

let pollTimer = null

const fetchTime = async () => {
  timeLoading.value = true
  try {
    const res = await fetch(TIME_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    try {
      const json = JSON.parse(text)
      timeData.value = JSON.stringify(json, null, 2)
    } catch {
      timeData.value = text
    }
    timeError.value = ''
  } catch (err) {
    timeError.value = err.message || '無法連線至伺服器'
    timeData.value = ''
  } finally {
    timeLoading.value = false
  }
}

const sendPost = async () => {
  postLoading.value = true
  postError.value = ''
  postResult.value = null
  try {
    const res = await fetch(ADD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: postNumber.value })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    try {
      const json = JSON.parse(text)
      postResult.value = JSON.stringify(json, null, 2)
    } catch {
      postResult.value = text
    }
  } catch (err) {
    postError.value = err.message || 'POST 請求失敗'
  } finally {
    postLoading.value = false
  }
}

onMounted(() => {
  fetchTime()
  pollTimer = setInterval(fetchTime, POLL_INTERVAL)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
.api-test-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-title {
  font-weight: 600;
  font-size: 16px;
}

.api-url {
  font-family: monospace;
  color: #606266;
  margin-bottom: 12px;
  font-size: 13px;
}

.post-form {
  margin-bottom: 12px;
}

.result-box {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  min-height: 60px;
}

.result-text {
  margin: 0;
  font-family: monospace;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-all;
}

.placeholder {
  color: #909399;
  font-size: 14px;
}
</style>
