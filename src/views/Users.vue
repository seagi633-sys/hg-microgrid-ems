<template>
  <div class="users-container">
    <SiteHeader />

    <el-card shadow="sm" class="users-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">使用者管理</span>
          <el-button type="primary" @click="openCreateDialog">新增使用者</el-button>
        </div>
      </template>

      <el-table :data="authStore.users" stripe>
        <el-table-column prop="username" label="帳號" min-width="140" />
        <el-table-column prop="displayName" label="顯示名稱" min-width="160" />
        <el-table-column label="角色" width="140">
          <template #default="{ row }">
            <el-tag :type="row.isAdmin ? 'danger' : 'info'">
              {{ row.isAdmin ? '系統管理者' : '一般使用者' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="已啟用功能數" width="140">
          <template #default="{ row }">
            {{ row.isAdmin ? '全部' : row.permissions.length }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="openPasswordDialog(row)"
            >
              重設密碼
            </el-button>
            <el-button
              link
              type="danger"
              :disabled="row.isAdmin"
              @click="handleDelete(row)"
            >
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="createVisible" title="新增使用者" width="420px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="90px">
        <el-form-item label="帳號" prop="username">
          <el-input v-model="createForm.username" placeholder="請輸入登入帳號" />
        </el-form-item>
        <el-form-item label="顯示名稱" prop="displayName">
          <el-input v-model="createForm.displayName" placeholder="選填，預設同帳號" />
        </el-form-item>
        <el-form-item label="密碼" prop="password">
          <el-input v-model="createForm.password" type="password" show-password placeholder="請輸入密碼" />
        </el-form-item>
        <el-form-item label="確認密碼" prop="confirmPassword">
          <el-input v-model="createForm.confirmPassword" type="password" show-password placeholder="再次輸入密碼" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreate">建立</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="passwordVisible" title="重設密碼" width="420px">
      <p class="password-target">帳號：{{ passwordTarget?.username }}</p>
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="90px">
        <el-form-item label="新密碼" prop="password">
          <el-input v-model="passwordForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="確認密碼" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handlePasswordReset">儲存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SiteHeader from '../components/SiteHeader.vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const createVisible = ref(false)
const passwordVisible = ref(false)
const submitting = ref(false)
const createFormRef = ref(null)
const passwordFormRef = ref(null)
const passwordTarget = ref(null)

const createForm = reactive({
  username: '',
  displayName: '',
  password: '',
  confirmPassword: ''
})

const passwordForm = reactive({
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (form) => (_, value, callback) => {
  if (!value) {
    callback(new Error('請再次輸入密碼'))
  } else if (value !== form.password) {
    callback(new Error('兩次輸入的密碼不一致'))
  } else {
    callback()
  }
}

const createRules = {
  username: [{ required: true, message: '請輸入帳號', trigger: 'blur' }],
  password: [{ required: true, message: '請輸入密碼', trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword(createForm), trigger: 'blur' }]
}

const passwordRules = {
  password: [{ required: true, message: '請輸入新密碼', trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword(passwordForm), trigger: 'blur' }]
}

const resetCreateForm = () => {
  createForm.username = ''
  createForm.displayName = ''
  createForm.password = ''
  createForm.confirmPassword = ''
}

const openCreateDialog = () => {
  resetCreateForm()
  createVisible.value = true
}

const openPasswordDialog = (user) => {
  passwordTarget.value = user
  passwordForm.password = ''
  passwordForm.confirmPassword = ''
  passwordVisible.value = true
}

const handleCreate = async () => {
  const valid = await createFormRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await authStore.addUser(createForm)
    ElMessage.success('使用者已建立')
    createVisible.value = false
  } catch (err) {
    ElMessage.error(err.message || '建立失敗')
  } finally {
    submitting.value = false
  }
}

const handlePasswordReset = async () => {
  const valid = await passwordFormRef.value?.validate().catch(() => false)
  if (!valid || !passwordTarget.value) return

  submitting.value = true
  try {
    await authStore.updateUserPassword(passwordTarget.value.id, passwordForm.password)
    ElMessage.success('密碼已更新')
    passwordVisible.value = false
  } catch (err) {
    ElMessage.error(err.message || '更新失敗')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (user) => {
  try {
    await ElMessageBox.confirm(`確定要刪除帳號「${user.username}」嗎？`, '刪除使用者', {
      type: 'warning',
      confirmButtonText: '刪除',
      cancelButtonText: '取消'
    })
    authStore.deleteUser(user.id)
    ElMessage.success('使用者已刪除')
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err.message || '刪除失敗')
    }
  }
}
</script>

<style scoped>
.users-container {
  min-height: 80vh;
  background-color: #f5f7fa;
}

.users-card {
  margin: 0 20px 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.password-target {
  margin: 0 0 16px;
  color: #606266;
}
</style>
