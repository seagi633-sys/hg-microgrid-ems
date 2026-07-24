<template>
  <el-card class="site-title-card">
    <template #header>
      <div class="title-header">
        <el-button
          v-if="sidebarControl"
          class="sidebar-toggle"
          text
          :title="isSidebarCollapsed ? '展開側欄' : '收合側欄'"
          @click="sidebarControl.toggle()"
        >
          <el-icon class="toggle-icon">
            <DArrowLeft v-if="!isSidebarCollapsed" />
            <DArrowRight v-else />
          </el-icon>
        </el-button>
        <span class="header-title">⚡臺南市小型防災微電網系統⚡</span>
        <div v-if="authStore.currentUser" class="header-right">
          <div class="header-user-row">
            <div class="header-user">
              <span class="user-name">{{ authStore.currentUser.displayName }}</span>
              <span class="user-account">{{ authStore.currentUser.username }}</span>
            </div>
            <el-button class="logout-button" text @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              登出
            </el-button>
          </div>
          <div class="header-datetime">{{ currentTime }}</div>
        </div>
      </div>
    </template>

    <div class="site-selector-section">
      <div class="selector-row">
        <div class="selector-inline-label">案場選擇</div>
        <el-radio-group
          v-model="emsStore.selectedSiteId"
          size="large"
          class="site-radio-group"
          @change="handleSiteChange"
        >
          <el-radio-button
            v-for="site in emsStore.siteOptions"
            :key="site.id"
            :value="site.id"
          >
            {{ site.name }}
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DArrowLeft, DArrowRight, SwitchButton } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useEmsStore } from '../stores/emsStore'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const emsStore = useEmsStore()
const authStore = useAuthStore()
const sidebarControl = inject('sidebarControl', null)
const isSidebarCollapsed = computed(() => sidebarControl?.isCollapse?.value ?? false)

const currentTime = ref('')
let clockTimer = null

const pad = (value) => String(value).padStart(2, '0')

const updateTime = () => {
  const now = new Date()
  currentTime.value =
    `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

const handleSiteChange = (siteId) => {
  emsStore.setSite(siteId)
  emsStore.fetchEmsData()
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('確定要登出嗎？', '登出', {
      type: 'warning',
      confirmButtonText: '登出',
      cancelButtonText: '取消'
    })
    authStore.logout()
    router.push('/login')
  } catch {
    // cancelled
  }
}

onMounted(() => {
  updateTime()
  clockTimer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<style scoped>
.site-title-card {
  border: 1px solid #d9ecff;
  box-shadow: 0 2px 10px rgba(64, 158, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 30;
}

.site-title-card :deep(.el-card__body) {
  padding: 12px 16px 16px;
}

.title-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #303133;
  min-height: 56px;
  padding-left: 48px;
  padding-right: 300px;
}

.sidebar-toggle {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #409eff;
  padding: 4px 8px;
}

.toggle-icon {
  font-size: 28px;
  font-weight: 700;
}

.header-title {
  display: block;
  font-size: 34px;
  text-align: center;
}

.header-right {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  text-align: right;
}

.header-user-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-datetime {
  font-size: 22px;
  font-weight: 800;
  color: #b71636;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  letter-spacing: 0.5px;
  line-height: 1.2;
  padding: 4px 10px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(183, 22, 54, 0.08) 0%, rgba(243, 194, 75, 0.12) 100%);
  border: 1px solid rgba(183, 22, 54, 0.25);
  box-shadow: 0 1px 4px rgba(183, 22, 54, 0.1);
}

.header-user {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.user-name {
  font-size: 14px;
  font-weight: 700;
  color: #303133;
}

.user-account {
  font-size: 12px;
  color: #909399;
}

.logout-button {
  color: #b71636;
  font-weight: 600;
  padding: 4px 8px;
}

.logout-button:hover {
  color: #d42a4a;
}

.site-selector-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selector-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  justify-content: center;
}

.selector-inline-label {
  flex: 0 0 auto;
  min-width: 76px;
  padding-top: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  white-space: nowrap;
}

.site-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
}

@media (max-width: 1200px) {
  .title-header {
    padding-right: 260px;
  }

  .header-title {
    font-size: 28px;
  }

  .header-datetime {
    font-size: 18px;
  }
}

@media (max-width: 992px) {
  .title-header {
    flex-direction: column;
    padding-left: 0;
    padding-right: 0;
    padding-top: 40px;
    gap: 8px;
  }

  .sidebar-toggle {
    top: 0;
    transform: none;
  }

  .header-right {
    position: static;
    transform: none;
    align-items: center;
    width: 100%;
  }

  .header-user-row {
    justify-content: center;
  }

  .header-datetime {
    font-size: 20px;
    width: 100%;
    text-align: center;
  }

  .header-title {
    font-size: 24px;
  }

  .selector-row {
    flex-direction: column;
    align-items: center;
  }

  .selector-inline-label {
    padding-top: 0;
  }

  .site-radio-group {
    justify-content: center;
  }
}
</style>
