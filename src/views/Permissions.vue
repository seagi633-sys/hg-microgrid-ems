<template>
  <div class="permissions-container">
    <SiteHeader />

    <el-card shadow="sm" class="permissions-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">權限管理</span>
        </div>
      </template>

      <div class="selector-row">
        <span class="selector-label">選擇使用者</span>
        <el-select
          v-model="selectedUserId"
          placeholder="請選擇使用者"
          style="width: 320px"
          @change="loadUserPermissions"
        >
          <el-option
            v-for="user in editableUsers"
            :key="user.id"
            :label="`${user.displayName}（${user.username}）`"
            :value="user.id"
          />
        </el-select>
      </div>

      <el-alert
        v-if="selectedUser?.isAdmin"
        title="系統管理者（admin）擁有全部左側功能權限，無需設定。"
        type="info"
        :closable="false"
        show-icon
        class="admin-alert"
      />

      <template v-else-if="selectedUser">
        <div class="toolbar">
          <el-button @click="selectAll">全選</el-button>
          <el-button @click="clearAll">全部取消</el-button>
          <el-button type="primary" :loading="saving" @click="handleSave">儲存權限</el-button>
        </div>

        <div class="permission-groups">
          <el-card
            v-for="group in PERMISSION_GROUPS"
            :key="group.label"
            shadow="never"
            class="group-card"
          >
            <template #header>
              <div class="group-header">
                <span>{{ group.label }}</span>
                <el-checkbox
                  :model-value="isGroupChecked(group)"
                  :indeterminate="isGroupIndeterminate(group)"
                  @change="(checked) => toggleGroup(group, checked)"
                >
                  全選
                </el-checkbox>
              </div>
            </template>

            <el-checkbox-group v-model="selectedPermissions" class="permission-list">
              <el-checkbox
                v-for="item in group.items"
                :key="item.key"
                :value="item.key"
              >
                {{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-card>
        </div>
      </template>

      <el-empty v-else description="請先選擇要設定權限的使用者" />
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import SiteHeader from '../components/SiteHeader.vue'
import { useAuthStore } from '../stores/authStore'
import { ALL_PERMISSION_KEYS, PERMISSION_GROUPS } from '../config/menuPermissions'

const authStore = useAuthStore()
const selectedUserId = ref('')
const selectedPermissions = ref([])
const saving = ref(false)

const editableUsers = computed(() => authStore.users)
const selectedUser = computed(() =>
  authStore.users.find((user) => user.id === selectedUserId.value) || null
)

const loadUserPermissions = () => {
  if (!selectedUser.value || selectedUser.value.isAdmin) {
    selectedPermissions.value = []
    return
  }
  selectedPermissions.value = [...selectedUser.value.permissions]
}

const isGroupChecked = (group) =>
  group.items.every((item) => selectedPermissions.value.includes(item.key))

const isGroupIndeterminate = (group) => {
  const checkedCount = group.items.filter((item) =>
    selectedPermissions.value.includes(item.key)
  ).length
  return checkedCount > 0 && checkedCount < group.items.length
}

const toggleGroup = (group, checked) => {
  const keys = group.items.map((item) => item.key)
  if (checked) {
    selectedPermissions.value = [...new Set([...selectedPermissions.value, ...keys])]
  } else {
    selectedPermissions.value = selectedPermissions.value.filter((key) => !keys.includes(key))
  }
}

const selectAll = () => {
  selectedPermissions.value = [...ALL_PERMISSION_KEYS]
}

const clearAll = () => {
  selectedPermissions.value = []
}

const handleSave = async () => {
  if (!selectedUser.value || selectedUser.value.isAdmin) return

  saving.value = true
  try {
    authStore.updateUserPermissions(selectedUser.value.id, selectedPermissions.value)
    ElMessage.success('權限已儲存')
  } catch (err) {
    ElMessage.error(err.message || '儲存失敗')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.permissions-container {
  min-height: 80vh;
  background-color: #f5f7fa;
}

.permissions-card {
  margin: 0 20px 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.selector-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.selector-label {
  font-weight: 700;
  color: #303133;
}

.admin-alert {
  margin-bottom: 16px;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.permission-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.group-card {
  border: 1px solid #ebeef5;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
}

.permission-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
