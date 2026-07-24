<template>
  <div class="login-page">
    <el-card class="login-card" shadow="hover">
      <div class="login-header">
        <img :src="logoSrc" alt="臺南市政府" class="login-logo" />
        <h1>臺南市小型防災微電網系統</h1>
        <p>請登入以繼續使用</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="帳號" prop="username">
          <el-input
            v-model="form.username"
            placeholder="請輸入帳號"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item label="密碼" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="請輸入密碼"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          class="login-button"
          :loading="loading"
          @click="handleLogin"
        >
          登入
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/authStore'
import logoSrc from '../assets/tainan_logo.jpg'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '請輸入帳號', trigger: 'blur' }],
  password: [{ required: true, message: '請輸入密碼', trigger: 'blur' }]
}

const handleLogin = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await authStore.login(form.username, form.password)
    ElMessage.success('登入成功')
    const redirect = router.currentRoute.value.query.redirect
    await router.replace(typeof redirect === 'string' ? redirect : authStore.getFirstAllowedPath())
  } catch (err) {
    ElMessage.error(err.message || '登入失敗')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f1d2c 0%, #192d40 55%, #152636 100%);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 440px;
  border-top: 4px solid #b71636;
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.login-logo {
  width: 100%;
  max-width: 280px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.login-header h1 {
  margin: 0 0 8px;
  font-size: 22px;
  color: #303133;
}

.login-header p {
  margin: 0;
  color: #909399;
}

.login-button {
  width: 100%;
  margin-top: 8px;
}
</style>
